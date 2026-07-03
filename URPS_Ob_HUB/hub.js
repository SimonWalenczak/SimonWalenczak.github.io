const HUB_PROGRESS_KEY = "urps_ob_hub_progress";
const HUB_PROGRESS_BLOC_A_COMPLETED = "blocA_completed";
const HUB_PROGRESS_BLOC_B_COMPLETED = "blocB_completed";
const HUB_RESULTS_KEY = "urps_ob_bloc_b_results";
const HUB_RESULTS_SAVED_KEY = "urps_ob_bloc_b_results_saved";

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
const doorLabel = document.getElementById("door-label");
const resultsOverlay = document.getElementById("hub-results-overlay");
const resultsCloseButton = document.getElementById("hub-results-close");
const resultsReopenButton = document.getElementById("hub-results-reopen");
const resultsCategories = document.getElementById("hub-results-categories");
const resultsCategoryDetails = document.getElementById("hub-results-category-details");
const resultsRadarCanvas = document.getElementById("hub-results-radar");
const logoObesiteLink = document.getElementById("logo-obesite-link");
let statusTimer = null;
let hubResultsChart = null;
let hubResultsPayload = null;
let selectedResultsCategory = "";
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
}

function resolveDoorState() {
  const progress = sessionStorage.getItem(HUB_PROGRESS_KEY);

  if (progress === HUB_PROGRESS_BLOC_A_COMPLETED || progress === HUB_PROGRESS_BLOC_B_COMPLETED) {
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

  const hasSavedResults = Boolean(sessionStorage.getItem(HUB_RESULTS_SAVED_KEY));
  const shouldShowBlocBAssets = progress === HUB_PROGRESS_BLOC_B_COMPLETED;
  logoObesiteLink.classList.toggle("is-hidden", !shouldShowBlocBAssets);
  resultsReopenButton.classList.toggle("is-hidden", !shouldShowBlocBAssets || !hasSavedResults);
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

function renderResultsRadar(scores) {
  if (!resultsRadarCanvas || typeof Chart === "undefined") {
    return;
  }

  const context = resultsRadarCanvas.getContext("2d");
  if (hubResultsChart) {
    hubResultsChart.destroy();
  }

  hubResultsChart = new Chart(context, {
    type: "radar",
    data: {
      labels: scores.map((item) => item.label),
      datasets: [{
        data: scores.map((item) => item.score),
        backgroundColor: "rgba(59, 130, 246, 0.14)",
        borderColor: "#60a5fa",
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 6,
        pointBackgroundColor: scores.map((item) => item.palette.color),
        pointBorderColor: scores.map((item) => item.palette.soft),
        pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false },
          grid: { color: "rgba(147, 197, 253, 0.22)" },
          angleLines: { color: "rgba(96, 165, 250, 0.18)" },
          pointLabels: {
            color: "#dbeafe",
            font: { size: 12, weight: "600" },
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });
}

function renderCategoryDetails(categoryKey) {
  if (!hubResultsPayload) {
    return;
  }

  const score = hubResultsPayload.scores.find((item) => item.key === categoryKey);
  const details = hubResultsPayload.details[categoryKey] || [];
  const palette = score ? score.palette : getCategoryPalette(0);

  if (!details.length) {
    resultsCategoryDetails.innerHTML = `<p class="hub-results-empty">Aucune réponse enregistrée pour cette catégorie.</p>`;
    return;
  }

  resultsCategoryDetails.innerHTML = details.map((detail) => `
    <article class="hub-results-detail-card" style="--cat-color:${palette.color}; --cat-color-soft:${palette.soft};">
      <p class="hub-results-detail-answer">Réponse : ${detail.answer}</p>
      <h3 class="hub-results-detail-title">${detail.feedbackTitle}</h3>
      <p class="hub-results-detail-feedback">${detail.feedback}</p>
    </article>
  `).join("");
}

function renderResultsCategories() {
  if (!hubResultsPayload) {
    return;
  }

  resultsCategories.innerHTML = "";

  hubResultsPayload.scores.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hub-results-category-btn" + (item.key === selectedResultsCategory ? " is-active" : "");
    button.style.setProperty("--cat-color", item.palette.color);
    button.style.setProperty("--cat-color-soft", item.palette.soft);
    button.style.setProperty("--cat-bg", hexToRgba(item.palette.color, 0.16));
    button.innerHTML = `
      <div class="hub-results-category-top">
        <span class="hub-results-category-label">${item.label}</span>
      </div>
      <div class="hub-results-category-bar">
        <div class="hub-results-category-bar-fill" style="--score-width:${item.score}%;"></div>
      </div>
      <p class="hub-results-category-description">${item.description}</p>
    `;

    button.addEventListener("click", () => {
      selectedResultsCategory = item.key;
      renderResultsCategories();
      renderCategoryDetails(item.key);
    });

    resultsCategories.appendChild(button);
  });
}

function closeResultsOverlay() {
  resultsOverlay.classList.add("is-hidden");
}

function openResultsOverlay() {
  if (!hubResultsPayload) {
    return;
  }

  renderResultsRadar(hubResultsPayload.scores);
  renderResultsCategories();
  renderCategoryDetails(selectedResultsCategory);
  resultsOverlay.classList.remove("is-hidden");
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
    sessionStorage.setItem(HUB_RESULTS_SAVED_KEY, JSON.stringify(parsed));
    selectedResultsCategory = hubResultsPayload.scores[0].key;
    resultsReopenButton.classList.remove("is-hidden");

    if (raw) {
      openResultsOverlay();
    }
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

function openDoor(button) {
  if (!selectedSpecialty) {
    showStatus("Selectionnez votre specialite avant de continuer.");
    return;
  }

  button.classList.add("is-entering");
  showStatus(`Ouverture de ${activeDoor.label}...`);

  window.setTimeout(() => {
    window.location.href = activeDoor.url;
  }, 220);
}

mainDoor.addEventListener("click", () => openDoor(mainDoor));

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
    showStatus("Selectionnez homme ou femme avant de continuer.");
    genderOptions[0].focus();
    return;
  }

  completeIntro();
});

populateSpecialties();
syncIntroFromSession();
resolveDoorState();
maybeShowHubResults();
resultsCloseButton.addEventListener("click", closeResultsOverlay);
resultsReopenButton.addEventListener("click", openResultsOverlay);
