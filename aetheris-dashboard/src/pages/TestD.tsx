import { useSensorSocket } from '../sockets/useSensorSocket';

function TestD() {
  const { inputValue, snr, avgSeeing, friedParam, rateOfDeg } = useSensorSocket();

  console.log('TestD render — state:', { inputValue, snr, avgSeeing, friedParam, rateOfDeg });

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2>WebSocket Debug</h2>
      <p>Input: {JSON.stringify(inputValue)}</p>
      <p>SNR: {JSON.stringify(snr)}</p>
      <p>Avg Seeing: {JSON.stringify(avgSeeing)}</p>
      <p>Fried Param: {JSON.stringify(friedParam)}</p>
      <p>Rate of Degradation: {JSON.stringify(rateOfDeg)}</p>
    </div>
  );
}

export default TestD
