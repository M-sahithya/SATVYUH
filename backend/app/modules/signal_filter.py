import numpy as np
import pywt
from typing import Dict, Any, List, Optional
from app.database import log_event

class WaveletSignalFilter:
    def __init__(self, sample_points: int = 256):
        self.sample_points = sample_points
        self.t = np.linspace(0, 1.0, self.sample_points, endpoint=False)
        self.clean_signal: Optional[np.ndarray] = None
        self.noisy_signal: Optional[np.ndarray] = None
        self.filtered_signal: Optional[np.ndarray] = None
        self.last_metrics: Dict[str, Any] = {}
        
        # Initialize default clean signal
        self.generate_normal_signal()

    def generate_normal_signal(self) -> Dict[str, Any]:
        """
        Synthesize satellite telemetry downlink carrier signal:
        Primary carrier (12 Hz) + secondary telemetry subcarrier (28 Hz) + Gaussian packet envelope.
        """
        # Carrier + telemetry modulation
        carrier = 1.0 * np.sin(2 * np.pi * 12 * self.t)
        subcarrier = 0.45 * np.sin(2 * np.pi * 28 * self.t + 0.3)
        modulation = 0.25 * np.cos(2 * np.pi * 4 * self.t)
        envelope = np.exp(-0.5 * ((self.t - 0.5) / 0.35) ** 2)
        
        self.clean_signal = (carrier + subcarrier) * (0.8 + modulation) * envelope
        # Normalize
        self.clean_signal = self.clean_signal / np.max(np.abs(self.clean_signal))
        
        self.noisy_signal = None
        self.filtered_signal = None
        
        self.last_metrics = {
            "status": "CLEAN_SIGNAL_GENERATED",
            "samples_count": self.sample_points,
            "snr_raw_db": None,
            "snr_filtered_db": None,
            "snr_gain_db": None,
            "noise_level": 0.0,
            "wavelet_basis": "db4",
            "decomposition_levels": 3
        }

        log_event("LAYER_2_SIGNAL_PROCESSING", "SIGNAL_GENERATION", "SUCCESS", "Clean downlink QPSK telemetry carrier generated.")
        return self.get_chart_data()

    def inject_noise(self, noise_std: float = 0.45, burst_jamming: bool = True) -> Dict[str, Any]:
        """
        Inject configurable Additive White Gaussian Noise (AWGN) + localized RF jamming bursts.
        """
        if self.clean_signal is None:
            self.generate_normal_signal()

        # Gaussian noise
        noise = np.random.normal(0, noise_std, self.sample_points)

        # Jamming burst interference (simulating deliberate jamming pulses or ionospheric scintillation)
        if burst_jamming:
            burst_mask = np.zeros(self.sample_points)
            # Burst around sample index 70..100 and 170..195
            b1_start, b1_end = int(self.sample_points * 0.28), int(self.sample_points * 0.40)
            b2_start, b2_end = int(self.sample_points * 0.65), int(self.sample_points * 0.75)
            burst_mask[b1_start:b1_end] = np.random.uniform(-1.2, 1.2, b1_end - b1_start)
            burst_mask[b2_start:b2_end] = np.random.uniform(-0.9, 0.9, b2_end - b2_start)
            noise += burst_mask

        self.noisy_signal = self.clean_signal + noise
        self.filtered_signal = None

        # Compute SNR before filtering
        p_clean = np.sum(self.clean_signal ** 2)
        p_noise = np.sum((self.noisy_signal - self.clean_signal) ** 2)
        snr_raw = 10 * np.log10(p_clean / max(p_noise, 1e-12))

        self.last_metrics = {
            "status": "NOISE_AND_JAMMING_INJECTED",
            "samples_count": self.sample_points,
            "snr_raw_db": round(float(snr_raw), 2),
            "snr_filtered_db": None,
            "snr_gain_db": None,
            "noise_level": round(noise_std, 2),
            "jamming_detected": burst_jamming,
            "signal_quality": "DEGRADED (HIGH BIT ERROR RISK)",
            "wavelet_basis": "db4",
            "decomposition_levels": 3
        }

        log_event(
            "LAYER_2_SIGNAL_PROCESSING",
            "NOISE_INJECTION",
            "WARNING",
            f"RF jamming & AWGN injected: Raw SNR degraded to {self.last_metrics['snr_raw_db']} dB",
            details=self.last_metrics
        )
        return self.get_chart_data()

    def apply_wavelet_filter(self, wavelet: str = "db4", level: int = 3, mode: str = "soft") -> Dict[str, Any]:
        """
        Perform discrete wavelet transform (DWT) multi-resolution decomposition.
        Calculate adaptive Universal VisuShrink threshold via Median Absolute Deviation (MAD):
        sigma = median(|cD_1|) / 0.6745
        threshold = sigma * sqrt(2 * ln(N))
        Perform thresholding on detail coefficients, followed by IDWT inverse reconstruction.
        """
        if self.noisy_signal is None:
            self.inject_noise()

        # Multi-level DWT decomposition
        coeffs = pywt.wavedec(self.noisy_signal, wavelet, level=level)
        
        # Estimate noise std dev sigma from finest detail coefficients (coeffs[-1]) using MAD
        detail_finest = coeffs[-1]
        sigma = float(np.median(np.abs(detail_finest)) / 0.6745)
        
        # Universal VisuShrink threshold: lambda = sigma * sqrt(2 * ln(N))
        universal_threshold = sigma * np.sqrt(2 * np.log(self.sample_points))

        # Threshold detail coefficients (keep approximation coeffs[0] intact)
        new_coeffs = [coeffs[0]]
        for detail in coeffs[1:]:
            new_coeffs.append(pywt.threshold(detail, value=universal_threshold, mode=mode))

        # Inverse Discrete Wavelet Transform
        reconstructed = pywt.waverec(new_coeffs, wavelet)
        # Ensure exact length match
        self.filtered_signal = reconstructed[:self.sample_points]

        # Calculate actual metrics
        p_clean = np.sum(self.clean_signal ** 2)
        p_noise_raw = np.sum((self.noisy_signal - self.clean_signal) ** 2)
        p_noise_filtered = np.sum((self.filtered_signal - self.clean_signal) ** 2)

        snr_raw = 10 * np.log10(p_clean / max(p_noise_raw, 1e-12))
        snr_filtered = 10 * np.log10(p_clean / max(p_noise_filtered, 1e-12))
        snr_gain = snr_filtered - snr_raw

        quality = "NOMINAL (EXCELLENT)" if snr_filtered > 12 else "ACCEPTABLE (RECOVERED)"

        self.last_metrics = {
            "status": "WAVELET_DENOISING_APPLIED",
            "samples_count": self.sample_points,
            "snr_raw_db": round(float(snr_raw), 2),
            "snr_filtered_db": round(float(snr_filtered), 2),
            "snr_gain_db": round(float(snr_gain), 2),
            "wavelet_basis": wavelet,
            "decomposition_levels": level,
            "threshold_mode": mode,
            "estimated_sigma": round(sigma, 4),
            "universal_threshold": round(float(universal_threshold), 4),
            "signal_quality": quality,
            "theoretical_note": "PyWavelets VisuShrink DWT denoising removes non-stationary high-frequency interference while preserving sharp telemetry transient edges."
        }

        log_event(
            "LAYER_2_SIGNAL_PROCESSING",
            "WAVELET_FILTER_APPLIED",
            "SUCCESS",
            f"PyWavelets {wavelet} filter applied: SNR boosted from {self.last_metrics['snr_raw_db']} dB to {self.last_metrics['snr_filtered_db']} dB (+{self.last_metrics['snr_gain_db']} dB gain)",
            details=self.last_metrics
        )

        return self.get_chart_data()

    def reset_signal(self) -> Dict[str, Any]:
        return self.generate_normal_signal()

    def get_chart_data(self) -> Dict[str, Any]:
        """
        Return structured series for Recharts:
        [ { index: 0, time_ms: 0.0, clean: 0.12, noisy: 0.18, filtered: 0.13 }, ... ]
        """
        chart_points = []
        for i in range(self.sample_points):
            pt = {
                "idx": i,
                "t": round(float(self.t[i] * 1000), 1),  # in ms
                "clean": round(float(self.clean_signal[i]), 4) if self.clean_signal is not None else None,
                "noisy": round(float(self.noisy_signal[i]), 4) if self.noisy_signal is not None else None,
                "filtered": round(float(self.filtered_signal[i]), 4) if self.filtered_signal is not None else None,
            }
            chart_points.append(pt)

        return {
            "chart_points": chart_points,
            "metrics": self.last_metrics
        }

# Global singleton
signal_processor = WaveletSignalFilter(sample_points=200)
