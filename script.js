const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const flipSound = document.getElementById("flip-sound"); // Reference to flip sound
const matchSound = document.getElementById("match-sound"); // Reference to match sound
const victorySound = document.getElementById("victory-sound"); // Reference to victory sound

// Multiplayer elements
const gameMode = document.getElementById("game-mode");
const modeText = document.getElementById("mode-text");
const playerInfo = document.getElementById("player-info");
const player1Name = document.getElementById("player1-name");
const player1Score = document.getElementById("player1-score");
const player2Name = document.getElementById("player2-name");
const player2Score = document.getElementById("player2-score");
const turnIndicator = document.getElementById("turn-indicator");

// Mode selection buttons
const singlePlayerBtn = document.getElementById("single-player");
const playerVsPlayerBtn = document.getElementById("player-vs-player");
const playerVsComputerBtn = document.getElementById("player-vs-computer");

// Difficulty selection elements
const difficultySelection = document.getElementById("difficulty-selection");
const difficultySlider = document.getElementById("difficulty-slider");
const difficultyValue = document.getElementById("difficulty-value");

const DIFFICULTY_MAP = ["easy", "medium", "hard"];
const DIFFICULTY_LABELS = ["Easy", "Medium", "Hard"];

let cards;
let interval;
let firstCard = false;
let secondCard = false;
let firstCardValue = null;
let boardLocked = false; // Prevent extra clicks during timeout
let moves, timeValue; // <-- Declare as globals

// Game state variables
let gameModeType = "single"; // "single", "pvp", "pvc"
let currentPlayer = 1;
let player1ScoreCount = 0;
let player2ScoreCount = 0;
let isComputerTurn = false;
let computerDifficulty = "easy"; // "easy", "medium", "hard"
let computerMemory = new Map(); // For computer AI - stores card positions and values
let flippedCards = []; // Track cards that have been flipped during computer's turn

const items = [
    {name: "darkrai", image: "./assets/images/darkrai.jpg"},
    {name: "emolga", image: "./assets/images/emolga.jpg"},
    {name: "fennekin", image: "./assets/images/fennekin.png"},
    {name: "greninja", image: "./assets/images/greninja.jpg"},
    {name: "infernape", image: "./assets/images/infernape.jpg"},
    {name: "lilligant", image: "./assets/images/lilligant.jpg"},
    {name: "lucario", image: "./assets/images/lucario.jpg"},
    {name: "meowth", image: "./assets/images/meowth.jpg"},
    {name: "milotic", image: "./assets/images/milotic.jpg"},
    {name: "mr-mime", image: "./assets/images/mr-mime.jpg"},
    {name: "oshawott", image: "./assets/images/oshawott.jpg"},
    {name: "pikachu", image: "./assets/images/pikachu.jpg"},
    {name: "piplop", image: "./assets/images/piplop.jpg"},
    {name: "psyduck", image: "./assets/images/psyduck.jpg"},
    {name: "serperior", image: "./assets/images/serperior.jpg"},
    {name: "weavile", image: "./assets/images/weavile.jpg"}
];

let seconds = 0;
let minutes = 0;
let movesCount = 0;
let winCount = 0;

// Mode selection functionality
function selectMode(mode) {
    // Remove active class from all buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    event.target.classList.add('active');
    
    gameModeType = mode;
    
    // Show/hide difficulty selection
    if (mode === "pvc") {
        difficultySelection.classList.remove('hide');
    } else {
        difficultySelection.classList.add('hide');
    }
    
    // Update mode text
    if (mode === "pvc") {
        const idx = parseInt(difficultySlider.value, 10);
        modeText.textContent = `Player vs Computer (${DIFFICULTY_LABELS[idx]})`;
    } else {
        switch(mode) {
            case "single":
                modeText.textContent = "Single Player";
                break;
            case "pvp":
                modeText.textContent = "Player vs Player";
                break;
        }
    }
}

