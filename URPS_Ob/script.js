/* =====================================================
   URPS_Ob — Visual Novel Engine
   Loads scenario from scenario.json
   ===================================================== */

// ======================================================
// SVG ASSETS — inline SVG for backgrounds and characters
// ======================================================

const SVG_BACKGROUNDS = {
  cabinet: `<img src="Cabinet_Medical.svg" style="width:100%;height:100%;object-fit:cover;display:block;" alt=""/>`
};

const SVG_CHARACTERS = {
  patient: `<svg viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <!-- Shadow -->
    <ellipse cx="100" cy="490" rx="55" ry="10" fill="rgba(0,0,0,0.18)"/>
    <!-- Legs -->
    <rect x="72" y="340" width="24" height="140" rx="10" fill="#4a5568"/>
    <rect x="104" y="340" width="24" height="140" rx="10" fill="#4a5568"/>
    <!-- Shoes -->
    <ellipse cx="84" cy="478" rx="20" ry="10" fill="#2d3748"/>
    <ellipse cx="116" cy="478" rx="20" ry="10" fill="#2d3748"/>
    <!-- Body -->
    <ellipse cx="100" cy="270" rx="52" ry="80" fill="#e8a87c"/>
    <!-- Top / blouse -->
    <rect x="52" y="220" width="96" height="140" rx="14" fill="#7c3aed" opacity=".9"/>
    <!-- Collar detail -->
    <path d="M100 220 L86 246 L100 240 L114 246 Z" fill="#6d28d9"/>
    <!-- Arms -->
    <rect x="18" y="218" width="36" height="90" rx="16" fill="#7c3aed" opacity=".85"/>
    <rect x="146" y="218" width="36" height="90" rx="16" fill="#7c3aed" opacity=".85"/>
    <!-- Hands -->
    <ellipse cx="36" cy="310" rx="16" ry="20" fill="#e8a87c"/>
    <ellipse cx="164" cy="310" rx="16" ry="20" fill="#e8a87c"/>
    <!-- Neck -->
    <rect x="86" y="155" width="28" height="40" rx="10" fill="#e8a87c"/>
    <!-- Head -->
    <ellipse cx="100" cy="136" rx="52" ry="58" fill="#e8a87c"/>
    <!-- Hair -->
    <ellipse cx="100" cy="95"  rx="52" ry="44" fill="#5a3825"/>
    <rect x="48"  y="90"  width="18" height="60" rx="9"  fill="#5a3825"/>
    <rect x="134" y="90"  width="18" height="60" rx="9"  fill="#5a3825"/>
    <!-- Eyes -->
    <ellipse cx="82"  cy="138" rx="8" ry="9" fill="white"/>
    <ellipse cx="118" cy="138" rx="8" ry="9" fill="white"/>
    <ellipse cx="83"  cy="140" rx="5" ry="5" fill="#3d2314"/>
    <ellipse cx="119" cy="140" rx="5" ry="5" fill="#3d2314"/>
    <ellipse cx="84"  cy="139" rx="2" ry="2" fill="white"/>
    <ellipse cx="120" cy="139" rx="2" ry="2" fill="white"/>
    <!-- Eyebrows -->
    <path d="M74 126 Q82 121 90 126" stroke="#5a3825" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M110 126 Q118 121 126 126" stroke="#5a3825" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Nose -->
    <path d="M96 148 Q100 158 104 148" stroke="#c08060" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <!-- Mouth neutral -->
    <path d="M88 164 Q100 170 112 164" stroke="#c07050" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- Earrings -->
    <circle cx="48"  cy="155" r="5" fill="#f59e0b"/>
    <circle cx="152" cy="155" r="5" fill="#f59e0b"/>
    <!-- Bag -->
    <rect x="145" y="295" width="40" height="50" rx="8" fill="#b45309" opacity=".7"/>
    <path d="M155 295 Q165 278 175 295" stroke="#92400e" stroke-width="3" fill="none"/>
  </svg>`,

  doctor: `<svg viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" fill="none">
    <!-- Shadow -->
    <ellipse cx="100" cy="490" rx="55" ry="10" fill="rgba(0,0,0,0.18)"/>
    <!-- Legs -->
    <rect x="72"  y="340" width="24" height="140" rx="10" fill="#374151"/>
    <rect x="104" y="340" width="24" height="140" rx="10" fill="#374151"/>
    <!-- Shoes -->
    <ellipse cx="84"  cy="478" rx="20" ry="10" fill="#1f2937"/>
    <ellipse cx="116" cy="478" rx="20" ry="10" fill="#1f2937"/>
    <!-- White coat body -->
    <rect x="50" y="215" width="100" height="145" rx="14" fill="#f1f5f9"/>
    <!-- Shirt under coat -->
    <rect x="82" y="216" width="36" height="80" fill="#bfdbfe"/>
    <!-- Tie -->
    <polygon points="96,220 104,220 108,270 100,276 92,270" fill="#1d4ed8" opacity=".8"/>
    <!-- Coat lapels -->
    <path d="M100 216 L72 250 L88 250 Z" fill="#e2e8f0"/>
    <path d="M100 216 L128 250 L112 250 Z" fill="#e2e8f0"/>
    <!-- White coat arms -->
    <rect x="14" y="215" width="38" height="95" rx="16" fill="#f1f5f9"/>
    <rect x="148" y="215" width="38" height="95" rx="16" fill="#f1f5f9"/>
    <!-- Hands -->
    <ellipse cx="33"  cy="313" rx="16" ry="20" fill="#d4a888"/>
    <ellipse cx="167" cy="313" rx="16" ry="20" fill="#d4a888"/>
    <!-- Stethoscope -->
    <path d="M72 240 Q56 280 52 310 Q50 330 64 338" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M128 240 Q144 280 148 310 Q150 330 136 338" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" fill="none"/>
    <circle cx="100" cy="338" r="12" fill="#64748b"/>
    <!-- Pocket + pen -->
    <rect x="128" y="270" width="20" height="25" rx="3" fill="#e2e8f0"/>
    <line x1="134" y1="258" x2="133" y2="270" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="140" y1="256" x2="139" y2="270" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Neck -->
    <rect x="86" y="155" width="28" height="42" rx="10" fill="#d4a888"/>
    <!-- Head -->
    <ellipse cx="100" cy="136" rx="52" ry="58" fill="#d4a888"/>
    <!-- Hair short -->
    <ellipse cx="100" cy="88"  rx="52" ry="38" fill="#2d2116"/>
    <rect x="48"  y="85"  width="14" height="40" rx="7" fill="#2d2116"/>
    <rect x="138" y="85"  width="14" height="40" rx="7" fill="#2d2116"/>
    <!-- Glasses -->
    <rect x="68"  y="132" width="24" height="18" rx="6" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <rect x="108" y="132" width="24" height="18" rx="6" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <line x1="92" y1="141" x2="108" y2="141" stroke="#94a3b8" stroke-width="2"/>
    <line x1="48" y1="141" x2="68"  y2="141" stroke="#94a3b8" stroke-width="2"/>
    <line x1="132" y1="141" x2="152" y2="141" stroke="#94a3b8" stroke-width="2"/>
    <!-- Eyes -->
    <ellipse cx="80"  cy="141" rx="6" ry="6" fill="white"/>
    <ellipse cx="120" cy="141" rx="6" ry="6" fill="white"/>
    <ellipse cx="81"  cy="142" rx="3.5" ry="3.5" fill="#2d3748"/>
    <ellipse cx="121" cy="142" rx="3.5" ry="3.5" fill="#2d3748"/>
    <!-- Eyebrows -->
    <path d="M72 126 Q80 122 88 127" stroke="#2d2116" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M112 127 Q120 122 128 126" stroke="#2d2116" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Nose -->
    <path d="M96 150 Q100 160 104 150" stroke="#b08060" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <!-- Mouth -->
    <path d="M88 166 Q100 173 112 166" stroke="#a07050" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </svg>`,
};

