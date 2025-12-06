import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;
let initializationAttempted = false;

export function initializeFirebase(): admin.app.App | null {
  if (initializationAttempted) {
    return firebaseApp;
  }
  initializationAttempted = true;

  // Check if Firebase credentials are provided
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKeyRaw || !clientEmail) {
    console.warn(
      '⚠️  Firebase Admin SDK not initialized: Missing environment variables',
    );
    console.warn(
      '   Set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL',
    );
    console.warn('   Authentication will be BYPASSED until configured');
    return null;
  }

  // Handle escaped newlines in the private key
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    console.warn('   Authentication will be BYPASSED until Firebase is configured correctly');
    console.warn('   Check that FIREBASE_PRIVATE_KEY is properly formatted (see CLAUDE.md)');
    return null;
  }
}

export function getFirebaseApp(): admin.app.App | null {
  if (!firebaseApp && !initializationAttempted) {
    initializeFirebase();
  }
  return firebaseApp;
}

export function getFirebaseAuth(): admin.auth.Auth | null {
  const app = getFirebaseApp();
  return app ? app.auth() : null;
}

export function isFirebaseInitialized(): boolean {
  return firebaseApp !== null;
}
