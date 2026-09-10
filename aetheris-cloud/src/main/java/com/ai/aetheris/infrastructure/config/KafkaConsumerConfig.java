package com.ai.aetheris.infrastructure.config;

import com.ai.aetheris.application.dtos.SensorPayloadDTO;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Bean
    public ConsumerFactory<String, SensorPayloadDTO> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "sensor-data-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");

        // Create an ObjectMapper and register the JavaTimeModule
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        @SuppressWarnings("deprecation")
        JsonDeserializer<SensorPayloadDTO> deserializer = new JsonDeserializer<>(SensorPayloadDTO.class, objectMapper);
        deserializer.addTrustedPackages("*");
        // Ignore __TypeId__ header from producer (it has a different package: com.agent
        // vs com.ai)
        deserializer.setUseTypeHeaders(false);

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, SensorPayloadDTO> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, SensorPayloadDTO> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}
