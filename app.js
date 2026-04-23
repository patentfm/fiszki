const flashcardSets = {
  animals: {
    id: "animals",
    label: "Zwierzęta",
    albumTitle: "Album: Zwierzęta",
    cards: [
      { polish: "Koza", english: "goat", frontImage: "./images/koza-front.webp", backImage: "./images/koza-back.png" },
      { polish: "Świnia", english: "pig", frontImage: "./images/swinia-front.webp", backImage: "./images/swinia-back.png" },
      {
        polish: "Kurczak",
        english: "chicken",
        frontImage: "./images/kurczak-front.webp",
        backImage: "./images/kurczak-back.png",
      },
      { polish: "Koń", english: "horse", frontImage: "./images/kon-front.webp", backImage: "./images/kon-back.png" },
      { polish: "Owca", english: "sheep", frontImage: "./images/owca-front.webp", backImage: "./images/owca-back.png" },
      { polish: "Osioł", english: "donkey", frontImage: "./images/osiol-front.png", backImage: "./images/osiol-back.png" },
      { polish: "Krowa", english: "cow", frontImage: "./images/krowa-front.png", backImage: "./images/krowa-back.png" },
      { polish: "Kaczka", english: "duck", frontImage: "./images/kaczka-front.webp", backImage: "./images/kaczka-back.png" },
    ],
  },
  places: {
    id: "places",
    label: "Miejsca",
    albumTitle: "Album: Miejsca",
    cards: [
      { polish: "Dom", english: "house", frontImage: "./images/dom-front.webp", backImage: "./images/dom-back.png" },
      { polish: "Szkoła", english: "school", frontImage: "./images/szkola-front.webp", backImage: "./images/szkola-back.png" },
      { polish: "Las", english: "forest", frontImage: "./images/las-front.webp", backImage: "./images/las-back.png" },
      { polish: "Rzeka", english: "river", frontImage: "./images/rzeka-front.webp", backImage: "./images/rzeka-back.png" },
      {
        polish: "Góra",
        english: "mountain",
        frontImage: "./images/gora-front.webp",
        backImage: "./images/gora-back.png",
      },
      { polish: "Miasto", english: "city", frontImage: "./images/miasto-front.webp", backImage: "./images/miasto-back.png" },
    ],
  },
  digits: {
    id: "digits",
    label: "Cyfry",
    albumTitle: "Album: Cyfry",
    cards: [
      { polish: "Zero", english: "zero", frontImage: "./images/zero-front.webp", backImage: "./images/zero-back.png" },
      { polish: "Jeden", english: "one", frontImage: "./images/jeden-front.webp", backImage: "./images/jeden-back.png" },
      { polish: "Dwa", english: "two", frontImage: "./images/dwa-front.webp", backImage: "./images/dwa-back.png" },
      { polish: "Trzy", english: "three", frontImage: "./images/trzy-front.webp", backImage: "./images/trzy-back.png" },
      { polish: "Cztery", english: "four", frontImage: "./images/cztery-front.webp", backImage: "./images/cztery-back.png" },
      { polish: "Pięć", english: "five", frontImage: "./images/piec-front.webp", backImage: "./images/piec-back.png" },
      { polish: "Sześć", english: "six", frontImage: "./images/szesc-front.webp", backImage: "./images/szesc-back.png" },
      { polish: "Siedem", english: "seven", frontImage: "./images/siedem-front.webp", backImage: "./images/siedem-back.png" },
      { polish: "Osiem", english: "eight", frontImage: "./images/osiem-front.webp", backImage: "./images/osiem-back.png" },
      { polish: "Dziewięć", english: "nine", frontImage: "./images/dziewiec-front.webp", backImage: "./images/dziewiec-back.png" },
    ],
  },
};

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
const backToMenuBtnEl = document.getElementById("backToMenuBtn");
const backToGameBtnEl = document.getElementById("backToGameBtn");
const gameViewEl = document.getElementById("gameView");
const gameControlsEl = document.getElementById("gameControls");
const albumViewEl = document.getElementById("albumView");
const menuViewEl = document.getElementById("menuView");
const setTilesEl = document.getElementById("setTiles");
const albumTitleEl = document.getElementById("albumTitle");
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

