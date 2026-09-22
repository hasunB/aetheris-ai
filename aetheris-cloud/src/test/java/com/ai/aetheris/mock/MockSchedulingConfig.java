package com.ai.aetheris.mock;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables {@code @Scheduled} methods when the "mock" profile is active.
 * This allows {@link MockSensorDataWebSocketSender} to fire on its fixed-rate timers.
 */
@Configuration
@Profile("mock")
@EnableScheduling
public class MockSchedulingConfig {
}
