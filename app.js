const flashcards = [
  {
    polish: "koza",
    english: "goat",
    frontImage: "./images/koza-front.webp",
    backImage: "./images/koza-back.png",
  },
  {
    polish: "swinia",
    english: "pig",
    frontImage: "./images/swinia-front.webp",
    backImage: "./images/swinia-back.png",
  },
  {
    polish: "kurczak",
    english: "chicken",
    frontImage: "./images/kurczak-front.webp",
    backImage: "./images/kurczak-back.png",
  },
  {
    polish: "kon",
    english: "horse",
    frontImage: "./images/kon-front.webp",
    backImage: "./images/kon-back.png",
  },
  {
    polish: "owca",
    english: "sheep",
    frontImage: "./images/owca-front.webp",
    backImage: "./images/owca-back.png",
  },
  {
    polish: "osiol",
    english: "donkey",
    frontImage: "./images/osiol-front.png",
    backImage: "./images/osiol-back.png",
  },
  {
    polish: "krowa",
    english: "cow",
    frontImage: "./images/krowa-front.png",
    backImage: "./images/krowa-back.png",
  },
  {
    polish: "kaczka",
    english: "duck",
    frontImage: "./images/kaczka-front.webp",
    backImage: "./images/kaczka-back.png",
  },
];

const flashcardEl = document.getElementById("flashcard");
const polishWordEl = document.getElementById("polishWord");
const englishWordEl = document.getElementById("englishWord");
const frontImageEl = document.getElementById("frontImage");
const backImageEl = document.getElementById("backImage");
const progressEl = document.getElementById("progress");
const prevBtnEl = document.getElementById("prevBtn");
const nextBtnEl = document.getElementById("nextBtn");
const answerInputEl = document.getElementById("answerInput");
const answerColoredEl = document.getElementById("answerColored");

let currentIndex = 0;

function renderCard() {
  const card = flashcards[currentIndex];

  polishWordEl.textContent = card.polish;
  englishWordEl.textContent = card.english;

  frontImageEl.src = card.frontImage;
  backImageEl.src = card.backImage;

  frontImageEl.alt = `Zwierzatko: ${card.polish}`;
  backImageEl.alt = `Zabawny obrazek: ${card.polish} (${card.english})`;

  progressEl.textContent = `${currentIndex + 1} / ${flashcards.length}`;
  answerInputEl.value = "";
  answerColoredEl.innerHTML = '<span class="placeholder">Wpisz odpowiedz...</span>';
  answerInputEl.focus();
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderColoredInput(inputValue) {
  const expectedWord = flashcards[currentIndex].english.toLowerCase();
  const typedWord = inputValue.toLowerCase();
  let coloredHtml = "";

  if (typedWord.length === 0) {
    answerColoredEl.innerHTML = '<span class="placeholder">Wpisz odpowiedz...</span>';
    return;
  }

  for (let i = 0; i < typedWord.length; i += 1) {
    const typedChar = typedWord[i];
    const expectedChar = expectedWord[i];
    const cssClass = typedChar === expectedChar ? "correct" : "wrong";
    coloredHtml += `<span class="${cssClass}">${escapeHtml(typedChar)}</span>`;
  }

  answerColoredEl.innerHTML = coloredHtml;
}

function isAnswerCorrect() {
  const expectedWord = flashcards[currentIndex].english.toLowerCase();
  const typedWord = answerInputEl.value.trim().toLowerCase();
  return typedWord === expectedWord;
}

function tryFlipCard() {
  if (isAnswerCorrect()) {
    flashcardEl.classList.add("is-flipped");
  } else {
    flashcardEl.classList.remove("is-flipped");
  }
}

function showNextCard() {
  currentIndex = (currentIndex + 1) % flashcards.length;
  flashcardEl.classList.remove("is-flipped");
  renderCard();
}

function showPreviousCard() {
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  flashcardEl.classList.remove("is-flipped");
  renderCard();
}

flashcardEl.addEventListener("click", () => {
  if (flashcardEl.classList.contains("is-flipped")) {
    flashcardEl.classList.remove("is-flipped");
    answerInputEl.focus();
    return;
  }

  tryFlipCard();
});

nextBtnEl.addEventListener("click", showNextCard);
prevBtnEl.addEventListener("click", showPreviousCard);
answerInputEl.addEventListener("input", (event) => {
  renderColoredInput(event.target.value);
  flashcardEl.classList.remove("is-flipped");
  tryFlipCard();
});

answerInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    tryFlipCard();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    showNextCard();
  } else if (event.key === "ArrowLeft") {
    showPreviousCard();
  } else if (event.key === " ") {
    event.preventDefault();
    tryFlipCard();
  }
});

renderCard();
