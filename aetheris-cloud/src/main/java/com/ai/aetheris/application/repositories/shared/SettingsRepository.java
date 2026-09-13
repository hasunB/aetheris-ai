package com.ai.aetheris.application.repositories.shared;

import com.ai.aetheris.domain.shared.entities.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import com.ai.aetheris.domain.shared.enums.TemperatureScale;

public interface SettingsRepository extends JpaRepository<Settings, UUID> {
    Optional<Settings> findByAdminId(UUID adminId);
    int getSnrWindowSizeByAdminId(UUID adminId);
    int getRateOfDegradationWindowSizeByAdminId(UUID adminId);
    int getAverageSeeingWindowSizeByAdminId(UUID adminId);
    double getCriticalSeeingLineThresholdByAdminId(UUID adminId);
    double getWarningSeeingLineThresholdByAdminId(UUID adminId);
    double getCriticalVoltageLineThresholdByAdminId(UUID adminId);
    double getWarningVoltageLineThresholdByAdminId(UUID adminId);
    double getWavelengthForFriedParameterByAdminId(UUID adminId);
    TemperatureScale getTemperatureScaleByAdminId(UUID adminId);
}
