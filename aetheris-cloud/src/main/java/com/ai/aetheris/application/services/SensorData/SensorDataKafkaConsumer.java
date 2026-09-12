package com.ai.aetheris.application.services.sensorData;

import com.ai.aetheris.application.dtos.SensorPayloadDTO;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.ai.aetheris.application.services.forcasting.SignalToNoiseRatioService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorDataKafkaConsumer {

    private final SimpMessagingTemplate messagingTemplate;
    private final SignalToNoiseRatioService signalToNoiseRatioService;

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

        // Broadcast the received data to the WebSocket topic
        messagingTemplate.convertAndSend("/topic/sensor-data", payload);
    }
}

