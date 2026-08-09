import { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  LogOut,
  Sun,
  Moon,
  Bell,
  Search,
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

export default function DashboardLayout() {
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      className={`relative min-h-screen flex transition-colors duration-500 overflow-hidden ${
        isDark ? 'bg-[#060a14] text-slate-50' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <ParticleBackground isDark={isDark} />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative z-20 w-64 flex flex-col border-r backdrop-blur-2xl ${
          isDark
            ? 'bg-[#0a1628]/60 border-white/5'
            : 'bg-white/60 border-slate-200'
        }`}
      >
        <div className="p-6 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark
                ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Aetheris</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { name: 'Dashboard', icon: LayoutDashboard, active: true, path: '/dashboard' },
            { name: 'Analytics', icon: Activity, path: '/analytics' },
            { name: 'Users', icon: Users, path: '/users' },
            { name: 'Settings', icon: Settings, path: '/settings' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                item.active
                  ? isDark
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              isDark
                ? 'text-red-400 hover:bg-red-400/10'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header
          className={`flex items-center justify-between px-8 py-4 border-b backdrop-blur-md ${
            isDark ? 'border-white/5' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                placeholder="Search telemetry..."
                className={`w-64 pl-10 pr-4 py-2 rounded-lg outline-none transition-all text-sm ${
                  isDark
                    ? 'bg-white/5 border border-white/5 text-white placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50'
                    : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark((d) => !d)}
              className={`p-2 rounded-lg transition-colors border ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className={`p-2 rounded-lg transition-colors border ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white/10 cursor-pointer shadow-md" />
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet context={{ isDark }} />
        </div>
      </main>
    </div>
  );
}
