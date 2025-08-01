// Google Maps API Key (restricted in Google Cloud Console)
const API_KEY = "AIzaSyA1paRemsuWj_GuI7tPvyXmPt2et0R2Bpc";

let map;
let markers = [];
let infoWindow;
let autocomplete;
let currentLocationMarker;

// Destination data
const destinations = [
  {
    name: "Paris, France",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114",
    description: "The City of Light known for its art, fashion, and culture.",
    coords: { lat: 48.8566, lng: 2.3522 },
    tags: ["romantic", "cultural"],
  },
  {
    name: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3",
    description: "A bustling metropolis blending ultramodern and traditional.",
    coords: { lat: 35.6762, lng: 139.6503 },
    tags: ["modern", "cultural"],
  },
  // {
  //     name: "New York, USA",
  //     image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee",
  //     description: "The city that never sleeps with iconic sites everywhere.",
  //     coords: { lat: 40.7128, lng: -74.0060 },
  //     tags: ["business", "shopping"]
  // }
];

// Initialize the application
function initApp() {
  initMap();
  setupAutocomplete();
  setupEventListeners();
  populateDestinations();
  setDefaultDate();
  updateDynamicOffer();
}

// Initialize Google Map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    mapTypeControl: false,
    streetViewControl: false,
  });

  infoWindow = new google.maps.InfoWindow();

  // Add click listener to map
  map.addListener("click", (e) => {
    updateFormFromMapClick(e.latLng);
  });
}

// Set up destination autocomplete
function setupAutocomplete() {
  const destinationInput = document.getElementById("destination");
  autocomplete = new google.maps.places.Autocomplete(destinationInput, {
    types: ["(cities)"],
    fields: ["name", "geometry"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      updateMapFromForm(place.name, place.geometry.location);
    }
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Find on map button
  document.getElementById("find-on-map").addEventListener("click", () => {
    const destination = document.getElementById("destination").value;
    if (destination) {
      geocodeAddress(destination);
    } else {
      alert("Please enter a destination first");
    }
  });

  // Use current location button
  document
    .getElementById("use-current-location")
    .addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            updateFormFromMapClick(pos);
          },
          () => {
            alert(
              "Error: The Geolocation service failed or your browser doesn't support it."
            );
          }
        );
      } else {
        alert("Your browser doesn't support geolocation.");
      }
    });

  // Clear booking button
  document.getElementById("clear-booking").addEventListener("click", () => {
    document.getElementById("booking-form").reset();
    clearMarkers();
    document.getElementById("location-status").innerHTML =
      '<i class="fas fa-map-marker-alt me-1"></i> No location selected';
    setDefaultDate();
  });

  // Form submission
  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    submitBooking();
  });

  // View offers button
  document.getElementById("view-offers").addEventListener("click", () => {
    alert("Showing all available travel offers for your selected destination!");
  });
}

