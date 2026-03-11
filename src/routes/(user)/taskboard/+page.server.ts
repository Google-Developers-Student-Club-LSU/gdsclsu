import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    const redirectTo = url.pathname + url.search;
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  } else if (!locals.user.permissions.includes('view_taskboard')) {
    throw redirect(302, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return {
    user: locals.user
  };
};
