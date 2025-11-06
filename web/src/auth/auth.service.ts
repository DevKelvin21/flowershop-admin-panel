import type { AuthUser } from '../shared/models/auth.ts';

export interface AuthService {
    signIn(email: string, password: string): Promise<AuthUser>;
    signUp(email: string, password: string): Promise<AuthUser>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<AuthUser | null>;
    onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}