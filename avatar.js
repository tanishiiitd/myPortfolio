document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("avatar-toggle");
  const avatarContainer = document.getElementById("live2d-container");
  const avatarDialogue = document.getElementById("avatar-dialogue");

  // Debug function to check library loading
  function debugLive2D() {
    console.log("Debugging Live2D loading:");
    console.log("PIXI available:", typeof PIXI !== "undefined");
    console.log(
      "Live2DCubismCore available:",
      typeof Live2DCubismCore !== "undefined"
    );
    console.log(
      "PIXI.live2d available:",
      PIXI && typeof PIXI.live2d !== "undefined"
    );
  }

  // Call debug function to verify libraries
  setTimeout(debugLive2D, 1000);

  let botResponses = {
    greeting: [
      "Hi there!",
      "Hello! How can I help?",
      "Welcome to Tanish's portfolio!",
      "Search up a project name to see it!",
    ],
    project: [
      "Check out my latest projects!",
      "I've been working on some cool stuff!",
      "Want to see what I've built?",
      "Search up a project name to see it!",
    ],
    contact: [
      "Let's connect!",
      "Feel free to reach out!",
      "I'd love to hear from you!",
    ],
    skills: [
      "I specialize in backend and API development.",
      "I'm proficient in several programming languages!",
      "Ask me about my technical skills!",
    ],
    random: [
      "Did you know I'm studying at IIITD?",
      "I love exploring new technologies!",
      "Fun fact: I built this website from scratch!",
    ],
  };

  // Avatar state
  let avatarState = {
    isVisible: false,
    isLoading: false,
    model: null,
    app: null,
  };

  // Make avatar state accessible globally for debugging
  window.avatarState = avatarState;

  // Toggle functionality
  toggleBtn.addEventListener("click", toggleAvatar);

  // Add hover functionality to toggle the avatar
  toggleBtn.addEventListener("mouseenter", () => {
    toggleBtn.classList.add("hover");
    // Show avatar when hovered over
    if (!avatarState.isVisible) {
      showAvatar();
    }
  });

  toggleBtn.addEventListener("mouseleave", () => {
    toggleBtn.classList.remove("hover");
  });

  // Add CSS for hover state
  const style = document.createElement("style");
  style.textContent = `
      #avatar-toggle.hover {
        background-color: #ff9d00 !important;
        transform: scale(1.1);
        transition: all 0.3s ease;
      }
    `;
  document.head.appendChild(style);

  // Close avatar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      avatarState.isVisible &&
      !avatarContainer.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      hideAvatar();
    }
  });

  // Function to toggle avatar visibility
  function toggleAvatar() {
    if (avatarState.isVisible) {
      hideAvatar();
    } else {
      showAvatar();
    }
  }

  // Show avatar function - made globally accessible
  window.showAvatar = function () {
    console.log("Showing avatar");
    avatarContainer.style.display = "flex";
    avatarContainer.classList.add("avatar-visible");
    toggleBtn.classList.add("active");
    avatarState.isVisible = true;

    // Display loading message
    setMessage("Loading my avatar...");

    // Initialize Live2D avatar if not already loaded
    if (!avatarState.model) {
      // Add small delay to ensure DOM is fully ready
      setTimeout(() => {
        initLive2DAvatar();
      }, 300);
    } else {
      // Avatar is already loaded, show a greeting
      showRandomResponse("greeting");
    }

    // Always ensure search is set up
    setTimeout(setupProjectSearch, 500);
  };

  // Hide avatar
  function hideAvatar() {
    avatarContainer.classList.remove("avatar-visible");
    setTimeout(() => {
      if (!avatarState.isVisible) {
        avatarContainer.style.display = "none";
      }
    }, 300);
    toggleBtn.classList.remove("active");
    avatarState.isVisible = false;
  }

  // Initialize the Live2D avatar with better error handling
  function initLive2DAvatar() {
    console.log("Initializing Live2D Avatar");

    if (typeof PIXI === "undefined" || !PIXI.live2d) {
      console.error("Live2D libraries not loaded properly!");
      setMessage("Avatar couldn't load. Libraries missing!");
      return;
    }

    try {
      if (avatarState.app) {
        avatarState.app.destroy(true);
        avatarState.app = null;
      }

      const canvas = document.getElementById("live2d-canvas");
      if (!canvas) {
        console.error("Live2D canvas element not found!");
        setMessage("Avatar couldn't load. Canvas missing!");
        return;
      }

      // Create PIXI Application with explicit renderer settings
      avatarState.app = new PIXI.Application({
        view: canvas,
        transparent: true,
        autoStart: true,
        width: 300,
        height: 400,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });

      // Try multiple models - different order and sources
      const modelOptions = [
        // Try these Cubism 2.0 models first (more compatible)
        "https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json",
        "https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json",
        "https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json",
        "https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json",
        // Then try the original models
        "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/example/models/shizuku/shizuku.model.json",
        "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/example/models/haru/haru_greeter_t03.model3.json",
      ];

      console.log("Attempting to load Live2D models");
      tryLoadModels(modelOptions, 0);
    } catch (error) {
      console.error("Error initializing Live2D:", error);
      setMessage("Error loading avatar: " + error.message);
    }
  }

  // Improved model loading with better logging
  function tryLoadModels(models, index) {
    if (index >= models.length) {
      console.error("All models failed to load");
      setMessage("I couldn't load my avatar, but I'm still here to help!");
      return;
    }

    console.log(
      `Trying to load model ${index + 1}/${models.length}: ${models[index]}`
    );
    setMessage(`Loading my avatar... (${index + 1}/${models.length})`);

    // Try loading with timeout
    const modelLoadTimeout = setTimeout(() => {
      console.warn(`Model load timed out: ${models[index]}`);
      tryLoadModels(models, index + 1);
    }, 10000); // 10 second timeout

    PIXI.live2d.Live2DModel.from(models[index])
      .then((model) => {
        clearTimeout(modelLoadTimeout);
        console.log("Model loaded successfully:", models[index]);

        avatarState.model = model;

        // Set up the model
        model.scale.set(0.25);
        model.x = 150;
        model.y = 225;

        // Add to stage
        if (avatarState.app && avatarState.app.stage) {
          avatarState.app.stage.addChild(model);
        } else {
          console.error("App or stage not available");
          setMessage("Error: App or stage not available");
          return;
        }

        // Add interactivity
        model.on("hit", (hitAreas) => {
          if (hitAreas.includes("Head")) {
            showRandomResponse("greeting");
            playMotion(model, "tap_body");
          } else if (hitAreas.includes("Body")) {
            showRandomResponse("random");
            playMotion(model, "flick_head");
          }
        });

        // Make model look at cursor
        document
          .getElementById("live2d-canvas")
          .addEventListener("mousemove", (e) => {
            const rect = e.target.getBoundingClientRect();
            const point = {
              x: (e.clientX - rect.left) / model.scale.x,
              y: (e.clientY - rect.top) / model.scale.y,
            };
            model.focus(point.x, point.y);
          });

        // Start random idle motion
        if (model.internalModel && model.internalModel.motionManager) {
          model.internalModel.motionManager.startRandomMotion("idle", 2);
        }

        showRandomResponse("greeting");
        setupProjectSearch(); // Ensure search is set up after model loads
      })
      .catch((err) => {
        clearTimeout(modelLoadTimeout);
        console.error(`Failed to load model ${index}:`, err);
        // Try the next model
        tryLoadModels(models, index + 1);
      });
  }

  // Play a specific motion on the model
  function playMotion(model, motionGroup) {
    if (!model || !model.internalModel || !model.internalModel.motionManager) {
      console.warn("Cannot play motion - model not properly initialized");
      return;
    }

    try {
      // First try the specific motion group
      if (model.internalModel.definitions.motions[motionGroup]) {
        model.internalModel.motionManager.startRandomMotion(motionGroup, 2);
      }
      // If not available, try a generic one
      else if (model.internalModel.definitions.motions.tap_body) {
        model.internalModel.motionManager.startRandomMotion("tap_body", 2);
      } else if (model.internalModel.definitions.motions.idle) {
        model.internalModel.motionManager.startRandomMotion("idle", 2);
      }
    } catch (error) {
      console.error("Error playing motion:", error);
    }
  }

  // Update the message in the dialogue box - make globally accessible
  window.setMessage = function (message) {
    console.log("Setting message:", message);
    const messageElement = avatarDialogue.querySelector(".message");
    if (messageElement) {
      messageElement.textContent = message;
    } else {
      console.warn("Message element not found in dialogue box");
    }
  };

  function showRandomResponse(category) {
    const responses = botResponses[category] || botResponses.random;
    const randomIndex = Math.floor(Math.random() * responses.length);
    setMessage(responses[randomIndex]);
  }

  // Add input functionality to chat with the avatar
  function setupChatInput() {
    // Create chat input if it doesn't exist
    if (!document.getElementById("avatar-chat-input")) {
      const inputContainer = document.createElement("div");
      inputContainer.className = "avatar-chat-input-container";

      const input = document.createElement("input");
      input.id = "avatar-chat-input";
      input.type = "text";
      input.placeholder = "Ask me something...";

      const sendBtn = document.createElement("button");
      sendBtn.innerHTML = "Send";
      sendBtn.className = "avatar-chat-send";

      inputContainer.appendChild(input);
      inputContainer.appendChild(sendBtn);
      avatarDialogue.appendChild(inputContainer);

      // Improved handle input submission with better project matching
      function handleInputSubmit() {
        const userInput = input.value.trim().toLowerCase();
        if (!userInput) return;

        console.log("Processing chat input:", userInput);
        input.value = "";

        // First check for project opening commands
        if (
          userInput.includes("open") ||
          userInput.includes("show") ||
          userInput.includes("view") ||
          userInput.includes("go to")
        ) {
          // Extract project name by removing action words
          const projectQuery = userInput
            .replace(/open|show|view|go to|me|the/gi, "")
            .trim();

          console.log("Looking for project:", projectQuery);

          // Try to find a matching project with flexible matching
          const projectMatch = projectDatabase.find(
            (project) =>
              projectQuery.includes(project.id) ||
              project.id.includes(projectQuery) ||
              projectQuery.includes(project.name.toLowerCase()) ||
              project.name.toLowerCase().includes(projectQuery) ||
              project.keywords.some(
                (kw) => kw.includes(projectQuery) || projectQuery.includes(kw)
              )
          );

          if (projectMatch) {
            console.log("Found project match:", projectMatch.name);
            window.location.href = projectMatch.url;
            setMessage(`Opening ${projectMatch.name}...`);
            return;
          }
        }

        // Standard response logic based on keywords
        if (userInput.includes("project") || userInput.includes("work")) {
          showRandomResponse("project");
          navigateTo("#portfolio");
        } else if (
          userInput.includes("contact") ||
          userInput.includes("email") ||
          userInput.includes("reach")
        ) {
          showRandomResponse("contact");
          navigateTo("#contact");
        } else if (userInput.includes("home") || userInput.includes("about")) {
          navigateTo("#hero");
          setMessage("Welcome to my portfolio!");
        } else if (userInput.includes("skill") || userInput.includes("know")) {
          showRandomResponse("skills");
        } else if (userInput.includes("hello") || userInput.includes("hi")) {
          showRandomResponse("greeting");
        } else {
          // Check if it might be a project name without commands
          const directProjectMatch = projectDatabase.find(
            (project) =>
              project.keywords.some((keyword) => userInput.includes(keyword)) ||
              userInput.includes(project.id) ||
              userInput.includes(project.name.toLowerCase())
          );

          if (directProjectMatch) {
            window.location.href = directProjectMatch.url;
            setMessage(`Opening ${directProjectMatch.name}...`);
          } else {
            setMessage(
              "I'm still learning! Try asking about my projects, skills, or how to contact me."
            );
          }
        }

        // Play talking motion
        if (avatarState.model) {
          playMotion(avatarState.model, "tap_body");
        }
      }

      // Make handleInputSubmit globally accessible
      window.handleInputSubmit = handleInputSubmit;

      sendBtn.addEventListener("click", handleInputSubmit);
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleInputSubmit();
      });
    }
  }

  // Add chat input after a short delay
  setTimeout(setupChatInput, 1000);

  // Make setupProjectSearch globally accessible
  window.setupProjectSearch = setupProjectSearch;
});

