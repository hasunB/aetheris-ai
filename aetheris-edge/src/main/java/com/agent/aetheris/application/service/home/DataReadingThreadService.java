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
    private volatile boolean keepReading = false;

    public DataReadingThreadService(@Lazy HomeController homeController, StatusLabelService statusLabelService, ArduinoConnectionService arduinoConnectionService) {
        this.homeController = homeController;
        this.statusLabelService = statusLabelService;
        this.arduinoConnectionService = arduinoConnectionService;
    }
    
    public void startReading() {
        readThread = new Thread(() -> {
            keepReading = true;
            System.out.println("[DEBUG] Read thread started. keepReading=" + keepReading);
            StringBuilder lineBuffer = new StringBuilder();
            try {
                Thread.sleep(2000); // Wait for 2 seconds for further initialization
                arduinoConnectionService.getCurrentPort().flushIOBuffers(); // Discard any stale buffered data
                while (keepReading) {
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
                            String rawData = new String(readBuffer, 0, numRead);
                            System.out.println(rawData);
                            parseAndDisplayData(rawData);
                        }
                    }

                    Thread.sleep(1000); // poll faster (every 1000ms) to drain buffer smoothly
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        readThread.setName("arduino-read-thread");
        readThread.setDaemon(true);
        readThread.start();
    }

    public void cancelReading() {
        keepReading = false;
    }

    public void stopReading() {
        keepReading = false;
        if (readThread != null) {
            readThread.interrupt();
        }
        arduinoConnectionService.closeCurrentPort();
    }

    private void handleDisconnect() {
        statusLabelService.setStatus("ERROR", "Device Disconnected");
        javafx.application.Platform.runLater(() -> {
            homeController.handleDeviceDisconnected();
        });
    }

    private void parseAndDisplayData(String rawData) {
        String[] lines = rawData.split("\\r?\\n");
        for (String line : lines) {
            if (line.trim().isEmpty()) continue;

            try {
                // Remove "Data: " prefix if present to normalize
                String cleanLine = line.replace("Data: ", "").trim();
                
                // Split by whitespace
                String[] parts = cleanLine.split("\\s+");
                
                if (parts.length >= 2) {
                    String label = parts[0];
                    String value = parts[1];
                    
                    try {
                        Double.parseDouble(value); // Verify it's a number
                        
                        // Update UI on JavaFX thread
                        javafx.application.Platform.runLater(() -> {
                            if (label.equalsIgnoreCase("Seeing")) {
                                homeController.updateGaugeValues(value, null, null);
                            } else if (label.equalsIgnoreCase("Input")) {
                                homeController.updateGaugeValues(null, value, null);
                            } else if (label.startsWith("Temp")) {
                                homeController.updateGaugeValues(null, null, value);
                            }
                        });
                    } catch (NumberFormatException ex) {
                        System.out.println("[DEBUG] Invalid number format in line: " + line);
                    }
                } else {
                    System.out.println("[DEBUG] Not enough parts in line: " + line);
                }
            } catch (NumberFormatException e) {
                System.err.println("[ERROR] Failed to parse line: " + line + " | " + e.getMessage());
            }
        }
    }
}
