let peak_x = 0;
let peak_y = 0;
let peak_z = 0;
let count = 0;
let last_shake = 0;
let VERTICAL_THRESHOLD_X = 10;
let VERTICAL_THRESHOLD_Y = 15;
let VERTICAL_THRESHOLD_Z = 15;
let HORIZONTAL_THRESHOLD_X = 5;
let HORIZONTAL_THRESHOLD_Y = 3;
let HORIZONTAL_THRESHOLD_Z = 10;
let isLandscape = false; // Track device orientation

/*
 * Utility function for setting motion value text color.
 */
function setMotionLabelColor(color) {
  let acc_fields = document.getElementsByClassName("acc");
  for (let i = 0; i < acc_fields.length; ++i) {
    acc_fields[i].style.color = color;
  }
}

// Timer Variables
let flickStartTime = 0;
let timerInterval = null;
const MIN_TIME_BETWEEN_FLICKS = 500; 


// Constants for single flick
let lastFlickTime = 0;
const FLICK_TIME_THRESHOLD = 1000; 
let flickState = "waiting"; // "waiting", "single_detected", "double_detected", "finished"

// Constants for double flick
const DOUBLE_FLICK_TIME_THRESHOLD = 10000; // Max time between two flicks
let lastSingleFlickTime = 0;

/**
 * Starts the flick timer display.
 */
function startFlickTimer() {
  flickStartTime = Date.now();
  const flickTimer = document.getElementById("flickTimer");

  if (timerInterval) clearInterval(timerInterval); // Reset existing timer

  timerInterval = setInterval(() => {
    let elapsedTime = (Date.now() - flickStartTime) / 1000; // Convert to seconds
    flickTimer.textContent = `Timer: ${elapsedTime.toFixed(2)}s`;
  }, 50);
}

/**
 * Stops and clears the flick timer display.
 */
function stopFlickTimer() {
  clearInterval(timerInterval);
  document.getElementById("flickTimer").textContent = "Timer: 0.00s";
}

// Flick State Indicator
function updateFlickIndicator() {
  let flickIndicator = document.getElementById("flickIndicator");

  switch (flickState) {
    case "waiting":
      flickIndicator.textContent = "Waiting for stage...";
      flickIndicator.style.color = "black";
      break;
    case "single_detected":
      flickIndicator.textContent = "Single Flick Detected!";
      flickIndicator.style.color = "orange";
      break;
    case "double_detected":
      flickIndicator.textContent = "Double Flick Detected!";
      flickIndicator.style.color = "green";
      break;
    case "finished":
      flickIndicator.textContent = "Detection Finished";
      flickIndicator.style.color = "blue";
      break;
  }
}

/**
 * Detects a single flick in the vertical direction.
 */
function detectSingleFlickVertical(y, z) {
  return !isLandscape && Math.abs(y) > VERTICAL_THRESHOLD_Y && Math.abs(z) > VERTICAL_THRESHOLD_Z;
}

/**
 * Detects a double flick in the vertical direction.
 */
function detectDoubleFlickVertical() {
  return flickState === "single_detected" && (Date.now() - lastSingleFlickTime <= DOUBLE_FLICK_TIME_THRESHOLD);
}

let waitingForDouble = false; // Flag to prevent instant double flick detection

/**
 * Handles single and double flick detection for vertical motion.
 */
function handleVerticalFlick(y, z) {
  if (detectSingleFlickVertical(y, z)) {
    const currentTime = Date.now();

    if (flickState === "waiting") {
      // First flick detected
      flickState = "single_detected";
      lastSingleFlickTime = currentTime;
      activateButton("singleFlickVertical", "Single Flick (Vertical) Detected!");
      startFlickTimer();
      updateFlickIndicator();

      // Wait for possible second flick
      setTimeout(() => {
        if (flickState === "single_detected") {
          flickState = "finished"; // Move to "finished" stage if no double flick happens
          stopFlickTimer();
          resetFlickDetection();
        }
      }, DOUBLE_FLICK_TIME_THRESHOLD);
    } 
    else if (flickState === "single_detected") {
      // Prevent instant double flick detection
      if (currentTime - lastSingleFlickTime < MIN_TIME_BETWEEN_FLICKS) {
        return; // Ignore too-close flicks
      }
      // Ensure the second flick is within time limit
      if (currentTime - lastSingleFlickTime <= DOUBLE_FLICK_TIME_THRESHOLD) {
        flickState = "double_detected";
        activateButton("doubleFlickVertical", "Double Flick (Vertical) Detected!");
        stopFlickTimer();
        updateFlickIndicator();
      }

      // Move to "finished" stage before full reset
      setTimeout(() => {
        flickState = "finished";
        resetFlickDetection();
      }, FLICK_TIME_THRESHOLD);
    }
  }
}


