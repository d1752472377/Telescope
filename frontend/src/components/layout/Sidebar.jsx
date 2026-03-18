import { Monitor, Shield, Settings as SettingsIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Servers', icon: Monitor },
  { to: '/vpn', label: 'VPN', icon: Shield },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-5 py-6 text-slate-200 lg:flex">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Telescope</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Server cockpit</h1>
        <p className="mt-2 text-sm text-slate-400">Launch SSH, FTP, and RDP from one place.</p>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
