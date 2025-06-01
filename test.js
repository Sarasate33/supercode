// Super Code Game - Vollständige Implementierung in script.js

// Globale Spielvariablen
let secretCode = [];
let currentAttempt = 0;
let maxAttempts = 12;
let gameOver = false;
let gameWon = false;
const availableColors = ['red', 'blue', 'green', 'yellow', 'brown'];
const codeLength = 4;

// DOM-Elemente
const colorDisplays = document.querySelectorAll('.color-display');
const colorLists = document.querySelectorAll('.color-list');
const colorOptions = document.querySelectorAll('.color-option');
const submitButton = document.querySelector('#submit-guess');
const guessesContainer = document.querySelector('#guesses');
const resultContainer = document.querySelector('#result');

// Spiel initialisieren
function initializeGame() {
    generateSecretCode();
    currentAttempt = 0;
    gameOver = false;
    gameWon = false;
    clearPreviousGuesses();
    resetInput();
    
    // Submit-Button aktivieren
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Guess';
    
    // Result-Container leeren
    resultContainer.innerHTML = '';
    
    console.log('Neues Spiel gestartet! Geheimer Code:', secretCode);
}

// Zufälligen geheimen Code generieren
function generateSecretCode() {
    secretCode = [];
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        secretCode.push(availableColors[randomIndex]);
    }
}

// Event Listeners für Farbauswahl
colorDisplays.forEach((display, index) => {
    display.addEventListener('click', () => {
        if (gameOver) return;
        toggleColorList(index);
    });
});

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        if (gameOver) return;
        selectColor(option);
    });
});

// Event Listener für Submit-Button
submitButton.addEventListener('click', submitGuess);

// Farbliste ein-/ausblenden
function toggleColorList(index) {
    // Alle anderen Listen schließen
    colorLists.forEach((list, i) => {
        if (i !== index) {
            list.classList.remove('show');
        }
    });
    
    // Gewählte Liste umschalten
    colorLists[index].classList.toggle('show');
}

// Farbe auswählen
function selectColor(option) {
    const color = option.dataset.color;
    if (!color) return;
    
    const colorList = option.parentNode;
    const colorDisplay = colorList.previousElementSibling;
    
    // Farbe setzen
    colorDisplay.style.backgroundColor = color;
    colorDisplay.dataset.color = color;
    
    // Liste schließen
    colorList.classList.remove('show');
}

// Aktuellen Rateversuch sammeln
function getCurrentGuess() {
    const guess = [];
    
    for (let display of colorDisplays) {
        const color = display.dataset.color;
        if (!color) {
            return null; // Unvollständiger Rateversuch
        }
        guess.push(color);
    }
    
    return guess;
}

// Rateversuch bewerten - Kernlogik des Spiels
function evaluateGuess(guess) {
    let exactMatches = 0;      // Schwarze Punkte (richtige Farbe, richtige Position)
    let colorMatches = 0;      // Weiße Punkte (richtige Farbe, falsche Position)
    
    // Kopien der Arrays für die Bearbeitung
    const secretCopy = [...secretCode];
    const guessCopy = [...guess];
    
    // 1. Schritt: Exakte Treffer finden und markieren
    for (let i = 0; i < codeLength; i++) {
        if (guessCopy[i] === secretCopy[i]) {
            exactMatches++;
            // Als verwendet markieren (null setzen)
            secretCopy[i] = null;
            guessCopy[i] = null;
        }
    }
    
    // 2. Schritt: Farbtreffer (falsche Position) finden
    for (let i = 0; i < codeLength; i++) {
        if (guessCopy[i] !== null) { // Nur nicht-exakte Treffer betrachten
            const foundIndex = secretCopy.indexOf(guessCopy[i]);
            if (foundIndex !== -1) {
                colorMatches++;
                secretCopy[foundIndex] = null; // Als verwendet markieren
            }
        }
    }
    
    const noMatches = codeLength - exactMatches - colorMatches;
    
    return {
        exactMatches: exactMatches,
        colorMatches: colorMatches,
        noMatches: noMatches
    };
}

// Rateversuch abschicken
function submitGuess() {
    if (gameOver) {
        alert('Das Spiel ist bereits beendet!');
        return;
    }
    
    const guess = getCurrentGuess();
    if (!guess) {
        alert('Bitte wähle alle vier Farben aus!');
        return;
    }
    
    // Rateversuch bewerten
    const evaluation = evaluateGuess(guess);
    
    // Versuchsnummer erhöhen
    currentAttempt++;
    
    // Rateversuch zur Anzeige hinzufügen
    addGuessToBoard(guess, evaluation, currentAttempt);
    
    // Spielzustand prüfen
    if (evaluation.exactMatches === codeLength) {
        // Spiel gewonnen!
        gameWon = true;
        gameOver = true;
        showGameResult(`Herzlichen Glückwunsch! Du hast den Code in ${currentAttempt} Versuchen geknackt!`);
    } else if (currentAttempt >= maxAttempts) {
        // Maximale Versuche erreicht
        gameOver = true;
        showGameResult(`Game Over! Der geheime Code war: ${secretCode.join(' - ')}`);
    }
    
    // Eingabe zurücksetzen für nächsten Versuch
    resetInput();
}

