import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;