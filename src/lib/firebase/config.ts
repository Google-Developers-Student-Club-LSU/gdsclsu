import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";

interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  authDomain: string;
  databaseURL?: string;
  storageBucket: string;
  appId: string;
  measurementId?: string;
  messagingSenderId: string;
}
function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_KEY;
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

  if (!apiKey || apiKey === '' || apiKey === 'undefined') {
    if (typeof window === 'undefined') {
      console.warn('FIREBASE BUILD GUARD: API key missing during build. Firebase will not initialize.');
    } else {
      console.error('FIREBASE INIT ERROR: NEXT_PUBLIC_FIREBASE_KEY is missing or invalid.');
    }
    return null;
  }

  if (!projectId || projectId === '' || projectId === 'undefined') {
    if (typeof window === 'undefined') {
      console.warn('FIREBASE BUILD GUARD: Project ID missing during build. Firebase will not initialize.');
    } else {
      console.error('FIREBASE INIT ERROR: NEXT_PUBLIC_PROJECT_ID is missing or invalid.');
    }
    return null;
  }

  return {
    apiKey,
    projectId,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || `${projectId}.appspot.com`,
    appId: process.env.NEXT_PUBLIC_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || ''
  };
}

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  const config = getFirebaseConfig();
  if (!config) {
    console.error('FIREBASE INIT SKIPPED: Invalid configuration. Check your environment variables.');
    return null;
  }

  try {
    firebaseApp = initializeApp(config);
    return firebaseApp;
  } catch (error) {
    console.error('FIREBASE INIT ERROR:', error);
    return null;
  }
}
