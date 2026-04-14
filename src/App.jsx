import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar, Footer } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import DriversPage from './pages/DriversPage';
import DriverDetailPage from './pages/DriverDetailPage';
import ConstructorsPage from './pages/ConstructorsPage';
import ConstructorDetailPage from './pages/ConstructorDetailPage';
import SeasonsPage from './pages/SeasonsPage';
import SeasonDetailPage from './pages/SeasonDetailPage';
import RaceDetailPage from './pages/RaceDetailPage';
import CircuitsPage from './pages/CircuitsPage';
import CircuitDetailPage from './pages/CircuitDetailPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';

// Admin
import { AdminLayout } from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminImport from './admin/pages/AdminImport';
import AdminDrivers from './admin/pages/AdminDrivers';
import AdminConstructors from './admin/pages/AdminConstructors';
import AdminCircuits from './admin/pages/AdminCircuits';
import AdminSeasons from './admin/pages/AdminSeasons';
import AdminRaces from './admin/pages/AdminRaces';
import AdminResults from './admin/pages/AdminResults';

function AdminRoutes() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="import" element={<AdminImport />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="constructors" element={<AdminConstructors />} />
          <Route path="circuits" element={<AdminCircuits />} />
          <Route path="seasons" element={<AdminSeasons />} />
          <Route path="races" element={<AdminRaces />} />
          <Route path="results" element={<AdminResults />} />
        </Routes>
      </AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Admin routes — no Navbar */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Public routes — with Navbar */}
          <Route
            path="/*"
            element={
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <div style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/drivers" element={<DriversPage />} />
                    <Route path="/drivers/:driverId" element={<DriverDetailPage />} />
                    <Route path="/constructors" element={<ConstructorsPage />} />
                    <Route path="/constructors/:constructorId" element={<ConstructorDetailPage />} />
                    <Route path="/seasons" element={<SeasonsPage />} />
                    <Route path="/seasons/:year" element={<SeasonDetailPage />} />
                    <Route path="/races/:id" element={<RaceDetailPage />} />
                    <Route path="/circuits" element={<CircuitsPage />} />
                    <Route path="/circuits/:circuitId" element={<CircuitDetailPage />} />
                    <Route path="/standings" element={<StandingsPage />} />
                    <Route path="*" element={<div style={{ padding: '4rem', textAlign: 'center' }}><h2>404 — Page not found</h2></div>} />
                  </Routes>
                </div>
                <Footer />
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
