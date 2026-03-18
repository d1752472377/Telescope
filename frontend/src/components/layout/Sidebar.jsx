import { Server, Shield, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: '服务器', icon: Server },
  { to: '/vpn', label: 'VPN', icon: Shield },
  { to: '/settings', label: '设置', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: '200px',
      minWidth: '200px',
      background: 'var(--bg-base)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Logo 区 */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          fontSize: '11px',
          letterSpacing: '3px',
          color: 'var(--accent)',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          TELESCOPE
        </div>
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}>
          服务器管理中心
        </div>
      </div>

      {/* 导航 */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--bg-elevated)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 150ms',
            })}
            onMouseEnter={(e) => {
              const link = e.currentTarget
              if (!link.classList.contains('active')) {
                link.style.background = 'var(--bg-elevated)'
              }
            }}
            onMouseLeave={(e) => {
              const link = e.currentTarget
              if (!link.classList.contains('active')) {
                link.style.background = 'transparent'
              }
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 底部版本号 */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}>
        v0.1.0
      </div>
    </aside>
  )
}