// Rateversuch zum Spielbrett hinzufügen
function addGuessToBoard(guess, evaluation, attemptNumber) {
    // Neue Rateversuch-Zeile erstellen
    const guessRow = document.createElement('div');
    guessRow.className = 'guess-row';
    
    // Versuchsnummer
    const indexNumber = document.createElement('div');
    indexNumber.className = 'index-number';
    indexNumber.textContent = attemptNumber;
    guessRow.appendChild(indexNumber);
    
    // Geratene Farben anzeigen
    guess.forEach(color => {
        const guessItem = document.createElement('div');
        guessItem.className = 'guess-item';
        guessItem.dataset.color = color;
        guessRow.appendChild(guessItem);
    });
    
    // Feedback-Kreise vorbereiten
    const feedbackColors = [];
    
    // Schwarze Kreise für exakte Treffer
    for (let i = 0; i < evaluation.exactMatches; i++) {
        feedbackColors.push('black');
    }
    
    // Weiße Kreise für Farbtreffer
    for (let i = 0; i < evaluation.colorMatches; i++) {
        feedbackColors.push('white');
    }
    
    // Graue Kreise für keine Treffer auffüllen
    while (feedbackColors.length < 4) {
        feedbackColors.push('gray');
    }
    
    // Feedback in zwei 2er-Gruppen aufteilen (wie im Original-Layout)
    const feedbackContainer1 = document.createElement('div');
    feedbackContainer1.className = 'guess-result';
    const feedbackContainer2 = document.createElement('div');
    feedbackContainer2.className = 'guess-result';
    
    // Erste zwei Feedback-Kreise
    for (let i = 0; i < 2; i++) {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'guess-result-item';
        feedbackItem.dataset.color = feedbackColors[i];
        feedbackContainer1.appendChild(feedbackItem);
    }
    
    // Zweite zwei Feedback-Kreise
    for (let i = 2; i < 4; i++) {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'guess-result-item';
        feedbackItem.dataset.color = feedbackColors[i];
        feedbackContainer2.appendChild(feedbackItem);
    }
    
    guessRow.appendChild(feedbackContainer1);
    guessRow.appendChild(feedbackContainer2);
    
    // Zur Anzeige hinzufügen
    guessesContainer.appendChild(guessRow);
}

// Eingabe zurücksetzen
function resetInput() {
    colorDisplays.forEach(display => {
        display.style.backgroundColor = 'gray';
        delete display.dataset.color;
    });
    
    // Alle Dropdown-Listen schließen
    colorLists.forEach(list => {
        list.classList.remove('show');
    });
}

// Spielergebnis anzeigen
function showGameResult(message) {
    resultContainer.innerHTML = `
        <div style="margin-top: 20px; padding: 20px; background-color: #f0f0f0; border-radius: 10px;">
            <h2 style="margin: 0 0 15px 0; color: #333;">${message}</h2>
            <button onclick="startNewGame()" style="
                padding: 10px 20px; 
                font-size: 16px; 
                background-color: #4CAF50; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
            ">Neues Spiel starten</button>
        </div>
    `;
    
    // Submit-Button deaktivieren
    submitButton.disabled = true;
    submitButton.textContent = 'Spiel beendet';
}

// Vorherige Rateversuche löschen
function clearPreviousGuesses() {
    guessesContainer.innerHTML = '';
}

// Neues Spiel starten
function startNewGame() {
    initializeGame();
}

// Hilfsfunktion: Alle Dropdown-Listen schließen (z.B. bei Klick außerhalb)
document.addEventListener('click', (event) => {
    if (!event.target.closest('.color-select')) {
        colorLists.forEach(list => {
            list.classList.remove('show');
        });
    }
});

// Tastatur-Support hinzufügen
document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    
    if (event.key === 'Enter') {
        submitGuess();
    } else if (event.key === 'Escape') {
        // Alle Dropdown-Listen schließen
        colorLists.forEach(list => {
            list.classList.remove('show');
        });
    }
});

// Spiel beim Laden der Seite starten
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

// Debug-Funktion (kann in der Konsole aufgerufen werden)
function revealCode() {
    console.log('Geheimer Code:', secretCode);
    return secretCode;
}

// Zusätzliche Utility-Funktionen

// Aktuellen Spielstand anzeigen
function getGameStatus() {
    return {
        secretCode: secretCode,
        currentAttempt: currentAttempt,
        maxAttempts: maxAttempts,
        gameOver: gameOver,
        gameWon: gameWon,
        attemptsRemaining: maxAttempts - currentAttempt
    };
}

// Schwierigkeitsgrad ändern (für zukünftige Erweiterungen)
function setDifficulty(level) {
    switch(level) {
        case 'easy':
            maxAttempts = 15;
            break;
        case 'medium':
            maxAttempts = 12;
            break;
        case 'hard':
            maxAttempts = 8;
            break;
        default:
            maxAttempts = 12;
    }
    
    if (!gameOver) {
        initializeGame();
    }
}