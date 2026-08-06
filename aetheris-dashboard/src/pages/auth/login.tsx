import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import {
  Activity, ArrowRight, Lock, Mail, Sun, Moon, ShieldCheck, Loader2
} from 'lucide-react';
import ParticleBackground from '../../components/ParticleBackground';
import { ToastContainer } from '../../components/Toast';
import type { ToastMessage } from '../../components/Toast';

// ═══════════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function LoginPage() {
  const [isDark, setIsDark] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const msg = typeof response.data === 'string' ? response.data : 'Logged in successfully!';
      addToast('success', msg);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message || 'Login failed. Please check backend status.';
        addToast('error', msg);
      } else {
        addToast('error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Animation Variants ──
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center transition-colors duration-500 overflow-hidden ${
        isDark ? 'bg-[#060a14] text-slate-50' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <ParticleBackground isDark={isDark} />
      <ToastContainer toasts={toasts} onDismiss={removeToast} isDark={isDark} />

      {/* Theme Toggle Navbar */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-end z-50">
        <button
          onClick={() => setIsDark((d) => !d)}
          className={`p-2 rounded-lg transition-colors cursor-pointer backdrop-blur-md border ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-400'
              : 'bg-white/50 border-slate-200 hover:bg-white text-slate-500'
          }`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 w-full max-w-md px-6"
      >
        <motion.div
          variants={fadeUp}
          className={`relative rounded-3xl backdrop-blur-xl border p-8 shadow-2xl animate-glow ${
            isDark
              ? 'bg-[#0a1628]/80 border-white/10 shadow-blue-500/10'
              : 'bg-white/80 border-slate-200 shadow-slate-300/50'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform hover:scale-105 ${
                isDark
                  ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                  : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
              }`}
              title="Return to Home"
            >
              <Activity className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Welcome to Aetheris
            </h1>
            <p
              className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Sign in to access telemetry dashboards
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <motion.div variants={fadeUp}>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    className={`w-5 h-5 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  placeholder="name@observatory.edu"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Password
                </label>
                <a
                  href="#"
                  className={`text-xs font-medium hover:underline ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    className={`w-5 h-5 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Secure Badge */}
          <motion.div
            variants={fadeUp}
            className={`mt-6 flex items-center justify-center gap-1.5 text-xs font-medium ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Secure Encrypted Connection
          </motion.div>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          variants={fadeUp}
          className={`text-center mt-6 text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            className={`font-medium hover:underline ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Request Access
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}