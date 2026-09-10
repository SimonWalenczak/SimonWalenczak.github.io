const HUB_PROGRESS_KEY = "urps_ob_hub_progress";
const HUB_PROGRESS_BLOC_A_COMPLETED = "blocA_completed";
const HUB_PROGRESS_BLOC_B_COMPLETED = "blocB_completed";
const HUB_RESULTS_KEY = "urps_ob_bloc_b_results";
const HUB_RESULTS_SAVED_KEY = "urps_ob_bloc_b_results_saved";
const HUB_WELCOME_SEEN_KEY = "urps_ob_hub_welcome_seen";
const HUB_BLOC_A_TRANSITION_SEEN_KEY = "urps_ob_hub_bloc_a_transition_seen";

const SPECIALTIES = [
  "Médecin généraliste",
  "Pédiatre",
  "Gynécologue",
  "Dermatologue",
  "Ophtalmologue",
  "ORL (oto-rhino-laryngologiste)",
  "Cardiologue",
  "Rhumatologue",
  "Neurologue",
  "Psychiatre",
  "Endocrinologue",
  "Gastro-entérologue",
  "Pneumologue",
  "Néphrologue",
  "Urologue",
  "Allergologue",
  "Angiologue"
];

let selectedSpecialty = "";
let selectedGender = "";

const introPanel = document.getElementById("intro-panel");
const introForm = document.getElementById("intro-form");
const specialtySelect = document.getElementById("specialty-select");
const genderOptions = document.querySelectorAll(".gender-option");
const statusEl = document.getElementById("hub-status");
const mainDoor = document.querySelector(".door-hotspot[data-door='main']");
const posterHotspots = document.querySelectorAll(".poster-hotspot");
const doorLabel = document.getElementById("door-label");
const wallResults = document.getElementById("hub-wall-results");
const resultsRadarCanvas = document.getElementById("hub-wall-radar");
const categoryOverlay = document.getElementById("hub-category-overlay");
const categoryCloseButton = document.getElementById("hub-category-close");
const categoryTitle = document.getElementById("hub-category-title");
const categoryContent = document.getElementById("hub-category-content");
const logoObesiteLink = document.getElementById("logo-obesite-link");
const hubWelcomeOverlay = document.getElementById("hub-welcome-overlay");
const hubWelcomeMessage = document.getElementById("hub-welcome-message");
const hubWelcomeHint = document.getElementById("hub-welcome-hint");
const hubWelcomePointer = document.getElementById("hub-welcome-pointer");
const hubStage = document.getElementById("hub-stage");
let statusTimer = null;
let hubResultsChart = null;
let hubResultsPayload = null;
let hasPassedWelcomeDialog = false;
let activeWelcomeDialog = null;
let isDoorPhaseDisabled = false;
let activeDoor = {
  label: "En travaux",
  url: "../URPS_Ob_blocA/index.html",
};

const HUB_CATEGORY_PALETTE = {
  plainte: { color: "#f199c9", soft: "#f9cfe4", sprite: "Sprites/Postits_sprites/Postit_pink.png" },
  mesure: { color: "#9edbd0", soft: "#d3f0ea", sprite: "Sprites/Postits_sprites/Postit_blue.png" },
  communication: { color: "#9deb99", soft: "#d6f7d4", sprite: "Sprites/Postits_sprites/Postit_green.png" },
  accompagnement: { color: "#c2a7d0", soft: "#e2d3e9", sprite: "Sprites/Postits_sprites/Postit_purple.png" },
  stigmatisation: { color: "#fbbd77", soft: "#fddcb3", sprite: "Sprites/Postits_sprites/Postit_orange.png" },
  parcours: { color: "#f2efa3", soft: "#f9f7d2", sprite: "Sprites/Postits_sprites/Postit_yellow.png" },
};

const HUB_DEFAULT_CATEGORY_PALETTE = { color: "#2563eb", soft: "#60a5fa", sprite: "Sprites/Postits_sprites/Postit_yellow.png" };

function getRadarScaleFactor() {
  const stageWidth = hubStage?.clientWidth || 1200;
  return stageWidth / 1200;
}

function populateSpecialties() {
  SPECIALTIES.forEach((specialty) => {
    const option = document.createElement("option");
    option.value = specialty;
    option.textContent = specialty;
    specialtySelect.appendChild(option);
  });
}

