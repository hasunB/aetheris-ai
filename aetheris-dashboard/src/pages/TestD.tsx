import { useSensorSocket } from '../sockets/useSensorSocket';

function TestD() {
  const {
    inputValue,
    snr,
    seeingValue,
    temp,
    avgSeeing,
    friedParam,
    rateOfDeg,
    predictedInput,
    predictedSeeing,
    predictedTemp,
    turbulenceSpectrum,
    turbulenceType,
    dominantFrequency
  } = useSensorSocket();

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2>WebSocket Debug</h2>
      <p>Input: {JSON.stringify(inputValue)}</p>
      <p>SNR: {JSON.stringify(snr)}</p>
      <p>Seeing: {JSON.stringify(seeingValue)}</p>
      <p>Temperature: {JSON.stringify(temp)}</p>
      <p>Avg Seeing: {JSON.stringify(avgSeeing)}</p>
      <p>Fried Param: {JSON.stringify(friedParam)}</p>
      <p>Rate of Degradation: {JSON.stringify(rateOfDeg)}</p>
      <p>Predicted Input: {JSON.stringify(predictedInput)}</p>
      <p>Predicted Seeing: {JSON.stringify(predictedSeeing)}</p>
      <p>Predicted Temp: {JSON.stringify(predictedTemp)}</p>
      <p>Turbulence Spectrum: {JSON.stringify(turbulenceSpectrum)}</p>
      <p>Turbulence Type: {JSON.stringify(turbulenceType)}</p>
      <p>Dominant Frequency: {JSON.stringify(dominantFrequency)}</p>
    </div>
  );
}

export default TestD
