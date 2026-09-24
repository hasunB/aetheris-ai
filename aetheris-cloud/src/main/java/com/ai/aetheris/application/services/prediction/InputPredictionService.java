package com.ai.aetheris.application.services.prediction;

import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class InputPredictionService {
    
    private static class KFState {
        double x_hat;
        double P;
        boolean initialized = false;
    }

    private final Map<UUID, KFState> adminStates = new ConcurrentHashMap<>();
    private final double Q = 0.05; // Process noise

    private UUID getCurrentAdminId() {
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    public List<Double> predictInput(double z, double snrDb) {
        UUID adminId = getCurrentAdminId();
        if (adminId == null) return Collections.emptyList();

        KFState state = adminStates.computeIfAbsent(adminId, k -> new KFState());
        
        synchronized (state) {
            if (!state.initialized) {
                state.x_hat = z;
                state.P = 1.0;
                state.initialized = true;
                List<Double> initialPredictions = new ArrayList<>();
                for (int k = 1; k <= 60; k++) initialPredictions.add(state.x_hat);
                return initialPredictions;
            }

            // Predict step: x̂(t|t-1) = x̂(t-1)
            double x_hat_minus = state.x_hat;
            // P(t|t-1)  = P(t-1) + Q 
            double P_minus = state.P + Q;

            // Update step:
            // Measurement noise from SNR: R = 1 / 10^(SNR/10)
            double R = 1.0 / Math.pow(10, snrDb / 10.0);

            // K(t) = P(t|t-1) / (P(t|t-1) + R)
            double K = P_minus / (P_minus + R);
            
            // x̂(t) = x̂(t|t-1) + K(t) × (z(t) - x̂(t|t-1))
            state.x_hat = x_hat_minus + K * (z - x_hat_minus);
            
            // P(t) = (1 - K(t)) × P(t|t-1)
            state.P = (1 - K) * P_minus;

            List<Double> predictions = new ArrayList<>();
            for (int k = 1; k <= 60; k++) {
                predictions.add(Math.round(state.x_hat * 100.0) / 100.0);
            }
            return predictions;
        }
    }
}