// Emotion mouth paths for patient (swap mouth for emotion variety)
// (slight enhancement - apply class on char el instead for simplicity)

// ======================================================
// STATE
// ======================================================

let scenario = null;
let flatSteps = []; // all steps in order
let stepIndex = 0;
let answers   = {};
let openFeedback = {};
let selectedCategory = null;
let radarChart = null;
let pendingAnswer = null; // current selected option value

// ======================================================
// DOM REFS
// ======================================================

const screenTitle   = document.getElementById("screen-title");
const screenGame    = document.getElementById("screen-game");
const screenResults = document.getElementById("screen-results");
const menuOverlay   = document.getElementById("menu-overlay");

const btnTitleStart = document.getElementById("btn-title-start");
const btnMenu       = document.getElementById("btn-menu");
const btnRestart    = document.getElementById("btn-restart");
const menuResume    = document.getElementById("menu-resume");
const menuRestart   = document.getElementById("menu-restart");

const hudSceneLabel   = document.getElementById("hud-scene-label");
const hudProgressFill = document.getElementById("hud-progress-fill");
const hudProgressText = document.getElementById("hud-progress-text");

const vnBg          = document.getElementById("vn-bg");
const charPatient   = document.getElementById("char-patient");
const charDoctor    = document.getElementById("char-doctor");
const vnThought     = document.getElementById("vn-thought");

