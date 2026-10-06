import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Hexagon, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PasswordStrength, { getPasswordScore } from '../components/PasswordStrength';

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (getPasswordScore(password) < 5) {
      toast.error('La contraseña no cumple todos los requisitos');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      toast.success('Cuenta creada. ¡Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'No se pudo registrar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-80 w-80 rounded-full bg-ink-500/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-500 to-indigo-600 shadow-glow">
            <Hexagon className="h-7 w-7 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-400">Únete a Tokenizado en segundos</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 sm:p-8">
          <div className="mb-4">
            <label htmlFor="name" className="label-field">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="label-field">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="label-field">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
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
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <button
            type="submit"
            disabled={submitting || loading || getPasswordScore(password) < 5}
            className="btn-primary mt-5 w-full"
          >
            {(submitting || loading) && <Loader2 className="h-4 w-4 animate-spin" />}
            Crear cuenta
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-ink-300 hover:text-ink-200">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
