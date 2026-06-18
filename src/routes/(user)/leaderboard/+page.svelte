<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Leaderboard from "$lib/components/Leaderboard.svelte";
  import { type Member } from "$lib/components/Leaderboard.svelte";
  import { authState } from "$lib/firebase/auth.svelte";
  import * as database from "$lib/firebase/database";
  import { collection, query, where, onSnapshot } from "firebase/firestore";
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger);

  let memberList = $state<Member[]>([]);
  let isLoading = $state(true);
  let isUpdatingPoints = $state(false);

  let activeEvent = $state<any>(null);
  let pinRevealed = $state(false);
  let checkInterval: ReturnType<typeof setInterval>;
  let unsubscribeEvents: () => void;

  let showCheckInModal = $state(false);
  let pinInput = $state("");
  let checkInError = $state("");
  let isCheckingIn = $state(false);
  let checkedInEvents = $state<string[]>([]);

  $effect(() => {
    if (authState.user) {
      const saved = localStorage.getItem(`checkedIn_${authState.user.id}`);
      if (saved) {
        try {
          checkedInEvents = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse check-in history", e);
        }
      }
    }
  });

  onMount(async () => {
    await fetchLeaderboardData();

    const containers = document.querySelectorAll('.fade-container');
    containers.forEach((container: Element) => {
      gsap.set(container, { autoAlpha: 0, y: 50 });
      gsap.to(container, {
        autoAlpha: 1,
        y: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    });

    const today = new Date();
    const localDateStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    const utcDateStr = today.toISOString().split('T')[0];
    const targetDates = [...new Set([localDateStr, utcDateStr])];

    try {
      const eventsRef = collection(database.db, "events");
      const q = query(eventsRef, where("date", "in", targetDates));

      unsubscribeEvents = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                            now.getMinutes().toString().padStart(2, '0');

        activeEvent = events.find(e => {
          if (!e.startTime || !e.endTime) return false;
          if (e.startTime <= e.endTime) {
            return currentTime >= e.startTime && currentTime <= e.endTime;
          } else {
            return currentTime >= e.startTime || currentTime <= e.endTime;
          }
        }) || null;
      });
    } catch (error) {
      console.error("Error fetching active events:", error);
    }
  });

  onDestroy(() => {
    if (checkInterval) clearInterval(checkInterval);
    if (unsubscribeEvents) unsubscribeEvents(); 
  });

  async function fetchLeaderboardData() {
    try {
      const querySnapshot = await database.getAllDocsFromFirebase("users");
      const fetchedMembers: Member[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData && userData.username) {
          fetchedMembers.push({
            username: userData.username,
            points: userData.points ?? 0
          });
        }
      });
      memberList = fetchedMembers;
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      isLoading = false;
    }
  }

  async function handleAddPoints() {
    if (!authState.user || isUpdatingPoints) return;
    isUpdatingPoints = true;
    const currentPoints = authState.user.points ?? 0;
    const updatedPoints = currentPoints;
    try {
      await database.updateDocInFirebase(authState.user.id, "users", {
        points: updatedPoints
      });
      if (authState.user) {
        authState.user.points = updatedPoints;
      }

      const index = memberList.findIndex(m => m.username === authState.user?.username);
      if (index !== -1) {
        memberList[index].points = updatedPoints;
        memberList = [...memberList];
      } else {
        await fetchLeaderboardData();
      }

    } catch (error) {
      console.error("Failed to update points:", error);
      alert("Error updating points. Try again.");
    } finally {
      isUpdatingPoints = false;
    }
  }

  async function handleCheckIn() {
    if (!authState.user || !activeEvent) return;
    
    checkInError = "";
    isCheckingIn = true;

    if (pinInput.toUpperCase() !== activeEvent.pin.toUpperCase()) {
      checkInError = "Incorrect PIN. Please try again.";
      isCheckingIn = false;
      return;
    }

    if (checkedInEvents.includes(activeEvent.id)) {
      checkInError = "You have already checked into this event!";
      isCheckingIn = false;
      return;
    }

    const pointsToAward = 10;
    const currentPoints = authState.user.points ?? 0;
    const updatedPoints = currentPoints + pointsToAward;

    try {
      await database.updateDocInFirebase(authState.user.id, "users", {
        points: updatedPoints
      });
      
      if (authState.user) {
        authState.user.points = updatedPoints;
      }

      const index = memberList.findIndex(m => m.username === authState.user?.username);
      if (index !== -1) {
        memberList[index].points = updatedPoints;
        memberList = [...memberList]; 
      } else {
        await fetchLeaderboardData();
      }

      checkedInEvents = [...checkedInEvents, activeEvent.id]; 
      localStorage.setItem(`checkedIn_${authState.user.id}`, JSON.stringify(checkedInEvents));
      
      showCheckInModal = false;
      pinInput = "";
      alert(`Success! You earned ${pointsToAward} points for attending ${activeEvent.title}!`);

    } catch (error) {
      console.error("Failed to check in:", error);
      checkInError = "Network error. Please try again.";
    } finally {
      isCheckingIn = false;
    }
  }
</script>

