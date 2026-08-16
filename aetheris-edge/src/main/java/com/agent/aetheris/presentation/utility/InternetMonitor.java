package com.agent.aetheris.presentation.utility;

import com.agent.aetheris.application.service.internet.ConnectivityService;
import javafx.application.Platform;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InternetMonitor {

    private final ConnectivityService connectivityService;
    private final SceneManager sceneManager;
    private boolean isAppStarted = false;

    public InternetMonitor(ConnectivityService connectivityService, SceneManager sceneManager) {
        this.connectivityService = connectivityService;
        this.sceneManager = sceneManager;
    }

    public void startMonitoring() {
        this.isAppStarted = true;
        checkConnectivityAndSwitchScene();
    }

    @Scheduled(fixedDelay = 5000)
    public void monitorInternet() {
        if (!isAppStarted) return;
        checkConnectivityAndSwitchScene();
    }

    private void checkConnectivityAndSwitchScene() {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            boolean connected = connectivityService.isConnected();
            Platform.runLater(() -> {
                if (connected) {
                    sceneManager.switchScene("/fxml/home.fxml");
                } else {
                    sceneManager.switchScene("/fxml/reconnecting.fxml");
                }
            });
        });
    }
}