// Navigation function available globally
function navigateTo(sectionId) {
  document.querySelector(sectionId).scrollIntoView({ behavior: "smooth" });

  // Visual feedback on navigation
  const section = document.querySelector(sectionId);
  section.classList.add("section-highlight");
  setTimeout(() => {
    section.classList.remove("section-highlight");
  }, 1000);
}

// Project database from Links.pdf
const projectDatabase = [
  {
    id: "angry-birds",
    name: "Angry Birds Game",
    keywords: ["angry birds", "game", "birds", "gaming"],
    url: "project-detail.html?id=0&title=Angry%20Birds%20Game&description=An%20interactive%20game%20inspired%20by%20the%20classic%20Angry%20Birds.",
  },
  {
    id: "riscv-simulator",
    name: "RISCV Assembler & Simulator",
    keywords: ["riscv", "simulator", "assembler", "assembly", "compiler"],
    url: "project-detail.html?id=1&title=RISCV%20Assembler%20%26%20Simulator&description=A%20simulator%20and%20assembler%20for%20RISC-V%20architecture.",
  },
  {
    id: "byteme-canteen",
    name: "ByteMe Canteen System",
    keywords: ["byteme", "canteen", "food", "system", "byteme canteen"],
    url: "project-detail.html?id=2&title=ByteMe%20Canteen%20System&description=A%20digital%20system%20for%20managing%20canteen%20operations.",
  },
  {
    id: "tedx-poster",
    name: "TEDx Poster",
    keywords: ["tedx", "poster", "design", "ted"],
    url: "project-detail.html?id=3&title=TEDx%20Poster&description=Poster%20design%20for%20a%20TEDx%20event.",
  },
  {
    id: "tedx-ticket",
    name: "TEDx Ticket",
    keywords: ["tedx", "ticket", "design", "ted"],
    url: "project-detail.html?id=4&title=TEDx%20Ticket&description=Ticket%20design%20for%20a%20TEDx%20event.",
  },
];

