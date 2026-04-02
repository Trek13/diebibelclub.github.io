# Cube Earth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static GitHub Pages site showing a rotating cube-shaped Earth with realistic textures, tilted 23.5°, over a twinkling star field, with drag-to-rotate interaction.

**Architecture:** Single-page app with Three.js loaded via CDN using import maps. One JS module (`app.js`) handles scene setup, procedural earth texture generation, star field with custom shader, and OrbitControls. Earth textures are generated at runtime via Canvas 2D API with simplified continent shapes per cube face.

**Tech Stack:** Three.js (CDN), ES Modules, Canvas 2D API, Google Fonts, GitHub Pages

---

## File Structure

| File | Responsibility |
|------|---------------|
| `index.html` | HTML shell, import map for Three.js CDN, Google Fonts link, `<script type="module">` for app.js |
| `css/style.css` | Fullscreen canvas, title positioning/typography, responsive clamp |
| `js/app.js` | All Three.js logic: scene, camera, renderer, lights, cube, textures, stars, controls, animation loop, resize |

Old files to remove: `css/style5.css`, `css/supersized.css`, `css/supersized.shutter.css`, `css/bootstrap.min.css`, `css/index.html`, `js/fss.js`, `js/canvas.js`, `js/scripts.js`, `js/jquery-1.9.1.min.js`, `js/device.min.js`, `js/jquery.scrollTo-1.4.3.1-min.js`, `js/bootstrap.min.js`, `css/style.css` (replaced).

---

### Task 1: Remove old files and create clean project structure

**Files:**
- Delete: `css/style5.css`, `css/supersized.css`, `css/supersized.shutter.css`, `css/bootstrap.min.css`, `css/index.html`, `js/fss.js`, `js/canvas.js`, `js/scripts.js`, `js/jquery-1.9.1.min.js`, `js/device.min.js`, `js/jquery.scrollTo-1.4.3.1-min.js`, `js/bootstrap.min.js`
- Keep: `CNAME`, `README.md`, `.gitignore`

- [ ] **Step 1: Delete old CSS files**

```bash
rm css/style5.css css/supersized.css css/supersized.shutter.css css/bootstrap.min.css css/index.html
```

- [ ] **Step 2: Delete old JS files**

```bash
rm js/fss.js js/canvas.js js/scripts.js js/jquery-1.9.1.min.js js/device.min.js js/jquery.scrollTo-1.4.3.1-min.js js/bootstrap.min.js
```

- [ ] **Step 3: Delete old bootstrap directory if exists**

```bash
rm -rf bootstrap/
```

- [ ] **Step 4: Verify clean state**

```bash
ls css/ js/
```

Expected: `css/` contains only `style.css` (will be replaced next). `js/` is empty.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove old template files (jQuery, Bootstrap, FSS)"
```

---

### Task 2: Create index.html

**Files:**
- Replace: `index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DieBibel.Club</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/"
    }
  }
  </script>
</head>
<body>
  <div class="title">DieBibel.Club</div>
  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open in browser**

Run: `open index.html` (or serve locally)
Expected: Blank white page with "DieBibel.Club" text visible. Console should show no errors (app.js doesn't exist yet, that's OK -- it will 404).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: new index.html with Three.js import map and Google Fonts"
```

---

### Task 3: Create css/style.css

**Files:**
- Replace: `css/style.css`

- [ ] **Step 1: Write css/style.css**

```css
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
}

canvas {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.title {
  position: absolute;
  top: 12%;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 5vw, 4rem);
  color: #fff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  pointer-events: none;
  user-select: none;
  z-index: 10;
  white-space: nowrap;
}
```

- [ ] **Step 2: Open in browser**

Run: Refresh `index.html` in browser
Expected: Black background, "DieBibel.Club" in white serif font at top center with subtle glow.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "feat: add fullscreen canvas layout and title styling"
```

---

