document.addEventListener("DOMContentLoaded", () => {
  // Wait for DOM to be fully loaded
  setupPortfolioCarousel();
});

function setupPortfolioCarousel() {
  // Only initialize reactions once
  if (!localStorage.getItem("reactions")) {
    const dummyData = {
      "project-0": { "👍": 4, "❤️": 2 },
      "project-1": { "🔥": 3, "👏": 1 },
      "project-2": { "🚀": 5, "😎": 2 },
      "project-3": { "🤯": 1, "❤️": 1 },
      "project-4": { "👍": 3, "😎": 1 },
    };
    localStorage.setItem("reactions", JSON.stringify(dummyData));
  }

  // Preload the audio file
  const emojiSound = new Audio("emoji.wav");

  // Get the projects container
  const projectsContainer = document.querySelector(".projects-container");
  if (!projectsContainer) return;

  // Replace the existing content with our carousel
  projectsContainer.innerHTML = "";
  projectsContainer.classList.add("carousel-container");

  // Create carousel track to hold the bubbles
  const carouselTrack = document.createElement("div");
  carouselTrack.className = "carousel-track";
  projectsContainer.appendChild(carouselTrack);

  // Project data - UPDATED with your actual projects from the PDF
  const projects = [
    {
      title: "Angry Birds Game",
      description:
        "Built the game using LibGDX to implement the GUI. Used Object-Oriented Programming concepts to implement a scalable model and represented those in a UML Diagram.",
      link: "https://github.com/Adamya10000/angry_birds",
      color: "rgba(255, 165, 0, 0.2)", // Orange with low opacity
    },
    {
      title: "RISCV Assembler & Simulator",
      description:
        "Built a RISC-V Assembler and Simulator in Python, implementing load/store operations, binary operations, and ISA handling to simulate instruction execution.",
      link: "https://github.com/tanishhgoel/RISCV",
      color: "rgba(255, 165, 0, 0.25)",
    },
    {
      title: "ByteMe Canteen System",
      description:
        "Developed a canteen management system with CLI (Java) and GUI (JavaFX) integration, enabling data transfer through file handling and efficient management using multithreading.",
      link: "https://github.com/tanishhgoel/ByteMe-CLI-GUI/tree/master",
      color: "rgba(255, 165, 0, 0.3)",
    },
    {
      title: "TEDx Poster",
      description:
        "Followed the classic Red and Black Tedx theme to create a poster for TEDxIIITD using Figma tools and Adobe Illustrator.",
      link: "https://pin.it/5kf5g06Ct",
      color: "rgba(255, 165, 0, 0.35)",
    },
    {
      title: "TEDx Ticket",
      description:
        "Followed the classic Red and Black Tedx theme to create a ticket for TEDxIIITD using Figma tools and Adobe Illustrator.",
      link: "https://pin.it/6ssr1mAor",
      color: "rgba(255, 165, 0, 0.4)",
    },
  ];

  // Create bubble for each project
  projects.forEach((project, index) => {
    const bubble = document.createElement("div");
    bubble.className = "carousel-bubble";
    bubble.dataset.index = index;

    // Content inside bubble
    bubble.innerHTML = `
            <div class="bubble-content">
              <h3>${project.title}</h3>
              <p class="bubble-description">${project.description}</p>
              <a href="${project.link}" class="project-link">View Project</a>
            </div>
          `;

    // Set initial styles - all bubbles will be visible but positioned differently
    bubble.style.display = "flex";

    // Add click handler with two functionalities:
    // 1. Navigate carousel if not the active bubble
    // 2. Open project detail if it's the active bubble and not clicking a link
    bubble.addEventListener("click", (e) => {
      // If clicking a link, let the link handle it
      if (e.target.tagName === "A") {
        return;
      }

      // If not the active bubble, just navigate the carousel
      if (parseInt(bubble.dataset.index) !== activeBubbleIndex) {
        e.preventDefault();
        setActiveBubble(parseInt(bubble.dataset.index));
      }
      // If already active bubble and not a link click, open project detail
      // The actual navigation will be handled by the project-detail-navigation.js script
    });

    // Create reaction box (hidden by default)
    const reactionBox = document.createElement("div");
    reactionBox.className = "reaction-box";
    reactionBox.style.display = "none"; // Hide by default

    const emojis = ["👍", "❤️", "🔥", "😎", "🚀", "👏", "🤯"];
    const projectId = `project-${index}`;

    // Load reactions from localStorage
    const reactionData = JSON.parse(localStorage.getItem("reactions") || "{}");
    const projectReactions = reactionData[projectId] || {};

    // Track user's current reaction for this project
    const userCurrentReaction = localStorage.getItem(`voted-${projectId}`);

    // Create emoji buttons and count display
    emojis.forEach((emoji) => {
      const emojiBtn = document.createElement("span");
      emojiBtn.className = "emoji";
      // Add selected class if this is the user's current reaction
      if (userCurrentReaction === emoji) {
        emojiBtn.classList.add("selected");
      }
      emojiBtn.textContent = emoji;

      const count = projectReactions[emoji] || 0;
      const countSpan = document.createElement("span");
      countSpan.className = "emoji-count";
      countSpan.innerText = count;

      const wrapper = document.createElement("div");
      wrapper.className = "emoji-wrapper";
      wrapper.appendChild(emojiBtn);
      wrapper.appendChild(countSpan);

      // Allow clicking on all emojis, but handle differently if already voted
      emojiBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        // Play emoji sound
        const soundClone = emojiSound.cloneNode();
        soundClone.play();

        // Get latest reaction data to prevent overwriting others' changes
        const currentReactionData = JSON.parse(
          localStorage.getItem("reactions") || "{}"
        );
        currentReactionData[projectId] = currentReactionData[projectId] || {};

        const previousReaction = localStorage.getItem(`voted-${projectId}`);

        // If user already reacted with this emoji, remove the reaction
        if (previousReaction === emoji) {
          // Decrement count for this emoji
          if (currentReactionData[projectId][emoji] > 0) {
            currentReactionData[projectId][emoji] -= 1;
          }
          // Remove user's vote record
          localStorage.removeItem(`voted-${projectId}`);
          emojiBtn.classList.remove("selected");
        }
        // If user already reacted with a different emoji, change the reaction
        else if (previousReaction) {
          // Decrement count for previous emoji
          if (
            currentReactionData[projectId][previousReaction] &&
            currentReactionData[projectId][previousReaction] > 0
          ) {
            currentReactionData[projectId][previousReaction] -= 1;
          }

          // Increment count for new emoji
          currentReactionData[projectId][emoji] =
            (currentReactionData[projectId][emoji] || 0) + 1;

          // Update user's vote record
          localStorage.setItem(`voted-${projectId}`, emoji);

          // Update UI to show selected state
          document
            .querySelectorAll(`.carousel-bubble[data-index="${index}"] .emoji`)
            .forEach((el) => {
              el.classList.remove("selected");
            });
          emojiBtn.classList.add("selected");
        }
        // If first time reacting to this project
        else {
          // Increment count for this emoji
          currentReactionData[projectId][emoji] =
            (currentReactionData[projectId][emoji] || 0) + 1;

          // Record user's vote
          localStorage.setItem(`voted-${projectId}`, emoji);
          emojiBtn.classList.add("selected");
        }

        // Save updated reaction data
        localStorage.setItem("reactions", JSON.stringify(currentReactionData));

        // Update the count display
        updateReactionCounts(index);
      });

      reactionBox.appendChild(wrapper);
    });

    bubble.appendChild(reactionBox);
    carouselTrack.appendChild(bubble);

    // Add hover event to show/hide reaction box
    bubble.addEventListener("mouseenter", () => {
      reactionBox.style.display = "flex";
    });

    bubble.addEventListener("mouseleave", () => {
      reactionBox.style.display = "none";
    });
  });

  // Add bottom navigation container
  const navContainer = document.createElement("div");
  navContainer.className = "carousel-nav-container";

  // Add navigation controls
  const prevButton = document.createElement("button");
  prevButton.className = "carousel-nav prev";
  prevButton.innerHTML = "&lt;";
  prevButton.addEventListener("click", () => navigateCarousel("prev"));

  const nextButton = document.createElement("button");
  nextButton.className = "carousel-nav next";
  nextButton.innerHTML = "&gt;";
  nextButton.addEventListener("click", () => navigateCarousel("next"));

  // Add indicators to show current position
  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";

  for (let i = 0; i < projects.length; i++) {
    const dot = document.createElement("span");
    dot.className = "carousel-dot";
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => setActiveBubble(i));
    indicators.appendChild(dot);
  }

  // Add elements to the navigation container
  navContainer.appendChild(prevButton);
  navContainer.appendChild(indicators);
  navContainer.appendChild(nextButton);

  // Add navigation container to the projects container
  projectsContainer.appendChild(navContainer);

  // Set initial active bubble
  setActiveBubble(0);

  // Set up keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") navigateCarousel("prev");
    if (e.key === "ArrowRight") navigateCarousel("next");
  });

  // Add mouse wheel scrolling support with reduced sensitivity
  // CHANGED: Increased threshold by 5x from original
  let wheelDelta = 0;
  const wheelThreshold = 1100; // Significantly increased from original 100 (5x less sensitive)

  projectsContainer.addEventListener(
    "wheel",
    (e) => {
      // Only intercept if horizontal scroll is more significant than vertical
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();

        const delta = e.deltaX;
        wheelDelta += delta;

        if (Math.abs(wheelDelta) >= wheelThreshold) {
          if (wheelDelta > 0) {
            navigateCarousel("next");
          } else {
            navigateCarousel("prev");
          }
          wheelDelta = 0;
        }
      }
      // else let the page scroll vertically
    },
    { passive: false }
  );

  // Add touch/swipe support with increased threshold
  let touchStartX = 0;
  projectsContainer.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  projectsContainer.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Increased touch threshold to 150 (was 100)
    if (Math.abs(diff) > 150) {
      if (diff > 0) {
        navigateCarousel("next");
      } else {
        navigateCarousel("prev");
      }
    }
  });

  // Add CSS for the selected emoji state
  const style = document.createElement("style");
  style.textContent = `
    .emoji.selected {
      background-color: rgba(255, 165, 0, 0.2);
      border-radius: 50%;
      padding: 2px;
    }
    
    .reaction-box {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 12px;
      transition: opacity 0.3s ease;
    }
  `;
  document.head.appendChild(style);
}

