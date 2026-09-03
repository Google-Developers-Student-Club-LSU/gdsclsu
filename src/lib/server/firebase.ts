import { mkdirSync, writeFileSync } from "node:fs";
import { cert, getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getVercelOidcToken } from "@vercel/oidc";
import { gcpConfig } from "./gcp.config";

const WIF_DIR = "/tmp/gdsc-wif";
const WIF_TOKEN_PATH = `${WIF_DIR}/subject-token`;
const WIF_CONFIG_PATH = `${WIF_DIR}/credentials.json`;

let wifReady = false;

function writeWifConfig(): boolean {
  if (wifReady) return true;
  const { projectNumber, workloadIdentityPoolId, workloadIdentityProviderId, serviceAccountEmail } = gcpConfig;
  if (!process.env.VERCEL_OIDC_TOKEN || !projectNumber || !serviceAccountEmail) {
    return false;
  }
  mkdirSync(WIF_DIR, { recursive: true });
  writeFileSync(WIF_TOKEN_PATH, process.env.VERCEL_OIDC_TOKEN, "utf8");
  writeFileSync(
    WIF_CONFIG_PATH,
    JSON.stringify({
      type: "external_account",
      audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${workloadIdentityPoolId}/providers/${workloadIdentityProviderId}`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      credential_source: { file: WIF_TOKEN_PATH },
    }),
    "utf8",
  );
  process.env.GOOGLE_APPLICATION_CREDENTIALS = WIF_CONFIG_PATH;
  wifReady = true;
  return true;
}

async function refreshWifToken(): Promise<void> {
  if (!wifReady) return;
  try {
    const token = await getVercelOidcToken();
    if (token) {
      writeFileSync(WIF_TOKEN_PATH, token, "utf8");
    }
  } catch {
    const token = process.env.VERCEL_OIDC_TOKEN;
    if (token) {
      writeFileSync(WIF_TOKEN_PATH, token, "utf8");
    }
  }
}

function adminCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return cert({ projectId, clientEmail, privateKey });
  }
  if (writeWifConfig()) {
    return applicationDefault();
  }
  return null;
}

export function getAdminApp() {
  if (getApps().length === 0) {
    const credential = adminCredential();
    if (!credential) {
      return null;
    }
    initializeApp({ credential, projectId: gcpConfig.projectId });
  }
  return getApps()[0];
}

export async function getAdminDb() {
  const app = getAdminApp();
  if (!app) return null;
  await refreshWifToken();
  return getFirestore(app);
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}
