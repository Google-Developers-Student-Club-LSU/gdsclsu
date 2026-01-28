import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getAuth } from '$lib/firebase/admin.js';

export const actions: Actions = {
  login: async ({ request, cookies, url }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const redirectTo = url.searchParams.get('redirectTo') || '/';

    // Validate input
    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required'
      });
    }

    try {
      const auth = getAuth();
      
      const firebaseApiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
      if (!firebaseApiKey) {
        throw new Error('Firebase API key not configured. Please set PUBLIC_FIREBASE_API_KEY in your .env file.');
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = 'Invalid email or password';
        
        if (data.error) {
          switch (data.error.message) {
            case 'EMAIL_NOT_FOUND':
              errorMessage = 'No account found with this email';
              break;
            case 'INVALID_PASSWORD':
              errorMessage = 'Incorrect password';
              break;
            case 'USER_DISABLED':
              errorMessage = 'This account has been disabled';
              break;
            case 'INVALID_EMAIL':
              errorMessage = 'Invalid email address';
              break;
            default:
              errorMessage = data.error.message || 'Authentication failed';
          }
        }

        return fail(401, {
          error: errorMessage
        });
      }

      const idToken = data.idToken;
      const decodedToken = await auth.verifyIdToken(idToken);

      const expiresIn = 60 * 60 * 24 * 5 * 1000; 
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      cookies.set('session', sessionCookie, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 5 // 5 days
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
