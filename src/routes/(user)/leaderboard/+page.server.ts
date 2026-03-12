import type { PageServerLoad } from './$types';

export type Member = { name: string; points: number };

export const load: PageServerLoad = async () => {
  const members: Member[] = [
    { name: 'Malik', points: 120 },
    { name: 'Lily', points: 90 },
    { name: 'Quentin', points: 150 }
  ];

  return {
    members
  };
};
