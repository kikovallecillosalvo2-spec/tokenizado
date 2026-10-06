import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  Activity,
  ShieldCheck,
  KeyRound,
  Search,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { getHealth, getUsers } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton h-4 w-8" />
          <div className="skeleton h-4 flex-1" />
          <div className="skeleton h-4 w-40" />
          <div className="skeleton h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [healthOk, setHealthOk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, healthRes] = await Promise.all([
        getUsers(),
        getHealth().catch(() => null),
      ]);
      setUsers(usersRes.data?.users || []);
      setHealthOk(Boolean(healthRes?.success));
    } catch (err) {
      toast.error(err.message || 'Error al cargar datos');
      setHealthOk(false);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.id).includes(q)
    );
  }, [users, search]);

  const tokenPreview = token
    ? `${token.slice(0, 8)}…${token.slice(-6)}`
    : '—';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Hola, {user?.name?.split(' ')[0] || 'usuario'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Panel de control · Tokenizado API
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Usuarios"
          value={loading ? '…' : users.length}
          hint="Primeros 10 del API"
          accent="ink"
        />
        <StatCard
          icon={Activity}
          label="API Status"
          value={
            healthOk === null ? '…' : healthOk ? 'Online' : 'Offline'
          }
          hint="/api/health"
          accent={healthOk ? 'emerald' : healthOk === false ? 'rose' : 'amber'}
        />
        <StatCard
          icon={ShieldCheck}
          label="Sesión"
          value="Activa"
          hint="Bearer token válido"
          accent="violet"
        />
        <StatCard
          icon={KeyRound}
          label="Token"
          value={tokenPreview}
          hint="Vista truncada"
          accent="amber"
        />
      </div>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Usuarios</h2>
            <p className="text-xs text-slate-500">GET /api/users · sin contraseñas</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                placeholder="Buscar por nombre, email…"
                className="input-field !py-2 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="button" onClick={load} className="btn-ghost shrink-0" title="Recargar">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
            <Inbox className="h-10 w-10 opacity-50" />
            <p className="text-sm font-medium">
              {search ? 'Sin resultados para esa búsqueda' : 'No hay usuarios todavía'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-medium sm:px-6">ID</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium sm:px-6">Creado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3 font-mono text-slate-400 sm:px-6">{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-500/20 text-xs font-bold text-ink-200">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-slate-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500 sm:px-6">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
