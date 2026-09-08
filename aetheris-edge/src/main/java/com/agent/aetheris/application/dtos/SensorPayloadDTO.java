package com.agent.aetheris.application.dtos;

public class SensorPayloadDTO {

    private final String label;
    private final double value;
    private final long timestamp;

    public SensorPayloadDTO(String label, double value) {
        this.label = label;
        this.value = value;
        this.timestamp = System.currentTimeMillis();
    }

    public String getLabel() { return label; }
    public double getValue() { return value; }
    public long getTimestamp() { return timestamp; }
}
