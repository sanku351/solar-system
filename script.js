import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

// === Canvas Setup ===
const canvas = document.getElementById("solarCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// === Scene and Camera ===
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 100;

// === Lighting ===
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(0, 0, 0);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// === Background Stars ===
function addStars() {
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1000;
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    positions.push((Math.random() - 0.5) * 2000);
    positions.push((Math.random() - 0.5) * 2000);
    positions.push((Math.random() - 0.5) * 2000);
  }

  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
  const stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);
}
addStars();

// === Sun ===
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), sunMaterial);
scene.add(sun);

// === Planets ===
const textureLoader = new THREE.TextureLoader();
const planetData = [
  { name: 'Mercury', texture: 'mercury.jpg', size: 1, distance: 10, speed: 0.04 },
  { name: 'Venus', texture: 'venus.jpg', size: 1.5, distance: 15, speed: 0.03 },
  { name: 'Earth', texture: 'earth.jpg', size: 2, distance: 20, speed: 0.02 },
  { name: 'Mars', texture: 'mars.jpg', size: 1.5, distance: 25, speed: 0.018 },
  { name: 'Jupiter', texture: 'jupiter.jpg', size: 3, distance: 35, speed: 0.015 },
  { name: 'Saturn', texture: 'saturn.jpg', size: 2.5, distance: 45, speed: 0.012 },
  { name: 'Uranus', texture: 'uranus.jpg', size: 2.2, distance: 55, speed: 0.01 },
  { name: 'Neptune', texture: 'neptune.jpg', size: 2.2, distance: 65, speed: 0.009 }
];

const planets = [];

planetData.forEach(data => {
  const texture = textureLoader.load(`./assets/textures/${data.texture}`);
  const material = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    material
  );
  scene.add(sphere);

  planets.push({
    name: data.name,
    mesh: sphere,
    distance: data.distance,
    speed: data.speed,
    angle: 0
  });

  const label = document.createElement('label');
  label.innerHTML = `
    ${data.name}: 
    <input type="range" min="0" max="0.1" step="0.001" value="${data.speed}" data-name="${data.name}" />
  `;
  document.getElementById('sliders').appendChild(label);
});

// === Speed Control ===
document.querySelectorAll('input[type="range"]').forEach(slider => {
  slider.addEventListener('input', (e) => {
    const planet = planets.find(p => p.name === e.target.dataset.name);
    planet.speed = parseFloat(e.target.value);
  });
});

// === Pause/Resume ===
let isPaused = false;
document.getElementById("toggle-animation").onclick = () => {
  isPaused = !isPaused;
  document.getElementById("toggle-animation").innerText = isPaused ? "Resume" : "Pause";
};

// === Animate ===
function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    planets.forEach(p => {
      p.angle += p.speed;
      p.mesh.position.x = p.distance * Math.cos(p.angle);
      p.mesh.position.z = p.distance * Math.sin(p.angle);
      p.mesh.rotation.y += 0.01;
    });
  }
  renderer.render(scene, camera);
}
animate();

// === Responsive Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
