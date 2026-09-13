package com.ai.aetheris.domain.shared.entities;

import com.ai.aetheris.domain.admin.entities.Admin;
import com.ai.aetheris.domain.shared.enums.TemperatureScale;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "settings")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Settings {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "snr-window-size")
    private int snrWindowSize;

    @Column(name = "rate-of-degradation-window-size")
    private int rateOfDegradationWindowSize;

    @Column(name = "average-seeing-window-size")
    private int averageSeeingWindowSize;

    @Column(name = "critical-seeing-line-threshold")
    private double criticalSeeingLineThreshold;

    @Column(name = "warning-seeing-line-threshold")
    private double warningSeeingLineThreshold;

    @Column(name = "critical-voltage-line-threshold")
    private double criticalVoltageLineThreshold;

    @Column(name = "warning-voltage-line-threshold")
    private double warningVoltageLineThreshold;

    @Column(name = "wavelength-for-fried-parameter")
    private double wavelengthForFriedParameter;

    @Column(name = "temperature-scale")
    @Enumerated(EnumType.STRING)
    private TemperatureScale temperatureScale;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

}
