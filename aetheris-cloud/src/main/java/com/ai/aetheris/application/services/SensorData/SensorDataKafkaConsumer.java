package com.ai.aetheris.application.services.SensorData;

import com.ai.aetheris.application.dtos.SensorPayloadDTO;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorDataKafkaConsumer {

    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "sensor-data", groupId = "sensor-data-group", containerFactory = "kafkaListenerContainerFactory")
    public void consume(SensorPayloadDTO payload) {
        log.info("Received sensor data payload: {}", payload);
        // Broadcast the received data to the WebSocket topic
        messagingTemplate.convertAndSend("/topic/sensor-data", payload);
    }
}
