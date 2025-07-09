import { initializer } from "./game.js";
import { playFlipSound, playMatchSound, playVictorySound } from "./audio.js";
import { setupEventListeners } from "./events.js";
import { showScreen, endGameToModeScreen } from "./ui.js";
import { updateDifficultyFromSlider, initializeSliderUI } from "./utils.js";

// Get references needed for slider UI
const difficultySlider = document.getElementById("difficulty-slider");
const difficultyValue = document.getElementById("difficulty-value");
const modeText = document.getElementById("mode-text");

// Initialize on load
showScreen("start-screen");

// Initialize difficulty slider UI with elements
initializeSliderUI(difficultySlider, difficultyValue);

// Set initial difficulty text for default mode "single"
updateDifficultyFromSlider(difficultySlider, difficultyValue, "single", modeText);

// Setup event listeners (includes mode selection, slider input, navigation)
setupEventListeners();