let activeSetId = null;
let currentIndex = 0;
const COOKIE_EXPIRATION_DAYS = 365;
const LEGACY_ANIMAL_COOKIE = "unlockedCards";
const ANSWER_TIME_LIMIT_SECONDS = 59;
const MIN_BACK_VARIANT = 1;
const MAX_BACK_VARIANT = 4;
const RARITY_BY_VARIANT = {
  1: { label: "Popularna", emoji: "❤️" },
  2: { label: "Niespotykana", emoji: "🥉" },
  3: { label: "Rzadka", emoji: "🥈" },
  4: { label: "Bardzo rzadka", emoji: "🥇" },
};

const unlockedCardsBySet = {};
const backImageVariantsBySet = {};
let timeLeftSeconds = ANSWER_TIME_LIMIT_SECONDS;
let answerTimerId = null;
let isCorrectionMode = false;
let wasCurrentVariantOwnedAtRoundStart = false;

function getSetCookieName(setId) {
  return setId === "animals" ? LEGACY_ANIMAL_COOKIE : `unlockedCards_${setId}`;
}

function getActiveSet() {
  return flashcardSets[activeSetId] || null;
}

function getActiveFlashcards() {
  return getActiveSet()?.cards || [];
}

function getActiveUnlockedCards() {
  if (!activeSetId) {
    return new Set();
  }
  if (!unlockedCardsBySet[activeSetId]) {
    unlockedCardsBySet[activeSetId] = loadUnlockedCards(activeSetId);
  }
  return unlockedCardsBySet[activeSetId];
}

function getActiveBackVariants() {
  if (!activeSetId) {
    return [];
  }
  if (!backImageVariantsBySet[activeSetId]) {
    backImageVariantsBySet[activeSetId] = getActiveFlashcards().map(() => getRandomBackVariant());
  }
  return backImageVariantsBySet[activeSetId];
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

function buildBackImagePath(basePath, variantNumber) {
  return basePath.replace(/-back(\.[^.]+)$/i, `-back-${variantNumber}$1`);
}

function buildUnlockKey(cardIndex, variantNumber, setId = activeSetId) {
  const card = flashcardSets[setId]?.cards[cardIndex];
  if (!card) {
    return "";
  }
  const fileName = (buildBackImagePath(card.backImage, variantNumber).split("/").pop() || "").replace(
    /\.[^.]+$/,
    "",
  );
  return fileName;
}

function getCardBackStem(cardIndex, cards) {
  const card = cards[cardIndex];
  if (!card) {
    return "";
  }
  const fileName = (card.backImage.split("/").pop() || "").replace(/\.[^.]+$/, "");
  return fileName.replace(/-back$/i, "");
}

function parseUnlockEntry(entry, cards, setId) {
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
  const cardIndex = cards.findIndex((_, index) => getCardBackStem(index, cards) === stem);
  if (cardIndex === -1) {
    return null;
  }
  return { unlockKey: buildUnlockKey(cardIndex, variantNumber, setId) };
}

function loadUnlockedCards(setId) {
  const cards = flashcardSets[setId]?.cards || [];
  const unlockedCardsCookie = getCookie(getSetCookieName(setId));
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
      if (Number.isInteger(entry) && entry >= 0 && entry < cards.length) {
        return buildUnlockKey(entry, getRandomBackVariant(), setId);
      }

      if (typeof entry === "string" && entry.includes(":")) {
        const [cardIndexRaw, variantRaw] = entry.split(":");
        const cardIndex = Number.parseInt(cardIndexRaw || "", 10);
        const variantNumber = Number.parseInt(variantRaw || "", 10);
        if (
          Number.isInteger(cardIndex) &&
          cardIndex >= 0 &&
          cardIndex < cards.length &&
          Number.isInteger(variantNumber) &&
          variantNumber >= MIN_BACK_VARIANT &&
          variantNumber <= MAX_BACK_VARIANT
        ) {
          return buildUnlockKey(cardIndex, variantNumber, setId);
        }
      }

      return typeof entry === "string" ? entry.trim() : "";
    })
    .filter((entry) => parseUnlockEntry(entry, cards, setId));

  return new Set(validUnlockKeys);
}

