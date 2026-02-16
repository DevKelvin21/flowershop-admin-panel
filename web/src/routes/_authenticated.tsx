import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services';
import { Flower2 } from 'lucide-react';

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
    <div className="ambient-grid min-h-screen bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,var(--accent)_35%,transparent)_0%,transparent_38%),radial-gradient(circle_at_bottom_right,_color-mix(in_oklch,var(--secondary)_24%,transparent)_0%,transparent_34%)] text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-4 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary shadow-sm ring-1 ring-primary/20">
              <Flower2 className="size-6" />
            </div>
            <div>
              <p className="font-serif text-xl leading-none tracking-wide text-primary">
                Floristeria Morales
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Panel Administrativo
              </p>
            </div>
          </div>
          <Navbar userEmail={user.email} onLogout={handleLogout} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1520px] flex-1 flex-col p-4 md:p-6">
        <section className="page-shell w-full rounded-2xl border border-border/70 bg-card/85 p-4 shadow-md backdrop-blur-sm md:p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
