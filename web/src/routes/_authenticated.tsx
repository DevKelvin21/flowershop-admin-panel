import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services';
import logo from '../assets/logo-floristeria.svg';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth(authService);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Error handling is done in useAuth
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-8 shadow flex flex-col md:flex-row md:items-center md:justify-between bg-card text-card-foreground">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="Floristeria Morale's logo"
            className="h-16 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold tracking-wide py-4 text-primary font-sans">
            Floristeria Morale's
          </h1>
        </div>
        <Navbar userEmail={user.email} onLogout={handleLogout} />
      </header>
      <main className="flex-1 p-6 flex flex-col items-center">
        <section className="w-full max-w-8xl bg-card text-card-foreground rounded shadow p-6 border border-border">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
