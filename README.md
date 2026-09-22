<div align="center">

<img src="./assets/banner.png" alt="Aetheris AI"/>

### Predictive Edge-to-Cloud Optical Seeing & Space Weather Intelligence Platform

<p>
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=flat-square&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Apache_Kafka-4.1.0-231F20?style=flat-square&logo=apachekafka&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaFX-17-0d6efd?style=flat-square&logo=java&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square"/>
</p>

<p>
  <b>A full-stack, distributed, real-time platform for collecting, streaming, and intelligently analysing optical seeing and space weather telemetry — from an Arduino sensor, through an Apache Kafka event bus, to a React dashboard.</b>
</p>

---

</div>

## 📡 What Is Aetheris AI?

**Aetheris AI** is an enterprise-grade, distributed IoT intelligence platform built for the collection and real-time analysis of **optical atmospheric seeing** and **space weather** data. The system bridges a physical Arduino-based sensor array and a cloud backend, enabling astronomers, observatories, and researchers to monitor ionospheric scintillation, ambient conditions, and hardware health from any browser — in real time.

The platform is designed around three independently deployable modules:

| Module | Technology | Role |
|---|---|---|
| **`aetheris-edge`** | Spring Boot 4 + JavaFX 17 + Apache Kafka | Edge agent — reads Arduino sensor data over USB/Serial, streams to Kafka |
| **`aetheris-ai`** | Spring Boot 4 + Spring Security + WebSocket + PostgreSQL | Cloud backend — consumes Kafka events, persists data, exposes REST & WebSocket APIs |
| **`aetheris-dashboard`** | React 19 + TypeScript 6 + Vite 8 + Recharts | Web frontend — real-time telemetry visualisation, anomaly feed, configurable alerting |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HARDWARE LAYER                                   │
│  Arduino Sensor Array ──(USB/Serial · jSerialComm)──▶  aetheris-edge    │
│  Measurements: Seeing (arcsec) · Input Voltage (V) · Temperature (°C)   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
              Kafka Producer  ·  SensorPayloadDTO  ·  spring-kafka
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     APACHE KAFKA EVENT BUS                              │
│                      Topic: "sensor-data"                               │
│              (Zookeeper + Kafka Broker on port 9092)                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    Kafka Consumer  ·  @KafkaListener
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLOUD BACKEND  (aetheris-ai)                       │
│  Spring Boot 4.1 · Spring Security (JWT/Stateless) · Spring WebSocket   │
│  JPA/Hibernate · PostgreSQL 15 · BCrypt · CORS-configured               │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    AI INTELLIGENCE ENGINE                        │   │
│  │  ① LSTM Forecasting  →  Data prediction 10 min ahead             │   │
│  │  ② Isolation Forest / Autoencoder  →  Scintillation classifier   │   │
│  │  ③ LLM RAG Agent  →  NL telemetry queries + NOAA/NASA fusion     │   │
│  │     (ONNX Runtime · Vector DB · Function Calling)                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Domains:  admin · alerting · forecasting · telemetry                   │
│  Layers:   presentation · application · domain · infrastructure         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        WebSocket (STOMP) · REST API (/api/v1/) · LLM Chat Endpoint
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    WEB FRONTEND  (aetheris-dashboard)                   │
│  React 19 · TypeScript 6 · Vite 8 · TailwindCSS 4 · Framer Motion 13    │
│  Recharts · Axios · React Router v7 · Lucide Icons                      │
│                                                                         │
│  Pages: Home (landing) · Dashboard (live telemetry · anomalies · alerts)│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🛰️ Edge Intelligence — `aetheris-edge`

- **Real-time Arduino Ingestion** — Async serial port connection via `jSerialComm` with `CompletableFuture`-based non-blocking port management and automatic IO buffer flushing
- **Apache Kafka Producer** — Streams structured `SensorPayloadDTO` JSON events to the `sensor-data` topic at 1 Hz using `KafkaTemplate<String, SensorPayloadDTO>`
- **JavaFX Desktop Agent** — Native desktop UI with live gauge display for Seeing (arcsec), Input Voltage (V), and Ambient Temperature (°C)
- **Resilient Reading Thread** — Daemon thread with graceful disconnect detection, stale-byte flushing, and reconnect event signalling via JavaFX `Platform.runLater()`
- **Internet Connectivity Monitoring** — `ConnectivityService` monitors outbound network health of the edge device
- **Open Weather Integration** — `WeatherService` fetches ambient meteorological data to correlate with optical seeing conditions
<br/>
<br/>
<img src="./assets/github-edge.png" alt="Aetheris Edge UI"/>
<br/>
<br/>