const vnDialog      = document.getElementById("vn-dialog");
const dialogSpeaker = document.getElementById("dialog-speaker");
const dialogText    = document.getElementById("dialog-text");
const dialogNext    = document.getElementById("dialog-next");

const vnNarration   = document.getElementById("vn-narration");
const narrationText = document.getElementById("narration-text");
const narrationNext = document.getElementById("narration-next");

const vnQuestionOverlay = document.getElementById("vn-question-overlay");
const vqBadge           = document.getElementById("vq-badge");
const vqInternal        = document.getElementById("vq-internal");
const vqQuestion        = document.getElementById("vq-question");
const vqOptions         = document.getElementById("vq-options");
const vqScaleLabels     = document.getElementById("vq-scale-labels");
const vqConfirm         = document.getElementById("vq-confirm");

// ======================================================
// SCENARIO EMBEDDED — fallback when fetch is unavailable
// Edit scenario.json to change the content; this mirrors it.
// ======================================================

const SCENARIO_EMBEDDED = {"title":"Bloc B — Consultation contextualisée","subtitle":"Une simulation de consultation médicale","scenes":[{"id":"intro","background":"cabinet","steps":[{"type":"narration","text":"Vous êtes médecin généraliste. Mme Martin, 48 ans, vient vous consulter pour une douleur à la cheville suite à une entorse récente."},{"type":"narration","text":"Cette consultation va vous amener à réfléchir à votre posture professionnelle vis-à-vis des patients en situation d'obésité."},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"Bonjour. J'ai très mal à la cheville depuis quelques jours.","emotion":"neutral"},{"type":"question","id":"plainte-fonctionnelle","category":"plainte","internal":true,"text":"Face à une plainte fonctionnelle, j'évalue si la perte de poids est réellement pertinente pour améliorer la situation du patient.","responseKind":"agreement5","feedbackTitle":"Évaluer la pertinence médicale","feedback":"L'objectif est de déterminer si le poids est réellement pertinent dans la situation clinique, sans présumer qu'il explique automatiquement la plainte exprimée.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"question","id":"aborder-poids-plainte","category":"plainte","internal":true,"reverseScore":true,"text":"Face à une plainte fonctionnelle, j'en profite pour aborder la problématique pondérale.","responseKind":"agreement5","feedbackTitle":"Choisir le bon moment","feedback":"Le poids ne devrait pas être abordé automatiquement dès qu'une plainte fonctionnelle est exprimée.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"J'ai besoin de connaître votre poids afin d'évaluer certains facteurs pouvant influencer votre prise en charge.","emotion":"neutral"},{"type":"question","id":"mesure-poids-consentement","category":"mesure","internal":false,"text":"Lorsque la mesure du poids est nécessaire médicalement, je demande systématiquement le consentement du patient avant de procéder.","responseKind":"urpsFrequency","feedbackTitle":"Consentement à la mesure du poids","feedback":"Demander le consentement avant de mesurer le poids respecte l'autonomie du patient.","options":[{"value":"oui_toujours","label":"Oui, toujours","score":5,"max":5},{"value":"oui_parfois","label":"Oui, parfois","score":3,"max":5},{"value":"non_envisage","label":"Non mais je pourrais l'envisager","score":1,"max":5}]},{"type":"question","id":"mesure-poids-explication","category":"mesure","internal":false,"text":"Lorsque la mesure du poids est nécessaire, je lui explique clairement les raisons médicales.","responseKind":"urpsFrequency","feedbackTitle":"Expliciter l'objectif médical","feedback":"Expliquer l'objectif médical aide à clarifier la démarche.","options":[{"value":"oui_toujours","label":"Oui, toujours","score":5,"max":5},{"value":"oui_parfois","label":"Oui, parfois","score":3,"max":5},{"value":"non_envisage","label":"Non mais je pourrais l'envisager","score":1,"max":5}]},{"type":"question","id":"se-peser-soi-meme","category":"mesure","internal":false,"text":"Lorsque cela est compatible avec l'objectif médical, je propose au patient de se peser lui-même.","responseKind":"urpsFrequency","feedbackTitle":"Autonomie lors de la mesure","feedback":"Proposer au patient de se peser lui-même peut préserver le confort et le sentiment de contrôle.","options":[{"value":"oui_toujours","label":"Oui, toujours","score":5,"max":5},{"value":"oui_parfois","label":"Oui, parfois","score":3,"max":5},{"value":"non_envisage","label":"Non mais je pourrais l'envisager","score":1,"max":5}]}]},{"id":"discussion-poids","background":"cabinet","steps":[{"type":"narration","text":"La consultation se poursuit. Vous décidez d'aborder le sujet du poids avec Mme Martin."},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"J'aimerais que nous parlions un peu de votre poids, car celui-ci peut avoir un impact sur la guérison de votre entorse.","emotion":"neutral"},{"type":"question","id":"raisons-medicales","category":"communication","internal":false,"text":"Lorsque j'évoque le poids avec un patient, je précise que c'est pour des raisons médicales.","responseKind":"agreement5","feedbackTitle":"Clarifier l'intention","feedback":"Préciser que le sujet est abordé pour des raisons médicales aide à distinguer la démarche de soin d'un jugement sur l'apparence.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"D'accord, parlons-en.","emotion":"neutral"},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Comment vivez-vous votre surpoids au quotidien ?","emotion":"neutral"},{"type":"question","id":"rapport-au-poids","category":"accompagnement","internal":false,"text":"Je questionne mon patient sur son rapport à son poids avant de proposer un accompagnement ou une orientation.","responseKind":"agreement5","feedbackTitle":"Explorer le vécu avant d'orienter","feedback":"Questionner le rapport au poids permet de mieux comprendre les attentes et les freins avant de proposer une orientation.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"Je me sens plutôt bien, mais ce n'est pas toujours facile tous les jours.","emotion":"sad"},{"type":"question","id":"vocabulaire","category":"communication","internal":true,"text":"Lorsque le sujet du poids est abordé, j'adapte mon vocabulaire en fonction de la perception et du vécu de mon patient.","responseKind":"agreement5","feedbackTitle":"Adapter le vocabulaire","feedback":"L'adaptation du langage facilite l'échange.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"question","id":"recommandations-systematiques","category":"accompagnement","internal":true,"reverseScore":true,"text":"Je propose systématiquement des recommandations liées au poids à tous mes patients en situation d'obésité.","responseKind":"agreement5","feedbackTitle":"Éviter l'automatisme","feedback":"Certains patients n'ont pas de demande ou ne sont pas disponibles pour aborder ce sujet à ce moment-là.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]}]},{"id":"anamnese","background":"cabinet","steps":[{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Selon vous, comment en êtes-vous arrivée à cette situation ?","emotion":"neutral"},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"Plusieurs personnes de ma famille sont en situation d'obésité.","emotion":"neutral"},{"type":"question","id":"origines-obesite","category":"accompagnement","internal":false,"text":"J'interroge mon patient sur les origines qu'il associe à son obésité. (échelle de 1 à 10)","responseKind":"scale10","feedbackTitle":"Comprendre les explications du patient","feedback":"Explorer les origines perçues aide à comprendre l'histoire et les leviers d'accompagnement.","options":[{"value":1,"label":"1","score":1,"max":10},{"value":2,"label":"2","score":2,"max":10},{"value":3,"label":"3","score":3,"max":10},{"value":4,"label":"4","score":4,"max":10},{"value":5,"label":"5","score":5,"max":10},{"value":6,"label":"6","score":6,"max":10},{"value":7,"label":"7","score":7,"max":10},{"value":8,"label":"8","score":8,"max":10},{"value":9,"label":"9","score":9,"max":10},{"value":10,"label":"10","score":10,"max":10}]},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Je vais vous expliquer les différents facteurs pouvant intervenir, pour vous comme pour votre entourage.","emotion":"neutral"},{"type":"question","id":"entourage","category":"accompagnement","internal":false,"text":"Dans le cadre de la prise en soins, si le patient le souhaite, je prends un temps avec son entourage pour expliquer l'obésité.","responseKind":"agreement5","feedbackTitle":"Impliquer l'entourage avec accord","feedback":"Un temps d'explication avec l'entourage peut être utile s'il est souhaité par le patient.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"Pouvez-vous m'expliquer comment mieux gérer mon alimentation ?","emotion":"curious"},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"L'alimentation est importante, mais l'obésité ne se résume pas uniquement à cela. Il s'agit d'une maladie multifactorielle, dans laquelle la génétique peut également jouer un rôle important.","emotion":"neutral"},{"type":"question","id":"approche-calorique","category":"accompagnement","internal":true,"text":"Je veille à ne pas réduire la prise en soins de mes patients obèses à une approche calorique.","responseKind":"agreement5","feedbackTitle":"Approche globale","feedback":"L'obésité est multifactorielle. Une approche exclusivement calorique peut être limitée.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"question","id":"regimes-hypocaloriques","category":"accompagnement","internal":true,"text":"Je prends le temps de sensibiliser mes patients aux conséquences possibles des régimes hypocaloriques pour leur santé.","responseKind":"agreement5","feedbackTitle":"Informer sur les effets des restrictions","feedback":"Informer sur les effets des régimes restrictifs permet d'aborder le parcours alimentaire avec nuance.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Parvenez-vous à bien distinguer les sensations de faim et de satiété ?","emotion":"neutral"},{"type":"question","id":"faim-satiete","category":"accompagnement","internal":false,"text":"Dans le suivi de mes patients, j'accompagne leur compréhension et la reconnaissance de leurs sensations de faim et de satiété.","responseKind":"agreement5","feedbackTitle":"Accompagner les sensations alimentaires","feedback":"L'accompagnement aide à mieux comprendre les sensations de faim et de satiété.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"question","id":"estime-soi","category":"accompagnement","internal":true,"text":"L'estime de soi est un élément important dans la prise en soins et l'accompagnement de mes patients en situation d'obésité.","responseKind":"agreement5","feedbackTitle":"Prendre en compte l'estime de soi","feedback":"L'estime de soi peut influencer l'engagement dans le soin et la continuité du parcours.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"question","id":"motivation","category":"accompagnement","internal":true,"text":"Je prends en compte les motivations de mes patients obèses pour les guider et les soutenir tout au long de leur parcours de soins.","responseKind":"agreement5","feedbackTitle":"Soutenir la motivation","feedback":"Prendre en compte les motivations permet de construire des objectifs plus réalistes.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]}]},{"id":"stigmatisation-parcours","background":"cabinet","steps":[{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Je peux vous aider à mieux comprendre les signaux de votre corps. Nous disposons également d'une équipe compétente et d'un réseau de professionnels spécialisés pouvant vous accompagner.","emotion":"positive"},{"type":"question","id":"genre-equite","category":"stigmatisation","internal":true,"text":"J'accompagne mes patient·es, hommes et femmes, de manière équitable en matière de perte de poids.","responseKind":"genderEquity","feedbackTitle":"Veiller à l'équité","feedback":"L'équité suppose d'être attentif aux besoins individuels sans appliquer automatiquement les mêmes attentes selon le genre.","options":[{"value":"non","label":"Non, je ne crois pas","score":1,"max":5},{"value":"peut_etre","label":"Peut-être","score":3,"max":5},{"value":"tout_a_fait","label":"Tout à fait","score":5,"max":5}]},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"J'apprécie votre bienveillance concernant mon poids. J'ai déjà vécu des échanges beaucoup plus difficiles à ce sujet.","emotion":"sad"},{"type":"question","id":"stigmatisations","category":"stigmatisation","internal":false,"text":"Mes patients m'ont déjà fait remonter des stigmatisations qu'ils avaient vécues.","responseKind":"agreement5","feedbackTitle":"Accueillir le vécu de stigmatisation","feedback":"Les situations de stigmatisation peuvent influencer la confiance envers les soins.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Nous veillons à ne jamais stigmatiser nos patients en raison de leur poids.","emotion":"positive"},{"type":"question","id":"equipe","category":"stigmatisation","internal":true,"text":"Je porte une attention à ce que les professionnels de mon équipe soient conscients de l'importance de leur posture vis-à-vis des personnes en obésité.","responseKind":"teamOptions","feedbackTitle":"Sensibiliser l'équipe","feedback":"La posture de l'ensemble de l'équipe peut influencer l'expérience du patient.","options":[{"value":"oui","label":"Oui","score":5,"max":5},{"value":"non_envisage","label":"Non mais je pourrais l'envisager","score":3,"max":5},{"value":"non_complique","label":"Non et cela me semble compliqué","score":1,"max":5},{"value":"sans_objet","label":"Sans objet","score":null,"max":5},{"value":"ne_sais_pas","label":"Je ne sais pas","score":2,"max":5}]},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"C'est rassurant. Quand pourrons-nous prendre rendez-vous pour approfondir tout cela ?","emotion":"positive"},{"type":"question","id":"orientation-proximite","category":"parcours","internal":true,"text":"Je connais les professionnels de proximité vers lesquels orienter mes patients pour qu'ils bénéficient de conditions adaptées.","responseKind":"agreement5","feedbackTitle":"Identifier les ressources locales","feedback":"Connaître les ressources de proximité permet d'éviter des ruptures dans le parcours.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"question","id":"transport-bariatrique","category":"parcours","internal":true,"text":"Pour les patients de plus de 150 kg, je connais les modalités du transport sanitaire bariatrique.","responseKind":"transportOptions","feedbackTitle":"Connaître les modalités de transport","feedback":"Connaître les modalités peut éviter un renoncement aux soins.","options":[{"value":"oui","label":"Oui, je pense connaître les modalités","score":5,"max":5},{"value":"non","label":"Non, je ne connais pas ces modalités","score":1,"max":5}]},{"type":"question","id":"cso","category":"parcours","internal":true,"text":"Je connais les missions du Centre Spécialisé de l'Obésité de mon territoire.","responseKind":"agreement5","feedbackTitle":"Mobiliser les ressources spécialisées","feedback":"Le CSO peut constituer une ressource pour l'avis, l'orientation ou la coordination du parcours.","options":[{"value":1,"label":"Pas du tout d'accord","score":1,"max":5},{"value":2,"label":"Plutôt pas d'accord","score":2,"max":5},{"value":3,"label":"Ni d'accord ni pas d'accord","score":3,"max":5},{"value":4,"label":"Plutôt d'accord","score":4,"max":5},{"value":5,"label":"Tout à fait d'accord","score":5,"max":5}]},{"type":"dialogue","speaker":"doctor","name":"Vous","text":"Je vous invite à prendre rendez-vous avec ma secrétaire. Je vous souhaite une excellente journée.","emotion":"positive"},{"type":"dialogue","speaker":"patient","name":"Mme Martin","text":"Merci beaucoup, docteur. À bientôt.","emotion":"positive"}]}],"categories":{"plainte":{"label":"Plainte et poids","description":"Pertinence et moment choisi pour aborder le poids face à une plainte fonctionnelle."},"mesure":{"label":"Mesure du poids","description":"Consentement, explication et modalités de la mesure du poids."},"communication":{"label":"Communication","description":"Clarification médicale, vocabulaire et adaptation au vécu du patient."},"accompagnement":{"label":"Accompagnement","description":"Rapport au poids, motivations, entourage, régimes, sensations alimentaires et approche globale."},"stigmatisation":{"label":"Stigmatisation","description":"Équité, vécu de stigmatisation et posture de l'équipe."},"parcours":{"label":"Parcours de soins","description":"Orientation, transport adapté et connaissance des ressources spécialisées."}}};

// ======================================================
// BOOT — load scenario.json (with embedded fallback)
// ======================================================

async function boot() {
  try {
    const res = await fetch("scenario.json");
    if (res.ok) {
      scenario = await res.json();
      buildFlatSteps();
      return;
    }
  } catch (e) {
    // fetch unavailable (e.g. file:// protocol) — use embedded data
  }
  scenario = SCENARIO_EMBEDDED;
  buildFlatSteps();
}

function buildFlatSteps() {
  flatSteps = [];
  scenario.scenes.forEach((scene) => {
    scene.steps.forEach((step) => {
      flatSteps.push({ ...step, _sceneId: scene.id, _sceneBg: scene.background });
    });
  });
}

// count total questions
function totalQuestions() {
  return flatSteps.filter((s) => s.type === "question").length;
}

function answeredCount() {
  return Object.keys(answers).length;
}

// ======================================================
// SHOW / HIDE screens
// ======================================================

function showScreen(id) {
  [screenTitle, screenGame, screenResults, menuOverlay].forEach((el) => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ======================================================
// RENDER current step
// ======================================================

function renderStep() {
  if (stepIndex >= flatSteps.length) {
    // All steps done → results
    showResults();
    return;
  }

  const step = flatSteps[stepIndex];

  // HUD
  hudSceneLabel.textContent = step._sceneId || "";
  const total   = totalQuestions();
  const done    = answeredCount();
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  hudProgressFill.style.width = `${pct}%`;
  hudProgressText.textContent = `${done} / ${total}`;

  // Background
  const bgKey = step._sceneBg || "cabinet";
  vnBg.innerHTML = SVG_BACKGROUNDS[bgKey] || SVG_BACKGROUNDS.cabinet;

  // Hide all UI panels
  vnDialog.classList.add("hidden");
  vnNarration.classList.add("hidden");
  vnQuestionOverlay.classList.add("hidden");
  vnThought.classList.add("hidden");

  if (step.type === "narration") {
    renderNarration(step);
  } else if (step.type === "dialogue") {
    renderDialogue(step);
  } else if (step.type === "question") {
    renderQuestion(step);
  }
}

// ======================================================
// NARRATION
// ======================================================

function renderNarration(step) {
  // Dim both characters
  charPatient.classList.remove("hidden");
  charDoctor.classList.remove("hidden");
  charPatient.innerHTML = SVG_CHARACTERS.patient;
  charDoctor.innerHTML  = SVG_CHARACTERS.doctor;
  charPatient.classList.add("dim");
  charDoctor.classList.add("dim");

  narrationText.textContent = step.text;
  vnNarration.classList.remove("hidden");
}

// ======================================================
// DIALOGUE
// ======================================================

function renderDialogue(step) {
  charPatient.classList.remove("hidden");
  charDoctor.classList.remove("hidden");
  charPatient.innerHTML = SVG_CHARACTERS.patient;
  charDoctor.innerHTML  = SVG_CHARACTERS.doctor;

  const isPatient = step.speaker === "patient";

  charPatient.classList.toggle("dim",    !isPatient);
  charPatient.classList.toggle("active",  isPatient);
  charDoctor.classList.toggle("dim",      isPatient);
  charDoctor.classList.toggle("active",  !isPatient);

  dialogSpeaker.textContent = step.name || step.speaker;
  dialogSpeaker.className   = `dialog-speaker speaker-${step.speaker}`;
  dialogText.textContent    = step.text;
  vnDialog.classList.remove("hidden");
}

// ======================================================
// QUESTION
// ======================================================

function renderQuestion(step) {
  pendingAnswer = null;

  charPatient.classList.remove("hidden");
  charDoctor.classList.remove("hidden");
  charPatient.innerHTML = SVG_CHARACTERS.patient;
  charDoctor.innerHTML  = SVG_CHARACTERS.doctor;
  charPatient.classList.add("dim");
  charDoctor.classList.add("dim");

  // Thought bubble for internal questions
  if (step.internal) {
    vnThought.classList.remove("hidden");
    charDoctor.classList.remove("dim");
    charDoctor.classList.add("active");
  } else {
    vnThought.classList.add("hidden");
  }

  vqInternal.classList.toggle("hidden", !step.internal);
  vqQuestion.textContent = step.question || step.text;

  const isScale = step.responseKind === "scale10";
  vqOptions.className = "vq-options" + (isScale ? " scale-grid" : " two-col");
  vqScaleLabels.classList.toggle("hidden", !isScale);

  vqOptions.innerHTML = "";
  const existingAnswer = answers[step.id];

  step.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "vq-opt" + (String(existingAnswer) === String(opt.value) ? " selected" : "");
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      pendingAnswer = opt.value;
      document.querySelectorAll(".vq-opt").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      vqConfirm.classList.remove("hidden");
    });
    vqOptions.appendChild(btn);
  });

  // If already answered, show confirm
  if (existingAnswer !== undefined) {
    pendingAnswer = existingAnswer;
    vqConfirm.classList.remove("hidden");
  } else {
    vqConfirm.classList.add("hidden");
  }

  vnQuestionOverlay.classList.remove("hidden");
}

