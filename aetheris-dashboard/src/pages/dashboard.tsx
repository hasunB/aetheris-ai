import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {Eye, Zap, AlertTriangle, Radio, Activity, Sun, Cloud, CloudOff, Microscope, Clock} from 'lucide-react';
import TelemetryChart from '../components/TelemetryChart';
import { useEffect } from 'react';
import SpectrogramChart from '../components/SpectrogramChart';
import ThermalProfileChart from '../components/ThermalProfileChart';

export default function DashboardPage() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();
  const [criticalThreshold, setCriticalThreshold] = useState(2.5);
  const [warningThreshold, setWarningThreshold] = useState(1.1);

  // Atmospheric State Mock
  const [opticalState, setOpticalState] = useState<'clear' | 'cirrus' | 'heavy'>('clear');

  // SNR Mock State
  const [snr, setSnr] = useState(18.4);
  const [snrTrend, setSnrTrend] = useState<'up' | 'down'>('up');

  // r0 Mock State
  const [r0, setR0] = useState(12.5);
  const [r0Trend, setR0Trend] = useState<'up' | 'down'>('up');

  // Seeing Mock State
  const [seeing, setSeeing] = useState(2.4);
  const [seeingMomentum, setSeeingMomentum] = useState(0.0);
  const [avgSeeing15m, setAvgSeeing15m] = useState(2.32);

  // Cycle the states automatically for demonstration of fluid transitions
  useEffect(() => {
    // Optical state cycler
    const cycle = () => {
      setOpticalState(prev => prev === 'clear' ? 'cirrus' : prev === 'cirrus' ? 'heavy' : 'clear');
    };
    const interval = setInterval(cycle, 6000);
    
    // Telemetry drift simulation (runs every 3 seconds to simulate "last 60s" momentum checks)
    const telemetryInterval = setInterval(() => {
      // SNR Logic
      setSnr(prev => {
        const drift = (Math.random() - 0.5) * 3.5; 
        let next = prev + drift;
        if (next > 24) next = 24;
        if (next < 8) next = 8;
        
        setSnrTrend(next >= prev ? 'up' : 'down');
        return next;
      });

      // Seeing Logic
      setSeeing(prev => {
        const drift = (Math.random() - 0.4) * 0.5; // slight upward bias
        let next = prev + drift;
        if (next > 6) next = 6;
        if (next < 0.5) next = 0.5;
        
        setSeeingMomentum(next - prev);
        return next;
      });

      setAvgSeeing15m(prev => {
        return prev + (Math.random() - 0.5) * 0.05;
      });

      // r0 Logic
      setR0(prev => {
        const drift = (Math.random() - 0.5) * 2.5; 
        let next = prev + drift;
        if (next > 18) next = 18;
        if (next < 4) next = 4;
        
        setR0Trend(next >= prev ? 'up' : 'down');
        return next;
      });
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(telemetryInterval);
    };
  }, []);

  // ── Animation Variants ──
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const getSnrStatus = (val: number) => {
    if (val >= 15) return 'green';
    if (val >= 10) return 'amber';
    return 'red';
  };
  const snrStatus = getSnrStatus(snr);

  const snrColorMap = {
    green: { color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    amber: { color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
    red: { color: 'text-red-500', bg: isDark ? 'bg-red-500/10' : 'bg-red-50' },
  };

  const currentSnrStyle = snrColorMap[snrStatus];

  // r0 Status Logic
  const getR0Status = (val: number) => {
    if (val >= 15) return 'green';
    if (val <= 5) return 'red';
    return 'amber';
  };
  const r0Status = getR0Status(r0);
  const r0Label = r0 >= 15 ? 'Excellent / AO Optimal' : (r0 <= 5 ? 'Severe Distortion' : 'Nominal Phase');

  const r0ColorMap = {
    green: { color: 'text-emerald-500', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    amber: { color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
    red: { color: 'text-red-500', bg: isDark ? 'bg-red-500/10' : 'bg-red-50' },
  };

  const currentR0Style = r0ColorMap[r0Status];

  // Momentum Status Logic
  const getMomentumIcon = (momentum: number) => {
    if (momentum > 0.2) return '↑'; // rapid collapse
    if (momentum > 0.05) return '↗'; // degrading slightly
    if (momentum < -0.05) return '↘'; // improving
    return '→'; // stable
  };
  const getMomentumColor = (momentum: number) => {
    if (momentum > 0.2) return 'text-red-500';
    if (momentum > 0.05) return 'text-amber-500';
    return 'text-emerald-500';
  };
  const momentumArrow = getMomentumIcon(seeingMomentum);
  const momentumColor = getMomentumColor(seeingMomentum);

  // Domain-specific stats for Aetheris
  const stats = [
    { label: 'Current Seeing', value: `${seeing.toFixed(1)}″`, change: seeingMomentum >= 0 ? `+${seeingMomentum.toFixed(1)}″` : `${seeingMomentum.toFixed(1)}″`, changeColor: seeingMomentum > 0.2 ? 'red' : 'amber', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { 
      label: 'Phase Distortion (r₀)', 
      value: `${r0.toFixed(1)} cm`, 
      change: r0Trend === 'up' ? `↗ ${r0Label}` : `↘ ${r0Label}`, 
      changeColor: r0Status === 'green' ? 'emerald' : r0Status === 'red' ? 'red' : 'amber', 
      icon: Activity, 
      color: currentR0Style.color, 
      bg: currentR0Style.bg,
      dynamicBorder: r0Status === 'red' ? (isDark ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse') : ''
    },
    { label: 'Input Voltage', value: '12.1V', change: 'Stable', changeColor: 'emerald', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Temperature', value: '20.5°C', change: '+1°C', changeColor: 'amber', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { 
      label: 'Optical Link SNR', 
      value: `${snr.toFixed(1)} dB`, 
      change: snrTrend === 'up' ? '↗ Improving' : '↘ Degraded', 
      changeColor: snrTrend === 'up' ? 'emerald' : 'red', 
      icon: Radio, 
      color: currentSnrStyle.color, 
      bg: currentSnrStyle.bg,
      dynamicBorder: snrStatus === 'red' ? (isDark ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]') : ''
    },
    { 
      label: 'Avg Seeing (15m)', 
      value: `${avgSeeing15m.toFixed(2)}″`, 
      change: 'Nominal', 
      changeColor: 'emerald', 
      icon: Clock, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-400/10' 
    },
    { 
      label: 'Rate of Degradation', 
      value: (
        <div className="flex items-center gap-2">
          <span className={seeing < 3.0 ? 'text-emerald-500' : 'text-amber-500'}>{seeing.toFixed(1)}</span>
          <span className={momentumColor}>{momentumArrow}</span>
        </div>
      ), 
      change: seeingMomentum > 0.2 ? 'Critical Collapse' : seeingMomentum > 0.05 ? 'Degrading' : 'Stable', 
      changeColor: seeingMomentum > 0.2 ? 'red' : seeingMomentum > 0.05 ? 'amber' : 'emerald', 
      icon: Activity, 
      color: 'text-slate-400', 
      bg: isDark ? 'bg-slate-400/10' : 'bg-slate-50',
      dynamicBorder: seeingMomentum > 0.2 ? (isDark ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse') : ''
    },
  ];

  const card = `rounded-3xl backdrop-blur-xl ${isDark ? 'bg-[#000000]/60 shadow-black/20' : 'bg-white/80 shadow-slate-200/50'}`;

  // State Config for the Atmospheric Widget
  const opticalConfig = {
    clear: {
      icon: Sun,
      label: 'Clear',
      desc: 'Active, clean telemetry',
      bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-200',
      text: 'text-emerald-500',
      pulse: 'bg-emerald-500',
    },
    cirrus: {
      icon: Cloud,
      label: 'Partial Obscuration',
      desc: 'Cirrus cloud passage detected',
      bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDark ? 'border-amber-500/20' : 'border-amber-200',
      text: 'text-amber-500',
      pulse: 'bg-amber-500',
    },
    heavy: {
      icon: CloudOff,
      label: 'Signal Lost',
      desc: 'Hardware blind / Heavy Obscuration',
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      border: isDark ? 'border-red-500/20' : 'border-red-200',
      text: 'text-red-500',
      pulse: 'bg-red-500',
    },
  };

  const currentOptical = opticalConfig[opticalState];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* Stats Grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Dynamic Atmospheric State Widget */}
        <motion.div 
          layout
          className={`relative p-5 rounded-3xl backdrop-blur-xl shadow-lg flex flex-col justify-between ${isDark ? 'bg-[#000000]/60 shadow-black/20' : 'bg-white/80 shadow-slate-200/50'} ${currentOptical.border} duration-700`}
        >
          <div className="absolute top-5 left-5 w-10 h-10">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute inset-0 rounded-full ${currentOptical.pulse}`}
            />
          </div>
          
          <div className="relative z-10 flex justify-between items-start mb-3">
             <div className={`p-2.5 rounded-2xl ${currentOptical.bg} ${currentOptical.text} border ${currentOptical.border}`}>
                <motion.div
                  key={opticalState}
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <currentOptical.icon className="w-5 h-5" />
                </motion.div>
             </div>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${currentOptical.text} ${currentOptical.bg} uppercase tracking-widest`}>
                Live
             </span>
          </div>

          <div className="relative z-10">
             <h3 className={`text-xs font-medium mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Optical Path
             </h3>
             <motion.div
                key={currentOptical.label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className={`text-xl font-bold leading-tight ${currentOptical.text}`}>
                  {currentOptical.label}
                </div>
              </motion.div>
          </div>
        </motion.div>

        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`relative p-5 rounded-3xl backdrop-blur-xl shadow-lg ${isDark ? 'bg-[#000000]/60 shadow-black/20' : 'bg-white/80 shadow-slate-200/50'} ${stat.dynamicBorder}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color} transition-colors duration-500`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors duration-500 ${
                stat.changeColor === 'emerald' ? 'text-emerald-500 bg-emerald-500/10' : 
                stat.changeColor === 'red' ? 'text-red-500 bg-red-500/10' : 
                stat.changeColor === 'amber' ? 'text-amber-500 bg-amber-500/10' : 
                'text-blue-500 bg-blue-500/10'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className={`text-xs font-medium mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {stat.label}
            </h3>
            <p className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${stat.label === 'Optical Link SNR' ? stat.color : ''}`}>
              {stat.value}
            </p>
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

      {/* Embedded Spectrogram below the time-series chart */}
      <motion.div variants={fadeUp} className="w-full mb-6">
        {/* Chart — full-width telemetry stream */}
        <div className={`p-6 ${card} h-auto w-full`}>
          <SpectrogramChart isDark={isDark} />
        </div>
      </motion.div>

      {/* ═══ Advanced Diagnostics ═══ */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className={`p-6 ${card} flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
             <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Microscope className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-base font-bold">Advanced Diagnostics</h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deep-tech sensor analysis</p>
             </div>
          </div>
          <ThermalProfileChart isDark={isDark} />
        </div>
      </motion.div>
    </motion.div>
  );
}