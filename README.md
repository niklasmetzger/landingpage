# Haushaltsbuch – Landingpage

Statische, abhängigkeitsfreie Landingpage für die Haushaltsbuch-Desktop-App.

## Aufbau

```
landingpage/
├── index.html        # Seiteninhalt
├── styles.css        # Modernes Dark-Theme, Animationen, responsive
├── app.js            # OS-Erkennung, Download-Umschaltung, Scroll-Effekte
└── assets/
    ├── apple.svg     # macOS-Icon
    ├── windows.svg   # Windows-Icon
    └── downloads/    # >>> hier die echten Builds ablegen <<<
```

## Lokal ansehen

Einfach `index.html` im Browser öffnen, oder einen kleinen Server starten:

```bash
cd landingpage
python3 -m http.server 8080
# http://localhost:8080
```

## Download-Dateien einhängen

Die Buttons verlinken auf:

- `assets/downloads/Haushaltsbuch_0.1.0_macos.dmg`
- `assets/downloads/Haushaltsbuch_0.1.0_x64.msi`

Lege die fertigen Builds unter diesen Namen ab. Den Build findest du nach
`tauri build` unter `desktop/src-tauri/target/release/bundle/`.

Pfade/Version anpassen: oben in `app.js` im Objekt `DOWNLOADS` sowie in den
`<a href>`-Attributen im Download-Abschnitt von `index.html`.

## OS-Erkennung

`app.js` erkennt anhand von `navigator.userAgentData` / User-Agent automatisch
macOS oder Windows und wählt den passenden Download vor. Der Nutzer kann jederzeit
über „Anderes System“ bzw. die Download-Karten manuell umschalten.
