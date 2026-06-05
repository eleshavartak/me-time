// --- Me Time ---

let activities       = [];
let currentTier      = null;
let currentTimeLabel = "";
let currentActivity  = null;
let beforeScore      = null;
let beforeEmojiIndex = null;

// Screens
const splashScreen = document.getElementById("splash-screen");
const introScreen  = document.getElementById("intro-screen");
const pickerScreen = document.getElementById("picker-screen");
const beforeScreen = document.getElementById("before-screen");
const resultScreen = document.getElementById("result-screen");
const afterScreen  = document.getElementById("after-screen");
const allScreens   = [introScreen, pickerScreen, beforeScreen, resultScreen, afterScreen];

// Elements
const activityName  = document.getElementById("activity-name");
const activityLink  = document.getElementById("activity-link");
const doneBtn       = document.getElementById("done-btn");
const shuffleBtn    = document.getElementById("shuffle-btn");
const backBtn       = document.getElementById("back-btn");
const againBtn      = document.getElementById("again-btn");
const toast         = document.getElementById("toast");
const introNextBtn  = document.getElementById("intro-next-btn");
const beforeAck     = document.getElementById("before-ack");
const beforeAckBtn  = document.getElementById("before-ack-btn");
const afterAck      = document.getElementById("after-ack");

// ─── Splash ───
(function () {
  setTimeout(() => {
    splashScreen.classList.add("hide");
    setTimeout(() => {
      splashScreen.style.display = "none";
      showScreen(introScreen);
    }, 500);
  }, 2500);
})();

// ─── Emoji scale ───
const emojis = [
  { emoji: "😔", label: "very flat" },
  { emoji: "😕", label: "low" },
  { emoji: "😐", label: "okay" },
  { emoji: "🙂", label: "good" },
  { emoji: "😊", label: "really good" }
];

const scoreMap = [1, 3, 5, 7, 10];

// Before: text + button copy (index 0–4)
const beforeAcks = [
  { text: "That's okay. You showed up for yourself anyway.",         btn: "Let's find something that helps" },
  { text: "It's alright to feel a bit off. You're here, and that counts.", btn: "Let's find something that helps" },
  { text: "Somewhere in the middle — that's a perfectly valid place to be.", btn: "Let's find something that helps" },
  { text: "Nice, you're in a decent place.",                         btn: "Let's make the most of this moment" },
  { text: "Love that for you.",                                      btn: "Let's keep that energy going" }
];

// After: full copy matrix
function getAfterAck(beforeIdx, afterIdx) {
  const bLabel = emojis[beforeIdx].label;
  const aLabel = emojis[afterIdx].label;
  const isGood = (idx) => idx >= 3; // Good or Really good

  if (afterIdx > beforeIdx) {
    // Improved
    if (isGood(afterIdx)) {
      return `Before, you were feeling ${bLabel}. Now you're feeling ${aLabel}. That's nice, keep this going.`;
    }
    return `Before, you were feeling ${bLabel}. Now you're feeling ${aLabel}. Glad some me time helped.`;
  } else if (afterIdx === beforeIdx) {
    // Same
    if (isGood(afterIdx)) {
      return `Before, you were feeling ${bLabel}. Still feeling ${aLabel}. You're holding steady, that's great.`;
    }
    return `Before, you were feeling ${bLabel}. Still feeling ${aLabel}. That's completely fine — sometimes we just need to be.`;
  } else {
    // Dipped
    if (isGood(afterIdx)) {
      return `Before, you were feeling ${bLabel}. Now feeling ${aLabel}. Feelings fluctuate — that's completely normal.`;
    }
    return `Before, you were feeling ${bLabel}. Now feeling ${aLabel}. This shall pass — sometimes we just need to be.`;
  }
}

// ─── Emoji picker builder ───
function buildEmojiPicker(containerId, onSelect) {
  const container = document.getElementById(containerId);
  emojis.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    btn.innerHTML = `<span class="emoji">${item.emoji}</span><span class="emoji-label">${item.label}</span>`;
    btn.addEventListener("click", () => {
      container.querySelectorAll(".emoji-btn").forEach((b, i) => {
        b.classList.toggle("selected", i === index);
        b.classList.toggle("dimmed",   i !== index);
        if (i !== index) b.disabled = true;
      });
      onSelect(index, scoreMap[index]);
    });
    container.appendChild(btn);
  });
}

buildEmojiPicker("before-picker", (emojiIndex, score) => {
  beforeScore      = score;
  beforeEmojiIndex = emojiIndex;

  const ack = beforeAcks[emojiIndex];
  beforeAck.textContent    = ack.text;
  beforeAckBtn.textContent = ack.btn;
  beforeAck.removeAttribute("hidden");
  beforeAckBtn.removeAttribute("hidden");
});

buildEmojiPicker("after-picker", (emojiIndex, score) => {
  saveCheckin(score);

  afterAck.textContent = getAfterAck(beforeEmojiIndex, emojiIndex);
  afterAck.removeAttribute("hidden");

  setTimeout(() => {
    toast.removeAttribute("hidden");
    toast.style.display = "flex";
  }, 2000);

  setTimeout(() => {
    againBtn.removeAttribute("hidden");
    againBtn.style.display = "block";
  }, 3200);
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

// ─── Before ack button → activity ───
beforeAckBtn.addEventListener("click", () => showActivity());

// ─── Time picker ───
document.querySelectorAll(".time-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");
    currentTier      = button.dataset.tier;
    currentTimeLabel = button.textContent;
    currentActivity  = null;
    beforeScore      = null;
    beforeEmojiIndex = null;
    setTimeout(() => showScreen(beforeScreen), 180);
  });
});

// ─── Activity screen buttons ───
shuffleBtn.addEventListener("click", showActivity);
backBtn.addEventListener("click", () => showScreen(pickerScreen));

doneBtn.addEventListener("click", () => {
  resetAfterScreen();
  showScreen(afterScreen);
});

againBtn.addEventListener("click", () => {
  beforeScore      = null;
  beforeEmojiIndex = null;
  resetAfterScreen();
  document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
  showScreen(pickerScreen);
});

// ─── Reset after screen ───
function resetAfterScreen() {
  toast.setAttribute("hidden", "");
  toast.style.display = "none";
  againBtn.setAttribute("hidden", "");
  againBtn.style.display = "none";
  afterAck.setAttribute("hidden", "");
  afterAck.textContent = "";
  beforeAck.setAttribute("hidden", "");
  beforeAck.textContent = "";
  beforeAckBtn.setAttribute("hidden", "");
  beforeAckBtn.textContent = "";

  ["before-picker", "after-picker"].forEach(id => {
    document.querySelectorAll(`#${id} .emoji-btn`).forEach(b => {
      b.disabled = false;
      b.classList.remove("selected", "dimmed");
    });
  });
}

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

  if (currentActivity.links && currentActivity.links.length > 0) {
    activityLink.href = currentActivity.links[Math.floor(Math.random() * currentActivity.links.length)];
    activityLink.style.display = "block";
  } else {
    activityLink.style.display = "none";
  }

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