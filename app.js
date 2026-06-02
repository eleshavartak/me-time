// --- Me Time: core loop ---

let activities = [];
let currentTier = null;
let currentTimeLabel = "";
let currentActivity = null;

const pickerScreen = document.getElementById("picker-screen");
const resultScreen = document.getElementById("result-screen");
const resultTime   = document.getElementById("result-time");
const activityName = document.getElementById("activity-name");
const activityLink = document.getElementById("activity-link");
const shuffleBtn   = document.getElementById("shuffle-btn");
const restartBtn   = document.getElementById("restart-btn");

// 1. Load the menu when the page opens.
fetch("activities.json")
  .then((response) => response.json())
  .then((data) => { activities = data.activities; })
  .catch((error) => {
    activityName.textContent = "Couldn't load the menu — try refreshing.";
    console.error("Failed to load activities.json:", error);
  });

// 2. Tap a time -> go to the result screen with one activity.
document.querySelectorAll(".time-btn").forEach((button) => {
  button.addEventListener("click", () => {
    currentTier = button.dataset.tier;
    currentTimeLabel = button.textContent;   // e.g. "5 minutes"
    currentActivity = null;                  // fresh start for this time
    showActivity();
  });
});

// 3. "Show me another" -> a different activity from the same time.
shuffleBtn.addEventListener("click", showActivity);

// 4. "Pick a different time" -> back to the buttons.
restartBtn.addEventListener("click", () => {
  resultScreen.hidden = true;
  pickerScreen.hidden = false;
});

// Pick a random activity for the chosen time and show the result screen.
function showActivity() {
  const matches = activities.filter((a) => a.tiers.includes(currentTier));

  if (matches.length === 0) {
    activityName.textContent = "Nothing here yet — pick another time.";
    activityLink.hidden = true;
    goToResult();
    return;
  }

  // Avoid repeating the one just shown (unless it's the only option).
  let options = matches;
  if (matches.length > 1 && currentActivity) {
    options = matches.filter((a) => a.id !== currentActivity.id);
  }
  currentActivity = options[Math.floor(Math.random() * options.length)];

  resultTime.textContent = currentTimeLabel;
  activityName.textContent = currentActivity.name;

  // Show a resource link if this activity has one (random pick if several).
  if (currentActivity.links && currentActivity.links.length > 0) {
    activityLink.href = currentActivity.links[Math.floor(Math.random() * currentActivity.links.length)];
    activityLink.hidden = false;
  } else {
    activityLink.hidden = true;
  }

  goToResult();
}

// Show the result screen, hide the picker.
function goToResult() {
  pickerScreen.hidden = true;
  resultScreen.hidden = false;
}