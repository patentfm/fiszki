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
const backOwnershipBadgeEl = document.getElementById("backOwnershipBadge");
const backRarityBadgeEl = document.getElementById("backRarityBadge");
const albumPreviewRarityBadgeEl = document.getElementById("albumPreviewRarityBadge");
const unlockProgressTextEl = document.getElementById("unlockProgressText");
const unlockProgressFillEl = document.getElementById("unlockProgressFill");
const timerCountdownEl = document.getElementById("timerCountdown");
const roundMessageEl = document.getElementById("roundMessage");

let currentIndex = 0;
const UNLOCKED_CARDS_COOKIE = "unlockedCards";
const COOKIE_EXPIRATION_DAYS = 365;
const MIN_BACK_VARIANT = 1;
const MAX_BACK_VARIANT = 4;
const ANSWER_TIME_LIMIT_SECONDS = 59;
const RARITY_BY_VARIANT = {
  1: { label: "Popularna", emoji: "❤️" },
  2: { label: "Niespotykana", emoji: "🥉" },
  3: { label: "Rzadka", emoji: "🥈" },
  4: { label: "Bardzo rzadka", emoji: "🥇" },
};
const backImageVariants = flashcards.map(
  () =>
    Math.floor(Math.random() * (MAX_BACK_VARIANT - MIN_BACK_VARIANT + 1)) +
    MIN_BACK_VARIANT,
);
const unlockedCards = loadUnlockedCards();
let timeLeftSeconds = ANSWER_TIME_LIMIT_SECONDS;
let answerTimerId = null;
let isCorrectionMode = false;
let wasCurrentVariantOwnedAtRoundStart = false;

function buildUnlockKey(cardIndex, variantNumber) {
  const card = flashcards[cardIndex];
  if (!card) {
    return "";
  }
  const backImagePath = buildBackImagePath(card.backImage, variantNumber);
  const fileName = backImagePath.split("/").pop() || "";
  return fileName.replace(/\.[^.]+$/, "");
}

function getCardBackStem(cardIndex) {
  const card = flashcards[cardIndex];
  if (!card) {
    return "";
  }
  const fileName = (card.backImage.split("/").pop() || "").replace(/\.[^.]+$/, "");
  return fileName.replace(/-back$/i, "");
}

function parseUnlockEntry(entry) {
  if (typeof entry !== "string") {
    return null;
  }

  const trimmedEntry = entry.trim();
  if (trimmedEntry.length === 0) {
    return null;
  }

  const imageNameMatch = trimmedEntry.match(/^(.*)-back-(\d+)$/i);
  if (!imageNameMatch) {
    return null;
  }

  const stem = imageNameMatch[1];
  const variantNumber = Number.parseInt(imageNameMatch[2], 10);
  if (
    !Number.isInteger(variantNumber) ||
    variantNumber < MIN_BACK_VARIANT ||
    variantNumber > MAX_BACK_VARIANT
  ) {
    return null;
  }

  const cardIndex = flashcards.findIndex((_, index) => getCardBackStem(index) === stem);
  if (cardIndex === -1) {
    return null;
  }

  return {
    cardIndex,
    variantNumber,
    unlockKey: trimmedEntry,
  };
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

  let parsedEntries = [];
  try {
    const parsed = JSON.parse(unlockedCardsCookie);
    if (Array.isArray(parsed)) {
      parsedEntries = parsed;
    } else if (typeof parsed === "string") {
      parsedEntries = parsed.split(",");
    }
  } catch {
    parsedEntries = unlockedCardsCookie.split(",");
  }

  const validUnlockKeys = parsedEntries
    .map((entry) => {
      // Backward compatibility: old cookie stored numeric card indexes.
      if (Number.isInteger(entry) && entry >= 0 && entry < flashcards.length) {
        const fallbackVariant = backImageVariants[entry];
        return buildUnlockKey(entry, fallbackVariant);
      }

      // Backward compatibility: old cookie stored "index:variant".
      if (typeof entry === "string" && entry.includes(":")) {
        const [cardIndexRaw, variantRaw] = entry.split(":");
        const cardIndex = Number.parseInt(cardIndexRaw || "", 10);
        const variantNumber = Number.parseInt(variantRaw || "", 10);
        if (
          Number.isInteger(cardIndex) &&
          cardIndex >= 0 &&
          cardIndex < flashcards.length &&
          Number.isInteger(variantNumber) &&
          variantNumber >= MIN_BACK_VARIANT &&
          variantNumber <= MAX_BACK_VARIANT
        ) {
          return buildUnlockKey(cardIndex, variantNumber);
        }
      }

      if (typeof entry === "string") {
        return entry.trim();
      }
      return "";
    })
    .filter((entry) => parseUnlockEntry(entry));

  return new Set(validUnlockKeys);
}