/**
 * Resets flick detection properly after a flick sequence ends.
 */
function resetFlickDetection() {
  if (flickState === "finished") {
    flickState = "waiting"; // Fully reset for new flicks
    document.getElementById("status").textContent = "Waiting for gesture...";
    document.getElementById("status").style.color = "black";
    updateFlickIndicator(); // Reset indicator
  }
}


function detectSingleFlickHorizontal(x, y, z) {
  if (isLandscape && Math.abs(x) > HORIZONTAL_THRESHOLD_X && Math.abs(z) > HORIZONTAL_THRESHOLD_Z) {
    if (flickState !== "waiting") return false;

    flickState = "single_detected";
    lastFlickTime = Date.now();
    updateFlickIndicator();

    activateButton("singleFlickHorizontal", "Single Flick (Horizontal) Detected!");

    setTimeout(() => {
      flickState = "waiting";
    }, FLICK_TIME_THRESHOLD);

    return true;
  }
  return false;
}


function activateButton(buttonId, message) {
  let button = document.getElementById(buttonId); // Get the button element
  if (!button) return; // Prevent errors if the button is missing

  document.getElementById("status").textContent = message;
  document.getElementById("status").style.color = "green";

  button.classList.add("activated"); // Add class to change color

  setTimeout(() => {
    button.classList.remove("activated"); // Remove after 1s
  }, 1000);
}


/*
 * Detect Device Orientation (Landscape or Portrait)
 */
function checkOrientation(event) {
  let beta = event.beta || 0;   // Front-back tilt (-180 to 180)
  let gamma = event.gamma || 0; // Left-right tilt (-90 to 90)
  
  // Update displayed values
  document.getElementById("betaValue").textContent = roundNumber(beta);
  document.getElementById("gammaValue").textContent = roundNumber(gamma);

  // Detect orientation
  if (beta > 45 && beta < 135) {
    isLandscape = false;
    document.getElementById("orientationState").textContent = "Portrait";
  } else if (beta < -45 && beta > -135) {
    isLandscape = false;
    document.getElementById("orientationState").textContent = "Upside-Down Portrait";
  } else if (Math.abs(gamma) > 25) {
    isLandscape = true;
    document.getElementById("orientationState").textContent = "Landscape";
  } else if (beta >= -20 && beta <= 20) {
    document.getElementById("orientationState").textContent = "Portrait";
  } else {
    isLandscape = false;
    document.getElementById("orientationState").textContent = "Portrait";
  }
}


/*
 * Device motion event listener, processes accelerometer values.
 */
function callbackMotion(event) {
  let x = event.acceleration.x || 0;
  let y = event.acceleration.y || 0;
  let z = event.acceleration.z || 0;

  // Track peak values
  peak_x = Math.max(peak_x, Math.abs(x));
  peak_y = Math.max(peak_y, Math.abs(y));
  peak_z = Math.max(peak_z, Math.abs(z));

  // Update live acceleration values
  document.getElementById("acc_x").textContent = roundNumber(x);
  document.getElementById("acc_y").textContent = roundNumber(y);
  document.getElementById("acc_z").textContent = roundNumber(z);
  
  // Detect flicks based on orientation
  handleVerticalFlick(y, z);
  detectSingleFlickHorizontal(x, y, z);

  // Update peak values
  document.getElementById("peak_x").textContent = roundNumber(peak_x);
  document.getElementById("peak_y").textContent = roundNumber(peak_y);
  document.getElementById("peak_z").textContent = roundNumber(peak_z);
}

/*
 * Utility function for rounding numbers.
 */
function roundNumber(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function resetPeakValues() {
  peak_x = 0;
  peak_y = 0;
  peak_z = 0;
  document.getElementById("peak_x").textContent = "0";
  document.getElementById("peak_y").textContent = "0";
  document.getElementById("peak_z").textContent = "0";
}

/*
 * Resets peak values and flick detection.
 */
function onClickReset() {
  resetPeakValues();
  flickState = "waiting";
  document.getElementById("status").textContent = "Waiting for gesture...";
  document.getElementById("status").style.color = "black";
}

/*
 * Start event listeners on page load.
 */
window.onload = function onLoad() {
  window.addEventListener("devicemotion", callbackMotion);
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", checkOrientation);
  } else {
    console.log("Device orientation not supported.");
  }
    updateFlickIndicator();
};