// Difficulty slider logic
function updateDifficultyFromSlider() {
    const idx = parseInt(difficultySlider.value, 10);
    computerDifficulty = DIFFICULTY_MAP[idx];
    difficultyValue.textContent = DIFFICULTY_LABELS[idx];
    // Remove all difficulty classes
    difficultySlider.classList.remove('easy', 'medium', 'hard');
    difficultyValue.classList.remove('easy', 'medium', 'hard');
    // Add the current one
    difficultySlider.classList.add(DIFFICULTY_MAP[idx]);
    difficultyValue.classList.add(DIFFICULTY_MAP[idx]);
    if (gameModeType === "pvc") {
        modeText.textContent = `Player vs Computer (${DIFFICULTY_LABELS[idx]})`;
    }
}

difficultySlider.addEventListener("input", updateDifficultyFromSlider);

singlePlayerBtn.addEventListener("click", () => selectMode("single"));
playerVsPlayerBtn.addEventListener("click", () => selectMode("pvp"));
playerVsComputerBtn.addEventListener("click", () => selectMode("pvc"));

const timeGenerator = () => {
    seconds += 1;
    if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
    }

    let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
    let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
    timeValue.innerHTML = `<span>Time:</span> ${minutesValue}:${secondsValue}`;
};

const movesCounter = () => {
    movesCount += 1;
    moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
};

const generateRandom = (size = 4) => {
    let tempArray = [...items];
    let cardValues = [];
    size = (size * size) / 2;
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        cardValues.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
    }
    return cardValues;
};

const matrixGenerator = (gameContainer, cardValues, size = 4) => {
    gameContainer.innerHTML = "";
    gameContainer.style.gridTemplateColumns = `repeat(${size}, auto)`;
    cardValues = [...cardValues, ...cardValues];
    cardValues.sort(() => Math.random() - 0.5);
    for (let i = 0; i < size * size; i++) {
        gameContainer.innerHTML += `
        <div class="card-container" data-card-value="${cardValues[i].name}" data-index="${i}">
            <div class="card-before"><img src = "./assets/images/pokeball.jpg" class = "image" /></div>
            <div class="card-after">
                <img src="${cardValues[i].image}" class="image" />
            </div>
        </div>`;
    }

    cards = gameContainer.querySelectorAll(".card-container");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            handleCardClick(card);
        });
    });
};

const handleCardClick = (card) => {
    if (isPaused) { console.log('Blocked: isPaused'); return; }
    if (isComputerTurn) { console.log('Blocked: isComputerTurn'); return; }
    if (boardLocked) return; // Prevent clicks during timeout
    if (card.classList.contains("matched") || card.classList.contains("flipped")) {
        return;
    }
    card.classList.add("flipped");
    flipSound.play();
    if (gameModeType === "pvc") {
        const cardValue = card.getAttribute("data-card-value");
        const cardIndex = card.getAttribute("data-index");
        computerMemory.set(cardIndex, cardValue);
    }
    if (!firstCard) {
        firstCard = card;
        firstCardValue = card.getAttribute("data-card-value");
    } else {
        movesCounter();
        secondCard = card;
        let secondCardValue = card.getAttribute("data-card-value");
        if (firstCardValue == secondCardValue) {
            // Match found
            firstCard.classList.add("matched");
            secondCard.classList.add("matched");
            matchSound.play();
            if (gameModeType !== "single") {
                if (currentPlayer === 1) {
                    player1ScoreCount++;
                    player1Score.textContent = player1ScoreCount;
                } else {
                    player2ScoreCount++;
                    player2Score.textContent = player2ScoreCount;
                }
            }
            firstCard = false;
            firstCardValue = null;
            winCount += 1;
            if (winCount == Math.floor(cards.length / 2)) {
                endGame();
            } else if (gameModeType !== "single") {
                updateTurnIndicator();
            }
        } else {
            // No match
            boardLocked = true; // Lock the board
            let [tempFirst, tempSecond] = [firstCard, secondCard];
            firstCard = false;
            firstCardValue = null;
            secondCard = false;
            setTimeout(() => {
                tempFirst.classList.remove("flipped");
                tempSecond.classList.remove("flipped");
                boardLocked = false; // Unlock after flipping back
                if (gameModeType !== "single") {
                    switchTurn();
                }
            }, 900);
        }
    }
};

