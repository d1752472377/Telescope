import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import Servers from './pages/Servers'
import VPN from './pages/VPN'
import Settings from './pages/Settings'

const pageTitles = {
  '/': 'Servers',
  '/vpn': 'VPN',
  '/settings': 'Settings',
}

export default function App() {
  const location = useLocation()
  const isServersPage = location.pathname === '/'

  return (
    <div className={`flex min-h-screen ${isServersPage ? 'bg-[#0f1117] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar title={pageTitles[location.pathname] ?? 'Telescope'} />
        <main className={`flex-1 p-6 lg:p-8 ${isServersPage ? 'bg-[#0f1117]' : ''}`}>
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
