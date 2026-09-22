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
  const [inputValue, setInputValue] = useState(null);
  const [snr, setSnr] = useState(null);
  const [seeingValue, setSeeingValue] = useState(null);
  const [avgSeeing, setAvgSeeing] = useState(null);
  const [friedParam, setFriedParam] = useState(null);
  const [rateOfDeg, setRateOfDeg] = useState(null);

  // Trend tracking
  const [snrTrend, setSnrTrend] = useState('up');
  const [r0Trend, setR0Trend] = useState('up');
  const [seeingMomentum, setSeeingMomentum] = useState(0);

  // Keep previous numeric values for trend computation
  const prevSnrRef = useRef(null);
  const prevR0Ref = useRef(null);
  const prevSeeingRef = useRef(null);

  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      // SockJS factory for fallback support
      webSocketFactory: () => new SockJS(BACKEND_URL),
      debug: (str) => console.log('[STOMP]', str),

      onConnect: () => {
        console.log('Connected to WebSocket');

        client.subscribe('/topic/input-value', (msg) => {
          console.log('[WS] input-value:', msg.body);
          setInputValue(JSON.parse(msg.body));
        });

        client.subscribe('/topic/snr-value', (msg) => {
          console.log('[WS] snr-value:', msg.body);
          const parsed = JSON.parse(msg.body);
          const num = toNum(parsed);
          if (num != null) {
            setSnrTrend(prevSnrRef.current != null ? (num >= prevSnrRef.current ? 'up' : 'down') : 'up');
            prevSnrRef.current = num;
          }
          setSnr(parsed);
        });

        client.subscribe('/topic/seeing-value', (msg) => {
          console.log('[WS] seeing-value:', msg.body);
          const parsed = JSON.parse(msg.body);
          const num = toNum(parsed);
          if (num != null) {
            setSeeingMomentum(prevSeeingRef.current != null ? num - prevSeeingRef.current : 0);
            prevSeeingRef.current = num;
          }
          setSeeingValue(parsed);
        });

        client.subscribe('/topic/average-seeing', (msg) => {
          console.log('[WS] average-seeing:', msg.body);
          setAvgSeeing(JSON.parse(msg.body));
        });

        client.subscribe('/topic/fried-parameter-value', (msg) => {
          console.log('[WS] fried-parameter-value:', msg.body);
          const parsed = JSON.parse(msg.body);
          const num = toNum(parsed);
          if (num != null) {
            setR0Trend(prevR0Ref.current != null ? (num >= prevR0Ref.current ? 'up' : 'down') : 'up');
            prevR0Ref.current = num;
          }
          setFriedParam(parsed);
        });

        client.subscribe('/topic/rate-of-degradation-value', (msg) => {
          console.log('[WS] rate-of-degradation-value:', msg.body);
          setRateOfDeg(JSON.parse(msg.body));
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
      client.deactivate();  // cleanup on unmount
    };
  }, []);

  return { inputValue, snr, seeingValue, avgSeeing, friedParam, rateOfDeg, snrTrend, r0Trend, seeingMomentum };
}
