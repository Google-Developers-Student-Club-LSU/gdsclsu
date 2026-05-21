import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendEmailVerification 
} from "firebase/auth";
import type { Auth, User as FirebaseUser } from "firebase/auth";
import type { User } from "../models/User";
import * as database from "./database";
import { getFirebaseApp } from "./config";
import { authState } from './auth.svelte';
import { getDatabase } from "firebase/database";

let authInstance: Auth | null = null;
const db = getDatabase();

export function getAuthInstance(): Auth | null {
  if (!authInstance) {
    const app = getFirebaseApp();
    if (!app) {
      return null;
    }
    authInstance = getAuth(app);
    authState.init(authInstance);
  }
  return authInstance;
}

export const auth = typeof window !== 'undefined' ? getAuthInstance() : null as any;

export async function createUser(email: string, password: string, username?: string): Promise<FirebaseUser | null> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error("Firebase Auth is not available. Check your environment variables.");
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    if (username && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: username });
    }

    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + "/login"
    });

    await signOut(auth);

    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<FirebaseUser | null> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error("Firebase Auth is not available. Check your environment variables.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Please check your inbox and verify your email address before logging in.");
    }

    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error("Firebase Auth is not available. Check your environment variables.");
  }
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
