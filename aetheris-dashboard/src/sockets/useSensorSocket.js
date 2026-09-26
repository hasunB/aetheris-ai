import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BACKEND_URL = '/ws'; // proxied through Vite to http://localhost:8080/ws

/** Extract a numeric value from a WS payload (handles { value: "12.3" } or raw number). */
const toNum = (raw) => {
  if (raw == null) return null;
  if (typeof raw === 'object' && raw.value !== undefined) return parseFloat(raw.value);
  return Number(raw);
};

export function useSensorSocket() {
  const [state, setState] = useState({
    inputValue: null,
    snr: null,
    seeingValue: null,
    avgSeeing: null,
    friedParam: null,
    rateOfDeg: null,
    temp: null,
    predictedInput: null,
    predictedSeeing: null,
    predictedTemp: null,
    snrTrend: 'up',
    r0Trend: 'up',
    seeingMomentum: 0
  });

  const stateRef = useRef(state);
  const prevRef = useRef({ snr: null, r0: null, seeing: null });
  const clientRef = useRef(null);
  
  // Track if there are pending updates to flush
  const hasUpdates = useRef(false);

  useEffect(() => {
    // Flush updates every 1000ms to prevent React and Recharts from thrashing
    const intervalId = setInterval(() => {
      if (hasUpdates.current) {
        setState({ ...stateRef.current });
        hasUpdates.current = false;
      }
    }, 1000);

    const client = new Client({
      webSocketFactory: () => new SockJS(BACKEND_URL),
      // Disable noisy STOMP debug logs to save memory
      debug: () => {}, 

      onConnect: () => {

        client.subscribe('/topic/input-value', (msg) => {
          stateRef.current.inputValue = JSON.parse(msg.body);
          hasUpdates.current = true;
        });

        client.subscribe('/topic/snr-value', (msg) => {
          const parsed = JSON.parse(msg.body);
          const num = toNum(parsed);
          if (num != null) {
            stateRef.current.snrTrend = (prevRef.current.snr != null ? (num >= prevRef.current.snr ? 'up' : 'down') : 'up');
            prevRef.current.snr = num;
          }
          stateRef.current.snr = parsed;
          hasUpdates.current = true;
        });

        client.subscribe('/topic/seeing-value', (msg) => {
          const parsed = JSON.parse(msg.body);
          const num = toNum(parsed);
          if (num != null) {
            stateRef.current.seeingMomentum = prevRef.current.seeing != null ? num - prevRef.current.seeing : 0;
            prevRef.current.seeing = num;
          }
          stateRef.current.seeingValue = parsed;
          hasUpdates.current = true;
        });

        client.subscribe('/topic/temp-value', (msg) => {
          stateRef.current.temp = JSON.parse(msg.body);
          hasUpdates.current = true;
        });

        client.subscribe('/topic/average-seeing', (msg) => {
          stateRef.current.avgSeeing = JSON.parse(msg.body);
          hasUpdates.current = true;
        });

        client.subscribe('/topic/fried-parameter-value', (msg) => {
          const parsed = JSON.parse(msg.body);
          const num = toNum(parsed);
          if (num != null) {
            stateRef.current.r0Trend = (prevRef.current.r0 != null ? (num >= prevRef.current.r0 ? 'up' : 'down') : 'up');
            prevRef.current.r0 = num;
          }
          stateRef.current.friedParam = parsed;
          hasUpdates.current = true;
        });

        client.subscribe('/topic/rate-of-degradation-value', (msg) => {
          stateRef.current.rateOfDeg = JSON.parse(msg.body);
          hasUpdates.current = true;
        });

        client.subscribe('/topic/input-predicted', (msg) => {
          stateRef.current.predictedInput = JSON.parse(msg.body);
          hasUpdates.current = true;
        });

        client.subscribe('/topic/seeing-predicted', (msg) => {
          stateRef.current.predictedSeeing = JSON.parse(msg.body);
          hasUpdates.current = true;
        });

        client.subscribe('/topic/temp-predicted', (msg) => {
          stateRef.current.predictedTemp = JSON.parse(msg.body);
          hasUpdates.current = true;
        });
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },

      onWebSocketError: (evt) => {
        console.error('WebSocket error:', evt);
      },

      onDisconnect: () => {
        console.warn('STOMP disconnected');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      clearInterval(intervalId);
      client.deactivate();
    };
  }, []);

  return state;
}
