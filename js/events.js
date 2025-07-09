import {
  updateDifficultyFromSlider,
  DIFFICULTY_LABELS,
  setGameModeType,
  getGameModeType
} from "./utils.js";
import { showScreen } from "./ui.js";
import { initializer } from "./game.js";

// DOM references
const difficultySlider = document.getElementById("difficulty-slider");
const difficultyValue = document.getElementById("difficulty-value");
const difficultySelection = document.getElementById("difficulty-selection");
const modeText = document.getElementById("mode-text");

// Mode buttons
const singlePlayerBtn = document.getElementById("single-player");
const playerVsPlayerBtn = document.getElementById("player-vs-player");
const playerVsComputerBtn = document.getElementById("player-vs-computer");

// Navigation buttons
const startBtn = document.getElementById("start-btn");
const modeContinueBtn = document.getElementById("mode-continue-btn");
const restartBtn = document.getElementById("restart-btn");
const modeBackBtn = document.getElementById("mode-back-btn");

function setupEventListeners() {
  // Difficulty slider input
  if (difficultySlider && difficultyValue) {
    difficultySlider.addEventListener("input", () => {
      updateDifficultyFromSlider(difficultySlider, difficultyValue, getGameModeType(), modeText);
    });
  }

  // Mode selection buttons
  singlePlayerBtn.addEventListener("click", () => selectMode("single", singlePlayerBtn));
  playerVsPlayerBtn.addEventListener("click", () => selectMode("pvp", playerVsPlayerBtn));
  playerVsComputerBtn.addEventListener("click", () => selectMode("pvc", playerVsComputerBtn));

  // Navigation buttons
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      console.log('[Start] Play button clicked');
      showScreen("mode-screen");
      setTimeout(() => {
        console.log('[Start] Current screens state after Play:', {
          start: document.getElementById('start-screen')?.classList.value,
          mode: document.getElementById('mode-screen')?.classList.value,
          game: document.getElementById('game-screen')?.classList.value,
          score: document.getElementById('score-screen')?.classList.value
        });
      }, 100);
    });
  }

  if (modeContinueBtn) {
    modeContinueBtn.addEventListener("click", () => {
      console.log('[Mode] Start Game button clicked');
      showScreen("game-screen");
      setTimeout(() => {
        console.log('[Mode] Current screens state after Start Game:', {
          start: document.getElementById('start-screen')?.classList.value,
          mode: document.getElementById('mode-screen')?.classList.value,
          game: document.getElementById('game-screen')?.classList.value,
          score: document.getElementById('score-screen')?.classList.value
        });
      }, 100);
      initializer();
      console.log('[Mode] initializer called');
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      console.log('[Restart] Restart button clicked');
      showScreen("start-screen");
      setTimeout(() => {
        console.log('[Restart] Current screens state:', {
          start: document.getElementById('start-screen')?.classList.value,
          mode: document.getElementById('mode-screen')?.classList.value,
          game: document.getElementById('game-screen')?.classList.value,
          score: document.getElementById('score-screen')?.classList.value
        });
        console.log('[Restart] start-screen innerHTML:', document.getElementById('start-screen')?.innerHTML);
      }, 100);
    });
  }

  if (modeBackBtn) {
    modeBackBtn.addEventListener("click", () => {
      showScreen("start-screen");
    });
  }
}

function selectMode(mode, btn) {
  setGameModeType(mode);

  // Update active class
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide difficulty selector
  if (mode === "pvc") {
    difficultySelection.classList.remove("hide");
  } else {
    difficultySelection.classList.add("hide");
  }

  // Update mode text
  if (mode === "pvc") {
    const idx = parseInt(difficultySlider.value, 10);
    modeText.textContent = `Player vs Computer (${DIFFICULTY_LABELS[idx]})`;
  } else if (mode === "pvp") {
    modeText.textContent = "Player vs Player";
  } else {
    modeText.textContent = "Single Player";
  }
}

export { setupEventListeners, selectMode };
