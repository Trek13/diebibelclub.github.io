import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

// --- Equirectangular to Cube Face Projection ---
function projectToCubeFace(image, face, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Draw source image to a temp canvas for pixel access
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = image.width;
  srcCanvas.height = image.height;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.drawImage(image, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, image.width, image.height);

  const outData = ctx.createImageData(size, size);
  const iw = image.width;
  const ih = image.height;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Normalize to -1..1
      const u = (x / size) * 2 - 1;
      const v = (y / size) * 2 - 1;

      // 3D direction based on cube face
      let dx, dy, dz;
      switch (face) {
        case 0: dx =  1; dy = -v; dz = -u; break; // +X
        case 1: dx = -1; dy = -v; dz =  u; break; // -X
        case 2: dx =  u; dy =  1; dz =  v; break; // +Y
        case 3: dx =  u; dy = -1; dz = -v; break; // -Y
        case 4: dx =  u; dy = -v; dz =  1; break; // +Z
        case 5: dx = -u; dy = -v; dz = -1; break; // -Z
      }

      // Convert to spherical (lat/lon)
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      dx /= len; dy /= len; dz /= len;
      const lat = Math.asin(dy);
      const lon = Math.atan2(dz, dx);

      // Map to equirectangular image coordinates
      const sx = ((lon / Math.PI + 1) / 2) * iw;
      const sy = (0.5 - lat / Math.PI) * ih;
      const si = (Math.floor(sy) * iw + Math.floor(sx)) * 4;
      const di = (y * size + x) * 4;

      outData.data[di] = srcData.data[si];
      outData.data[di + 1] = srcData.data[si + 1];
      outData.data[di + 2] = srcData.data[si + 2];
      outData.data[di + 3] = 255;
    }
  }

  ctx.putImageData(outData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// --- Earth Cube ---
const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x0d3b66 }));
cube.rotation.z = 23.5 * Math.PI / 180;
scene.add(cube);

// Load earth texture and project onto cube faces
const earthImage = new Image();
earthImage.crossOrigin = 'anonymous';
earthImage.onload = () => {
  const faceSize = 512;
  const textures = [];
  for (let i = 0; i < 6; i++) {
    textures.push(projectToCubeFace(earthImage, i, faceSize));
  }
  cube.material = textures.map(tex => new THREE.MeshStandardMaterial({ map: tex }));
};
earthImage.src = 'textures/earth.jpg';

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

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = false;

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

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = window.innerWidth < 768 ? 4.0 : 3.5;
  renderer.setSize(window.innerWidth, window.innerHeight);
  starMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
});