// ======================================================
// ADVANCE
// ======================================================

function advance() {
  stepIndex++;
  renderStep();
}

// ======================================================
// EVENT LISTENERS
// ======================================================

btnTitleStart.addEventListener("click", async () => {
  if (!scenario) await boot();  // boot() already called at load; this is a safety net
  stepIndex = 0; answers = {}; openFeedback = {}; selectedCategory = null;
  showScreen("screen-game");
  renderStep();
});

dialogNext.addEventListener("click",    advance);
narrationNext.addEventListener("click", advance);

vqConfirm.addEventListener("click", () => {
  if (pendingAnswer === null && pendingAnswer !== 0) return;
  const step = flatSteps[stepIndex];
  answers[step.id] = pendingAnswer;
  advance();
});

btnMenu.addEventListener("click", () => menuOverlay.classList.remove("hidden"));
menuResume.addEventListener("click", () => menuOverlay.classList.add("hidden"));
menuRestart.addEventListener("click", () => {
  menuOverlay.classList.add("hidden");
  stepIndex = 0; answers = {}; openFeedback = {};
  showScreen("screen-title");
});

btnRestart.addEventListener("click", () => {
  stepIndex = 0; answers = {}; openFeedback = {};
  showScreen("screen-title");
});

// ======================================================
// SCORING
// ======================================================

