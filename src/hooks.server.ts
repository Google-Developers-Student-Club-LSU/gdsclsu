import type { Handle } from '@sveltejs/kit';
import * as admin from 'firebase-admin';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionCookie = event.cookies.get('session');

  if (sessionCookie) {
    try {
      const adminAuth  = admin.auth()
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
      
      event.locals.user = {
        permissions: decodedToken.permissions || [],
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        emailVerified: decodedToken.email_verified || false
      };
    } catch (error) {
      event.cookies.delete('session', { path: '/' });
      event.cookies.delete('user', { path: '/' });
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};