function saveUnlockedCards(setId = activeSetId) {
  if (!setId || !unlockedCardsBySet[setId]) {
    return;
  }
  setCookie(getSetCookieName(setId), [...unlockedCardsBySet[setId]].join(","), COOKIE_EXPIRATION_DAYS);
}

function getRandomBackVariant() {
  return Math.floor(Math.random() * (MAX_BACK_VARIANT - MIN_BACK_VARIANT + 1)) + MIN_BACK_VARIANT;
}

function getRarityText(variantNumber) {
  const rarityMeta = RARITY_BY_VARIANT[variantNumber] || { label: "Nieznana", emoji: "❔" };
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
  backOwnershipBadgeEl.textContent = "🎉 NOWA! 🏆";
  backOwnershipBadgeEl.classList.remove("is-owned");
  backOwnershipBadgeEl.classList.add("is-new");
}

function renderTimerCountdown() {
  if (timerCountdownEl) {
    timerCountdownEl.textContent = `Czas: ${timeLeftSeconds}s`;
  }
}

function updateNavigationButtonsState() {
  const shouldDisable = isCorrectionMode || !activeSetId;
  prevBtnEl.disabled = shouldDisable;
  nextBtnEl.disabled = shouldDisable;
}

function renderRoundMessage() {
  if (!roundMessageEl) {
    return;
  }
  const card = getActiveFlashcards()[currentIndex];
  if (isCorrectionMode && card) {
    roundMessageEl.textContent = `Koniec czasu. Poprawna odpowiedz: ${card.english}. Przepisz ja, aby przejsc dalej (bez odblokowania).`;
    return;
  }
  roundMessageEl.textContent = "";
}

function stopAnswerTimer() {
  if (answerTimerId !== null) {
    clearInterval(answerTimerId);
    answerTimerId = null;
  }
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
  if (!activeSetId) {
    return;
  }
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
  const cards = getActiveFlashcards();
  const card = cards[currentIndex];
  if (!card) {
    return;
  }

  const currentVariant = getRandomBackVariant();
  getActiveBackVariants()[currentIndex] = currentVariant;
  const unlockKey = buildUnlockKey(currentIndex, currentVariant);
  wasCurrentVariantOwnedAtRoundStart = getActiveUnlockedCards().has(unlockKey);

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
  frontImageEl.alt = `Fiszka: ${card.polish}`;
  backImageEl.alt = `Odwrot fiszki: ${card.polish} (${card.english})`;
  progressEl.textContent = `${currentIndex + 1} / ${cards.length}`;
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
  const card = getActiveFlashcards()[currentIndex];
  if (!card) {
    return;
  }
  const expectedWord = card.english.toLowerCase();
  const typedWord = inputValue.toLowerCase();
  if (typedWord.length === 0) {
    if (answerColoredEl) {
      answerColoredEl.innerHTML = '<span class="placeholder">Wpisz odpowiedz...</span>';
    }
    return;
  }
  let coloredHtml = "";
  for (let i = 0; i < typedWord.length; i += 1) {
    const cssClass = typedWord[i] === expectedWord[i] ? "correct" : "wrong";
    coloredHtml += `<span class="${cssClass}">${escapeHtml(typedWord[i])}</span>`;
  }
  if (answerColoredEl) {
    answerColoredEl.innerHTML = coloredHtml;
  }
}

function isAnswerCorrect() {
  const card = getActiveFlashcards()[currentIndex];
  if (!card) {
    return false;
  }
  return answerInputEl.value.trim().toLowerCase() === card.english.toLowerCase();
}

