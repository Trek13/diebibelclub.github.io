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

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.005;
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