function getAnswerMeta(step, value) {
  return step.options ? step.options.find((o) => String(o.value) === String(value)) : null;
}

function getScorePercentage(step, value) {
  const meta = getAnswerMeta(step, value);
  if (!meta || meta.score === null || meta.score === undefined) return null;
  const max = meta.max || 5;
  const raw = step.reverseScore ? max + 1 - meta.score : meta.score;
  return Math.round((raw / max) * 100);
}

function getCategoryScores() {
  const cats = scenario.categories;
  const totals = {};

  flatSteps.forEach((step) => {
    if (step.type !== "question") return;
    const val = answers[step.id];
    if (val === undefined) return;
    const pct = getScorePercentage(step, val);
    if (pct === null) return;
    if (!totals[step.category]) totals[step.category] = { total: 0, count: 0 };
    totals[step.category].total += pct;
    totals[step.category].count += 1;
  });

  return Object.keys(cats).map((key) => {
    const item  = totals[key];
    const score = item && item.count > 0 ? Math.round(item.total / item.count) : 0;
    return { key, label: cats[key].label, description: cats[key].description, score, count: item ? item.count : 0 };
  });
}

function scoreComment(score, count) {
  if (count === 0) return "Aucune question prise en compte.";
  if (score >= 80) return "Axe plutôt solide dans les réponses déclarées.";
  if (score >= 60) return "Axe globalement présent, avec quelques points à consolider.";
  if (score >= 40) return "Axe intermédiaire : plusieurs pratiques peuvent être approfondies.";
  return "Axe prioritaire pour la restitution pédagogique.";
}

