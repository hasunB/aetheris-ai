import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import DashboardPage from './pages/dashboard';
import AnalyticsPage from './pages/Analytics';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import TestD from './pages/TestD';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/test-d" element={<TestD />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

