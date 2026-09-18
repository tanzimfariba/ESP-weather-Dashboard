#include <WiFi.h>
#include <WebServer.h>
#include <WiFiManager.h>
#include <ESPmDNS.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
WebServer server(80);

// Real sensor reading functions
float getTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) return 0.0;
  return temp;
}

float getHumidity() {
  float hum = dht.readHumidity();
  if (isnan(hum)) return 0.0;
  return hum;
}

void setup() {
  Serial.begin(115200);

  dht.begin();

  WiFiManager wm;
  wm.setConfigPortalTimeout(180);

  if (!wm.autoConnect("ESP32-Weather-AP")) {
    Serial.println("Failed to connect, restarting...");
    ESP.restart();
  }
  Serial.println("Connected to Wi-Fi!");

  if (MDNS.begin("weather")) {
    MDNS.addService("http", "tcp", 80);
    Serial.println("mDNS started: http://weather.local");
  }

  server.on("/readData", HTTP_GET, []() {
    float temp = getTemperature();
    float hum  = getHumidity();

    String json = "{";
    json += "\"temperature\":" + String(temp, 1) + ",";
    json += "\"humidity\":" + String(hum, 1);
    json += "}";

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    server.sendHeader("Pragma", "no-cache");
    server.sendHeader("Expires", "-1");

    server.send(200, "application/json", json);
  });

  server.begin();
  Serial.println("HTTP Server Started");
}

void loop() {
  server.handleClient();
}
