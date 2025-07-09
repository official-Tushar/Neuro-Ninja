const player1Score = document.getElementById("player1-score");
const player2Score = document.getElementById("player2-score");
const player1Name = document.getElementById("player1-name");
const player2Name = document.getElementById("player2-name");
const gameMode = document.getElementById("game-mode");
const playerInfo = document.getElementById("player-info");
import { playFlipSound, playMatchSound, playVictorySound } from "./audio.js";
import { showScreen, updateTurnIndicator } from "./ui.js";
import { items } from './data.js';
import {
  timeGenerator,
  movesCounter,
  DIFFICULTY_MAP,
  DIFFICULTY_LABELS,
  getGameModeType,
  setComputerDifficulty,
  difficultySlider,
  getComputerDifficulty
} from "./utils.js";

let cards;
let interval;
let firstCard = false;
let secondCard = false;
let firstCardValue = null;
let boardLocked = false;
let moves, timeValue;

let currentPlayer = 1;
let player1ScoreCount = 0;
let player2ScoreCount = 0;
let isComputerTurn = false;
let computerMemory = new Map();
let flippedCards = [];

let seconds = 0;
let minutes = 0;
let movesCount = 0;
let winCount = 0;

function initializer() {
  isPaused = false;
  const gameScreen = document.getElementById('game-screen');
  moves = gameScreen.querySelector('#moves-count');
  timeValue = gameScreen.querySelector('#time');

  const stopButton = gameScreen.querySelector('#stop');
  const resumeButton = gameScreen.querySelector('#resume');
  stopButton.onclick = stopGame;
  resumeButton.onclick = resumeGame;
  stopButton.classList.remove('hide');
  resumeButton.classList.add('hide');

  const endGameButton = gameScreen.querySelector('#end-game');
  const quitModal = document.getElementById('quit-modal');
  const quitYes = document.getElementById('quit-yes');
  const quitNo = document.getElementById('quit-no');

  if (endGameButton && quitModal && quitYes && quitNo) {
    endGameButton.onclick = () => {
      stopGame();
      document.querySelectorAll('.controls-container').forEach(el => el.classList.add('hide'));
      quitModal.classList.remove('hide');
    };
    quitYes.onclick = () => {
      quitModal.classList.add('hide');
      showScreen('mode-screen');
      document.getElementById('mode-screen')?.querySelector('.controls-container')?.classList.remove('hide');
    };
    quitNo.onclick = () => {
      quitModal.classList.add('hide');
      document.querySelectorAll('.controls-container').forEach(el => el.classList.add('hide'));
      gameScreen.querySelector('.controls-container')?.classList.remove('hide');
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

  let gameModeType = getGameModeType();
  if (gameModeType === "pvc") {
    const idx = parseInt(difficultySlider.value, 10);
    setComputerDifficulty(DIFFICULTY_MAP[idx]);
  }

  interval = setInterval(() => {
    const result = timeGenerator(seconds, minutes, timeValue);
    seconds = result.seconds;
    minutes = result.minutes;
  }, 1000);
  moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
  timeValue.innerHTML = `<span>Time:</span> 00:00`;

  timeValue.style.display = (gameModeType === "single") ? "" : "none";
  player1Score.textContent = player1ScoreCount;
  player2Score.textContent = player2ScoreCount;

  if (gameModeType === "single") {
    gameMode.classList.add("hide");
    playerInfo.classList.add("hide");
  } else {
    gameMode.classList.remove("hide");
    playerInfo.classList.remove("hide");
    player2Name.textContent = (gameModeType === "pvc") ? "Computer:" : "Player 2:";
    updateTurnIndicator(currentPlayer);
  }

  const cardValues = generateRandom(items);
  matrixGenerator(gameScreen.querySelector('.game-container'), cardValues);
}

const generateRandom = (items, size = 4) => {
  let tempArray = [...items];
  let cardValues = [];
  for (let i = 0; i < (size * size) / 2; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValues.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }
  return cardValues;
};

const matrixGenerator = (container, cardValues, size = 4) => {
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${size}, auto)`;
  cardValues = [...cardValues, ...cardValues].sort(() => Math.random() - 0.5);

  for (let i = 0; i < size * size; i++) {
    container.innerHTML += `
      <div class="card-container" data-card-value="${cardValues[i].name}" data-index="${i}">
        <div class="card-before"><img src="./assets/images/pokeball.jpg" class="image" /></div>
        <div class="card-after"><img src="${cardValues[i].image}" class="image" /></div>
      </div>`;
  }

  cards = container.querySelectorAll(".card-container");
  cards.forEach(card => card.addEventListener("click", () => handleCardClick(card)));
};

const handleCardClick = (card) => {
  if (isPaused || isComputerTurn || boardLocked) return;
  if (card.classList.contains("matched") || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  playFlipSound();

  if (getGameModeType() === "pvc") {
    computerMemory.set(card.getAttribute("data-index"), card.getAttribute("data-card-value"));
  }

  if (!firstCard) {
    firstCard = card;
    firstCardValue = card.getAttribute("data-card-value");
  } else {
    movesCount = movesCounter(movesCount, moves);
    secondCard = card;
    const secondCardValue = card.getAttribute("data-card-value");

    if (firstCardValue === secondCardValue) {
      firstCard.classList.add("matched");
      secondCard.classList.add("matched");
      playMatchSound();
      if (getGameModeType() !== "single") {
        if (currentPlayer === 1) player1Score.textContent = ++player1ScoreCount;
        else player2Score.textContent = ++player2ScoreCount;
      }
      winCount++;
      firstCard = false;
      if (winCount === cards.length / 2) endGame();
      else if (getGameModeType() !== "single") updateTurnIndicator(currentPlayer);
    } else {
      boardLocked = true;
      setTimeout(() => {
        if (firstCard) firstCard.classList.remove("flipped");
        if (secondCard) secondCard.classList.remove("flipped");
        boardLocked = false;
        if (getGameModeType() !== "single") switchTurn();
        firstCard = false;
        secondCard = false;
      }, 900);
    }
  }
};

const switchTurn = () => {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnIndicator(currentPlayer);
  if (getGameModeType() === "pvc" && currentPlayer === 2) {
    isComputerTurn = true;
    setTimeout(makeComputerMove, 500);
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
  
  switch(getComputerDifficulty()) {
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
  if (knownPairs.length > 0 && Math.random() < 0.65) {
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
  // Set delay based on difficulty
  let delay;
  switch (getComputerDifficulty()) {
      case "easy":
          delay = 1000;
          break;
      case "medium":
          delay = 700;
          break;
      case "hard":
          delay = 400;
          break;
      default:
          delay = 1000;
  }
  // Simulate computer's first card selection
  setTimeout(() => {
      firstCard.classList.add("flipped");
      playFlipSound();
      // Update computer memory
      const firstCardValue = firstCard.getAttribute("data-card-value");
      const firstCardIndex = firstCard.getAttribute("data-index");
      computerMemory.set(firstCardIndex, firstCardValue);
      // Simulate computer's second card selection
      setTimeout(() => {
          secondCard.classList.add("flipped");
          playFlipSound();
          // Update computer memory
          const secondCardValue = secondCard.getAttribute("data-card-value");
          const secondCardIndex = secondCard.getAttribute("data-index");
          computerMemory.set(secondCardIndex, secondCardValue);
          if (firstCardValue === secondCardValue) {
              // Computer found a match
              firstCard.classList.add("matched");
              secondCard.classList.add("matched");
              playMatchSound();
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
                  if (firstCard) firstCard.classList.remove("flipped");
                  if (secondCard) secondCard.classList.remove("flipped");
                  switchTurn();
                  isComputerTurn = false;
              }, 900);
          }
      }, delay);
  }, delay);
};

function endGame() {
  const scoreScreen = document.getElementById('score-screen');
  const result = scoreScreen.querySelector('#result');
  playVictorySound();
  if (getGameModeType() === "single") {
    // Format time as mm:ss
    let finalTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    result.innerHTML = `<h2>You Won!</h2><h4>Moves: ${movesCount}</h4><h4>Time: ${finalTime}</h4>`;
  } else if (getGameModeType() === "pvp") {
    if (player1ScoreCount > player2ScoreCount) {
      result.innerHTML = `<h2>Player 1 Wins!</h2><h4>Score: ${player1ScoreCount} - ${player2ScoreCount}</h4>`;
    } else if (player2ScoreCount > player1ScoreCount) {
      result.innerHTML = `<h2>Player 2 Wins!</h2><h4>Score: ${player2ScoreCount} - ${player1ScoreCount}</h4>`;
    } else {
      result.innerHTML = `<h2>It's a Tie!</h2><h4>Score: ${player1ScoreCount} - ${player2ScoreCount}</h4>`;
    }
  } else if (getGameModeType() === "pvc") {
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
  // Unhide the controls-container inside the score screen
  const controls = scoreScreen.querySelector('.controls-container');
  if (controls) controls.classList.remove('hide');
  // Debug logs
  setTimeout(() => {
    const scoreScreen = document.getElementById('score-screen');
    const controls = scoreScreen.querySelector('.controls-container');
    console.log('[endGame] scoreScreen hidden:', scoreScreen.classList.contains('hide'));
    console.log('[endGame] controls-container hidden:', controls.classList.contains('hide'));
    console.log('[endGame] result innerHTML:', result.innerHTML);
  }, 100);
}

// Pause/resume logic
let isPaused = false;

function stopGame() {
  clearInterval(interval);
  isPaused = true;
  const gameScreen = document.getElementById("game-screen");
  gameScreen.querySelector('#stop')?.classList.add('hide');
  gameScreen.querySelector('#resume')?.classList.remove('hide');
}

function resumeGame() {
  if (!isPaused) return;
  interval = setInterval(() => {
    const result = timeGenerator(seconds, minutes, timeValue);
    seconds = result.seconds;
    minutes = result.minutes;
  }, 1000);
  isPaused = false;
  const gameScreen = document.getElementById("game-screen");
  gameScreen.querySelector('#stop')?.classList.remove('hide');
  gameScreen.querySelector('#resume')?.classList.add('hide');
}

export {
  initializer,
  stopGame,
  resumeGame
};

