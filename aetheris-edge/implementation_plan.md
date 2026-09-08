# Apache Kafka Integration Plan

## What Kafka Is & Why It's Better Here

Kafka is a **distributed event streaming platform**. Instead of WebSocket (a direct connection), Kafka works like a **post office**:

- `aetheris-edge` **publishes** messages to a Kafka **topic** (`sensor-data`)
- `aetheris-ai` cloud backend **subscribes** to that topic and receives them
- React frontend then gets data via WebSocket **from the cloud backend only**

This means the edge device doesn't need to know anything about the React frontend.

```
Arduino
  ↓ (USB/Serial)
aetheris-edge  →  Kafka Topic: "sensor-data"  →  aetheris-ai (cloud)
                   (Message Broker)                     ↓
                                               React (WebSocket from cloud)
```

---

## Kafka Vocabulary (Quick Reference)

| Term | Meaning |
|---|---|
| **Broker** | The Kafka server that stores messages |
| **Topic** | A named channel (like `sensor-data`) |
| **Producer** | App that **writes** to a topic → `aetheris-edge` |
| **Consumer** | App that **reads** from a topic → `aetheris-ai` |
| **Consumer Group** | Multiple consumers sharing work (not needed for 1 backend) |
| **Partition** | A topic is split into partitions for parallelism |
| **Offset** | A consumer's position in a topic (Kafka remembers where you left off) |

---

## Step 1 — Run Kafka Locally via Docker

You'll need Docker Desktop installed. We'll create a `docker-compose.yml` in a new `kafka/` folder in your project.

**What it sets up:**
- **Zookeeper** — Kafka's coordination service (required by Kafka 3.x)
- **Kafka broker** — The actual message server on port `9092`
- **Kafka UI** (optional) — A web dashboard at `http://localhost:8080` to inspect topics visually

---

## Step 2 — `aetheris-edge` Changes (Kafka Producer)

### Files to modify:
#### [MODIFY] `pom.xml`
- Remove `spring-boot-starter-websocket` (no longer needed on the edge)
- Add `spring-kafka`

#### [MODIFY] `DataReadingThreadService.java`
- Replace `SimpMessagingTemplate` with `KafkaTemplate<String, SensorPayloadDTO>`
- Send to topic `"sensor-data"` instead of `/topic/sensor-data`

#### [NEW] `infrastructure/config/KafkaProducerConfig.java`
- Configure Kafka producer: bootstrap servers, key/value serializers (String + JSON)

#### [DELETE] `infrastructure/config/WebSocketConfig.java`
- No longer needed on the edge

#### [MODIFY] `application.properties`
- Add `spring.kafka.bootstrap-servers=localhost:9092`

---

## Step 3 — `aetheris-ai` Changes (Kafka Consumer → WebSocket)

### Files to add/modify:
#### [NEW] `infrastructure/config/KafkaConsumerConfig.java`
- Configure consumer group ID, deserializers

#### [NEW] `application/service/SensorDataKafkaConsumer.java`
- Annotated with `@KafkaListener(topics = "sensor-data")`
- Receives `SensorPayloadDTO`, broadcasts to React via `SimpMessagingTemplate`

#### [NEW] `infrastructure/config/WebSocketConfig.java`
- Move WebSocket config here (from edge to cloud)
- React connects to cloud backend, not edge device

#### [NEW] `application/dtos/SensorPayloadDTO.java`
- Same DTO as in edge (or extract to a shared library later)

#### `pom.xml` (aetheris-ai)
- Add `spring-kafka` + `spring-boot-starter-websocket`

---

## Open Questions

> [!IMPORTANT]
> **Where will Kafka run in production?**
> - Local Docker is fine for development
> - In production you'll need a managed Kafka service: **Confluent Cloud** (free tier available), **AWS MSK**, or **Aiven for Kafka**
> - This changes the `bootstrap-servers` config only — code stays the same

> [!IMPORTANT]
> **Where is `aetheris-ai`?**
> I couldn't access the `aetheris-ai` project directory (permission issue). Please confirm the path so I can make the consumer-side changes too.

---

## Verification Plan

1. Start Kafka via `docker-compose up`
2. Run `aetheris-edge` → connect Arduino → start reading
3. Open Kafka UI at `http://localhost:8080` → verify messages appear in `sensor-data` topic
4. Run `aetheris-ai` → verify `@KafkaListener` logs received messages
5. Open React app → verify live data appears in dashboard
