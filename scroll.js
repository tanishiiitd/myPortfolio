// scroll.js

// === Bubble sound setup on cursor movement ===
const bubbleSound = new Audio("bubble3.mp3");
bubbleSound.volume = 0.1;

let audioInitialized = false;
let movementThrottle = false;

function initializeAudioContext() {
  if (!audioInitialized) {
    bubbleSound.play().catch(() => {});
    audioInitialized = true;
  }
}

function playBubbleSound() {
  if (!movementThrottle && audioInitialized) {
    movementThrottle = true;
    bubbleSound.currentTime = 0;
    bubbleSound.play().catch(() => {});
    setTimeout(() => {
      movementThrottle = false;
    }, 500); // Adjust delay between sound plays
  }
}

// Unlock audio context once via click/tap
window.addEventListener("click", initializeAudioContext);
window.addEventListener("touchstart", initializeAudioContext);

// Play sound on mouse movement
window.addEventListener("mousemove", () => {
  initializeAudioContext();
  playBubbleSound();
});

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Get all sections
  const sections = document.querySelectorAll(".section");

  // Initialize section animations
  initSectionAnimations();

  // Setup project bubbles
  setupProjectBubbles();

  // Make the blob reveal follow scroll position as well as mouse
  updateBlobOnScroll();

  // Create scroll markers for better animation triggering
  createScrollMarkers();
});

function createScrollMarkers() {
  // Create hidden markers for precise scroll triggering
  const heroMarker = document.createElement("div");
  heroMarker.id = "hero-marker";
  heroMarker.style.position = "absolute";
  heroMarker.style.top = "95vh";
  heroMarker.style.visibility = "hidden";

  const portfolioMarker = document.createElement("div");
  portfolioMarker.id = "portfolio-marker";
  portfolioMarker.style.position = "absolute";
  portfolioMarker.style.top = "105vh";
  portfolioMarker.style.visibility = "hidden";

  document.body.appendChild(heroMarker);
  document.body.appendChild(portfolioMarker);
}

function updateBlobOnScroll() {
  window.addEventListener("scroll", () => {
    const scrollPercent =
      window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const virtualMouseY = window.innerHeight * (0.5 + scrollPercent * 0.5);

    if (typeof mouse !== "undefined") {
      mouse.y = mouse.y * 0.7 + virtualMouseY * 0.3;
    }
  });
}

function initSectionAnimations() {
  // Hero section (already visible)
  gsap.from("#hero .content", {
    opacity: 0,
    y: 50,
    duration: 1,
    ease: "power2.out",
  });

  // Portfolio section animation
  gsap.from("#portfolio .content", {
    opacity: 0,
    y: 100,
    duration: 1,
    scrollTrigger: {
      trigger: "#portfolio",
      start: "top 80%",
      end: "top 40%",
      scrub: true,
    },
  });

  // Project bubbles staggered animation
  gsap.from(".project-bubble", {
    scale: 0.5,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    scrollTrigger: {
      trigger: ".projects-container",
      start: "top 80%",
      end: "top 30%",
      scrub: true,
    },
  });

  // Contact section animation
  gsap.from("#contact .content", {
    opacity: 0,
    y: 100,
    duration: 1,
    scrollTrigger: {
      trigger: "#contact",
      start: "top 80%",
      end: "top 40%",
      scrub: true,
    },
  });

  // Contact form and info staggered animation
  gsap.from("#contact-form, .contact-info", {
    opacity: 0,
    x: function (i) {
      return i % 2 === 0 ? -50 : 50;
    },
    stagger: 0.3,
    duration: 1,
    scrollTrigger: {
      trigger: ".contact-container",
      start: "top 80%",
      end: "top 50%",
      scrub: true,
    },
  });
}

function setupProjectBubbles() {
  // Get all project bubbles
  const projectBubbles = document.querySelectorAll(".project-bubble");

  // Add hover effects with GSAP
  projectBubbles.forEach((bubble) => {
    bubble.addEventListener("mouseenter", () => {
      gsap.to(bubble, {
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        scale: 1.05,
        duration: 0.3,
      });
    });

    bubble.addEventListener("mouseleave", () => {
      gsap.to(bubble, {
        backgroundColor: "rgba(255, 165, 0, 0.1)",
        scale: 1,
        duration: 0.3,
      });
    });
  });
}
