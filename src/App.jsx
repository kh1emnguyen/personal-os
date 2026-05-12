import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AntiRut from './pages/AntiRut/index.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/anti-rut" element={<AntiRut />} />
      </Routes>
    </HashRouter>
  )
}