function saveUnlockedCards() {
  const orderedUnlocks = [...unlockedCards];
  setCookie(UNLOCKED_CARDS_COOKIE, orderedUnlocks.join(","), COOKIE_EXPIRATION_DAYS);
}

function buildBackImagePath(basePath, variantNumber) {
  return basePath.replace(/-back(\.[^.]+)$/i, `-back-${variantNumber}$1`);
}

function getRandomBackVariant() {
  return Math.floor(Math.random() * (MAX_BACK_VARIANT - MIN_BACK_VARIANT + 1)) + MIN_BACK_VARIANT;
}

function getRarityMeta(variantNumber) {
  return RARITY_BY_VARIANT[variantNumber] || {
    label: "Nieznana",
    emoji: "❔",
  };
}

function getRarityText(variantNumber) {
  const rarityMeta = getRarityMeta(variantNumber);
  return `${rarityMeta.emoji} ${rarityMeta.label}`;
}

function renderBackOwnershipBadge() {
  if (!backOwnershipBadgeEl) {
    return;
  }

  if (wasCurrentVariantOwnedAtRoundStart) {
    backOwnershipBadgeEl.textContent = "✅ Masz już tą 😎";
    backOwnershipBadgeEl.classList.remove("is-new");
    backOwnershipBadgeEl.classList.add("is-owned");
    return;
  }

  backOwnershipBadgeEl.textContent = "🎉 NOWA! 🏆 ";
  backOwnershipBadgeEl.classList.remove("is-owned");
  backOwnershipBadgeEl.classList.add("is-new");
}

function renderTimerCountdown() {
  if (!timerCountdownEl) {
    return;
  }

  timerCountdownEl.textContent = `Czas: ${timeLeftSeconds}s`;
}

function updateNavigationButtonsState() {
  const shouldDisable = isCorrectionMode;
  prevBtnEl.disabled = shouldDisable;
  nextBtnEl.disabled = shouldDisable;
}

function renderRoundMessage() {
  if (!roundMessageEl) {
    return;
  }

  if (isCorrectionMode) {
    roundMessageEl.textContent = `Koniec czasu. Poprawna odpowiedz: ${flashcards[currentIndex].english}. Przepisz ja, aby przejsc dalej (bez odblokowania).`;
    return;
  }

  roundMessageEl.textContent = "";
}

function stopAnswerTimer() {
  if (answerTimerId === null) {
    return;
  }

  clearInterval(answerTimerId);
  answerTimerId = null;
}

function enterCorrectionMode() {
  isCorrectionMode = true;
  stopAnswerTimer();
  flashcardEl.classList.remove("is-flipped");
  updateNavigationButtonsState();
  if (answerInputWrapEl) {
    answerInputWrapEl.hidden = false;
  }
  answerInputEl.value = "";
  renderColoredInput("");
  renderRoundMessage();
  answerInputEl.focus();
}

function startAnswerTimer() {
  stopAnswerTimer();
  answerTimerId = setInterval(() => {
    if (isCorrectionMode) {
      stopAnswerTimer();
      return;
    }

    if (timeLeftSeconds <= 1) {
      timeLeftSeconds = 0;
      renderTimerCountdown();
      enterCorrectionMode();
      return;
    }

    timeLeftSeconds -= 1;
    renderTimerCountdown();
  }, 1000);
}

function resetRoundState() {
  stopAnswerTimer();
  timeLeftSeconds = ANSWER_TIME_LIMIT_SECONDS;
  isCorrectionMode = false;
  renderTimerCountdown();
  renderRoundMessage();
  updateNavigationButtonsState();
}

