package com.ai.aetheris.application.services.sensorData;

import com.ai.aetheris.application.dtos.SensorPayloadDTO;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.ai.aetheris.application.services.forcasting.SignalToNoiseRatioService;
import com.ai.aetheris.application.services.forcasting.AverageSeeingService;
import com.ai.aetheris.application.services.forcasting.FriedParameterService;
import com.ai.aetheris.application.services.forcasting.RateofDegradationService;

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

        // check the label of the payload
        if(payload.getLabel().equals("Input"))
        {
            double snrDb = signalToNoiseRatioService.computeSnr(payload.getValue());
            if (!Double.isNaN(snrDb)) {
                log.info("Signal-to-Noise Ratio (SNR): {} dB  [window={} samples]",
                        String.format("%.2f", snrDb), signalToNoiseRatioService.getWindowSize());
            }
        }

        if(payload.getLabel().equals("Seeing"))
        {
            double avgSeeing = averageSeeingService.getAverageSeeing(payload.getValue());
            if (!Double.isNaN(avgSeeing)) {
                log.info("Average Seeing: {}  [window={} samples]",
                        String.format("%.2f", avgSeeing), averageSeeingService.getWindowSize());
            }

            double friedParameter = friedParameterService.calculateFriedParameter(avgSeeing);
            if (!Double.isNaN(friedParameter)) {
                log.info("Fried Parameter: {} mm  [window={} samples]",
                        String.format("%.2f", friedParameter), friedParameterService.getWindowSize());
            }

            double rateOfDegradation = rateOfDegradationService.calculateRateOfDegradation(avgSeeing);
            if (!Double.isNaN(rateOfDegradation)) {
                log.info("Rate of Degradation: {} arcsec/sec  [window={} samples]",
                        String.format("%.2f", rateOfDegradation), rateOfDegradationService.getWindowSize());
            }
        }

        // Broadcast the received data to the WebSocket topic
        messagingTemplate.convertAndSend("/topic/sensor-data", payload);
    }
}