function renderAlbum() {
  if (!activeSetId || !albumGridEl || !albumEmptyStateEl) {
    return;
  }
  const cards = getActiveFlashcards();
  const unlockedCards = getActiveUnlockedCards();
  const sortedCards = [...cards]
    .map((card, cardIndex) => ({ card, cardIndex }))
    .sort((left, right) => left.card.polish.localeCompare(right.card.polish, "pl"));

  if (sortedCards.length === 0) {
    albumGridEl.innerHTML = "";
    albumEmptyStateEl.hidden = false;
    return;
  }

  albumEmptyStateEl.hidden = true;
  albumGridEl.innerHTML = sortedCards
    .map(({ card, cardIndex }) => {
      const variantMarkup = [];
      let unlockedCountForCard = 0;
      for (let variantNumber = MIN_BACK_VARIANT; variantNumber <= MAX_BACK_VARIANT; variantNumber += 1) {
        const unlockKey = buildUnlockKey(cardIndex, variantNumber);
        const isUnlocked = unlockedCards.has(unlockKey);
        if (isUnlocked) {
          unlockedCountForCard += 1;
          variantMarkup.push(`
            <button type="button" class="album-card" data-card-index="${cardIndex}" data-variant-number="${variantNumber}">
              <div class="album-card-image-wrap">
                <img src="${buildBackImagePath(card.backImage, variantNumber)}" alt="Odblokowana karta: ${card.polish} (${card.english})" class="album-card-image" />
              </div>
              <p class="album-card-title">${getRarityText(variantNumber)}</p>
            </button>
          `);
        } else {
          variantMarkup.push(`
            <div class="album-card album-card-locked" aria-hidden="true">
              <div class="album-card-image-wrap album-card-locked-image">🔒</div>
              <p class="album-card-title">${getRarityText(variantNumber)}</p>
            </div>
          `);
        }
      }
      return `
        <section class="album-animal-group">
          <header class="album-animal-header">
            <h3>${card.polish} - ${card.english}</h3>
            <span class="album-animal-progress">Odblokowane: ${unlockedCountForCard}/${MAX_BACK_VARIANT}</span>
          </header>
          <div class="album-animal-grid">${variantMarkup.join("")}</div>
        </section>
      `;
    })
    .join("");
}

function renderUnlockProgress() {
  if (!activeSetId || !unlockProgressTextEl || !unlockProgressFillEl) {
    return;
  }
  const unlockedCount = getActiveUnlockedCards().size;
  const totalCount = getActiveFlashcards().length * MAX_BACK_VARIANT;
  const unlockedPercent = totalCount === 0 ? 0 : (unlockedCount / totalCount) * 100;
  unlockProgressTextEl.textContent = `Odblokowane: ${unlockedCount}/${totalCount}`;
  unlockProgressFillEl.style.width = `${unlockedPercent}%`;
}

function showAlbumListView() {
  if (albumListViewEl && albumPreviewViewEl) {
    albumPreviewViewEl.classList.add("is-hidden");
    albumListViewEl.classList.remove("is-hidden");
  }
}

function showAlbumPreview(cardIndex, variantNumber) {
  if (!activeSetId || !albumListViewEl || !albumPreviewViewEl || !albumPreviewImageEl || !albumPreviewTitleEl) {
    return;
  }
  const card = getActiveFlashcards()[cardIndex];
  if (!card) {
    return;
  }
  const rarityText = getRarityText(variantNumber);
  albumPreviewImageEl.src = buildBackImagePath(card.backImage, variantNumber);
  albumPreviewImageEl.alt = `Podglad karty: ${card.polish} (${card.english})`;
  albumPreviewTitleEl.textContent = `${card.polish} - ${card.english}\n(${rarityText})`;
  if (albumPreviewRarityBadgeEl) {
    albumPreviewRarityBadgeEl.textContent = rarityText;
  }
  albumListViewEl.classList.add("is-hidden");
  albumPreviewViewEl.classList.remove("is-hidden");
}

function unlockCurrentCard() {
  if (!activeSetId) {
    return;
  }
  const currentVariantNumber = getActiveBackVariants()[currentIndex];
  const unlockKey = buildUnlockKey(currentIndex, currentVariantNumber);
  const unlockedCards = getActiveUnlockedCards();
  if (unlockedCards.has(unlockKey)) {
    return;
  }
  unlockedCards.add(unlockKey);
  saveUnlockedCards();
  renderAlbum();
  renderUnlockProgress();
}

function showMenuView() {
  stopAnswerTimer();
  flashcardEl.classList.remove("is-flipped");
  menuViewEl?.classList.remove("is-hidden");
  gameViewEl?.classList.add("is-hidden");
  albumViewEl?.classList.add("is-hidden");
  gameControlsEl?.classList.add("is-hidden");
  albumBtnEl?.classList.add("is-hidden");
  backToMenuBtnEl?.classList.add("is-hidden");
}

