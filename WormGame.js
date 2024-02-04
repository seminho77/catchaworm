let score = 0;
let currentBasicWorm;
let currentBadWorm;
let currentSpecialWorm;
let basicWormInterval = 1000;
let badWormInterval = 2000;
let isGameOver = false;
let elapsedTime = 0;
let basicWormIntervalId;
let badWormIntervalId;
let specialWormTimeoutId;
let updateGameIntervalId;
let increaseSpeedIntervalId;

window.onload = function () {
    document.getElementById("startGameButton").onclick = startGameFromButton;
    document.getElementById("newGameButton").onclick = startNewGame;
    document.getElementById("hintsButton").onclick = showHints;
    document.getElementById("closeHints").onclick = hideHints;
}

function startGameFromButton() {
    document.getElementById("startWindow").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    document.getElementById("myLogo").style.display = "block";
    setGameBoard();
}

function setGameBoard() {
    for (let i = 0; i < 9; i++) {
        let worm = document.createElement("div");
        worm.id = i.toString();
        worm.addEventListener("click", selectWorm);
        document.getElementById("gameBoard").appendChild(worm);
    }
    startGame();
}

function startGame() {
    basicWormIntervalId = setInterval(setBasicWorm, basicWormInterval);
    badWormIntervalId = setInterval(setBadWorm, badWormInterval);
    updateGameIntervalId = setInterval(updateGame, 1000);
    increaseSpeedIntervalId = setInterval(increaseSpeed, 10000);
    scheduleSpecialWorm();
}

function startNewGame() {
    resetGameState();
    document.getElementById("startWindow").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    document.getElementById("myLogo").style.display = "block";
    document.getElementById("highScoreBoard").style.display = "none";
    setGameBoard();
}

function resetGameState() {
    score = 0;
    isGameOver = false;
    elapsedTime = 0;
    document.getElementById("score").innerText = "0";
    document.getElementById("gameBoard").innerHTML = "";

    clearInterval(basicWormIntervalId);
    clearInterval(badWormIntervalId);
    clearInterval(updateGameIntervalId);
    clearInterval(increaseSpeedIntervalId);
    clearTimeout(specialWormTimeoutId);

    basicWormInterval = 1000;
    badWormInterval = 2000;
}

function showHints() {
    document.getElementById("hintsModal").style.display = "block";
}

function hideHints() {
    document.getElementById("hintsModal").style.display = "none";
}

function scheduleSpecialWorm() {
    const minWaitTime = 5000;
    const maxWaitTime = 9000;
    const waitTime = Math.random() * (maxWaitTime - minWaitTime) + minWaitTime;

    specialWormTimeoutId = setTimeout(setSpecialWorm, waitTime);
}

function getRandomWorm() {
    let num = Math.floor(Math.random() * 9);
    return num.toString();
}

function setBasicWorm() {
    if (isGameOver) return;
    removeWorm(currentBasicWorm);
    let num = getRandomWorm();
    if ((currentBadWorm && currentBadWorm.id === num) || (currentSpecialWorm && currentSpecialWorm.id === num)) {
        return;
    }
    currentBasicWorm = document.getElementById(num);
    currentBasicWorm.appendChild(createWorm("resources/img/normalworm.png"));
    currentBasicWorm.hasWorm = true;
}

function setBadWorm() {
    if (isGameOver) return;
    removeWorm(currentBadWorm);
    let num = getRandomWorm();
    if ((currentBasicWorm && currentBasicWorm.id === num) || (currentSpecialWorm && currentSpecialWorm.id === num)) {
        return;
    }
    currentBadWorm = document.getElementById(num);
    currentBadWorm.appendChild(createWorm("resources/img/badworm.png"));
}

function setSpecialWorm() {
    if (isGameOver) return;
    removeWorm(currentSpecialWorm);
    let num = getRandomWorm();
    if ((currentBadWorm && currentBadWorm.id === num) || (currentBasicWorm && currentBasicWorm.id === num)) {
        return;
    }
    currentSpecialWorm = document.getElementById(num);
    currentSpecialWorm.appendChild(createWorm("resources/img/specialworm.png"));
    currentSpecialWorm.hasWorm = true;

    setTimeout(() => {
        removeWorm(currentSpecialWorm);
        scheduleSpecialWorm();
    }, 2000);
}

function createWorm(imageSrc) {
    let creature = document.createElement("img");
    creature.src =`./${imageSrc}`;
    creature.classList.add("creature");
    return creature;
}

function removeWorm(worm) {
    if (worm) {
        worm.innerHTML = "";
        worm.hasWorm = false;
    }
}

function selectWorm() {
    if (isGameOver) return;

    let sound;
    if (this === currentBasicWorm && currentBasicWorm.hasWorm) {
        catchWorm();
        removeWorm(currentBasicWorm);
        sound = document.getElementById('normalWormSound');
    } else if (this === currentSpecialWorm && currentSpecialWorm.hasWorm) {
        score += 30;
        removeWorm(currentSpecialWorm);
        sound = document.getElementById('specialWormSound');
    } else if (this === currentBadWorm) {
        isGameOver = true;
        updateScore(score);
        gameOver();
        return;
    }
    updateScore(score);

    if (sound) {
        sound.play();
    }
}

function updateGame() {
    if (isGameOver) {
        return;
    }

    elapsedTime += 1;
    if (elapsedTime >= 5) {
        gameOver();
    }
}

function updateScore(newScore) {
    document.getElementById("score").innerText = newScore.toString();
}

function catchWorm() {
    score += 10;
    elapsedTime = 0;
}

function gameOver() {
    let sound;
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOverModal").style.display = "block";
    sound = document.getElementById('gameOverSound');
    sound.play();
    isGameOver = true;
}

function saveScore() {
    let playerName = document.getElementById("playerName").value;
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    let highScores = JSON.parse(localStorage.getItem("highScores") || "[]");

    highScores.push({ name: playerName, score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10);

    localStorage.setItem("highScores", JSON.stringify(highScores));
    displayHighScores();
    document.getElementById("gameOverModal").style.display = "none";
    document.getElementById("playerName").value = ""; // Reset the input field
}

function displayHighScores() {
    let highScoresList = document.getElementById("highScoreList");
    let highScores = JSON.parse(localStorage.getItem("highScores") || "[]");

    highScoresList.innerHTML = highScores
        .map((score, index) => `<li>${index + 1}. ${score.name} - ${score.score}</li>`)
        .join("");
    document.getElementById("highScoreBoard").style.display = "block";
}

function increaseSpeed() {
    basicWormInterval = Math.max(500, basicWormInterval - 100);
    badWormInterval = Math.max(200, badWormInterval - 200);

    clearInterval(basicWormIntervalId);
    clearInterval(badWormIntervalId);

    basicWormIntervalId = setInterval(setBasicWorm, basicWormInterval);
    badWormIntervalId = setInterval(setBadWorm, badWormInterval);
}
