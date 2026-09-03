import type { Handle } from "@sveltejs/kit";
import { getAdminAuth } from "$lib/server/firebase";

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