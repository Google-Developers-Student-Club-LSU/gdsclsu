import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import type { Auth, User as FirebaseUser } from "firebase/auth";
import { getFirebaseApp } from "./config";
import { authState } from "./auth.svelte";
let authInstance: Auth | null = null;

export function getAuthInstance(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }

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

export const auth: Auth | null =
  typeof window !== "undefined" ? getAuthInstance() : null;

export async function createUser(
  email: string,
  password: string,
  username?: string,
): Promise<FirebaseUser | null> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error(
      "Firebase Auth is not available. Check your environment variables.",
    );
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (username && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: username });
    }

    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + "/login",
    });

    await signOut(auth);

    return userCredential.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<FirebaseUser | null> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error(
      "Firebase Auth is not available. Check your environment variables.",
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      const error = new Error(
        "Please check your inbox and verify your email address before logging in.",
      ) as Error & { code?: string };
      error.code = "auth/email-not-verified";
      throw error;
    }

    return userCredential.user;
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/email-not-verified") {
      console.error("Error signing in:", error);
    }
    throw error;
  }
}

export async function resendVerificationEmail(
  email: string,
  password: string,
): Promise<void> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error(
      "Firebase Auth is not available. Check your environment variables.",
    );
  }

  let userCredential;
  try {
    userCredential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    const code = (error as { code?: string }).code || "";
    if (
      code === "auth/invalid-credential" ||
      code === "auth/invalid-login-credentials" ||
      code === "auth/wrong-password" ||
      code === "auth/user-not-found"
    ) {
      const friendly = new Error(
        "We couldn't re-authenticate you to send a new email. Enter the correct password and try again.",
      ) as Error & { code?: string };
      friendly.code = "auth/incorrect-password";
      throw friendly;
    }
    throw error;
  }

  try {
    if (userCredential.user.emailVerified) {
      const error = new Error(
        "This email is already verified — you can log in now.",
      ) as Error & { code?: string };
      error.code = "auth/already-verified";
      throw error;
    }

    await sendEmailVerification(userCredential.user, {
      url: window.location.origin + "/login",
    });
  } finally {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out after resending verification:", error);
    }
  }
}

export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  if (!auth) {
    throw new Error(
      "Firebase Auth is not available. Check your environment variables.",
    );
  }
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
