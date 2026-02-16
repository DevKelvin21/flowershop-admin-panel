import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Moon, Sun } from 'lucide-react';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';

interface NavbarProps {
    userEmail: string | null;
    onLogout: () => Promise<void> | void;
}

const navItems = [
    { path: '/', label: 'Reporte' },
    { path: '/inventory', label: 'Inventario' },
    { path: '/financial', label: 'Ventas y Gastos' },
] as const;

export function Navbar({ userEmail, onLogout }: NavbarProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const location = useLocation();
    const isDark = resolvedTheme === 'dark';

    const handleThemeToggle = (checked: boolean) => {
        setTheme(checked ? 'dark' : 'light');
    };

    return (
        <NavigationMenu className="w-full md:w-auto" viewport={false}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <NavigationMenuList className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-card/70 p-1">
                {navItems.map(({ path, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <NavigationMenuItem key={path}>
                            <NavigationMenuLink asChild className="rounded-md focus:bg-primary focus:text-primary-foreground">
                                <Link
                                    to={path}
                                    className={cn(
                                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                          ? 'bg-primary text-primary-foreground shadow-sm'
                                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                    <Sun className={cn('size-4 transition-colors', isDark ? 'text-muted-foreground' : 'text-primary')} aria-hidden />
                    <Switch
                        checked={isDark}
                        onCheckedChange={handleThemeToggle}
                        aria-label="Toggle dark mode"
                    />
                    <Moon className={cn('size-4 transition-colors', isDark ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
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