/** Sauvegarde le profil du praticien et ouvre le message d'accueil. */
function completeIntro() {
  selectedSpecialty = specialtySelect.value;
  sessionStorage.setItem("urps_ob_specialty", selectedSpecialty);
  sessionStorage.setItem("urps_ob_gender", selectedGender);
  introPanel.classList.add("is-hidden");
  showWelcomeDialog();
  showStatus(`Specialite : ${selectedSpecialty}`);
}

function syncIntroFromSession() {
  const savedSpecialty = sessionStorage.getItem("urps_ob_specialty") || "";
  const savedGender = sessionStorage.getItem("urps_ob_gender") || "";

  if (!savedSpecialty || !savedGender) {
    return;
  }

  selectedSpecialty = savedSpecialty;
  selectedGender = savedGender;
  specialtySelect.value = savedSpecialty;

  genderOptions.forEach((option) => {
    const isSelected = option.dataset.gender === savedGender;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });

  introPanel.classList.add("is-hidden");
  showWelcomeDialog();
}

function updateWelcomePointerPosition() {
  if (!hubWelcomePointer || !hubStage || hubWelcomePointer.classList.contains("is-hidden")) {
    return;
  }

  const doorRect = mainDoor.getBoundingClientRect();
  const stageRect = hubStage.getBoundingClientRect();
  if (!stageRect.width || !stageRect.height) {
    return;
  }

  const pointerWidth = hubWelcomePointer.offsetWidth || (stageRect.width * 0.075);
  const pointerHeight = hubWelcomePointer.offsetHeight || (stageRect.height * 0.045);
  const fallbackLeft = Math.max(0, (doorRect.left - stageRect.left) - pointerWidth - (stageRect.width * 0.02));
  const maxLeft = stageRect.width - pointerWidth;
  const pointerLeft = Math.min(Math.max(0, fallbackLeft), maxLeft);
  const pointerTop = Math.min(
    Math.max(0, (doorRect.top - stageRect.top) + (doorRect.height / 2) - (pointerHeight / 2)),
    stageRect.height - pointerHeight
  );

  const leftPct = ((pointerLeft / stageRect.width) * 100).toFixed(2);
  const topPct = ((pointerTop / stageRect.height) * 100).toFixed(2);

  hubWelcomePointer.style.setProperty("--door-pointer-left", `${leftPct}%`);
  hubWelcomePointer.style.setProperty("--door-pointer-top", `${topPct}%`);
}

function initializeHubScene() {
  window.URPS.setupAutomaticFullscreen();
  syncIntroFromSession();
  resolveDoorState();
  maybeShowHubResults();
  syncDoorLockState();

  if (!document.fullscreenEnabled) {
    showStatus("Le plein ecran n'est pas disponible sur ce navigateur.");
  }
}

function syncDoorLockState() {
  const shouldLockForWelcome = !hasPassedWelcomeDialog;
  const isDisabled = isDoorPhaseDisabled || shouldLockForWelcome;

  mainDoor.disabled = isDisabled;
  mainDoor.classList.toggle("is-disabled", isDisabled);
  mainDoor.setAttribute("aria-disabled", String(isDisabled));
  syncDoorPointer();
}

function syncDoorPointer() {
  const shouldShowPointer = Boolean(
    hubWelcomePointer
    && selectedSpecialty
    && hasPassedWelcomeDialog
    && !isDoorPhaseDisabled
    && !mainDoor.classList.contains("is-entering")
  );

  hubWelcomePointer.classList.toggle("is-hidden", !shouldShowPointer);
  if (shouldShowPointer) {
    updateWelcomePointerPosition();
  }
}

function dismissWelcomeDialog() {
  if (!hubWelcomeOverlay || hasPassedWelcomeDialog) {
    return;
  }

  hasPassedWelcomeDialog = true;
  sessionStorage.setItem(
    activeWelcomeDialog === "bloc-a-transition" ? HUB_BLOC_A_TRANSITION_SEEN_KEY : HUB_WELCOME_SEEN_KEY,
    "true"
  );
  activeWelcomeDialog = null;
  hubWelcomeOverlay.classList.add("is-hidden");
  syncDoorLockState();
}

function getWelcomeDialogType() {
  const progress = sessionStorage.getItem(HUB_PROGRESS_KEY);
  const shouldShowBlocATransition = progress === HUB_PROGRESS_BLOC_A_COMPLETED
    && sessionStorage.getItem(HUB_BLOC_A_TRANSITION_SEEN_KEY) !== "true";

  if (shouldShowBlocATransition) {
    return "bloc-a-transition";
  }

  return sessionStorage.getItem(HUB_WELCOME_SEEN_KEY) !== "true" ? "initial" : null;
}

