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

import { 
  PUBLIC_API_KEY, 
  PUBLIC_AUTH_DOMAIN,
  PUBLIC_PROJECT_ID,
  PUBLIC_STORAGE_BUCKET,
  PUBLIC_MESSAGING_SENDER_ID,
  PUBLIC_APP_ID,
  PUBLIC_MEASUREMENT_ID,
  PUBLIC_DATABASE_URL
} from '$env/static/public';

function getFirebaseConfig(): FirebaseConfig | null {
  return {
    apiKey: PUBLIC_API_KEY,
    projectId: PUBLIC_PROJECT_ID,
    authDomain: PUBLIC_AUTH_DOMAIN,
    databaseURL: PUBLIC_DATABASE_URL,
    storageBucket: PUBLIC_STORAGE_BUCKET,
    appId: PUBLIC_APP_ID,
    measurementId: PUBLIC_MEASUREMENT_ID,
    messagingSenderId: PUBLIC_MESSAGING_SENDER_ID
  };
}

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp | null {
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
