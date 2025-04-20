document.addEventListener("DOMContentLoaded", () => {
  // Set up project navigation
  setupProjectNavigation();
});

function setupProjectNavigation() {
  // Get all project cards - working with either the original project cards or the carousel bubbles
  const projectCards = document.querySelectorAll(
    ".project-card, .carousel-bubble"
  );

  projectCards.forEach((card, index) => {
    // Extract project data
    let title, description;

    if (card.classList.contains("project-card")) {
      // For original card design
      const frontSide = card.querySelector(".card-front");
      const backSide = card.querySelector(".card-back");

      title = frontSide.querySelector("h3").textContent;
      description = backSide.querySelector("p").textContent;
    } else if (card.classList.contains("carousel-bubble")) {
      // For carousel design
      const content = card.querySelector(".bubble-content");

      title = content.querySelector("h3").textContent;
      description = content.querySelector(".bubble-description").textContent;
    }

    // Add click event handler
    card.addEventListener("click", (e) => {
      // Prevent default behavior if it's a link click
      if (e.target.tagName === "A") {
        return; // Let link clicks pass through
      }

      // Prevent default for carousel navigation when using carousel design
      if (
        card.classList.contains("carousel-bubble") &&
        parseInt(card.dataset.index) !== activeBubbleIndex
      ) {
        return; // Let carousel navigation handle this
      }

      // Create URL parameters
      const params = new URLSearchParams();
      params.append("id", index);
      params.append("title", title);
      params.append("description", description);

      // Navigate to detail page
      window.location.href = `project-detail.html?${params.toString()}`;
    });
  });
}