function renderCard() {
  const card = flashcards[currentIndex];
  const currentVariant = getRandomBackVariant();
  const unlockKey = buildUnlockKey(currentIndex, currentVariant);
  wasCurrentVariantOwnedAtRoundStart = unlockedCards.has(unlockKey);
  backImageVariants[currentIndex] = currentVariant;
  resetRoundState();
  startAnswerTimer();

  polishWordEl.textContent = card.polish;
  englishWordEl.textContent = card.english;

  frontImageEl.src = card.frontImage;
  backImageEl.src = buildBackImagePath(card.backImage, currentVariant);
  if (backRarityBadgeEl) {
    backRarityBadgeEl.textContent = getRarityText(currentVariant);
  }
  renderBackOwnershipBadge();

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

  albumGridEl.innerHTML = "";
  const sortedCards = [...flashcards]
    .map((card, cardIndex) => ({ card, cardIndex }))
    .sort((left, right) => left.card.polish.localeCompare(right.card.polish, "pl"));

  if (sortedCards.length === 0) {
    albumEmptyStateEl.hidden = false;
    return;
  }

  albumEmptyStateEl.hidden = true;
  const albumMarkup = sortedCards
    .map(({ card, cardIndex }) => {
      const variantMarkup = [];
      let unlockedCountForAnimal = 0;

      for (
        let variantNumber = MIN_BACK_VARIANT;
        variantNumber <= MAX_BACK_VARIANT;
        variantNumber += 1
      ) {
        const unlockKey = buildUnlockKey(cardIndex, variantNumber);
        const isUnlocked = unlockedCards.has(unlockKey);
        if (isUnlocked) {
          unlockedCountForAnimal += 1;
        }

        const rarityText = getRarityText(variantNumber);
        if (isUnlocked) {
          const backImageSrc = buildBackImagePath(card.backImage, variantNumber);
          variantMarkup.push(`
            <button type="button" class="album-card" data-card-index="${cardIndex}" data-variant-number="${variantNumber}">
              <div class="album-card-image-wrap">
                <img src="${backImageSrc}" alt="Odblokowana karta: ${card.polish} (${card.english})" class="album-card-image" />
              </div>
              <p class="album-card-title">${rarityText}</p>
            </button>
          `);
        } else {
          variantMarkup.push(`
            <div class="album-card album-card-locked" aria-hidden="true">
              <div class="album-card-image-wrap album-card-locked-image">🔒</div>
              <p class="album-card-title">${rarityText}</p>
            </div>
          `);
        }
      }

      return `
        <section class="album-animal-group">
          <header class="album-animal-header">
            <h3>${card.polish} - ${card.english}</h3>
            <span class="album-animal-progress">Odblokowane: ${unlockedCountForAnimal}/${MAX_BACK_VARIANT}</span>
          </header>
          <div class="album-animal-grid">
            ${variantMarkup.join("")}
          </div>
        </section>
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
  const rarityText = getRarityText(variantNumber);
  albumPreviewTitleEl.textContent = `${card.polish} - ${card.english}\n(${rarityText})`;
  if (albumPreviewRarityBadgeEl) {
    albumPreviewRarityBadgeEl.textContent = rarityText;
  }

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

  stopAnswerTimer();
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
  if (!isCorrectionMode && !flashcardEl.classList.contains("is-flipped") && answerTimerId === null) {
    startAnswerTimer();
  }
  answerInputEl.focus();
}

function tryFlipCard() {
  if (isCorrectionMode) {
    if (isAnswerCorrect()) {
      showNextCard();
    } else {
      flashcardEl.classList.remove("is-flipped");
      if (answerInputWrapEl) {
        answerInputWrapEl.hidden = false;
      }
    }
    return;
  }

  if (isAnswerCorrect()) {
    stopAnswerTimer();
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
  if (isCorrectionMode && !isAnswerCorrect()) {
    return;
  }
  currentIndex = (currentIndex + 1) % flashcards.length;
  flashcardEl.classList.remove("is-flipped");
  renderCard();
}

function showPreviousCard() {
  if (isCorrectionMode) {
    return;
  }
  currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
  flashcardEl.classList.remove("is-flipped");
  renderCard();
}

flashcardEl.addEventListener("click", () => {
  if (flashcardEl.classList.contains("is-flipped")) {
    if (!isCorrectionMode && isAnswerCorrect()) {
      return;
    }
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

  if (isCorrectionMode && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
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
