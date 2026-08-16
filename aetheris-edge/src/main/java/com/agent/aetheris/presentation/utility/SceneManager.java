package com.agent.aetheris.presentation.utility;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import javafx.scene.paint.Color;
import java.io.IOException;

@Component
public class SceneManager {
    private final ApplicationContext applicationContext;
    private Stage primaryStage;

    public SceneManager(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    public void setPrimaryStage(Stage primaryStage) {
        this.primaryStage = primaryStage;
    }

    private String currentSceneFxml;

    public void switchScene(String fxmlFile) {
        if (fxmlFile.equals(currentSceneFxml)) {
            return; // Already on this scene
        }
        try {
            FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource(fxmlFile));
            fxmlLoader.setControllerFactory(applicationContext::getBean);
            Parent root = fxmlLoader.load();
            if (primaryStage.getScene() == null) {
                double w = primaryStage.getWidth();
                double h = primaryStage.getHeight();
                Scene scene = (w > 0 && h > 0)
                        ? new Scene(root, w, h)
                        : new Scene(root);
                scene.setFill(Color.TRANSPARENT);
                primaryStage.setScene(scene);
            } else {
                primaryStage.getScene().setRoot(root);
            }
            currentSceneFxml = fxmlFile;
        } catch (IOException e) {
            throw new RuntimeException("Failed to load scene: " + fxmlFile, e);
        }
    }
}
