package com.agent.aetheris;

import com.agent.aetheris.presentation.utility.SceneManager;
import com.agent.aetheris.presentation.utility.InternetMonitor;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import javafx.stage.StageStyle;

import java.util.Objects;

@Component
public class StageInitializer {
    
    private final SceneManager sceneManager;
    private final InternetMonitor internetMonitor;

    public StageInitializer(SceneManager sceneManager, InternetMonitor internetMonitor) {
        this.sceneManager = sceneManager;
        this.internetMonitor = internetMonitor;
    }

    @EventListener
    public void onApplicationEvent(StageReadyEvent event) {
        Stage primaryStage = event.getStage();
        sceneManager.setPrimaryStage(primaryStage);

        // Configure stage properties FIRST (initStyle must be before show/setScene)
        primaryStage.initStyle(StageStyle.TRANSPARENT);
        primaryStage.setTitle("Aetheris Edge");
        primaryStage.setWidth(700);
        primaryStage.setHeight(500);
        primaryStage.resizableProperty().setValue(false);
        primaryStage.getIcons().add(new Image(Objects.requireNonNull(getClass().getResourceAsStream("/assets/desktop-icon.png"))));
        
        // Now load the initial scene (stage dimensions are already set)
        sceneManager.switchScene("/fxml/loading.fxml");
        primaryStage.centerOnScreen();
        primaryStage.show();

        // Start internet monitoring after UI is visible
        internetMonitor.startMonitoring();
    }
}

