import {
  getFirestore,
  Firestore,
  addDoc,
  collection,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import type { User } from "../models/User";
import { getFirebaseApp } from "./config";

let databaseInstance: Firestore | null = null;

function getDatabase(): Firestore {
  if (!databaseInstance) {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error(
        "Firebase is not configured. Check your environment variables.",
      );
    }
    databaseInstance = getFirestore(app);
  }
  return databaseInstance;
}

export const db: Firestore =
  typeof window !== "undefined"
    ? getDatabase()
    : (undefined as unknown as Firestore);

export async function addToFirebase(
  object: Record<string, unknown>,
  table: string,
): Promise<string | null> {
  const docRef = await addDoc(collection(getDatabase(), table), object).catch(
    (error) => {
      console.error(error);
      return null;
    },
  );
  return docRef ? docRef.id : null;
}

export async function deleteFromFirebase(docId: string, table: string) {
  await deleteDoc(doc(getDatabase(), table, docId)).catch((error) => {
    console.error(error);
  });
}

export async function setDocInFirebase(
  docId: string,
  table: string,
  object: Record<string, unknown>,
) {
  const docRef = doc(getDatabase(), table, docId);
  await setDoc(docRef, object, { merge: true }).catch((error) => {
    console.error(error);
  });
}

export async function updateDocInFirebase(
  docId: string,
  table: string,
  updates: Record<string, unknown>,
) {
  const reference = doc(getDatabase(), table, docId);
  await updateDoc(reference, updates).catch((error) => {
    console.error(error);
  });
}

export async function getAllDocsFromFirebase(table: string) {
  const references = collection(getDatabase(), table);
  return await getDocs(references);
}

export async function getDocFromFirebase(docId: string, table: string) {
  const docSnap = await getDoc(doc(getDatabase(), table, docId));

  if (docSnap.exists()) {
    return {
      id: docId,
      data: docSnap.data(),
    };
  }
  return null;
}

export async function getUserByUid(uid: string): Promise<User | null> {
  try {
    const docRef = doc(getDatabase(), "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as User;
    }

    console.warn(`No user document found with ID name: ${uid}`);
    return null;
  } catch (error) {
    console.error("Error fetching user document directly:", error);
    throw error;
  }
}

export async function saveUserWithUid(user: User): Promise<void> {
  const docRef = doc(getDatabase(), "users", user.id);
  await setDoc(docRef, user);
}
