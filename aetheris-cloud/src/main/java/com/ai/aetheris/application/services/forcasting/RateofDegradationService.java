package com.ai.aetheris.application.services.forcasting;

import java.util.UUID;

import org.springframework.stereotype.Service;
import com.ai.aetheris.application.repositories.shared.SettingsRepository;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RateofDegradationService {

    private final SettingsRepository settingsRepository;
    private final Map<UUID, LinkedList<Double>> adminRateOfDegradationWindows = new ConcurrentHashMap<>();

    public RateofDegradationService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    private UUID getCurrentAdminId() {
        // TODO: Change this to get the adminId from the security context
        // Authentication authentication =
        // SecurityContextHolder.getContext().getAuthentication();
        // if (authentication != null && authentication.getPrincipal() instanceof Admin)
        // {
        // Admin admin = (Admin) authentication.getPrincipal();
        // return admin.getId();
        // }
        // return null;
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    /**
     * Calculates the rate of change (first derivative) using linear regression.
     * 
     * @param seeing The seeing value.
     * @return The slope representing the rate of degradation (arcsec per second).
     */
    public double calculateRateOfDegradation(double seeing) {
        UUID adminId = getCurrentAdminId();

        if (adminId == null) {
            log.warn("No active admin login session found. Cannot compute rate of degradation.");
            return Double.NaN;
        }

        int seeingWindowSize = settingsRepository.findByAdminId(adminId)
                .map(com.ai.aetheris.domain.shared.entities.Settings::getRateOfDegradationWindowSize)
                .orElse(60);

        LinkedList<Double> seeingWindow = adminRateOfDegradationWindows.computeIfAbsent(adminId,
                k -> new LinkedList<>());

        synchronized (seeingWindow) {
            seeingWindow.addLast(seeing);
            while (seeingWindow.size() > seeingWindowSize) {
                seeingWindow.removeFirst();
            }

            int n = seeingWindow.size();
            if (n < 2) {
                return Double.NaN;
            }

            double sumT = 0.0;
            double sumS = 0.0;
            double sumTS = 0.0;
            double sumTSq = 0.0;

            int i = 0;
            for (double s : seeingWindow) {
                // i represents time (t) in seconds relative to the window start
                double t = i;

                sumT += t;
                sumS += s;
                sumTS += (t * s);
                sumTSq += (t * t);
                i++;
            }

            double numerator = (n * sumTS) - (sumT * sumS);
            double denominator = (n * sumTSq) - (sumT * sumT);

            if (denominator == 0.0) {
                return 0.0; // Prevent divide by zero on flatlines
            }

            double slope = numerator / denominator;
            return Math.round(slope * 100.0) / 100.0;
        }
    }

    /**
     * Returns the current number of samples in the sliding window for the logged-in admin.
     */
    public int getWindowSize() {
        UUID adminId = getCurrentAdminId();

        if (adminId == null) {
            return 0;
        }

        LinkedList<Double> seeingWindow = adminRateOfDegradationWindows.get(adminId);
        if (seeingWindow == null) {
            return 0;
        }
        synchronized (seeingWindow) {
            return seeingWindow.size();
        }
    }
}
