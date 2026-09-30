import { useEffect, useRef, memo } from 'react';

type SensorValue = { value?: string | number } | string | number | null;

interface SpectrogramProps {
  isDark: boolean;
  turbulenceSpectrum?: unknown;
  turbulenceType?: SensorValue;
  dominantFrequency?: SensorValue;
}

function SpectrogramChart({ isDark, turbulenceSpectrum, turbulenceType, dominantFrequency }: SpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const timePoints = 91; // 0 to 90 matches TelemetryChart
  const freqBins = 40; 
  
  const dataRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (dataRef.current === null) {
      const grid = new Float32Array(timePoints * freqBins);
      const pseudoRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      for (let t = 0; t < timePoints; t++) {
        for (let f = 0; f < freqBins; f++) {
          let energy = pseudoRandom(t * 100 + f) * 0.15; 
          if (t >= 14 && t <= 22 && f < 10) {
             energy += pseudoRandom(t * 13 + f) * 0.7 * (1 - f/10);
          }
          if (t >= 38 && t <= 46 && f > 25) {
             energy += pseudoRandom(t * 17 + f) * 0.9 * ((f - 25)/15);
          }
          if (t > 60) {
              energy += pseudoRandom(t * 29 + f) * 0.1;
          }
          grid[t * freqBins + f] = Math.min(1, Math.max(0, energy));
        }
      }
      dataRef.current = grid;
    }

    const grid = dataRef.current;
    if (!grid) return;

    if (Array.isArray(turbulenceSpectrum)) {
      // Shift data left (older time)
      grid.copyWithin(0, freqBins);
      
      // Insert new spectrum at the right edge (newest time)
      const startIndex = (timePoints - 1) * freqBins;
      
      // Find max power in the incoming array to normalize it, if needed. 
      // But we will just use the raw power values capped between 0 and 1 for now
      for (let f = 0; f < freqBins; f++) {
        const item = turbulenceSpectrum[f];
        const rawPower = item && item.power !== undefined ? item.power : 0;
        
        // Enhance the visibility of small powers using Math.pow or multiplier if desired, 
        // but simple mapping with cap is fine:
        grid[startIndex + f] = Math.min(1, Math.max(0, Number(rawPower) || 0));
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // We want to fill width evenly
    const cellWidth = width / timePoints;
    const cellHeight = height / freqBins;

    const getColor = (v: number) => {
      // Thermal Gradient: Dark blue -> Blue -> Cyan -> Yellow -> Red -> White
      if (v < 0.1) return `rgba(2, 6, 23, 1)`; // slate-950 (Background)
      if (v < 0.25) return `rgba(30, 58, 138, 1)`; // blue-900
      if (v < 0.45) return `rgba(14, 165, 233, 1)`; // sky-500
      if (v < 0.65) return `rgba(234, 179, 8, 1)`; // yellow-500
      if (v < 0.85) return `rgba(239, 68, 68, 1)`; // red-500
      return `rgba(255, 255, 255, 1)`; // white
    };

    ctx.clearRect(0, 0, width, height);
    
    // Fill the background
    ctx.fillStyle = `rgba(2, 6, 23, 1)`;
    ctx.fillRect(0, 0, width, height);

    for (let t = 0; t < timePoints; t++) {
      for (let f = 0; f < freqBins; f++) {
        const val = grid[t * freqBins + f];
        if (val < 0.1) continue; // optimization: skip dark background

        ctx.fillStyle = getColor(val);
        const x = t * cellWidth;
        // Y-axis 0 is at bottom
        const y = height - ((f + 1) * cellHeight);
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(cellWidth), Math.ceil(cellHeight));
      }
    }
  }, [turbulenceSpectrum]);

  return (
    <div className={`w-full flex flex-col ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2">
            Turbulence Frequency Spectrum 
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20' : 'bg-indigo-100 text-indigo-600 border-indigo-200'} border`}>
              FFT
            </span>
          </h3>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time waterfall spectrogram • identifies altitude of turbulence
          </p>
        </div>
        <div className="flex gap-4 text-[10px] items-center">
          <div className="flex flex-col items-end">
             <span className="font-semibold text-red-500">High Energy</span>
             <span className="opacity-60 text-[9px]">Jet Stream / Strong Mixing</span>
          </div>
          <div className="w-24 h-2 rounded-full border border-slate-700/50 bg-gradient-to-r from-slate-950 via-sky-500 to-red-500 shadow-sm" />
        </div>
      </div>

      {(turbulenceType || dominantFrequency) && (
        <div className="flex gap-4 mb-4 text-xs font-mono">
          {turbulenceType && (
            <div className={`px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              Type: <span className="font-semibold text-sky-500">{typeof turbulenceType === 'object' && turbulenceType !== null && 'value' in turbulenceType ? String((turbulenceType as { value: string | number }).value) : String(turbulenceType)}</span>
            </div>
          )}
          {dominantFrequency && (
            <div className={`px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              Dominant Freq: <span className="font-semibold text-amber-500">{typeof dominantFrequency === 'object' && dominantFrequency !== null && 'value' in dominantFrequency ? String((dominantFrequency as { value: string | number }).value) : String(dominantFrequency)} Hz</span>
            </div>
          )}
          {turbulenceSpectrum && (
            <div className={`px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`} title={JSON.stringify(turbulenceSpectrum)}>
              Spectrum: <span className="font-semibold text-emerald-500">Live Data</span>
            </div>
          )}
        </div>
      )}
      
      {/* Container padded to align with the Recharts LineChart above it. 
          Recharts Y-axis (with label) takes roughly 45px. The right margin is 20px. */}
      <div className="w-full flex">
         <div className="w-[45px] flex flex-col justify-between text-[9px] opacity-60 pb-1 font-mono tracking-tighter">
            <span>High Hz</span>
            <span>Mid Hz</span>
            <span>Low Hz</span>
         </div>
         <div className="flex-1 relative h-36 rounded-lg overflow-hidden border border-slate-500/20 shadow-inner mr-[20px] bg-slate-950">
           
           <canvas 
             ref={canvasRef} 
             width={1200} 
             height={200} 
             className="w-full h-full block blur-[0.5px]" 
           />
           
           {/* Prediction zone overlay dashed line */}
           <div className="absolute left-[66.6%] top-0 bottom-0 border-l-2 border-violet-500/40 border-dashed pointer-events-none z-10" />
         </div>
      </div>
    </div>
  );
}

export default memo(SpectrogramChart);


