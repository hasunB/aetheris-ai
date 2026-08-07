import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import api from '../../api/axios';
import {
  Activity, ArrowRight, ArrowLeft, Lock, Mail, Sun, Moon, ShieldCheck,
  User, Building, MapPin, Globe, Phone, Check, Loader2
} from 'lucide-react';
import ParticleBackground from '../../components/ParticleBackground';
import { ToastContainer } from '../../components/Toast';
import type { ToastMessage } from '../../components/Toast';

// ═══════════════════════════════════════════════════════════════
//  REGISTER WIZARD PAGE
// ═══════════════════════════════════════════════════════════════

export default function RegisterPage() {
  const [isDark, setIsDark] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    country: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('error', 'Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const msg = response.data?.message || 'Registration successful!';
      addToast('success', msg);
      // redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.message || 'Registration failed. Please check backend connection.';
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const slideVariants: Variants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 40 : -40,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -40 : 40,
      transition: { duration: 0.2, ease: 'easeIn' },
    }),
  };

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center transition-colors duration-500 py-12 px-4 overflow-x-hidden ${
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

      {/* Main Register Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative z-10 w-full max-w-2xl"
      >
        <div
          className={`relative rounded-3xl backdrop-blur-xl border p-8 sm:p-10 shadow-2xl animate-glow ${
            isDark
              ? 'bg-[#0a1628]/80 border-white/10 shadow-blue-500/10'
              : 'bg-white/80 border-slate-200 shadow-slate-300/50'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Link
              to="/"
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-transform hover:scale-105 ${
                isDark
                  ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'
                  : 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
              }`}
              title="Return to Home"
            >
              <Activity className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              Create an Account
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Step {step} of 2 — {step === 1 ? 'Personal & Organization Info' : 'Account Credentials'}
            </p>
          </div>

          {/* Wizard Step Progress Indicator */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step >= 1
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'bg-white/10 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step === 1
                      ? isDark
                        ? 'text-blue-400'
                        : 'text-blue-600'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  Details
                </span>
              </div>

              <div
                className={`flex-1 h-0.5 mx-4 transition-colors ${
                  step > 1
                    ? 'bg-blue-600'
                    : isDark
                    ? 'bg-white/10'
                    : 'bg-slate-200'
                }`}
              />

              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === 2
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isDark
                      ? 'bg-white/10 text-slate-400'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step === 2
                      ? isDark
                        ? 'text-blue-400'
                        : 'text-blue-600'
                      : isDark
                      ? 'text-slate-400'
                      : 'text-slate-600'
                  }`}
                >
                  Security
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 ? (
              <motion.form
                key="step1"
                custom={step}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideVariants}
                onSubmit={handleNext}
                className="space-y-4"
              >
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Company & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="company"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Company / Organization
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="Aetheris Labs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Address & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="address"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="123 Tech Blvd"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Country
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    Continue to Credentials
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                custom={step}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideVariants}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Email Address */}
                <div>
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
                      <Mail className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                      }`}
                      placeholder="name@observatory.edu"
                      required
                    />
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Secure Badge */}
          <div
            className={`mt-6 flex items-center justify-center gap-1.5 text-xs font-medium ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            256-bit SSL Encrypted Registration
          </div>
        </div>

        {/* Footer Link */}
        <p
          className={`text-center mt-6 text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className={`font-medium hover:underline ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}