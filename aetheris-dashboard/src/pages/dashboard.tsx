import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {Eye, Zap, AlertTriangle, Radio, Activity, Sun, Cloud, CloudOff, Microscope, Clock} from 'lucide-react';
import TelemetryChart from '../components/TelemetryChart';
import SpectrogramChart from '../components/SpectrogramChart';
import DiagnosticMetricChart from '../components/DiagnosticMetricChart';
import { useSensorSocket } from '../sockets/useSensorSocket';

/** Shape of JSON payloads from the sensor WebSocket topics */
interface SensorPayload {
  value: string;
  windowSize?: number;
}

export default function DashboardPage() {
  const { isDark } = useOutletContext<{ isDark: boolean }>();

  // ── Real WebSocket data (including pre-computed trends) ──
  const {
    inputValue, snr: wsSnr, seeingValue: wsSeeingValue,
    avgSeeing: wsAvgSeeing, friedParam: wsFriedParam, rateOfDeg: wsRateOfDeg,
    snrTrend, r0Trend, seeingMomentum, temp: wsTemp,
    predictedInput, predictedSeeing, predictedTemp,
    turbulenceSpectrum, turbulenceType, dominantFrequency
  } = useSensorSocket();

  const [criticalThreshold] = useState(2.5);
  const [warningThreshold] = useState(1.1);

  // ── Helper to extract a numeric value from WS payload ──
  const extract = (raw: unknown, fallback: number): number => {
    if (raw == null) return fallback;
    if (typeof raw === 'object' && !Array.isArray(raw)) return parseFloat((raw as SensorPayload).value);
    if (Array.isArray(raw) && raw.length > 0) return Number(raw[raw.length - 1]);
    return Number(raw);
  };

  // ── Helper to extract prediction arrays ──
  const extractArray = (raw: unknown): number[] | undefined => {
    if (Array.isArray(raw)) return raw.map(Number);
    return undefined;
  };

  // ── Extract live values with fallback defaults ──
  const snr   = extract(wsSnr, 18.4);
  const seeing = extract(wsSeeingValue, 2.4);
  const r0    = extract(wsFriedParam, 12.5);
  const avgSeeing15m   = extract(wsAvgSeeing, 2.32);
  const rateOfDegValue = extract(wsRateOfDeg, 0.0);
  const inputVoltage   = extract(inputValue, 12.1);
  const temperature    = extract(wsTemp, 20.5);

  const predInputArray  = extractArray(predictedInput);
  const predSeeingArray = extractArray(predictedSeeing);
  const predTempArray   = extractArray(predictedTemp);

  const predInputFinal  = predInputArray ? predInputArray[predInputArray.length - 1] : undefined;
  const predSeeingFinal = predSeeingArray ? predSeeingArray[predSeeingArray.length - 1] : undefined;
  const predTempFinal   = predTempArray ? predTempArray[predTempArray.length - 1] : undefined;

  // ── Derive optical state from live SNR ──
  const opticalState: 'clear' | 'cirrus' | 'heavy' =
    snr >= 15 ? 'clear' : snr >= 10 ? 'cirrus' : 'heavy';

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
    { label: 'Current Seeing', value: `${seeing.toFixed(1)}″`, change: predSeeingFinal !== undefined ? `Pred: ${predSeeingFinal.toFixed(1)}″` : (seeingMomentum >= 0 ? `+${seeingMomentum.toFixed(1)}″` : `${seeingMomentum.toFixed(1)}″`), changeColor: seeingMomentum > 0.2 ? 'red' : 'amber', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { 
      label: 'Phase Distortion (r₀)', 
      value: `${r0.toFixed(1)} cm`, 
      change: r0Trend === 'up' ? `↗ ${r0Label}` : `↘ ${r0Label}`, 
      changeColor: r0Status === 'green' ? 'emerald' : r0Status === 'red' ? 'red' : 'amber', 
      icon: Activity, 
      color: currentR0Style.color, 
      bg: currentR0Style.bg,
      dynamicBorder: r0Status === 'red' ? (isDark ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]') : ''
    },
    { label: 'Input Voltage', value: `${inputVoltage.toFixed(1)}V`, change: predInputFinal !== undefined ? `Pred: ${predInputFinal.toFixed(1)}V` : (inputVoltage >= 11.5 ? 'Stable' : 'Low'), changeColor: inputVoltage >= 11.5 ? 'emerald' : 'red', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Temperature', value: `${temperature.toFixed(1)}°C`, change: predTempFinal !== undefined ? `Pred: ${predTempFinal.toFixed(1)}°C` : '+1°C', changeColor: 'amber', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
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
          <span className={rateOfDegValue < 0.2 ? 'text-emerald-500' : 'text-amber-500'}>{rateOfDegValue.toFixed(2)}</span>
          <span className={momentumColor}>{momentumArrow}</span>
        </div>
      ), 
      change: rateOfDegValue > 0.5 ? 'Critical Collapse' : rateOfDegValue > 0.2 ? 'Degrading' : 'Stable', 
      changeColor: rateOfDegValue > 0.5 ? 'red' : rateOfDegValue > 0.2 ? 'amber' : 'emerald', 
      icon: Activity, 
      color: 'text-slate-400', 
      bg: isDark ? 'bg-slate-400/10' : 'bg-slate-50',
      dynamicBorder: rateOfDegValue > 0.5 ? (isDark ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : 'border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse') : ''
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
          <TelemetryChart 
            isDark={isDark} 
            criticalThreshold={criticalThreshold} 
            warningThreshold={warningThreshold}
            liveSeeing={wsSeeingValue != null ? seeing : undefined}
            liveVolts={inputValue != null ? inputVoltage : undefined}
            liveTemp={wsTemp != null ? temperature : undefined}
            predSeeing={predSeeingArray}
            predVolts={predInputArray}
            predTemp={predTempArray}
          />
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
                <h2 className="text-base font-bold">Temperature Profiling</h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Thermal sensor analysis</p>
             </div>
          </div>
          <DiagnosticMetricChart isDark={isDark} metric="Temperature" liveValue={temperature} />
        </div>
        <div className={`p-6 ${card} flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
             <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <Zap className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-base font-bold">Voltage Profiling</h2>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Power delivery analysis</p>
             </div>
          </div>
          <DiagnosticMetricChart isDark={isDark} metric="Voltage" liveValue={inputVoltage} />
        </div>
      </motion.div>

      {/* Embedded Spectrogram below the time-series chart */}
      <motion.div variants={fadeUp} className="w-full mb-6">
        {/* Chart — full-width telemetry stream */}
        <div className={`p-6 ${card} h-auto w-full`}>
          <SpectrogramChart 
            isDark={isDark} 
            turbulenceSpectrum={turbulenceSpectrum}
            turbulenceType={turbulenceType}
            dominantFrequency={dominantFrequency}
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="w-full mb-6">
        <div className={`p-6 ${card} flex flex-col md:flex-row items-center justify-between group hover:shadow-indigo-500/10 transition-all duration-500 mb-15`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600'} group-hover:scale-110 transition-transform duration-500`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-slate-200 to-slate-400' : 'from-slate-700 to-slate-500'}`}>
                Developed by Hasun Akash Bandara
              </h2>
              <p className={`text-xs mt-0.5 font-medium flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Aetheris-AI Dashboard Architecture</span>
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                <span>v2.0.0</span>
              </p>
            </div>
          </div>
          
          <a 
            href="https://github.com/hasunB/aetheris-ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/10' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub Project
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}