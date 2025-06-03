import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './db/firestore';
import './App.css';
import DashboardTab from './components/DashboardTab.tsx';
import InventoryTab from './components/InventoryTab.tsx';
import TransactionsTab from './components/TransactionsTab.tsx';
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
        <nav className="flex space-x-2 pb-4 md:pb-0">
          {['Reporte', 'Inventario', 'Pérdida', 'Transacciones por Revisar'].map((label, idx) => (
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
        </nav>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <section className="w-full max-w-8xl bg-white rounded shadow p-6 border border-rose-100">
          {tab === 0 && <DashboardTab />}
          {tab === 1 && <InventoryTab />}
          {tab === 2 && (
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 text-rose-700">Pérdida</h2>
              <p className="text-gray-700">Aquí puedes ver la información sobre pérdidas.</p>
            </div>
          )}
          {tab === 3 && <TransactionsTab />}
        </section>
      </main>
    </div>
  );
}

export default App;
