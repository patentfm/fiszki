const flashcards = [
  {
    polish: "Koza",
    english: "goat",
    frontImage: "./images/koza-front.webp",
    backImage: "./images/koza-back.png",
  },
  {
    polish: "Świnia",
    english: "pig",
    frontImage: "./images/swinia-front.webp",
    backImage: "./images/swinia-back.png",
  },
  {
    polish: "Kurczak",
    english: "chicken",
    frontImage: "./images/kurczak-front.webp",
    backImage: "./images/kurczak-back.png",
  },
  {
    polish: "Koń",
    english: "horse",
    frontImage: "./images/kon-front.webp",
    backImage: "./images/kon-back.png",
  },
  {
    polish: "Owca",
    english: "sheep",
    frontImage: "./images/owca-front.webp",
    backImage: "./images/owca-back.png",
  },
  {
    polish: "Osioł",
    english: "donkey",
    frontImage: "./images/osiol-front.png",
    backImage: "./images/osiol-back.png",
  },
  {
    polish: "Krowa",
    english: "cow",
    frontImage: "./images/krowa-front.png",
    backImage: "./images/krowa-back.png",
  },
  {
    polish: "Kaczka",
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
const answerColoredEl =
  document.getElementById("answerColored") || document.getElementById("letterFeedback");
const answerInputWrapEl = document.querySelector(".answer-input-wrap");
const albumBtnEl = document.getElementById("albumBtn");
const backToGameBtnEl = document.getElementById("backToGameBtn");
const gameViewEl = document.getElementById("gameView");
const gameControlsEl = document.getElementById("gameControls");
const albumViewEl = document.getElementById("albumView");
const albumGridEl = document.getElementById("albumGrid");
const albumEmptyStateEl = document.getElementById("albumEmptyState");
const albumListViewEl = document.getElementById("albumListView");
const albumPreviewViewEl = document.getElementById("albumPreviewView");
const backToGalleryBtnEl = document.getElementById("backToGalleryBtn");
const albumPreviewImageEl = document.getElementById("albumPreviewImage");
const albumPreviewTitleEl = document.getElementById("albumPreviewTitle");
const unlockProgressTextEl = document.getElementById("unlockProgressText");
const unlockProgressFillEl = document.getElementById("unlockProgressFill");

let currentIndex = 0;
const UNLOCKED_CARDS_COOKIE = "unlockedCards";
const COOKIE_EXPIRATION_DAYS = 365;
const MIN_BACK_VARIANT = 1;
const MAX_BACK_VARIANT = 4;
const backImageVariants = flashcards.map(
  () =>
    Math.floor(Math.random() * (MAX_BACK_VARIANT - MIN_BACK_VARIANT + 1)) +
    MIN_BACK_VARIANT,
);
const unlockedCards = loadUnlockedCards();

function buildUnlockKey(cardIndex, variantNumber) {
  return `${cardIndex}:${variantNumber}`;
}

function setCookie(name, value, expirationDays) {
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + expirationDays * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expirationDate.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const cookiePrefix = `${name}=`;
  const cookies = document.cookie.split(";");

  for (const cookiePart of cookies) {
    const trimmedCookie = cookiePart.trim();
    if (trimmedCookie.startsWith(cookiePrefix)) {
      return decodeURIComponent(trimmedCookie.slice(cookiePrefix.length));
    }
  }

  return null;
}

function loadUnlockedCards() {
  const unlockedCardsCookie = getCookie(UNLOCKED_CARDS_COOKIE);
  if (!unlockedCardsCookie) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(unlockedCardsCookie);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    const validUnlockKeys = parsed
      .map((entry) => {
        // Backward compatibility: old cookie stored numeric card indexes.
        if (Number.isInteger(entry)) {
          const fallbackVariant = backImageVariants[entry];
          return buildUnlockKey(entry, fallbackVariant);
        }
        return entry;
      })
      .filter((entry) => {
        if (typeof entry !== "string") {
          return false;
        }

        const [cardIndexRaw, variantRaw] = entry.split(":");
        const cardIndex = Number.parseInt(cardIndexRaw || "", 10);
        const variantNumber = Number.parseInt(variantRaw || "", 10);
        return (
          Number.isInteger(cardIndex) &&
          cardIndex >= 0 &&
          cardIndex < flashcards.length &&
          Number.isInteger(variantNumber) &&
          variantNumber >= MIN_BACK_VARIANT &&
          variantNumber <= MAX_BACK_VARIANT
        );
      });
    return new Set(validUnlockKeys);
  } catch {
    return new Set();
  }
}

function saveUnlockedCards() {
  const sortedIndexes = [...unlockedCards].sort();
  setCookie(
    UNLOCKED_CARDS_COOKIE,
    JSON.stringify(sortedIndexes),
    COOKIE_EXPIRATION_DAYS,
  );
}

function buildBackImagePath(basePath, variantNumber) {
  return basePath.replace(/-back(\.[^.]+)$/i, `-back-${variantNumber}$1`);
}

function getRandomBackVariant() {
  return Math.floor(Math.random() * (MAX_BACK_VARIANT - MIN_BACK_VARIANT + 1)) + MIN_BACK_VARIANT;
}

function renderCard() {
  const card = flashcards[currentIndex];
  const currentVariant = getRandomBackVariant();
  backImageVariants[currentIndex] = currentVariant;

  polishWordEl.textContent = card.polish;
  englishWordEl.textContent = card.english;

  frontImageEl.src = card.frontImage;
  backImageEl.src = buildBackImagePath(card.backImage, currentVariant);

  frontImageEl.alt = `Zwierzatko: ${card.polish}`;
  backImageEl.alt = `Zabawny obrazek: ${card.polish} (${card.english})`;

  progressEl.textContent = `${currentIndex + 1} / ${flashcards.length}`;
  answerInputEl.value = "";
  if (answerInputWrapEl) {
    answerInputWrapEl.hidden = false;
  }
  if (answerColoredEl) {
    answerColoredEl.innerHTML = '<span class="placeholder">Wpisz odpowiedz...</span>';
  }
  answerInputEl.focus();
  renderUnlockProgress();
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
    if (answerColoredEl) {
      answerColoredEl.innerHTML = '<span class="placeholder">Wpisz odpowiedz...</span>';
    }
    return;
  }

  for (let i = 0; i < typedWord.length; i += 1) {
    const typedChar = typedWord[i];
    const expectedChar = expectedWord[i];
    const cssClass = typedChar === expectedChar ? "correct" : "wrong";
    coloredHtml += `<span class="${cssClass}">${escapeHtml(typedChar)}</span>`;
  }

  if (answerColoredEl) {
    answerColoredEl.innerHTML = coloredHtml;
  }
}

