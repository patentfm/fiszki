const flashcards = [
  {
    polish: "koza",
    english: "goat",
    frontImage: "./images/koza-front.jpg",
    backImage: "./images/koza-back.jpg",
  },
  {
    polish: "swinia",
    english: "pig",
    frontImage: "./images/swinia-front.jpg",
    backImage: "./images/swinia-back.jpg",
  },
  {
    polish: "kurczak",
    english: "chicken",
    frontImage: "./images/kurczak-front.jpg",
    backImage: "./images/kurczak-back.jpg",
  },
  {
    polish: "kon",
    english: "horse",
    frontImage: "./images/kon-front.jpg",
    backImage: "./images/kon-back.jpg",
  },
  {
    polish: "owca",
    english: "sheep",
    frontImage: "./images/owca-front.jpg",
    backImage: "./images/owca-back.jpg",
  },
  {
    polish: "osiol",
    english: "donkey",
    frontImage: "./images/osiol-front.jpg",
    backImage: "./images/osiol-back.jpg",
  },
  {
    polish: "krowa",
    english: "cow",
    frontImage: "./images/krowa-front.jpg",
    backImage: "./images/krowa-back.jpg",
  },
  {
    polish: "kaczka",
    english: "duck",
    frontImage: "./images/kaczka-front.jpg",
    backImage: "./images/kaczka-back.jpg",
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
