import { browser } from '$app/environment';
import { onAuthStateChanged, type Auth, type User as FirebaseUser } from 'firebase/auth';
import { getDocFromFirebase, getUserByUid } from './database';

interface HeaderUser {
    id: string;
    points: number;
    permissions: string;
    username: string;
}

class AuthState {
    #user = $state<HeaderUser | null>(null);
    #loading = $state(true);

    constructor() {
        if (!browser) return;
    }

    init(auth: Auth) {
        if (!browser) return;

        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                try {
                    const dbUser = await getUserByUid(firebaseUser.uid);

                    this.#user = {
                        id: firebaseUser.uid,
                        points: dbUser?.points ?? 0,
                        permissions: dbUser?.permissions ?? "member",
                        username: dbUser?.username ?? firebaseUser.displayName ?? ""
                    };
                } catch (error) {
                    console.error("Failed to sync user permissions:", error);

                    this.#user = {
                        id: firebaseUser.uid,
                        points: 0,
                        permissions: "member",
                        username: ""
                    };
                }
            } else {
                this.#user = null;
            }
            this.#loading = false;
        });
    }

    get user() { return this.#user; }
    get loading() { return this.#loading; }
    get isOfficer() {
        return this.#user?.permissions === 'officer';
    }
}

export const authState = new AuthState();