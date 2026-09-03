import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAdminAuth, getAdminDb } from "$lib/server/firebase";

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isLiveNow(event: {
  date: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  type?: string;
}): boolean {
  if (!event.date || event.type !== "event") return false;

  const now = new Date();
  const localToday = formatDate(now);
  const end = event.endDate || event.date;

  if (localToday < event.date || localToday > end) return false;

  if (!event.startTime || !event.endTime) return true;

  const current = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = event.startTime.split(":").map(Number);
  const [eh, em] = event.endTime.split(":").map(Number);
  const start = sh * 60 + (sm || 0);
  const finish = eh * 60 + (em || 0);

  if (start <= finish) {
    return current >= start && current <= finish;
  }
  return current >= start || current <= finish;
}

export const POST: RequestHandler = async ({ request }) => {
  const auth = getAdminAuth(request);
  const db = await getAdminDb(request);
  if (!auth || !db) {
    return json({ ok: false, error: "Server auth is not configured." }, { status: 503 });
  }

  let body: { eventId?: string; pin?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const eventId = body.eventId?.trim();
  const pin = body.pin?.trim().toUpperCase();
  if (!eventId || !pin) {
    return json({ ok: false, error: "Event and PIN are required." }, { status: 400 });
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
  const pinRef = db.collection("eventPins").doc(eventId);

  try {
    const [userSnap, eventSnap, pinSnap] = await Promise.all([
      userRef.get(),
      eventRef.get(),
      pinRef.get(),
    ]);

    if (!userSnap.exists) {
      return json({ ok: false, error: "Account not found." }, { status: 404 });
    }

    const userData = userSnap.data() || {};
    if (userData.permissions === "officer") {
      return json({ ok: false, error: "Officers cannot check in for points." }, { status: 403 });
    }

    if (!eventSnap.exists) {
      return json({ ok: false, error: "Event not found." }, { status: 404 });
    }

    const eventData = eventSnap.data() || {};
    if (!isLiveNow(eventData as never)) {
      return json({ ok: false, error: "This event is not currently active." }, { status: 400 });
    }

    if (!pinSnap.exists || (pinSnap.data()?.pin ?? "").toUpperCase() !== pin) {
      return json({ ok: false, error: "Incorrect PIN. Please try again." }, { status: 400 });
    }

    const pointsToAward = Number(eventData.points) || 10;

    const result = await db.runTransaction(async (transaction) => {
      const freshUserSnap = await transaction.get(userRef);
      const freshData = freshUserSnap.exists ? freshUserSnap.data() || {} : {};

      const attended: string[] = freshData.attendedEvents ?? [];
      if (attended.includes(eventId)) {
        return { checkedIn: false, error: "You have already checked into this event!" };
      }

      const currentPoints = Number(freshData.points) || 0;
      transaction.update(userRef, {
        points: currentPoints + pointsToAward,
        attendedEvents: [...attended, eventId],
      });

      return { checkedIn: true, points: currentPoints + pointsToAward };
    });

    if (!result.checkedIn) {
      return json({ ok: false, error: result.error }, { status: 400 });
    }

    return json({ ok: true, points: result.points, earned: pointsToAward, title: eventData.title || "" });
  } catch (error) {
    console.error("Check-in failed:", error);
    return json({ ok: false, error: "Could not check in. Try again." }, { status: 500 });
  }
};