### ☁️ Cloud Backend — `aetheris-ai`

- **Clean Layered Architecture** — Strict separation across `presentation`, `application`, `domain`, and `infrastructure` layers following Domain-Driven Design principles
- **JWT Stateless Authentication** — Spring Security 6 with `jjwt` 0.11.5, BCrypt password hashing, and role-based access control (`ROLE_ADMIN`)
- **Domain-Driven Design** — Bounded contexts for `admin`, `alerting`, `forecasting`, and `telemetry`
- **Admin Lifecycle Management** — Full registration → login → IP capture flow with a `UserStatus` state machine (`PENDING → ACTIVE → BANNED`)
- **WebSocket Real-time Broadcast** — STOMP WebSocket pushes live sensor events from Kafka consumer to all connected dashboard clients
- **PostgreSQL Persistence** — JPA/Hibernate with UUID primary keys, `LocalDateTime` audit fields, and `@Enumerated` status columns
- **Stateless REST API** — Versioned at `/api/v1/` with CORS pre-configured for the Vite dev server

### 📊 Dashboard — `aetheris-dashboard`

- **Live Telemetry Charts** — Real-time Recharts visualisation for Seeing (arcsec), Input Voltage (V), and Ambient Temperature (°C) with configurable critical/warning threshold lines
- **Animated Anomaly Feed** — Framer Motion-powered event log classifying hardware noise spikes, ionospheric scintillation bursts (S4 index), cloud cover events, and system stabilisation
- **Configurable Alerting** — User-adjustable critical/warning thresholds; independent toggles for email and in-dashboard notifications
- **Historical Archive Table** — Session-level event archive with one-click CSV download
- **Protected Routing** — `ProtectedRoute` component with JWT-aware `axios` interceptors for authenticated navigation
- **Particle Background** — Canvas-based animated particle field for a premium observatory aesthetic
- **Dark / Light Mode** — Full theme toggle with React context propagation throughout the layout

---

## 🤖 Intelligence Engine

Aetheris AI is not a passive monitoring tool. Its cloud backend embeds three AI sub-systems that transform raw hardware telemetry into **operational foresight**.

### ① Short-Term Predictive Seeing Engine

> *Replace static threshold alerts with a multi-horizon time-series forecasting model.*

| Attribute | Detail |
|---|---|
| **Models** | LSTM (Long Short Term Memory) |
| **Runtime** | ONNX Runtime embedded in Java — zero Python dependency in production |
| **Inputs** | Voltage time-series · Seeing index · Temperature gradient · Solar zenith angle |
| **Horizon** | 10-minute rolling predictions |
| **Output** | Probabilistic seeing forecast + confidence interval bands on dashboard |
| **Operational Impact** | Allows ground stations to pre-adjust adaptive optics, scale laser transmission power, or reroute satellite downlinks **before** atmospheric fading occurs |

### ② Edge Anomaly Detection & Scintillation Classification

> *Unsupervised ML running directly on the live Kafka data stream.*

| Attribute | Detail |
|---|---|
| **Models** | Isolation Forest · Autoencoder (reconstruction error threshold) |
| **Classification Labels** | `IONOSPHERIC_SCINTILLATION` · `HARDWARE_NOISE_SPIKE` · `CLOUD_ATTENUATION` · `THERMAL_DISTURBANCE` · `WIND_SHAKE` |
| **Key Signal** | Differentiates genuine optical scintillation (S4 index rise) from hardware or environmental noise |
| **Operational Impact** | Eliminates false alarms and ensures clean, standardised data flows into long-term research archives |

### ③ LLM Autonomous Flight Director & RAG Agent

> *Natural language interface fusing logged telemetry with live space weather feeds.*

