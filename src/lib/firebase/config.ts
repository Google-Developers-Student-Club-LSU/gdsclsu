/**
 * Firebase configuration
 * Replace these values with your Firebase project credentials
 * You can find these in your Firebase Console > Project Settings > General
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || ''
};

/**
 * Firebase Admin SDK configuration
 * For server-side operations, you'll need a service account key
 * Download it from Firebase Console > Project Settings > Service Accounts
 * 
 * @returns {string | object} Service account key as a string (file path) or parsed object
 * @throws {Error} If FIREBASE_SERVICE_ACCOUNT_KEY is not set
 */
export function getFirebaseAdminConfig(): string | object {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }
  
  try {
    return JSON.parse(serviceAccountKey);
  } catch {
    return serviceAccountKey;
  }
}
