import { useState, useMemo, useEffect, memo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  ComposedChart,
  Area,
  ReferenceArea,
  Label
} from 'recharts';

type MetricType = 'Seeing' | 'Volts' | 'Temperature';

interface ChartProps {
  isDark: boolean;
  criticalThreshold: number;
  warningThreshold: number;
  liveSeeing?: number;
  liveVolts?: number;
  liveTemp?: number;
  predSeeing?: number;
  predVolts?: number;
  predTemp?: number;
}

const metrics: { id: MetricType; label: string; unit: string; yLabel: string }[] = [
  { id: 'Seeing', label: 'Seeing in ArcSec', unit: '″', yLabel: 'Seeing (arcsec)' },
  { id: 'Volts', label: 'Input Volts', unit: 'V', yLabel: 'Voltage (V)' },
  { id: 'Temperature', label: 'Temperature', unit: '°C', yLabel: 'Temp (°C)' },
];

// Deterministic PRNG to keep useMemo pure
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const cloudBands = [
  { start: 14, end: 22, type: 'cirrus', label: 'Cirrus Cloud Passage detected: 14:14 - 14:22' },
  { start: 38, end: 46, type: 'heavy', label: 'Heavy Obscuration detected: 14:38 - 14:46' }
];

const CloudIcon = ({ viewBox, type, label }: any) => {
  const { x, width } = viewBox;
  return (
    <g transform={`translate(${x + width / 2 - 12}, 15)`} style={{ cursor: 'pointer' }}>
      <title>{label}</title>
      <svg width="24" height="24" viewBox="0 0 24 24" fill={type === 'heavy' ? '#ef444440' : '#f59e0b40'} stroke={type === 'heavy' ? '#ef4444' : '#f59e0b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    </g>
  );
};

// Custom dot renderer for anomaly markers
const AnomalyDot = (props: any) => {
  const { cx, cy, payload, value } = props;
  if (value == null) return null;

  if (payload?.anomaly) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill="none" stroke="#ef4444" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={3} fill="#ef4444" />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={2.5} fill="#F6A83B" strokeWidth={0} />;
};

const WINDOW_SIZE = 60;
const PRED_POINTS = 30;

/** Build synthetic demo data (original behavior when no WebSocket is connected) */
function buildSyntheticData(metric: MetricType) {
  const arr: Record<string, unknown>[] = [];
  const seedOffset = metric === 'Seeing' ? 0 : metric === 'Volts' ? 100 : 200;
  let lastVal = metric === 'Seeing' ? 3.5 : metric === 'Volts' ? 12.0 : 15.0;
  const anomalyPoints = new Set([7, 18, 27, 42, 55]);

  for (let i = 0; i <= 60; i++) {
    const rand = pseudoRandom(i + seedOffset);
    const band = cloudBands.find(b => i >= b.start && i <= b.end);
    const isObscured = !!band;
    const isBoundary = cloudBands.some(b => i === b.start || i === b.end);

    if (metric === 'Seeing') {
      if (isObscured) lastVal = Math.min(6.8, lastVal + 2.0 + rand * 2.0);
      else if (anomalyPoints.has(i)) lastVal = Math.min(6.8, lastVal + 2.5 + rand * 1.5);
      else lastVal = Math.max(0.5, Math.min(6.8, lastVal + (rand - 0.5) * 3.2));
    } else if (metric === 'Volts') {
      if (isObscured && band?.type === 'heavy') lastVal = Math.max(0, lastVal - 1.5 - rand * 0.5);
      else if (i === 22 || i === 48) lastVal = Math.max(11.2, lastVal - 0.4);
      else { if (lastVal < 11.5) lastVal += 1.0 + rand * 0.5; lastVal = Math.max(11.5, Math.min(12.5, lastVal + (rand - 0.5) * 0.15)); }
    } else {
      lastVal = Math.max(-5, Math.min(35, lastVal + (rand - 0.5) * 1.8));
    }

    const isAnomaly = metric === 'Seeing' ? anomalyPoints.has(i) && !isObscured : metric === 'Volts' ? (i === 22 || i === 48) : false;
    const finalVal = Number(lastVal.toFixed(2));

    arr.push({
      time: i, actual: finalVal,
      actualValid: (!isObscured || isBoundary) ? finalVal : null,
      actualObscured: isObscured ? finalVal : null,
      predicted: i === 60 ? finalVal : null,
      anomaly: isAnomaly,
      anomalyLabel: isAnomaly ? (metric === 'Seeing' ? 'HW Noise' : 'Voltage Dip') : band ? band.label : null,
      isObscured,
    });
  }

  let predVal = lastVal;
  for (let i = 61; i <= 90; i++) {
    const rand = pseudoRandom(i + seedOffset + 1000);
    if (metric === 'Seeing') predVal = Math.max(0.5, predVal + (rand - 0.48) * 1.8);
    else if (metric === 'Volts') predVal = Math.max(11.5, Math.min(12.5, predVal + (rand - 0.5) * 0.08));
    else predVal += (rand - 0.5) * 1.2;
    arr.push({ time: i, actual: null, actualValid: null, actualObscured: null, predicted: Number(predVal.toFixed(2)), anomaly: false, anomalyLabel: null, isObscured: false });
  }
  return arr;
}

function TelemetryChart({ isDark, criticalThreshold, warningThreshold, liveSeeing, liveVolts, liveTemp, predSeeing, predVolts, predTemp }: ChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('Seeing');

  // ── Sliding-window buffers for real-time streaming (state-based for React compliance) ──
  const [seeingBuf, setSeeingBuf] = useState<number[]>([]);
  const [voltsBuf, setVoltsBuf] = useState<number[]>([]);
  const [tempBuf, setTempBuf] = useState<number[]>([]);

  // Syncing external WebSocket data into React state — intentional setState in useEffect
  useEffect(() => {
    if (liveSeeing == null) return;
    setSeeingBuf(prev => {
      const next = [...prev, liveSeeing];
      return next.length > WINDOW_SIZE ? next.slice(-WINDOW_SIZE) : next;
    });
  }, [liveSeeing]);

  useEffect(() => {
    if (liveVolts == null) return;
    setVoltsBuf(prev => {
      const next = [...prev, liveVolts];
      return next.length > WINDOW_SIZE ? next.slice(-WINDOW_SIZE) : next;
    });
  }, [liveVolts]);

  useEffect(() => {
    if (liveTemp == null) return;
    setTempBuf(prev => {
      const next = [...prev, liveTemp];
      return next.length > WINDOW_SIZE ? next.slice(-WINDOW_SIZE) : next;
    });
  }, [liveTemp]);

  const activeBuffer = selectedMetric === 'Seeing' ? seeingBuf
    : selectedMetric === 'Volts' ? voltsBuf : tempBuf;
  const isLive = activeBuffer.length > 0;

  // ── Build chart data (synthetic fallback OR live stream) ──
  const data = useMemo(() => {
    if (!isLive) return buildSyntheticData(selectedMetric);

    // Live streaming mode: chart from accumulated buffer
    const buf = activeBuffer;
    const totalLive = buf.length;
    const arr: Record<string, unknown>[] = [];

    for (let i = 0; i < totalLive; i++) {
      const val = Number(buf[i].toFixed(2));
      arr.push({
        time: i,
        actual: val,
        actualValid: val,
        actualObscured: null,
        predicted: i === totalLive - 1 ? val : null, // bridge to prediction
        anomaly: false,
        anomalyLabel: null,
        isObscured: false,
      });
    }

    // Prediction overlay
    const lastVal = buf[totalLive - 1];
    const tPred = selectedMetric === 'Seeing' ? predSeeing
      : selectedMetric === 'Volts' ? predVolts : predTemp;

    for (let i = 1; i <= PRED_POINTS; i++) {
      const rand = pseudoRandom(i + 5000);
      let pv: number;
      if (tPred != null) {
        pv = lastVal + (tPred - lastVal) * (i / PRED_POINTS) + (rand - 0.5) * 0.15;
      } else {
        // Gentle random walk from last value
        const scale = selectedMetric === 'Volts' ? 0.02 : 0.15;
        pv = lastVal + (rand - 0.5) * scale * i;
      }
      arr.push({
        time: totalLive - 1 + i,
        actual: null,
        actualValid: null,
        actualObscured: null,
        predicted: Number(pv.toFixed(2)),
        anomaly: false,
        anomalyLabel: null,
        isObscured: false,
      });
    }

    return arr;
  }, [selectedMetric, activeBuffer, isLive, predSeeing, predVolts, predTemp]);

  // Dynamic boundaries for prediction zone
  const predStart = isLive ? activeBuffer.length - 1 : 60;
  const predEnd = isLive ? activeBuffer.length - 1 + PRED_POINTS : 90;

  const activeMetric = metrics.find(m => m.id === selectedMetric)!;
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  const predictionZoneBg = isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.08)';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Interactive Telemetry Stream
          </h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Live data with 30-minute AI forecast • anomalies auto-flagged
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          {metrics.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedMetric === m.id
                ? isDark
                  ? 'bg-[#F6A83B]/15 text-[#F6A83B] border border-[#F6A83B]/25 shadow-sm'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200 border border-transparent'
                  : 'text-slate-500 hover:text-slate-700 border border-transparent'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F6A83B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F6A83B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            {/* AI Prediction zone background */}
            <ReferenceArea x1={predStart} x2={predEnd} fill={predictionZoneBg} />

            {/* Cloud Cover Bands (synthetic mode only) */}
            {!isLive && cloudBands.map((band, idx) => (
              <ReferenceArea
                key={idx}
                x1={band.start}
                x2={band.end}
                fill={band.type === 'heavy'
                  ? (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)')
                  : (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)')}
              >
                <Label content={<CloudIcon type={band.type} label={band.label} />} />
              </ReferenceArea>
            ))}

            <XAxis
              dataKey="time"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              minTickGap={8}
              label={{ value: isLive ? 'Time (ticks)' : 'Time (minutes)', position: 'insideBottomRight', offset: -5, fill: textColor, fontSize: 10 }}
            />
            <YAxis
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              label={{ value: activeMetric.yLabel, angle: -90, position: 'insideLeft', offset: 15, fill: textColor, fontSize: 10 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0a0e1a' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '12px',
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.08)',
                padding: '10px 14px',
                fontSize: '12px',
                whiteSpace: 'pre-line' // Allow newlines in the label text
              }}
              formatter={(value: any, name: any) => {
                if (name === 'Live Stream' || name === 'Obscured Stream') {
                  name = 'Telemetry';
                }
                return [`${value ?? ''} ${activeMetric.unit}`, name];
              }}
              labelFormatter={(label) => {
                const point = data.find((d: Record<string, unknown>) => d.time === label);
                let text = `Time: ${label ?? ''}${isLive ? 's' : 'm'}`;
                if (point?.isObscured) text += `\n☁️ ${point.anomalyLabel}`;
                else if (point?.anomaly) text += ` \n⚠️ ${point.anomalyLabel}`;
                if (typeof label === 'number' && label > predStart) text += '\n🔮 AI Predicted';
                return text;
              }}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value: string) => {
                if (value === 'Obscured Stream') return null; // Hide from legend
                return <span style={{ color: textColor }}>{value}</span>;
              }}
            />

            {/* Threshold reference lines for Seeing */}
            {selectedMetric === 'Seeing' && (
              <>
                <ReferenceLine
                  y={criticalThreshold}
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  label={{ position: 'insideTopRight', value: `Critical (${criticalThreshold})`, fill: '#ef4444', fontSize: 10 }}
                />
                <ReferenceLine
                  y={warningThreshold}
                  stroke="#eab308"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  label={{ position: 'insideTopRight', value: `Warning (${warningThreshold})`, fill: '#eab308', fontSize: 10 }}
                />
              </>
            )}

            {/* Prediction zone separator */}
            <ReferenceLine
              x={predStart}
              stroke={isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)'}
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ position: 'top', value: isLive ? '🔮 AI Forecast' : 'AI Forecast', fill: '#8b5cf6', fontSize: 10, offset: -5 }}
            />

            {/* Historical area fill */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#actualGradient)"
              legendType="none"
            />

            {/* Historical line (Valid) */}
            <Line
              type="monotone"
              name="Live Stream"
              dataKey="actualValid"
              stroke="#F6A83B"
              strokeWidth={2}
              dot={<AnomalyDot />}
              activeDot={{ r: 5, stroke: '#F6A83B', strokeWidth: 2, fill: isDark ? '#0a0e1a' : '#ffffff' }}
              connectNulls={false}
            />

            {/* Historical line (Obscured - Ghost Line) */}
            <Line
              type="monotone"
              name="Obscured Stream"
              dataKey="actualObscured"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5, stroke: isDark ? '#64748b' : '#94a3b8', strokeWidth: 2, fill: isDark ? '#0a0e1a' : '#ffffff' }}
              connectNulls={false}
            />

            {/* AI Prediction line */}
            <Line
              type="monotone"
              name="AI Prediction (30m)"
              dataKey="predicted"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: isDark ? '#0a0e1a' : '#ffffff' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend chips */}
      <div className="flex flex-wrap gap-3 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-red-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>
          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Anomaly Detected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-gradient-to-r from-violet-500 to-violet-400 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #8b5cf6, #8b5cf6 6px, transparent 6px, transparent 10px)' }} />
          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI Predicted</span>
        </div>
        {selectedMetric === 'Seeing' && (
          <>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-red-500 rounded" />
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Critical Threshold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-amber-500 rounded" />
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Warning Threshold</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(TelemetryChart);
