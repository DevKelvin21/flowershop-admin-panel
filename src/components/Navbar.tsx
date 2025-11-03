import { NavLink } from 'react-router-dom';

type NavbarProps = {
    userEmail?: string | null;
    onLogout?: () => Promise<void> | void;
};

const navItems = [
    { path: '/', label: 'Reporte' },
    { path: '/inventory', label: 'Inventario' },
    { path: '/losses', label: 'Pérdida' },
    { path: '/transactions', label: 'Transacciones' },
];

export function Navbar({ userEmail, onLogout }: NavbarProps) {
    return (
        <nav className="flex space-x-2 pb-4 md:pb-0 items-center">
            {navItems.map(({ path, label }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                        `px-4 py-2 rounded font-medium transition ${isActive
                            ? 'bg-rose-500 text-white shadow'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-900'
                        }`
                    }
                >
                    {label}
                </NavLink>
            ))}
            {userEmail && (
                <div className="flex items-center gap-3 ml-6">
                    <span className="text-rose-100 text-sm">{userEmail}</span>
                    <button
                        className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-900 text-white text-sm"
                        onClick={async () => {
                            if (onLogout) await onLogout();
                        }}
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </nav>
    );
}
