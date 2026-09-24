package com.ai.aetheris.application.services.prediction;

import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeeingPredictionService {

    private final TempPredictionService tempPredictionService;

    private static class HWState {
        double L;
        double T;
        boolean initialized = false;
    }

    private final Map<UUID, HWState> adminStates = new ConcurrentHashMap<>();
    
    // Balanced tuning parameters
    private final double ALPHA = 0.3; // Level smoothing
    private final double BETA = 0.1;  // Trend smoothing
    private final double GAMMA = 0.2; // Temperature correction factor

    private UUID getCurrentAdminId() {
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    public List<Double> predictSeeing(double y) {
        UUID adminId = getCurrentAdminId();
        if (adminId == null) return Collections.emptyList();

        HWState state = adminStates.computeIfAbsent(adminId, k -> new HWState());

        synchronized (state) {
            if (!state.initialized) {
                state.L = y;
                state.T = 0.0;
                state.initialized = true;
                List<Double> initialPredictions = new ArrayList<>();
                double initial = Math.round(y * 100.0) / 100.0;
                for (int k = 1; k <= 60; k++) initialPredictions.add(initial);
                return initialPredictions;
            }

            double prevL = state.L;
            double prevT = state.T;

            // Holt-Winters Double Exponential Smoothing
            state.L = ALPHA * y + (1 - ALPHA) * (prevL + prevT);
            state.T = BETA * (state.L - prevL) + (1 - BETA) * prevT;

            double deltaTemp = tempPredictionService.getRecentTempDelta();
            
            // Forecast 60 steps ahead with temp correction: ŷ(t+k) = L(t) + k × T(t) + γ × ΔTemp
            List<Double> predictions = new ArrayList<>();
            for (int k = 1; k <= 60; k++) {
                double predicted = state.L + k * state.T + GAMMA * deltaTemp;
                predictions.add(Math.round(predicted * 100.0) / 100.0);
            }
            return predictions;
        }
    }
}
