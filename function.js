let currentSudoku = null;
let currentPuzzle = null;
let currentDifficulty = null;

let score = 0;
// păstrăm ultimul index folosit ca să evităm repetarea imediată
let lastRandomIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.querySelector(".button-start");
    const levelEasy = document.getElementById("level-easy");
    const levelMedium = document.getElementById("level-medium");
    const levelHard = document.getElementById("level-hard");

    if (btnStart) {
        btnStart.addEventListener("click", () => {
            document.querySelector(".main-page").style.display = "none";
            document.querySelector(".level-page").style.display = "block";
        });
    }

    function startGameHandler(event) {
        const difficulty = event.target.id.split("-")[1]; // easy, medium, hard
        document.querySelector(".level-page").style.display = "none";
        document.querySelector(".game-container").style.display = "block";

        resetTimer();
        startTimer();
        score = 0;
        updateScoreDisplay();
        initializeGame(difficulty);
    }

    if (levelEasy) levelEasy.addEventListener("click", startGameHandler);
    if (levelMedium) levelMedium.addEventListener("click", startGameHandler);
    if (levelHard) levelHard.addEventListener("click", startGameHandler);

    // Restart button on finish page
    const btnRestart = document.querySelector(".button-restart");
    if (btnRestart) {
        btnRestart.addEventListener("click", () => {
            // hide last page, show main page, reset states
            document.querySelector(".last-page").style.display = "none";
            document.querySelector(".main-page").style.display = "block";
            document.querySelector(".game-container").style.display = "none";
            score = 0;
            updateScoreDisplay();
            resetTimer(); // resetez timerul la restart
        });
    }

    // actualizează UI cu top scores la încărcare
    updateBestScoreUI();
});

function initializeGame(difficulty) {
    currentDifficulty = difficulty;

    // 1. Alege un sudoku random din librărie, dar nu același ca ultima dată (dacă e posibil)
    if (!Array.isArray(sudokuLibrary) || sudokuLibrary.length === 0) {
        console.error("sudokuLibrary nu este definit sau e gol");
        return;
    }

    let randomIndex;
    if (sudokuLibrary.length === 1) {
        randomIndex = 0;
    } else {
        do {
            randomIndex = Math.floor(Math.random() * sudokuLibrary.length);
        } while (randomIndex === lastRandomIndex);
    }
    lastRandomIndex = randomIndex;

    const baseSudoku = sudokuLibrary[randomIndex];
    console.log("initializeGame: chosen index", randomIndex);

    // 2. Increment +1 (returnează copie, nu modifică biblioteca)
    currentSudoku = incrementSudoku(baseSudoku);

    // 3. Ascunde celule conform dificultății
    currentPuzzle = hideCells(currentSudoku, difficulty);

    // 4. Generează grila
    generateGrid(currentPuzzle, currentSudoku);
}

function incrementSudoku(sudoku) {
    return sudoku.map(row => row.map(cell => cell === 9 ? 1 : cell + 1));
}

function hideCells(sudoku, difficulty) {
    let visibleCount;
    switch (difficulty) {
        case "easy": visibleCount = 57; break;   // ~70%
        case "medium": visibleCount = 40; break; // ~50%
        case "hard": visibleCount = 24; break;   // ~30%
        default: visibleCount = 40;
    }

    const puzzle = sudoku.map(row => [...row]);
    const hiddenCount = 81 - visibleCount;
    let hidden = 0;

    while (hidden < hiddenCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== null) {
            puzzle[row][col] = null;
            hidden++;
        }
    }

    return puzzle;
}

function countNearbyEmptyCells(puzzle, row, col) {
    let empty = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],         [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of directions) {
        const r = row + dx;
        const c = col + dy;
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
            if (puzzle[r][c] === null) empty++;
        }
    }
    return empty;
}

function updateScoreDisplay() {
    // actualizăm doar scorul din zona de joc
    const gameScoreEl = document.querySelector(".game-container .line .score");
    if (gameScoreEl) gameScoreEl.textContent = "Score : " + score;
}

