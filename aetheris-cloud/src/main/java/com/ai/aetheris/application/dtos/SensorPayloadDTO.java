package com.ai.aetheris.application.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorPayloadDTO {
    private String label;
    private double value;
    private long timestamp;
}
