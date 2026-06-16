// ===== Konfiguration der Downloads =====
// >>> Nur hier die Version ändern – alles andere passt sich automatisch an. <<<
const VERSION = '0.1.0';

// Dateiendung für Windows: 'msi' (WiX) oder 'exe' (NSIS) – je nachdem, was du baust.
const WIN_EXT = 'msi';

const DOWNLOADS = {
  mac: {
    label: 'Für macOS herunterladen',
    sub: `DMG · Version ${VERSION}`,
    file: `assets/downloads/Haushaltsbuch_${VERSION}_macos.dmg`,
    iconClass: 'mac',
    name: 'macOS',
  },
  windows: {
    label: 'Für Windows herunterladen',
    sub: `${WIN_EXT.toUpperCase()} Installer · Version ${VERSION}`,
    file: `assets/downloads/Haushaltsbuch_${VERSION}_x64.${WIN_EXT}`,
    iconClass: 'win',
    name: 'Windows',
  },
};

// ===== Betriebssystem erkennen =====
function detectOS() {
  const ua = navigator.userAgent || '';
  const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const hay = (platform + ' ' + ua).toLowerCase();
  if (hay.includes('win')) return 'windows';
  if (hay.includes('mac') || hay.includes('iphone') || hay.includes('ipad')) return 'mac';
  return 'mac'; // sinnvoller Default, da nur DMG vorgebaut ist
}

let currentOS = detectOS();
let autoDetected = true;

// ===== Primären Hero-Button aktualisieren =====
const primaryBtn = document.getElementById('primary-download');
const primaryLabel = document.getElementById('primary-download-label');
const primarySub = document.getElementById('primary-download-sub');
const primaryIcon = document.getElementById('primary-os-icon');
const detectNote = document.getElementById('detect-note');

function applyOS(os) {
  const d = DOWNLOADS[os];
  if (!d) return;
  currentOS = os;

  primaryBtn.href = d.file;
  primaryBtn.setAttribute('download', '');
  primaryLabel.textContent = d.label;
  primarySub.textContent = d.sub;
  primaryIcon.className = 'os-icon ' + d.iconClass;

  detectNote.innerHTML = autoDetected
    ? `Erkanntes System: <b>${d.name}</b> · falsch? <a href="#" id="switch-link">Wechseln</a>`
    : `Ausgewählt: <b>${d.name}</b> · <a href="#" id="switch-link">Wechseln</a>`;

  const switchLink = document.getElementById('switch-link');
  if (switchLink) {
    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleOS();
    });
  }

  // Download-Karten: empfohlene hervorheben
  document.querySelectorAll('.dl-card').forEach((card) => {
    card.classList.toggle('recommended', card.dataset.os === os);
  });
}

// ===== Download-Karten & Versions-Texte aus der Konfiguration füllen =====
function initVersionTexts() {
  // Karten-Links auf die korrekten Dateien setzen
  document.querySelectorAll('.dl-card').forEach((card) => {
    const d = DOWNLOADS[card.dataset.os];
    if (!d) return;
    const link = card.querySelector('a');
    if (link) {
      link.href = d.file;
      link.setAttribute('download', '');
    }
  });
  // Alle Elemente mit data-version bekommen die Versionsnummer
  document.querySelectorAll('[data-version]').forEach((el) => {
    el.textContent = VERSION;
  });
}
initVersionTexts();

function toggleOS() {
  autoDetected = false;
  applyOS(currentOS === 'mac' ? 'windows' : 'mac');
}

document.getElementById('toggle-os').addEventListener('click', toggleOS);

// Klick auf eine Download-Karte wählt das System ebenfalls aus
document.querySelectorAll('.dl-card').forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return; // echter Download-Link bleibt unberührt
    autoDetected = false;
    applyOS(card.dataset.os);
  });
});

applyOS(currentOS);

// ===== Nav-Schatten beim Scrollen =====
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Reveal-Animationen =====
const revealEls = document.querySelectorAll(
  '.feature-card, .section-head, .split-text, .split-visual, .privacy-band, .dl-card, .trust-row'
);
revealEls.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

// ===== Jahr im Footer =====
document.getElementById('year').textContent = new Date().getFullYear();
