import { browser } from '$app/environment';
import { onAuthStateChanged, type Auth, type User as FirebaseUser } from 'firebase/auth';
import { getUserByUid, saveUserWithUid } from './database';
import type { User } from '../models/User';

interface HeaderUser {
    id: string;
    points: number;
    permissions: string;
    username: string;
    email: string;
}

class AuthState {
    #user = $state<HeaderUser | null>(null);
    #loading = $state(true);
    #isVerified = $state(false);

    constructor() {
        if (!browser) return;
    }

    init(auth: Auth) {
        if (!browser) return;

        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                this.#isVerified = firebaseUser.emailVerified;

                try {
                    let dbUser = await getUserByUid(firebaseUser.uid);

                    if (!dbUser && firebaseUser.emailVerified) {
                        const newUser: User = {
                            id: firebaseUser.uid,
                            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Member",
                            points: 0,
                            permissions: "member"
                        };
                        await saveUserWithUid(newUser);
                        dbUser = newUser;
                    }

                    this.#user = {
                        id: firebaseUser.uid,
                        points: dbUser?.points ?? 0,
                        permissions: dbUser?.permissions ?? "member",
                        username: dbUser?.username ?? firebaseUser.displayName ?? "",
                        email: firebaseUser.email ?? ""
                    };
                } catch (error) {
                    console.error("Failed to sync user permissions:", error);
                    this.#user = {
                        id: firebaseUser.uid,
                        points: 0,
                        permissions: "member",
                        username: "",
                        email: firebaseUser.email ?? ""
                    };
                }
            } else {
                this.#user = null;
                this.#isVerified = false;
            }
            this.#loading = false;
        });
    }

    get user() { return this.#user; }
    get loading() { return this.#loading; }
    get isVerified() { return this.#isVerified; }
    get isOfficer() {
        return this.#user?.permissions === 'officer';
    }
}

export const authState = new AuthState();