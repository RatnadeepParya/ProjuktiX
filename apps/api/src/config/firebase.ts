import admin from 'firebase-admin';
import { env } from './env.js';

let app: admin.app.App;

try {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
  } else if (env.firebase.clientEmail && env.firebase.privateKey) {
    // Direct in-memory cert from environment secrets
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey.replace(/\\n/g, '\n'),
      }),
      projectId: env.firebase.projectId,
    });
  } else if (env.firebase.serviceAccountJson) {
    // Parse service account directly in memory - NEVER written to disk
    const serviceAccount = JSON.parse(env.firebase.serviceAccountJson);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: env.firebase.projectId || serviceAccount.project_id,
    });
  } else {
    // Fallback to Application Default Credentials or Emulator mode
    app = admin.initializeApp({
      projectId: env.firebase.projectId,
    });
  }
} catch (error) {
  console.warn(
    '[ProjuktiX-Firebase] Initialized with fallback credentials or emulator. Reason:',
    error instanceof Error ? error.message : String(error)
  );
  if (admin.apps.length === 0) {
    app = admin.initializeApp({ projectId: env.firebase.projectId });
  } else {
    app = admin.apps[0]!;
  }
}

export const firebaseAdmin = app;
export const db = admin.firestore(app);
export const auth = admin.auth(app);

// Configure Firestore settings
try {
  db.settings({ ignoreUndefinedProperties: true });
} catch {
  // Ignore if already set
}
