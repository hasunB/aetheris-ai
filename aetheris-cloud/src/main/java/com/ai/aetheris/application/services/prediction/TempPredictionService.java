package com.ai.aetheris.application.services.prediction;

import java.util.UUID;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TempPredictionService {
    
    private static class TempState {
        double s;
        boolean initialized = false;
        LinkedList<Double> window = new LinkedList<>();
    }

    private final Map<UUID, TempState> adminStates = new ConcurrentHashMap<>();
    private final double ALPHA = 0.2; // SES smoothing factor
    private final int WINDOW_SIZE = 30;

    private UUID getCurrentAdminId() {
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    public double getRecentTempDelta() {
        UUID adminId = getCurrentAdminId();
        if (adminId == null) return 0.0;
        TempState state = adminStates.get(adminId);
        if (state == null) return 0.0;
        
        synchronized (state) {
            if (state.window.isEmpty()) return 0.0;
            return state.window.getLast() - state.window.getFirst();
        }
    }

    public List<Double> predictTemp(double temp) {
        UUID adminId = getCurrentAdminId();
        if (adminId == null) return Collections.emptyList();

        TempState state = adminStates.computeIfAbsent(adminId, k -> new TempState());

        synchronized (state) {
            // Option C: SES (Simple Exponential Smoothing)
            if (!state.initialized) {
                state.s = temp;
                state.initialized = true;
            } else {
                state.s = ALPHA * temp + (1 - ALPHA) * state.s;
            }

            // Sliding window for linear trend
            state.window.addLast(temp);
            while (state.window.size() > WINDOW_SIZE) {
                state.window.removeFirst();
            }

            // Linear trend
            int n = state.window.size();
            double slope = 0.0;
            if (n >= 2) {
                double sumT = 0.0;
                double sumS = 0.0;
                double sumTS = 0.0;
                double sumTSq = 0.0;
                int i = 0;
                for (double sVal : state.window) {
                    double t = i;
                    sumT += t;
                    sumS += sVal;
                    sumTS += (t * sVal);
                    sumTSq += (t * t);
                    i++;
                }
                double denominator = (n * sumTSq) - (sumT * sumT);
                if (denominator != 0.0) {
                    slope = ((n * sumTS) - (sumT * sumS)) / denominator;
                }
            }
            
            // Forecast 60 steps ahead: T̂(t+k) = SES(t) + slope × k
            List<Double> predictions = new ArrayList<>();
            for (int k = 1; k <= 60; k++) {
                double predicted = state.s + slope * k;
                predictions.add(Math.round(predicted * 100.0) / 100.0);
            }
            return predictions;
        }
    }
}
