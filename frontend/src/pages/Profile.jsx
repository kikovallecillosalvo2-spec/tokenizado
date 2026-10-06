import { useState } from 'react';
import { Loader2, UserCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, updateName, loading } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (trimmed === user?.name) {
      toast.info('No hay cambios que guardar');
      return;
    }
    setSubmitting(true);
    try {
      await updateName(trimmed);
      toast.success('Nombre actualizado correctamente');
    } catch (err) {
      toast.error(err.message || 'No se pudo actualizar');
    } finally {
      setSubmitting(false);
    }
  }

  const initial = (user?.name || '?').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-lg animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Perfil</h1>
        <p className="mt-1 text-sm text-slate-400">
          Actualiza tu nombre vía PATCH /api/users/name
        </p>
      </div>

      <div className="glass-strong rounded-2xl p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-400 to-indigo-600 text-2xl font-bold text-white shadow-glow">
            {initial}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="profile-name" className="label-field">
              Nombre completo
            </label>
            <div className="relative">
              <UserCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="profile-name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                className="input-field pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              disabled
              className="input-field cursor-not-allowed opacity-60"
              value={user?.email || ''}
            />
            <p className="mt-1.5 text-xs text-slate-500">El email no se puede cambiar en esta versión</p>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="btn-primary w-full sm:w-auto"
          >
            {(submitting || loading) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}
