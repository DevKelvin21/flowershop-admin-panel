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
        <NavigationMenu className="flex justify-between items-center p-4" viewport={false}>
            <NavigationMenuList className="flex gap-2">
                {navItems.map(({ path, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <NavigationMenuItem key={path}>
                            <NavigationMenuLink asChild className="focus:bg-primary focus:text-primary-foreground rounded-md">
                                <Link
                                    to={path}
                                    className={cn(isActive && 'bg-primary')}
                                >
                                    {label}
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    );
                })}
            </NavigationMenuList>
            <div className="flex items-center gap-4 ml-6">
                <div className="flex items-center gap-2">
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
                        <Badge variant="default">
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
        </NavigationMenu>
    );
}