### Task 4: Create js/app.js -- Minimal scene with renderer, camera, lights

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Write js/app.js with scene skeleton**

```javascript
import * as THREE from 'three';

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = window.innerWidth < 768 ? 4.0 : 3.5;

// --- Lights ---
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 3, 5);
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambLight);

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = window.innerWidth < 768 ? 4.0 : 3.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

- [ ] **Step 2: Open in browser**

Run: Refresh browser (must use a local server for ES modules -- `python3 -m http.server 8000` in the project root, then open `http://localhost:8000`)
Expected: Black screen, no console errors, "DieBibel.Club" title visible on top.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: Three.js scene skeleton with renderer, camera, and lights"
```

---

### Task 5: Add Earth Cube with procedural textures

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add texture generation function before the Animation Loop section**

Insert this code after the `scene.add(ambLight)` line and before the `// --- Animation Loop ---` comment:

```javascript
// --- Earth Texture Generation ---
function createFaceTexture(drawContinents) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Ocean gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, '#1a6e9e');
  grad.addColorStop(1, '#0d3b66');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Draw continents
  drawContinents(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawPoly(ctx, size, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0] * size, points[0][1] * size);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0] * size, points[i][1] * size);
  }
  ctx.closePath();
  ctx.fill();
}

const land = '#2d6a4f';
const landLight = '#40916c';
const ice = '#b8d4e3';

const earthTextures = [
  // +X face (right): East Asia, Australia
  createFaceTexture((ctx, s) => {
    drawPoly(ctx, s, [[0,0],[0.8,0],[0.9,0.15],[0.7,0.3],[0.85,0.45],[0.6,0.5],[0.3,0.45],[0.15,0.3],[0,0.2]], land);
    drawPoly(ctx, s, [[0.1,0.12],[0.4,0.08],[0.5,0.2],[0.3,0.25]], landLight);
    // Australia
    drawPoly(ctx, s, [[0.45,0.65],[0.85,0.6],[0.9,0.75],[0.8,0.9],[0.55,0.92],[0.4,0.8]], land);
    drawPoly(ctx, s, [[0.5,0.68],[0.7,0.65],[0.75,0.75],[0.6,0.8]], landLight);
    // Japan
    drawPoly(ctx, s, [[0.85,0.2],[0.9,0.18],[0.92,0.35],[0.87,0.38]], land);
  }),
  // -X face (left): Americas
  createFaceTexture((ctx, s) => {
    // North America
    drawPoly(ctx, s, [[0.1,0.02],[0.7,0],[0.85,0.1],[0.9,0.25],[0.75,0.35],[0.6,0.42],[0.45,0.45],[0.35,0.42],[0.2,0.3],[0.05,0.15]], land);
    drawPoly(ctx, s, [[0.3,0.1],[0.6,0.08],[0.65,0.2],[0.4,0.25]], landLight);
    // Central America
    drawPoly(ctx, s, [[0.4,0.45],[0.5,0.44],[0.55,0.55],[0.45,0.55]], land);
    // South America
    drawPoly(ctx, s, [[0.35,0.55],[0.65,0.53],[0.7,0.65],[0.65,0.8],[0.55,0.92],[0.4,0.95],[0.3,0.85],[0.25,0.7]], land);
    drawPoly(ctx, s, [[0.4,0.6],[0.55,0.58],[0.58,0.7],[0.45,0.75]], landLight);
  }),
  // +Y face (top): Arctic / North Pole
  createFaceTexture((ctx, s) => {
    ctx.fillStyle = ice;
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.5, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Surrounding land hints
    drawPoly(ctx, s, [[0,0.7],[0.3,0.6],[0.35,0.8],[0.1,0.9],[0,0.85]], land);
    drawPoly(ctx, s, [[0.65,0.6],[1,0.7],[1,0.9],[0.7,0.85]], land);
    drawPoly(ctx, s, [[0.2,0],[0.5,0.05],[0.45,0.2],[0.15,0.15]], land);
  }),
  // -Y face (bottom): Antarctic / South Pole
  createFaceTexture((ctx, s) => {
    ctx.fillStyle = ice;
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.5, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    drawPoly(ctx, s, [[0.2,0.3],[0.8,0.25],[0.85,0.5],[0.7,0.7],[0.3,0.72],[0.15,0.55]], '#a0c4d8');
  }),
  // +Z face (front): Europe, Africa
  createFaceTexture((ctx, s) => {
    // Europe
    drawPoly(ctx, s, [[0.25,0.02],[0.7,0],[0.75,0.1],[0.65,0.2],[0.8,0.25],[0.55,0.3],[0.3,0.28],[0.15,0.15]], land);
    drawPoly(ctx, s, [[0.35,0.08],[0.55,0.06],[0.5,0.18],[0.35,0.2]], landLight);
    // Africa
    drawPoly(ctx, s, [[0.35,0.32],[0.65,0.3],[0.75,0.45],[0.72,0.65],[0.6,0.85],[0.45,0.9],[0.3,0.78],[0.28,0.55],[0.32,0.4]], land);
    drawPoly(ctx, s, [[0.4,0.4],[0.58,0.38],[0.6,0.55],[0.45,0.6]], landLight);
    // Madagascar
    drawPoly(ctx, s, [[0.78,0.6],[0.83,0.58],[0.85,0.72],[0.8,0.75]], land);
  }),
  // -Z face (back): Pacific Ocean
  createFaceTexture((ctx, s) => {
    // Mostly ocean with small islands
    drawPoly(ctx, s, [[0.15,0.35],[0.2,0.33],[0.22,0.38],[0.17,0.4]], land);
    drawPoly(ctx, s, [[0.6,0.5],[0.65,0.48],[0.67,0.53],[0.62,0.55]], land);
    drawPoly(ctx, s, [[0.4,0.7],[0.45,0.68],[0.47,0.73],[0.42,0.75]], land);
    drawPoly(ctx, s, [[0.8,0.25],[0.85,0.22],[0.88,0.28],[0.83,0.3]], land);
    // New Zealand hint
    drawPoly(ctx, s, [[0.1,0.7],[0.15,0.68],[0.17,0.78],[0.12,0.82]], land);
    drawPoly(ctx, s, [[0.13,0.82],[0.16,0.8],[0.18,0.88],[0.14,0.9]], land);
  }),
];

// --- Earth Cube ---
const materials = earthTextures.map(tex => new THREE.MeshStandardMaterial({ map: tex }));
const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, materials);
cube.rotation.z = 23.5 * Math.PI / 180;
scene.add(cube);
```

