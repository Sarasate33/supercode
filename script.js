const colorDisplays = document.querySelectorAll(".color-display");
const colorLists = document.querySelectorAll(".color-list");
const colorOptions = document.querySelectorAll(".color-option");
const guesses_container = document.querySelector("#guesses");

let secret_code = [];
let max_attempts = 10;
let current_attempt = 0;
let game_lost = false;
let game_won = false;
const colors = ["red", "green", "blue", "yellow", "brown"];
const code_length = 4;

initializeGame();

function initializeGame() {
  generateSecretCode();
  current_attempt = 0;
  game_lost = false;
  game_won = false;
  clearPreviousGuesses();
  resetInput();
}

function generateSecretCode() {
  secret_code = [];
  for (let i = 0; i < code_length; i++) {
    // floor(0.### * 4) = 0, 1, 2, oder 3
    const random_color = colors[Math.floor(Math.random() * colors.length)];
    secret_code.push(random_color);
  }
  //für dev (take out later!!)
  console.log("Secret Code:", secret_code);
}

colorDisplays.forEach((display, index) => {
  display.addEventListener("click", () => {
    if (game_lost || game_won) return;
    colorLists[index].classList.toggle("show");
  });
});

colorOptions.forEach((option) => {
  option.addEventListener("click", () => {
    if (game_lost || game_won) return;
    const color = option.dataset.color;
    const colorList = option.parentNode;
    const colorDisplay = colorList.previousElementSibling;
    colorDisplay.style.backgroundColor = color;
    colorDisplay.dataset.color = color;
    colorList.classList.remove("show");
  });
});

function getCurrentGuess() {
  const guess = [];
  for (let display of colorDisplays) {
    const color = display.dataset.color;
    if (!color) {
      return null; // Not all colors selected
    }
    guess.push(color);
  }
  return guess;
}

function evaluateGuess(guess) {
  let exact_matches = 0;
  let color_matches = 0;
  let no_matches = 0;

  //nicht mit originalen arbeiten, sondern Kopien
  const secret_code_copy = [...secret_code];
  const guess_copy = [...guess];

  //schwarze Punkte
  for (let i = 0; i < code_length; i++) {
    if (guess_copy[i] == secret_code_copy[i]) {
      exact_matches++;
      // damit bei Farbtreffen nicht betrachtet
      secret_code_copy[i] = null;
      guess_copy[i] = null;
    }
  }
  //weiße Punkte
  for (let i = 0; i < code_length; i++) {
    if (guess_copy[i] != null) {
      let found_index = secret_code_copy.indexOf(guess_copy[i]);
      if (found_index != -1) {
        color_matches++;
        //damit bei kein Treffer nicht beachtet
        secret_code_copy[found_index] = null;
      }
    }
  }
  //graue Punkte
  no_matches = code_length - exact_matches - color_matches;

  return { exact_matches, color_matches, no_matches };
}

document.querySelector("#submit-guess").addEventListener("click", submitGuess);

function submitGuess() {
  // game logic here

  //geht nur wenn noch in game
  if (game_lost || game_won) return;

  const guess = getCurrentGuess();

  //check ob alle Farben selected
  if (!guess) {
    alert("Bitte wähle alle vier Farben aus!");
    return;
  }

  //welche/wieviel matches
  const evaluation = evaluateGuess(guess);

  //erhöhre Versuchszähler
  current_attempt++;

  //displaye den Versuch
  addGuessToBoard(guess, evaluation, current_attempt);

  //check ob gewonnen/verloren
  if (evaluation.exact_matches == code_length) {
    game_won = true;
    alert(`Du hast den Code in ${current_attempt} Versuchen geknackt!`);
    initializeGame();
  } else if (current_attempt >= max_attempts) {
    game_lost = true;
    alert(`Game Over! Der geheime Code war: ${secret_code.join(" ")}`);
  }

  resetInput();
}

function addGuessToBoard(guess, evaluation, nr_of_attempts) {
  let guess_row = document.createElement("div");
  guess_row.className = "guess-row";

  let indexNumber = document.createElement("div");
  indexNumber.className = "index-number";
  indexNumber.innerHTML = nr_of_attempts;
  guess_row.appendChild(indexNumber);

  for (let i = 0; i < guess.length; i++) {
    let guess_item = document.createElement("div");
    guess_item.className = "guess-item";
    guess_item.style.backgroundColor = guess[i];
    guess_row.appendChild(guess_item);
  }

  //Liste von Feedback-Kreisen
  const guess_result = [];

  for (let i = 0; i < evaluation.exact_matches; i++) {
    guess_result.push("black");
  }
  for (let i = 0; i < evaluation.color_matches; i++) {
    guess_result.push("white");
  }
  for (let i = 0; i < evaluation.no_matches; i++) {
    guess_result.push("gray");
  }

  //darstellen dieser Liste
  const guess_result_top = document.createElement("div");
  guess_result_top.className = "guess-result";
  const guess_result_bottom = document.createElement("div");
  guess_result_bottom.className = "guess-result";

  for (let i = 0; i < guess_result.length / 2; i++) {
    const guess_result_item = document.createElement("div");
    guess_result_item.className = "guess-result-item";
    guess_result_item.dataset.color = guess_result[i];
    guess_result_top.appendChild(guess_result_item);
  }

  for (let i = 2; i < guess_result.length; i++) {
    const guess_result_item = document.createElement("div");
    guess_result_item.className = "guess-result-item";
    guess_result_item.dataset.color = guess_result[i];
    guess_result_bottom.appendChild(guess_result_item);
  }

  guess_row.appendChild(guess_result_top);
  guess_row.appendChild(guess_result_bottom);

  guesses_container.appendChild(guess_row);
}

function resetInput() {
  colorDisplays.forEach((display) => {
    display.style.backgroundColor = "gray";
    delete display.dataset.color;
  });

  colorLists.forEach((list) => {
    list.classList.remove("show");
  });
}

function clearPreviousGuesses() {
  guesses_container.innerHTML = "";
}