const switchTurn = () => {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateTurnIndicator();
    
    // If it's computer's turn, make computer move
    if (gameModeType === "pvc" && currentPlayer === 2) {
        isComputerTurn = true;
        setTimeout(makeComputerMove, 500);
    }
};

const updateTurnIndicator = () => {
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

// Enhanced AI with different difficulty levels
const makeComputerMove = () => {
    if (isPaused) return;
    const unmatchedCards = Array.from(cards).filter(card => 
        !card.classList.contains("matched") && !card.classList.contains("flipped")
    );
    
    if (unmatchedCards.length === 0) return;
    
    let firstCard, secondCard;
    
    switch(computerDifficulty) {
        case "easy":
            [firstCard, secondCard] = getEasyMove(unmatchedCards);
            break;
        case "medium":
            [firstCard, secondCard] = getMediumMove(unmatchedCards);
            break;
        case "hard":
            [firstCard, secondCard] = getHardMove(unmatchedCards);
            break;
        default:
            [firstCard, secondCard] = getEasyMove(unmatchedCards);
    }
    
    // Execute the move
    executeComputerMove(firstCard, secondCard);
};

const getEasyMove = (unmatchedCards) => {
    // Easy: 30% chance to use memory if known pairs exist, else random
    const knownPairs = findKnownPairs();
    if (knownPairs.length > 0 && Math.random() < 0.3) {
        const randomPair = knownPairs[Math.floor(Math.random() * knownPairs.length)];
        return [randomPair[0], randomPair[1]];
    } else {
        // 70% chance to make random moves
        const firstCardIndex = Math.floor(Math.random() * unmatchedCards.length);
        const firstCard = unmatchedCards[firstCardIndex];
        const remainingCards = unmatchedCards.filter(card => card !== firstCard);
        const secondCardIndex = Math.floor(Math.random() * remainingCards.length);
        const secondCard = remainingCards[secondCardIndex];
        return [firstCard, secondCard];
    }
};

const getMediumMove = (unmatchedCards) => {
    // Medium: 70% chance to use memory if known pairs exist, else random
    const knownPairs = findKnownPairs();
    if (knownPairs.length > 0 && Math.random() < 0.7) {
        const randomPair = knownPairs[Math.floor(Math.random() * knownPairs.length)];
        return [randomPair[0], randomPair[1]];
    } else {
        // 30% chance to make random moves
        return getEasyMove(unmatchedCards);
    }
};

const getHardMove = (unmatchedCards) => {
    // Hard: 95% chance to use memory if known pairs exist, else strategic/random
    const knownPairs = findKnownPairs();
    if (knownPairs.length > 0 && Math.random() < 0.95) {
        const randomPair = knownPairs[Math.floor(Math.random() * knownPairs.length)];
        return [randomPair[0], randomPair[1]];
    } else if (knownPairs.length > 0) {
        // 5% chance: still use memory if available
        const randomPair = knownPairs[Math.floor(Math.random() * knownPairs.length)];
        return [randomPair[0], randomPair[1]];
    } else {
        // If no known pairs, try to discover new cards strategically
        return getStrategicMove(unmatchedCards);
    }
};

const findKnownPairs = () => {
    const pairs = [];
    const cardValues = new Map();
    
    // Find all known card values
    computerMemory.forEach((value, index) => {
        if (!cardValues.has(value)) {
            cardValues.set(value, []);
        }
        cardValues.get(value).push(index);
    });
    
    // Find pairs of known cards
    cardValues.forEach((indices, value) => {
        if (indices.length >= 2) {
            const card1 = document.querySelector(`[data-index="${indices[0]}"]`);
            const card2 = document.querySelector(`[data-index="${indices[1]}"]`);
            
            if (card1 && card2 && 
                !card1.classList.contains("matched") && !card2.classList.contains("matched") &&
                !card1.classList.contains("flipped") && !card2.classList.contains("flipped")) {
                pairs.push([card1, card2]);
            }
        }
    });
    
    return pairs;
};

const getStrategicMove = (unmatchedCards) => {
    // Strategic move: Pick cards that haven't been seen before
    const unseenCards = unmatchedCards.filter(card => {
        const index = card.getAttribute("data-index");
        return !computerMemory.has(index);
    });
    
    if (unseenCards.length >= 2) {
        // Pick two unseen cards
        const firstCard = unseenCards[0];
        const secondCard = unseenCards[1];
        return [firstCard, secondCard];
    } else if (unseenCards.length === 1) {
        // Pick one unseen and one random
        const firstCard = unseenCards[0];
        const remainingCards = unmatchedCards.filter(card => card !== firstCard);
        const secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        return [firstCard, secondCard];
    } else {
        // All cards have been seen, pick random
        return getEasyMove(unmatchedCards);
    }
};

const executeComputerMove = (firstCard, secondCard) => {
    // Simulate computer's first card selection
    setTimeout(() => {
        firstCard.classList.add("flipped");
        flipSound.play();
        
        // Update computer memory
        const firstCardValue = firstCard.getAttribute("data-card-value");
        const firstCardIndex = firstCard.getAttribute("data-index");
        computerMemory.set(firstCardIndex, firstCardValue);
        
        // Simulate computer's second card selection
        setTimeout(() => {
            secondCard.classList.add("flipped");
            flipSound.play();
            
            // Update computer memory
            const secondCardValue = secondCard.getAttribute("data-card-value");
            const secondCardIndex = secondCard.getAttribute("data-index");
            computerMemory.set(secondCardIndex, secondCardValue);
            
            if (firstCardValue === secondCardValue) {
                // Computer found a match
                firstCard.classList.add("matched");
                secondCard.classList.add("matched");
                matchSound.play();
                
                player2ScoreCount++;
                player2Score.textContent = player2ScoreCount;
                winCount++;
                
                if (winCount == Math.floor(cards.length / 2)) {
                    endGame();
                } else {
                    // Computer gets another turn
                    setTimeout(makeComputerMove, 1000);
                }
            } else {
                // No match, switch to player
                setTimeout(() => {
                    firstCard.classList.remove("flipped");
                    secondCard.classList.remove("flipped");
                    switchTurn();
                    isComputerTurn = false;
                }, 900);
            }
        }, 500);
    }, 500);
};

// --- Screen Navigation Logic ---
const screens = ['start-screen', 'mode-screen', 'game-screen', 'score-screen'];
function showScreen(screenId) {
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) {
        el.classList.remove('hide');
      } else {
        el.classList.add('hide');
      }
    }
  });
}

