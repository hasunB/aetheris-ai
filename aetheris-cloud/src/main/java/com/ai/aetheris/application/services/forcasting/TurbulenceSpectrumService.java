package com.ai.aetheris.application.services.forcasting;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import com.ai.aetheris.application.repositories.shared.SettingsRepository;
import com.ai.aetheris.application.services.forcasting.TurbulenceSpectrumService.SpectrumResult;



@Service
@Slf4j
public class TurbulenceSpectrumService {

    private final SettingsRepository settingsRepository;

    private final Map<UUID, LinkedList<Double>> adminBuffers = new ConcurrentHashMap<>();

    private static final int DEFAULT_FFT_WINDOW = 128;

    private static final double JET_STREAM_FREQ_THRESHOLD = 0.1;
    
    @Getter
    private int windowSize = DEFAULT_FFT_WINDOW;

    public TurbulenceSpectrumService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    private UUID getCurrentAdminId() {
        // Same hardcoded approach as SignalToNoiseRatioService for now
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    /**
     * Adds a voltage sample to the buffer. When the buffer reaches
     * the FFT window size, computes and returns the turbulence spectrum
     * with atmospheric classification.
     *
     * @param voltage the incoming sensor voltage
     * @return a SpectrumResult with frequency bins, magnitudes, and
     *         turbulence classification, or null if buffer isn't full yet
    */

    public SpectrumResult addSampleAndCompute(double voltage){
        UUID adminId = getCurrentAdminId();
        if(adminId == null) {
            log.warn("No admin found, returning null");
            return null;
        }

        // Read configured FFT window size (must be power of 2)
        int fftWindowSize = settingsRepository.findByAdminId(adminId)
                .map(com.ai.aetheris.domain.shared.entities.Settings::getFftWindowSize)
                .orElse(DEFAULT_FFT_WINDOW);

        this.windowSize = fftWindowSize;

        LinkedList<Double> buffer = adminBuffers
                .computeIfAbsent(adminId, k -> new LinkedList<>());

        synchronized (buffer) {
            buffer.addLast(voltage);
            // Keep only the latest fftWindow samples
            while (buffer.size() > fftWindowSize) {
                buffer.removeFirst();
            }
            // Not enough samples yet
            if (buffer.size() < fftWindowSize) {
                return null;
            }
            return computeSpectrum(buffer, fftWindowSize);
        }
    }

    // ----------------------------------------------------------------
    //  Core FFT computation
    // ----------------------------------------------------------------
    private SpectrumResult computeSpectrum(LinkedList<Double> buffer, int n) {
        
    }

    // ----------------------------------------------------------------
    //  Result record
    // ----------------------------------------------------------------

    /**
     * Holds the full FFT result plus atmospheric turbulence classification.
     */
    public record SpectrumResult(
            double[] frequencies,
            double[] magnitudes,
            double dominantFrequency,
            double dominantPower,
            String turbulenceType,        // JET_STREAM | THERMAL_MIXING | MIXED | CALM
            double lowBandEnergy,
            double highBandEnergy
    ) {
        /**
         * Converts to a Map suitable for JSON serialisation over WebSocket.
         */
        public Map<String, Object> toSerializable() {
            // Build the spectrum array
            List<Map<String, Double>> spectrumBins = new ArrayList<>();
            for (int i = 0; i < frequencies.length; i++) {
                spectrumBins.add(Map.of(
                        "frequency", frequencies[i],
                        "power", magnitudes[i]
                ));
            }
            double total = lowBandEnergy + highBandEnergy;
            return Map.of(
                    "spectrum",           spectrumBins,
                    "dominantFrequency",  dominantFrequency,
                    "dominantPower",      dominantPower,
                    "turbulenceType",     turbulenceType,
                    "lowBandEnergyPct",   total > 0 ? lowBandEnergy / total * 100 : 0,
                    "highBandEnergyPct",  total > 0 ? highBandEnergy / total * 100 : 0
            );
        }
    }
    
}
