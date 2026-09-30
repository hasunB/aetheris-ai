import { useState, useMemo, memo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Props {
  isDark: boolean;
  metric: 'Temperature' | 'Voltage';
  liveValue?: number;
}

function DiagnosticMetricChart({ isDark, metric, liveValue }: Props) {
  const [buffer, setBuffer] = useState<number[]>([]);
  const [prevLive, setPrevLive] = useState<number | undefined>(liveValue);

  if (liveValue !== prevLive) {
    setPrevLive(liveValue);
    if (liveValue != null) {
      setBuffer(prev => [...prev, liveValue].slice(-60));
    }
  }

  const data = useMemo(() => {
    // Return mock data if no live data
    if (buffer.length === 0) {
      const arr = [];
      const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      let lastVal = metric === 'Temperature' ? 22.0 : 12.1;
      const seedBase = metric === 'Temperature' ? 1000 : 2000;
      
      for (let i = 0; i < 60; i++) {
        lastVal = metric === 'Temperature' 
          ? lastVal + (pseudoRandom(seedBase + i) - 0.5) * 0.5 
          : lastVal + (pseudoRandom(seedBase + i) - 0.5) * 0.1;
        arr.push({ time: i, value: Number(lastVal.toFixed(2)) });
      }
      return arr;
    }
    
    return buffer.map((val, i) => ({ time: i, value: Number(val.toFixed(2)) }));
  }, [buffer, metric]);

  const color = metric === 'Temperature' ? '#f43f5e' : '#10b981'; // rose-500 vs emerald-500
  const yDomain = metric === 'Temperature' ? ['dataMin - 2', 'dataMax + 2'] : ['dataMin - 0.5', 'dataMax + 0.5'];
  
  return (
    <div className={`w-full flex flex-col ${isDark ? 'text-slate-300' : 'text-slate-600'} h-[350px]`}>
       <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            {metric === 'Temperature' ? 'Thermal History' : 'Voltage Stability'}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-indigo-100 text-indigo-600 border-indigo-200'} border`}>
              Live Stream
            </span>
          </h3>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time {metric.toLowerCase()} tracking
          </p>
       </div>

      <div className="flex-1 min-h-0 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <defs>
              <linearGradient id={`gradient${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
            <XAxis dataKey="time" type="number" domain={[0, 59]} tick={false} axisLine={false} />
            <YAxis 
              domain={yDomain}
              tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }}
              tickFormatter={(val) => `${val.toFixed(1)}${metric === 'Temperature' ? '°C' : 'V'}`}
              tickCount={5}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
              labelStyle={{ display: 'none' }}
              formatter={(val: number) => [`${val.toFixed(2)} ${metric === 'Temperature' ? '°C' : 'V'}`, metric]}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              fillOpacity={1} 
              fill={`url(#gradient${metric})`} 
              isAnimationActive={false} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(DiagnosticMetricChart);
