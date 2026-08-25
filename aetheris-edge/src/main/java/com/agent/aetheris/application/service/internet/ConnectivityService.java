package com.agent.aetheris.application.service.internet;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

import org.springframework.stereotype.Service;
import com.agent.aetheris.presentation.utility.NetworkInterfaceChecker;

@Service
public class ConnectivityService {
    private static final String CHECK_URL = "https://www.google.com";
    private static final int TIMEOUT_MS = 3000;

    private final NetworkInterfaceChecker interfaceChecker = new NetworkInterfaceChecker();

    public boolean isConnected() {
        // Fast local check first — no network hit
        if (!interfaceChecker.hasActiveNetworkInterface()) {
            System.out.println("No active network interface found.");
            return false; // Definitely offline, no adapter is even up
        }
        // System.out.println("Active network interface found. Checking internet connectivity...");
        // Adapter is up, but confirm actual internet reachability
        return canReachInternet();
    }

    private boolean canReachInternet() {
        try {
            URL url = URI.create(CHECK_URL).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);
            conn.setRequestMethod("HEAD");
            int responseCode = conn.getResponseCode();
            // System.out.println("Internet connection response code: " + responseCode);
            return (200 <= responseCode && responseCode <= 399);
        } catch (IOException e) {
            System.out.println("No active internet connection found.");
            return false;
        }
    }
}
