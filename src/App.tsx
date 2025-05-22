import { useState } from 'react'
import './App.css'
import DashboardTab from './components/DashboardTab.tsx'
import InventoryTab from './components/InventoryTab.tsx'
import TransactionsTab from './components/TransactionsTab.tsx'

function App() {
  const [tab, setTab] = useState(0)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-rose-600 text-white py-4 px-8 shadow">
        <h1 className="text-2xl font-bold tracking-wide">Floristeria Morale's</h1>
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <div className="mb-6">
          <nav className="flex space-x-2">
            {['Dashboard', 'Inventory', 'Transactions'].map((label, idx) => (
              <button
                key={label}
                className={`px-4 py-2 rounded-t font-medium transition ${
                  tab === idx
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
                onClick={() => setTab(idx)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <section className="w-full max-w-4xl bg-white rounded shadow p-6 border border-rose-100">
          {tab === 0 && <DashboardTab />}
          {tab === 1 && <InventoryTab />}
          {tab === 2 && <TransactionsTab />}
        </section>
      </main>
    </div>
  )
}

export default App
