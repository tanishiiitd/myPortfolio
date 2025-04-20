// Initialize map when the document is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Map initialization started");

  // IIIT Delhi coordinates
  const iiitdCoords = [28.5494, 77.2714];
  // India center coordinates (approximate)
  const indiaCoords = [20.5937, 78.9629];

  // Create map centered on India with zoom level 5 (shows most of India)
  const map = L.map("map").setView(indiaCoords, 5);
  console.log("Map created with initial view of India");

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Add a marker for IIIT Delhi location
  const marker = L.marker(iiitdCoords)
    .addTo(map)
    .bindPopup("IIIT Delhi, Okhla Phase 3");

  console.log("Map tile layer and marker added");

  // Fix for map rendering issues
  setTimeout(() => {
    map.invalidateSize(true);
    console.log("Map size invalidated/recalculated");
  }, 100);

  // Add hover effects to map container
  const mapContainer = document.getElementById("map-container");
  if (!mapContainer) {
    console.error("Map container element not found!");
  } else {
    console.log("Map container found, adding hover events");
  }

  // When hovering over the map, zoom in to IIIT Delhi
  mapContainer?.addEventListener("mouseenter", function () {
    console.log("Mouse entered map container");
    map.flyTo(iiitdCoords, 13, {
      animate: true,
      duration: 1.5,
    });
    setTimeout(() => {
      marker.openPopup();
    }, 1500);
  });

  // When mouse leaves, zoom back out to show all of India
  mapContainer?.addEventListener("mouseleave", function () {
    console.log("Mouse left map container");
    map.flyTo(indiaCoords, 3.5, {
      animate: true,
      duration: 1.5,
    });
    marker.closePopup();
  });
});
