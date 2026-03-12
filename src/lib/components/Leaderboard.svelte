<script context="module" lang="ts">
  export type Member = {
    name: string;
    email: string;
    points: number;
  };
</script>

<script lang="ts">
  export let members: Member[] = [];
  $: sortedMembers = [...members].sort(
    (a, b) => b.points - a.points
  );
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16 px-5">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-gray-800 dark:text-white mb-4">Leaderboard</h1>
      <p class="text-xl text-gray-600 dark:text-gray-300">See how our members are performing!</p>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-auto max-h-[70vh]">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-blue-100 dark:bg-blue-900">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">Rank</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">Points</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
          {#each sortedMembers as member, index}
            <tr class="hover:bg-blue-50 dark:hover:bg-blue-800">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">{index + 1}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">{member.name}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-900 dark:text-blue-100">{member.points}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>