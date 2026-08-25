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
import com.agent.aetheris.application.service.shared.StatusLabelService;
import com.agent.aetheris.application.service.home.ArduinoConnectionService;
import com.agent.aetheris.application.service.home.DataReadingThreadService;
import org.springframework.context.annotation.Lazy;
import com.agent.aetheris.presentation.utility.EntranceAnimationUtility;
import com.agent.aetheris.presentation.utility.ParticleBackgroundManager;
import com.fazecast.jSerialComm.SerialPort;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Button;
import javafx.scene.shape.Circle;
import javafx.scene.control.Label;

@Component
public class HomeController implements Initializable {

    @FXML
    private Canvas particleCanvas;
    @FXML
    private VBox contentArea;
    @FXML
    private HBox comPortBox;
    @FXML
    private ComboBox<String> comPortCombo;
    @FXML
    private VBox gaugesBox;
    @FXML
    private HBox statusPillBox;
    @FXML
    private VBox sidebarCardBox;
    @FXML
    private HBox statsPanelBox;
    @FXML
    private VBox weatherCardBox;

    @FXML
    public Button playButton;
    @FXML
    public Button stopButton;
    @FXML
    public Button autodetectButton;
    @FXML
    public Button resetButton;

    @FXML
    public Circle statusDot;
    @FXML
    public Label statusText;

    public boolean keepReading = false;

    private ParticleBackgroundManager backgroundManager;

    private final StatusLabelService statusLabelService;
    private final ArduinoConnectionService arduinoConnectionService;
    private final DataReadingThreadService dataReadingThreadService;

    public HomeController(StatusLabelService statusLabelService,
                          ArduinoConnectionService arduinoConnectionService,
                          @Lazy DataReadingThreadService dataReadingThreadService) {
        this.statusLabelService = statusLabelService;
        this.arduinoConnectionService = arduinoConnectionService;
        this.dataReadingThreadService = dataReadingThreadService;
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        if (statusDot != null) {
            statusDot.fillProperty().bind(statusLabelService.statusColorProperty());
        }
        if (statusText != null) {
            statusText.textFillProperty().bind(statusLabelService.statusColorProperty());
            statusText.textProperty().bind(statusLabelService.statusTextProperty());
        }

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

                // Stop the animation if the canvas is removed from the scene (e.g. scene
                // switched)
                particleCanvas.sceneProperty().addListener((obs, oldScene, newScene) -> {
                    if (newScene == null && backgroundManager != null) {
                        backgroundManager.stopAnimation();
                    }
                });
            }
            startEntranceAnimations();
            loadAvailablePorts();

            // initialize all the buttons
            initializeButtons();
        });
    }

    private void loadAvailablePorts() {
        if (comPortCombo != null) {
            comPortCombo.getItems().clear();
            comPortCombo.getItems().add("Select");

            SerialPort[] ports = SerialPort.getCommPorts();
            for (SerialPort port : ports) {
                comPortCombo.getItems().add(port.getSystemPortName());
            }

            // If ports exist
            if (comPortCombo.getItems().size() > 1) {
                comPortCombo.setDisable(false);
                if (autodetectButton != null)
                    autodetectButton.setDisable(false);
                statusLabelService.setStatus("INFO", "Arduino Ports Detected.");
            } else {
                comPortCombo.getSelectionModel().selectFirst();
                System.out.println("No serial ports found.");
                statusLabelService.setStatus("ERROR", "No ports found.");
                comPortCombo.setDisable(true);
                if (autodetectButton != null)
                    autodetectButton.setDisable(true);
            }
        }
    }

    private void initializeButtons() {
        // disable stop button at the start
        stopButton.setDisable(true);
        playButton.setDisable(true);

        comPortCombo.setOnAction(event -> {
            String selectedPort = comPortCombo.getSelectionModel().getSelectedItem();
            if (selectedPort == null || selectedPort.equals("Select")) {
                playButton.setDisable(true);
                return;
            }

            System.out.println("COM Port selected: " + selectedPort);
            keepReading = false;
            comPortCombo.setDisable(true);
            playButton.setDisable(true);
            statusLabelService.setStatus("INFO", selectedPort + " initializing...");

            arduinoConnectionService.connectAsync(selectedPort).thenAccept(result -> {
                Platform.runLater(() -> {
                    comPortCombo.setDisable(false);
                    if (result.success()) {
                        statusLabelService.setStatus("INFO", result.message());
                        playButton.setDisable(false);
                        playButton.requestFocus();
                    } else {
                        statusLabelService.setStatus("ERROR", result.message());
                    }
                });
            });
        });

        resetButton.setOnAction(event -> {
            resetButton.setDisable(true);
            new Thread(() -> {
                statusLabelService.setStatus("INFO", "Detecting Arduino ports...");
                System.out.println("Detecting Arduino ports...");
                // wait for 2 seconds
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                Platform.runLater(() -> {
                    loadAvailablePorts();
                    resetButton.setDisable(false);
                });
            }).start();
        });

        playButton.setOnAction(event -> {
            // handle play button click
            if (arduinoConnectionService.getCurrentPort() != null) {
                arduinoConnectionService.getCurrentPort().setComPortParameters(115200, 8, 1, 0); // Set baud rate to 115200
                dataReadingThreadService.startReading();
                stopButton.setDisable(false);
                playButton.setDisable(true);
                statusLabelService.setStatus("INFO", "Start Reading");
            } else {
                statusLabelService.setStatus("ERROR", "No Arduino port detected.");
            }
        });

        stopButton.setOnAction(event -> {
            // handle stop button click
            dataReadingThreadService.stopReading();
            stopButton.setDisable(true);
            playButton.setDisable(false);
            statusLabelService.setStatus("INFO", "Stopped Reading.");
        });
    }

    private void startEntranceAnimations() {
        if (comPortBox == null)
            return; // Guard in case views aren't loaded

        comPortBox.setOpacity(0);
        gaugesBox.setOpacity(0);
        statusPillBox.setOpacity(0);
        sidebarCardBox.setOpacity(0);
        statsPanelBox.setOpacity(0);
        if (weatherCardBox != null)
            weatherCardBox.setOpacity(0);

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