// --- Button References for Navigation ---
const startBtn = document.getElementById('start-btn');
const modeContinueBtn = document.getElementById('mode-continue-btn');
const restartBtn = document.getElementById('restart-btn');
const modeBackBtn = document.getElementById('mode-back-btn');

// --- Navigation Event Listeners ---
if (startBtn) {
  startBtn.addEventListener('click', () => {
    showScreen('mode-screen');
  });
}
if (modeContinueBtn) {
  modeContinueBtn.addEventListener('click', () => {
    showScreen('game-screen');
    initializer();
  });
}
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    showScreen('start-screen');
    // Optionally reset game state here
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
      if (controls) controls.classList.remove('hide');
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

// On page load, show only the start screen
showScreen('start-screen');

// --- Ensure default slider color is green for 'easy' ---
difficultySlider.value = 0;
difficultySlider.classList.remove('medium', 'hard');
difficultySlider.classList.add('easy');
difficultyValue.classList.remove('medium', 'hard');
difficultyValue.classList.add('easy');
difficultyValue.textContent = 'Easy';

function endGame() {
  const scoreScreen = document.getElementById('score-screen');
  const result = scoreScreen.querySelector('#result');
  victorySound.play();
  if (gameModeType === "single") {
    // Format time as mm:ss
    let finalTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    result.innerHTML = `<h2>You Won!</h2><h4>Moves: ${movesCount}</h4><h4>Time: ${finalTime}</h4>`;
  } else if (gameModeType === "pvp") {
    if (player1ScoreCount > player2ScoreCount) {
      result.innerHTML = `<h2>Player 1 Wins!</h2><h4>Score: ${player1ScoreCount} - ${player2ScoreCount}</h4>`;
    } else if (player2ScoreCount > player1ScoreCount) {
      result.innerHTML = `<h2>Player 2 Wins!</h2><h4>Score: ${player2ScoreCount} - ${player1ScoreCount}</h4>`;
    } else {
      result.innerHTML = `<h2>It's a Tie!</h2><h4>Score: ${player1ScoreCount} - ${player2ScoreCount}</h4>`;
    }
  } else if (gameModeType === "pvc") {
    if (player1ScoreCount > player2ScoreCount) {
      result.innerHTML = `<h2>You Win!</h2><h4>Score: ${player1ScoreCount} - ${player2ScoreCount}</h4>`;
    } else if (player2ScoreCount > player1ScoreCount) {
      result.innerHTML = `<h2>Computer Wins!</h2><h4>Score: ${player2ScoreCount} - ${player1ScoreCount}</h4>`;
    } else {
      result.innerHTML = `<h2>It's a Tie!</h2><h4>Score: ${player1ScoreCount} - ${player2ScoreCount}</h4>`;
    }
  }
  stopGame();
  showScreen('score-screen');
}

