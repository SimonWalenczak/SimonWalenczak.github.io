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
let hubRadarLabelHitboxes = [];
let hasPassedWelcomeDialog = false;
let activeWelcomeDialog = null;
let isDoorPhaseDisabled = false;
let activeDoor = {
  label: "En travaux",
  url: "../URPS_Ob_blocA/index.html",
};

const HUB_BLUE_PALETTE = [
  { color: "#2563eb", soft: "#60a5fa" },
  { color: "#0ea5e9", soft: "#7dd3fc" },
  { color: "#1d4ed8", soft: "#93c5fd" },
  { color: "#3b82f6", soft: "#bfdbfe" },
  { color: "#0284c7", soft: "#38bdf8" },
  { color: "#1e40af", soft: "#93c5fd" },
];

function getRadarScaleFactor() {
  const stageWidth = hubStage?.clientWidth || 1200;
  return stageWidth / 1200;
}

function getRadarLabelBgPadding() {
  const scale = getRadarScaleFactor();
  return 5 * scale;
}

const radarLabelBackgroundPlugin = {
  id: "radarLabelBackground",
  beforeDraw(chart) {
    const pointLabelItems = chart.scales?.r?._pointLabelItems;
    if (!Array.isArray(pointLabelItems)) {
      return;
    }

    const { ctx } = chart;
    const labelBgPadding = getRadarLabelBgPadding();
    const scale = getRadarScaleFactor();
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = "rgba(147, 197, 253, 0.68)";
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));

    pointLabelItems.forEach((item) => {
      const left = item.left;
      const top = item.top;
      const width = item.right - item.left;
      const height = item.bottom - item.top;
      if (![left, top, width, height].every(Number.isFinite)) {
        return;
      }

      const x = left - labelBgPadding;
      const y = top - labelBgPadding;
      const backgroundWidth = width + (labelBgPadding * 2);
      const backgroundHeight = height + (labelBgPadding * 2);

      ctx.beginPath();
      ctx.roundRect(x, y, backgroundWidth, backgroundHeight, Math.max(2, Math.round(4 * scale)));
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  },
  afterDraw(chart) {
    const pointLabelItems = chart.scales?.r?._pointLabelItems;
    if (!Array.isArray(pointLabelItems)) {
      return;
    }

    const { ctx } = chart;
    const labelBgPadding = getRadarLabelBgPadding();
    const scale = getRadarScaleFactor();

    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = Math.max(2, Math.round(2 * scale));

    pointLabelItems.forEach((item) => {
      const left = item.left;
      const top = item.top;
      const width = item.right - item.left;
      const height = item.bottom - item.top;
      if (![left, top, width, height].every(Number.isFinite)) {
        return;
      }

      const x = left - labelBgPadding;
      const y = top - labelBgPadding;
      const backgroundWidth = width + (labelBgPadding * 2);
      const backgroundHeight = height + (labelBgPadding * 2);

      // Zone active de détection du clic (hitbox du bouton)
      /*ctx.fillStyle = "rgba(250, 204, 21, 0.3)";
      ctx.strokeStyle = "#facc15";
      ctx.beginPath();
      ctx.roundRect(x, y, backgroundWidth, backgroundHeight, Math.max(3, Math.round(5 * scale)));
      ctx.fill();
      ctx.stroke();

      // Repères visuels aux 4 coins de la zone cliquable
      ctx.fillStyle = "#facc15";
      const cornerSize = Math.max(3, Math.round(4 * scale));
      ctx.fillRect(x, y, cornerSize, cornerSize);
      ctx.fillRect(x + backgroundWidth - cornerSize, y, cornerSize, cornerSize);
      ctx.fillRect(x, y + backgroundHeight - cornerSize, cornerSize, cornerSize);
      ctx.fillRect(x + backgroundWidth - cornerSize, y + backgroundHeight - cornerSize, cornerSize, cornerSize);*/
    });

    ctx.restore();
  },
};

function populateSpecialties() {
  SPECIALTIES.forEach((specialty) => {
    const option = document.createElement("option");
    option.value = specialty;
    option.textContent = specialty;
    specialtySelect.appendChild(option);
  });
}

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

async function requestFullscreen() {
  const root = document.documentElement;

  if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
    return;
  }

  try {
    if (root.requestFullscreen) {
      await root.requestFullscreen();
    } else if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
    } else if (root.msRequestFullscreen) {
      root.msRequestFullscreen();
    }
  } catch {
    // Browsers may reject autoplay fullscreen until a user interaction.
  }
}

