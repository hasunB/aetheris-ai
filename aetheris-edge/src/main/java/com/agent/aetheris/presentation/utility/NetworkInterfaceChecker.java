package com.agent.aetheris.presentation.utility;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

public class NetworkInterfaceChecker {

    public boolean hasActiveNetworkInterface() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();

            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();

                // Skip loopback, virtual, and down interfaces
                if (iface.isLoopback() || !iface.isUp() || iface.isVirtual()) {
                    continue;
                }

                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    // Skip link-local addresses (169.254.x.x / fe80::)
                    if (!addr.isLoopbackAddress() && !addr.isLinkLocalAddress()) {
                        return true; // Found a real, active network interface with an IP
                    }
                }
            }
            return false;
        } catch (SocketException e) {
            return false;
        }
    }
}
