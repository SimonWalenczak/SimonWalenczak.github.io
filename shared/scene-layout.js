(() => {
  const embedded = window.parent !== window;
  document.documentElement.classList.toggle("urps-embedded", embedded);
  if (embedded) return;
  const stage = document.querySelector(".urps-stage");
  const gate = document.createElement("section");
  gate.className = "orientation-gate";
  gate.hidden = true;
  gate.setAttribute("role", "status");
  gate.textContent = "Tournez votre appareil en paysage pour continuer. Votre progression est conservée.";
  document.body.appendChild(gate);
  const portrait = window.matchMedia("(orientation: portrait)");
  function update() {
    // Do not mistake the on-screen keyboard for a change of orientation.
    const touchDevice = navigator.maxTouchPoints > 0 && window.matchMedia("(any-pointer: coarse)").matches;
    const blocked = touchDevice && portrait.matches;
    gate.hidden = !blocked;
    stage.inert = blocked;
  }
  portrait.addEventListener("change", update);
  window.addEventListener("pageshow", update);
  update();
})();
