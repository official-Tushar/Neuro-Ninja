// ---- Constants ----
const DIFFICULTY_MAP = ["easy", "medium", "hard"];
const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"];

// ---- Game State (mutable) ----
let gameModeType = "single"; // "single", "pvp", "pvc"
let computerDifficulty = "easy"; // "easy", "medium", "hard"

// Optional: DOM element cache (used in game.js if you want)
const difficultySlider = document.getElementById("difficulty-slider");

// ---- Slider Logic ----
function initializeSliderUI(sliderEl, valueEl) {
  if (!sliderEl || !valueEl) return;

  sliderEl.value = 0;
  sliderEl.classList.remove("medium", "hard");
  sliderEl.classList.add("easy");

  valueEl.classList.remove("medium", "hard");
  valueEl.classList.add("easy");
  valueEl.textContent = "Easy";
}

function updateDifficultyFromSlider(sliderEl, valueEl, currentMode = "single", modeTextEl = null) {
  if (!sliderEl || !valueEl) return;

  const idx = parseInt(sliderEl.value, 10);
  const difficulty = DIFFICULTY_MAP[idx];

  computerDifficulty = difficulty; // update global
  valueEl.textContent = DIFFICULTY_LABELS[idx];

  sliderEl.classList.remove("easy", "medium", "hard");
  valueEl.classList.remove("easy", "medium", "hard");

  sliderEl.classList.add(difficulty);
  valueEl.classList.add(difficulty);

  if (currentMode === "pvc" && modeTextEl) {
    modeTextEl.textContent = `Player vs Computer (${DIFFICULTY_LABELS[idx]})`;
  }

  return difficulty;
}

// ---- Time and Moves ----
function timeGenerator(seconds, minutes, timeValueEl) {
  seconds += 1;
  if (seconds >= 60) {
    minutes += 1;
    seconds = 0;
  }

  const secStr = seconds < 10 ? `0${seconds}` : seconds;
  const minStr = minutes < 10 ? `0${minutes}` : minutes;
  if (timeValueEl) {
    timeValueEl.innerHTML = `<span>Time:</span> ${minStr}:${secStr}`;
  }

  return { seconds, minutes };
}

function movesCounter(movesCount, movesEl) {
  movesCount += 1;
  if (movesEl) {
    movesEl.innerHTML = `<span>Moves:</span> ${movesCount}`;
  }
  return movesCount;
}

// ---- State Accessors ----
function getGameModeType() {
  return gameModeType;
}
function setGameModeType(mode) {
  gameModeType = mode;
}

function getComputerDifficulty() {
  return computerDifficulty;
}
function setComputerDifficulty(level) {
  computerDifficulty = level;
}

export {
  DIFFICULTY_MAP,
  DIFFICULTY_LABELS,
  initializeSliderUI,
  updateDifficultyFromSlider,
  timeGenerator,
  movesCounter,
  difficultySlider,
  getGameModeType,
  setGameModeType,
  getComputerDifficulty,
  setComputerDifficulty,
};
