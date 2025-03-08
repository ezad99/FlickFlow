let peak_x = 0;
let peak_y = 0;
let peak_z = 0;
let count = 0;
let last_shake = 0;
let VERTICAL_THRESHOLD_Y = 15;
let VERTICAL_THRESHOLD_Z = 15;
let HORIZONTAL_THRESHOLD_X = 5;
let HORIZONTAL_THRESHOLD_Z = 10;
let isLandscape = false; // Track device orientation


// Timer Variables
let flickStartTime = 0;
let timerInterval = null;
const MIN_TIME_BETWEEN_FLICKS = 500;
const FINISH_TIME = 500;


// Constants for single flick
let lastFlickTime = 0;
const FLICK_TIME_THRESHOLD = 1000; 
let flickState = "idle"; // "idle", "single_detected", "double_detected", "finished"

// Constants for double flick
const DOUBLE_FLICK_TIME_THRESHOLD = 2000; // Max time between two flicks
let lastSingleFlickTime = 0;

// Constants for triple flick
const TRIPLE_FLICK_TIME_THRESHOLD = 3000; // Max time between three flicks
let lastDoubleFlickTime = 0;


/**
 * Updates flick thresholds.
 */
function updateThresholds() {
  const DECAY_FACTOR = 0.5; // 50% decrease per update
  const MIN_VERTICAL_THRESHOLD_Y = 15;
  const MIN_VERTICAL_THRESHOLD_Z = 15;
  const MIN_HORIZONTAL_THRESHOLD_X = 5;
  const MIN_HORIZONTAL_THRESHOLD_Z = 10;

  // Apply decay to old threshold values, ensuring they don't drop below their initial values
  VERTICAL_THRESHOLD_Y = Math.max((VERTICAL_THRESHOLD_Y * DECAY_FACTOR), MIN_VERTICAL_THRESHOLD_Y, peak_y * 0.20);
  VERTICAL_THRESHOLD_Z = Math.max((VERTICAL_THRESHOLD_Z * DECAY_FACTOR),  MIN_VERTICAL_THRESHOLD_Z, peak_z * 0.20);
  HORIZONTAL_THRESHOLD_X = Math.max((HORIZONTAL_THRESHOLD_X * DECAY_FACTOR),  MIN_HORIZONTAL_THRESHOLD_X, peak_x * 0.20);
  HORIZONTAL_THRESHOLD_Z = Math.max((HORIZONTAL_THRESHOLD_Z * DECAY_FACTOR), MIN_HORIZONTAL_THRESHOLD_Z, peak_z * 0.20);

  console.log("Updated Thresholds:");
  console.log(`VERTICAL_THRESHOLD_Y: ${VERTICAL_THRESHOLD_Y}`);
  console.log(`VERTICAL_THRESHOLD_Z: ${VERTICAL_THRESHOLD_Z}`);
  console.log(`HORIZONTAL_THRESHOLD_X: ${HORIZONTAL_THRESHOLD_X}`);
  console.log(`HORIZONTAL_THRESHOLD_Z: ${HORIZONTAL_THRESHOLD_Z}`);
}



/**
 * Starts a countdown timer for the next flick.
 */
function startFlickTimer(duration) {
  flickStartTime = Date.now();
  const flickTimer = document.getElementById("flickTimer");

  if (timerInterval) clearInterval(timerInterval); // Reset existing timer

  timerInterval = setInterval(() => {
    let remainingTime = duration - (Date.now() - flickStartTime); // Time left in ms

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      flickTimer.textContent = "Time remaining: 0.00s";
      return;
    }

    flickTimer.textContent = `Time remaining for next flick: ${(remainingTime / 1000).toFixed(2)}s`;
  }, 50);
}

/**
 * Stops and clears the flick countdown timer.
 */
function stopFlickTimer() {
  clearInterval(timerInterval);
  document.getElementById("flickTimer").textContent = "Time remaining: 0.00s";
}