function setupAutomaticFullscreen() {
  const tryOnInteraction = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      return;
    }

    requestFullscreen();
  };

  window.addEventListener("click", tryOnInteraction, { passive: true });
  window.addEventListener("touchend", tryOnInteraction, { passive: true });
  window.addEventListener("pointerup", tryOnInteraction, { passive: true });
  window.addEventListener("keydown", tryOnInteraction);
}

function initializeHubScene() {
  setupAutomaticFullscreen();
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

function hexToRgba(hex, alpha) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((part) => part + part).join("")
    : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getCategoryPalette(index) {
  return HUB_BLUE_PALETTE[index % HUB_BLUE_PALETTE.length];
}

function getRadarLayoutPreset() {
  const scale = getRadarScaleFactor();

  return {
    padding: 20 * scale,
    labelSize: 11 * scale,
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
    plugins: [radarLabelBackgroundPlugin],
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
      onClick: (event) => {
        const categoryKey = getCategoryKeyFromRadarLabelClick(event);
        if (categoryKey) {
          renderCategoryDetails(categoryKey);
        }
      },
      onHover: (event) => {
        if (!resultsRadarCanvas) {
          return;
        }

        const categoryKey = getCategoryKeyFromRadarLabelClick(event);
        resultsRadarCanvas.style.cursor = categoryKey ? "pointer" : "default";
      },
      layout: {
        padding: preset.padding,
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: "rgba(147, 197, 253, 0.22)" },
          angleLines: { color: "rgba(96, 165, 250, 0.18)" },
          pointLabels: {
            color: "#dbeafe",
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

  refreshRadarLabelHitboxes();
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
  refreshRadarLabelHitboxes();
}

function refreshRadarLabelHitboxes() {
  hubRadarLabelHitboxes = [];

  if (!hubResultsChart?.scales?.r) {
    return;
  }

  const pointLabelItems = hubResultsChart.scales.r._pointLabelItems;
  if (!Array.isArray(pointLabelItems)) {
    return;
  }

  const labelBgPadding = getRadarLabelBgPadding();

  hubRadarLabelHitboxes = pointLabelItems
    .map((item, index) => {
      const { left, right, top, bottom } = item;

      return {
        index,
        left: left - labelBgPadding,
        right: right + labelBgPadding,
        top: top - labelBgPadding,
        bottom: bottom + labelBgPadding,
      };
    })
    .filter((box) => [box.left, box.right, box.top, box.bottom].every(Number.isFinite));
}

function getCategoryKeyFromRadarLabelClick(event) {
  const nativeEvent = event?.native;
  if (!nativeEvent || !hubResultsPayload?.scores?.length || !hubRadarLabelHitboxes.length) {
    return null;
  }

  const x = nativeEvent.offsetX ?? nativeEvent.x;
  const y = nativeEvent.offsetY ?? nativeEvent.y;
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  const hitbox = hubRadarLabelHitboxes.find((box) => x >= box.left && x <= box.right && y >= box.top && y <= box.bottom);
  if (!hitbox) {
    return null;
  }

  return hubResultsPayload.scores[hitbox.index]?.key || null;
}

function renderCategoryDetails(categoryKey) {
  if (!hubResultsPayload) {
    return;
  }

  const score = hubResultsPayload.scores.find((item) => item.key === categoryKey);
  const details = hubResultsPayload.details[categoryKey] || [];
  const palette = score ? score.palette : getCategoryPalette(0);

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

function renderResultsCategories() {
  // Details are opened only via radar category label clicks.
}

function closeCategoryOverlay() {
  categoryOverlay?.classList.add("is-hidden");
}

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
      scores: parsed.scores.map((item, index) => ({
        ...item,
        palette: getCategoryPalette(index),
      })),
      details: parsed.details || {},
    };

    sessionStorage.removeItem(HUB_RESULTS_KEY);
    if (raw || savedRaw) {
      sessionStorage.setItem(HUB_RESULTS_SAVED_KEY, JSON.stringify(parsed));
    }
    wallResults.classList.remove("is-hidden");
    renderResultsRadar(hubResultsPayload.scores);
    renderResultsCategories();
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

function navigateToScene(scene) {
  const router = window.URPS_ROUTER;
  const isSinglePageMode = sessionStorage.getItem("urps_ob_single_page") === "true";
  const routes = {
    hub: "../URPS_Ob_HUB/index.html",
    blocA: "../URPS_Ob_blocA/index.html",
    blocB: "../URPS_Ob_blocB/index.html",
  };

  if (router && typeof router.navigate === "function") {
    router.navigate(scene);
    return;
  }

  if (isSinglePageMode && window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "urps:navigate", scene }, window.location.origin);
    return;
  }

  window.location.href = routes[scene] || routes.hub;
}

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