// Populate popular destinations
function populateDestinations() {
  const container = document.getElementById("popular-destinations");

  destinations.forEach((dest) => {
    const card = document.createElement("div");
    card.className = "col-12 mb-3";
    card.innerHTML = `
                    <div class="destination-card" data-lat="${
                      dest.coords.lat
                    }" data-lng="${dest.coords.lng}">
                        <img src="${dest.image}" alt="${
      dest.name
    }" class="img-fluid w-100" style="height: 150px; object-fit: cover;">
                        <div class="p-3">
                            <h5>${dest.name}</h5>
                            <p class="small text-muted">${dest.description}</p>
                            <div class="d-flex flex-wrap gap-1">
                                ${dest.tags
                                  .map(
                                    (tag) =>
                                      `<span class="badge bg-light text-dark">${tag}</span>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                `;

    card.addEventListener("click", () => {
      const location = new google.maps.LatLng(
        parseFloat(
          card.querySelector(".destination-card").getAttribute("data-lat")
        ),
        parseFloat(
          card.querySelector(".destination-card").getAttribute("data-lng")
        )
      );
      updateFormFromMapClick(location, dest.name);
    });

    container.appendChild(card);
  });
}

// Update form when map is clicked
function updateFormFromMapClick(location, customName = null) {
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ location: location }, (results, status) => {
    if (status === "OK" && results[0]) {
      let locationName = customName || results[0].formatted_address;

      // Update form
      document.getElementById("destination").value = locationName;
      // document.getElementById("location-status").innerHTML =
      //     `<i class="fas fa-map-marker-alt me-1"></i> ${locationName}`;

      // Add marker
      addMarker(location, locationName);

      // Highlight booking section
      highlightBookingSection();

      // Update dynamic offer
      updateDynamicOffer(locationName);
    }
  });
}

// Update map when form is submitted
function updateMapFromForm(locationName, location) {
  if (location) {
    // If we already have the location (from autocomplete)
    addMarker(location, locationName);
    // document.getElementById("location-status").innerHTML =
    //     `<i class="fas fa-map-marker-alt me-1"></i> ${locationName}`;
    highlightBookingSection();
    updateDynamicOffer(locationName);
  } else {
    // Otherwise geocode the address
    geocodeAddress(locationName);
  }
}

// Geocode an address and update the map
function geocodeAddress(address) {
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: address }, (results, status) => {
    if (status === "OK" && results[0]) {
      const location = results[0].geometry.location;
      addMarker(location, address);
      document.getElementById(
        "location-status"
      ).innerHTML = `<i class="fas fa-map-marker-alt me-1"></i> ${address}`;
      highlightBookingSection();
      updateDynamicOffer(address);
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

// Add a marker to the map
function addMarker(location, title) {
  // Clear existing markers
  clearMarkers();

  // Add new marker
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: title,
    animation: google.maps.Animation.DROP,
  });

  markers.push(marker);

  // Center and zoom map
  map.setCenter(location);
  map.setZoom(12);

  // Add info window
  infoWindow.setContent(`<strong>${title}</strong>`);
  infoWindow.open(map, marker);
}

// Clear all markers
function clearMarkers() {
  for (let marker of markers) {
    marker.setMap(null);
  }
  markers = [];

  if (currentLocationMarker) {
    currentLocationMarker.setMap(null);
  }
}

// Highlight booking section
function highlightBookingSection() {
  const section = document.getElementById("booking-section");
  section.classList.add("booking-highlight");

  setTimeout(() => {
    section.classList.remove("booking-highlight");
  }, 2000);
}

// Set default date to tomorrow
function setDefaultDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("travel-date").valueAsDate = tomorrow;
}

// Update dynamic offer based on location
function updateDynamicOffer(location = null) {
  const offerElement = document.getElementById("dynamic-offer");

  if (location) {
    const offers = [
      `Free airport transfer for ${location} bookings this month!`,
      `15% discount on hotels in ${location.split(",")[0]}`,
      `Special dining credit when booking ${location} packages`,
    ];

    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    offerElement.innerHTML = `
                    <div class="alert alert-success py-2">
                        <i class="fas fa-star me-2"></i> ${randomOffer}
                    </div>
                `;
  } else {
    offerElement.innerHTML = `
                    <div class="alert alert-info py-2">
                        <i class="fas fa-info-circle me-2"></i> Select a destination to see special offers
                    </div>
                `;
  }
}

// Submit booking form
function submitBooking() {
  const destination = document.getElementById("destination").value;
  const date = document.getElementById("travel-date").value;
  const tripType = document.getElementById("trip-type").value;

  if (destination && date) {
    // In a real app, you would send this data to your server
    const bookingData = {
      destination,
      date,
      tripType,
      adults: document.getElementById("adults").value,
      nights: document.getElementById("nights").value,
      location: markers.length > 0 ? markers[0].getPosition().toJSON() : null,
    };

    console.log("Booking submitted:", bookingData);

    // Show confirmation
    alert(
      `Booking request submitted for ${destination} on ${date} (${tripType} trip). We'll contact you shortly!`
    );

    // You could also add the booking to a list or send to server here
  } else {
    alert(
      "Please fill in all required fields and select a destination on the map."
    );
  }
}

// Load Google Maps API
function loadGoogleMaps() {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA1paRemsuWj_GuI7tPvyXmPt2et0R2Bpc&libraries=places&callback=initApp`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

// Initialize when window loads
window.onload = loadGoogleMaps;

document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  const rangeSlider = document.getElementById("date-range-slider");

  noUiSlider.create(rangeSlider, {
    start: [0, 365],
    connect: true,
    range: {
      min: 0,
      max: 365,
    },
  });

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  rangeSlider.noUiSlider.on("update", function (values) {
    const startDays = parseInt(values[0]);
    const endDays = parseInt(values[1]);

    const start = new Date(today);
    start.setDate(today.getDate() + startDays);

    const end = new Date(today);
    end.setDate(today.getDate() + endDays);

    document.getElementById("travel-date-start").value = formatDate(start);
    document.getElementById("travel-date-end").value = formatDate(end);
  });

  // Set initial values
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 365);
  document.getElementById("travel-date-start").value = formatDate(today);
  document.getElementById("travel-date-end").value = formatDate(endDate);
});

// DEALS PAGE

document.addEventListener('DOMContentLoaded', function() {
    // Set last updated date
    document.getElementById('last-updated').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Deal filter functionality
    const dealFilters = document.getElementById('deal-filters');
    if (dealFilters) {
        dealFilters.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real app, this would filter deals based on selected criteria
            alert('Filters applied! This would filter deals in a real application.');
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-deals');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            // In a real app, this would sort deals based on selected option
            alert('Sorting changed to: ' + this.value);
        });
    }

    // View Deal buttons
    const viewDealButtons = document.querySelectorAll('.btn-outline-primary');
    viewDealButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real app, this would show more details about the deal
            const dealTitle = this.closest('.card-body').querySelector('.card-title').textContent;
            alert('Viewing deal: ' + dealTitle);
        });
    });

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert('Thank you for subscribing with: ' + email);
            this.reset();
        });
    }
});