// Flick State Indicator
function updateState() {
  let state = document.getElementById("status");

  switch (flickState) {
    case "idle":
      state.textContent = "Idle..";
      state.style.color = "black";
      break;
    case "single_detected":
      state.textContent = "Single Vertical Flick Detected!";
      state.style.color = "purple";
      break;
    case "double_detected":
      state.textContent = "Double Vertical Flick Detected!";
      state.style.color = "red";
      break;
    case "triple_detected":
      state.textContent = "Triple Vertical Flick Detected!";
      state.style.color = "orange";
      break;
    case "finished":
      state.textContent = "Detection Finished";
      state.style.color = "blue";
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

/**
 * Detects a triple flick in the vertical direction.
 */
function detectTripleFlickVertical() {
  return flickState === "double_detected" && (Date.now() - lastDoubleFlickTime <= TRIPLE_FLICK_TIME_THRESHOLD);
}

let waitingForDouble = false; // Flag to prevent instant double flick detection

/**
 * Handles single and double flick detection for vertical motion.
 */
function handleVerticalFlick(y, z) {
  if (detectSingleFlickVertical(y, z)) {
    const currentTime = Date.now();

    if (flickState === "idle") {
      // First flick detected
      flickState = "single_detected";
      lastSingleFlickTime = currentTime;
      activateButton("singleFlickVertical", "Single Flick (Vertical) Detected!");
      startFlickTimer(DOUBLE_FLICK_TIME_THRESHOLD);
      updateState();
      updateThresholds();

      // Set timeout to transition to "finished" if no second flick occurs
      setTimeout(() => {
        if (flickState === "single_detected") {
          flickState = "finished"; // Move to "finished" state if no second flick happens
          stopFlickTimer();
          updateState();
          resetFlickDetection();
        }
      }, DOUBLE_FLICK_TIME_THRESHOLD);
    } 
    else if (flickState === "single_detected") {
      // Prevent instant double flick detection
      if (currentTime - lastSingleFlickTime < MIN_TIME_BETWEEN_FLICKS) {
        return; // Ignore flicks that happen too quickly
      }

      // Ensure the second flick is within time limit
      if (currentTime - lastSingleFlickTime <= DOUBLE_FLICK_TIME_THRESHOLD) {
        flickState = "double_detected";
        lastDoubleFlickTime = currentTime;
        activateButton("doubleFlickVertical", "Double Flick (Vertical) Detected!");
        stopFlickTimer();
        updateState();
        updateThresholds();

        // Start timer for triple flick
        startFlickTimer(TRIPLE_FLICK_TIME_THRESHOLD);

        // After detecting double flick, transition to "finished" after a short delay
        setTimeout(() => {
          if (flickState === "double_detected") {
            flickState = "finished";
            updateState();
            resetFlickDetection();
          }
        }, TRIPLE_FLICK_TIME_THRESHOLD);
      }
    } 
    else if (flickState === "double_detected") {
      // Prevent instant triple flick detection
      if (currentTime - lastDoubleFlickTime < MIN_TIME_BETWEEN_FLICKS) {
        return; // Ignore flicks that happen too quickly
      }

      // Ensure the third flick is within time limit
      if (currentTime - lastDoubleFlickTime <= TRIPLE_FLICK_TIME_THRESHOLD) {
        flickState = "triple_detected";
        activateButton("tripleFlickVertical", "Triple Flick (Vertical) Detected!");
        stopFlickTimer();
        updateState();
        updateThresholds();

        // After detecting triple flick, transition to "finished" after a short delay
        setTimeout(() => {
          flickState = "finished";
          updateState();
          resetFlickDetection();
        }, FLICK_TIME_THRESHOLD);
      }
    }
  }
}



/**
 * Resets flick detection after showing "finished" state for a duration.
 */
function resetFlickDetection() {
  if (flickState === "finished") {
    setTimeout(() => {
      flickState = "idle"; // Reset after a 
      document.getElementById("status").textContent = "Idle..";
      document.getElementById("status").style.color = "black";
      updateState();
    }, FINISH_TIME); 
  }
}

/**
 * Detects a single flick in the horizontal direction.
 */
function detectSingleFlickHorizontal(x, z) {
  return isLandscape && Math.abs(x) > HORIZONTAL_THRESHOLD_X && Math.abs(z) > HORIZONTAL_THRESHOLD_Z;
}

/**
 * Detects a double flick in the horizontal direction.
 */
function detectDoubleFlickHorizontal() {
  return flickState === "single_detected" && (Date.now() - lastSingleFlickTime <= DOUBLE_FLICK_TIME_THRESHOLD);
}

/**
 * Detects a triple flick in the horizontal direction.
 */
function detectTripleFlickHorizontal() {
  return flickState === "double_detected" && (Date.now() - lastDoubleFlickTime <= TRIPLE_FLICK_TIME_THRESHOLD);
}

/**
 * Handles single, double, and triple flick detection for horizontal motion.
 */
function handleHorizontalFlick(x, z) {
  if (detectSingleFlickHorizontal(x, z)) {
    const currentTime = Date.now();

    if (flickState === "idle") {
      // First flick detected
      flickState = "single_detected";
      lastSingleFlickTime = currentTime;
      activateButton("singleFlickHorizontal", "Single Flick (Horizontal) Detected!");
      startFlickTimer(DOUBLE_FLICK_TIME_THRESHOLD);
      updateState();
      updateThresholds();

      // Set timeout to transition to "finished" if no second flick occurs
      setTimeout(() => {
        if (flickState === "single_detected") {
          flickState = "finished"; // Move to "finished" state if no second flick happens
          stopFlickTimer();
          updateState();
          resetFlickDetection();
        }
      }, DOUBLE_FLICK_TIME_THRESHOLD);
    } 
    else if (flickState === "single_detected") {
      // Prevent instant double flick detection
      if (currentTime - lastSingleFlickTime < MIN_TIME_BETWEEN_FLICKS) {
        return; // Ignore flicks that happen too quickly
      }

      // Ensure the second flick is within time limit
      if (currentTime - lastSingleFlickTime <= DOUBLE_FLICK_TIME_THRESHOLD) {
        flickState = "double_detected";
        lastDoubleFlickTime = currentTime;
        activateButton("doubleFlickHorizontal", "Double Flick (Horizontal) Detected!");
        stopFlickTimer();
        updateState();
        updateThresholds();

        // Start timer for triple flick
        startFlickTimer(TRIPLE_FLICK_TIME_THRESHOLD);

        // After detecting double flick, transition to "finished" after a short delay
        setTimeout(() => {
          if (flickState === "double_detected") {
            flickState = "finished";
            updateState();
            resetFlickDetection();
          }
        }, TRIPLE_FLICK_TIME_THRESHOLD);
      }
    } 
    else if (flickState === "double_detected") {
      // Prevent instant triple flick detection
      if (currentTime - lastDoubleFlickTime < MIN_TIME_BETWEEN_FLICKS) {
        return; // Ignore flicks that happen too quickly
      }

      // Ensure the third flick is within time limit
      if (currentTime - lastDoubleFlickTime <= TRIPLE_FLICK_TIME_THRESHOLD) {
        flickState = "triple_detected";
        activateButton("tripleFlickHorizontal", "Triple Flick (Horizontal) Detected!");
        stopFlickTimer();
        updateState();
        updateThresholds();

        // After detecting triple flick, transition to "finished" after a short delay
        setTimeout(() => {
          flickState = "finished";
          updateState();
          resetFlickDetection();
        }, FLICK_TIME_THRESHOLD);
      }
    }
  }
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
  let orientationElement = document.getElementById("orientationState");

  if (beta > 45 && beta < 135) {
    isLandscape = false;
    orientationElement.textContent = "Portrait";
    orientationElement.style.color = "blue"; // Portrait -> Blue
  } else if (beta < -45 && beta > -135) {
    isLandscape = false;
    orientationElement.textContent = "Upside-Down Portrait";
    orientationElement.style.color = "red"; // Upside-down -> Red
  } else if (Math.abs(gamma) > 25) {
    isLandscape = true;
    orientationElement.textContent = "Landscape";
    orientationElement.style.color = "green"; // Landscape -> Green
  } else {
    isLandscape = false;
    orientationElement.textContent = "Portrait";
    orientationElement.style.color = "blue"; // Default -> Blue
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
  handleHorizontalFlick(x, z);

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


/*
 * Resets peak values and flick detection.
 */
function onClickReset() {
  flickState = "waiting";
  document.getElementById("status").textContent = "Waiting for gesture...";
  document.getElementById("status").style.color = "black";
}

/*
 * Asks iOS 13+ users for permission to access device motion data.
 */
function applePermissions() {
  if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission();
  }
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
    updateState();
};
