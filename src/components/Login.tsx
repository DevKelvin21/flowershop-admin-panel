import { useEffect, useState } from 'react';
import { auth } from '../db/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

function Login() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign-in:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center gap-2 my-8">
        <img src={user.photoURL || ''} alt={user.displayName ? `${user.displayName}'s avatar` : 'User avatar'} className="w-16 h-16 rounded-full" />
        <div className="text-lg font-semibold">{user.displayName}</div>
        <button className="px-4 py-2 bg-rose-600 text-white rounded" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 my-16">
      <h2 className="text-2xl font-bold text-rose-700">Iniciar sesión</h2>
      <button className="px-6 py-3 bg-rose-600 text-white rounded text-lg" onClick={handleLogin}>
        Iniciar sesión con Google
      </button>
    </div>
  );
}

export default Login;
