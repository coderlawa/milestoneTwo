// Deals Module using IIFE pattern
const DealsModule = (() => {
  // Private variables
  const API_ENDPOINT = "/api/deals";
  let currentPage = 1;
  let currentFilters = {
    dealType: "all",
    destination: "all",
    priceRange: "all",
    travelMonth: "all",
    sortBy: "popular",
  };

  // Cache DOM elements
  const elements = {
    dealFilters: document.getElementById("deal-filters"),
    featuredDeals: document.getElementById("featured-deals"),
    allDeals: document.getElementById("all-deals"),
    sortDeals: document.getElementById("sort-deals"),
    pagination: document.getElementById("deals-pagination"),
    newsletterForm: document.getElementById("newsletter-form"),
  };

  // Private methods
  const fetchDeals = async (type = "all", page = 1) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data for demonstration
      return {
        deals: generateMockDeals(
          type === "featured" ? 3 : 6,
          type === "featured"
        ),
        pagination: {
          currentPage: page,
          totalPages: 3,
          totalItems: 18,
        },
      };
    } catch (error) {
      console.error("Error fetching deals:", error);
      return null;
    }
  };

  const generateMockDeals = (count, isFeatured) => {
    const destinations = [
      "Paris",
      "Bali",
      "New York",
      "Rome",
      "Tokyo",
      "Sydney",
    ];
    const dealTypes = ["hotel", "flight", "package", "last-minute"];

    return Array.from({ length: count }, (_, i) => {
      const destination = destinations[i % destinations.length];
      const dealType = dealTypes[i % dealTypes.length];
      const originalPrice = [1200, 1800, 2200, 3200, 2800, 1500][i % 6];
      const discount = [10, 15, 20, 25, 30, 5][i % 6];
      const finalPrice = originalPrice * (1 - discount / 100);

      return {
        id: `deal-${i}-${Date.now()}`,
        title: `${destination} ${
          isFeatured ? "Luxury" : "Premium"
        } ${dealType.replace("-", " ")}`,
        destination,
        dealType,
        image: `https://source.unsplash.com/random/600x400/?${destination.toLowerCase()},travel`,
        description: `Experience ${destination} with this amazing ${dealType} deal.`,
        originalPrice,
        discount,
        finalPrice,
        isFeatured,
        duration: `${3 + (i % 5)} Days / ${2 + (i % 5)} Nights`,
        travelers: `${1 + (i % 4)} Adults`,
        badge: ["Limited Time", "Popular", "New", "Last Minute"][i % 4],
        badgeClass: ["success", "danger", "info", "warning"][i % 4],
        rating: (4 + Math.random()).toFixed(1),
        reviews: Math.floor(Math.random() * 100) + 1,
      };
    });
  };

  const renderDealCard = (deal, isHorizontal = false) => {
    const card = document.createElement("div");
    card.className = isHorizontal ? "col-lg-6 mb-4" : "col-lg-4 col-md-6 mb-4";
    card.classList.add("animate__animated", "animate__fadeIn");

    if (isHorizontal) {
      card.innerHTML = `
                <div class="card deal-card-horizontal h-100">
                    <div class="row g-0">
                        <div class="col-md-5 position-relative">
                            <img src="${
                              deal.image
                            }" class="img-fluid rounded-start h-100" alt="${
        deal.title
      }" loading="lazy">
                            <div class="badge-ribbon">-${deal.discount}%</div>
                            <div class="position-absolute top-0 start-0 m-2">
                                <span class="badge bg-${deal.badgeClass}">${
        deal.badge
      }</span>
                            </div>
                        </div>
                        <div class="col-md-7">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h3 class="h5 card-title mb-0">${
                                      deal.title
                                    }</h3>
                                    <div>
                                        <span class="badge bg-light text-dark">
                                            <i class="fas fa-star text-warning"></i> ${
                                              deal.rating
                                            } (${deal.reviews})
                                        </span>
                                    </div>
                                </div>
                                <p class="card-text text-muted small"><i class="fas fa-map-marker-alt me-1"></i> ${
                                  deal.destination
                                }</p>
                                <p class="card-text">${deal.description}</p>
                                <div class="deal-details mb-3">
                                    <div class="detail-item">
                                        <i class="fas fa-calendar-alt"></i>
                                        <span>${
                                          deal.duration.split(" / ")[0]
                                        }</span>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-moon"></i>
                                        <span>${
                                          deal.duration.split(" / ")[1]
                                        }</span>
                                    </div>
                                    <div class="detail-item">
                                        <i class="fas fa-user-friends"></i>
                                        <span>${deal.travelers}</span>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span class="text-muted text-decoration-line-through me-2">$${deal.originalPrice.toLocaleString()}</span>
                                        <span class="h5 text-primary">$${deal.finalPrice.toLocaleString()}</span>
                                    </div>
                                    <button class="btn btn-sm btn-outline-primary view-deal" data-id="${
                                      deal.id
                                    }" aria-label="View ${deal.title}">
                                        View Deal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    } else {
      card.innerHTML = `
                <div class="card deal-card h-100">
                    <div class="position-relative">
                        <img src="${deal.image}" class="card-img-top" alt="${
        deal.title
      }" loading="lazy">
                        <div class="badge-ribbon">-${deal.discount}%</div>
                        <div class="position-absolute top-0 start-0 m-2">
                            <span class="badge bg-${deal.badgeClass}">${
        deal.badge
      }</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h3 class="h5 card-title mb-0">${deal.title}</h3>
                            <span class="badge bg-light text-dark">
                                <i class="fas fa-star text-warning"></i> ${
                                  deal.rating
                                } (${deal.reviews})
                            </span>
                        </div>
                        <p class="card-text text-muted small"><i class="fas fa-map-marker-alt me-1"></i> ${
                          deal.destination
                        }</p>
                        <p class="card-text">${deal.description}</p>
                        <div class="deal-details mb-3">
                            <div class="detail-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${deal.duration.split(" / ")[0]}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-moon"></i>
                                <span>${deal.duration.split(" / ")[1]}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-user-friends"></i>
                                <span>${deal.travelers}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="text-muted text-decoration-line-through me-2">$${deal.originalPrice.toLocaleString()}</span>
                                <span class="h5 text-primary">$${deal.finalPrice.toLocaleString()}</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary view-deal" data-id="${
                              deal.id
                            }" aria-label="View ${deal.title}">
                                View Deal
                            </button>
                        </div>
                    </div>
                </div>
            `;
    }

    return card;
  };

  const renderPagination = (currentPage, totalPages) => {
    let paginationHTML = `
            <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" data-page="${
                  currentPage - 1
                }" aria-label="Previous page">Previous</a>
            </li>
        `;

    // Show first page, current page with neighbors, and last page
    const pagesToShow = [];
    pagesToShow.push(1);

    if (currentPage > 3) pagesToShow.push("...");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pagesToShow.push(i);
    }

    if (currentPage < totalPages - 2) pagesToShow.push("...");

    if (totalPages > 1) pagesToShow.push(totalPages);

    pagesToShow.forEach((page) => {
      if (page === "...") {
        paginationHTML += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
      } else {
        paginationHTML += `
                    <li class="page-item ${
                      page === currentPage ? "active" : ""
                    }">
                        <a class="page-link" href="#" data-page="${page}" aria-label="Page ${page}">${page}</a>
                    </li>
                `;
      }
    });

    paginationHTML += `
            <li class="page-item ${
              currentPage === totalPages ? "disabled" : ""
            }">
                <a class="page-link" href="#" data-page="${
                  currentPage + 1
                }" aria-label="Next page">Next</a>
            </li>
        `;

    elements.pagination.innerHTML = paginationHTML;
  };

  const showLoadingState = (element) => {
    element.innerHTML = `
            <div class="col-12 loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading deals...</span>
                </div>
            </div>
        `;
  };

  const showErrorState = (element) => {
    element.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load deals. Please try again later.
                </div>
                <button class="btn btn-primary mt-3 retry-loading">
                    <i class="fas fa-sync-alt me-2"></i> Retry
                </button>
            </div>
        `;

    element
      .querySelector(".retry-loading")
      .addEventListener("click", loadDeals);
  };

  const applyFilters = () => {
    currentFilters = {
      dealType: document.getElementById("deal-type").value,
      destination: document.getElementById("destination-filter").value,
      priceRange: document.getElementById("price-range").value,
      travelMonth: document.getElementById("travel-month").value,
      sortBy: document.getElementById("sort-deals").value,
    };

    // Update URL without reloading
    const url = new URL(window.location);
    Object.entries(currentFilters).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    window.history.pushState({}, "", url);

    // Reset to first page when filters change
    currentPage = 1;
    loadDeals();
  };

  const parseUrlFilters = () => {
    const url = new URL(window.location);
    const filters = {
      dealType: url.searchParams.get("dealType") || "all",
      destination: url.searchParams.get("destination") || "all",
      priceRange: url.searchParams.get("priceRange") || "all",
      travelMonth: url.searchParams.get("travelMonth") || "all",
      sortBy: url.searchParams.get("sortBy") || "popular",
    };

    // Apply to form controls
    document.getElementById("deal-type").value = filters.dealType;
    document.getElementById("destination-filter").value = filters.destination;
    document.getElementById("price-range").value = filters.priceRange;
    document.getElementById("travel-month").value = filters.travelMonth;
    document.getElementById("sort-deals").value = filters.sortBy;

    return filters;
  };

  const loadDeals = async () => {
    // Load featured deals
    showLoadingState(elements.featuredDeals);
    const featuredData = await fetchDeals("featured");

    if (featuredData) {
      elements.featuredDeals.innerHTML = "";
      featuredData.deals.forEach((deal, index) => {
        const card = renderDealCard(deal);
        card.style.animationDelay = `${index * 0.1}s`;
        elements.featuredDeals.appendChild(card);
      });
    } else {
      showErrorState(elements.featuredDeals);
    }

    // Load all deals
    showLoadingState(elements.allDeals);
    const allDealsData = await fetchDeals("all", currentPage);

    if (allDealsData) {
      elements.allDeals.innerHTML = "";
      allDealsData.deals.forEach((deal, index) => {
        const card = renderDealCard(deal, true);
        card.style.animationDelay = `${index * 0.1}s`;
        elements.allDeals.appendChild(card);
      });
      renderPagination(currentPage, allDealsData.pagination.totalPages);
    } else {
      showErrorState(elements.allDeals);
    }
  };

  const setupEventListeners = () => {
    // Filter form submission
    elements.dealFilters.addEventListener("submit", (e) => {
      e.preventDefault();
      applyFilters();
    });

    // Reset filters
    elements.dealFilters.addEventListener("reset", () => {
      setTimeout(() => {
        applyFilters();
      }, 0);
    });

    // Sort selection change
    elements.sortDeals.addEventListener("change", (e) => {
      currentFilters.sortBy = e.target.value;
      applyFilters();
    });

    // Pagination click
    elements.pagination.addEventListener("click", (e) => {
      e.preventDefault();
      if (e.target.tagName === "A") {
        currentPage = parseInt(e.target.getAttribute("data-page"));
        loadDeals();
        window.scrollTo({
          top: elements.allDeals.offsetTop - 100,
          behavior: "smooth",
        });
      }
    });

    // Newsletter form submission
    elements.newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.querySelector('input[type="email"]').value;
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Subscribing...
            `;
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        alert(`Thank you for subscribing with: ${email}`);
        e.target.reset();
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 1000);
    });

    // Delegate deal view buttons
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("view-deal")) {
        const dealId = e.target.getAttribute("data-id");
        // In a real app, this would navigate to a deal details page
        alert(`Viewing deal with ID: ${dealId}`);
      }
    });

    // Handle back/forward navigation
    window.addEventListener("popstate", () => {
      currentFilters = parseUrlFilters();
      loadDeals();
    });
  };

  // Public methods
  const init = () => {
    currentFilters = parseUrlFilters();
    setupEventListeners();
    loadDeals();

    // Add intersection observer for lazy loading and animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate__fadeInUp");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document
      .querySelectorAll(".deal-card, .deal-card-horizontal")
      .forEach((card) => {
        observer.observe(card);
      });
  };

  return {
    init,
  };
})();

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", DealsModule.init);
