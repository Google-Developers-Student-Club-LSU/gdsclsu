import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { signIn } from '$lib/firebase/auth.js';

export const actions: Actions = {
  login: async ({ request, url }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const redirectTo = url.searchParams.get('redirectTo') || '/';

    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required'
      });
    }

    try {
      const response = await signIn(email, password);
      throw redirect(303, redirectTo);
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 303) {
        throw error;
      }

      console.error('Login error:', error);
      return fail(500, {
        error: 'An error occurred during login. Please try again.'
      });
    }
  }
};