function updateWelcomeDialogContent(dialogType) {
  if (dialogType === "bloc-a-transition") {
    hubWelcomeMessage.textContent = "Félicitations, vous avez terminé l'aménagement de votre cabinet. Préparez-vous pour votre première consultation.";
    hubWelcomeHint.textContent = "Cliquez n'importe où sur l'écran pour continuer.";
    return;
  }

  hubWelcomeMessage.textContent = "Bienvenue dans votre centre médical virtuel. Allez dans votre cabinet.";
  hubWelcomeHint.textContent = "Cliquez n'importe où sur l'écran pour continuer.";
}

function initializeWelcomeState() {
  hasPassedWelcomeDialog = !getWelcomeDialogType();
}

function showWelcomeDialog() {
  const dialogType = getWelcomeDialogType();
  if (!hubWelcomeOverlay || hasPassedWelcomeDialog || !dialogType) {
    return;
  }

  activeWelcomeDialog = dialogType;
  updateWelcomeDialogContent(dialogType);
  hubWelcomePointer.classList.add("is-hidden");
  hubWelcomeOverlay.classList.remove("is-hidden");
  syncDoorLockState();
}

/** Détermine la destination de la porte selon la progression enregistrée. */
function resolveDoorState() {
  const progress = sessionStorage.getItem(HUB_PROGRESS_KEY);
  const isBilanPhase = progress === HUB_PROGRESS_BLOC_B_COMPLETED;
  isDoorPhaseDisabled = isBilanPhase;

  if (progress === HUB_PROGRESS_BLOC_B_COMPLETED) {
    activeDoor = {
      label: "Pour plus de ressources",
      url: "../URPS_Ob_blocB/index.html",
    };
  } else if (progress === HUB_PROGRESS_BLOC_A_COMPLETED) {
    activeDoor = {
      label: "Salle de consultation",
      url: "../URPS_Ob_blocB/index.html",
    };
  } else {
    activeDoor = {
      label: "En travaux",
      url: "../URPS_Ob_blocA/index.html",
    };
  }

  doorLabel.textContent = activeDoor.label;
  mainDoor.setAttribute("aria-label", `Entrer dans ${activeDoor.label.toLowerCase()}`);
  mainDoor.classList.toggle("shows-resources-arrow", isBilanPhase);
  syncDoorLockState();

  const hasSavedResults = Boolean(sessionStorage.getItem(HUB_RESULTS_SAVED_KEY));
  const shouldShowBlocBAssets = progress === HUB_PROGRESS_BLOC_B_COMPLETED;
  posterHotspots.forEach((link) => {
    link.classList.toggle("is-locked", !shouldShowBlocBAssets);
    link.setAttribute("aria-disabled", String(!shouldShowBlocBAssets));
  });
  logoObesiteLink.classList.toggle("is-hidden", !shouldShowBlocBAssets);
  wallResults.classList.toggle("is-hidden", !shouldShowBlocBAssets || !hasSavedResults);
}

function getCategoryPalette(key) {
  return HUB_CATEGORY_PALETTE[key] || HUB_DEFAULT_CATEGORY_PALETTE;
}

function getRadarLayoutPreset() {
  const scale = getRadarScaleFactor();

  return {
    padding: 20 * scale,
    labelSize: 14 * scale,
    labelPadding: 6 * scale,
    pointRadius: 4.5 * scale,
    borderWidth: 2 * scale,
  };
}

function formatRadarLabel(label) {
  const normalized = label.replace(/\s+/g, " ").trim();
  const maxLineLength = 14;
  const tokens = normalized.split(/[\s-]+/).filter(Boolean);

  if (tokens.length <= 1) {
    return normalized;
  }

  const lines = [];
  let currentLine = "";

  tokens.forEach((token) => {
    if (token.length > maxLineLength) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }

      for (let index = 0; index < token.length; index += maxLineLength) {
        lines.push(token.slice(index, index + maxLineLength));
      }
      return;
    }

    const candidate = currentLine ? `${currentLine} ${token}` : token;
    if (candidate.length <= maxLineLength) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = token;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 1 ? lines : normalized;
}