function showAlbumView() {
  if (!activeSetId || !gameViewEl || !albumViewEl || !gameControlsEl || !albumBtnEl) {
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
  if (!activeSetId || !gameViewEl || !albumViewEl || !gameControlsEl || !albumBtnEl) {
    return;
  }
  menuViewEl?.classList.add("is-hidden");
  albumViewEl.classList.add("is-hidden");
  gameViewEl.classList.remove("is-hidden");
  gameControlsEl.classList.remove("is-hidden");
  albumBtnEl.classList.remove("is-hidden");
  backToMenuBtnEl?.classList.remove("is-hidden");
  if (!isCorrectionMode && !flashcardEl.classList.contains("is-flipped") && answerTimerId === null) {
    startAnswerTimer();
  }
  answerInputEl.focus();
}

function selectSet(setId) {
  if (!flashcardSets[setId]) {
    return;
  }
  activeSetId = setId;
  currentIndex = 0;
  flashcardEl.classList.remove("is-flipped");
  getActiveUnlockedCards();
  getActiveBackVariants();
  if (albumTitleEl) {
    albumTitleEl.textContent = flashcardSets[setId].albumTitle;
  }
  showGameView();
  renderAlbum();
  renderUnlockProgress();
  renderCard();
}

function renderSetTiles() {
  if (!setTilesEl) {
    return;
  }
  setTilesEl.innerHTML = Object.values(flashcardSets)
    .map(
      (set) => `
        <button type="button" class="set-tile" data-set-id="${set.id}">
          <span class="set-tile-title">${set.label}</span>
          <span class="set-tile-subtitle">${set.cards.length} kart</span>
        </button>
      `,
    )
    .join("");
}

function tryFlipCard() {
  if (!activeSetId) {
    return;
  }
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
    answerInputEl.blur();
  } else {
    flashcardEl.classList.remove("is-flipped");
    if (answerInputWrapEl) {
      answerInputWrapEl.hidden = false;
    }
  }
}

function showNextCard() {
  if (!activeSetId) {
    return;
  }
  if (isCorrectionMode && !isAnswerCorrect()) {
    return;
  }
  const cards = getActiveFlashcards();
  currentIndex = (currentIndex + 1) % cards.length;
  flashcardEl.classList.remove("is-flipped");
  renderCard();
}

function showPreviousCard() {
  if (!activeSetId || isCorrectionMode) {
    return;
  }
  const cards = getActiveFlashcards();
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  flashcardEl.classList.remove("is-flipped");
  renderCard();
}

flashcardEl.addEventListener("click", () => {
  if (!activeSetId) {
    return;
  }
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
  if (!activeSetId) {
    return;
  }
  renderColoredInput(event.target.value);
  flashcardEl.classList.remove("is-flipped");
  tryFlipCard();
});

answerInputEl.addEventListener("keydown", (event) => {
  if (!activeSetId) {
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    tryFlipCard();
  }
});

document.addEventListener("keydown", (event) => {
  if (!activeSetId) {
    return;
  }
  const isAlbumVisible = albumViewEl && !albumViewEl.classList.contains("is-hidden");
  const isMenuVisible = menuViewEl && !menuViewEl.classList.contains("is-hidden");
  if (isAlbumVisible || isMenuVisible) {
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

setTilesEl?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const tile = target.closest(".set-tile");
  if (!(tile instanceof HTMLElement)) {
    return;
  }
  const setId = tile.dataset.setId;
  if (setId) {
    selectSet(setId);
  }
});

albumBtnEl?.addEventListener("click", showAlbumView);
backToMenuBtnEl?.addEventListener("click", showMenuView);
backToGameBtnEl?.addEventListener("click", showGameView);

albumGridEl?.addEventListener("click", (event) => {
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
  if (!Number.isNaN(cardIndex) && !Number.isNaN(variantNumber)) {
    showAlbumPreview(cardIndex, variantNumber);
  }
});

backToGalleryBtnEl?.addEventListener("click", showAlbumListView);

renderSetTiles();
showMenuView();
