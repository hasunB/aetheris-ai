package com.ai.aetheris.application.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorPayloadDTO {
    private String sensorId;
    private String deviceId;
    private double temperature;
    private double humidity;
    private LocalDateTime timestamp;
}
