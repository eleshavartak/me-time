// --- Me Time ---

let activities    = [];
let currentTier   = null;
let currentTimeLabel = "";
let currentActivity  = null;
let beforeScore   = null;

const pickerScreen = document.getElementById("picker-screen");
const beforeScreen = document.getElementById("before-screen");
const resultScreen = document.getElementById("result-screen");
const afterScreen  = document.getElementById("after-screen");
const savedScreen  = document.getElementById("saved-screen");
const allScreens   = [pickerScreen, beforeScreen, resultScreen, afterScreen, savedScreen];

const resultTime   = document.getElementById("result-time");
const activityName = document.getElementById("activity-name");
const activityLink = document.getElementById("activity-link");
const doneBtn      = document.getElementById("done-btn");
const shuffleBtn   = document.getElementById("shuffle-btn");
const restartBtn   = document.getElementById("restart-btn");
const againBtn     = document.getElementById("again-btn");

// Build the 1–10 score buttons for a given container.
function buildScorePicker(containerId, onSelect) {
  const container = document.getElementById(containerId);
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement("button");
    btn.className = "score-btn";
    btn.textContent = i;
    btn.addEventListener("click", () => onSelect(i));
    container.appendChild(btn);
  }
}

// Before: record the score, then show the activity.
buildScorePicker("before-picker", (score) => {
  beforeScore = score;
  showActivity();
});

// After: record the score, save the session, go to saved.
buildScorePicker("after-picker", (score) => {
  saveCheckin(score);
  showScreen(savedScreen);
});

// Load the activity menu.
fetch("activities.json")
  .then((res) => res.json())
  .then((data) => { activities = data.activities; })
  .catch((err) => {
    activityName.textContent = "Couldn't load the menu — try refreshing.";
    console.error("Failed to load activities.json:", err);
  });

// Screen 1: tap a time → go to the before-check.
document.querySelectorAll(".time-btn").forEach((button) => {
  button.addEventListener("click", () => {
    currentTier      = button.dataset.tier;
    currentTimeLabel = button.textContent;
    currentActivity  = null;
    beforeScore      = null;
    showScreen(beforeScreen);
  });
});

// Screen 3 actions.
shuffleBtn.addEventListener("click", showActivity);
restartBtn.addEventListener("click", () => { beforeScore = null; showScreen(pickerScreen); });
doneBtn.addEventListener("click",    () => showScreen(afterScreen));

// Screen 5: start again.
againBtn.addEventListener("click", () => { beforeScore = null; showScreen(pickerScreen); });

// Pick and display a random activity for the current tier.
function showActivity() {
  const matches = activities.filter((a) => a.tiers.includes(currentTier));

  if (matches.length === 0) {
    activityName.textContent = "Nothing here yet — pick another time.";
    activityLink.hidden = true;
    showScreen(resultScreen);
    return;
  }

  let options = matches;
  if (matches.length > 1 && currentActivity) {
    options = matches.filter((a) => a.id !== currentActivity.id);
  }
  currentActivity = options[Math.floor(Math.random() * options.length)];

  resultTime.textContent = currentTimeLabel;
  activityName.textContent = currentActivity.name;

  if (currentActivity.links && currentActivity.links.length > 0) {
    activityLink.href = currentActivity.links[Math.floor(Math.random() * currentActivity.links.length)];
    activityLink.hidden = false;
  } else {
    activityLink.hidden = true;
  }

  showScreen(resultScreen);
}

// Save the completed session: before score, after score, and the delta.
function saveCheckin(afterScore) {
  const checkins = JSON.parse(localStorage.getItem("me-time-checkins") || "[]");
  checkins.push({
    id:           Date.now(),
    activityId:   currentActivity.id,
    activityName: currentActivity.name,
    tier:         currentTier,
    category:     currentActivity.category,
    beforeScore,
    afterScore,
    delta:        afterScore - beforeScore,   // positive = felt better
    date:         new Date().toISOString()
  });
  localStorage.setItem("me-time-checkins", JSON.stringify(checkins));
}

// Hide every screen, show the target one.
function showScreen(screen) {
  allScreens.forEach((s) => { s.hidden = true; });
  screen.hidden = false;
}