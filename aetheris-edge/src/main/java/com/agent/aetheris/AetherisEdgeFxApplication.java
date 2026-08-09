package com.agent.aetheris;


import javafx.application.Application;
import javafx.application.HostServices;
import javafx.application.Platform;
import javafx.stage.Stage;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.GenericApplicationContext;

public class AetherisEdgeFxApplication extends Application {

    private ConfigurableApplicationContext context;

    @Override
    public void init() {
        // Start Spring Boot in the background when JavaFX initializes
        ApplicationContextInitializer<GenericApplicationContext> initializer = 
            ac -> {
                ac.registerBean(Application.class, () -> AetherisEdgeFxApplication.this);
                ac.registerBean(Parameters.class, this::getParameters);
                ac.registerBean(HostServices.class, this::getHostServices);
            };

        this.context = new SpringApplicationBuilder()
                .sources(AetherisApplication.class)
                .initializers(initializer)
                .run(getParameters().getRaw().toArray(new String[0]));
    }

    @Override
    public void start(Stage primaryStage) {
        // Publish the event to Spring so it can attach the UI controllers
        this.context.publishEvent(new StageReadyEvent(primaryStage));
    }

    @Override
    public void stop() {
        this.context.close();
        Platform.exit();
    }
}