// ======================================================
// RESULTS
// ======================================================

function showResults() {
  showScreen("screen-results");

  const scores = getCategoryScores();

  // Radar
  const ctx = document.getElementById("radar-chart").getContext("2d");
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: scores.map((s) => s.label),
      datasets: [{
        data: scores.map((s) => s.score),
        backgroundColor: "rgba(56,189,248,0.15)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        pointBackgroundColor: "#38bdf8",
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 25, color: "#64748b", font: { size: 11 } },
          grid:  { color: "#334155" },
          pointLabels: { color: "#e2e8f0", font: { size: 12 } },
          angleLines: { color: "#334155" },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => `${c.raw}%` } },
      },
    },
  });

  // Lowest
  const answered = scores.filter((s) => s.count > 0);
  const lowest   = answered.length ? [...answered].sort((a, b) => a.score - b.score)[0] : null;
  const lowestBox  = document.getElementById("lowest-cat-box");
  const lowestText = document.getElementById("lowest-cat-text");
  if (lowest) {
    lowestBox.classList.remove("hidden");
    lowestText.textContent = `${lowest.label} — ${lowest.score}%`;
  }

  // Category grid
  const grid = document.getElementById("results-cat-grid");
  grid.innerHTML = "";
  if (!selectedCategory && lowest) selectedCategory = lowest.key;
  if (!selectedCategory && scores.length) selectedCategory = scores[0].key;

  scores.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "cat-result-btn" + (item.key === selectedCategory ? " active" : "");
    btn.dataset.catKey = item.key;
    btn.innerHTML = `
      <div style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span class="cat-btn-label">${item.label}</span>
          <span class="cat-btn-score">${item.score}%</span>
        </div>
        <div class="cat-btn-bar"><div class="cat-btn-bar-fill" style="width:${item.score}%"></div></div>
      </div>`;
    btn.addEventListener("click", () => {
      selectedCategory = item.key;
      document.querySelectorAll(".cat-result-btn").forEach((b) => b.classList.toggle("active", b.dataset.catKey === selectedCategory));
      renderFeedbackPanel(scores);
    });
    grid.appendChild(btn);
  });

  renderFeedbackPanel(scores);
}

