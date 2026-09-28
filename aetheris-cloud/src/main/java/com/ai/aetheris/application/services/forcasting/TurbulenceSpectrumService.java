package com.ai.aetheris.application.services.forcasting;

import com.ai.aetheris.application.repositories.shared.SettingsRepository;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.math3.complex.Complex;
import org.apache.commons.math3.transform.DftNormalization;
import org.apache.commons.math3.transform.FastFourierTransformer;
import org.apache.commons.math3.transform.TransformType;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TurbulenceSpectrumService {

    private final SettingsRepository settingsRepository;

    // Per-admin sliding window of voltage samples
    private final Map<UUID, LinkedList<Double>> adminBuffers = new ConcurrentHashMap<>();

    // FFT requires power-of-2 length. Default = 128 samples.
    // You can make this configurable via Settings entity.
    private static final int DEFAULT_FFT_WINDOW = 128;

    @Getter
    private int windowSize = DEFAULT_FFT_WINDOW;

    public TurbulenceSpectrumService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    private UUID getCurrentAdminId() {
        // Same approach as SignalToNoiseRatioService
        return UUID.fromString("cde46210-35e5-41ad-829e-bab0d171c8f0");
    }

    /**
     * Adds a voltage sample to the buffer. When the buffer reaches
     * the FFT window size, computes and returns the power spectrum.
     *
     * @param voltage the incoming sensor voltage
     * @return a SpectrumResult with frequency bins and magnitudes,
     *         or null if the buffer isn't full yet
     */
    public SpectrumResult addSampleAndCompute(double voltage) {
        UUID adminId = getCurrentAdminId();
        if (adminId == null) {
            return null;
        }

        // Read configured FFT window (must be power of 2)
        int fftWindow = settingsRepository.findByAdminId(adminId)
                .map(s -> nextPowerOf2(s.getSnrWindowSize()))  // reuse or add a dedicated field
                .orElse(DEFAULT_FFT_WINDOW);
        this.windowSize = fftWindow;

        LinkedList<Double> buffer = adminBuffers
                .computeIfAbsent(adminId, k -> new LinkedList<>());

        synchronized (buffer) {
            buffer.addLast(voltage);

            // Keep only the latest fftWindow samples
            while (buffer.size() > fftWindow) {
                buffer.removeFirst();
            }

            // Not enough samples yet
            if (buffer.size() < fftWindow) {
                return null;
            }

            // ---- Perform FFT ----
            return computeSpectrum(buffer, fftWindow);
        }
    }

    private SpectrumResult computeSpectrum(LinkedList<Double> buffer, int n) {

        // Copy to array and subtract mean (remove DC bias)
        double[] samples = new double[n];
        double mean = 0;
        int i = 0;
        for (double v : buffer) {
            samples[i++] = v;
            mean += v;
        }
        mean /= n;
        for (i = 0; i < n; i++) {
            samples[i] -= mean;
        }

        // Apply Hann window to reduce spectral leakage
        for (i = 0; i < n; i++) {
            double hann = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
            samples[i] *= hann;
        }

        // Run FFT
        FastFourierTransformer fft = new FastFourierTransformer(DftNormalization.STANDARD);
        Complex[] fftResult = fft.transform(samples, TransformType.FORWARD);

        // Compute power spectrum (magnitude²) for positive frequencies only
        // Positive frequencies = indices 0 .. N/2
        int halfN = n / 2;
        double[] magnitudes = new double[halfN + 1];
        double[] frequencies = new double[halfN + 1];

        // Assuming 1 sample per Kafka message at ~1 Hz sampling rate
        // Adjust this to your actual sampling rate
        double samplingRateHz = 1.0;

        for (i = 0; i <= halfN; i++) {
            double re = fftResult[i].getReal();
            double im = fftResult[i].getImaginary();
            magnitudes[i] = (re * re + im * im) / n;  // Power spectral density
            frequencies[i] = i * samplingRateHz / n;   // Frequency bin in Hz
        }

        log.info("Turbulence spectrum computed: {} frequency bins, peak at {} Hz",
                halfN + 1, frequencies[findPeakIndex(magnitudes)]);

        return new SpectrumResult(frequencies, magnitudes);
    }

    private int findPeakIndex(double[] magnitudes) {
        int peakIdx = 1; // skip DC (index 0)
        for (int i = 2; i < magnitudes.length; i++) {
            if (magnitudes[i] > magnitudes[peakIdx]) {
                peakIdx = i;
            }
        }
        return peakIdx;
    }

    private int nextPowerOf2(int value) {
        int p = 1;
        while (p < value) p <<= 1;
        return p;
    }

    /**
     * Result record holding frequency bins and their magnitudes.
     */
    public record SpectrumResult(double[] frequencies, double[] magnitudes) {

        /**
         * Convert to a list of maps for easy JSON serialization over WebSocket.
         */
        public List<Map<String, Object>> toSerializable() {
            List<Map<String, Object>> result = new ArrayList<>();
            for (int i = 0; i < frequencies.length; i++) {
                result.add(Map.of(
                    "frequency", frequencies[i],
                    "power", magnitudes[i]
                ));
            }
            return result;
        }
    }
}
