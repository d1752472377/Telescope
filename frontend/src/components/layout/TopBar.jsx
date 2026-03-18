export default function TopBar({ title }) {
  return (
    <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Local agent ready
        </div>
      </div>
    </header>
  )
}
