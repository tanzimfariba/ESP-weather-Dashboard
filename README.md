# ESP32 Weather Dashboard

A live weather monitoring dashboard powered by an ESP32, with a mobile camera feed streamed in via WebRTC.

## Features

- **Live sensor readings** — temperature and humidity, updated every 2 seconds.
- **No hardcoded WiFi credentials** — the ESP32 uses WiFiManager, so it can connect to any network without reflashing the code.
- **No IP address tracking** — the dashboard finds the ESP32 automatically via mDNS (`weather.local`), even after switching networks.
- **Mobile camera feed** — scan a QR code on your phone to stream its camera live into the dashboard, using PeerJS/WebRTC.

## Tech Stack

- **Firmware:** Arduino (ESP32), `WiFiManager`, `ESPmDNS`, `DHT`
- **Frontend:** HTML, CSS, JavaScript
- **Camera streaming:** [PeerJS](https://peerjs.com/) (WebRTC)

## Project Structure

```
├── index.html                  # Main dashboard page
├── style.css                   # Dashboard styling
├── script.js                   # Fetches live sensor data + handles camera stream
├── camera.html                 # Opened on a phone via QR code; broadcasts its camera
├── QR_Camera_Feed.jpeg         # QR code linking to camera.html
├── *.svg                       # Icons used in the dashboard
├── sky.jpg                     # Background image
└── esp32_weather_monitoring/
    └── esp32_weather_monitoring.ino   # ESP32 firmware
```

## Hardware

| Component        | Pin      |
|-------------------|---------|
| DHT11 (temp/humidity) | GPIO 4 |

## Getting Started

### 1. Flash the ESP32

Open `esp32_weather_monitoring.ino` in the Arduino IDE, install the required libraries (`WiFiManager`, `DHT sensor library`), and upload it to your ESP32.

### 2. First-time WiFi setup

On first boot (or on a new network), the ESP32 won't find a saved WiFi connection, so it opens its own hotspot: **`ESP32-Weather-AP`**.

1. Connect your phone/laptop to that hotspot.
2. A setup page should pop up automatically (or go to `192.168.4.1`).
3. Select your WiFi network and enter the password.

The ESP32 saves this and reconnects automatically from then on — this step only needs to be repeated when moving to a network it hasn't seen before.

### 3. Open the dashboard

Open `index.html` in a browser (locally, or deployed — e.g. GitHub Pages). It automatically pulls live data from `http://weather.local`, no configuration needed.

### 4. Stream the camera feed

1. Keep the dashboard tab open (it needs to be running to receive the connection).
2. On your phone, scan the QR code shown in the dashboard's camera tile — this opens `camera.html`.
3. Tap **"Start Streaming to Dashboard"** and allow camera access.

The live feed will appear in the dashboard's "Mobile Camera Feed" card.

> **Note:** `camera.html` must be served over HTTPS (or `localhost`) for camera access to work on mobile browsers.

## Notes

- `.local` mDNS addresses require OS/browser support — works out of the box on macOS and modern Windows/Chrome. If it fails to resolve, check the ESP32's Serial Monitor output for its IP as a fallback.
- Only one dashboard tab should be open at a time, since the camera connection uses a fixed peer ID.
