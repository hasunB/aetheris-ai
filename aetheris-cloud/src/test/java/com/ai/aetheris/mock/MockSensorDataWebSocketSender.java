package com.ai.aetheris.mock;

import com.ai.aetheris.application.services.forcasting.SignalToNoiseRatioService;
import com.ai.aetheris.application.services.forcasting.AverageSeeingService;
import com.ai.aetheris.application.services.forcasting.FriedParameterService;
import com.ai.aetheris.application.services.forcasting.RateofDegradationService;
import com.ai.aetheris.application.services.prediction.InputPredictionService;
import com.ai.aetheris.application.services.prediction.SeeingPredictionService;
import com.ai.aetheris.application.services.prediction.TempPredictionService;

import org.springframework.context.annotation.Profile;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Random;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Mock replacement for {@link com.ai.aetheris.application.services.sensorData.SensorDataKafkaConsumer}.
 * <p>
 * Activated only when the Spring profile <b>"mock"</b> is active.
 * Instead of consuming from Kafka, it generates realistic sensor data on a
 * fixed schedule and pushes it through WebSocket using the exact same topic
 * paths and processing pipeline as the real consumer.
 * <p>
 * <b>Usage:</b> Run the application with {@code --spring.profiles.active=mock}
 * or set the environment variable {@code SPRING_PROFILES_ACTIVE=mock}.
 */
@Service
@Profile("mock")
@RequiredArgsConstructor
@Slf4j
public class MockSensorDataWebSocketSender {

    private final SimpMessagingTemplate messagingTemplate;
    private final SignalToNoiseRatioService signalToNoiseRatioService;
    private final AverageSeeingService averageSeeingService;
    private final FriedParameterService friedParameterService;
    private final RateofDegradationService rateOfDegradationService;
    private final InputPredictionService inputPredictionService;
    private final SeeingPredictionService seeingPredictionService;
    private final TempPredictionService tempPredictionService;

    private final Random random = new Random();

    // ── Mock data parameters ──────────────────────────────────────────────
    // Voltage (Input): sine-wave signal centered at 3.3V with ±0.5V amplitude + noise
    private static final double VOLTAGE_BASE = 3.3;
    private static final double VOLTAGE_AMPLITUDE = 0.5;
    private static final double VOLTAGE_NOISE_STDDEV = 0.05;

    // Seeing: realistic arcseconds in the range ~0.5–3.0″ with slow drift + jitter
    private static final double SEEING_BASE = 1.5;
    private static final double SEEING_DRIFT_AMPLITUDE = 0.8;
    private static final double SEEING_NOISE_STDDEV = 0.1;

    private long tickCount = 0;

    // ── Scheduled at 1 Hz (every 1000 ms) ─────────────────────────────────

    /**
     * Generates a mock "Input" (voltage) reading every second.
     */
    @Scheduled(fixedRate = 1000)
    public void sendMockInputData() {
        double voltage = generateMockVoltage();
        log.info("[MOCK] Sending Input payload: value={}", String.format("%.4f", voltage));

        // 1. Send raw value — same as the real consumer
        messagingTemplate.convertAndSend("/topic/input-value", voltage);

        // 2. Compute SNR through the real service
        double snrDb = signalToNoiseRatioService.computeSnr(voltage);
        if (!Double.isNaN(snrDb)) {
            log.info("[MOCK] Signal-to-Noise Ratio (SNR): {} dB  [window={} samples]",
                    String.format("%.2f", snrDb), signalToNoiseRatioService.getWindowSize());

            messagingTemplate.convertAndSend("/topic/snr-value", (Object) Map.of(
                    "value", String.format("%.2f", snrDb),
                    "windowSize", signalToNoiseRatioService.getWindowSize()
            ));
        }

        // predict input
        if (!Double.isNaN(snrDb)) {
            List<Double> predictedInput = inputPredictionService.predictInput(voltage, snrDb);
            if (predictedInput != null && !predictedInput.isEmpty()) {
                log.info("[MOCK] Predicted Input (60s): {}", predictedInput);
                messagingTemplate.convertAndSend("/topic/input-predicted", predictedInput);
            }
        }
    }

