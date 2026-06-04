// --- Me Time ---

let activities       = [];
let currentTier      = null;
let currentTimeLabel = "";
let currentActivity  = null;
let beforeScore      = null;

// Screens
const splashScreen = document.getElementById("splash-screen");
const introScreen  = document.getElementById("intro-screen");
const pickerScreen = document.getElementById("picker-screen");
const beforeScreen = document.getElementById("before-screen");
const resultScreen = document.getElementById("result-screen");
const afterScreen  = document.getElementById("after-screen");
const allScreens   = [introScreen, pickerScreen, beforeScreen, resultScreen, afterScreen];

// Elements
const activityName = document.getElementById("activity-name");
const doneBtn      = document.getElementById("done-btn");
const shuffleBtn   = document.getElementById("shuffle-btn");
const backBtn      = document.getElementById("back-btn");
const againBtn     = document.getElementById("again-btn");
const toast        = document.getElementById("toast");
const introNextBtn = document.getElementById("intro-next-btn");

// ─── Splash ───
(function () {
  setTimeout(() => {
    splashScreen.classList.add("hide");
    setTimeout(() => {
      splashScreen.style.display = "none";
      showScreen(introScreen);
    }, 500);
  }, 1500);
})();

// ─── Emoji scale ───
const emojis = [
  { emoji: "😔", label: "Very flat" },
  { emoji: "😕", label: "Low" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😊", label: "Really good" }
];

function buildEmojiPicker(containerId, onSelect) {
  const container = document.getElementById(containerId);
  emojis.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    btn.innerHTML = `<span class="emoji">${item.emoji}</span><span class="emoji-label">${item.label}</span>`;
    // Map 5 emojis to a 1–10 scale: 1, 3, 5, 7, 10
    const scoreMap = [1, 3, 5, 7, 10];
    btn.addEventListener("click", () => onSelect(scoreMap[index]));
    container.appendChild(btn);
  });
}

buildEmojiPicker("before-picker", (score) => {
  beforeScore = score;
  showActivity();
});

buildEmojiPicker("after-picker", (score) => {
  saveCheckin(score);
  // Show toast then reveal again button
  toast.hidden = false;
  setTimeout(() => {
    againBtn.hidden = false;
  }, 600);
});

// ─── Load activities ───
fetch("activities.json")
  .then((res) => res.json())
  .then((data) => { activities = data.activities; })
  .catch((err) => {
    activityName.textContent = "Couldn't load the menu — try refreshing.";
    console.error("Failed to load activities.json:", err);
  });

// ─── Intro screen ───
introNextBtn.addEventListener("click", () => showScreen(pickerScreen));

// ─── Time picker ───
document.querySelectorAll(".time-btn").forEach((button) => {
  button.addEventListener("click", () => {
    // Visual selected state
    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");

    currentTier      = button.dataset.tier;
    currentTimeLabel = button.textContent;
    currentActivity  = null;
    beforeScore      = null;

    // Small delay so the selected state is visible before screen change
    setTimeout(() => showScreen(beforeScreen), 180);
  });
});

// ─── Activity screen buttons ───
shuffleBtn.addEventListener("click", showActivity);
backBtn.addEventListener("click",    () => showScreen(pickerScreen));
doneBtn.addEventListener("click",    () => {
  toast.hidden  = true;
  againBtn.hidden = true;
  showScreen(afterScreen);
});
againBtn.addEventListener("click",   () => {
  beforeScore = null;
  toast.hidden = true;
  againBtn.hidden = true;
  // Reset time button selected state
  document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
  showScreen(introScreen);
});

// ─── Show activity ───
function showActivity() {
  const matches = activities.filter((a) => a.tiers.includes(currentTier));
  if (matches.length === 0) {
    activityName.textContent = "Nothing here yet — pick another time.";
    showScreen(resultScreen);
    return;
  }
  let options = matches;
  if (matches.length > 1 && currentActivity) {
    options = matches.filter((a) => a.id !== currentActivity.id);
  }
  currentActivity = options[Math.floor(Math.random() * options.length)];
  activityName.textContent = currentActivity.name;
  showScreen(resultScreen);
}

// ─── Save check-in ───
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
    delta:        afterScore - beforeScore,
    date:         new Date().toISOString()
  });
  localStorage.setItem("me-time-checkins", JSON.stringify(checkins));
}

// ─── Screen helper ───
function showScreen(screen) {
  allScreens.forEach((s) => { s.hidden = true; });
  screen.hidden = false;
}