function isAnswerCorrect() {
  const expectedWord = flashcards[currentIndex].english.toLowerCase();
  const typedWord = answerInputEl.value.trim().toLowerCase();
  return typedWord === expectedWord;
}

function renderAlbum() {
  if (!albumGridEl || !albumEmptyStateEl) {
    return;
  }

  const unlockedIndexes = [...unlockedCards].sort();
  albumGridEl.innerHTML = "";

  if (unlockedIndexes.length === 0) {
    albumEmptyStateEl.hidden = false;
    return;
  }

  albumEmptyStateEl.hidden = true;
  const albumMarkup = unlockedIndexes
    .map((unlockKey) => {
      const [cardIndexRaw, variantRaw] = unlockKey.split(":");
      const cardIndex = Number.parseInt(cardIndexRaw || "", 10);
      const variantNumber = Number.parseInt(variantRaw || "", 10);
      const card = flashcards[cardIndex];
      const backImageSrc = buildBackImagePath(card.backImage, variantNumber);
      return `
        <button type="button" class="album-card" data-card-index="${cardIndex}" data-variant-number="${variantNumber}">
          <img src="${backImageSrc}" alt="Odblokowana karta: ${card.polish} (${card.english})" class="album-card-image" />
          <p class="album-card-title">${card.polish} - ${card.english} (wariant ${variantNumber})</p>
        </button>
      `;
    })
    .join("");

  albumGridEl.innerHTML = albumMarkup;
}

function renderUnlockProgress() {
  if (!unlockProgressTextEl || !unlockProgressFillEl) {
    return;
  }

  const unlockedCount = unlockedCards.size;
  const totalCount = flashcards.length * MAX_BACK_VARIANT;
  const unlockedPercent = totalCount === 0 ? 0 : (unlockedCount / totalCount) * 100;

  unlockProgressTextEl.textContent = `Odblokowane: ${unlockedCount}/${totalCount}`;
  unlockProgressFillEl.style.width = `${unlockedPercent}%`;
}

