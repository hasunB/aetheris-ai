package com.agent.aetheris;

import com.agent.aetheris.presentation.utility.SceneManager;
import javafx.stage.Stage;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import javafx.stage.StageStyle;

@Component
public class StageInitializer {
    
    private final SceneManager sceneManager;

    public StageInitializer(SceneManager sceneManager) {
        this.sceneManager = sceneManager;
    }

    @EventListener
    public void onApplicationEvent(StageReadyEvent event) {
        Stage primaryStage = event.getStage();
        sceneManager.setPrimaryStage(primaryStage);
        sceneManager.switchScene("/fxml/home.fxml");
        primaryStage.setTitle("Aetheris Edge");
        primaryStage.setWidth(700);
        primaryStage.setHeight(500);
        primaryStage.centerOnScreen();
        primaryStage.resizableProperty().setValue(false);
        // primaryStage.getIcons().add(new Image(Objects.requireNonNull(getClass().getResourceAsStream("/icons/logo.png"))));
        // remove titlebar using css
        primaryStage.initStyle(StageStyle.TRANSPARENT);
        // add border radius using css
        primaryStage.sceneProperty().addListener((obs, oldScene, newScene) -> {
            if (newScene != null) {
                newScene.getStylesheets().add(getClass().getResource("/css/home.css").toExternalForm());
            }
        });
        primaryStage.show();
    }
}

