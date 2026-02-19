import { NavLink, Outlet } from 'react-router-dom';

/**
 * Shared layout component with sidebar navigation.
 * Wraps all pages via React Router's <Outlet />.
 */
function Layout() {
    const linkBase =
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
    const linkActive = `${linkBase} bg-brand-600/20 text-brand-400`;
    const linkInactive = `${linkBase} text-slate-400 hover:bg-slate-700/50 hover:text-slate-200`;

    return (
        <div className="flex min-h-screen">
            {/* Background gradient accent */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-brand-400/10 blur-3xl" />
            </div>

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 flex h-full w-60 flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-md">
                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 shadow-lg shadow-brand-600/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">Repair Portal</span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 space-y-1 px-3 py-4" data-testid="sidebar-nav">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => (isActive ? linkActive : linkInactive)}
                        data-testid="nav-new-request"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Request
                    </NavLink>

                    <NavLink
                        to="/tickets"
                        className={({ isActive }) => (isActive ? linkActive : linkInactive)}
                        data-testid="nav-tickets"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        Tickets
                    </NavLink>

                    <NavLink
                        to="/workers"
                        className={({ isActive }) => (isActive ? linkActive : linkInactive)}
                        data-testid="nav-workers"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Workers
                    </NavLink>
                </nav>

                {/* Footer */}
                <div className="border-t border-slate-700/50 px-5 py-4">
                    <p className="text-xs text-slate-500">© 2026 Tenant Repair Portal</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-60 flex-1 px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
