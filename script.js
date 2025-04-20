// ===================
// Canvas Setup
// ===================
const backgroundCanvas = document.getElementById("background-canvas");
const overlayCanvas = document.getElementById("overlay");
const ctx = overlayCanvas.getContext("2d");

function resizeCanvas() {
  backgroundCanvas.width = window.innerWidth;
  backgroundCanvas.height = window.innerHeight;
  overlayCanvas.width = window.innerWidth;
  overlayCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===================
// Mouse Tracking
// ===================
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let lastMouse = { x: mouse.x, y: mouse.y };
let velocity = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// ===================
// Blob Setup
// ===================
const numPoints = 32;
const radius = 800;
const tension = 0.04;
const drag = 0.3;

let points = [];
for (let i = 0; i < numPoints; i++) {
  const angle = (i / numPoints) * 2 * Math.PI;
  points.push({
    angle,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    vx: 0,
    vy: 0,
  });
}

function updateBlob() {
  velocity.x = mouse.x - lastMouse.x;
  velocity.y = mouse.y - lastMouse.y;
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;

  const mag = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  const normVel =
    mag > 0 ? { x: velocity.x / mag, y: velocity.y / mag } : { x: 0, y: 0 };

  for (let p of points) {
    const targetX = Math.cos(p.angle) * radius;
    const targetY = Math.sin(p.angle) * radius;

    const normal = { x: -Math.sin(p.angle), y: Math.cos(p.angle) };
    const influence = normal.x * normVel.x + normal.y * normVel.y;
    const offset = influence * mag * 0.7;

    p.vx += (targetX - p.x) * tension + normVel.x * offset * drag;
    p.vy += (targetY - p.y) * tension + normVel.y * offset * drag;

    p.vx *= 0.92;
    p.vy *= 0.92;

    p.x += p.vx;
    p.y += p.vy;
  }
}

function drawBlob() {
  ctx.save();
  ctx.translate(mouse.x, mouse.y);
  ctx.globalCompositeOperation = "destination-out";

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const cpX = (p1.x + p2.x) / 2;
    const cpY = (p1.y + p2.y) / 2;
    if (i === 0) {
      ctx.moveTo(cpX, cpY);
    } else {
      ctx.quadraticCurveTo(p1.x, p1.y, cpX, cpY);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.globalCompositeOperation = "source-over";
}

const bubbles = [];
const maxBubbles = 25; // Maximum number of bubbles to show

function createBubble(x, y, velX, velY) {
  return {
    x,
    y,
    radius: Math.random() * 5 + 3, // Random size between 3-8
    velocityX: velX * 0.2 + (Math.random() - 0.5) * 0.5, // Use cursor movement but add some randomness
    velocityY: velY * 0.2 + (Math.random() - 0.5) * 0.5,
    opacity: 0.7, // Start with mid opacity
    decayRate: 0.01 + Math.random() * 0.02, // Random fade speed
  };
}

function updateBubbles() {
  // Create new bubbles based on cursor movement
  if (Math.abs(velocity.x) > 2 || Math.abs(velocity.y) > 2) {
    // Calculate position on the opposite side of cursor movement
    // This makes bubbles appear to trail behind the movement
    const angle = Math.atan2(velocity.y, velocity.x) + Math.PI; // Add PI to get opposite direction

    // Find a random point on the blob outline in the general direction of the angle
    const randomAngleOffset = (Math.random() - 0.5) * 0.8; // Random offset within ±0.4 radians
    const emissionAngle = angle + randomAngleOffset;

    // Get a point from the blob outline to spawn the bubble
    const pointIndex = Math.floor(
      (emissionAngle / (2 * Math.PI)) * points.length
    );
    const spawnPoint =
      points[pointIndex >= 0 && pointIndex < points.length ? pointIndex : 0];

    // Create bubble at the emission point, offset by the blob's current position
    if (
      bubbles.length < maxBubbles &&
      (Math.abs(velocity.x) > 3 || Math.abs(velocity.y) > 3)
    ) {
      bubbles.push(
        createBubble(
          mouse.x + spawnPoint.x,
          mouse.y + spawnPoint.y,
          -velocity.x, // Inverse velocity
          -velocity.y
        )
      );
    }
  }

  // Update existing bubbles
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bubble = bubbles[i];

    // Move the bubble
    bubble.x += bubble.velocityX;
    bubble.y += bubble.velocityY;

    // Slow down over time
    bubble.velocityX *= 0.98;
    bubble.velocityY *= 0.98;

    // Fade out
    bubble.opacity -= bubble.decayRate;

    // Remove faded bubbles
    if (bubble.opacity <= 0) {
      bubbles.splice(i, 1);
    }
  }
}

// ===================
// Orange Overlay + Blob Reveal
// ===================
function drawOverlay() {
  // Draw full orange layer with reduced opacity for better visibility
  const gradient = ctx.createRadialGradient(
    mouse.x,
    mouse.y,
    100,
    mouse.x,
    mouse.y,
    overlayCanvas.width * 0.8
  );
  gradient.addColorStop(0, "#ffa500"); // Orange color
  gradient.addColorStop(1, "#ffa500");

  ctx.fillStyle = gradient;
  ctx.globalAlpha = 1; // Reduce overall opacity
  ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.globalAlpha = 1.0; // Reset alpha
}

// ===================
// Draw Loop
// ===================
function draw() {
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  // First draw the orange overlay
  drawOverlay();

  // Then update and draw the blob (with destination-out)
  updateBlob();
  drawBlob();

  // Now draw bubbles with correct blending mode
  ctx.globalCompositeOperation = "source-over"; // Reset to default blending

  // Draw each bubble
  bubbles.forEach((bubble) => {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity})`; // White bubbles for better visibility
    ctx.fill();
  });

  // Update bubbles for next frame
  updateBubbles();

  requestAnimationFrame(draw);
}
draw();

// ===================
// 3D Setup (Three.js)
// ===================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({
  canvas: backgroundCanvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
// White hemisphere light with softer intensity
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
scene.add(hemiLight);

// White directional light with reduced intensity
const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(100, 100, 100);
scene.add(dirLight);

// White point light, subtle glow
const pointLight = new THREE.PointLight(0xffffff, 0.8, 200);
pointLight.position.set(0, 0, 50);
scene.add(pointLight);

const bottomRightLight = new THREE.PointLight(0xffa500, 2, 500);
bottomRightLight.position.set(150, -150, 100);
scene.add(bottomRightLight);

const bottomLeftLight = new THREE.PointLight(0xffa500, 2, 500);
bottomLeftLight.position.set(-150, -150, 100);
scene.add(bottomLeftLight);

hemiLight.intensity = 0.8;
dirLight.intensity = 0.5;
pointLight.intensity = 1.0;

// Create containers for different bubble groups
const heroSpheres = new THREE.Group();
scene.add(heroSpheres);

// Spheres
const spheres = [];
const sphereGeometry = new THREE.SphereGeometry(10, 32, 32);

const sphereMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    color: { value: new THREE.Color(0xffa500) }, // orange tint
    fresnelPower: { value: 2.5 },
  },
  vertexShader: `
    varying float vFresnel;

    void main() {
      vec3 viewDir = normalize(cameraPosition - (modelViewMatrix * vec4(position, 1.0)).xyz);
      vec3 normalDir = normalize(normalMatrix * normal);
      vFresnel = pow(1.0 - dot(viewDir, normalDir), 2.5);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    varying float vFresnel;

    void main() {
      vec3 glow = color * vFresnel;
      gl_FragColor = vec4(glow, vFresnel + 0.1); // soft edge glow, faint center
    }
  `,
});

// Create spheres and add data for animation
for (let i = 0; i < 15; i++) {
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());

  // Set initial position
  mesh.position.set(
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300
  );

  // Add to hero spheres group
  heroSpheres.add(mesh);

  // Store important properties for animation
  spheres.push({
    mesh,
    rotationSpeed: Math.random() * 0.02 + 0.005,
    initialY: mesh.position.y,
    velocityY: 0,
  });
}

// Scroll state tracking
let lastScrollY = window.scrollY;
let scrollDirection = 0; // 0: none, 1: down, -1: up
let scrollingToPortfolio = false;
let scrollingToHero = false;

// Listen for scroll events
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const scrollDiff = currentScrollY - lastScrollY;

  // Determine scroll direction
  if (scrollDiff > 0) {
    scrollDirection = 1; // scrolling down
  } else if (scrollDiff < 0) {
    scrollDirection = -1; // scrolling up
  }

  // Check if we're scrolling to portfolio section
  const portfolioSection = document.getElementById("portfolio");
  const heroSection = document.getElementById("hero");
  const portfolioTop = portfolioSection.getBoundingClientRect().top;
  const heroBottom = heroSection.getBoundingClientRect().bottom;

  // Transition to portfolio section
  if (portfolioTop < window.innerHeight && scrollDirection === 1) {
    scrollingToPortfolio = true;
    scrollingToHero = false;
  }

  // Transition back to hero section
  if (heroBottom > 0 && scrollDirection === -1) {
    scrollingToHero = true;
    scrollingToPortfolio = false;
  }

  // Apply different animations based on scroll state
  spheres.forEach((sphere, index) => {
    if (scrollingToPortfolio) {
      // Float up and out when scrolling to portfolio
      sphere.velocityY = -3 - Math.random() * 2;
      sphere.mesh.position.y += sphere.velocityY;

      // Random horizontal movement for more natural floating
      sphere.mesh.position.x += (Math.random() - 0.5) * 2;
    } else if (scrollingToHero) {
      // Fall down when scrolling back to hero
      sphere.velocityY += 0.2; // Gravity
      sphere.mesh.position.y += sphere.velocityY;

      // Bounce when reaching initial position
      if (sphere.mesh.position.y < sphere.initialY) {
        sphere.mesh.position.y = sphere.initialY;
        sphere.velocityY = -sphere.velocityY * 0.6; // Bounce with damping

        // Stop bouncing when the bounce is very small
        if (Math.abs(sphere.velocityY) < 0.5) {
          sphere.velocityY = 0;
        }
      }
    } else {
      // Normal floating behavior
      sphere.mesh.position.y -= scrollDiff * 0.05;
    }

    // Reset position if sphere goes too far out of view
    if (sphere.mesh.position.y < -300) {
      sphere.mesh.position.y = 300;
    } else if (sphere.mesh.position.y > 300) {
      sphere.mesh.position.y = -300;
    }
  });

  lastScrollY = currentScrollY;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate 3D
function animate3D() {
  requestAnimationFrame(animate3D);

  // Rotate the entire hero spheres group
  heroSpheres.rotation.y += 0.003;
  heroSpheres.rotation.x += 0.001;

  // Individual sphere rotations
  spheres.forEach(({ mesh, rotationSpeed }) => {
    mesh.rotation.x += rotationSpeed;
    mesh.rotation.y += rotationSpeed;
  });

  renderer.render(scene, camera);
}
animate3D();
