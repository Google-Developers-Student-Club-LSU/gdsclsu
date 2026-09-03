const env = process.env;

export const gcpConfig = {
  projectId: env.FIREBASE_PROJECT_ID || "gdsc-lsu-website-db",
  projectNumber: env.FIREBASE_PROJECT_NUMBER || "385852041539",
  workloadIdentityPoolId: env.FIREBASE_WIF_POOL_ID || "vercel",
  workloadIdentityProviderId: env.FIREBASE_WIF_PROVIDER_ID || "vercel",
  serviceAccountEmail:
    env.FIREBASE_SERVICE_ACCOUNT_EMAIL ||
    "firebase-adminsdk-fbsvc@gdsc-lsu-website-db.iam.gserviceaccount.com",
};
