let peak_x = 0;
let peak_y = 0;
let peak_z = 0;
let count = 0;
let last_shake = 0;
let THRESHOLD_X = 10.5;
let THRESHOLD_Y = 12;
let THRESHOLD_Z = 20;

/*
 * Utility function for setting motion value text color.
 */
function setMotionLabelColor(color) {
  let acc_fields = document.getElementsByClassName("acc");
  for (let i = 0; i < acc_fields.length; ++i) {
    acc_fields[i].style.color = color;
  }
}

/*
 * Detect a single flick in vertical position.
 */
function detectSingleFlickVertical(x, y, z) {
  let button = document.getElementById("singleFlickVertical"); // Single Flick (V)
  
  if (Math.abs(y) > THRESHOLD_Y && Math.abs(z) > THRESHOLD_Z) {
    document.getElementById("status").textContent = "Single Flick (Vertical) Detected!";
    document.getElementById("status").style.color = "green";
    
    // Change button color
    button.classList.add("activated");

    // Reset button after 1 second
    setTimeout(() => {
      button.classList.remove("activated");
    }, 1000);

    return true;
  }
  return false;
}

/*
 * A device motion callback function, which processes accelerometer values.
 */
function callbackMotion(event) {
  let x = event.acceleration.x || 0;
  let y = event.acceleration.y || 0;
  let z = event.acceleration.z || 0;

  // Track peak values
  if (Math.abs(x) > peak_x) peak_x = Math.abs(x);
  if (Math.abs(y) > peak_y) peak_y = Math.abs(y);
  if (Math.abs(z) > peak_z) peak_z = Math.abs(z);

  // Update live acceleration values
  document.getElementById("acc_x").textContent = roundNumber(x);
  document.getElementById("acc_y").textContent = roundNumber(y);
  document.getElementById("acc_z").textContent = roundNumber(z);
  
  detectSingleFlickVertical(x, y, z);

  // Update peak values
  document.getElementById("peak_x").textContent = roundNumber(peak_x);
  document.getElementById("peak_y").textContent = roundNumber(peak_y);
  document.getElementById("peak_z").textContent = roundNumber(peak_z);
}

/*
 * Utility function for rounding a float.
 */
function roundNumber(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/*
 * Resets peak values and flick detection.
 */
function onClickReset() {
  peak_x = 0;
  peak_y = 0;
  peak_z = 0;
  count = 0;
  document.getElementById("status").textContent = "Waiting for gesture...";
  document.getElementById("status").style.color = "black";
  document.getElementById("peak_x").textContent = "0";
  document.getElementById("peak_y").textContent = "0";
  document.getElementById("peak_z").textContent = "0";
}

/*
 * Start motion event listener on page load.
 */
window.onload = function onLoad() {
  window.addEventListener("devicemotion", callbackMotion);
};
