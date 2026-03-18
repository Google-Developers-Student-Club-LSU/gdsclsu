import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createUser } from '$lib/firebase/auth.js';

export const actions: Actions = {
  register: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required'
      });
    }

    if (email.split(".")[1] !== "edu") {
      return fail(400, {
        error: 'Only .edu email addresses are allowed'
      });
    }

    try {
      const response = await createUser(email, password);
    } catch (error) {
      console.error('Error during signup:', error);
      return fail(500, {
        error: 'An unexpected error occurred. Please try again later.'
      });
    }
  }
};