// Helper function to update reaction counts in the UI
function updateReactionCounts(projectIndex) {
  const projectId = `project-${projectIndex}`;
  const reactionData = JSON.parse(localStorage.getItem("reactions") || "{}");
  const projectReactions = reactionData[projectId] || {};

  // Update all emoji count displays for this project
  const countElements = document.querySelectorAll(
    `.carousel-bubble[data-index="${projectIndex}"] .emoji-count`
  );
  const emojiElements = document.querySelectorAll(
    `.carousel-bubble[data-index="${projectIndex}"] .emoji`
  );

  emojiElements.forEach((emojiEl, i) => {
    const emoji = emojiEl.textContent;
    const count = projectReactions[emoji] || 0;
    countElements[i].innerText = count;
  });
}

// Current active bubble index
let activeBubbleIndex = 0;

function setActiveBubble(index) {
  const bubbles = document.querySelectorAll(".carousel-bubble");
  const dots = document.querySelectorAll(".carousel-dot");
  const totalBubbles = bubbles.length;

  if (index < 0 || index >= totalBubbles) return;

  // Update all bubbles with circular arc positioning
  bubbles.forEach((bubble, i) => {
    // Calculate relative position from active (-2, -1, 0, 1, 2)
    let relativePosition = (i - index + totalBubbles) % totalBubbles;
    if (relativePosition > totalBubbles / 2) relativePosition -= totalBubbles;

    // Scale, opacity, and z-index based on position
    let scale, opacity, zIndex, translateX, translateY, translateZ, rotateY;

    // Central bubble is full size, others are smaller
    scale = 1 - Math.min(Math.abs(relativePosition) * 0.15, 0.6);

    // Central bubble is fully opaque, others fade out
    if (i === index) {
      opacity = 1;
    } else {
      opacity = 1 - Math.min(Math.abs(relativePosition) * 0.45, 0.9);
    }

    // Z-index ensures correct stacking
    zIndex = totalBubbles - Math.abs(relativePosition);

    // X position is offset from center
    translateX = relativePosition * 300 + "px";

    // Y position creates slight arc
    translateY = Math.abs(relativePosition) * 100 + "px";

    // Z position creates depth
    translateZ = -Math.abs(relativePosition) * 250 + "px";

    // Slight rotation for arc effect
    rotateY = -relativePosition * 15 + "deg";

    // Apply transforms
    bubble.style.transform = `translate3d(${translateX}, ${translateY}, ${translateZ}) scale(${scale}) rotateY(${rotateY})`;
    bubble.style.opacity = opacity;
    bubble.style.zIndex = zIndex;

    // Remove active class from all
    bubble.classList.remove("active");
    dots[i].classList.remove("active");
  });

  // Add active class to selected
  bubbles[index].classList.add("active");
  dots[index].classList.add("active");

  // Update the active index
  activeBubbleIndex = index;
}

function navigateCarousel(direction) {
  const bubbles = document.querySelectorAll(".carousel-bubble");
  const totalBubbles = bubbles.length;

  if (direction === "next") {
    setActiveBubble((activeBubbleIndex + 1) % totalBubbles);
  } else {
    setActiveBubble((activeBubbleIndex - 1 + totalBubbles) % totalBubbles);
  }
}
