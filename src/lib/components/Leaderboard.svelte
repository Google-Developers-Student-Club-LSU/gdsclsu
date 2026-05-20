<script lang="ts">
  export type Member = {
    username: string;
    points: number;
  };

  let { members = [] }: { members: Member[]} = $props();
  let sortedMembers = $derived(
    [...members].sort((a, b) => b.points - a.points)
  );
</script>


<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-auto max-h-[70vh]">
  <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
    <thead class="bg-[#9f86ff]/10">
        <tr>
            <th class="px-6 py-4 text-left w-16 text-[#9f86ff] font-bold">Rank</th>
            <th class="px-6 py-4 text-left text-[#9f86ff] font-bold">Name</th>
            <th class="px-6 py-4 text-right w-32 text-[#9f86ff] font-bold">Points</th>
        </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
        {#each sortedMembers as member, index}
            <tr class="hover:bg-[#9f86ff]/5">
                <td class="px-6 py-4 text-center font-bold text-gray-700">
                    {index === 0 ? '🥇' : index + 1}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900">{member.username}</td>
                <td class="px-6 py-4 text-right font-bold text-[#9f86ff]">{member.points} pts</td>
            </tr>
        {/each}
    </tbody>
  </table>
</div>