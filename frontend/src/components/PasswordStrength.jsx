import { Check, X } from 'lucide-react';

const RULES = [
  { id: 'len', label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Una minúscula', test: (p) => /[a-z]/.test(p) },
  { id: 'num', label: 'Un número', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function getPasswordScore(password) {
  return RULES.filter((r) => r.test(password || '')).length;
}

export default function PasswordStrength({ password }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {RULES.map((rule) => {
        const ok = rule.test(password || '');
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-xs transition ${
              ok ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
