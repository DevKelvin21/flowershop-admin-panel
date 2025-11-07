import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/index';
import logo from '../assets/logo-floristeria.svg';

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
            <header className="px-8 shadow flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src={logo}
                        alt="Floristeria Morale's logo"
                        className="h-16 w-auto object-contain"
                    />
                    <h1 className="text-2xl font-bold tracking-wide py-4 text-primary font-sans font-bold">Floristeria Morale's</h1>
                </div>
                <Navbar userEmail={user.email} onLogout={handleLogout} />
            </header>
            <main className="flex-1 p-6 flex flex-col items-center">
                <section className="w-full max-w-8xl bg-white rounded shadow p-6 border border-primary-foreground">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}
