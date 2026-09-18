import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/transparent-icon.png';
import '../App.css';
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  LogOut,
  Sun,
  Moon,
  Bell,
  Wifi,
  Search,
  User,
} from 'lucide-react';

export default function DashboardLayout() {
  const [isDark, setIsDark] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      className={`relative min-h-screen flex transition-colors duration-500 overflow-hidden background-container ${isDark ? 'bg-[#060a14] text-slate-50' : 'bg-slate-50 text-slate-900'
        }`}
    >

      {/* Sidebar -left */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`relative z-20 w-21 py-5 items-center flex flex-col border rounded-[30px] backdrop-blur-2xl shadow-lg ${isDark
            ? 'bg-[#000000]/60 border-white/5'
            : 'bg-white/60 border-slate-200'
          }`}
      >
        <img src={logo} alt="logo" className='w-11 h-11 mb-5' />

        <hr className='w-10 border-white/20 mb-1' />

        <nav className="flex-1 px-4 py-6 space-y-4">
          {[
            { icon: LayoutDashboard, active: true, path: '/dashboard' },
            { icon: Activity, path: '/analytics' },
            { icon: Users, path: '/users' },
            { icon: Settings, path: '/settings' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-center p-3 rounded-full transition-all font-medium text-sm cursor-pointer ${item.active
                  ? isDark
                    ? 'bg-black/50 text-[#F6A83B] border border-[#F6A83B]'
                    : 'bg-blue-50 text-[#F6A83B] border border-[#F6A83B]'
                  : isDark
                    ? 'bg-black/50 text-slate-400 hover:text-[#F6A83B] border border-[#F6A83B]'
                    : 'bg-white/5 text-slate-500 hover:text-[#F6A83B] border border-[#F6A83B]'
                }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        <nav className="flex-1 px-4 py-6 space-y-4 justify-end flex flex-col">
          {[
            { icon: Users, active: false, path: '/users' },
            { icon: Settings, active: false, path: '/settings' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-center p-3 rounded-full transition-all font-medium text-sm cursor-pointer ${item.active
                  ? isDark
                    ? 'bg-black/50 text-[#F6A83B] border border-[#F6A83B]'
                    : 'bg-blue-50 text-[#F6A83B] border border-[#F6A83B]'
                  : isDark
                    ? 'bg-black/50 text-slate-400 hover:text-[#F6A83B] border border-[#F6A83B]'
                    : 'bg-white/5 text-slate-500 hover:text-[#F6A83B] border border-[#F6A83B]'
                }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </nav>

        <hr className='w-10 border-white/20 mb-1' />

        <div className="mt-3 mb-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center p-3 rounded-full transition-all font-medium text-sm cursor-pointer ${isDark
                ? 'bg-black/50 text-red-400 hover:text-red-400 border border-red-400'
                : 'bg-white/5 text-red-400 hover:text-red-400 border border-red-400'
              }`}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col h-[95vh] overflow-hidden">
        {/* Top Navbar */}
        <header
          className={`flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-200'
            }`}
        >
          <motion.div className="pl-10 pt-5 self-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Observational Intelligence
              </h1>
              <p className={`text-md ${isDark ? 'text-slate-200' : 'text-slate-500'}`}>
                Real-time optical seeing telemetry, AI predictions, and automated anomaly detection.
              </p>
            </div>
          </motion.div>
          <div className="flex flex-col items-end gap-2 h-full">
            <div className="flex items-start gap-3 h-full">
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-full me-2 border shadow-lg ${isDark
                  ? 'bg-[#000000]/60 border-white/10'
                  : 'bg-white/60 border-slate-200'
                }`}
              >
                <Wifi className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Aetheris-EDG-7
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
              </div>

              {/* search */}
              <button
                className={`p-3 rounded-full transition-colors border shadow-lg ${isDark
                    ? 'bg-[#000000]/60 border-white/10 hover:bg-white/10 text-slate-400'
                    : 'bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* theme toggle */}
              <button
                onClick={() => setIsDark((d) => !d)}
                className={`p-3 rounded-full transition-colors border shadow-lg ${isDark
                    ? 'bg-[#000000]/60 border-white/10 hover:bg-white/10 text-slate-400'
                    : 'bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* notification */}
              <button
                className={`p-3 rounded-full transition-colors border shadow-lg ${isDark
                    ? 'bg-[#000000]/60 border-white/10 hover:bg-white/10 text-slate-400'
                    : 'bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* user image */}
              <button
                className={`p-3 rounded-full transition-colors border shadow-lg ${isDark
                    ? 'bg-[#000000]/60 border-white/10 hover:bg-white/10 text-slate-400'
                    : 'bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-500'
                  }`}
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* date & time */}
            <p className={`text-md font-medium tracking-wide tabular-nums ${isDark ? 'text-slate-200' : 'text-slate-500'}`}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              {' · '}
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="w-full flex h-full pt-6 gap-6 pl-10">
          <div className='flex-1 flex overflow-y-auto scrollbar-hide'>
            <div className='w-full'>
              <Outlet context={{ isDark }} />
            </div>
          </div>

          {/* Sidebar - right*/}
          <div className='w-45 h-[78vh] grid grid-cols-1 gap-5'>
            {[
            { name: 'CCT', value: '76', scale: '%' },
            { name: 'SLP', value: '1013.23', scale: 'mb' },
            { name: 'SP', value: '1013.27', scale: 'mb' },
            { name: 'PT', value: '1013.30', scale: 'mb' },
          ].map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl backdrop-blur-xl shadow-lg p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-default group ${
                isDark
                  ? 'bg-[#0a0e1a]/70 shadow-black/30 hover:shadow-[#F6A83B]/15 border border-[#F6A83B]'
                  : 'bg-white/70 shadow-slate-200/60 hover:shadow-amber-300/30 border border-slate-200/50'
              }`}
            >
              {/* Name pill */}
              <span className={`self-start text-[18px] font-bold uppercase tracking-[0.2em] mb-2 ${
                isDark
                  ? 'text-[#F6A83B]/80'
                  : 'text-amber-600/80'
              }`}>
                {item.name}
              </span>

              {/* Value row */}
              <div className="flex flex-col items-end">
                <span className={`text-[32px] font-semibold tabular-nums tracking-tight leading-none ${
                  isDark ? 'text-white drop-shadow-[0_0_8px_rgba(246,168,59,0.15)]' : 'text-slate-900'
                }`}>
                  {item.value}
                </span>
                <span className={`text-[12px] font-semibold uppercase tracking-wider self-end mt-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {item.scale}
                </span>
              </div>
            </div>
          ))}
          </div>
        </div>
      </main>

    </div>
  );
}
