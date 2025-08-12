document.addEventListener("DOMContentLoaded", function () {
  const statusEl = document.getElementById("status");
  const toggleBtn = document.getElementById("toggle-btn");
  const tempDisplay = document.getElementById("temperature");
  const decreaseBtn = document.getElementById("decrease-temp");
  const increaseBtn = document.getElementById("increase-temp");
  const timerInput = document.getElementById("timer-input");
  const setTimerBtn = document.getElementById("set-timer");
  const countdownEl = document.getElementById("countdown");

  const API_URL = "https://6898a1e0ddf05523e55f6c3e.mockapi.io/ac"; // Replace with your resource + record ID

  let isOn = false;
  let temperature = 18;
  let countdownInterval;

  // Load data from MockAPI when page starts
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      isOn = data["ON-OFF"];
      temperature = data.Tem;
      updateStatus();
      updateTemperature();
    })
    .catch((err) => console.error("Error loading data:", err));

  // Save state to MockAPI
  function saveStateToAPI() {
    fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "ON-OFF": isOn,
        Tem: temperature,
        Timer: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Updated in API:", data))
      .catch((err) => console.error("Error updating API:", err));
  }

  // Toggle ON/OFF
  toggleBtn.addEventListener("click", function () {
    isOn = !isOn;
    updateStatus();
    saveStateToAPI();
    if (!isOn) {
      clearInterval(countdownInterval);
      countdownEl.textContent = "Time: --:--";
    }
  });

  // Increase temperature
  increaseBtn.addEventListener("click", function () {
    if (isOn && temperature < 30) {
      temperature++;
      updateTemperature();
      saveStateToAPI();
    }
  });

  // Decrease temperature
  decreaseBtn.addEventListener("click", function () {
    if (isOn && temperature > 16) {
      temperature--;
      updateTemperature();
      saveStateToAPI();
    }
  });

  // Set Timer
  setTimerBtn.addEventListener("click", function () {
    if (!isOn) return;

    let minutes = parseInt(timerInput.value);
    if (isNaN(minutes) || minutes <= 0) return;

    clearInterval(countdownInterval);
    let totalSeconds = minutes * 60;

    countdownInterval = setInterval(function () {
      let mins = Math.floor(totalSeconds / 60);
      let secs = totalSeconds % 60;
      countdownEl.textContent =
        "Time: " +
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0");

      totalSeconds--;
      if (totalSeconds < 0) {
        clearInterval(countdownInterval);
        isOn = false;
        updateStatus("AC is OFF (Timer Ended)");
        saveStateToAPI();
      }
    }, 1000);

    saveStateToAPI();
  });

  // Functions
  function updateStatus(customText) {
    if (isOn) {
      statusEl.textContent = "AC is ON";
      statusEl.classList.remove("off");
      statusEl.classList.add("on");
    } else {
      statusEl.textContent = customText || "AC is OFF";
      statusEl.classList.remove("on");
      statusEl.classList.add("off");
    }
  }

  function updateTemperature() {
    tempDisplay.textContent = temperature + "°C";
  }
});
