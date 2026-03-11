import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { auth, signIn } from '$lib/firebase/auth.js';

export const actions: Actions = {
  login: async ({ request, cookies, url }) => {
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

      const idToken = auth.idToken;
      const decodedToken = await auth.verifyIdToken(idToken);

      const expiresIn = 60 * 60 * 24 * 5 * 1000; 
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      cookies.set('session', sessionCookie, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 5 
      });

      cookies.set('user', JSON.stringify({
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      }), {
        path: '/',
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 5
      });

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
