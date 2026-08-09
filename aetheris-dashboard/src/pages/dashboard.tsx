import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  Eye,
  Zap,
  Thermometer,
  Clock,
  AlertTriangle,
  CloudRain,
  Radio,
  HardDrive,
  BellRing,
  SlidersHorizontal,
  Download,
  Mail,
  MonitorSpeaker,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import TelemetryChart from '../components/TelemetryChart';

export default function DashboardPage() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();
  const [criticalThreshold, setCriticalThreshold] = useState(1.5);
  const [warningThreshold, setWarningThreshold] = useState(1.1);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [dashboardAlerts, setDashboardAlerts] = useState(true);

  // ── Animation Variants ──
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  // Domain-specific stats for Aetheris
  const stats = [
    { label: 'Current Seeing', value: '2.4″', change: '+0.3″', up: true, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Input Voltage', value: '12.1V', change: 'Stable', up: false, icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Ambient Temp', value: '14.2°C', change: '-1.8°C', up: false, icon: Thermometer, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Anomalies (24h)', value: '7', change: '3 unresolved', up: true, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  // Sample anomaly feed
  const anomalies = [
    { type: 'critical' as const, title: 'Hardware Noise Spike', desc: 'Irregular high-frequency spike detected on seeing sensor. Isolated from genuine ionospheric scintillation data via spectral analysis.', time: 'Just now', icon: Radio },
    { type: 'warning' as const, title: 'Sudden Cloud Cover', desc: 'Seeing degraded from 1.8″ to 4.2″ in 30s. AI classifier flagged as non-ionospheric environmental anomaly (cloud passage).', time: '12 min ago', icon: CloudRain },
    { type: 'warning' as const, title: 'Scintillation Burst', desc: 'Short-duration ionospheric event detected. S4 index peaked at 0.72. Data tagged as genuine scintillation for archival.', time: '38 min ago', icon: Activity },
    { type: 'info' as const, title: 'System Stabilized', desc: 'Input voltage returned to nominal 12.1V after brief 11.6V dip. No data corruption detected.', time: '1h ago', icon: CheckCircle2 },
  ];

  // Sample historical archive rows
  const archiveRows = [
    { time: '2026-08-07 19:30:12', metric: 'Seeing', raw: '2.41″', processed: '2.38″', flag: 'Normal', synced: true },
    { time: '2026-08-07 19:29:48', metric: 'Seeing', raw: '6.12″', processed: '—', flag: 'Anomaly', synced: true },
    { time: '2026-08-07 19:29:30', metric: 'Input Volts', raw: '12.08V', processed: '12.08V', flag: 'Normal', synced: true },
    { time: '2026-08-07 19:29:12', metric: 'Temperature', raw: '14.2°C', processed: '14.2°C', flag: 'Normal', synced: true },
    { time: '2026-08-07 19:28:48', metric: 'Seeing', raw: '1.92″', processed: '1.90″', flag: 'Normal', synced: true },
    { time: '2026-08-07 19:28:30', metric: 'Input Volts', raw: '11.62V', processed: '11.62V', flag: 'Warning', synced: true },
    { time: '2026-08-07 19:28:12', metric: 'Seeing', raw: '5.81″', processed: '—', flag: 'Anomaly', synced: false },
  ];

  const card = `rounded-3xl border backdrop-blur-xl ${isDark ? 'bg-[#0a1628]/80 border-white/10' : 'bg-white/80 border-slate-200'}`;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          Observational Intelligence
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Real-time optical seeing telemetry, AI predictions, and automated anomaly detection.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`relative p-5 ${card} transition-transform hover:-translate-y-1 shadow-lg ${isDark ? 'shadow-black/20' : 'shadow-slate-200/50'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${stat.up ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className={`text-xs font-medium mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stat.label}
            </h3>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* ═══ Interactive Dashboard Visualization ═══ */}
      <motion.div variants={fadeUp} className="w-full mb-6">
        {/* Chart — full-width telemetry stream */}
        <div className={`p-6 ${card} h-[600px] w-full`}>
          <TelemetryChart isDark={isDark} criticalThreshold={criticalThreshold} warningThreshold={warningThreshold} />
        </div>
      </motion.div>

      {/* ═══ Anomaly Detection + Alerting + Archiving ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Automated Anomaly Detection Feed */}
        <div className={`p-6 ${card} max-h-[450px] flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Anomaly Detection</h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Real-time stream evaluation</p>
              </div>
            </div>
            <span className="text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg animate-pulse">LIVE</span>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
            {anomalies.map((a, i) => {
              const colorMap = {
                critical: { bg: isDark ? 'bg-red-500/8 border-red-500/20' : 'bg-red-50 border-red-100', text: 'text-red-500', dot: 'bg-red-500' },
                warning: { bg: isDark ? 'bg-amber-500/8 border-amber-500/20' : 'bg-amber-50 border-amber-100', text: 'text-amber-500', dot: 'bg-amber-500' },
                info: { bg: isDark ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100', text: 'text-emerald-500', dot: 'bg-emerald-500' },
              };
              const c = colorMap[a.type];
              return (
                <div key={i} className={`p-3.5 rounded-2xl border transition-colors ${c.bg}`}>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    {a.type === 'critical' && <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />}
                    <a.icon className={`w-3.5 h-3.5 ${c.text}`} />
                    <span className={`text-xs font-bold ${c.text}`}>{a.title}</span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {a.desc}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-medium text-slate-500">{a.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligent Alerting System */}
        <div className={`p-6 ${card} flex flex-col`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Intelligent Alerting</h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Configure thresholds & notification channels</p>
              </div>
            </div>
            <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
              <BellRing className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {/* Critical threshold */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold">Critical Seeing Threshold</label>
                <span className="text-sm font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                  {criticalThreshold.toFixed(1)}″
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full accent-red-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-500">0.5″</span>
                <span className="text-[10px] text-slate-500">5.0″</span>
              </div>
            </div>

            {/* Warning threshold */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold">Warning Seeing Threshold</label>
                <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  {warningThreshold.toFixed(1)}″
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-500">0.5″</span>
                <span className="text-[10px] text-slate-500">5.0″</span>
              </div>
            </div>

            {/* Notification channel toggles */}
            <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-sm font-bold block">Email Notifications</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Trigger on current or AI-predicted breaches</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} className="sr-only peer" />
                  <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${emailAlerts ? 'bg-blue-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MonitorSpeaker className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-sm font-bold block">Dashboard UI Alerts</span>
                    <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Pop-up alerts when critical changes occur</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={dashboardAlerts} onChange={() => setDashboardAlerts(!dashboardAlerts)} className="sr-only peer" />
                  <div className={`w-10 h-5 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${dashboardAlerts ? 'bg-blue-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Anomaly Detection + Alerting + Archiving ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6">
        {/* Historical Data Archiving */}
        <div className={`p-6 ${card} flex flex-col`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Data Archives</h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Raw & processed telemetry • time-series optimized</p>
              </div>
            </div>
            <button className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}`}>
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <tr className={isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}>
                  <th className="px-3 py-2.5 rounded-l-xl">Timestamp</th>
                  <th className="px-3 py-2.5">Metric</th>
                  <th className="px-3 py-2.5">Raw</th>
                  <th className="px-3 py-2.5">Processed</th>
                  <th className="px-3 py-2.5">Flag</th>
                  <th className="px-3 py-2.5 rounded-r-xl">DB</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {archiveRows.map((row, i) => (
                  <tr key={i} className={`transition-colors text-xs ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'}`}>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono text-slate-500">{row.time}</td>
                    <td className="px-3 py-2.5 font-bold">{row.metric}</td>
                    <td className="px-3 py-2.5 font-mono">{row.raw}</td>
                    <td className={`px-3 py-2.5 font-mono ${row.processed === '—' ? 'text-slate-500' : ''}`}>{row.processed}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${row.flag === 'Anomaly'
                          ? isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'
                          : row.flag === 'Warning'
                            ? isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-600 border border-amber-200'
                            : isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                        {row.flag}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {row.synced
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        : <XCircle className="w-4 h-4 text-red-500" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}