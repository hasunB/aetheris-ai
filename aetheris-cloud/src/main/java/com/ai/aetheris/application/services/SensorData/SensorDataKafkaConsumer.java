package com.ai.aetheris.application.services.sensorData;

import com.ai.aetheris.application.dtos.SensorPayloadDTO;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.ai.aetheris.application.services.forcasting.SignalToNoiseRatioService;
import com.ai.aetheris.application.services.forcasting.AverageSeeingService;
import com.ai.aetheris.application.services.forcasting.FriedParameterService;
import com.ai.aetheris.application.services.forcasting.RateofDegradationService;

import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorDataKafkaConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final SignalToNoiseRatioService signalToNoiseRatioService;
    private final AverageSeeingService averageSeeingService;
    private final FriedParameterService friedParameterService;
    private final RateofDegradationService rateOfDegradationService;

    @KafkaListener(topics = "sensor-data", groupId = "sensor-data-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(SensorPayloadDTO payload) {
        log.info("Received sensor data payload: {}", payload);

        // check input label payload
        if(payload.getLabel().equals("Input"))
        {
            // send raw data to WebSocket topic
            messagingTemplate.convertAndSend("/topic/input-value", payload.getValue());
            
            double snrDb = signalToNoiseRatioService.computeSnr(payload.getValue());
            if (!Double.isNaN(snrDb)) {

                // log data
                log.info("Signal-to-Noise Ratio (SNR): {} dB  [window={} samples]",
                        String.format("%.2f", snrDb), signalToNoiseRatioService.getWindowSize()
                );

                // send input value to WebSocket topic
                messagingTemplate.convertAndSend("/topic/snr-value", (Object) Map.of(
                    "value", String.format("%.2f", snrDb),
                    "windowSize", signalToNoiseRatioService.getWindowSize()
                ));

            }
        }

        // check seeing label payload
        if(payload.getLabel().equals("Seeing"))
        {
            // send raw data to WebSocket topic
            messagingTemplate.convertAndSend("/topic/seeing-value", payload.getValue());

            double avgSeeing = averageSeeingService.getAverageSeeing(payload.getValue());
            if (!Double.isNaN(avgSeeing)) {
                log.info("Average Seeing: {}  [window={} samples]",
                        String.format("%.2f", avgSeeing), averageSeeingService.getWindowSize());

                // send input value to WebSocket topic
                messagingTemplate.convertAndSend("/topic/average-seeing", (Object) Map.of(
                    "value", String.format("%.2f", avgSeeing),
                    "windowSize", averageSeeingService.getWindowSize()
                ));
            }

            double friedParameter = friedParameterService.calculateFriedParameter(avgSeeing);
            if (!Double.isNaN(friedParameter)) {
                log.info("Fried Parameter: {} mm  [window={} samples]",
                        String.format("%.2f", friedParameter), friedParameterService.getWindowSize());

                // send input value to WebSocket topic
                messagingTemplate.convertAndSend("/topic/fried-parameter-value", (Object) Map.of(
                    "value", String.format("%.2f", friedParameter),
                    "windowSize", friedParameterService.getWindowSize()
                ));
            }

            double rateOfDegradation = rateOfDegradationService.calculateRateOfDegradation(avgSeeing);
            if (!Double.isNaN(rateOfDegradation)) {
                log.info("Rate of Degradation: {} arcsec/sec  [window={} samples]",
                        String.format("%.2f", rateOfDegradation), rateOfDegradationService.getWindowSize());

                // send input value to WebSocket topic
                messagingTemplate.convertAndSend("/topic/rate-of-degradation-value", (Object) Map.of(
                    "value", String.format("%.2f", rateOfDegradation),
                    "windowSize", rateOfDegradationService.getWindowSize()
                ));
            }
        }

        // check temperature label payload
        if(payload.getLabel().equals("Temp"))
        {
            // send raw data to WebSocket topic
            messagingTemplate.convertAndSend("/topic/temp-value", payload.getValue());
        }
    }
}

