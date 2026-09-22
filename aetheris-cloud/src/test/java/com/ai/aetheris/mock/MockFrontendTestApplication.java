package com.ai.aetheris.mock;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Standalone test application entry point for front-end testing.
 * <p>
 * Starts the full Spring Boot application with the <b>"mock"</b> profile and:
 * <ul>
 *   <li>Excludes the real {@code SensorDataKafkaConsumer} to avoid {@code @KafkaListener} errors</li>
 *   <li>Excludes {@code KafkaConsumerConfig} to avoid Kafka broker connection attempts</li>
 * </ul>
 * <p>
 * The mock profile activates {@link MockSensorDataWebSocketSender} which generates
 * synthetic sensor data and pushes it through WebSocket on the same topics as the
 * real Kafka consumer.
 * <p>
 * <b>How to run:</b>
 * <pre>
 *   mvn spring-boot:run -Dspring-boot.run.profiles=mock \
 *       -Dspring-boot.run.main-class=com.ai.aetheris.mock.MockFrontendTestApplication
 * </pre>
 * Or run this class directly from your IDE with the VM argument {@code -Dspring.profiles.active=mock}.
 */
@SpringBootApplication
@ComponentScan(
        basePackages = "com.ai.aetheris",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX,
                pattern = {
                        "com\\.ai\\.aetheris\\.application\\.services\\.sensorData\\.SensorDataKafkaConsumer",
                        "com\\.ai\\.aetheris\\.infrastructure\\.config\\.KafkaConsumerConfig"
                }
        )
)
public class MockFrontendTestApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder(MockFrontendTestApplication.class)
                .profiles("mock")
                .run(args);
    }
}
