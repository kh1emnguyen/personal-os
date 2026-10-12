import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AntiRut from './pages/AntiRut/index.jsx'
import Pulse from './pages/Pulse/index.jsx'
import Briefing from './pages/Briefing/index.jsx'
import Archive from './pages/Briefing/Archive.jsx'
import Writing from './pages/Writing/index.jsx'
import { AuthGate } from './lib/auth.jsx'

// Flip to true in the same release that you run supabase/0005_lock_pulse_to_owner.sql. Until then Pulse stays open,
// because the sign-in cannot work before the owner user and migration 0004 exist.
const LOCK_PULSE = false

export default function App() {
  const pulse = LOCK_PULSE ? <AuthGate><Pulse /></AuthGate> : <Pulse />
  return (
    <HashRouter>
      <Routes>
        <Route path="/"                element={<Home />} />
        <Route path="/anti-rut"        element={<AntiRut />} />
        <Route path="/pulse"           element={pulse} />
        <Route path="/briefing"        element={<Briefing />} />
        <Route path="/briefing/:date"  element={<Briefing />} />
        <Route path="/briefings"       element={<Archive />} />
        <Route path="/writing"         element={<Writing />} />
        <Route path="/writing/:slug"   element={<Writing />} />
      </Routes>
    </HashRouter>
  )
}
