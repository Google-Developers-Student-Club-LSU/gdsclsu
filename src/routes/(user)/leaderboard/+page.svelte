<script lang="ts">
    import { onMount } from "svelte";
    import Leaderboard from "$lib/components/Leaderboard.svelte";
    import { type Member } from "$lib/components/Leaderboard.svelte";
    import { authState } from "$lib/firebase/auth.svelte";
    import * as database from "$lib/firebase/database";

    let memberList = $state<Member[]>([]);
    let isLoading = $state(true);
    let isUpdatingPoints = $state(false);

    onMount(async () => {
        await fetchLeaderboardData();
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
</script>

<div class="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
  <div class="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
    <div class="lg:col-span-2">
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
        <button
          onclick={handleAddPoints}
          disabled={isUpdatingPoints}
          class="w-full bg-gradient-to-r from-[#9f86ff] to-[#bcaeff] hover:from-[#c6b8ff] hover:to-[#dcd4ff] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
        >
          {isUpdatingPoints ? "Claiming..." : "Claim +10 Points"}
        </button>
      {:else}
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3 border-slate-200 dark:border-slate-700">
          Welcome to GDSC!
        </h2>
        <div class="text-center py-6">
          <p class="text-slate-500 dark:text-slate-400 mb-4">Please log in to view your score profile tracker.</p>
          <a href="/login" class="inline-block text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Go to Login &rarr;</a>
        </div>
      {/if}
    </div>
  </div>
</div>