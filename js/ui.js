const modeBackBtn = document.getElementById('mode-back-btn');

// --- Screen Navigation Logic ---
const screens = ['start-screen', 'mode-screen', 'game-screen', 'score-screen'];

/**
 * Show only the requested screen and hide others.
 */
function showScreen(screenId) {
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove('hide');
        // Unhide controls-container for mode-screen
        if (id === 'mode-screen') {
          const controls = el.querySelector('.controls-container');
          if (controls) controls.classList.remove('hide');
        }
        // Unhide controls-container for start-screen
        if (id === 'start-screen') {
          const controls = el.querySelector('.controls-container');
          if (controls) controls.classList.remove('hide');
        }
        if (id === 'game-screen') {
          // Debug logs for missing UI elements
          const gameMode = document.getElementById('game-mode');
          const playerInfo = document.getElementById('player-info');
          const player1Score = document.getElementById('player1-score');
          const player2Score = document.getElementById('player2-score');
          const turnIndicator = document.getElementById('turn-indicator');
          console.log('[showScreen] gameMode:', gameMode, gameMode ? gameMode.classList.value : 'N/A', gameMode ? gameMode.innerHTML : 'N/A');
          console.log('[showScreen] playerInfo:', playerInfo, playerInfo ? playerInfo.classList.value : 'N/A', playerInfo ? playerInfo.innerHTML : 'N/A');
          console.log('[showScreen] player1Score:', player1Score, player1Score ? player1Score.textContent : 'N/A');
          console.log('[showScreen] player2Score:', player2Score, player2Score ? player2Score.textContent : 'N/A');
          console.log('[showScreen] turnIndicator:', turnIndicator, turnIndicator ? turnIndicator.classList.value : 'N/A', turnIndicator ? turnIndicator.textContent : 'N/A');
        }
      } else {
        el.classList.add('hide');
      }
    }
  });

  // Debugging
  if (['score-screen', 'mode-screen'].includes(screenId)) {
    const screen = document.getElementById(screenId);
    const controls = screen?.querySelector('.controls-container');
    console.log(`[showScreen] ${screenId} hidden:`, screen?.classList.contains('hide'));
    console.log(`[showScreen] controls-container hidden:`, controls?.classList.contains('hide'));
  }
}

const turnIndicator = document.getElementById('turn-indicator');
import { getGameModeType, DIFFICULTY_LABELS, difficultySlider } from "./utils.js";

const updateTurnIndicator = (currentPlayer = 1) => {
  const gameModeType = getGameModeType();
  if (gameModeType === "single") {
      turnIndicator.textContent = "Single Player Mode";
      turnIndicator.className = "current-turn";
  } else if (gameModeType === "pvp") {
      turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
      turnIndicator.className = `current-turn active-player${currentPlayer}`;
  } else if (gameModeType === "pvc") {
      if (currentPlayer === 1) {
          turnIndicator.textContent = "Your Turn";
          turnIndicator.className = "current-turn active-player1";
      } else {
          turnIndicator.textContent = `Computer's Turn (${DIFFICULTY_LABELS[parseInt(difficultySlider.value, 10)]})`;
          turnIndicator.className = "current-turn active-player2";
      }
  }
};

/**
 * Ends the game and transitions to the mode selection screen.
 * Also hides stop/resume buttons and resets controls visibility.
 * 
 * @param {number} intervalId - The interval timer ID from setInterval
 * @param {Function} setPaused - Callback to update pause state (e.g., isPaused = false)
 */
function endGameToModeScreen(intervalId, setPaused) {
  console.log('End Game button clicked');

  clearInterval(intervalId);
  setPaused(false); // delegate pause state update to main module

  const gameScreen = document.getElementById('game-screen');
  const stopButton = gameScreen?.querySelector('#stop');
  const resumeButton = gameScreen?.querySelector('#resume');

  stopButton?.classList.add('hide');
  resumeButton?.classList.add('hide');

  showScreen('mode-screen');

  const modeScreen = document.getElementById('mode-screen');
  const controls = modeScreen?.querySelector('.controls-container');
  controls?.classList.remove('hide');

  // Debug logs
  const startScreen = document.getElementById('start-screen');
  const scoreScreen = document.getElementById('score-screen');

  console.log('Screen visibility after endGameToModeScreen:', {
    start: !startScreen?.classList.contains('hide'),
    mode: !modeScreen?.classList.contains('hide'),
    game: !gameScreen?.classList.contains('hide'),
    score: !scoreScreen?.classList.contains('hide')
  });

  document.querySelectorAll('.controls-container').forEach((el, i) => {
    console.log(`controls-container[${i}] visible:`, !el.classList.contains('hide'), el);
  });
}

if (modeBackBtn) {
  modeBackBtn.addEventListener('click', () => {
    console.log('Go Back button clicked');
    showScreen('start-screen');
    // Ensure the controls-container inside start screen is visible
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
      const controls = startScreen.querySelector('.controls-container');
      if (controls) {
        controls.classList.remove('hide');
        console.log('controls-container .classList after Go Back:', controls.classList.value);
      } else {
        console.log('No controls-container found in start-screen');
      }
      // Log all children of startScreen
      console.log('startScreen children:', Array.from(startScreen.children).map(child => child.outerHTML));
      // Log startScreen classList
      console.log('startScreen .classList after Go Back:', startScreen.classList.value);
    } else {
      console.log('No start-screen element found');
    }
    // Log visibility of all screens
    const modeScreen = document.getElementById('mode-screen');
    const gameScreen = document.getElementById('game-screen');
    const scoreScreen = document.getElementById('score-screen');
    console.log('Screen visibility after Go Back:', {
      start: startScreen && !startScreen.classList.contains('hide'),
      mode: modeScreen && !modeScreen.classList.contains('hide'),
      game: gameScreen && !gameScreen.classList.contains('hide'),
      score: scoreScreen && !scoreScreen.classList.contains('hide')
    });
    // Log controls-container visibility
    document.querySelectorAll('.controls-container').forEach((el, i) => {
      console.log('controls-container['+i+'] visible:', !el.classList.contains('hide'), el);
    });
  });
}

export {
  showScreen,
  endGameToModeScreen,
  updateTurnIndicator
};
