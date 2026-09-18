const BASE_URL = "http://weather.local";

function setStatus(connected) {
    const dot = document.getElementById("statusDot");
    const label = document.getElementById("statusLabel");
    if (dot) {
        dot.classList.toggle("online", connected);
        dot.classList.toggle("offline", !connected);
    }
    if (label) label.textContent = connected ? "Connected" : "Disconnected";
}

function fetchLiveData() {
    fetch(`${BASE_URL}/readData`, { cache: "no-store" })
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            setStatus(true);

            if (data.temperature !== undefined) {
                const tempEl = document.getElementById("tempValue");
                const tempCap = document.getElementById("tempCaption");
                if (tempEl) tempEl.textContent = data.temperature;
                if (tempCap) tempCap.textContent = "Live reading";
            }

            if (data.humidity !== undefined) {
                const humEl = document.getElementById("humValue");
                const humCap = document.getElementById("humCaption");
                if (humEl) humEl.textContent = data.humidity;
                if (humCap) humCap.textContent = "Live reading";

                const fill = document.getElementById("humGaugeFill");
                if (fill) {
                    const circumference = 327;
                    const offset = circumference * (1 - Math.min(Math.max(data.humidity, 0), 100) / 100);
                    fill.style.strokeDashoffset = offset;
                }
            }
        })
        .catch(error => {
            console.error("Error fetching live sensor data:", error);
            setStatus(false);
        });
}

function updateClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString();
}

setInterval(updateClock, 1000);
setInterval(fetchLiveData, 2000);
document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    fetchLiveData();
});

const DASHBOARD_PEER_ID = "fariba-esp-weather-cam-viewer";
const camVideo = document.getElementById("camVideo");
const camPlaceholder = document.getElementById("camPlaceholder");
const camHint = document.getElementById("camHint");

if (window.Peer) {
    const camPeer = new Peer(DASHBOARD_PEER_ID);

    window.addEventListener("beforeunload", () => {
        if (!camPeer.destroyed) camPeer.destroy();
    });

    camPeer.on("open", () => {
        if (camPlaceholder) camPlaceholder.textContent = "Waiting for phone to connect…";
    });

    camPeer.on("disconnected", () => {
        if (!camPeer.destroyed) camPeer.reconnect();
    });

    camPeer.on("call", (call) => {
        call.answer();
        call.on("stream", (remoteStream) => {
            if (camVideo) {
                camVideo.srcObject = remoteStream;
                camVideo.style.display = "block";
            }
            if (camPlaceholder) camPlaceholder.style.display = "none";
            if (camHint) camHint.style.display = "none";
        });
        call.on("close", () => {
            if (camVideo) camVideo.style.display = "none";
            if (camPlaceholder) {
                camPlaceholder.style.display = "block";
                camPlaceholder.textContent = "Phone disconnected";
            }
        });
    });

    camPeer.on("error", (err) => {
        console.error("Camera peer error:", err);
        if (camPlaceholder) {
            camPlaceholder.style.display = "block";
            if (err.type === "unavailable-id") {
                camPlaceholder.textContent =
                    "This ID is still in use elsewhere - close all other dashboard tabs/windows, wait ~30s, then reload.";
            } else {
                camPlaceholder.textContent = "Camera link error: " + err.type;
            }
        }
    });
}