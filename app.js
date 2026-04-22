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
  flashcardEl.classList.toggle("is-flipped");
});

nextBtnEl.addEventListener("click", showNextCard);
prevBtnEl.addEventListener("click", showPreviousCard);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    showNextCard();
  } else if (event.key === "ArrowLeft") {
    showPreviousCard();
  } else if (event.key === " ") {
    event.preventDefault();
    flashcardEl.classList.toggle("is-flipped");
  }
});

renderCard();
