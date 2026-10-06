import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Hexagon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('ana@demo.com');
  const [password, setPassword] = useState('Password123!');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-ink-500/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-500 to-indigo-600 shadow-glow">
            <Hexagon className="h-7 w-7 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Tokenizado</h1>
          <p className="mt-2 text-sm text-slate-400">
            Autenticación segura con tokens de sesión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 sm:p-8">
          <h2 className="mb-6 font-display text-xl font-semibold text-white">Iniciar sesión</h2>

          <div className="mb-4">
            <label htmlFor="email" className="label-field">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ana@demo.com"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="label-field">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-field pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={show ? 'Ocultar' : 'Mostrar'}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting || loading} className="btn-primary w-full">
            {(submitting || loading) && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-ink-300 hover:text-ink-200">
              Regístrate
            </Link>
          </p>

          <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-500">
            Demo: <span className="text-slate-300">ana@demo.com</span> /{' '}
            <span className="text-slate-300">Password123!</span>
          </div>
        </form>
      </div>
    </div>
  );
}