<div class="fade-container min-h-screen flex flex-col items-center justify-center p-6 pt-24">
  {#if authState.isOfficer && activeEvent}
    <div class="w-full max-w-6xl mx-auto mb-8 p-6 rounded-2xl border border-[#9f86ff]/30 
      bg-[#9f86ff]/10 dark:bg-[#9f86ff]/5 backdrop-blur-md shadow-lg
      flex flex-col sm:flex-row items-center justify-between gap-6">
        
      <div class="flex flex-col gap-1 text-center sm:text-left">
        <span class="text-xs font-bold uppercase tracking-wider text-[#9f86ff]">Active Event Check-In</span>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white">
          {activeEvent.title}
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Ends at {activeEvent.endTime}
        </p>
      </div>

      <div class="flex items-center justify-center min-w-[160px]">
        {#if pinRevealed}
          <div class="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 
            font-mono text-3xl font-black tracking-[0.2em] text-[#9f86ff] shadow-inner text-center w-full">
            {activeEvent.pin || '----'}
          </div>
        {:else}
          <button 
            onclick={() => pinRevealed = true}
            class="w-full px-6 py-3 rounded-xl bg-[#9f86ff] hover:bg-[#8b6fff] text-white font-bold 
              transition-all hover:scale-105 active:scale-95 shadow-md">
            Reveal PIN
          </button>
        {/if}
      </div>
    </div>
  {/if}
  {#if !authState.isOfficer && authState.user && activeEvent}
    <div class="w-full max-w-6xl mx-auto mb-8 p-6 rounded-2xl border border-[#9f86ff]/30 
        bg-[#9f86ff]/10 dark:bg-[#9f86ff]/5 backdrop-blur-md shadow-lg
        flex flex-col sm:flex-row items-center justify-between gap-6">
        
      <div class="flex flex-col gap-1 text-center sm:text-left">
        <span class="text-xs font-bold uppercase tracking-wider text-[#9f86ff]">Active Event</span>
        <h3 class="text-xl font-bold text-slate-800 dark:text-white">
          {activeEvent.title}
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Ask an officer for the check-in PIN!
        </p>
      </div>

      <div class="flex items-center justify-center min-w-[160px]">
        {#if checkedInEvents.includes(activeEvent.id)}
          <div class="px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 
            text-green-700 dark:text-green-400 font-bold text-center w-full">
            Checked In 
          </div>
        {:else}
          <button 
            onclick={() => showCheckInModal = true}
            class="w-full px-6 py-3 rounded-xl bg-[#9f86ff] hover:bg-[#8b6fff] text-white font-bold 
              transition-all hover:scale-105 active:scale-95 shadow-md">
            Check In
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <div class="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <div class="order-last lg:col-span-2 lg:order-first">
      <Leaderboard members={memberList} />
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700 h-fit">
      {#if authState.user}
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 border-slate-200 dark:border-slate-700">
          Welcome back {authState.user?.username}!
        </h2>
        <div class="flex flex-col items-center space-y-4 mb-6">
          <div class="flex flex-col items-center justify-center space-y-3">
            <div class="w-16 h-16 bg-[#9f86ff] text-white rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-md">
              {authState.user.username?.charAt(0) || 'U'}
            </div>
            <span class="text-xs px-3 py-1 rounded-full font-bold bg-[#9f86ff]/20 text-[#9f86ff] dark:bg-[#9f86ff]/20 dark:text-[#c6b8ff] uppercase tracking-wider">
              {authState.user.permissions || 'Member'}
            </span>
          </div>

          <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
            {authState.user?.username}
          </h3>
        </div>
      {:else}
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 border-slate-200 dark:border-slate-700">
          Welcome to GDSC!
        </h2>
        <div class="text-center py-6">
          <p class="text-slate-500 dark:text-slate-400 mb-4">Please log in to view your score profile tracker.</p>
          <a href="/login" class="inline-block text-sm font-semibold text-[#9f86ff] dark:text-[#9f86ff] hover:underline">Go to Login &rarr;</a>
        </div>
      {/if}
    </div>
  </div>
</div>
{#if showCheckInModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-slate-200 dark:border-slate-700 animate-content-fade-up">
            
            <div class="flex justify-between items-start mb-6">
                <h3 class="text-2xl font-bold text-slate-800 dark:text-white">Event Check-In</h3>
                <button onclick={() => showCheckInModal = false} class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">&times;</button>
            </div>

            <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Enter the 4-character PIN provided by the event officers to claim your points.
            </p>

            <div class="space-y-4">
              <div>
                <input 
                  type="text" 
                  bind:value={pinInput} 
                  maxlength="4"
                  class="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold uppercase p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#9f86ff] focus:ring-0 transition-colors"
                  onkeydown={(e) => e.key === 'Enter' && handleCheckIn()}
                />
                {#if checkInError}
                  <p class="text-red-500 text-sm font-medium mt-2 text-center">{checkInError}</p>
                {/if}
            </div>

            <div class="flex items-center justify-center min-w-[160px]">
                {#if checkedInEvents.includes(activeEvent.id)}
                  <div class="w-full px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold text-center shadow-sm">
                    Event Attended
                  </div>
                {:else}
                  <button 
                      type="button"
                      onclick={handleCheckIn}
                      disabled={isCheckingIn || pinInput.length < 1}
                      class="w-full py-4 rounded-xl bg-[#9f86ff] hover:bg-[#8b6fff] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md">
                      {isCheckingIn ? 'Verifying...' : 'Submit PIN'}
                  </button>
                {/if}
            </div>
          </div>
      </div>
  </div>
{/if}