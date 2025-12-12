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

  // Validate that the private key looks like a PEM key
  if (!privateKey.includes('-----BEGIN') || !privateKey.includes('PRIVATE KEY-----')) {
    console.warn('');
    console.warn('⚠️  Firebase Admin SDK not initialized: Invalid private key format');
    console.warn('   The FIREBASE_PRIVATE_KEY must be a valid PEM-formatted RSA private key');
    console.warn('   It should start with "-----BEGIN PRIVATE KEY-----" or "-----BEGIN RSA PRIVATE KEY-----"');
    console.warn('');
    console.warn('   ⚠️  Authentication is BYPASSED - all requests will use a mock dev user');
    console.warn('');
    return null;
  }

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('');
    console.warn('⚠️  Firebase Admin SDK initialization failed');
    console.warn(`   Error: ${errorMessage}`);
    console.warn('');
    console.warn('   This is likely due to an invalid FIREBASE_PRIVATE_KEY format.');
    console.warn('   The private key must be a valid PEM-formatted RSA key.');
    console.warn('');
    console.warn('   💡 To fix this:');
    console.warn('   1. Remove or rename your .env file temporarily');
    console.warn('   2. Or set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL to empty');
    console.warn('');
    console.warn('   ⚠️  Authentication is BYPASSED - all requests will use a mock dev user');
    console.warn('');
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
