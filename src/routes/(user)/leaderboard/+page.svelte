<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Leaderboard from "$lib/components/Leaderboard.svelte";
  import { type Member } from "$lib/components/Leaderboard.svelte";
  import { authState } from "$lib/firebase/auth.svelte";
  import { auth } from "$lib/firebase/auth";
  import * as database from "$lib/firebase/database";
  import { collection, onSnapshot } from "firebase/firestore";
  import gsap from "gsap";

  let memberList = $state<Member[]>([]);
  let isLoading = $state(true);

  interface LedgerEvent {
    id: string;
    title?: string;
    date?: string;
    endDate?: string | null;
    startTime?: string;
    endTime?: string;
    type?: string;
    points?: number;
  }

  let activeEvent = $state<LedgerEvent | null>(null);
  let pinRevealed = $state(false);
  let revealedPin = $state("");
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

    const containers = document.querySelectorAll(".fade-container");
    containers.forEach((container: Element) => {
      gsap.set(container, { autoAlpha: 0, y: 50 });
      gsap.to(container, {
        autoAlpha: 1,
        y: 0,
        duration: 2,
        ease: "power2.out",
      });
    });

    // Detect the active event using the club's timezone, mirroring the server's
    // check-in logic exactly so the button appears iff the server will accept it.
    // This also covers multi-day events (endDate) and events without times.
    function nowInChicago(): { date: string; minutes: number } {
      const now = new Date();
      const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
      const time = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(now);
      return {
        date,
        minutes: Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)),
      };
    }

    try {
      const eventsRef = collection(database.db, "events");

      unsubscribeEvents = onSnapshot(eventsRef, (snapshot) => {
        const events: LedgerEvent[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as LedgerEvent,
        );

        const { date: clubToday, minutes: currentMinutes } = nowInChicago();

        activeEvent =
          events.find((e) => {
            const type = e.type || "event";
            if (type !== "event" || !e.date) return false;
            const endDate = e.endDate || e.date;
            if (clubToday < e.date || clubToday > endDate) return false;
            if (!e.startTime || !e.endTime) return true;

            const [sh, sm] = e.startTime.split(":").map(Number);
            const [eh, em] = e.endTime.split(":").map(Number);
            const start = sh * 60 + (sm || 0);
            const finish = eh * 60 + (em || 0);

            if (start <= finish) {
              return currentMinutes >= start && currentMinutes <= finish;
            }
            return currentMinutes >= start || currentMinutes <= finish;
          }) || null;
      });
    } catch (error) {
      console.error("Error fetching active events:", error);
    }
  });

  onDestroy(() => {
    if (unsubscribeEvents) unsubscribeEvents();
  });

  async function fetchLeaderboardData() {
    try {
      const querySnapshot = await database.getAllDocsFromFirebase("users");
      const fetchedMembers: Member[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData && userData.username) {
          if (userData.permissions === "officer") return;
          fetchedMembers.push({
            username: userData.username,
            points: userData.points ?? 0,
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

  async function revealActivePin() {
    if (!activeEvent) return;
    try {
      const doc = await database.getDocFromFirebase(
        activeEvent.id,
        "eventPins",
      );
      revealedPin =
        doc && (doc.data as { pin?: string } | undefined)?.pin
          ? (doc.data as { pin: string }).pin
          : "----";
    } catch {
      revealedPin = "----";
    }
    pinRevealed = true;
  }

  async function handleCheckIn() {
    if (!authState.user || !activeEvent) return;

    checkInError = "";
    isCheckingIn = true;

    if (checkedInEvents.includes(activeEvent.id)) {
      checkInError = "You have already checked into this event!";
      isCheckingIn = false;
      return;
    }

    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) {
        checkInError = "Please log in again.";
        isCheckingIn = false;
        return;
      }

      const response = await fetch("/api/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId: activeEvent.id, pin: pinInput }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error("Check-in rejected:", response.status, data);
        checkInError = data.error || "Could not check in. Try again.";
        isCheckingIn = false;
        return;
      }

      if (authState.user) {
        authState.user.points = data.points;
        if (!authState.user.attendedEvents?.includes(activeEvent.id)) {
          authState.user.attendedEvents = [
            ...(authState.user.attendedEvents ?? []),
            activeEvent.id,
          ];
        }
      }

      const index = memberList.findIndex(
        (m) => m.username === authState.user?.username,
      );
      if (index !== -1) {
        memberList[index].points = data.points;
        memberList = [...memberList];
      } else {
        await fetchLeaderboardData();
      }

      checkedInEvents = [...checkedInEvents, activeEvent.id];
      localStorage.setItem(
        `checkedIn_${authState.user.id}`,
        JSON.stringify(checkedInEvents),
      );

      showCheckInModal = false;
      pinInput = "";
      alert(
        `Success! You earned ${data.earned} points for attending ${activeEvent.title}!`,
      );
    } catch (error) {
      console.error("Failed to check in:", error);
      checkInError = "Network error. Please try again.";
    } finally {
      isCheckingIn = false;
    }
  }
</script>

<div
  class="fade-container min-h-screen flex flex-col items-center justify-center p-6 pt-24"
>
  {#if authState.isOfficer && activeEvent}
    <div
      class="w-full max-w-6xl mx-auto mb-8 p-6 rounded-2xl border border-[#9f86ff]/30
      bg-[#9f86ff]/10 dark:bg-[#9f86ff]/5 backdrop-blur-md shadow-lg
      flex flex-col sm:flex-row items-center justify-between gap-6"
    >
      <div class="flex flex-col gap-1 text-center sm:text-left">
        <span class="text-xs font-bold uppercase tracking-wider text-[#9f86ff]"
          >Active Event Check-In</span
        >
        <h3 class="text-xl font-bold text-slate-800 dark:text-white">
          {activeEvent.title}
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Ends at {activeEvent.endTime}
        </p>
      </div>

      <div class="flex items-center justify-center min-w-[160px]">
        {#if pinRevealed}
          <div
            class="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700
            font-mono text-3xl font-black tracking-[0.2em] text-[#9f86ff] shadow-inner text-center w-full"
          >
            {revealedPin || "----"}
          </div>
        {:else}
          <button
            onclick={revealActivePin}
            class="w-full px-6 py-3 rounded-xl bg-[#9f86ff] hover:bg-[#8b6fff] text-white font-bold
              transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            Reveal PIN
          </button>
        {/if}
      </div>
    </div>
  {/if}
  {#if !authState.isOfficer && authState.user && activeEvent}
    <div
      class="w-full max-w-6xl mx-auto mb-8 p-6 rounded-2xl border border-[#9f86ff]/30
        bg-[#9f86ff]/10 dark:bg-[#9f86ff]/5 backdrop-blur-md shadow-lg
        flex flex-col sm:flex-row items-center justify-between gap-6"
    >
      <div class="flex flex-col gap-1 text-center sm:text-left">
        <span class="text-xs font-bold uppercase tracking-wider text-[#9f86ff]"
          >Active Event</span
        >
        <h3 class="text-xl font-bold text-slate-800 dark:text-white">
          {activeEvent.title}
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Ask an officer for the check-in PIN!
        </p>
      </div>

      <div class="flex items-center justify-center min-w-[160px]">
        {#if checkedInEvents.includes(activeEvent.id)}
          <div
            class="px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800
            text-green-700 dark:text-green-400 font-bold text-center w-full"
          >
            Checked In
          </div>
        {:else}
          <button
            onclick={() => (showCheckInModal = true)}
            class="w-full px-6 py-3 rounded-xl bg-[#9f86ff] hover:bg-[#8b6fff] text-white font-bold
              transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            Check In
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <div
    class="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
  >
    <div class="order-last lg:col-span-2 lg:order-first">
      <Leaderboard members={memberList} />
    </div>

    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700 h-fit"
    >
      {#if authState.user}
        <h2
          class="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 border-slate-200 dark:border-slate-700"
        >
          Welcome back {authState.user?.username}!
        </h2>
        <div class="flex flex-col items-center space-y-4 mb-6">
          <div class="flex flex-col items-center justify-center space-y-3">
            <div
              class="w-16 h-16 bg-[#9f86ff] text-white rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-md"
            >
              {authState.user.username?.charAt(0) || "U"}
            </div>
            <span
              class="text-xs px-3 py-1 rounded-full font-bold bg-[#9f86ff]/20 text-[#9f86ff] dark:bg-[#9f86ff]/20 dark:text-[#c6b8ff] uppercase tracking-wider"
            >
              {authState.user.permissions || "Member"}
            </span>
          </div>

          <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
            {authState.user?.username}
          </h3>
        </div>

        {#if !authState.isOfficer}
          <div class="w-full grid grid-cols-2 gap-3 mb-6">
            <div
              class="rounded-xl bg-[#9f86ff]/10 border border-[#9f86ff]/20 p-4 text-center"
            >
              <div class="text-2xl font-black text-[#9f86ff]">
                {authState.user?.points ?? 0}
              </div>
              <div
                class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1"
              >
                Points
              </div>
            </div>
            <div
              class="rounded-xl bg-[#9f86ff]/10 border border-[#9f86ff]/20 p-4 text-center"
            >
              <div class="text-2xl font-black text-[#9f86ff]">
                {authState.user?.attendedEvents?.length ?? 0}
              </div>
              <div
                class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1"
              >
                Events Attended
              </div>
            </div>
          </div>
        {/if}
      {:else}
        <h2
          class="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 border-slate-200 dark:border-slate-700"
        >
          Welcome to GDSC!
        </h2>
        <div class="text-center py-6">
          <p class="text-slate-500 dark:text-slate-400 mb-4">
            Please log in to view your score profile tracker.
          </p>
          <a
            href="/login"
            class="inline-block text-sm font-semibold text-[#9f86ff] dark:text-[#9f86ff] hover:underline"
            >Go to Login &rarr;</a
          >
        </div>
      {/if}
    </div>
  </div>
</div>
{#if showCheckInModal && activeEvent}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-slate-200 dark:border-slate-700 animate-content-fade-up"
    >
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-2xl font-bold text-slate-800 dark:text-white">
          Event Check-In
        </h3>
        <button
          onclick={() => (showCheckInModal = false)}
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
          >&times;</button
        >
      </div>

      <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Enter the 4-character PIN provided by the event officers to claim your
        points.
      </p>

      <div class="space-y-4">
        <div>
          <input
            type="text"
            bind:value={pinInput}
            maxlength="4"
            class="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold uppercase p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:border-[#9f86ff] focus:ring-0 transition-colors"
            onkeydown={(e) => e.key === "Enter" && handleCheckIn()}
          />
          {#if checkInError}
            <p class="text-red-500 text-sm font-medium mt-2 text-center">
              {checkInError}
            </p>
          {/if}
        </div>

        <div class="flex items-center justify-center min-w-[160px]">
          {#if checkedInEvents.includes(activeEvent.id)}
            <div
              class="w-full px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 font-bold text-center shadow-sm"
            >
              Event Attended
            </div>
          {:else}
            <button
              type="button"
              onclick={handleCheckIn}
              disabled={isCheckingIn || pinInput.length < 1}
              class="w-full py-4 rounded-xl bg-[#9f86ff] hover:bg-[#8b6fff] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              {isCheckingIn ? "Verifying..." : "Submit PIN"}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
