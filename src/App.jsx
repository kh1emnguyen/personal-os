import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AntiRut from './pages/AntiRut/index.jsx'
import Pulse from './pages/Pulse/index.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/anti-rut"  element={<AntiRut />} />
        <Route path="/pulse"     element={<Pulse />} />
      </Routes>
    </HashRouter>
  )
}
