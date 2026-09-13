package com.ai.aetheris.application.services.forcasting;

import java.util.UUID;

import org.springframework.stereotype.Service;
import com.ai.aetheris.application.repositories.shared.SettingsRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FriedParameterService {

    private final SettingsRepository settingsRepository;
    // Conversion factor: Arcseconds to Radians
    private static final double ARCSEC_TO_RAD = Math.PI / 648000.0;

    public FriedParameterService(SettingsRepository settingsRepository) {
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
     * Calculates the Fried Parameter (r0) in meters.
     * @param seeingArcsec The seeing index measured in arcseconds.
     * @return The Fried Parameter in meters.
     */
    public double calculateFriedParameter(double seeing) {
        UUID adminId = getCurrentAdminId();

        if (adminId == null) {
            log.warn("No active admin login session found. Cannot compute fried parameter.");
            return Double.NaN;
        }

        double wavelengthForFriedParameter = settingsRepository.findByAdminId(adminId)
                .map(com.ai.aetheris.domain.shared.entities.Settings::getWavelengthForFriedParameter)
                .orElse(500.0);


        // Convert wavelength to meters
        double wavelengthInMeters = wavelengthForFriedParameter /= 1e9;

        // Convert seeing from arcseconds to radians
        double seeingInRadians = seeing * ARCSEC_TO_RAD;
        
        // Calculate fried parameter
        double friedParameter = 0.98 * (wavelengthInMeters / seeingInRadians);

        // Convert to mm
        double friedParameterInMM = friedParameter * 1000;
        
        // Round to 2 decimal places
        return Math.round(friedParameterInMM * 100.0) / 100.0;
    }

    public double getWindowSize() {
        UUID adminId = getCurrentAdminId();

        if (adminId == null) {
            return 0;
        }

        // Get seeing window size
        return settingsRepository.findByAdminId(adminId)
                .map(com.ai.aetheris.domain.shared.entities.Settings::getWavelengthForFriedParameter)
                .orElse(500.0);
    }
}
