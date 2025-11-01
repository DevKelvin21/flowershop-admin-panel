
type NavbarProps = {
    currentTab: number;
    onSelectTab: (index: number) => void;
    userEmail?: string | null;
    onLogout?: () => Promise<void> | void;
};

export function Navbar({ currentTab, onSelectTab, userEmail, onLogout }: NavbarProps) {
    const labels = ['Reporte', 'Inventario', 'Pérdida', 'Transacciones'];

    return (
        <nav className="flex space-x-2 pb-4 md:pb-0 items-center">
            {labels.map((label, idx) => (
                <button
                    key={label}
                    className={`px-4 py-2 rounded font-medium transition ${currentTab === idx
                        ? 'bg-rose-500 text-white shadow'
                        : 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-900'
                        }`}
                    onClick={() => onSelectTab(idx)}
                >
                    {label}
                </button>
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

