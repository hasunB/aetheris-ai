package com.agent.aetheris.presentation.controller.shared;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import javafx.scene.media.MediaView;
import javafx.scene.shape.Rectangle;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.util.ResourceBundle;

@Component
public class VideoCardController implements Initializable {

    private static final double CARD_WIDTH = 75.0;
    private static final double CARD_HEIGHT = 140.0;

    @FXML
    private VBox weatherCardBox;

    @FXML
    private StackPane mediaContainer;

    @FXML
    private MediaView mediaView;

    private Rectangle clip;
    private Media media;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Enforce rigid card dimensions so media cannot expand the container or window
        weatherCardBox.setPrefSize(CARD_WIDTH, CARD_HEIGHT);
        weatherCardBox.setMinSize(CARD_WIDTH, CARD_HEIGHT);
        weatherCardBox.setMaxSize(CARD_WIDTH, CARD_HEIGHT);

        mediaContainer.setPrefSize(CARD_WIDTH, CARD_HEIGHT);
        mediaContainer.setMinSize(CARD_WIDTH, CARD_HEIGHT);
        mediaContainer.setMaxSize(CARD_WIDTH, CARD_HEIGHT);

        // Rounded clip matching sidebar-card (radius 25)
        clip = new Rectangle(CARD_WIDTH, CARD_HEIGHT);
        clip.setArcWidth(30);
        clip.setArcHeight(30);
        weatherCardBox.setClip(clip);

        // Pre-set dimensions so MediaView doesn't burst to unscaled 1080p on launch
        mediaView.setPreserveRatio(true);
        mediaView.setFitWidth(CARD_WIDTH);
        mediaView.setFitHeight(CARD_HEIGHT);

        URL mediaUrl = getClass().getResource("/assets/video.mp4");
        if (mediaUrl != null) {
            media = new Media(mediaUrl.toExternalForm());
            MediaPlayer mediaPlayer = new MediaPlayer(media);
            mediaPlayer.setCycleCount(MediaPlayer.INDEFINITE);
            mediaView.setMediaPlayer(mediaPlayer);

            mediaPlayer.setOnReady(() -> {
                Platform.runLater(this::updateMediaCoverSize);
            });

            // Keep in sync with card dimensions if dynamic layout occurs
            weatherCardBox.widthProperty().addListener((obs, o, n) -> updateMediaCoverSize());
            weatherCardBox.heightProperty().addListener((obs, o, n) -> updateMediaCoverSize());

            mediaPlayer.play();
        } else {
            System.err.println("Video not found");
        }
    }

    private void updateMediaCoverSize() {
        double containerWidth = weatherCardBox.getWidth() > 0 ? weatherCardBox.getWidth() : CARD_WIDTH;
        double containerHeight = weatherCardBox.getHeight() > 0 ? weatherCardBox.getHeight() : CARD_HEIGHT;

        clip.setWidth(containerWidth);
        clip.setHeight(containerHeight);

        if (media != null && media.getWidth() > 0 && media.getHeight() > 0) {
            double mediaWidth = media.getWidth();
            double mediaHeight = media.getHeight();

            // Object-fit: cover, center center logic
            // Scale so that both width and height fully cover the container
            double scale = Math.max(containerWidth / mediaWidth, containerHeight / mediaHeight);

            mediaView.setFitWidth(mediaWidth * scale);
            mediaView.setFitHeight(mediaHeight * scale);
        }
    }
}
