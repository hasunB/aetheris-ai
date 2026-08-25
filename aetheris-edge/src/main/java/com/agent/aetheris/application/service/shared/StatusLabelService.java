package com.agent.aetheris.application.service.shared;

import javafx.application.Platform;
import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.property.StringProperty;
import javafx.scene.paint.Color;
import javafx.scene.paint.Paint;
import org.springframework.stereotype.Service;

@Service
public class StatusLabelService {

    private final StringProperty statusTextProperty = new SimpleStringProperty("Device is Connected");
    private final ObjectProperty<Paint> statusColorProperty = new SimpleObjectProperty<>(Color.web("#4BB543"));

    public StringProperty statusTextProperty() {
        return statusTextProperty;
    }

    public ObjectProperty<Paint> statusColorProperty() {
        return statusColorProperty;
    }

    public void setStatus(String type, String text) {
        Color color;
        if ("WARNING".equalsIgnoreCase(type)) {
            color = Color.web("#FFA500");
        } else if ("ERROR".equalsIgnoreCase(type)) {
            color = Color.web("#FF0000");
        } else {
            color = Color.web("#4BB543");
        }

        Platform.runLater(() -> {
            statusColorProperty.set(color);
            statusTextProperty.set(text);
        });
    }
}
