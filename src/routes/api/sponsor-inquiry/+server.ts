import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAdminDb } from "$lib/server/firebase";
import { FieldValue } from "firebase-admin/firestore";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export const POST: RequestHandler = async ({ request }) => {
  const db = await getAdminDb();
  if (!db) {
    return json({ ok: false, error: "Server auth is not configured." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.length > 0) {
    return json({ ok: true, error: "" }, { status: 200 });
  }

  const name = clean(body.name, 120);
  const company = clean(body.company, 120);
  const email = clean(body.email, 254);
  const message = clean(body.message, 5000);

  if (!name) {
    return json({ ok: false, error: "Please provide your name." }, { status: 400 });
  }
  if (!company) {
    return json({ ok: false, error: "Please provide your company." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!message) {
    return json({ ok: false, error: "Please include a message." }, { status: 400 });
  }

  try {
    await db.collection("sponsorInquiries").add({
      name,
      company,
      email,
      message,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });
    return json({ ok: true });
  } catch (error) {
    console.error("Failed to save sponsor inquiry:", error);
    return json({ ok: false, error: "Could not send your message. Please try again." }, { status: 500 });
  }
};
