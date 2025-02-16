let peak_x = 0;
let peak_y = 0;
let peak_z = 0;
let count = 0;
let last_shake = 0;
let threshold_x = 10.5;
let threshold_z = 10.5;

/*
 * Utility function for setting motion value text colour.
 */
function setMotionLabelColor(color) {
  var acc_fields = document.getElementsByClassName('acc');
  for (var i = 0; i < acc_fields.length; ++i) {
    var item = acc_fields[i];
    item.setAttribute('style', 'color: ' + color);
  }
}

/*
 * A device motion callback function, which processes accelerometer values.
 */
function callbackMotion(event) {
  let x = event.acceleration.x;
  let y = event.acceleration.y;
  let z = event.acceleration.z;

  if (Math.abs(x) > peak_x) {
    peak_x = Math.abs(x);
  }

  if (Math.abs(y) > peak_y) {
    peak_y = Math.abs(y);
  }

  if (Math.abs(z) > peak_z) {
    peak_z = Math.abs(z);
  }

  document.getElementById("acc_x").textContent = roundNumber(x);
  document.getElementById("acc_y").textContent = roundNumber(y);
  document.getElementById("acc_z").textContent = roundNumber(z);

  document.getElementById("peak_x").textContent = roundNumber(peak_x);
  document.getElementById("peak_y").textContent = roundNumber(peak_y);
  document.getElementById("peak_z").textContent = roundNumber(peak_z);

  // Implement your shake gesture detector here
  if (Math.abs(x) > 10.5) { // <--- threshold test
    shakeGestureDetected();
    setMotionLabelColor("orangered");
  } else {
    setMotionLabelColor("black");
  }
}

/*
 * Utility function for rounding a float.
 */
function roundNumber(x) {
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

/*
 * Resets peak values and the gesture detection counter.
 */
function onClickReset() {
  peak_x = 0;
  peak_y = 0;
  peak_z = 0;
  count = 0;
}

/*
 * Call this function when a gesture has been detected. Will update a text
 * field shown on the page with the most recent detection time.
 */
let lastShakeTime = 0;
const SHAKE_DELAY = 1000;

function shakeGestureDetected() {
  let now = new Date();
  let timestamp = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

  let currentTime = timeMilliseconds();

  if (now - lastShakeTime < SHAKE_DELAY) {
    return;
  }

  lastShakeTime = now;

  document.getElementById("gesture_time").textContent = timestamp;
  document.getElementById("gesture_count").textContent = ++count;
}

/*
 * Returns the current time in milliseconds as a number.
 */
function timeMilliseconds() {
  return Date.now();
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
 * After the page has loaded, add our device motion event listener.
 */
window.onload = function onLoad() {
  window.addEventListener("devicemotion", callbackMotion);
};
