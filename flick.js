let peak_x = 0;
let peak_y = 0;
let peak_z = 0;
let count = 0;
let last_shake = 0;
let VERTICAL_THRESHOLD_X = 5;
let VERTICAL_THRESHOLD_Y = 12;
let VERTICAL_THRESHOLD_Z = 20;
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


let lastFlickTime = 0;
const FLICK_TIME_THRESHOLD = 500; 
let flickState = "waiting"; // "waiting", "single_detected", "double_detected"
let flickTimeout = null;

function detectSingleFlickVertical(x, y, z) {
  if (!isLandscape && Math.abs(y) > VERTICAL_THRESHOLD_Y && Math.abs(z) > VERTICAL_THRESHOLD_Z) {
    if (flickState !== "waiting") return false; // Ignore if already detected

    flickState = "single_detected";
    lastFlickTime = Date.now();

    activateButton("singleFlickVertical", "Single Flick (Vertical) Detected!");

    setTimeout(() => {
      flickState = "waiting";
    }, FLICK_TIME_THRESHOLD);

    return true;
  }
  return false;
}

function detectSingleFlickHorizontal(x, y, z) {
  if (isLandscape && Math.abs(x) > HORIZONTAL_THRESHOLD_X && Math.abs(z) > HORIZONTAL_THRESHOLD_Z) {
    if (flickState !== "waiting") return false;

    flickState = "single_detected";
    lastFlickTime = Date.now();

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
  detectSingleFlickVertical(x, y, z);
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
};
