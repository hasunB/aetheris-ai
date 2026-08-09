import { useState, useMemo } from 'react';
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
  ReferenceArea
} from 'recharts';

type MetricType = 'Seeing' | 'Volts' | 'Temperature';

interface ChartProps {
  isDark: boolean;
  criticalThreshold: number;
  warningThreshold: number;
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
  return <circle cx={cx} cy={cy} r={2.5} fill="#3b82f6" strokeWidth={0} />;
};

export default function TelemetryChart({ isDark, criticalThreshold, warningThreshold }: ChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('Seeing');

  const data = useMemo(() => {
    const arr: any[] = [];
    const seedOffset = selectedMetric === 'Seeing' ? 0 : selectedMetric === 'Volts' ? 100 : 200;

    let lastVal = selectedMetric === 'Seeing' ? 3.5 : selectedMetric === 'Volts' ? 12.0 : 15.0;

    // Anomaly injection points (only for Seeing)
    const anomalyPoints = new Set([7, 18, 27, 42, 55]);

    for (let i = 0; i <= 60; i++) {
      const rand = pseudoRandom(i + seedOffset);

      if (selectedMetric === 'Seeing') {
        // Inject spikes at anomaly points to simulate hardware noise / cloud cover
        if (anomalyPoints.has(i)) {
          lastVal = Math.min(6.8, lastVal + 2.5 + rand * 1.5);
        } else {
          lastVal = Math.max(0.5, Math.min(6.8, lastVal + (rand - 0.5) * 3.2));
        }
      } else if (selectedMetric === 'Volts') {
        if (i === 22 || i === 48) {
          lastVal = Math.max(11.2, lastVal - 0.4); // voltage dip anomaly
        } else {
          lastVal = Math.max(11.5, Math.min(12.5, lastVal + (rand - 0.5) * 0.15));
        }
      } else {
        lastVal = Math.max(-5, Math.min(35, lastVal + (rand - 0.5) * 1.8));
      }

      const isAnomaly = selectedMetric === 'Seeing'
        ? anomalyPoints.has(i)
        : selectedMetric === 'Volts'
          ? (i === 22 || i === 48)
          : false;

      arr.push({
        time: i,
        actual: Number(lastVal.toFixed(2)),
        predicted: i === 60 ? Number(lastVal.toFixed(2)) : null,
        anomaly: isAnomaly,
        anomalyLabel: isAnomaly
          ? (selectedMetric === 'Seeing' ? (i === 18 || i === 42 ? 'Cloud Cover' : 'HW Noise') : 'Voltage Dip')
          : null,
      });
    }

    // AI Prediction for next 30 minutes (points 61–90)
    let predVal = lastVal;
    for (let i = 61; i <= 90; i++) {
      const rand = pseudoRandom(i + seedOffset + 1000);
      if (selectedMetric === 'Seeing') predVal = Math.max(0.5, predVal + (rand - 0.48) * 1.8);
      else if (selectedMetric === 'Volts') predVal = Math.max(11.5, Math.min(12.5, predVal + (rand - 0.5) * 0.08));
      else predVal += (rand - 0.5) * 1.2;

      arr.push({
        time: i,
        actual: null,
        predicted: Number(predVal.toFixed(2)),
        anomaly: false,
        anomalyLabel: null,
      });
    }

    return arr;
  }, [selectedMetric]);

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
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'bg-white text-blue-600 border border-slate-200 shadow-sm'
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
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />

            {/* AI Prediction zone background */}
            <ReferenceArea x1={60} x2={90} fill={predictionZoneBg} />

            <XAxis
              dataKey="time"
              stroke={textColor}
              tick={{ fill: textColor, fontSize: 11 }}
              tickLine={{ stroke: gridColor }}
              axisLine={{ stroke: gridColor }}
              minTickGap={8}
              label={{ value: 'Time (minutes)', position: 'insideBottomRight', offset: -5, fill: textColor, fontSize: 10 }}
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
                backgroundColor: isDark ? '#0a1628' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                color: isDark ? '#f8fafc' : '#0f172a',
                borderRadius: '12px',
                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 25px rgba(0,0,0,0.08)',
                padding: '10px 14px',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => {
                return [`${value ?? ''} ${activeMetric.unit}`, name];
              }}
              labelFormatter={(label) => {
                const point = data.find((d: any) => d.time === label);
                let text = `Time: ${label ?? ''}m`;
                if (point?.anomaly) text += ` ⚠️ ${point.anomalyLabel}`;
                if (typeof label === 'number' && label > 60) text += ' (AI Predicted)';
                return text;
              }}
            />

            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              formatter={(value: string) => <span style={{ color: textColor }}>{value}</span>}
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
              x={60}
              stroke={isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)'}
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ position: 'top', value: 'AI Forecast', fill: '#8b5cf6', fontSize: 10, offset: -5 }}
            />

            {/* Historical area fill */}
            <Area
              type="monotone"
              dataKey="actual"
              stroke="none"
              fill="url(#actualGradient)"
              legendType="none"
            />

            {/* Historical line */}
            <Line
              type="monotone"
              name="Live Stream"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<AnomalyDot />}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: isDark ? '#0a1628' : '#ffffff' }}
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
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: isDark ? '#0a1628' : '#ffffff' }}
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
