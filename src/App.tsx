import { Route, Routes } from "react-router"
import Dashboard from "./pages/Dashboard"
import Catalogue from "./pages/Catalogue"
import SessionPlayer from "./pages/SessionPlayer"
import ErrorPage from "./pages/ErrorPage"
import { NavLayout } from "./components/NavLayout"
import Settings from "./pages/Settings"
import Statistics from "./pages/Statistics"

const App = () => {
  return (
    <Routes>
      <Route element={<NavLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>
      <Route path="/session/:id" element={<SessionPlayer />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default App
