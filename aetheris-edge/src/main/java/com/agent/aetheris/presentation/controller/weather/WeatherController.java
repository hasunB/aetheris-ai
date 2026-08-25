package com.agent.aetheris.presentation.controller.weather;

import com.agent.aetheris.application.service.weather.WeatherService;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import org.springframework.stereotype.Controller;

@Controller
public class WeatherController {

    @FXML private Label statValue1;
    @FXML private Label statValue2;
    @FXML private Label statValue3;
    @FXML private Label statValue4;

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @FXML
    public void initialize() {
        fetchWeatherData();
    }

    public void fetchWeatherData() {
        weatherService.getCurrentWeather().thenAccept(weather -> {
            Platform.runLater(() -> {
                if (weather != null) {
                    if (statValue1 != null) statValue1.setText(String.valueOf(weather.relativeHumidity()));
                    if (statValue2 != null) statValue2.setText(String.valueOf(weather.cloudCover()));
                    if (statValue3 != null) statValue3.setText(String.valueOf(weather.seaLevelPressure()));
                    if (statValue4 != null) statValue4.setText(String.valueOf(weather.surfacePressure()));
                }
            });
        });
    }
}
