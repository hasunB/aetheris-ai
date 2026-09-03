package com.agent.aetheris.application.service.home;

import com.fazecast.jSerialComm.SerialPort;
import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;

@Service
public class ArduinoConnectionService {

    private SerialPort arduinoPort;
    private static final int PORT_SETTLE_DELAY_MS = 5000;

    public void closeCurrentPort() {
        if (arduinoPort != null && arduinoPort.isOpen()) {
            arduinoPort.closePort();
        }
    }

    public SerialPort getCurrentPort() {
        return arduinoPort;
    }

    /**
     * Opens the given port name asynchronously after a settle delay.
     * This replaces the old SwingWorker logic and doesn't block the UI thread.
     */
    public CompletableFuture<ConnectionResult> connectAsync(String portName) {
        return CompletableFuture.supplyAsync(() -> {
            closeCurrentPort();

            // Equivalent to 'if (jComboBox1.getSelectedIndex() == 0)' handling
            if (portName == null || portName.trim().isEmpty() || portName.equalsIgnoreCase("None")) {
                return new ConnectionResult(false, portName, "No port selected");
            }

            try {
                // Wait for 5 seconds to let the port settle
                Thread.sleep(PORT_SETTLE_DELAY_MS);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                return new ConnectionResult(false, portName, "Connection interrupted");
            }

            arduinoPort = SerialPort.getCommPort(portName);

            if (arduinoPort.openPort()) {
                // Flush the input buffer to discard any stale/garbage bytes accumulated before opening
                arduinoPort.flushIOBuffers();
                System.out.println(portName + " opened successfully.");
                return new ConnectionResult(true, portName, portName + " opened successfully.");
            } else {
                arduinoPort = null; // don't hold a dead reference
                System.out.println(portName + " failed to open.");
                return new ConnectionResult(false, portName, portName + " failed to open.");
            }
        });
    }

    public record ConnectionResult(boolean success, String portName, String message) {}
}