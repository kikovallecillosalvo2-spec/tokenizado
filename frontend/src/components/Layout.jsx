import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, LogOut, Hexagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const initial = (user?.name || '?').charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    toast.info('Sesión cerrada');
    navigate('/login');
  }

  const navClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-ink-500/20 text-ink-200'
        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-975/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ink-500 to-indigo-600 shadow-glow">
              <Hexagon className="h-5 w-5 text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              Tokenizado
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/dashboard" className={navClass}>
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              <UserCircle className="h-4 w-4" />
              Perfil
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ink-400 to-indigo-600 text-sm font-bold text-white shadow-glow">
              {initial}
            </div>
            <button type="button" onClick={handleLogout} className="btn-ghost !px-2.5" title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
