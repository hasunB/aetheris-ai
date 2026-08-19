package com.agent.aetheris.presentation.controller;

import javafx.application.Platform;
import javafx.scene.layout.HBox;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.canvas.Canvas;
import java.net.URL;
import java.util.ResourceBundle;

import javafx.scene.layout.VBox;
import org.springframework.stereotype.Component;

import com.agent.aetheris.presentation.utility.EntranceAnimationUtility;
import com.agent.aetheris.presentation.utility.ParticleBackgroundManager;

import com.fazecast.jSerialComm.SerialPort;
import javafx.scene.control.ComboBox;

@Component
public class HomeController implements Initializable {

    @FXML private Canvas particleCanvas;
    @FXML private VBox contentArea;
    @FXML private HBox comPortBox;
    @FXML private ComboBox<String> comPortCombo;
    @FXML private VBox gaugesBox;
    @FXML private HBox statusPillBox;
    @FXML private VBox sidebarCardBox;
    @FXML private HBox statsPanelBox;
    @FXML private VBox weatherCardBox;

    private ParticleBackgroundManager backgroundManager;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Bind canvas size to parent
        Platform.runLater(() -> {
            if (particleCanvas != null) {
                if (particleCanvas.getParent() != null) {
                    var parent = particleCanvas.getParent();
                    particleCanvas.widthProperty().bind(
                            ((javafx.scene.layout.Region) parent).widthProperty());
                    particleCanvas.heightProperty().bind(
                            ((javafx.scene.layout.Region) parent).heightProperty());
                }

                backgroundManager = new ParticleBackgroundManager(particleCanvas);
                backgroundManager.initParticles();
                backgroundManager.startAnimation();

                // Stop the animation if the canvas is removed from the scene (e.g. scene switched)
                particleCanvas.sceneProperty().addListener((obs, oldScene, newScene) -> {
                    if (newScene == null && backgroundManager != null) {
                        backgroundManager.stopAnimation();
                    }
                });
            }
            startEntranceAnimations();
            loadAvailablePorts();
        });
    }

    private void loadAvailablePorts() {
        if (comPortCombo != null) {
            comPortCombo.getItems().clear();
            comPortCombo.getItems().add("None");
            
            SerialPort[] ports = SerialPort.getCommPorts();
            for (SerialPort port : ports) {
                comPortCombo.getItems().add(port.getSystemPortName());
            }

            // Auto-select the first available port if one exists
            if (comPortCombo.getItems().size() > 1) {
                comPortCombo.getSelectionModel().select(1);
            } else {
                comPortCombo.getSelectionModel().selectFirst();
            }
        }
    }

    private void startEntranceAnimations() {
        if (comPortBox == null) return; // Guard in case views aren't loaded

        comPortBox.setOpacity(0);
        gaugesBox.setOpacity(0);
        statusPillBox.setOpacity(0);
        sidebarCardBox.setOpacity(0);
        statsPanelBox.setOpacity(0);
        if (weatherCardBox != null) weatherCardBox.setOpacity(0);

        EntranceAnimationUtility.animateBottomToTop(comPortBox, 0.0);
        EntranceAnimationUtility.animateBottomToTop(gaugesBox, 0.2);
        EntranceAnimationUtility.animateBottomToTop(statsPanelBox, 0.4);
        EntranceAnimationUtility.animateBottomToTop(statusPillBox, 0.6);
        
        EntranceAnimationUtility.animateRightToLeft(sidebarCardBox, 0.2);
        if (weatherCardBox != null) {
            EntranceAnimationUtility.animateRightToLeft(weatherCardBox, 0.3);
        }
    }
}
