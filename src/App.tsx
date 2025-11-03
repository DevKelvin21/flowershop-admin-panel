import { useState } from 'react';
import './App.css';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { useAuth } from './hooks/useAuth.ts';
import { DashboardPage } from './pages/Dashboard.tsx';
import { InventoryManagement } from './pages/InventoryManagement.tsx';
import { LoginPage } from './pages/Login.tsx';
import { LossInventoryManagement } from './pages/LossInventoryManagement.tsx';
import { TransactionsPage } from './pages/Transactions.tsx';
import { authService } from './services/index.ts';

function App() {
  const [tab, setTab] = useState(0);
  const { user, loading, handleLogout } = useAuth(authService);

  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-rose-600 text-white px-8 shadow flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-wide py-4">Floristeria Morale's</h1>
        <Navbar
          currentTab={tab}
          onSelectTab={setTab}
          userEmail={user.email}
          onLogout={handleLogout}
        />
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <section className="w-full max-w-8xl bg-white rounded shadow p-6 border border-rose-100">
          {tab === 0 && <DashboardPage />}
          {tab === 1 && user && <InventoryManagement userEmail={user.email || ''} />}
          {tab === 2 && user && <LossInventoryManagement userEmail={user.email || ''} />}
          {tab === 3 && <TransactionsPage />}
        </section>
      </main>
    </div>
  );
}

export default App;
