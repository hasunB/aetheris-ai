package com.ai.aetheris.application.services.forcasting;

import com.ai.aetheris.application.repositories.shared.SettingsRepository;
import com.ai.aetheris.domain.admin.entities.Admin;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class SignalToNoiseRatioService {

    private final SettingsRepository settingsRepository;
    private final Map<UUID, LinkedList<Double>> adminVoltageWindows = new ConcurrentHashMap<>();

    public SignalToNoiseRatioService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    private UUID getCurrentAdminId() {
        // TODO: Change this to get the adminId from the security context
        // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // if (authentication != null && authentication.getPrincipal() instanceof Admin) {
        //     Admin admin = (Admin) authentication.getPrincipal();
        //     return admin.getId();
        // }
        // return null;
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    /**
     * Maintains a sliding window of voltage readings per admin and computes the SNR.
     * <p>
     * SNR (dB) = 20 × log₁₀(mean / stddev)
     * <p>
     * Returns {@code Double.NaN} if there are fewer than 2 samples or the
     * standard deviation is zero (pure DC signal / no noise).
     */
    public double computeSnr(double voltage) {
        UUID adminId = getCurrentAdminId();

        if (adminId == null) {
            log.warn("No active admin login session found. Cannot compute SNR.");
            return Double.NaN;
        }

        int snrWindowSize = settingsRepository.findByAdminId(adminId)
                .map(com.ai.aetheris.domain.shared.entities.Settings::getSnrWindowSize)
                .orElse(60);

        LinkedList<Double> voltageWindow = adminVoltageWindows.computeIfAbsent(adminId, k -> new LinkedList<>());

        synchronized (voltageWindow) {
            voltageWindow.addLast(voltage);
            while (voltageWindow.size() > snrWindowSize) {
                voltageWindow.removeFirst();
            }

            if (voltageWindow.size() < 2) {
                return Double.NaN;
            }

            double sum = 0.0;
            for (double v : voltageWindow) {
                sum += v;
            }
            double mean = sum / voltageWindow.size();

            double sqDiffSum = 0.0;
            for (double v : voltageWindow) {
                double diff = v - mean;
                sqDiffSum += diff * diff;
            }
            double stddev = Math.sqrt(sqDiffSum / voltageWindow.size());

            if (stddev == 0.0) {
                log.debug("Standard deviation is zero — all {} voltage samples are identical ({}V). SNR is undefined.",
                        voltageWindow.size(), mean);
                return Double.NaN;
            }

            return 20.0 * Math.log10(Math.abs(mean) / stddev);
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
        
        LinkedList<Double> voltageWindow = adminVoltageWindows.get(adminId);
        if (voltageWindow == null) {
            return 0;
        }
        synchronized (voltageWindow) {
            return voltageWindow.size();
        }
    }
}
