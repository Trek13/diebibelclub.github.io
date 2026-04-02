# Cube Earth -- System Design

## Übersicht

Eine statische Webseite für GitHub Pages unter `diebibel.club`. Zeigt einen rotierenden Würfel mit realistischer Erdtextur, geneigt wie die echte Erdachse (23.5°), vor einem animierten Sternfeld. Der Titel "DieBibel.Club" schwebt zentriert über dem Würfel. Der Benutzer kann den Würfel per Drag drehen; lässt er los, rotiert er automatisch weiter.

## Technologie

- **Three.js** via CDN (unpkg.com oder cdn.jsdelivr.net) -- kein Build-Schritt, kein npm
- **OrbitControls** als ES-Modul-Import vom selben CDN
- **Google Fonts** (Playfair Display) für den Titel
- Rein statisch: HTML + CSS + JS + Texturen. Kein Server, kein Framework.

## Dateistruktur

```
diebibelclub.github.io/
├── index.html              # Einzige HTML-Datei, lädt Three.js via CDN
├── css/
│   └── style.css           # Titel-Styling, Fullscreen-Canvas, Responsive
├── js/
│   └── app.js              # Gesamte 3D-Logik (Szene, Würfel, Sterne, Controls)
├── textures/
│   ├── earth-front.jpg     # 6 Erdtexturen für die Würfelseiten
│   ├── earth-back.jpg
│   ├── earth-left.jpg
│   ├── earth-right.jpg
│   ├── earth-top.jpg
│   └── earth-bottom.jpg
├── CNAME                   # Domain-Mapping: diebibel.club
├── .gitignore
└── README.md
```

### Zu entfernende Dateien

Die gesamte alte Codebasis wird entfernt:

- `css/style5.css`, `css/supersized.css`, `css/supersized.shutter.css`, `css/bootstrap.min.css`, `css/index.html`
- `js/fss.js`, `js/canvas.js`, `js/scripts.js`, `js/jquery-1.9.1.min.js`, `js/device.min.js`, `js/jquery.scrollTo-1.4.3.1-min.js`, `js/bootstrap.min.js`

Beibehaltene Dateien: `CNAME`, `README.md` (wird aktualisiert), `.gitignore`.

## 3D-Szene

### Renderer

- `THREE.WebGLRenderer` mit `antialias: true`
- Canvas füllt `100vw × 100vh`
- `devicePixelRatio` begrenzt auf `Math.min(window.devicePixelRatio, 2)`
- Automatisches Resize bei `window.resize` Event

### Kamera

- `THREE.PerspectiveCamera` mit FOV 45°
- Position: `(0, 0, 3.5)` -- genug Abstand damit der Würfel gut sichtbar ist
- Auf Mobile: Kamera etwas weiter weg (z.B. `4.0`) damit der Würfel komplett ins Bild passt

### Beleuchtung

- Ein `THREE.DirectionalLight` (Intensität ~1.2) von schräg oben-rechts `(5, 3, 5)` -- simuliert die Sonne
- Ein `THREE.AmbientLight` (Intensität ~0.3) -- verhindert komplett schwarze Schattenseite

### Der Würfel

- `THREE.BoxGeometry(1, 1, 1)`
- 6 verschiedene `THREE.MeshStandardMaterial` mit je einer Erdtextur als `map`
- Die Texturen sind eine Cube-Map-Zerlegung der NASA Blue Marble Erdoberfläche
- Texturformat: JPG, je ~512×512px, insgesamt ~300-500KB
- Die gesamte Würfel-Gruppe ist um **23.5°** auf der Z-Achse geneigt (`mesh.rotation.z = 23.5 * Math.PI / 180`)
- **Auto-Rotation:** Der Würfel selbst dreht sich um seine (geneigte) Y-Achse im Animation-Loop: `mesh.rotation.y += 0.005` pro Frame (ca. eine Umdrehung alle 30 Sekunden). Dies ist unabhängig von OrbitControls.

### Interaktion (OrbitControls)

- `OrbitControls` aus Three.js Addons -- steuert **nur die Kamera**, nicht den Würfel
- **Drag:** Benutzer kann die Kamera mit Maus oder Touch um den Würfel drehen, um ihn von verschiedenen Seiten zu betrachten
- **Auto-Rotate:** Deaktiviert (`controls.autoRotate = false`) -- die Rotation kommt vom Würfel selbst
- **Damping:** `controls.enableDamping = true`, `controls.dampingFactor = 0.05` -- sanftes Auslaufen nach Drag
- **Zoom deaktiviert:** `controls.enableZoom = false`
- **Pan deaktiviert:** `controls.enablePan = false`

### Sternfeld

- `THREE.Points` mit `THREE.BufferGeometry`
- ~2000 Sterne, zufällig auf einer großen Kugel (Radius ~50) um die Szene verteilt
- Verschiedene Größen (1-3px) via `size`-Attribut im BufferGeometry für Tiefenwirkung
- **Twinkle-Animation:** Per-Stern Opacity-Variation über Zeit via custom `ShaderMaterial`. Jeder Stern bekommt einen zufälligen Phase-Offset als Attribut. Im Fragment-Shader: `opacity = 0.5 + 0.5 * sin(time * speed + phase)`
- Sterne bleiben fix im Weltkoordinatensystem -- sie drehen sich nicht mit dem Würfel
- Szene-Hintergrund: `scene.background = new THREE.Color(0x000000)`

## Titel & UI

### HTML

```html
<canvas id="scene"></canvas>
<div class="title">DieBibel.Club</div>
```

Minimales Markup. Canvas für Three.js, darüber der Titel als DOM-Element.

### CSS

- **Canvas:** `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;`
- **Titel:** `position: absolute; top: 12%; left: 50%; transform: translateX(-50%);`
- **Schrift:** `Playfair Display` (Google Fonts), weiß, mit `text-shadow: 0 0 20px rgba(255,255,255,0.3)` für subtilen Glow
- **Größe:** `font-size: clamp(1.5rem, 5vw, 4rem)` -- responsive von Mobile bis Desktop
- **Pointer:** `pointer-events: none` damit Drag-Events durch den Titel zum Canvas durchgehen
- **Keine Scrollbar:** `html, body { margin: 0; overflow: hidden; }`

## Performance

- `requestAnimationFrame` Loop für flüssige 60fps
- Pixel Ratio auf 2 begrenzt (verhindert Überlast auf Retina-Displays)
- Texturen werden asynchron geladen; Szene rendert erst wenn alle 6 Texturen geladen sind
- Gesamte Seitengröße: ~500-700KB (Three.js ~150KB gzipped, Texturen ~300-500KB, Rest minimal)

## Responsive Design

- Canvas: immer 100vw × 100vh
- Kamera-Abstand: auf Viewports < 768px etwas erhöht damit der Würfel komplett sichtbar bleibt
- Titel: skaliert automatisch via `clamp()`
- Touch-Support: OrbitControls unterstützt Touch-Gesten nativ

## Browser-Kompatibilität

- Alle modernen Browser mit WebGL-Support (Chrome, Firefox, Safari, Edge)
- Kein Fallback für Browser ohne WebGL (vernachlässigbarer Marktanteil)

## GitHub Pages Deployment

- Kein Build-Schritt erforderlich
- Push auf `main` Branch deployt automatisch via GitHub Pages
- CNAME-Datei bleibt für Custom Domain `diebibel.club`
- Alle Assets (JS, CSS, Texturen) relativ referenziert
