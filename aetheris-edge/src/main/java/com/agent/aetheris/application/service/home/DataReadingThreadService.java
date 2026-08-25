package com.agent.aetheris.application.service.home;

import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;
import com.fazecast.jSerialComm.SerialPort;
import com.agent.aetheris.application.service.shared.StatusLabelService;
import com.agent.aetheris.presentation.controller.HomeController;
import com.agent.aetheris.application.service.home.ArduinoConnectionService;

@Service
public class DataReadingThreadService{

    private HomeController homeController;
    private StatusLabelService statusLabelService;
    private ArduinoConnectionService arduinoConnectionService;
    private Thread readThread;

    public DataReadingThreadService(@Lazy HomeController homeController, StatusLabelService statusLabelService, ArduinoConnectionService arduinoConnectionService) {
        this.homeController = homeController;
        this.statusLabelService = statusLabelService;
        this.arduinoConnectionService = arduinoConnectionService;
    }
    
    public void startReading() {
        homeController.keepReading = true;
        readThread = new Thread(() -> {
            StringBuilder lineBuffer = new StringBuilder();
            try {
                while (homeController.keepReading) {
                    SerialPort port = arduinoConnectionService.getCurrentPort();

                    if (port == null || !port.isOpen()) {
                        System.out.println("Device Disconnected (port closed).");
                        handleDisconnect();
                        break;
                    }

                    int available = port.bytesAvailable();
                    if (available < 0) {
                        System.out.println("Device Disconnected (read error).");
                        handleDisconnect();
                        break;
                    }

                    if (available > 0) {
                        byte[] readBuffer = new byte[available];
                        int numRead = port.readBytes(readBuffer, readBuffer.length);
                        if (numRead > 0) {
                            String chunk = new String(readBuffer, 0, numRead);
                            lineBuffer.append(chunk);

                            // Process all complete lines in the buffer
                            int newlineIdx;
                            while ((newlineIdx = lineBuffer.indexOf("\n")) != -1) {
                                String line = lineBuffer.substring(0, newlineIdx).trim(); // extract line and strip \r
                                lineBuffer.delete(0, newlineIdx + 1); // remove from buffer

                                if (!line.isBlank()) {
                                    String formatted = processSingleLine(line);
                                    if (formatted != null) {
                                        System.out.print(formatted);
                                        // parseAndShowData(formatted);
                                    }
                                }
                            }
                        }
                    }

                    Thread.sleep(100); // poll faster (every 100ms) to drain buffer smoothly
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        readThread.setName("arduino-read-thread");
        readThread.setDaemon(true);
        readThread.start();
    }

    public void stopReading() {
        homeController.keepReading = false;
        if (readThread != null) {
            readThread.interrupt();
        }
        arduinoConnectionService.closeCurrentPort();
    }

    private void handleDisconnect() {
        statusLabelService.setStatus("ERROR", "Device Disconnected");
        javafx.application.Platform.runLater(() -> {
            homeController.playButton.setDisable(true);
            homeController.stopButton.setDisable(true);
        });
    }

    private static String processSingleLine(String line) {
        if (line.startsWith("Seeing") || line.startsWith("Input") || line.startsWith("Temp.")) {
            String[] parts = line.split("\\s+");
            if (parts.length == 2) {
                try {
                    double value = Double.parseDouble(parts[1]);
                    if (line.startsWith("Input")) {
                        return String.format("Volt   %.2f%n", value);
                    } else {
                        return String.format("%s   %.2f%n", parts[0], value);
                    }
                } catch (NumberFormatException e) {
                    // fall through to null
                }
            }
        }
        return null; // Ignore unrecognized or malformed lines
    }
}