// Add search functionality to avatar - improved to prevent duplicates
function setupProjectSearch() {
  // Check if search container already exists to prevent duplicates
  if (document.querySelector(".avatar-search-container")) {
    console.log("Search already set up, skipping...");
    return; // Exit if search is already set up
  }

  console.log("Setting up project search...");

  // Create a search box in the avatar container
  const searchContainer = document.createElement("div");
  searchContainer.className = "avatar-search-container";
  searchContainer.innerHTML = `
        <div class="search-wrapper">
          <input type="text" id="project-search" placeholder="Search for a project...">
          <button id="search-button">Search</button>
        </div>
        <div id="search-results" class="search-results"></div>
      `;

  // Add search box to avatar dialogue
  const avatarDialogue = document.getElementById("avatar-dialogue");
  if (avatarDialogue) {
    avatarDialogue.appendChild(searchContainer);
  } else {
    console.warn("Avatar dialogue element not found");
    return;
  }

  // Style the search components
  const style = document.createElement("style");
  style.textContent = `
        .avatar-search-container {
          margin-top: 15px;
          border-top: 1px solid rgba(255, 157, 0, 0.3);
          padding-top: 15px;
          width: 100%;
        }
        
        .search-wrapper {
          display: flex;
          gap: 5px;
          margin-bottom: 10px;
        }
        
        #project-search {
          flex: 1;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid rgba(255, 157, 0, 0.5);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          font-size: 12px;
        }
        
        #search-button {
          background: rgba(255, 157, 0, 0.8);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s ease;
        }
        
        #search-button:hover {
          background: rgba(255, 123, 0, 1);
        }
        
        .search-results {
          margin-top: 10px;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .search-result-item {
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 5px;
          background: rgba(255, 157, 0, 0.1);
          transition: background 0.2s ease;
        }
        
        .search-result-item:hover {
          background: rgba(255, 157, 0, 0.3);
        }
      `;
  document.head.appendChild(style);

  // Add event listeners with a delay to ensure elements are loaded
  setTimeout(() => {
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("project-search");
    const searchResults = document.getElementById("search-results");

    if (!searchButton || !searchInput || !searchResults) {
      console.error("Search elements not found");
      return;
    }

    function performSearch() {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        searchResults.innerHTML = "";
        return;
      }

      console.log("Searching for:", query);

      // Search for matching projects
      const matches = projectDatabase.filter((project) => {
        // Check if query matches name or any keywords
        return (
          project.name.toLowerCase().includes(query) ||
          project.id.includes(query) ||
          project.keywords.some(
            (keyword) => keyword.includes(query) || query.includes(keyword)
          )
        );
      });

      console.log("Found matches:", matches.length);

      // Display results
      if (matches.length > 0) {
        searchResults.innerHTML = matches
          .map(
            (project) => `
              <div class="search-result-item" data-url="${project.url}">
                ${project.name}
              </div>
            `
          )
          .join("");

        // Add click handlers to results
        document.querySelectorAll(".search-result-item").forEach((item) => {
          item.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            console.log("Opening project:", this.textContent.trim());
            window.location.href = url;

            // Update avatar message
            if (window.setMessage && typeof window.setMessage === "function") {
              window.setMessage(`Opening ${this.textContent.trim()}...`);
            }
          });
        });
      } else {
        searchResults.innerHTML =
          '<div class="no-results">No projects found matching your search.</div>';
      }
    }

    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }, 500); // Short delay to ensure elements are created
}

// Open project by name - global function with improved matching
window.openProject = function (projectName) {
  if (!projectName) return false;

  const query = projectName.toLowerCase().trim();
  console.log("Opening project by name:", query);

  const project = projectDatabase.find(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      query.includes(p.name.toLowerCase()) ||
      p.id.includes(query) ||
      query.includes(p.id) ||
      p.keywords.some((k) => k.includes(query) || query.includes(k))
  );

  if (project) {
    console.log("Project found:", project.name);
    window.location.href = project.url;
    return true;
  }

  console.log("No matching project found");
  return false;
};