// Add a variable to track if the game is paused
let isPaused = false;

function stopGame() {
    console.log('[Game] stopGame() called');
    // Only show game screen controls
    document.querySelectorAll('.controls-container').forEach(el => el.classList.add('hide'));
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const controls = gameScreen.querySelector('.controls-container');
        if (controls) {
            controls.classList.remove('hide');
            console.log('[Game] Game controls shown (paused)');
        }
        const stopButton = gameScreen.querySelector('#stop');
        const resumeButton = gameScreen.querySelector('#resume');
        stopButton.classList.add('hide');
        resumeButton.classList.remove('hide');
        console.log('[Game] Pause button hidden, Resume button shown');
    }
    clearInterval(interval);
    isPaused = true;
    console.log('[Game] Timer stopped, isPaused:', isPaused);
}

function resumeGame() {
    console.log('[Game] resumeGame() called');
    // Only show game screen controls
    document.querySelectorAll('.controls-container').forEach(el => el.classList.add('hide'));
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const controls = gameScreen.querySelector('.controls-container');
        if (controls) {
            controls.classList.remove('hide');
            console.log('[Game] Game controls shown (resumed)');
        }
        const stopButton = gameScreen.querySelector('#stop');
        const resumeButton = gameScreen.querySelector('#resume');
        stopButton.classList.remove('hide');
        resumeButton.classList.add('hide');
        console.log('[Game] Pause button shown, Resume button hidden');
    }
    if (isPaused) {
        interval = setInterval(timeGenerator, 1000);
        isPaused = false;
        console.log('[Game] Timer resumed, isPaused:', isPaused);
    }
}