function renderFeedbackPanel(scores) {
  const catScore = scores.find((s) => s.key === selectedCategory);
  if (!catScore) return;

  document.getElementById("fb-panel-title").textContent  = catScore.label;
  document.getElementById("fb-panel-desc").textContent   = catScore.description;
  document.getElementById("fb-score-value").textContent  = `${catScore.score}%`;
  document.getElementById("fb-score-comment").textContent = scoreComment(catScore.score, catScore.count);

  const container = document.getElementById("feedback-items");
  container.innerHTML = "";

  const stepsInCat = flatSteps.filter(
    (s) => s.type === "question" && s.category === selectedCategory && answers[s.id] !== undefined
  );

  stepsInCat.forEach((step) => {
    const val   = answers[step.id];
    const meta  = getAnswerMeta(step, val);
    const score = getScorePercentage(step, val);
    const isOpen = !!openFeedback[step.id];

    const acc = document.createElement("div");
    acc.className = "feedback-acc";
    acc.innerHTML = `
      <button class="feedback-acc-trigger">
        <div class="feedback-acc-left">
          <p class="feedback-acc-raw">Réponse : ${meta ? meta.label : val}</p>
          <p class="feedback-acc-title">${step.feedbackTitle}</p>
          <p class="feedback-acc-score">${score !== null ? `Score de restitution : ${score}%` : "Non comptabilisé dans le score."}</p>
        </div>
        <svg class="acc-chevron${isOpen ? " open" : ""}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <div class="feedback-acc-body${isOpen ? " open" : ""}">${step.feedback}</div>`;

    const trigger = acc.querySelector(".feedback-acc-trigger");
    const body    = acc.querySelector(".feedback-acc-body");
    const chev    = acc.querySelector(".acc-chevron");
    trigger.addEventListener("click", () => {
      openFeedback[step.id] = !openFeedback[step.id];
      body.classList.toggle("open", openFeedback[step.id]);
      chev.classList.toggle("open", openFeedback[step.id]);
    });

    container.appendChild(acc);
  });
}

// ======================================================
// INIT
// ======================================================

boot(); // load scenario.json (or fall back to SCENARIO_EMBEDDED)

