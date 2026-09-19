import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BACKEND_URL = '/ws'; // proxied through Vite to http://localhost:8080/ws

export function useSensorSocket() {
  const [inputValue, setInputValue] = useState(null);
  const [snr, setSnr] = useState(null);
  const [seeingValue, setSeeingValue] = useState(null);
  const [avgSeeing, setAvgSeeing] = useState(null);
  const [friedParam, setFriedParam] = useState(null);
  const [rateOfDeg, setRateOfDeg] = useState(null);
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
          setSnr(JSON.parse(msg.body));  // { value: "12.34", windowSize: 50 }
        });

        client.subscribe('/topic/seeing-value', (msg) => {
          console.log('[WS] seeing-value:', msg.body);
          setSeeingValue(JSON.parse(msg.body));
        });

        client.subscribe('/topic/average-seeing', (msg) => {
          console.log('[WS] average-seeing:', msg.body);
          setAvgSeeing(JSON.parse(msg.body));
        });

        client.subscribe('/topic/fried-parameter-value', (msg) => {
          console.log('[WS] fried-parameter-value:', msg.body);
          setFriedParam(JSON.parse(msg.body));
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

  return { inputValue, snr, seeingValue, avgSeeing, friedParam, rateOfDeg };
}
