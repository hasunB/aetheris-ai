import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Activity, Cpu, Network, Zap, ArrowRight, Sun, Moon,
  Terminal, Server, Brain, Radio, Shield, BarChart3,
  Clock, GitBranch, BookOpen, Globe, ExternalLink,
} from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import logo from '../assets/transparent-icon.png';

// ═══════════════════════════════════════════════════════════════
//  DATA CONSTANTS
// ═══════════════════════════════════════════════════════════════

const TERMINAL_LINES: { type: string; text: string }[] = [
  { type: 'command', text: '$ aetheris-agent --connect edge-node-01' },
  { type: 'info', text: '[INFO] Connecting to /dev/ttyUSB0 @ 115200 baud...' },
  { type: 'success', text: '[OK]   Serial handshake complete ✓' },
  { type: 'info', text: '[INFO] Streaming scintillation data @ 100Hz' },
  { type: 'divider', text: '─────────────────────────────────────────' },
  { type: 'data', text: ' 12:04:01 │ V: 2.847 │ Cn² 1.2e-14' },
  { type: 'data', text: ' 12:04:02 │ V: 2.913 │ Cn² 1.4e-14' },
  { type: 'data', text: ' 12:04:03 │ V: 2.756 │ Cn² 0.9e-14' },
  { type: 'warning', text: '[AI] ⚠ Anomaly — seeing degradation +23%' },
  { type: 'ai', text: '[AI] Forecast: poor seeing in ~12 min' },
];

const TECH_STACK = [
  { name: 'Java', color: '#f89820' },
  { name: 'Spring Boot', color: '#6db33f' },
  { name: 'React', color: '#61dafb' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'WebSocket', color: '#4a90d9' },
  { name: 'TensorFlow', color: '#ff6f00' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Docker', color: '#2496ed' },
];

const TESTIMONIALS = [
  {
    quote:
      'Aetheris transformed our nightly observing runs. Predictive seeing forecasts alone saved hundreds of hours of wasted telescope time.',
    name: 'Dr. Sarah Chen',
    role: 'Director, Mount Wilson Observatory',
    initials: 'SC',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    quote:
      'The edge-to-cloud architecture is remarkable. Real-time Cn² telemetry with sub-millisecond latency gives unprecedented atmospheric insight.',
    name: 'Prof. James Harlow',
    role: 'Atmospheric Sciences, MIT',
    initials: 'JH',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    quote:
      'We integrated Aetheris into our adaptive optics pipeline in under a week. The WebSocket API is clean, fast, and well-documented.',
    name: 'Dr. Anika Patel',
    role: 'Lead Engineer, ESO Paranal',
    initials: 'AP',
    gradient: 'from-orange-500 to-red-400',
  },
];

const TIMELINE_STEPS = [
  {
    title: 'Edge Ingestion',
    description:
      'Headless Java agents capture raw analog scintillation voltages from serial hardware at 100Hz, performing on-device calibration and noise filtering.',
  },
  {
    title: 'Stream Processing',
    description:
      'High-frequency WebSocket streams deliver validated telemetry to the Spring Boot backend, where domain events are routed through a CQRS pipeline.',
  },
  {
    title: 'AI Inference',
    description:
      'Time-series models analyze rolling Cn² windows to detect anomalies, classify turbulence regimes, and forecast seeing conditions.',
  },
  {
    title: 'Alert Dispatch',
    description:
      'Actionable predictions are pushed to operators via webhooks, the dashboard, and integrated observatory control systems in real-time.',
  },
];

// ═══════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const getTerminalLineColor = (type: string, dark: boolean): string => {
  const map: Record<string, [string, string]> = {
    command: ['text-[#F6A83B]', 'text-amber-700'],
    info: ['text-blue-400', 'text-blue-600'],
    success: ['text-emerald-400', 'text-emerald-600'],
    data: ['text-slate-300', 'text-slate-600'],
    divider: ['text-slate-600', 'text-slate-300'],
    warning: ['text-amber-400', 'text-amber-600'],
    ai: ['text-purple-400', 'text-purple-600'],
  };
  const pair = map[type] ?? ['text-slate-400', 'text-slate-500'];
  return dark ? pair[0] : pair[1];
};

const getTimelineIcon = (index: number): ReactNode => {
  const cls = 'w-5 h-5';
  switch (index) {
    case 0: return <Radio className={cls} />;
    case 1: return <Server className={cls} />;
    case 2: return <Brain className={cls} />;
    case 3: return <Globe className={cls} />;
    default: return <Zap className={cls} />;
  }
};