function initializer() {
    isPaused = false;
    const gameScreen = document.getElementById('game-screen');
    moves = gameScreen.querySelector('#moves-count');
    timeValue = gameScreen.querySelector('#time');
    const stopButton = gameScreen.querySelector('#stop');
    const resumeButton = gameScreen.querySelector('#resume');
    stopButton.onclick = stopGame;
    resumeButton.onclick = resumeGame;
    // Ensure pause is visible and resume is hidden at game start
    stopButton.classList.remove('hide');
    resumeButton.classList.add('hide');
    // --- Quit Confirmation Modal Logic (moved here) ---
    const endGameButton = gameScreen.querySelector('#end-game');
    const quitModal = document.getElementById('quit-modal');
    const quitYes = document.getElementById('quit-yes');
    const quitNo = document.getElementById('quit-no');
    if (endGameButton && quitModal && quitYes && quitNo) {
      endGameButton.onclick = function() {
        console.log('[Quit] Quit button clicked');
        if (!isPaused) {
          console.log('[Quit] Game is not paused, calling stopGame()');
          stopGame();
        } else {
          console.log('[Quit] Game is already paused');
        }
        // Hide all controls so only modal is visible
        document.querySelectorAll('.controls-container').forEach(el => el.classList.add('hide'));
        quitModal.classList.remove('hide');
        console.log('[Quit] Modal should now be visible');
      };
      quitYes.onclick = function() {
        console.log('[Quit] YES clicked');
        quitModal.classList.add('hide');
        showScreen('mode-screen');
        const modeScreen = document.getElementById('mode-screen');
        if (modeScreen) {
          const controls = modeScreen.querySelector('.controls-container');
          if (controls) controls.classList.remove('hide');
        }
      };
      quitNo.onclick = function() {
        console.log('[Quit] NO clicked');
        quitModal.classList.add('hide');
        // Only show game screen controls
        document.querySelectorAll('.controls-container').forEach(el => el.classList.add('hide'));
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
          const controls = gameScreen.querySelector('.controls-container');
          if (controls) controls.classList.remove('hide');
        }
        // Resume game
        resumeGame();
      };
    }

    winCount = 0;
    movesCount = 0;
    seconds = 0;
    minutes = 0;
    currentPlayer = 1;
    player1ScoreCount = 0;
    player2ScoreCount = 0;
    isComputerTurn = false;
    computerMemory.clear();
    flippedCards = [];

    // Ensure computerDifficulty is set for PvC
    if (gameModeType === "pvc") {
        const idx = parseInt(difficultySlider.value, 10);
        computerDifficulty = DIFFICULTY_MAP[idx];
        console.log('Set computerDifficulty in initializer:', computerDifficulty);
    }

    interval = setInterval(timeGenerator, 1000);

    moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
    timeValue.innerHTML = `<span>Time:</span> 00:00`;
    // Show/hide timer based on game mode
    if (gameModeType === "single") {
        timeValue.style.display = "";
    } else {
        timeValue.style.display = "none";
    }
    player1Score.textContent = player1ScoreCount;
    player2Score.textContent = player2ScoreCount;

    // Show/hide multiplayer elements based on game mode
    if (gameModeType === "single") {
        gameMode.classList.add("hide");
        playerInfo.classList.add("hide");
    } else {
        gameMode.classList.remove("hide");
        playerInfo.classList.remove("hide");
        if (gameModeType === "pvc") {
            player2Name.textContent = "Computer:";
        } else {
            player2Name.textContent = "Player 2:";
        }
        updateTurnIndicator();
    }

    let cardValues = generateRandom();
    // Diagnostic logs
    console.log('cardValues:', cardValues);
    console.log('gameContainer:', gameScreen.querySelector('.game-container'));
    matrixGenerator(gameScreen.querySelector('.game-container'), cardValues);
}

startButton.addEventListener("click", initializer);

// On page load, set initial slider class
updateDifficultyFromSlider();

function endGameToModeScreen() {
    console.log('End Game button clicked');
    clearInterval(interval);
    isPaused = false;
    // Hide stop and resume buttons
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) {
        const stopButton = gameScreen.querySelector('#stop');
        const resumeButton = gameScreen.querySelector('#resume');
        console.log('gameScreen found:', gameScreen);
        console.log('stopButton:', stopButton, 'resumeButton:', resumeButton);
        if (stopButton) stopButton.classList.add('hide');
        if (resumeButton) resumeButton.classList.add('hide');
    } else {
        console.log('gameScreen not found');
    }
    // Use the main navigation function to show only the mode screen
    showScreen('mode-screen');
    // FIX: Unhide the controls-container inside the mode screen
    const modeScreen = document.getElementById('mode-screen');
    if (modeScreen) {
        const controls = modeScreen.querySelector('.controls-container');
        if (controls) controls.classList.remove('hide');
    }
    // Log visibility of all screens
    const startScreen = document.getElementById('start-screen');
    const scoreScreen = document.getElementById('score-screen');
    console.log('Screen visibility after endGameToModeScreen:', {
        start: startScreen && !startScreen.classList.contains('hide'),
        mode: modeScreen && !modeScreen.classList.contains('hide'),
        game: gameScreen && !gameScreen.classList.contains('hide'),
        score: scoreScreen && !scoreScreen.classList.contains('hide')
    });
    // Log controls-container visibility
    document.querySelectorAll('.controls-container').forEach((el, i) => {
        console.log('controls-container['+i+'] visible:', !el.classList.contains('hide'), el);
    });
}