| Attribute | Detail |
|---|---|
| **Architecture** | Retrieval-Augmented Generation (RAG) with Function Calling |
| **Data Sources** | PostgreSQL telemetry archive · NOAA solar flare feeds · NASA geomagnetic index APIs |
| **Storage** | Vector Database for semantic telemetry search |
| **Example Query** | *"Analyse optical stability during today's 14:00 satellite pass and flag any scintillation anomalies correlated with solar activity."* |
| **Output** | The agent executes DB queries, synthesises space weather data, and generates executive diagnostic reports automatically |

---

## 🔬 Telemetry Intelligence — Hidden Physics in Raw Data

The three hardware channels (Input Voltage, Seeing arcsec, Temperature) are far more than simple gauges. The AI engine extracts the following derived science from them.

### ⚡ From Input Voltage — Raw Solar Intensity Proxy

The analog voltage is a direct proxy for the amount of sunlight hitting the photodiode. By analyzing how this voltage behaves over time, you can extract:

- **Cloud Cover & Transparency Transients:** Detect rapid absolute voltage drops unrelated to micro-fluctuations. Classify events as `Cirrus Cloud Passage` or `Heavy Obscuration` rather than bad seeing.

- **Turbulence Frequency Spectrum:** Fast Fourier Transform (FFT) on the high-frequency voltage stream. High-frequency noise → fast high-altitude jet streams; Low-frequency → slow low-altitude thermal mixing.

- **Signal-to-Noise Ratio (SNR):** Logarithmic $`\text{SNR}_{\text{dB}} = 20 \log_{10} \left( \frac{\mu}{\sigma} \right)`$ over a rolling window `(N) = (N)Hz x (N)sec `. Critical metric for optical satellite laser downlinks to determine if a signal can be locked.

$$\Large \text{SNR}_{\text{dB}} = 20 \log_{10} \left( \frac{\mu}{\sigma} \right)$$

---

### 🔭 From Seeing (arcsec) — Adaptive Optics Parameters

The seeing index measures the angular resolution limit caused by the atmosphere. It is the primary metric for astronomers, but it can be mathematically converted into deeper optical parameters:

- **Fried Parameter (r₀):** This is the most crucial metric for Adaptive Optics (AO) systems. It represents the diameter of a telescope over which the optical phase distortion is roughly 1 radian. You can derive it directly from the `seeing angle (𝜖)` at a specific `wavelength (𝜆, Variable Input)` using the relationship:

$$\Large r₀ = 0.98 \frac{𝜆}{𝜖}$$

- **Worked Example (Seeing = 5.4 arcseconds)**

  - **$\lambda$ (500 nm):** $5 \times 10^{-7}$ meters (Convert To Meters) `Standard` 
  - **$\epsilon$ (5.4 arcsec to rad):** $5.4 \times 4.848 \times 10^{-6} = 2.618 \times 10^{-5}$ radians (Convert To Radians)


$$\Large r_0 = 0.98 \frac{5 \times 10^{-7}}{2.618 \times 10^{-5}}$$

- **Rate of Degradation (First Derivative):** By calculating the rate of change (𝑑("Seeing" )/𝑑𝑡) over a `(N)`-minute rolling window, you can determine momentum. A seeing value of 3.0 is acceptable, but a value of 3.0 with a rapid positive trajectory indicates the observing window is about to collapse.

  - **Linear Regression Slope (Enterprise Standard):** To calculate true momentum and ignore hardware jitter, calculate the slope ($m$) of the linear best-fit line across all 300 data points in the window. The slope represents the average rate of change per second.

    $$\Large \frac{dS}{dt} = \frac{N \sum (t_i S_i) - \sum t_i \sum S_i}{N \sum (t_i^2) - (\sum t_i)^2}$$

  - A slope near **0.0** indicates stable seeing.
  - A **positive slope** (e.g., +0.05 arcsec/sec) indicates deteriorating seeing (turbulence is increasing).
  - A **negative slope** indicates improving conditions.

---

### 🌡️ From Temperature — Hardware Calibration

Temperature is rarely just about the weather; in hardware engineering, it is a critical calibration tool.