/** Rend le radar du bilan et synchronise ses étiquettes interactives. */
function renderResultsRadar(scores) {
  if (!resultsRadarCanvas || typeof Chart === "undefined") {
    return;
  }

  const context = resultsRadarCanvas.getContext("2d");
  if (hubResultsChart) {
    hubResultsChart.destroy();
  }

  const preset = getRadarLayoutPreset();

  hubResultsChart = new Chart(context, {
    type: "radar",
    data: {
      labels: scores.map((item) => formatRadarLabel(item.label)),
      datasets: [{
        data: scores.map((item) => item.score),
        backgroundColor: "rgba(59, 130, 246, 0.14)",
        borderColor: "#60a5fa",
        borderWidth: preset.borderWidth,
        pointRadius: preset.pointRadius,
        pointHoverRadius: preset.pointRadius + 1,
        pointBackgroundColor: scores.map((item) => item.palette.color),
        pointBorderColor: scores.map((item) => item.palette.soft),
        pointBorderWidth: preset.borderWidth,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      layout: {
        padding: preset.padding,
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: "rgba(147, 197, 253, 0.5)", lineWidth: 2 },
          angleLines: { color: "rgba(96, 165, 250, 0.3)", lineWidth: 2 },
          pointLabels: {
            // Labels stay invisible; the postit buttons render the visible category titles.
            color: "rgba(0, 0, 0, 0)",
            padding: preset.labelPadding,
            font: { size: preset.labelSize, weight: "600" },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });

  renderRadarCategoryButtons(scores);
  positionRadarCategoryButtons();
}

function renderRadarCategoryButtons(scores) {
  const container = document.getElementById("hub-radar-labels");
  if (!container) {
    return;
  }

  container.innerHTML = "";
  scores.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hub-radar-category-btn";
    button.textContent = item.label;
    button.style.backgroundImage = `url("${item.palette.sprite}")`;
    button.addEventListener("click", () => renderCategoryDetails(item.key));
    container.appendChild(button);
  });
}

function positionRadarCategoryButtons() {
  const container = document.getElementById("hub-radar-labels");
  if (!container || !hubResultsChart?.scales?.r) {
    return;
  }

  const pointLabelItems = hubResultsChart.scales.r._pointLabelItems;
  if (!Array.isArray(pointLabelItems)) {
    return;
  }

  const buttons = container.querySelectorAll(".hub-radar-category-btn");
  buttons.forEach((button, index) => {
    const item = pointLabelItems[index];
    if (!item) {
      return;
    }

    const centerX = (item.left + item.right) / 2;
    const centerY = (item.top + item.bottom) / 2;
    if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
      return;
    }

    button.style.left = `${centerX}px`;
    button.style.top = `${centerY}px`;
  });
}

function refreshResultsRadarLayout() {
  if (!hubResultsPayload || !hubResultsChart) {
    return;
  }

  const preset = getRadarLayoutPreset();
  hubResultsChart.options.layout.padding = preset.padding;
  hubResultsChart.options.scales.r.pointLabels.padding = preset.labelPadding;
  hubResultsChart.options.scales.r.pointLabels.font.size = preset.labelSize;
  if (hubResultsChart.data.datasets?.[0]) {
    hubResultsChart.data.datasets[0].borderWidth = preset.borderWidth;
    hubResultsChart.data.datasets[0].pointRadius = preset.pointRadius;
    hubResultsChart.data.datasets[0].pointHoverRadius = preset.pointRadius + 1;
    hubResultsChart.data.datasets[0].pointBorderWidth = preset.borderWidth;
  }
  hubResultsChart.update("none");
  positionRadarCategoryButtons();
}

/** Ouvre le détail pédagogique d'une catégorie du bilan. */
function renderCategoryDetails(categoryKey) {
  if (!hubResultsPayload) {
    return;
  }

  const score = hubResultsPayload.scores.find((item) => item.key === categoryKey);
  const details = hubResultsPayload.details[categoryKey] || [];
  const palette = score ? score.palette : getCategoryPalette(categoryKey);

  categoryTitle.textContent = score ? score.label : "Detail categorie";

  if (!details.length) {
    categoryContent.innerHTML = `<p class="hub-results-empty">Aucune réponse enregistrée pour cette catégorie.</p>`;
    categoryOverlay?.classList.remove("is-hidden");
    return;
  }

  categoryContent.innerHTML = details.map((detail) => `
    <article class="hub-results-detail-card" style="--cat-color:${palette.color}; --cat-color-soft:${palette.soft};">
      <p class="hub-results-detail-answer">Réponse : ${detail.answer}</p>
      <h3 class="hub-results-detail-title">${detail.feedbackTitle}</h3>
      <p class="hub-results-detail-feedback">${detail.feedback}</p>
    </article>
  `).join("");

  categoryOverlay?.classList.remove("is-hidden");
}

function closeCategoryOverlay() {
  categoryOverlay?.classList.add("is-hidden");
}

/** Restaure le dernier bilan disponible depuis la session courante. */
function maybeShowHubResults() {
  const raw = sessionStorage.getItem(HUB_RESULTS_KEY);
  const savedRaw = sessionStorage.getItem(HUB_RESULTS_SAVED_KEY);
  const source = raw || savedRaw;
  if (!source) {
    return;
  }

  try {
    const parsed = JSON.parse(source);
    if (!parsed || !Array.isArray(parsed.scores) || !parsed.scores.length) {
      sessionStorage.removeItem(HUB_RESULTS_KEY);
      sessionStorage.removeItem(HUB_RESULTS_SAVED_KEY);
      return;
    }

    hubResultsPayload = {
      scores: parsed.scores.map((item) => ({
        ...item,
        palette: getCategoryPalette(item.key),
      })),
      details: parsed.details || {},
    };

    sessionStorage.removeItem(HUB_RESULTS_KEY);
    if (raw || savedRaw) {
      sessionStorage.setItem(HUB_RESULTS_SAVED_KEY, JSON.stringify(parsed));
    }
    wallResults.classList.remove("is-hidden");
    renderResultsRadar(hubResultsPayload.scores);
  } catch {
    sessionStorage.removeItem(HUB_RESULTS_KEY);
    sessionStorage.removeItem(HUB_RESULTS_SAVED_KEY);
  }
}

function selectGender(button) {
  selectedGender = button.dataset.gender;

  genderOptions.forEach((option) => {
    const isSelected = option === button;
    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });
}

function showStatus(message) {
  statusEl.textContent = message;
  statusEl.classList.add("is-visible");

  window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    statusEl.classList.remove("is-visible");
  }, 2200);
}

