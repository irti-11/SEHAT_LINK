import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './store.jsx'
import TopBar from './components/TopBar.jsx'
import Landing from './pages/Landing.jsx'
import Intake from './pages/Intake.jsx'
import Processing from './pages/Processing.jsx'
import HealthBrief from './pages/HealthBrief.jsx'
import DoctorBrief from './pages/DoctorBrief.jsx'

export default function App() {
  return (
    <AppProvider>
      <TopBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/brief" element={<HealthBrief />} />
        <Route path="/doctor-brief" element={<DoctorBrief />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}