import type { User as FirebaseUser } from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../db/firestore';
import type { LoggingService } from '../services/logging.service';
import type { AuthUser } from '../shared/models/auth';
import type { AuthService } from './auth.service';

/**
 * Maps Firebase User to our domain AuthUser type
 */
function mapFirebaseUserToAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  };
}

/**
 * Firebase implementation of AuthService
 */
export class FirebaseAuthService implements AuthService {
  constructor(private logger?: LoggingService) {}

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = mapFirebaseUserToAuthUser(userCredential.user);
      
      if (this.logger) {
        await this.logger.logOperation({
          operation_type: 'login',
          user_name: email,
          message: `Usuario inició sesión: ${email}`
        });
      }
      
      return authUser;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión.';
      throw new Error(errorMessage);
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = mapFirebaseUserToAuthUser(userCredential.user);
      
      if (this.logger) {
        await this.logger.logOperation({
          operation_type: 'register',
          user_name: email,
          message: `Usuario registrado: ${email}`
        });
      }
      
      return authUser;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar usuario.';
      throw new Error(errorMessage);
    }
  }

  async signOut(): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (this.logger && currentUser?.email) {
        await this.logger.logOperation({
          operation_type: 'logout',
          user_name: currentUser.email,
          message: `Usuario cerró sesión: ${currentUser.email}`
        });
      }
      
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cerrar sesión.';
      throw new Error(errorMessage);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }
    return mapFirebaseUserToAuthUser(firebaseUser);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(mapFirebaseUserToAuthUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  }
}

/**
 * Factory function to create a Firebase auth service instance
 * @param logger - Optional logging service for operation logging
 */
export function createFirebaseAuthService(logger?: LoggingService): AuthService {
  return new FirebaseAuthService(logger);
}

