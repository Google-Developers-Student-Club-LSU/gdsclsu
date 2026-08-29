import type { Handle } from "@sveltejs/kit";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminAuth() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\\n");

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return getAuth();
}

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;
  const sessionCookie = event.cookies.get("session");

  if (sessionCookie) {
    try {
      const adminAuth = getAdminAuth();
      if (!adminAuth) {
        return resolve(event);
      }

      const decodedToken = await adminAuth.verifySessionCookie(
        sessionCookie,
        true,
      );
      event.locals.user = {
        permissions: decodedToken.permissions || [],
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        emailVerified: decodedToken.email_verified || false,
      };
    } catch {
      event.cookies.delete("session", { path: "/" });
      event.cookies.delete("user", { path: "/" });
    }
  }

  return resolve(event);
};
