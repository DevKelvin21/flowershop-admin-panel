import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './db/firestore';
import './App.css';
import DashboardTab from './components/DashboardTab.tsx';
import InventoryTab from './components/InventoryTab.tsx';
import LossInventory from './components/LossInventory.tsx';
import { logOperation } from './db/utils.ts';
// import TransactionsTab from './components/TransactionsTab.tsx';
import Login from './components/Login.tsx';
import type { User } from 'firebase/auth';

function App() {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-rose-600 text-white px-8 shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-wide py-4">Floristeria Morale's</h1>
        <nav className="flex space-x-2 pb-4 md:pb-0 items-center">
          {['Reporte', 'Inventario', 'Pérdida'].map((label, idx) => (
            <button
              key={label}
              className={`px-4 py-2 rounded font-medium transition ${
                tab === idx
                  ? 'bg-rose-500 text-white shadow'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-900'
              }`}
              onClick={() => setTab(idx)}
            >
              {label}
            </button>
          ))}
          {/* User info and logout */}
          {user && (
            <div className="flex items-center gap-3 ml-6">
              <span className="text-rose-100 text-sm">{user.email}</span>
              <button
                className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-900 text-white text-sm"
                onClick={async () => { 
                  await logOperation({
                    operation_type: 'logout',
                    user_name: user.email || '',
                    message: `Usuario cerró sesión: ${user.email || ''}`
                  });
                  await auth.signOut();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <section className="w-full max-w-8xl bg-white rounded shadow p-6 border border-rose-100">
          {tab === 0 && <DashboardTab />}
          {tab === 1 && user && <InventoryTab userEmail={user.email || ''} />}
          {tab === 2 && user && <LossInventory userEmail={user.email || ''} />}
          {/* {tab === 3 && <TransactionsTab />} */}
        </section>
      </main>
    </div>
  );
}

export default App;
