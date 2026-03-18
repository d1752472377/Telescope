const PAGE_NAMES = {
  '/': '服务器',
  '/vpn': 'VPN',
  '/settings': '设置',
}

export default function TopBar({ pathname }) {
  const pageName = PAGE_NAMES[pathname] ?? 'Telescope'
  // 实际项目可通过 fetch 检测 agent 状态，这里先静态展示
  const agentReady = true

  return (
    <header style={{
      height: '48px',
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      {/* 面包屑 */}
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        <span>控制台</span>
        <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{pageName}</span>
      </div>

      {/* Agent 状态 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        fontSize: '12px',
        color: agentReady ? 'var(--green)' : 'var(--text-secondary)',
      }}>
        <span
          className="pulse-dot"
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: agentReady ? 'var(--green)' : 'var(--text-muted)',
            display: 'inline-block',
          }}
        />
        {agentReady ? 'Agent 就绪' : 'Agent 离线'}
      </div>
    </header>
  )
}
