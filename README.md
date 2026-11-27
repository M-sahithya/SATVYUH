# SATVYUH (सत् व्यूह)
### Multi-Layer Satellite Cybersecurity Defence Simulation System

![SATVYUH Mission Status](https://img.shields.io/badge/Mission-Active-00f0ff?style=for-the-badge)
![Security Standard](https://img.shields.io/badge/Crypto-Ed25519%20%2B%20Paillier-8b5cf6?style=for-the-badge)
![Signal Processing](https://img.shields.io/badge/DSP-PyWavelets%20DWT-10b981?style=for-the-badge)
![Constellation Orbit](https://img.shields.io/badge/Orbit-LEO%20550km%20Polar-blue?style=for-the-badge)

**SATVYUH** is an interactive, high-fidelity satellite cybersecurity simulation command center designed for a state-level innovation presentation. It models a distributed Low Earth Orbit (LEO) satellite constellation (`SAT-A`, `SAT-B`, `SAT-C`) and an authorized Ground Station Cyber HQ (Bengaluru MOC), delivering **real-time local cyber-physical defense** across four distinct operational layers.

---

## 🌟 Visual & Technical Highlights

- **Aero-Cyber Mission Control UI**: Deep-space navy theme (`#030712`), glassmorphism panels, electric cyan/violet neon glowing borders, dynamic radar sweeps, and live telemetry graphs.
- **Interactive 3D Constellation Mesh**: Real-time rotating Earth in Three.js with orbital planes, 3D satellite chassis with solar arrays, pulsing inter-satellite laser mesh links (ISL), and ground communication vectors. Includes an instant **2D Tactical Schematic Fallback** for low-power laptop environments.
- **Dedicated 5-Minute Presentation Mode**: A built-in guided stepper that walks judges through the complete defense narrative step-by-step with judge pitch notes and one-click action execution.
- **100% Real Local Simulation**: Every major dashboard control performs genuine mathematical, cryptographic, and digital signal processing computations locally in Python without mock placeholders or external cloud dependencies.

---

## 🛡️ Multi-Layer Defense Architecture

```
                                  [ GROUND STATION CYBER HQ ]
                                  (Bengaluru MOC - 8.45 GHz)
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         │                                           │
                         ▼                                           ▼
                 [ UPLINK TELECOMMAND ]                     [ DOWNLINK TELEMETRY ]
                         │                                           │
       ┌─────────────────┴─────────────────┐       ┌─────────────────┴─────────────────┐
       ▼                                   ▼       ▼                                   ▼
  [ LAYER 1: CONSENSUS ]         [ LAYER 4: SAFE-MODE ] [ LAYER 2: WAVELET ]   [ LAYER 3: CRYPTO VAULT ]
  • Ed25519 Signatures           • FSM Contingency      • PyWavelets VisuShrink• Paillier 1024-bit Key
  • Anti-Replay Nonce Cache      • 20s Watchdog         • Universal MAD Thresh • Ciphertext Addition
  • 2-of-3 Node Quorum           • Autonomous Sun-Point • Real SNR Compute     • Zero Plaintext Leak
       │                                   │                     │                     │
       └─────────────────┬─────────────────┘                     └──────────┬──────────┘
                         │                                                  │
                         ▼                                                  ▼
                 [ SAT-A (Slot 1) ] ◄═════════► [ SAT-B (Slot 2) ] ◄═════════► [ SAT-C (Slot 3) ]
                                   (Active Inter-Satellite Laser Mesh)
```

### Layer 1: Space-Mesh Cryptographic Consensus
- **Technology**: Ed25519 Asymmetric Digital Signatures (RFC 8032) + 2-of-3 Byzantine Quorum Policy.
- **Defense Mechanism**: Every telecommand from ground control contains a canonical payload, microsecond timestamp, unique monotonic nonce, and Ed25519 digital signature.
- **What It Mitigates**:
  - **Forged Ground Uplinks / Spoofing**: Blocked with 0/3 node approval when signed by untrusted or rogue keys.
  - **Replay Attacks**: Blocked when an old intercepted command is replayed with an already-cached nonce.
  - **Single Node Compromise**: Requires 2 out of 3 node approvals before commands dispatch to actuators.

### Layer 2: Adaptive Wavelet Multi-Resolution Filtering
- **Technology**: Discrete Wavelet Transform (DWT) via PyWavelets (`db4` basis, 3-level decomposition).
- **Defense Mechanism**: Corrupted downlink carriers subject to Additive White Gaussian Noise (AWGN) and localized high-power RF burst jamming undergo adaptive thresholding using Median Absolute Deviation (MAD) VisuShrink ($\sigma = \text{median}(|cD|) / 0.6745$, $\lambda = \sigma \sqrt{2 \ln N}$).
- **Measured Metrics**: Calculates and displays true Signal-to-Noise Ratio (SNR) before and after filtering, achieving a typical **+4 to +6 dB net SNR gain** while preserving transient telemetry wavefronts.
- *Scientific Precision Note*: Wavelet filtering restores signal morphology from Gaussian and burst RF interference; it operates as a PHY-layer cleaner and is paired with Layer 1 for cryptographic authentication.

### Layer 3: Homomorphic Telemetry Cryptographic Vault
- **Technology**: Paillier Public-Key Cryptosystem (1024-bit keypair) via Python `phe`.
- **Defense Mechanism**: Spacecraft health metrics (Battery State of Charge, Solar generation, Transmitter draw, Reaction wheel temps) are encrypted on-satellite before transmission.
- **Homomorphic Property**: Intermediate relay satellites and untrusted edge ground receivers compute aggregate power demands ($E(P_{\text{solar}}) \cdot E(P_{\text{tx}}) \pmod{n^2} = E(P_{\text{solar}} + P_{\text{tx}} \pmod n)$) directly in the ciphertext domain without decrypting.
- **Decryption & Verification**: Decryption verifies a 100% exact mathematical match between the ciphertext-aggregated result and the expected plaintext sum. Private keys remain strictly within the server-side zero-knowledge enclave.

### Layer 4: Emergency Autonomous Safe-Mode Controller
- **Technology**: Finite State Machine (FSM) + Hardware Watchdog Timer.
- **Four Operational States**:
  1. `NORMAL`: Nominal Earth nadir pointing, primary X-band downlink, all science payloads active.
  2. `WARNING`: Telemetry threshold breached, secondary bus monitoring, conservative heating.
  3. `COMMUNICATION FAILURE`: Carrier lock lost / jamming detected, watchdog countdown initiated.
  4. `SAFE MODE`: Non-essential payloads powered off, magnetorquers damp tumbling, solar arrays orient to Sun acquisition, omnidirectional low-power beacon engaged.
- **Recovery**: Requires authenticated operator reset to step subsystems back into nominal flight mode.

---

## 💻 Tech Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite 5, TypeScript |
| **Styling & Theme** | Tailwind CSS, Custom Glassmorphism, CSS Scanlines |
| **3D Orbital Scene** | Three.js (Procedural textured Earth, orbital rings, satellites, laser mesh) |
| **Charts & Waveforms** | Recharts Multi-Waveform Synchronizer |
| **Icons & UI** | Lucide React, Framer Motion |
| **Backend API** | Python 3.14 / 3.11+, FastAPI, Uvicorn |
| **Cryptography** | Python `cryptography` (Ed25519 RFC 8032), `phe` (Paillier Homomorphic) |
| **Signal Processing** | PyWavelets (`pywt`), NumPy, SciPy |
| **Audit Persistence** | SQLite 3 (Indexed by layer & timestamp) |

---

## 🚀 Quick Setup & Run (Windows)

### Prerequisites
1. **Python 3.10+** (Tested on Python 3.14 / 3.12 / 3.11).
2. **Node.js 18+** & **npm** (Tested on Node v25 / v20).

### Method A: One-Click Startup (Recommended)
Simply double-click the included batch launcher:
```bat
start_satvyuh.bat
```
This launcher checks dependencies, starts both backend and frontend services, and opens `http://localhost:5173` automatically in your browser.

---

### Method B: Manual Step-by-Step Launch

#### 1. Backend Setup & Run
Open a terminal in the project root (`VIKISIT/`):
```powershell
# Install backend dependencies
pip install -r requirements.txt

# Run backend unit tests to verify 100% pass
python backend/tests/test_modules.py
python backend/tests/test_api_endpoints.py

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend Swagger API Documentation:* `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup & Run
Open a second terminal:
```powershell
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🎯 5-Minute Innovation Demo Sequence

Click the **`PRESENTATION MODE`** button in the top navigation bar to launch the guided presenter HUD:

| Step | Section | Demo Action | Judge Pitch Highlight |
| :---: | :--- | :--- | :--- |
| **1** | **Constellation Overview** | Open 3D View | Show 3 LEO satellites orbiting Earth with active inter-satellite laser mesh links. |
| **2** | **L1: Consensus Pass** | Click `SEND VALID COMMAND` | Show Ed25519 signature, fresh nonce #1001, and 3/3 consensus approval (2/3 quorum satisfied). |
| **3** | **L1: Attack Rejection** | Click `INJECT UNAUTHORIZED COMMAND` & `REPLAY` | Show rogue untrusted key rejected (0/3 votes) and duplicated nonce rejected by replay cache. |
| **4** | **L2: Wavelet Filter** | Click `INJECT NOISE` then `APPLY WAVELET FILTER` | Demonstrate raw SNR degraded to -1.7 dB, restored to +3.1 dB (+4.8 dB net gain) via PyWavelets. |
| **5** | **L3: Homomorphic Vault**| Click `ENCRYPT`, `COMPUTE`, `DECRYPT` | Show aggregate power computed directly on ciphertexts without decryption, verified 100% against plaintext truth. |
| **6** | **L4: Safe Mode** | Click `SIMULATE COMM LOSS` & `ACTIVATE SAFE MODE` | Watchdog timeout triggers autonomous survival mode: payloads offline, solar panels acquire Sun. |
| **7** | **Audit & Recovery** | Click `RESTORE NORMAL OPERATION` | Verify full audit trail logged in SQLite, and satellite fleet safely returns to nominal flight. |

---

## 📸 Capture Screenshots for Your PPT

You can capture crisp presentation slides using **Windows Snipping Tool (`Win + Shift + S`)** or browser screenshot tools at the following recommended views:

1. **Mission Overview Dashboard**: Home view (`/`) showing top status cards, Ground Station link, and active defense matrix.
2. **3D Constellation Mesh**: `3D Constellation` tab showing rotating Earth, satellite orbits, and laser communication links.
3. **Consensus Quorum (Approved vs Blocked)**: `L1: Consensus` tab showing the 3/3 green approval card and 0/3 red rejection card.
4. **Signal Processing & Wavelet Denoising**: `L2: Wavelet DWT` tab showing the 3 synchronized charts (Clean, Corrupted, Filtered) and the prominent `+4.8 dB SNR Gain` badge.
5. **Homomorphic Cryptographic Vault**: `L3: Crypto Vault` tab showing the Paillier ciphertext hexadecimal previews and verified mathematical match.
6. **Autonomous Safe-Mode Lockdown**: `L4: Safe Mode` tab showing the active `SAFE MODE` red banner and subsystem lockdown grid.
7. **Complete Architecture & Pipeline**: `Architecture` tab showing the hierarchical 4-layer defense pipeline.

---

## ⚖️ Scientific & Simulation Disclaimers

- **Consensus**: This system simulates a local 3-node Byzantine Fault Tolerant (BFT) quorum using Ed25519 digital signatures and anti-replay nonce tracking. It represents an application-level consensus model.
- **Wavelet Filtering**: PyWavelets DWT VisuShrink denoising suppresses stationary Gaussian noise and localized non-stationary burst RF interference. It does not replace cryptographic message authentication.
- **Homomorphic Telemetry**: Utilizes the Paillier cryptosystem for additive homomorphic operations over ciphertexts. Private keys are never transmitted to clients.
- **Safe-Mode**: Represents software-defined flight control contingency logic and onboard watchdog timing.