function generateGrid(puzzle, solution) {
    const grid = document.querySelector(".sudoku-grid");
    if (!grid) return;
    grid.innerHTML = "";

    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;

        const cell = document.createElement("input");
        cell.type = "text";
        cell.maxLength = 1;
        cell.classList.add("cell");
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (puzzle[row][col] !== null) {
            cell.value = puzzle[row][col];
            cell.disabled = true;
            cell.style.backgroundColor = "#d3d3d3";
        } else {
            cell.addEventListener("input", () => {
                // permit doar o singură cifră, elimin restul caracterelor
                cell.value = cell.value.replace(/[^1-9]/g, "");
                const val = parseInt(cell.value) || 0;

                if (val !== solution[row][col]) {
                    cell.style.color = "red";
                    // Penalizare -30%
                    score = Math.floor(score * 0.7);
                    updateScoreDisplay();
                } else {
                    cell.style.color = "black";

                    // Calculează câte celule goale sunt în jur
                    const nearby = countNearbyEmptyCells(currentPuzzle, row, col);

                    let points = 0;
                    if (nearby > 3) points = 1000;
                    else if (nearby > 0) points = 500;
                    else points = 100;

                    score += points;
                    updateScoreDisplay();

                    // actualizează puzzle-ul cu valoarea introdusă și blochează celula
                    currentPuzzle[row][col] = val;
                    cell.disabled = true;
                    cell.style.backgroundColor = "#d3d3d3";
                }

                checkSudokuCompletion();
            });
        }

        grid.appendChild(cell);
    }
}

function checkSudokuCompletion() {
    const cells = document.querySelectorAll(".sudoku-grid .cell");
    let complete = true;

    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const cell = cells[i];
        const val = parseInt(cell.value) || 0;

        if (val !== currentSudoku[row][col]) {
            complete = false;
            break;
        }
    }

    if (complete) finishGame();
}

function finishGame() {
    const timerDisplayEl = document.querySelector(".timer");
    const timerText = timerDisplayEl ? timerDisplayEl.textContent : "00:00";

    resetTimer();

    // salvează sudoku rezolvat (dacă e nou)
    saveCompletedSudoku(currentSudoku);

    // salvează scorul în leaderboard (top 3)
    saveScore(score, timerText);

    const gameContainer = document.querySelector(".game-container");
    const lastPage = document.querySelector(".last-page");

    if (gameContainer) gameContainer.style.display = "none";
    if (lastPage) lastPage.style.display = "flex";

    const finalScoreEl = document.querySelector(".final-score");
    if (finalScoreEl) finalScoreEl.textContent = timerText;

    const finalPointsEl = document.querySelector(".final-points");
    if (finalPointsEl) finalPointsEl.textContent = score;

    // actualizează lista de pe pagina principală
    updateBestScoreUI();
}

function saveCompletedSudoku(completedSudoku) {
    // facem deep copy înainte de a compara / salva
    const copy = JSON.parse(JSON.stringify(completedSudoku));

    const exists = sudokuLibrary.some(s => JSON.stringify(s) === JSON.stringify(copy));
    if (!exists) {
        sudokuLibrary.push(copy);
        console.log("Salvat sudoku nou în librărie. Total:", sudokuLibrary.length);
    } else {
        console.log("Sudoku există deja în librărie, nu se salvează.");
    }
}

// Salvează scorul în localStorage și păstrează doar top 3
function saveScore(finalScore, finalTime) {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    // adăugăm scorul curent
    scores.push({
        score: finalScore,
        time: finalTime,
        date: new Date().toLocaleDateString()
    });

    // sortăm descrescător după scor
    scores.sort((a, b) => b.score - a.score);

    // păstrăm doar top 3
    scores = scores.slice(0, 3);

    // salvăm în localStorage
    localStorage.setItem("scores", JSON.stringify(scores));

    // actualizăm UI imediat
    updateBestScoreUI();
}

// Actualizează lista vizuală din .list (pagina principală)
function updateBestScoreUI() {
    const listContainer = document.querySelector(".list");
    if (!listContainer) return;

    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    // golim complet containerul și reconstruim lista
    listContainer.innerHTML = "";

    if (scores.length === 0) {
        const wrapper = document.createElement("div");
        const p = document.createElement("p");
        p.className = "score";
        p.textContent = "--";
        wrapper.appendChild(p);
        listContainer.appendChild(wrapper);
        return;
    }

    // primul loc afișat prominent (folosim <p class="score">)
    const topWrapper = document.createElement("div");
    const topP = document.createElement("p");
    topP.className = "list-score";
    topP.textContent = `#1 — ${scores[0].score} (${scores[0].time})`;
    topWrapper.appendChild(topP);
    listContainer.appendChild(topWrapper);

    // afișăm locurile 2..N
    for (let i = 1; i < scores.length; i++) {
        const item = scores[i];
        const row = document.createElement("div");
        row.classList.add("score-row");
        row.innerHTML = `<p>#${i + 1} — ${item.score} <span style="opacity:0.6;">(${item.time})</span></p>`;
        listContainer.appendChild(row);
    }
}

let timerInterval;
let seconds = 0;

function startTimer() {
    const timerDisplay = document.querySelector(".timer");
    if (!timerDisplay) return;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    const timerDisplay = document.querySelector(".timer");
    if (timerDisplay) timerDisplay.textContent = "00:00";
}
