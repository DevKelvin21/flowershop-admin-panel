import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
    { path: '/losses', label: 'Pérdidas' },
    { path: '/financial', label: 'Ventas y Gastos' },
];

export function Navbar({ userEmail, onLogout }: NavbarProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const root = document.documentElement;
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialIsDark = storedTheme ? storedTheme === 'dark' : prefersDark;
        setIsDark(initialIsDark);
        root.classList.toggle('dark', initialIsDark);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handlePreferenceChange = (event: MediaQueryListEvent) => {
            if (localStorage.getItem('theme')) return;
            setIsDark(event.matches);
            root.classList.toggle('dark', event.matches);
        };
        mediaQuery.addEventListener('change', handlePreferenceChange);

        return () => {
            mediaQuery.removeEventListener('change', handlePreferenceChange);
        };
    }, []);

    const handleThemeToggle = (checked: boolean) => {
        setIsDark(checked);
        const root = document.documentElement;
        root.classList.toggle('dark', checked);
        localStorage.setItem('theme', checked ? 'dark' : 'light');
    };

    return (
        <NavigationMenu className="flex justify-between items-center p-4" viewport={false}>
            <NavigationMenuList className="flex gap-2">
                {navItems.map(({ path, label }) => (
                    <NavigationMenuItem key={path}>
                        <NavigationMenuLink asChild className="focus:bg-primary focus:text-primary-foreground rounded-md">
                            <NavLink
                                to={path}
                                className={({ isActive }) => (isActive ? 'bg-primary' : '')}
                            >
                                {label}
                            </NavLink>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
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
