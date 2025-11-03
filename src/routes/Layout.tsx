import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/index';

export function Layout() {
    const { user, signOut } = useAuth(authService);

    const handleLogout = async () => {
        try {
            await signOut();
        } catch {
            // Error handling is done in useAuth
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-rose-600 text-white px-8 shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold tracking-wide py-4">Floristeria Morale's</h1>
                <Navbar userEmail={user.email} onLogout={handleLogout} />
            </header>
            <main className="flex-1 p-6 flex flex-col items-center">
                <section className="w-full max-w-8xl bg-white rounded shadow p-6 border border-rose-100">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