    /**
     * Generates a mock "Seeing" reading every second.
     */
    @Scheduled(fixedRate = 1000)
    public void sendMockSeeingData() {
        double seeing = generateMockSeeing();
        log.info("[MOCK] Sending Seeing payload: value={}", String.format("%.4f", seeing));

        // 1. Send raw value
        messagingTemplate.convertAndSend("/topic/seeing-value", seeing);

        // 2. Average Seeing
        double avgSeeing = averageSeeingService.getAverageSeeing(seeing);
        if (!Double.isNaN(avgSeeing)) {
            log.info("[MOCK] Average Seeing: {}  [window={} samples]",
                    String.format("%.2f", avgSeeing), averageSeeingService.getWindowSize());

            messagingTemplate.convertAndSend("/topic/average-seeing", (Object) Map.of(
                    "value", String.format("%.2f", avgSeeing),
                    "windowSize", averageSeeingService.getWindowSize()
            ));
        }

        // 3. Fried Parameter
        double friedParameter = friedParameterService.calculateFriedParameter(avgSeeing);
        if (!Double.isNaN(friedParameter)) {
            log.info("[MOCK] Fried Parameter: {} mm  [window={} samples]",
                    String.format("%.2f", friedParameter), friedParameterService.getWindowSize());

            messagingTemplate.convertAndSend("/topic/fried-parameter-value", (Object) Map.of(
                    "value", String.format("%.2f", friedParameter),
                    "windowSize", friedParameterService.getWindowSize()
            ));
        }

        // 4. Rate of Degradation
        double rateOfDegradation = rateOfDegradationService.calculateRateOfDegradation(avgSeeing);
        if (!Double.isNaN(rateOfDegradation)) {
            log.info("[MOCK] Rate of Degradation: {} arcsec/sec  [window={} samples]",
                    String.format("%.2f", rateOfDegradation), rateOfDegradationService.getWindowSize());

            messagingTemplate.convertAndSend("/topic/rate-of-degradation-value", (Object) Map.of(
                    "value", String.format("%.2f", rateOfDegradation),
                    "windowSize", rateOfDegradationService.getWindowSize()
            ));
        }

        // predict seeing
        if (!Double.isNaN(avgSeeing)) {
            List<Double> predictedSeeing = seeingPredictionService.predictSeeing(avgSeeing);
            if (predictedSeeing != null && !predictedSeeing.isEmpty()) {
                log.info("[MOCK] Predicted Seeing (60s): {}", predictedSeeing);
                messagingTemplate.convertAndSend("/topic/seeing-predicted", predictedSeeing);
            }
        }
    }


    @Scheduled(fixedRate = 1000)
    public void sendMockTempData() {
        double temp = generateMockTemp();
        log.info("[MOCK] Sending Temp payload: value={}", String.format("%.4f", temp));

        // 1. Send raw value
        messagingTemplate.convertAndSend("/topic/temp-value", temp);

        // predict temp
        if (!Double.isNaN(temp)) {
            List<Double> predictedTemp = tempPredictionService.predictTemp(temp);
            if (predictedTemp != null && !predictedTemp.isEmpty()) {
                log.info("[MOCK] Predicted Temp (60s): {}", predictedTemp);
                messagingTemplate.convertAndSend("/topic/temp-predicted", predictedTemp);
            }
        }
    }

    // ── Mock data generators ──────────────────────────────────────────────

    /**
     * Generates a sine-wave voltage signal with Gaussian noise.
     * The sine period is ~60 ticks (≈ 1 minute at 1 Hz).
     */
    private double generateMockVoltage() {
        tickCount++;
        double signal = VOLTAGE_BASE + VOLTAGE_AMPLITUDE * Math.sin(2 * Math.PI * tickCount / 60.0);
        double noise = random.nextGaussian() * VOLTAGE_NOISE_STDDEV;
        return signal + noise;
    }

    /**
     * Generates a slowly-drifting seeing value with Gaussian jitter.
     * Drift period is ~120 ticks (≈ 2 minutes at 1 Hz), representing
     * gradual atmospheric changes.
     */
    private double generateMockSeeing() {
        double drift = SEEING_DRIFT_AMPLITUDE * Math.sin(2 * Math.PI * tickCount / 120.0);
        double jitter = random.nextGaussian() * SEEING_NOISE_STDDEV;
        return Math.max(0.3, SEEING_BASE + drift + jitter); // clamp to realistic minimum
    }

    private double generateMockTemp() {
        return 25.0 + 5.0 * Math.sin(2 * Math.PI * tickCount / 60.0);
    }
}
