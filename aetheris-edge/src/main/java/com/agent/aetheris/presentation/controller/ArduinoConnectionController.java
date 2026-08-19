package com.agent.aetheris.presentation.controller;

import com.agent.aetheris.application.service.home.ArduinoConnectionService;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.stage.Stage;

import org.springframework.stereotype.Component;

@Component
public class ArduinoConnectionController {

    @FXML private ComboBox<String> portComboBox;
    @FXML private Button connectButton;
    @FXML private Label statusLabel;

    private Stage loadingDialog;

    private final ArduinoConnectionService connectionService;

    ArduinoConnectionController(ArduinoConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @FXML
    public void onPortSelected() {
        int selectedIndex = portComboBox.getSelectionModel().getSelectedIndex();
        String selectedPort = portComboBox.getSelectionModel().getSelectedItem();

        if (selectedIndex == 0 || selectedPort == null) {
            connectionService.closeCurrentPort();
            if (connectButton != null) connectButton.setDisable(true);
            showStatus("None");
            return;
        }

        if (loadingDialog != null) {
            loadingDialog.show();
        }

        // Use the new connectAsync method which returns a CompletableFuture
        connectionService.connectAsync(selectedPort)
            .thenAcceptAsync(result -> {
                if (loadingDialog != null) {
                    loadingDialog.hide();
                }

                showStatus(result.message());
                if (connectButton != null) {
                    connectButton.setDisable(!result.success());
                    if (result.success()) {
                        connectButton.requestFocus();
                    }
                }
            }, Platform::runLater)
            .exceptionally(ex -> {
                Platform.runLater(() -> {
                    if (loadingDialog != null) {
                        loadingDialog.hide();
                    }
                    showStatus("Unexpected error opening " + selectedPort);
                    ex.printStackTrace();
                });
                return null;
            });
    }

    private void showStatus(String message) {
        if (statusLabel != null) {
            statusLabel.setText(message);
        } else {
            System.out.println("Status: " + message);
        }
    }
}
