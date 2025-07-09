export function playFlipSound() {
    const flipSound = document.getElementById("flip-sound");
    if (flipSound) flipSound.play();
}

export function playMatchSound() {
    const matchSound = document.getElementById("match-sound");
    if (matchSound) matchSound.play();
}

export function playVictorySound() {
    const victorySound = document.getElementById("victory-sound");
    if (victorySound) victorySound.play();
}
