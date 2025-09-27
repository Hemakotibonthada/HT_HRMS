import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from './pages/Landing';
import { LoginPage } from './pages/Login';
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardPage } from './pages/Dashboard';
import { EmployeePortalPage } from './pages/employee/EmployeePortal';
import { WorkPortalPage } from './pages/work/WorkPortal';

const App = () => {
  return (
    <Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/portal/employee" element={<EmployeePortalPage />} />
          <Route path="/portal/work" element={<WorkPortalPage />} />
        </Route>
      </Route>
  <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
