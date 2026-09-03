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

            double targetWidth = -1;
            double targetHeight = -1;
            if (root instanceof javafx.scene.layout.Region region) {
                if (region.getPrefWidth() > 0) targetWidth = region.getPrefWidth();
                if (region.getPrefHeight() > 0) targetHeight = region.getPrefHeight();
            }

            if (primaryStage.getScene() == null) {
                double w = targetWidth > 0 ? targetWidth : (primaryStage.getWidth() > 0 ? primaryStage.getWidth() : 700);
                double h = targetHeight > 0 ? targetHeight : (primaryStage.getHeight() > 0 ? primaryStage.getHeight() : 500);
                Scene scene = new Scene(root, w, h);
                scene.setFill(Color.TRANSPARENT);
                primaryStage.setScene(scene);
                primaryStage.setWidth(w);
                primaryStage.setHeight(h);
            } else {
                primaryStage.getScene().setRoot(root);
                if (targetWidth > 0 && targetHeight > 0) {
                    primaryStage.setWidth(targetWidth);
                    primaryStage.setHeight(targetHeight);
                    primaryStage.centerOnScreen();
                }
            }
            currentSceneFxml = fxmlFile;
        } catch (IOException e) {
            throw new RuntimeException("Failed to load scene: " + fxmlFile, e);
        }
    }
}
