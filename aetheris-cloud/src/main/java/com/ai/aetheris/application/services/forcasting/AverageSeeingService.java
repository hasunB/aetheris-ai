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
public class AverageSeeingService {

    private final SettingsRepository settingsRepository;
    private final Map<UUID, LinkedList<Double>> adminSeeingWindows = new ConcurrentHashMap<>();

    public AverageSeeingService(SettingsRepository settingsRepository) {
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

    public double getAverageSeeing(double seeing) {
        UUID adminId = getCurrentAdminId();

        if (adminId == null) {
            log.warn("No active admin login session found. Cannot compute average seeing.");
            return Double.NaN;
        }

        int seeingWindowSize = settingsRepository.findByAdminId(adminId)
                .map(com.ai.aetheris.domain.shared.entities.Settings::getAverageSeeingWindowSize)
                .orElse(5);

        LinkedList<Double> seeingWindow = adminSeeingWindows.computeIfAbsent(adminId, k -> new LinkedList<>());

        synchronized (seeingWindow) {
            seeingWindow.addLast(seeing);
            while (seeingWindow.size() > seeingWindowSize) {
                seeingWindow.removeFirst();
            }

            if (seeingWindow.isEmpty()) {
                return Double.NaN;
            }

            double sum = 0.0;
            for (double s : seeingWindow) {
                sum += s;
            }
            double average = sum / seeingWindow.size();
            return Math.round(average * 100.0) / 100.0;
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
        
        LinkedList<Double> seeingWindow = adminSeeingWindows.get(adminId);
        if (seeingWindow == null) {
            return 0;
        }
        synchronized (seeingWindow) {
            return seeingWindow.size();
        }
    }
}
