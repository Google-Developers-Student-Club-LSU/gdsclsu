// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: {
				permissions: any;
				uid: string;
				email: string | null;
				emailVerified: boolean;
			} | null;
		}
	}
}

export {};
