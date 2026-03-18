import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Servers from './pages/Servers'
import VPN from './pages/VPN'
import Settings from './pages/Settings'

export default function App() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', minWidth: 0 }}>
        <TopBar pathname={location.pathname} />
        <main style={{ flex: 1, padding: '24px', background: 'var(--bg-base)' }}>
          <Routes>
            <Route path="/" element={<Servers />} />
            <Route path="/vpn" element={<VPN />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
