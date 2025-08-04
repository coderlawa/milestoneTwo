// index.js
import Config from './config.js';

// ================ MODULE PATTERN ================
const HolidayFinder = (() => {
  // ================ PRIVATE VARIABLES ================
  const config = {
    apiKey: Config.GOOGLE_MAPS_API_KEY,
    mapOptions: {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      styles: [
        {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [{ "visibility": "off" }]
        },
        {
          "featureType": "transit",
          "elementType": "labels",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    },
    dateRange: {
      minDays: 0,
      maxDays: 365
    }
  };

  // DOM Elements
  const elements = {
    map: document.getElementById('map'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    destinationInput: document.getElementById('destination'),
    findOnMapBtn: document.getElementById('find-on-map'),
    useLocationBtn: document.getElementById('use-current-location'),
    bookingForm: document.getElementById('booking-form'),
    dateRangeSlider: document.getElementById('date-range-slider'),
    dateStartInput: document.getElementById('travel-date-start'),
    dateEndInput: document.getElementById('travel-date-end'),
    popularDestinations: document.getElementById('popular-destinations'),
    dynamicOffer: document.getElementById('dynamic-offer'),
    viewOffersBtn: document.getElementById('view-offers'),
    filterButtons: document.querySelectorAll('.filter-btn')
  };

  // State
  const state = {
    map: null,
    markers: [],
    infoWindow: null,
    autocomplete: null,
    currentLocation: null,
    destinations: [
      {
        id: 'paris',
        name: "Paris, France",
        description: "The City of Light known for its art, fashion, and culture.",
        coords: { lat: 48.8566, lng: 2.3522 },
        tags: ["romantic", "cultural"],
        type: "city",
        image: "https://source.unsplash.com/random/600x400/?paris"
      },
      {
        id: 'tokyo',
        name: "Tokyo, Japan",
        description: "A bustling metropolis blending ultramodern and traditional.",
        coords: { lat: 35.6762, lng: 139.6503 },
        tags: ["modern", "cultural"],
        type: "city",
        image: "https://source.unsplash.com/random/600x400/?tokyo"
      },
      {
        id: 'new-york',
        name: "New York, USA",
        description: "The city that never sleeps with iconic landmarks.",
        coords: { lat: 40.7128, lng: -74.0060 },
        tags: ["urban", "shopping"],
        type: "city",
        image: "https://source.unsplash.com/random/600x400/?newyork"
      }
    ]
  };

  // ================ PRIVATE METHODS ================
  
  /**
   * Initialize Google Maps API
   */
  const initMap = () => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not loaded');
      return;
    }

    state.map = new google.maps.Map(elements.map, config.mapOptions);
    state.infoWindow = new google.maps.InfoWindow();
    
    // Add click listener to map
    state.map.addListener('click', (e) => {
      updateFormFromMapClick(e.latLng);
    });

    // Add markers for default destinations
    state.destinations.forEach(dest => {
      new google.maps.Marker({
        position: dest.coords,
        map: state.map,
        title: dest.name,
        icon: {
          url: `https://maps.google.com/mapfiles/ms/icons/${dest.type === 'city' ? 'red' : 'blue'}-dot.png`
        }
      });
    });
  };

  /**
   * Initialize Autocomplete
   */
  const initAutocomplete = () => {
    if (!window.google || !window.google.maps.places) {
      console.error('Google Places API not loaded');
      return;
    }

    state.autocomplete = new google.maps.places.Autocomplete(
      elements.destinationInput,
      {
        types: ['(cities)'],
        fields: ['name', 'geometry'],
        componentRestrictions: { country: ['us', 'ca', 'gb', 'fr', 'de', 'it', 'es', 'jp', 'au'] }
      }
    );

    state.autocomplete.addListener('place_changed', () => {
      const place = state.autocomplete.getPlace();
      if (place.geometry) {
        updateMapFromForm(place.name, place.geometry.location);
      } else {
        showAlert('Location not found. Please try a different search.', 'error');
      }
    });
  };

  /**
   * Initialize Date Range Slider
   */
  const initDateRangeSlider = () => {
    if (!window.noUiSlider) {
      console.error('noUiSlider not loaded');
      initDateRangePicker(); // Fallback to simple date picker
      return;
    }

    noUiSlider.create(elements.dateRangeSlider, {
      start: [7, 14], // Default range: 1-2 weeks
      connect: true,
      range: {
        min: config.dateRange.minDays,
        max: config.dateRange.maxDays
      },
      tooltips: [true, true],
      format: {
        to: value => Math.round(value),
        from: value => Math.round(value)
      }
    });

    elements.dateRangeSlider.noUiSlider.on('update', (values) => {
      const startDate = calculateDate(parseInt(values[0]));
      const endDate = calculateDate(parseInt(values[1]));
      
      elements.dateStartInput.value = formatDate(startDate);
      elements.dateEndInput.value = formatDate(endDate);
    });
  };

  /**
   * Fallback date picker when noUiSlider is not available
   */
  const initDateRangePicker = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    // Set min dates
    elements.dateStartInput.min = formatDate(today);
    elements.dateEndInput.min = formatDate(today);
    
    // Set initial values
    elements.dateStartInput.value = formatDate(today);
    elements.dateEndInput.value = formatDate(nextMonth);
    
    // Add event listeners
    elements.dateStartInput.addEventListener('change', (e) => {
      const startDate = new Date(e.target.value);
      const endDate = new Date(elements.dateEndInput.value);
      
      if (startDate > endDate) {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(startDate.getDate() + 7);
        elements.dateEndInput.value = formatDate(newEndDate);
      }
      
      elements.dateEndInput.min = e.target.value;
    });
    
    elements.dateEndInput.addEventListener('change', (e) => {
      const startDate = new Date(elements.dateStartInput.value);
      const endDate = new Date(e.target.value);
      
      if (endDate < startDate) {
        elements.dateEndInput.value = formatDate(startDate);
      }
    });
  };

  /**
   * Calculate date from today + days
   */
  const calculateDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  /**
   * Format date as YYYY-MM-DD
   */
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  /**
   * Geocode address and update map
   */
  const geocodeAddress = async (address) => {
    if (!window.google || !window.google.maps.geocoder) {
      console.error('Geocoding service not available');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    
    try {
      const { results } = await geocoder.geocode({ address });
      if (results[0]) {
        updateFormFromMapClick(results[0].geometry.location, address);
      } else {
        showAlert('Location not found. Please try a different search.', 'error');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      showAlert('Error finding location. Please try again.', 'error');
    }
  };

  /**
   * Update form when map is clicked
   */
  const updateFormFromMapClick = (location, customName = null) => {
    if (!window.google || !window.google.maps.geocoder) {
      console.error('Geocoding service not available');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const locationName = customName || results[0].formatted_address;
        elements.destinationInput.value = locationName;
        addMarker(location, locationName);
        highlightBookingSection();
        updateDynamicOffer(locationName);
      } else {
        showAlert('Could not get location details. Please try again.', 'error');
      }
    });
  };

  /**
   * Add marker to map
   */
  const addMarker = (location, title) => {
    clearMarkers();

    const marker = new google.maps.Marker({
      position: location,
      map: state.map,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });

    state.markers.push(marker);
    state.map.setCenter(location);
    state.map.setZoom(12);

    state.infoWindow.setContent(`<strong>${title}</strong>`);
    state.infoWindow.open(state.map, marker);
  };

  /**
   * Clear all markers
   */
  const clearMarkers = () => {
    state.markers.forEach(marker => marker.setMap(null));
    state.markers = [];
  };

  /**
   * Highlight booking section
   */
  const highlightBookingSection = () => {
    const section = document.getElementById('booking-section');
    section.classList.add('booking-highlight');
    
    setTimeout(() => {
      section.classList.remove('booking-highlight');
    }, 2000);
  };

  /**
   * Update dynamic offer based on location
   */
  const updateDynamicOffer = (location = null) => {
    const offers = location ? [
      `Free airport transfer for ${location} bookings this month!`,
      `15% discount on hotels in ${location.split(',')[0]}`,
      `Special dining credit when booking ${location} packages`
    ] : [
      "Select a destination to see special offers",
      "Book today and get exclusive member benefits",
      "Sign up for our newsletter to receive deals"
    ];

    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    elements.dynamicOffer.textContent = randomOffer;
  };

  /**
   * Show alert message
   */
  const showAlert = (message, type = 'info') => {
    // Remove any existing alerts first
    document.querySelectorAll('.alert.fixed-top').forEach(el => el.remove());

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fixed-top mt-5 mx-3 animate__animated animate__fadeInDown`;
    alert.setAttribute('role', 'alert');
    
    alert.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'} me-2"></i>
        <div>${message}</div>
      </div>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.classList.add('animate__fadeOutUp');
      setTimeout(() => {
        alert.remove();
      }, 300);
    }, 5000);
  };

  /**
   * Populate popular destinations
   */
  const populateDestinations = () => {
    elements.popularDestinations.innerHTML = '';
    
    state.destinations.forEach(dest => {
      const card = document.createElement('div');
      card.className = 'col-12 mb-3 animate__animated animate__fadeIn';
      card.style.animationDelay = `${state.destinations.indexOf(dest) * 0.1}s`;
      card.innerHTML = `
        <div class="destination-card" data-id="${dest.id}" data-lat="${dest.coords.lat}" data-lng="${dest.coords.lng}">
          <img src="${dest.image}" 
               alt="${dest.name}" 
               class="img-fluid w-100 rounded-top" 
               loading="lazy">
          <div class="p-3">
            <h5>${dest.name}</h5>
            <p class="small text-muted">${dest.description}</p>
            <div class="d-flex flex-wrap gap-1">
              ${dest.tags.map(tag => `<span class="badge bg-light text-dark">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        const location = new google.maps.LatLng(dest.coords.lat, dest.coords.lng);
        updateFormFromMapClick(location, dest.name);
      });

      elements.popularDestinations.appendChild(card);
    });
  };

  /**
   * Handle booking form submission
   */
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(elements.bookingForm);
    const destination = formData.get('destination');
    const dateStart = formData.get('travel-date-start');
    const dateEnd = formData.get('travel-date-end');
    
    if (!destination || !dateStart || !dateEnd) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    // Show loading state
    const submitBtn = elements.bookingForm.querySelector('#submit-booking');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Processing...
    `;
    submitBtn.disabled = true;

    const bookingData = {
      destination,
      dateStart,
      dateEnd,
      tripType: formData.get('trip-type'),
      adults: formData.get('adults'),
      nights: formData.get('nights'),
      location: state.markers[0]?.getPosition()?.toJSON()
    };

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Booking submitted:', bookingData);
      showAlert(`Booking request submitted for ${destination}! We'll contact you shortly.`, 'success');
      elements.bookingForm.reset();
      clearMarkers();
    } catch (error) {
      console.error('Booking error:', error);
      showAlert('Error submitting booking. Please try again.', 'error');
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  };

  /**
   * Initialize event listeners
   */
  const initEventListeners = () => {
    // Search functionality
    elements.searchBtn.addEventListener('click', () => {
      if (elements.searchInput.value.trim()) {
        geocodeAddress(elements.searchInput.value);
      } else {
        showAlert('Please enter a search term first', 'error');
      }
    });

    // Find on map button
    elements.findOnMapBtn.addEventListener('click', () => {
      if (elements.destinationInput.value.trim()) {
        geocodeAddress(elements.destinationInput.value);
      } else {
        showAlert('Please enter a destination first', 'error');
      }
    });

    // Use current location
    elements.useLocationBtn.addEventListener('click', () => {
      elements.useLocationBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Locating...
      `;
      elements.useLocationBtn.disabled = true;

      getCurrentLocation()
        .then(position => {
          state.currentLocation = position;
          updateFormFromMapClick(position, "Your Location");
        })
        .catch(error => {
          console.error('Geolocation error:', error);
          showAlert('Unable to get your location. Please ensure location services are enabled.', 'error');
        })
        .finally(() => {
          elements.useLocationBtn.innerHTML = `
            <i class="fas fa-location-arrow" aria-hidden="true"></i> Use My Location
          `;
          elements.useLocationBtn.disabled = false;
        });
    });

    // Filter buttons
    elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.filterButtons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // In a full implementation, this would filter results
        showAlert(`Showing ${btn.dataset.type === 'all' ? 'all' : btn.dataset.type} results`, 'info');
      });
    });

    // View offers button
    elements.viewOffersBtn.addEventListener('click', () => {
      window.location.href = 'deals.html';
    });

    // Form submission
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);

    // Clear form button
    document.getElementById('clear-booking').addEventListener('click', () => {
      elements.bookingForm.reset();
      clearMarkers();
      showAlert('Form cleared', 'info');
    });

    // Search input enter key
    elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        elements.searchBtn.click();
      }
    });
  };

  /**
   * Get current location with better error handling
   */
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported by your browser'));
        return;
      }
      
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }),
        (error) => {
          let errorMessage;
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied. Please enable it in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get your location timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  /**
   * Initialize the application
   */
  const init = () => {
    initMap();
    initAutocomplete();
    initDateRangeSlider();
    populateDestinations();
    initEventListeners();
    updateDynamicOffer();
  };

  // ================ PUBLIC API ================
  return {
    init
  };
})();

// ================ INITIALIZATION ================
document.addEventListener('DOMContentLoaded', () => {
  // Load Google Maps API safely
  const loadGoogleMaps = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${Config.GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  // Initialize noUiSlider
  const loadNoUiSlider = () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.5.0/nouislider.min.js';
    script.async = true;
    script.defer = true;
    script.onload = HolidayFinder.init;
    document.head.appendChild(script);
  };

  // Load required scripts
  if (!window.google || !window.google.maps) {
    loadGoogleMaps();
  } else {
    HolidayFinder.init();
  }
  
  if (!window.noUiSlider) {
    loadNoUiSlider();
  }
});

// Make initMap globally available for Google Maps callback
window.initMap = HolidayFinder.init;