// ─── Hero Terminal ───────────────────────────────────────────

const HeroTerminal = ({ isDark }: { isDark: boolean }) => {
  const [lines, setLines] = useState(0);

  useEffect(() => {
    if (lines < TERMINAL_LINES.length) {
      const t = setTimeout(() => setLines((v) => v + 1), lines === 0 ? 800 : 400);
      return () => clearTimeout(t);
    }
  }, [lines]);

  return (
    <div
      className={`rounded-3xl overflow-hidden backdrop-blur-xl border shadow-2xl ${
        isDark
          ? 'bg-[#000000]/60 border-[#F6A83B]/20 shadow-[#F6A83B]/5'
          : 'bg-white/80 border-slate-200 shadow-slate-300/30'
      }`}
    >
      {/* Title bar */}
      <div
        className={`flex items-center gap-2 px-4 py-3 border-b ${
          isDark ? 'bg-[#000000]/40 border-white/5' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div
          className={`flex items-center gap-1.5 ml-2 text-xs ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-3 h-3" />
          <span>edge-agent-01 — telemetry</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 font-mono text-[13px] leading-6 min-h-[280px]">
        {TERMINAL_LINES.slice(0, lines).map((line, i) => (
          <div
            key={i}
            className={`${getTerminalLineColor(line.type, isDark)} ${
              i === lines - 1 ? 'animate-fadeIn' : ''
            }`}
          >
            {line.text}
          </div>
        ))}
        {lines < TERMINAL_LINES.length && (
          <span
            className={`inline-block w-1.5 h-4 mt-1 rounded-sm animate-pulse ${
              isDark ? 'bg-[#F6A83B]' : 'bg-amber-600'
            }`}
          />
        )}
      </div>
    </div>
  );
};

// ─── Animated Counter ────────────────────────────────────────

const AnimatedCounter = ({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  label,
  isDark,
  icon,
}: {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  isDark: boolean;
  icon?: ReactNode;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          const dur = 2000;
          const t0 = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * end));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);

  const display =
    decimals > 0
      ? (count / Math.pow(10, decimals)).toFixed(decimals)
      : count.toLocaleString();

  return (
    <div ref={ref} className="text-center px-4 py-5">
      {icon && (
        <div
          className={`mb-2 flex justify-center ${
            isDark ? 'text-[#F6A83B]/60' : 'text-amber-500/50'
          }`}
        >
          {icon}
        </div>
      )}
      <div
        className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {prefix}
        {display}
        {suffix}
      </div>
      <div
        className={`text-xs sm:text-sm mt-1.5 font-medium ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {label}
      </div>
    </div>
  );
};

// ─── Feature Card (Architecture Section) ─────────────────────

const FeatureCard = ({
  icon,
  title,
  description,
  isDark,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  isDark: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5 }}
    className={`p-7 rounded-3xl border backdrop-blur-xl transition-all duration-300 group hover:-translate-y-1 ${
      isDark
        ? 'bg-[#000000]/60 border-white/[0.08] hover:border-[#F6A83B]/40 hover:shadow-lg hover:shadow-[#F6A83B]/5 shadow-black/20'
        : 'bg-white/70 border-slate-200 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-100'
    }`}
  >
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
        isDark ? 'bg-[#F6A83B]/10 text-[#F6A83B]' : 'bg-amber-50 text-amber-600'
      }`}
    >
      {icon}
    </div>
    <h3
      className={`text-lg font-semibold mb-2.5 ${
        isDark ? 'text-white' : 'text-slate-900'
      }`}
    >
      {title}
    </h3>
    <p
      className={`text-sm leading-relaxed ${
        isDark ? 'text-slate-400' : 'text-slate-500'
      }`}
    >
      {description}
    </p>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

const HomePage = () => {
  const [isDark, setIsDark] = useState(true);

  // ── Animation Variants ──

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  // ── Render ──

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 ${
        isDark ? 'bg-[#060a14] text-slate-50' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <ParticleBackground isDark={isDark} />

      {/* ═══════════════════════════════════════════════════════
          NAVIGATION
          ═══════════════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          isDark
            ? 'bg-[#060a14]/70 border-white/[0.06]'
            : 'bg-white/70 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Aetheris AI" className="w-8 h-8" />
            <span className="text-lg font-bold tracking-tight">Aetheris AI</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              ['#architecture', 'Architecture'],
              ['#pipeline', 'Pipeline'],
              ['#metrics', 'Metrics'],
              ['#stack', 'Tech Stack'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className={`transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-[#F6A83B]'
                    : 'text-slate-500 hover:text-amber-600'
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark((d) => !d)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-[#000000]/60 border-white/10 hover:bg-white/10 text-slate-400'
                  : 'bg-white/60 border-slate-200 hover:bg-slate-50 text-slate-500'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/dashboard"
              className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-full transition-all border ${
                isDark
                  ? 'text-[#F6A83B] border-[#F6A83B] bg-[#F6A83B]/10 hover:bg-[#F6A83B]/20'
                  : 'text-amber-600 border-amber-400 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          HERO — SPLIT SCREEN
          ═══════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div
                variants={fadeUp}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium mb-8 border ${
                  isDark
                    ? 'bg-[#F6A83B]/10 text-[#F6A83B] border-[#F6A83B]/20'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F6A83B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F6A83B]" />
                </span>
                System Online — All Edge Agents Active
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
              >
                Predictive Intelligence
                <br />
                for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6A83B] via-amber-300 to-orange-400">
                  Optical Telemetry
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className={`text-base sm:text-lg lg:text-xl leading-relaxed mb-10 max-w-xl ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                A distributed edge-to-cloud platform for automated atmospheric
                scintillation monitoring — bridging hardware telemetry, AI-driven
                forecasting, and space weather intelligence into a unified
                architecture.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="bg-[#F6A83B] hover:bg-[#e59a2f] text-black px-7 py-3 rounded-full font-semibold transition-all flex items-center gap-2 group shadow-lg shadow-[#F6A83B]/20"
                >
                  Launch Live Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#architecture"
                  className={`px-7 py-3 rounded-full font-medium transition-all border ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  View Architecture
                </a>
              </motion.div>
            </motion.div>

            {/* Right — Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="animate-float"
            >
              <HeroTerminal isDark={isDark} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIVE METRICS — STATS BAR
          ═══════════════════════════════════════════════════════ */}
      <section id="metrics" className="relative z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl border backdrop-blur-xl grid grid-cols-2 md:grid-cols-4 py-2 ${
              isDark
                ? 'bg-[#000000]/60 border-[#F6A83B]/15 shadow-lg shadow-black/20'
                : 'bg-white/70 border-slate-200'
            }`}
          >
            <AnimatedCounter
              icon={<Shield className="w-5 h-5" />}
              end={9997}
              decimals={2}
              suffix="%"
              label="Platform Uptime"
              isDark={isDark}
            />
            <AnimatedCounter
              icon={<BarChart3 className="w-5 h-5" />}
              end={24}
              decimals={1}
              suffix="M+"
              label="Data Points / Day"
              isDark={isDark}
            />
            <AnimatedCounter
              icon={<Clock className="w-5 h-5" />}
              end={12}
              prefix="< "
              suffix="ms"
              label="Avg Latency"
              isDark={isDark}
            />
            <AnimatedCounter
              icon={<Radio className="w-5 h-5" />}
              end={5}
              label="Edge Nodes Active"
              isDark={isDark}
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ARCHITECTURE CARDS
          ═══════════════════════════════════════════════════════ */}
      <section id="architecture" className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Architecture
            </h2>
            <p
              className={`text-lg ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Decoupled Domain-Driven Design powering real-time inference at the
              edge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            <FeatureCard
              isDark={isDark}
              icon={<Cpu className="w-6 h-6" />}
              title="Java Edge Ingestion"
              description="A lightweight, headless edge agent that interfaces directly with serial hardware to parse and stream analog scintillation voltages in real-time."
            />
            <FeatureCard
              isDark={isDark}
              icon={<Network className="w-6 h-6" />}
              title="Cloud-Native DDD Backend"
              description="A robust Spring Boot microservice environment handling high-frequency WebSocket streams, data validation, and complex workflow routing."
            />
            <FeatureCard
              isDark={isDark}
              icon={<Zap className="w-6 h-6" />}
              title="Predictive AI Engine"
              description="Embedded machine learning models that analyze time-series telemetry to detect anomalies and forecast seeing degradation before it impacts operations."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DATA PIPELINE — TIMELINE
          ═══════════════════════════════════════════════════════ */}
      <section
        id="pipeline"
        className={`relative z-10 py-24 md:py-32 border-y ${
          isDark
            ? 'bg-white/[0.01] border-white/[0.05]'
            : 'bg-slate-100/50 border-slate-200'
        }`}
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Data Pipeline
            </h2>
            <p
              className={`text-lg ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              From raw hardware signals to actionable intelligence in
              milliseconds.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical connector */}
            <div
              className={`absolute left-6 top-0 bottom-0 w-px ${
                isDark
                  ? 'bg-gradient-to-b from-[#F6A83B]/40 via-[#F6A83B]/15 to-transparent'
                  : 'bg-gradient-to-b from-amber-400/30 via-amber-400/10 to-transparent'
              }`}
            />

            <div className="space-y-10">
              {TIMELINE_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <div
                    className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                      isDark
                        ? 'bg-[#F6A83B]/10 text-[#F6A83B] ring-1 ring-[#F6A83B]/20'
                        : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
                    }`}
                  >
                    {getTimelineIcon(i)}
                  </div>
                  <div className="pt-1">
                    <h3
                      className={`text-lg font-semibold mb-1.5 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      <span
                        className={`text-sm font-mono mr-2 ${
                          isDark ? 'text-[#F6A83B]/60' : 'text-amber-500/60'
                        }`}
                      >
                        0{i + 1}
                      </span>
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TECH STACK
          ═══════════════════════════════════════════════════════ */}
      <section id="stack" className="relative z-10 py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Technology Stack
            </h2>
            <p
              className={`text-lg ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Built on battle-tested foundations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {TECH_STACK.map((tech) => (
              <motion.div
                key={tech.name}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`px-5 py-2.5 rounded-full font-medium text-sm border backdrop-blur-md transition-colors cursor-default flex items-center gap-2 ${
                  isDark
                    ? 'bg-[#000000]/60 border-white/[0.08] hover:border-[#F6A83B]/30 text-slate-200'
                    : 'bg-white/80 border-slate-200 hover:border-amber-300 text-slate-700'
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tech.color }}
                />
                {tech.name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════ */}
      <section
        className={`relative z-10 py-24 md:py-32 border-y ${
          isDark
            ? 'bg-white/[0.01] border-white/[0.05]'
            : 'bg-slate-100/50 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Researchers
            </h2>
            <p
              className={`text-lg ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              What the scientific community is saying.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIALS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`p-7 rounded-3xl border backdrop-blur-xl ${
                  isDark
                    ? 'bg-[#000000]/60 border-white/[0.08] shadow-lg shadow-black/20'
                    : 'bg-white/70 border-slate-200'
                }`}
              >
                <p
                  className={`text-sm leading-relaxed mb-6 italic ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <div
                      className={`text-sm font-semibold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </div>
                    <div
                      className={`text-xs ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {item.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CALL TO ACTION
          ═══════════════════════════════════════════════════════ */}
      <section id="cta" className="relative z-10 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center rounded-3xl p-10 md:p-16 bg-gradient-to-br from-[#F6A83B] via-amber-600 to-orange-700 animate-gradient shadow-2xl shadow-[#F6A83B]/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Elevate Your
              <br />
              Observational Intelligence?
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Deploy Aetheris across your observatory network and start
              forecasting atmospheric conditions with AI-powered precision.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login" className="bg-white text-amber-800 hover:bg-amber-50 px-8 py-3.5 rounded-full font-semibold transition-all flex items-center gap-2 group cursor-pointer shadow-lg">
                Launch Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-full font-semibold transition-all flex items-center gap-2 cursor-pointer">
                <ExternalLink className="w-4 h-4" />
                Read the Docs
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer
        className={`relative z-10 border-t py-12 ${
          isDark ? 'border-white/[0.05]' : 'border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="Aetheris AI" className="w-6 h-6" />
              <span className="font-semibold">Aetheris AI</span>
            </div>

            {/* Links */}
            <div
              className={`flex items-center gap-6 text-sm ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              <a
                href="#"
                className="hover:text-[#F6A83B] transition-colors flex items-center gap-1.5"
              >
                <GitBranch className="w-4 h-4" /> GitHub
              </a>
              <a
                href="#"
                className="hover:text-[#F6A83B] transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" /> Docs
              </a>
              <a
                href="#"
                className="hover:text-[#F6A83B] transition-colors flex items-center gap-1.5"
              >
                <Globe className="w-4 h-4" /> API
              </a>
            </div>

            {/* Copyright */}
            <p
              className={`text-sm ${
                isDark ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              © 2026 Aetheris AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;