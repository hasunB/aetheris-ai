import React, { useMemo, memo } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ThermalProfileChartProps {
  isDark: boolean;
}

interface DataPoint {
  temp: number;
  voltage: number;
  trend: number;
}

const MOCK_DATA: DataPoint[] = (() => {
  const generatedData = [];
  for (let i = 0; i < 200; i++) {
    // Temperature from 10°C to 30°C
    const temp = 10 + Math.random() * 20; 
    
    // Baseline voltage creeps up with temperature + some sensor noise
    // Formula: V = 11.2 + (temp - 10) * 0.04 + noise
    const noise = (Math.random() - 0.5) * 0.15;
    const voltage = 11.2 + (temp - 10) * 0.04 + noise;
    
    generatedData.push({ temp, voltage });
  }
  
  // Sort by temp so the trendline connects smoothly from left to right
  generatedData.sort((a, b) => a.temp - b.temp);
  
  // Add the AI's mathematical calibration curve (trendline)
  return generatedData.map(d => ({
    ...d,
    trend: 11.2 + (d.temp - 10) * 0.04
  }));
})();

function ThermalProfileChart({ isDark }: ThermalProfileChartProps) {

  return (
    <div className={`w-full flex flex-col ${isDark ? 'text-slate-300' : 'text-slate-600'} h-[350px]`}>
       <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            Dynamic Thermal Profile
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-indigo-100 text-indigo-600 border-indigo-200'} border`}>
              AI Calibration
            </span>
          </h3>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Diagnostic Scatter Plot • Baseline Voltage vs Temperature (°C)
          </p>
       </div>

      <div className="flex-1 min-h-0 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={MOCK_DATA}
            margin={{ top: 10, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
            <XAxis 
              dataKey="temp" 
              type="number" 
              domain={['dataMin - 2', 'dataMax + 2']} 
              tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }}
              tickFormatter={(val) => `${val.toFixed(0)}°C`}
              tickCount={6}
            />
            <YAxis 
              domain={['dataMin - 0.2', 'dataMax + 0.2']}
              tick={{ fontSize: 10, fill: isDark ? '#64748b' : '#94a3b8' }}
              tickFormatter={(val) => `${val.toFixed(1)}V`}
              tickCount={6}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3', stroke: isDark ? '#475569' : '#cbd5e1' }}
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
              formatter={(value: number, name: string) => [
                value.toFixed(2), 
                name === 'voltage' ? 'Raw Reading (V)' : 'Calibration Curve (V)'
              ]}
              labelFormatter={(label: number) => `Temp: ${label.toFixed(1)}°C`}
            />
            
            {/* Raw Scatter Data */}
            <Scatter 
              name="voltage" 
              dataKey="voltage" 
              fill={isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.6)'} 
              isAnimationActive={false}
            />
            
            {/* AI Calibration Curve */}
            <Line 
              type="monotone" 
              dataKey="trend" 
              stroke="#f43f5e" 
              strokeWidth={2} 
              dot={false} 
              activeDot={false} 
              name="trend" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(ThermalProfileChart);