- **Sensor Thermal Drift Calibration:** Photodiode sensitivity and op-amp baseline voltages change with temperature (dark current). By mapping voltage changes against temperature changes, your backend can apply a dynamic thermal calibration curve to remove `hardware noise` from the `atmospheric noise`.

- **Dome/Local Seeing Identification:** If the ambient temperature changes rapidly (e.g., as the sun heats the observatory dome or the telescope tube), it creates local thermal currents. By cross-referencing rapid temperature changes with seeing degradation, your AI can flag the bad seeing as `Local Thermal Disturbance` rather than `Ionospheric Scintillation`.

---

### 🧠 Composite AI Insights — Multi-Variate Analysis

When all three channels are fed together into a time-series model, the AI unlocks:

- **Scintillation Regime Classification** — Groups data into distinct atmospheric states: `Dawn Thermal Mixing` · `Stable Mid-Day` · `High-Altitude Jet Shear` · `Ionospheric Storm`
- **Hardware Anomaly Detection** — If voltage flatlines while temperature spikes, the AI deduces overheating or sensor fault, triggering a **maintenance alert** instead of an atmospheric alert
- **Adaptive Optics Feed** — r₀ values and turbulence spectrum output are exposed as an API endpoint consumable by external deformable mirror control systems

---

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Java JDK | 21 |
| Maven | 3.9+ |
| Node.js | 20+ |
| Docker Desktop | Any recent |
| Arduino IDE | For sensor firmware flashing |

### 1 — Start Infrastructure (Kafka + PostgreSQL)

```bash
# Start PostgreSQL (project root)
docker compose up -d

# Start Kafka broker (edge module)
cd aetheris-edge/kafka
docker compose up -d
# Kafka UI available at http://localhost:8080
```

### 2 — Run the Cloud Backend

```bash
# From project root
./mvnw spring-boot:run
# REST API: http://localhost:8080/api/v1/
# WebSocket: ws://localhost:8080/ws
```

### 3 — Run the Edge Agent

```bash
cd aetheris-edge
./mvnw spring-boot:run
# A JavaFX window opens — select the Arduino COM port and click Connect
```

### 4 — Run the Dashboard

```bash
cd aetheris-dashboard
npm install
npm run dev
# Dashboard: http://localhost:5173
```

---

## 🔐 Authentication Flow

```
POST /api/v1/auth/register  →  RegisterService → BCrypt hash → PostgreSQL (status: PENDING)
POST /api/v1/auth/login     →  LoginService → JwtService.generateToken() → JWT Bearer token
Authorization: Bearer <token>  →  SecurityFilterChain → JwtFilter → SecurityContext
```

- All routes under `/api/v1/auth/**` are **publicly accessible**
- Every other route requires a valid **JWT Bearer token**
- Sessions are **fully stateless** — no server-side session storage (`SessionCreationPolicy.STATELESS`)
- Accounts blocked with `UserStatus.BANNED` are rejected by Spring Security's `isAccountNonLocked()` hook

---

## 📁 Project Structure

```
aetheris-ai/                                   ← Cloud Backend (Spring Boot WAR)
├── src/main/java/com/ai/aetheris/
│   ├── presentation/controllers/auth/         AuthController.java
│   ├── application/
│   │   ├── services/auth/                     LoginService · RegisterService
│   │   ├── repositories/admin/                AdminRepository
│   │   └── dtos/auth/                         RegisterAdminRequest · LoginRequest
│   ├── domain/
│   │   ├── admin/entities/                    Admin.java  (implements UserDetails)
│   │   ├── shared/enums/                      UserStatus  (PENDING · ACTIVE · BANNED)
│   │   ├── alerting/                          ← in progress
│   │   ├── forecasting/                       ← in progress
│   │   └── telemetry/                         ← in progress
│   └── infrastructure/
│       ├── security/                          JwtService.java
│       └── config/                            SecurityConfig.java
├── docker-compose.yml                         PostgreSQL 15 (port 5432)
└── pom.xml                                    Spring Boot 4.1 · Java 21

aetheris-edge/                                 ← Edge Agent (Spring Boot + JavaFX)
├── src/main/java/com/agent/aetheris/
│   ├── AetherisEdgeFxApplication.java         JavaFX + Spring bootstrap
│   ├── application/service/
│   │   ├── home/                              ArduinoConnectionService · DataReadingThreadService
│   │   ├── internet/                          ConnectivityService
│   │   └── weather/                           WeatherService
│   ├── infrastructure/config/                 KafkaProducerConfig
│   └── presentation/controller/              HomeController (FXML JavaFX)
├── kafka/docker-compose.yml                   Zookeeper + Kafka + Kafka UI
└── pom.xml                                    Kafka · JavaFX · jSerialComm · Jackson

aetheris-dashboard/                            ← React Frontend (Vite + TypeScript)
├── src/
│   ├── pages/                                 home.tsx · dashboard.tsx · auth/
│   ├── components/                            TelemetryChart · ParticleBackground · Toast · ProtectedRoute
│   ├── layouts/                               AppLayout (dark/light mode context)
│   └── api/                                   axios clients with JWT interceptors
└── package.json                               React 19 · TS 6 · Vite 8 · TailwindCSS 4
```

