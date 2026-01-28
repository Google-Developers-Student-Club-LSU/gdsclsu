import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  // Redirect to login if user is not authenticated
  if (!locals.user) {
    const redirectTo = url.pathname + url.search;
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return {
    user: locals.user
  };
};
