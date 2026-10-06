export default function StatCard({ icon: Icon, label, value, accent = 'ink', hint }) {
  const accents = {
    ink: 'from-ink-500/20 to-transparent text-ink-300',
    emerald: 'from-emerald-500/20 to-transparent text-emerald-300',
    amber: 'from-amber-500/20 to-transparent text-amber-300',
    rose: 'from-rose-500/20 to-transparent text-rose-300',
    violet: 'from-violet-500/20 to-transparent text-violet-300',
  };

  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 animate-fade-in">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 ${accents[accent]}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <span className={`rounded-xl bg-white/[0.06] p-2.5 ${accents[accent].split(' ').pop()}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
