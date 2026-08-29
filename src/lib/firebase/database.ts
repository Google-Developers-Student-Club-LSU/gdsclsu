import { getFirestore, Firestore, addDoc, collection, doc, deleteDoc, getDocs, getDoc, updateDoc, query, where, setDoc } from "firebase/firestore";
import type { User } from "../models/User";
import { getFirebaseApp } from "./config";

let databaseInstance: Firestore | null = null;

export function getDatabaseInstance(): Firestore | null {
  return getDatabase();
}

export const db = typeof window !== 'undefined' ? getDatabase() : null;

function getDatabase(): Firestore | null {
  if (!databaseInstance) {
    const app = getFirebaseApp();
    if (!app) {
      return null;
    }
    databaseInstance = getFirestore(app);
  }
  return databaseInstance;
}

export async function addToFirebase (object: any, table: string) {
  const db = getDatabase();
  if (!db) {
    console.error("Firebase Database is not available. Check your environment variables.");
    return;
  }
  await addDoc(collection(db, table), object)
    .catch(error => { console.error(error); });
}

export async function createNewUserDoc(user: User): Promise<void> {
  const db = getDatabase();
  if (!db) return;
  try {
    const docRef = doc(db, 'users', user.id);
    await setDoc(docRef, user);
  } catch (error) {
    console.error("Error creating explicit user document: ", error);
  }
}

export async function deleteFromFirebase (docId: string, table: string) {
  const db = getDatabase();
  if (!db) {
    console.error("Firebase Database is not available. Check your environment variables.");
    return;
  }
  await deleteDoc(doc(db, table, docId))
    .catch(error => { console.error(error); });
}

export async function updateDocInFirebase (docId: string, table: string, updates: any) {
  const db = getDatabase();
  if (!db) {
    console.error("Firebase Database is not available. Check your environment variables.");
    return;
  }
  const reference = doc(db, table, docId);
  await updateDoc(reference, updates)
    .catch(error => { console.error(error); });
}

export async function getAllDocsFromFirebase (table: string) {
  const db = getDatabase();
  if (!db) {
    throw new Error("Firebase Database is not available. Check your environment variables.");
  }
  const references = collection(db, table);
  return await getDocs(references);
}

export async function getDocFromFirebase (docId: string, table: string) {
  const db = getDatabase();
  if (!db) {
    throw new Error("Firebase Database is not available. Check your environment variables.");
  }
  const docSnap = await getDoc(doc(db, table, docId));

  if (docSnap.exists()) {
    return ({
      id: docId,
      data: docSnap.data()
    });
  }
  return null;
}


export async function getUserByUid(uid: string): Promise<any> {
    try {
        const db = getDatabase();
        if (!db) throw new Error("Firebase Database is not available.");
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        }
        
        console.warn(`No user document found with ID name: ${uid}`);
        return null;
    } catch (error) {
        console.error("Error fetching user document directly:", error);
        throw error;
    }
}

export async function saveUserWithUid(user: any): Promise<void> {
    const db = getDatabase();
    if (!db) return;
    const docRef = doc(db, "users", user.id);
    await setDoc(docRef, user);
}