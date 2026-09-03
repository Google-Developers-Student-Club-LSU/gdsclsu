import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env vars.",
  );
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

const eventsSnap = await db.collection("events").get();
let migrated = 0;
let alreadyClean = 0;

for (const doc of eventsSnap.docs) {
  const data = doc.data() || {};
  if (!data.pin) {
    alreadyClean += 1;
    continue;
  }

  const pinRef = db.collection("eventPins").doc(doc.id);
  const pinSnap = await pinRef.get();
  if (!pinSnap.exists) {
    await pinRef.set({ pin: data.pin });
  }
  await doc.ref.update({ pin: FieldValue.delete() });
  migrated += 1;
  console.log(`moved pin from events/${doc.id} to eventPins/${doc.id}`);
}

console.log(`Done. Migrated ${migrated}, already clean ${alreadyClean}.`);
