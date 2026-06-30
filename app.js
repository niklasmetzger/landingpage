// ===== Downloads =====
// Es muss hier NICHTS mehr gepflegt werden: Die Landingpage liest den Ordner
// assets/downloads/ aus (nginx-JSON-Listing) und ordnet die Dateien automatisch zu –
// .dmg => macOS, .exe/.msi => Windows. Für eine neue Version einfach die neue Datei
// in den Ordner legen; Versionsnummer wird aus dem Dateinamen erkannt.
const FALLBACK_VERSION = '0.2.0'; // nur falls das Verzeichnis-Listing nicht erreichbar ist
let detectedVersion = FALLBACK_VERSION;

const DOWNLOADS = {
  mac:     { label: 'Für macOS herunterladen',   sub: 'DMG',       file: null, iconClass: 'mac', name: 'macOS' },
  windows: { label: 'Für Windows herunterladen', sub: 'Installer', file: null, iconClass: 'win', name: 'Windows' },
};

// Liest das Downloads-Verzeichnis und erkennt Mac-/Windows-Datei anhand der Endung.
async function discoverDownloads() {
  try {
    const res = await fetch('assets/downloads/', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) throw new Error('listing ' + res.status);
    const files = (await res.json()).filter((i) => i.type === 'file').map((i) => i.name);
    const dmg = files.find((n) => /\.dmg$/i.test(n));
    const win = files.find((n) => /\.(exe|msi)$/i.test(n));
    if (dmg) DOWNLOADS.mac.file = 'assets/downloads/' + dmg;
    if (win) DOWNLOADS.windows.file = 'assets/downloads/' + win;
    const v = (dmg || win || '').match(/(\d+\.\d+(?:\.\d+)?)/); // Version aus dem Dateinamen
    if (v) detectedVersion = v[1];
  } catch (e) {
    // Fallback (z. B. lokal ohne Server): übliche Namen mit Fallback-Version
    DOWNLOADS.mac.file = `assets/downloads/Haushaltsbuch_${FALLBACK_VERSION}_macos.dmg`;
    DOWNLOADS.windows.file = `assets/downloads/Haushaltsbuch_${FALLBACK_VERSION}_x64-setup.exe`;
  }
  DOWNLOADS.mac.sub = `DMG · Version ${detectedVersion}`;
  DOWNLOADS.windows.sub = `Installer · Version ${detectedVersion}`;
}

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

  const available = !!d.file;
  primaryBtn.href = available ? d.file : '#';
  primaryBtn.classList.toggle('disabled', !available);
  if (available) primaryBtn.setAttribute('download', '');
  else primaryBtn.removeAttribute('download');
  primaryLabel.textContent = available ? d.label : `${d.name}: bald verfügbar`;
  primarySub.textContent = available ? d.sub : 'Noch kein Build hochgeladen';
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

// ===== Download-Karten & Versions-Texte füllen =====
function initVersionTexts() {
  document.querySelectorAll('.dl-card').forEach((card) => {
    const d = DOWNLOADS[card.dataset.os];
    if (!d) return;
    const link = card.querySelector('a');
    if (!link) return;
    if (d.file) {
      link.href = d.file;
      link.setAttribute('download', '');
      link.classList.remove('disabled');
    } else {
      link.href = '#';
      link.removeAttribute('download');
      link.classList.add('disabled');
      link.textContent = 'Bald verfügbar';
    }
  });
  // Alle Elemente mit data-version bekommen die erkannte Versionsnummer
  document.querySelectorAll('[data-version]').forEach((el) => {
    el.textContent = detectedVersion;
  });
}

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

// Erst den Downloads-Ordner auslesen, dann UI füllen.
(async function init() {
  await discoverDownloads();
  initVersionTexts();
  applyOS(currentOS);
})();

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
