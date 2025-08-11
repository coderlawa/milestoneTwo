// Destinations Module using IIFE pattern
const DestinationsModule = (() => {
  // Private variables
  const API_ENDPOINT = "/api/destinations";
  let currentRegion = "global";

  // Cache DOM elements
  const elements = {
    topDestinations: document.getElementById("top-destinations"),
    trendingDestinations: document.getElementById("trending-destinations"),
    seasonalDestinations: document.getElementById("seasonal-destinations"),
    regionTitle: document.getElementById("region-title"),
    regionButtons: {
      global: document.getElementById("btn-global"),
      europe: document.getElementById("btn-europe"),
      asia: document.getElementById("btn-asia"),
      americas: document.getElementById("btn-americas"),
    },
  };

  // Private methods
  const fetchDestinations = async (region) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data for demonstration
      const mockData = {
        top: generateMockDestinations(5, "top"),
        trending: generateMockDestinations(3, "trending"),
        seasonal: generateMockDestinations(4, "seasonal"),
      };

      return mockData;
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return null;
    }
  };

  const generateMockDestinations = (count, type) => {
    const regions = {
      global: [
        "Paris",
        "Tokyo",
        "New York",
        "London",
        "Sydney",
        "Rome",
        "Barcelona",
        "Bali",
        "Dubai",
        "Singapore",
      ],
      europe: [
        "Paris",
        "Rome",
        "Barcelona",
        "Amsterdam",
        "Santorini",
        "Prague",
        "Venice",
        "Edinburgh",
        "Copenhagen",
        "Athens",
      ],
      asia: [
        "Tokyo",
        "Bangkok",
        "Bali",
        "Seoul",
        "Singapore",
        "Hong Kong",
        "Kyoto",
        "Hanoi",
        "Shanghai",
        "Mumbai",
      ],
      americas: [
        "New York",
        "Cancun",
        "Rio de Janeiro",
        "Vancouver",
        "Machu Picchu",
        "Los Angeles",
        "Miami",
        "Toronto",
        "Buenos Aires",
        "Chicago",
      ],
    };

    return Array.from({ length: count }, (_, i) => {
      const regionDestinations = regions[currentRegion] || regions.global;
      const name = `${regionDestinations[i % regionDestinations.length]} ${
        type === "seasonal" ? "Seasonal" : ""
      }`;
      const trend =
        type === "trending"
          ? ["up", "down", "neutral"][Math.floor(Math.random() * 3)]
          : null;

      return {
        id: `${type}-${i}-${Date.now()}`,
        name: name,
        image: `https://source.unsplash.com/random/600x400/?${name
          .split(",")[0]
          .toLowerCase()},city`,
        description: `Experience the beauty of ${name} with our exclusive travel packages.`,
        rank: i + 1,
        trend: trend,
        trendValue: trend ? Math.floor(Math.random() * 30) + 1 : null,
        tags: ["cultural", "beach", "mountain", "city", "historic"][
          Math.floor(Math.random() * 5)
        ],
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 50,
      };
    });
  };

  const renderDestinationCard = (destination, type) => {
    const card = document.createElement("div");
    card.className = "col";
    card.innerHTML = `
            <div class="card h-100 destination-card">
                <img src="${destination.image}" class="card-img-top" alt="${
      destination.name
    }" loading="lazy">
                <div class="card-body">
                    ${
                      type === "top"
                        ? `
                    <div class="d-flex align-items-center mb-2">
                        <span class="ranking-badge ${
                          destination.rank === 1
                            ? "gold"
                            : destination.rank === 2
                            ? "silver"
                            : "bronze"
                        }">
                            ${destination.rank}
                        </span>
                        <h3 class="h5 mb-0">${destination.name}</h3>
                    </div>
                    `
                        : `<h3 class="h5 mb-2">${destination.name}</h3>`
                    }
                    
                    ${
                      destination.trend
                        ? `
                    <div class="mb-2">
                        <span class="badge ${
                          destination.trend === "up"
                            ? "bg-success"
                            : destination.trend === "down"
                            ? "bg-danger"
                            : "bg-secondary"
                        }">
                            <i class="fas fa-arrow-${
                              destination.trend === "up" ? "up" : "down"
                            } me-1"></i>
                            ${
                              destination.trend === "up"
                                ? "Rising"
                                : destination.trend === "down"
                                ? "Declining"
                                : "Stable"
                            } 
                            ${destination.trendValue}%
                        </span>
                    </div>
                    `
                        : ""
                    }
                    
                    <div class="d-flex align-items-center mb-2">
                        <span class="badge bg-light text-dark me-2">
                            <i class="fas fa-star text-warning"></i> ${
                              destination.rating
                            }
                        </span>
                        <small class="text-muted">(${
                          destination.reviews
                        } reviews)</small>
                    </div>
                    
                    <p class="card-text text-muted small">${
                      destination.description
                    }</p>
                    <div class="d-flex flex-wrap gap-1">
                        <span class="badge bg-light text-dark">${
                          destination.tags
                        }</span>
                        ${
                          type === "seasonal"
                            ? '<span class="badge bg-warning text-dark">Seasonal</span>'
                            : ""
                        }
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-sm btn-outline-primary w-100 view-details" data-id="${
                      destination.id
                    }">
                        View Details
                    </button>
                </div>
            </div>
        `;
    return card;
  };

  const showErrorState = () => {
    const errorHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load destinations. Please try again later.
                </div>
                <button class="btn btn-primary mt-3" id="retry-loading">
                    <i class="fas fa-sync-alt me-2"></i> Retry
                </button>
            </div>
        `;

    elements.topDestinations.innerHTML = errorHTML;
    elements.trendingDestinations.innerHTML = "";
    elements.seasonalDestinations.innerHTML = "";

    document
      .getElementById("retry-loading")
      .addEventListener("click", loadData);
  };

  const updateRegionTitle = (region) => {
    const regionNames = {
      global: "Worldwide",
      europe: "Europe",
      asia: "Asia",
      americas: "Americas",
    };

    elements.regionTitle.textContent = regionNames[region] || "Worldwide";
    elements.regionTitle.classList.remove("visually-hidden");
  };

  const setActiveRegionButton = (region) => {
    // Remove active class from all buttons
    Object.values(elements.regionButtons).forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    // Add active class to selected button
    if (elements.regionButtons[region]) {
      elements.regionButtons[region].classList.add("active");
      elements.regionButtons[region].setAttribute("aria-selected", "true");
    }
  };

  const parseInitialRegion = () => {
    const url = new URL(window.location);
    const region = url.searchParams.get("region");
    return region && ["global", "europe", "asia", "americas"].includes(region)
      ? region
      : "global";
  };

  const switchRegion = (region) => {
    currentRegion = region;
    updateRegionTitle(region);
    setActiveRegionButton(region);

    // Update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set("region", region);
    window.history.pushState({}, "", url);

    // Show loading state
    elements.topDestinations.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading destinations...</span>
                </div>
                <p class="mt-2">Loading ${region} destinations...</p>
            </div>
        `;

    elements.trendingDestinations.innerHTML = "";
    elements.seasonalDestinations.innerHTML = "";

    // Load data with slight delay for better UX
    setTimeout(() => {
      loadData();
    }, 500);
  };

  const loadData = async () => {
    const data = await fetchDestinations(currentRegion);
    if (!data) {
      showErrorState();
      return;
    }

    // Clear existing content
    elements.topDestinations.innerHTML = "";
    elements.trendingDestinations.innerHTML = "";
    elements.seasonalDestinations.innerHTML = "";

    // Render top destinations
    data.top.forEach((destination, index) => {
      const card = renderDestinationCard(destination, "top");
      card.style.animationDelay = `${index * 0.1}s`;
      elements.topDestinations.appendChild(card);
    });

    // Render trending destinations
    data.trending.forEach((destination, index) => {
      const card = renderDestinationCard(destination, "trending");
      card.style.animationDelay = `${index * 0.1}s`;
      elements.trendingDestinations.appendChild(card);
    });

    // Render seasonal destinations
    data.seasonal.forEach((destination, index) => {
      const card = renderDestinationCard(destination, "seasonal");
      card.style.animationDelay = `${index * 0.1}s`;
      elements.seasonalDestinations.appendChild(card);
    });

    // Add event listeners to view buttons
    document.querySelectorAll(".view-details").forEach((button) => {
      button.addEventListener("click", (e) => {
        const destinationId = e.target.getAttribute("data-id");
        // In a real app, this would navigate to a details page
        alert(`Viewing details for destination ID: ${destinationId}`);
      });
    });
  };

  const setupEventListeners = () => {
    // Set up region filter buttons
    Object.entries(elements.regionButtons).forEach(([region, button]) => {
      button.addEventListener("click", () => switchRegion(region));
    });

    // Handle back/forward navigation
    window.addEventListener("popstate", () => {
      const region = parseInitialRegion();
      if (region !== currentRegion) {
        currentRegion = region;
        updateRegionTitle(region);
        setActiveRegionButton(region);
        loadData();
      }
    });
  };

  // Public methods
  const init = () => {
    currentRegion = parseInitialRegion();
    updateRegionTitle(currentRegion);
    setActiveRegionButton(currentRegion);
    setupEventListeners();

    // Initial load with skeleton UI
    setTimeout(() => {
      loadData();
    }, 800);
  };

  return {
    init,
  };
})();

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", DestinationsModule.init);
