import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAdminAuth, getAdminDb } from "$lib/server/firebase";

export const POST: RequestHandler = async ({ request }) => {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) {
    return json({ ok: false, error: "Server auth is not configured." }, { status: 503 });
  }

  let body: { eventId?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const eventId = body.eventId?.trim();
  if (!eventId) {
    return json({ ok: false, error: "Event is required." }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await auth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return json({ ok: false, error: "Invalid session." }, { status: 401 });
  }

  const userRef = db.collection("users").doc(uid);
  const eventRef = db.collection("events").doc(eventId);

  try {
    const [userSnap, eventSnap] = await Promise.all([userRef.get(), eventRef.get()]);

    if (!userSnap.exists) {
      return json({ ok: false, error: "Account not found." }, { status: 404 });
    }

    const userData = userSnap.data() || {};
    if (userData.permissions === "officer") {
      return json({ ok: false, error: "Officers cannot claim easter eggs." }, { status: 403 });
    }

    if (!eventSnap.exists || eventSnap.data()?.type !== "easter-egg") {
      return json({ ok: false, error: "Easter egg not found." }, { status: 404 });
    }

    const pointsToAward = Number(eventSnap.data()?.points) || 10;

    const result = await db.runTransaction(async (transaction) => {
      const freshUserSnap = await transaction.get(userRef);
      const freshData = freshUserSnap.exists ? freshUserSnap.data() || {} : {};

      const claimedEggs: string[] = freshData.claimedEggs ?? [];
      if (claimedEggs.includes(eventId)) {
        return { claimed: false, error: "You've already claimed this easter egg!" };
      }

      const currentPoints = Number(freshData.points) || 0;
      transaction.update(userRef, {
        points: currentPoints + pointsToAward,
        claimedEggs: [...claimedEggs, eventId],
      });

      return { claimed: true, points: currentPoints + pointsToAward };
    });

    if (!result.claimed) {
      return json({ ok: false, error: result.error }, { status: 400 });
    }

    return json({ ok: true, points: result.points, earned: pointsToAward });
  } catch (error) {
    console.error("Easter egg claim failed:", error);
    return json({ ok: false, error: "Could not claim the easter egg. Try again." }, { status: 500 });
  }
};
