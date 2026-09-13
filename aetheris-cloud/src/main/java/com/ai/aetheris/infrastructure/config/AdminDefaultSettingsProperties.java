package com.ai.aetheris.infrastructure.config;

import com.ai.aetheris.domain.shared.enums.TemperatureScale;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "admin.default-settings")
public class AdminDefaultSettingsProperties {
    private int snrWindowSize = 60;
    private int rateOfDegradationWindowSize = 60;
    private int averageSeeingWindowSize = 5;
    private double criticalSeeingLineThreshold = 1.5;
    private double warningSeeingLineThreshold = 3.0;
    private double criticalVoltageLineThreshold = 1.5;
    private double warningVoltageLineThreshold = 3.0;
    private double wavelengthForFriedParameter = 500;
    private TemperatureScale temperatureScale = TemperatureScale.CELSIUS;
}