function showAlbumListView() {
  if (!albumListViewEl || !albumPreviewViewEl) {
    return;
  }

  albumPreviewViewEl.classList.add("is-hidden");
  albumListViewEl.classList.remove("is-hidden");
}

function showAlbumPreview(cardIndex, variantNumber) {
  if (
    !albumListViewEl ||
    !albumPreviewViewEl ||
    !albumPreviewImageEl ||
    !albumPreviewTitleEl
  ) {
    return;
  }

  const card = flashcards[cardIndex];
  if (!card) {
    return;
  }

  albumPreviewImageEl.src = buildBackImagePath(card.backImage, variantNumber);
  albumPreviewImageEl.alt = `Podglad karty: ${card.polish} (${card.english})`;
  albumPreviewTitleEl.textContent = `${card.polish} - ${card.english} (wariant ${variantNumber})`;

  albumListViewEl.classList.add("is-hidden");
  albumPreviewViewEl.classList.remove("is-hidden");
}

function unlockCurrentCard() {
  const currentVariantNumber = backImageVariants[currentIndex];
  const unlockKey = buildUnlockKey(currentIndex, currentVariantNumber);
  if (unlockedCards.has(unlockKey)) {
    return;
  }

  unlockedCards.add(unlockKey);
  saveUnlockedCards();
  renderAlbum();
  renderUnlockProgress();
}

function showAlbumView() {
  if (!gameViewEl || !albumViewEl || !gameControlsEl || !albumBtnEl) {
    return;
  }

  showAlbumListView();
  renderAlbum();
  gameViewEl.classList.add("is-hidden");
  gameControlsEl.classList.add("is-hidden");
  albumViewEl.classList.remove("is-hidden");
  albumBtnEl.classList.add("is-hidden");
}

function showGameView() {
  if (!gameViewEl || !albumViewEl || !gameControlsEl || !albumBtnEl) {
    return;
  }

  albumViewEl.classList.add("is-hidden");
  gameViewEl.classList.remove("is-hidden");
  gameControlsEl.classList.remove("is-hidden");
  albumBtnEl.classList.remove("is-hidden");
  answerInputEl.focus();
}

function tryFlipCard() {
  if (isAnswerCorrect()) {
    flashcardEl.classList.add("is-flipped");
    unlockCurrentCard();
    if (answerInputWrapEl) {
      answerInputWrapEl.hidden = true;
    }
    // Remove input focus so Firefox focus ring disappears after correct answer.
    answerInputEl.blur();
  } else {
    flashcardEl.classList.remove("is-flipped");
    if (answerInputWrapEl) {
      answerInputWrapEl.hidden = false;
    }
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
    if (answerInputWrapEl) {
      answerInputWrapEl.hidden = false;
    }
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
  const isAlbumVisible = albumViewEl && !albumViewEl.classList.contains("is-hidden");
  if (isAlbumVisible) {
    return;
  }

  if (event.key === "ArrowRight") {
    showNextCard();
  } else if (event.key === "ArrowLeft") {
    showPreviousCard();
  } else if (event.key === " ") {
    event.preventDefault();
    tryFlipCard();
  }
});

if (albumBtnEl) {
  albumBtnEl.addEventListener("click", showAlbumView);
}

if (backToGameBtnEl) {
  backToGameBtnEl.addEventListener("click", showGameView);
}

if (albumGridEl) {
  albumGridEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const cardButton = target.closest(".album-card");
    if (!(cardButton instanceof HTMLElement)) {
      return;
    }

    const cardIndex = Number.parseInt(cardButton.dataset.cardIndex || "", 10);
    const variantNumber = Number.parseInt(cardButton.dataset.variantNumber || "", 10);
    if (Number.isNaN(cardIndex) || Number.isNaN(variantNumber)) {
      return;
    }

    showAlbumPreview(cardIndex, variantNumber);
  });
}

if (backToGalleryBtnEl) {
  backToGalleryBtnEl.addEventListener("click", showAlbumListView);
}

renderAlbum();
renderUnlockProgress();
renderCard();
