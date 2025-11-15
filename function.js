document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.querySelector(".button-start");
    const levelEasy = document.getElementById("level-easy");
    const levelMedium = document.getElementById("level-medium");
    const levelHard = document.getElementById("level-hard");

    if (btnStart) {
        btnStart.addEventListener("click", () => {
            const mainPage = document.querySelector(".main-page");
            const levelPage = document.querySelector(".level-page");
            if (mainPage) mainPage.style.display = "none";
            if (levelPage) levelPage.style.display = "flex";
        });
    }

    function startGameHandler() {
        const levelPage = document.querySelector(".level-page");
        const gameContainer = document.querySelector(".game-container");
        
        if (levelPage) levelPage.style.display = "none";
        if (gameContainer) {
            gameContainer.style.display = "flex"; // forțează flex
            resetTimer();   // resetează timpul
            startTimer();   // PORNEȘTE cronometrul
            generateGrid(); // creează grila Sudoku
        }
    }

    if (levelEasy) levelEasy.addEventListener("click", startGameHandler);
    if (levelMedium) levelMedium.addEventListener("click", startGameHandler);
    if (levelHard) levelHard.addEventListener("click", startGameHandler);
});

function generateGrid() {
    const grid = document.querySelector(".sudoku-grid");
    if (!grid) return;
    grid.innerHTML = ""; 

    for (let i = 0; i < 81; i++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.maxLength = 1;
        cell.classList.add("cell");

        const row = Math.floor(i / 9);
        const col = i % 9;

        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener("input", () => {
            cell.value = cell.value.replace(/[^1-9]/g, "");
        });

        grid.appendChild(cell);
    }
}

let timerInterval;
let seconds = 0;

function startTimer() {
    const timerDisplay = document.querySelector(".timer");

    timerInterval = setInterval(() => {
        seconds++;

        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;

        timerDisplay.textContent =
            `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    document.querySelector(".timer").textContent = "00:00";
}

