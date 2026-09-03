package com.agent.aetheris.application.service.weather;

import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

@Service
public class WeatherService {
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Default fallback coordinates (New York)
    private static final double DEFAULT_LATITUDE = 40.7128;
    private static final double DEFAULT_LONGITUDE = -74.0060;

    public WeatherService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /**
     * Detects the user's location via IP geolocation (ip-api.com),
     * then fetches current weather data from Open-Meteo for that location.
     */
    public CompletableFuture<WeatherData> getCurrentWeather() {
        return getGeoLocation().thenCompose(geo -> {
            double lat = (geo != null) ? geo.lat() : DEFAULT_LATITUDE;
            double lon = (geo != null) ? geo.lon() : DEFAULT_LONGITUDE;
            String city = (geo != null) ? geo.city() : "New York";
            String country = (geo != null) ? geo.country() : "US";

            String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=relative_humidity_2m,cloud_cover,surface_pressure,pressure_msl",
                lat, lon
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenApply(response -> {
                        try {
                            OpenMeteoResponse meteoResponse = objectMapper.readValue(response.body(), OpenMeteoResponse.class);
                            if (meteoResponse != null && meteoResponse.current() != null) {
                                return new WeatherData(
                                    meteoResponse.current().relative_humidity_2m(),
                                    meteoResponse.current().cloud_cover(),
                                    meteoResponse.current().pressure_msl(),
                                    meteoResponse.current().surface_pressure(),
                                    city,
                                    country
                                );
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return null;
                    });
        });
    }

    /**
     * Calls ip-api.com to resolve the user's approximate location from their public IP.
     */
    private CompletableFuture<GeoLocation> getGeoLocation() {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://ip-api.com/json/?fields=lat,lon,city,country"))
                .GET()
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> {
                    try {
                        return objectMapper.readValue(response.body(), GeoLocation.class);
                    } catch (Exception e) {
                        System.err.println("Failed to detect location via IP, falling back to defaults: " + e.getMessage());
                        return null;
                    }
                })
                .exceptionally(ex -> {
                    System.err.println("Geolocation request failed, falling back to defaults: " + ex.getMessage());
                    return null;
                });
    }

    public record WeatherData(int relativeHumidity, int cloudCover, double seaLevelPressure, double surfacePressure, String city, String country) {}

    public record GeoLocation(double lat, double lon, String city, String country) {}

    public record OpenMeteoResponse(Current current) {}
    
    public record Current(int relative_humidity_2m, int cloud_cover, double pressure_msl, double surface_pressure) {}
}