/** Navigue vers une scène en respectant le mode d'intégration actif. */
function navigateToScene(scene) {
  const routes = {
    hub: "../URPS_Ob_HUB/index.html",
    blocA: "../URPS_Ob_blocA/index.html",
    blocB: "../URPS_Ob_blocB/index.html",
  };

  window.URPS.navigate(scene, routes);
}

/** Vérifie les prérequis puis lance la transition vers le bloc actif. */
function openDoor(button) {
  if (!hasPassedWelcomeDialog) {
    showStatus("Cliquez d'abord sur l'ecran pour fermer le message de bienvenue.");
    return;
  }

  if (button.disabled) {
    showStatus("Acces Bloc B desactive pendant la phase bilan.");
    return;
  }

  if (!selectedSpecialty) {
    showStatus("Selectionnez votre specialite avant de continuer.");
    return;
  }

  button.classList.add("is-entering");
  syncDoorPointer();
  showStatus(`Ouverture de ${activeDoor.label}...`);

  window.setTimeout(() => {
    const nextScene = activeDoor.url.includes("blocB") ? "blocB" : "blocA";
    navigateToScene(nextScene);
  }, 220);
}

mainDoor.addEventListener("click", () => openDoor(mainDoor));
hubWelcomeOverlay?.addEventListener("click", dismissWelcomeDialog);

genderOptions.forEach((button) => {
  button.addEventListener("click", () => selectGender(button));
});

introForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!specialtySelect.value) {
    specialtySelect.focus();
    return;
  }

  if (!selectedGender) {
    showStatus("Selectionnez une option avant de continuer.");
    genderOptions[0].focus();
    return;
  }

  completeIntro();
});

populateSpecialties();
initializeWelcomeState();
categoryCloseButton?.addEventListener("click", closeCategoryOverlay);
categoryOverlay?.addEventListener("click", (event) => {
  if (event.target === categoryOverlay) {
    closeCategoryOverlay();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && categoryOverlay && !categoryOverlay.classList.contains("is-hidden")) {
    closeCategoryOverlay();
  }
});
window.addEventListener("resize", refreshResultsRadarLayout);
window.addEventListener("resize", updateWelcomePointerPosition);

if (typeof ResizeObserver !== "undefined" && hubStage) {
  const stageResizeObserver = new ResizeObserver(() => {
    refreshResultsRadarLayout();
    updateWelcomePointerPosition();
  });
  stageResizeObserver.observe(hubStage);
}

initializeHubScene();
