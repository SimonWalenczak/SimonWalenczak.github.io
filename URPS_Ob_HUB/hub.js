const DOORS = {
  A: {
    label: "Bloc A",
    url: "../URPS_Ob_blocA/index.html",
  },
  B: {
    label: "Bloc B",
    url: "../URPS_Ob_blocB/index.html",
  },
  C: {
    label: "Bloc C",
    url: "",
    disabledMessage: "Le bloc C n'est pas encore disponible.",
  },
};

const SPECIALTIES = [
  "Medecine generale",
  "Cardiologie",
  "Dermatologie",
  "Endocrinologie",
  "Gastro-enterologie",
  "Gynecologie",
  "Pediatrie",
  "Pneumologie",
  "Psychiatrie",
  "Rhumatologie",
  "Chirurgie",
  "Anesthesie-reanimation",
];

let selectedSpecialty = "";
let selectedGender = "";

const introPanel = document.getElementById("intro-panel");
const introForm = document.getElementById("intro-form");
const specialtySelect = document.getElementById("specialty-select");
const genderOptions = document.querySelectorAll(".gender-option");
const statusEl = document.getElementById("hub-status");
let statusTimer = null;

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

  const doorId = button.dataset.door;
  const door = DOORS[doorId];

  if (!door) return;

  if (!door.url) {
    showStatus(door.disabledMessage || `${door.label} indisponible.`);
    return;
  }

  button.classList.add("is-entering");
  showStatus(`Ouverture de ${door.label}...`);

  window.setTimeout(() => {
    window.location.href = door.url;
  }, 220);
}

document.querySelectorAll(".door-hotspot").forEach((button) => {
  button.addEventListener("click", () => openDoor(button));
});

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
