const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
const flipSound = document.getElementById("flip-sound"); // Reference to flip sound
const matchSound = document.getElementById("match-sound"); // Reference to match sound
const victorySound = document.getElementById("victory-sound"); // Reference to victory sound

let cards;
let interval;
let firstCard = false;
let secondCard = false;

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

const matrixGenerator = (cardValues, size = 4) => {
    gameContainer.innerHTML = "";
    gameContainer.style.gridTemplateColumns = `repeat(${size}, auto)`;
    cardValues = [...cardValues, ...cardValues];
    cardValues.sort(() => Math.random() - 0.5);
    for (let i = 0; i < size * size; i++) {
        gameContainer.innerHTML += `
        <div class="card-container" data-card-value="${cardValues[i].name}">
            <div class="card-before"><img src = "./assets/images/pokeball.jpg" class = "image" /></div>
            <div class="card-after">
                <img src="${cardValues[i].image}" class="image" />
            </div>
        </div>`;
    }

    cards = document.querySelectorAll(".card-container");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            if (!card.classList.contains("matched") && !card.classList.contains("flipped")) {
                card.classList.add("flipped");
                
                // Play flip sound
                flipSound.play();

                if (!firstCard) {
                    firstCard = card;
                    firstCardValue = card.getAttribute("data-card-value");
                } else {
                    movesCounter();
                    secondCard = card;
                    let secondCardValue = card.getAttribute("data-card-value");

                    if (firstCardValue == secondCardValue) {
                        firstCard.classList.add("matched");
                        secondCard.classList.add("matched");
                        matchSound.play(); // Play match sound

                        firstCard = false;
                        winCount += 1;
                        if (winCount == Math.floor(cardValues.length / 2)) {
                            result.innerHTML = `<h2>You Won</h2><h4>Moves: ${movesCount}</h4>`;
                            victorySound.play(); // Play victory sound
                            stopGame();
                        }
                    } else {
                        let [tempFirst, tempSecond] = [firstCard, secondCard];
                        firstCard = false;
                        secondCard = false;
                        setTimeout(() => {
                            tempFirst.classList.remove("flipped");
                            tempSecond.classList.remove("flipped");
                        }, 900);
                    }
                }
            }
        });
    });
};

const initializer = () => {
    result.innerText = "";
    winCount = 0;
    movesCount = 0;
    seconds = 0;
    minutes = 0;

    controls.classList.add("hide");
    stopButton.classList.remove("hide");

    interval = setInterval(timeGenerator, 1000);

    moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
    timeValue.innerHTML = `<span>Time:</span> 00:00`;

    let cardValues = generateRandom();
    console.log(cardValues);
    matrixGenerator(cardValues);
};

startButton.addEventListener("click", initializer);

const stopGame = () => {
    controls.classList.remove("hide");
    stopButton.classList.add("hide");
    clearInterval(interval);
};

stopButton.addEventListener("click", stopGame);
