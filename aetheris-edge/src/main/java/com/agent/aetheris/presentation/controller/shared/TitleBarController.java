package com.agent.aetheris.presentation.controller.shared;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.image.ImageView;
import javafx.stage.Stage;
import org.springframework.stereotype.Component;

@Component
public class TitleBarController {

    @FXML private ImageView appIcon;
    @FXML private Button btnMinimize;
    @FXML private Button btnClose;

    @FXML
    private void handleClose() {
        if (btnClose != null && btnClose.getScene() != null) {
            Stage stage = (Stage) btnClose.getScene().getWindow();
            stage.close();
        }
        Platform.exit();
    }

    @FXML
    private void handleMinimize() {
        if (btnMinimize != null && btnMinimize.getScene() != null) {
            Stage stage = (Stage) btnMinimize.getScene().getWindow();
            stage.setIconified(true);
        }
    }

    @FXML
    private void handleMaximize() {
        if (btnMinimize != null && btnMinimize.getScene() != null) {
            Stage stage = (Stage) btnMinimize.getScene().getWindow();
            stage.setMaximized(!stage.isMaximized());
        }
    }
}