- [ ] **Step 2: Update the animation loop to rotate the cube**

Replace the existing `animate` function:

```javascript
// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.005;
  renderer.render(scene, camera);
}
animate();
```

- [ ] **Step 3: Open in browser**

Run: Refresh `http://localhost:8000`
Expected: A cube with blue-green earth-like textures, tilted ~23.5°, slowly rotating on its Y axis. Continents visible as green shapes on blue ocean. Directional light creates visible shading.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: add earth cube with procedural continent textures and 23.5° tilt"
```

---

### Task 6: Add twinkling star field with ShaderMaterial

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add star field code after the Earth Cube section, before the Animation Loop**

Insert this code after `scene.add(cube)` and before the `// --- Animation Loop ---` comment:

```javascript
// --- Star Field ---
const starCount = 2000;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
const starPhases = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 40 + Math.random() * 20;
  starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = r * Math.cos(phi);
  starSizes[i] = 1.0 + Math.random() * 2.0;
  starPhases[i] = Math.random() * Math.PI * 2;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));

const starMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  },
  vertexShader: `
    attribute float aSize;
    attribute float aPhase;
    uniform float uTime;
    uniform float uPixelRatio;
    varying float vOpacity;
    void main() {
      vOpacity = 0.5 + 0.5 * sin(uTime * 1.5 + aPhase);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * uPixelRatio * (100.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying float vOpacity;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.1, d) * vOpacity;
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `,
  transparent: true,
  depthWrite: false,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);
```

- [ ] **Step 2: Update animation loop to pass time to the star shader**

Replace the `animate` function:

```javascript
// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  cube.rotation.y += 0.005;
  starMaterial.uniforms.uTime.value = elapsed;
  renderer.render(scene, camera);
}
animate();
```

- [ ] **Step 3: Open in browser**

Run: Refresh `http://localhost:8000`
Expected: Stars twinkling in the background (white dots fading in and out). The earth cube continues to rotate. Stars are at various sizes and have a soft circular shape.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "feat: add twinkling star field with custom ShaderMaterial"
```

---

### Task 7: Add OrbitControls for drag interaction

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add OrbitControls import at the top of app.js**

Add this line after the existing `import * as THREE from 'three';`:

```javascript
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

- [ ] **Step 2: Add controls setup after the star field section, before the Animation Loop**

Insert after `scene.add(stars)` and before `// --- Animation Loop ---`:

```javascript
// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = false;
```

- [ ] **Step 3: Update animation loop to update controls**

Replace the `animate` function:

```javascript
// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  cube.rotation.y += 0.005;
  starMaterial.uniforms.uTime.value = elapsed;
  controls.update();
  renderer.render(scene, camera);
}
animate();
```

- [ ] **Step 4: Open in browser**

Run: Refresh `http://localhost:8000`
Expected: Cube still auto-rotates. Click and drag with mouse rotates the camera around the cube. Release causes smooth damping. Scroll wheel does nothing (zoom disabled). The cube always stays centered (pan disabled).

- [ ] **Step 5: Commit**

```bash
git add js/app.js
git commit -m "feat: add OrbitControls with drag-to-rotate and damping"
```

---

### Task 8: Responsive polish and final cleanup

**Files:**
- Modify: `js/app.js`
- Modify: `css/style.css`

- [ ] **Step 1: Update the resize handler in app.js to also update star pixel ratio**

Replace the existing `window.addEventListener('resize', ...)` block:

```javascript
// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = window.innerWidth < 768 ? 4.0 : 3.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
  starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});
```

- [ ] **Step 2: Open in browser and test responsive behavior**

Run: Refresh `http://localhost:8000`, resize the window to mobile width (<768px)
Expected: Cube appears slightly smaller (camera further back). Title scales down. No scrollbars. No clipping.

- [ ] **Step 3: Test on mobile viewport**

Run: Open Chrome DevTools, toggle device toolbar, select a mobile device (e.g. iPhone 14)
Expected: Touch drag rotates the camera. Title is readable. Stars visible. No horizontal scroll.

- [ ] **Step 4: Commit**

```bash
git add js/app.js css/style.css
git commit -m "feat: responsive polish -- mobile camera distance, pixel ratio update"
```

---

### Task 9: Update README and final commit

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README.md**

```markdown
# DieBibel.Club

Rotating cube-shaped Earth built with Three.js, hosted on GitHub Pages.

## Features

- 3D Earth cube with procedural continent textures
- 23.5° axial tilt matching real Earth
- Twinkling star field background
- Drag-to-rotate interaction (mouse and touch)
- Fully static -- no build step, no server required

## Local Development

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

Push to `main` branch. GitHub Pages serves automatically at [diebibel.club](https://diebibel.club).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with project description and dev instructions"
```

- [ ] **Step 3: Final verification**

Run: `python3 -m http.server 8000` and open `http://localhost:8000`

Verify checklist:
- Black background with twinkling stars
- Earth cube with green continents on blue ocean
- Cube tilted at 23.5°
- Cube auto-rotates slowly
- "DieBibel.Club" in white serif font above cube
- Drag to rotate camera works (mouse + touch)
- Zoom and pan disabled
- No console errors
- Responsive on mobile viewport
