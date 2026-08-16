package com.agent.aetheris;

import javafx.application.Application;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AetherisApplication {

	public static void main(String[] args) {
		Application.launch(AetherisEdgeFxApplication.class, args);
	}

}
