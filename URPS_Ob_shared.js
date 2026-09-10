/*
 * Utilitaires communs aux scènes URPS Ob.
 * Le projet utilise des scripts classiques, ce namespace évite donc de
 * dupliquer les mêmes helpers dans chaque page sans imposer de build step.
 */
(function createUrpsSharedUtilities(global) {
  const URPS = global.URPS || {};

  /** Résout un chemin relatif en tenant compte du mode mono-page. */
  URPS.resolveAssetPath = function resolveAssetPath(baseDir, assetPath) {
    if (!baseDir || /^(?:[a-z]+:)?\/\//i.test(assetPath) || assetPath.startsWith("/")) {
      return assetPath;
    }

    return `${baseDir}/${assetPath}`;
  };

  /** Demande le plein écran après une interaction utilisateur. */
  URPS.requestFullscreen = function requestFullscreen() {
    const root = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      return;
    }

    try {
      if (root.requestFullscreen) {
        root.requestFullscreen().catch(() => {});
      } else if (root.webkitRequestFullscreen) {
        root.webkitRequestFullscreen();
      } else if (root.msRequestFullscreen) {
        root.msRequestFullscreen();
      }
    } catch {
      // Le navigateur peut refuser le plein écran hors interaction utilisateur.
    }
  };

  /** Installe une seule fois les événements qui autorisent le plein écran. */
  URPS.setupAutomaticFullscreen = function setupAutomaticFullscreen() {
    if (URPS.fullscreenListenersInstalled) {
      return;
    }

    const tryOnInteraction = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        URPS.requestFullscreen();
      }
    };

    window.addEventListener("click", tryOnInteraction, { passive: true });
    window.addEventListener("touchend", tryOnInteraction, { passive: true });
    window.addEventListener("pointerup", tryOnInteraction, { passive: true });
    window.addEventListener("keydown", tryOnInteraction);
    URPS.fullscreenListenersInstalled = true;
  };

  /** Navigue via le routeur intégré, le mode mono-page ou une URL classique. */
  URPS.navigate = function navigate(scene, routes) {
    const router = global.URPS_ROUTER;
    const isSinglePageMode = sessionStorage.getItem("urps_ob_single_page") === "true";

    if (router && typeof router.navigate === "function") {
      router.navigate(scene);
      return;
    }

    if (isSinglePageMode && global.parent && global.parent !== global) {
      global.parent.postMessage({ type: "urps:navigate", scene }, global.location.origin);
      return;
    }

    global.location.href = routes[scene] || routes.hub;
  };

  global.URPS = URPS;
}(window));