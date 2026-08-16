package com.agent.aetheris.presentation.controller;

import javafx.fxml.FXML;
import org.springframework.stereotype.Component;

@Component
public class ReconnectingController {
    
    @FXML
    private void handleRefresh() {
        System.out.println("Refresh button clicked! Retrying connection...");
        // Logic to retry connecting to MQTT or server will go here
    }
}