---

## 🛠️ Tech Stack

### Backend — `aetheris-ai`

| Concern | Technology |
|---|---|
| Framework | Spring Boot 4.1.0 (WAR packaging, Tomcat provided) |
| Security | Spring Security 6, JJWT 0.11.5, BCrypt |
| Persistence | Spring Data JPA, Hibernate, PostgreSQL 15 |
| Real-time | Spring WebSocket (STOMP) |
| Language | Java 21 (LTS), Lombok |

### Edge Agent — `aetheris-edge`

| Concern | Technology |
|---|---|
| Framework | Spring Boot 4.1.0 |
| Desktop UI | JavaFX 17 (controls · fxml · media) |
| Serial I/O | jSerialComm 2.10.3 |
| Event Streaming | Apache Kafka · spring-kafka 4.1.0 |
| Serialisation | Jackson Databind |

### Frontend — `aetheris-dashboard`

| Concern | Technology |
|---|---|
| Framework | React 19, TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | TailwindCSS 4 |
| Animation | Framer Motion 13 |
| Charts | Recharts 3 |
| Routing | React Router v7 |
| Icons | Lucide React |
| HTTP Client | Axios |

---

## 🗺️ Roadmap

#### ✅ Completed
- [x] Arduino-to-Kafka edge data pipeline with JavaFX desktop agent
- [x] JWT-secured Spring Boot REST API with stateless session management
- [x] Real-time React dashboard with live telemetry charts and dual thresholds
- [x] Admin registration, login, and `UserStatus` lifecycle management
- [x] Glass Effect UI, dark/light mode, protected routing
- [x] Real-time Signal-to-Noise Ratio (SNR) and Variance graph

#### 🔄 In Progress
- [ ] Kafka consumer → WebSocket STOMP bridge in cloud backend (FR-02 completion)
- [ ] LSTM / TFT predictive seeing forecasting engine via ONNX Runtime (FR-03)
- [ ] Isolation Forest edge anomaly classification model (FR-04 upgrade)
- [ ] r₀ (Fried Parameter) computation and AO API endpoint
- [ ] Anomaly classification feed (hardware noise · ionospheric · cloud · environmental)

#### 📅 Planned
- [ ] LLM RAG Agent with NOAA/NASA space weather data fusion (FR-08)
- [ ] FFT turbulence frequency spectrum analysis on voltage stream
- [ ] SNR dashboard metric for optical satellite laser downlink assessment
- [ ] Automated email alerting via Spring Mail on threshold breach (FR-07 upgrade)
- [ ] Exponential backoff auto-reconnect in edge agent (NFR-02)
- [ ] Multi-observatory multi-tenant architecture
- [ ] Grafana + InfluxDB metrics integration
- [ ] Mobile-responsive progressive web app (PWA)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feature/your-feature`
3. **Commit** your changes — `git commit -m 'feat: describe your change'`
4. **Push** to the branch — `git push origin feature/your-feature`
5. **Open** a Pull Request

Please review [SECURITY.md](./SECURITY.md) before reporting any vulnerabilities.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Built with ☕ Java 21, ⚛️ React 19, and 🛰️ a genuine passion for space weather science.

**⭐ Star this repo if you find it interesting!**

</div>
