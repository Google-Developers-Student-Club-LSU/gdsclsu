/**
 * Firebase Admin SDK initialization for server-side operations
 * This module handles Firebase Admin initialization and provides typed access to Firebase services
 */
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';
import { getFirebaseAdminConfig } from './config.js';

let adminApp: admin.app.App | null = null;

/**
 * Gets or initializes the Firebase Admin app instance
 * @returns {admin.app.App} The initialized Firebase Admin app
 * @throws {Error} If Firebase Admin initialization fails
 */
export function getAdminApp(): admin.app.App {
  if (!adminApp) {
    try {
      const serviceAccount = getFirebaseAdminConfig();
      
      if (admin.apps.length > 0) {
        adminApp = admin.app();
        return adminApp;
      }
      
      if (typeof serviceAccount === 'string') {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else if (typeof serviceAccount === 'object' && serviceAccount !== null) {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as ServiceAccount)
        });
      } else {
        throw new Error('Invalid service account configuration');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (admin.apps.length > 0) {
        adminApp = admin.app();
        return adminApp;
      }
      
      throw new Error(`Failed to initialize Firebase Admin: ${errorMessage}`);
    }
  }
  
  return adminApp;
}

/**
 * Gets the Firebase Auth instance for server-side authentication operations
 * @returns {admin.auth.Auth} The Firebase Auth instance
 */
export function getAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

/**
 * Verifies a Firebase ID token
 * @param {string} idToken - The Firebase ID token to verify
 * @returns {Promise<admin.auth.DecodedIdToken>} The decoded token
 * @throws {Error} If token verification fails
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const auth = getAuth();
  return await auth.verifyIdToken(idToken);
}

/**
 * Creates a session cookie from an ID token
 * @param {string} idToken - The Firebase ID token
 * @param {admin.auth.SessionCookieOptions} options - Session cookie options
 * @returns {Promise<string>} The session cookie
 */
export async function createSessionCookie(
  idToken: string,
  options: admin.auth.SessionCookieOptions
): Promise<string> {
  const auth = getAuth();
  return await auth.createSessionCookie(idToken, options);
}

/**
 * Verifies a session cookie
 * @param {string} sessionCookie - The session cookie to verify
 * @param {boolean} checkRevoked - Whether to check if the token was revoked
 * @returns {Promise<admin.auth.DecodedIdToken>} The decoded token
 */
export async function verifySessionCookie(
  sessionCookie: string,
  checkRevoked: boolean = true
): Promise<admin.auth.DecodedIdToken> {
  const auth = getAuth();
  return await auth.verifySessionCookie(sessionCookie, checkRevoked);
}
