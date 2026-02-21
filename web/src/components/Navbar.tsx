import { Link, useLocation } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { Moon, Sun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/theme-provider';
import type { UserRole } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface NavbarProps {
  userEmail: string | null;
  userRole?: UserRole | null;
  onLogout: () => Promise<void> | void;
}

interface NavItem {
  path: '/' | '/inventory' | '/financial' | '/audit' | '/users';
  label: string;
  requiredRole?: UserRole;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Reporte' },
  { path: '/inventory', label: 'Inventario' },
  { path: '/financial', label: 'Ventas y Gastos' },
  { path: '/audit', label: 'Bitácora' },
  { path: '/users', label: 'Usuarios', requiredRole: 'OWNER' },
];

export function Navbar({ userEmail, userRole, onLogout }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const isDark = resolvedTheme === 'dark';

  const visibleNavItems = navItems.filter(
    (item) => !item.requiredRole || item.requiredRole === userRole,
  );

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <NavigationMenu className="w-full md:w-auto" viewport={false}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
        <NavigationMenuList className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-card/70 p-1">
          {visibleNavItems.map(({ path, label }) => {
            const isActive = location.pathname === path;
            return (
              <NavigationMenuItem key={path}>
                <NavigationMenuLink
                  asChild
                  className="rounded-md focus:bg-primary focus:text-primary-foreground"
                >
                  <Link
                    to={path}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>

        <div className="flex flex-wrap items-center justify-between gap-3 md:ml-2 md:justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card/70 px-3 py-2">
            <Sun
              className={cn(
                'size-4 transition-colors',
                isDark ? 'text-muted-foreground' : 'text-primary',
              )}
              aria-hidden
            />
            <Switch
              checked={isDark}
              onCheckedChange={handleThemeToggle}
              aria-label="Toggle dark mode"
            />
            <Moon
              className={cn(
                'size-4 transition-colors',
                isDark ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden
            />
          </div>

          {userEmail && (
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="max-w-[12rem] truncate">
                {userEmail}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  if (onLogout) await onLogout();
                }}
              >
                <FontAwesomeIcon icon={faSignOut} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </NavigationMenu>
  );
}
