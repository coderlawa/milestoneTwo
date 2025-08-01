// ================ MODULE PATTERN ================
const HolidayFinder = (() => {
  // ================ PRIVATE VARIABLES ================
  const config = {
    apiKey: null, // Will be initialized from server-side
    mapOptions: {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
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
        type: "city"
      },
      {
        id: 'tokyo',
        name: "Tokyo, Japan",
        description: "A bustling metropolis blending ultramodern and traditional.",
        coords: { lat: 35.6762, lng: 139.6503 },
        tags: ["modern", "cultural"],
        type: "city"
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
        fields: ['name', 'geometry']
      }
    );

    state.autocomplete.addListener('place_changed', () => {
      const place = state.autocomplete.getPlace();
      if (place.geometry) {
        updateMapFromForm(place.name, place.geometry.location);
      }
    });
  };

  /**
   * Initialize Date Range Slider
   */
  const initDateRangeSlider = () => {
    if (!window.noUiSlider) {
      console.error('noUiSlider not loaded');
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
        showAlert('Location not found', 'error');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      showAlert('Error finding location', 'error');
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
      animation: google.maps.Animation.DROP
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
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fixed-top mt-5 mx-3`;
    alert.textContent = message;
    alert.setAttribute('role', 'alert');
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, 5000);
  };

  /**
   * Populate popular destinations
   */
  const populateDestinations = () => {
    elements.popularDestinations.innerHTML = '';
    
    state.destinations.forEach(dest => {
      const card = document.createElement('div');
      card.className = 'col-12 mb-3';
      card.innerHTML = `
        <div class="destination-card" data-id="${dest.id}" data-lat="${dest.coords.lat}" data-lng="${dest.coords.lng}">
          <img src="https://source.unsplash.com/random/600x400/?${dest.name.split(',')[0]}" 
               alt="${dest.name}" 
               class="img-fluid w-100" 
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
      // In a real app, you would send to your backend
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(bookingData)
      // });
      
      console.log('Booking submitted:', bookingData);
      showAlert(`Booking request submitted for ${destination}!`, 'success');
      elements.bookingForm.reset();
      clearMarkers();
    } catch (error) {
      console.error('Booking error:', error);
      showAlert('Error submitting booking', 'error');
    }
  };

  /**
   * Initialize event listeners
   */
  const initEventListeners = () => {
    // Search functionality
    elements.searchBtn.addEventListener('click', () => {
      if (elements.searchInput.value.trim()) {
        // In a full implementation, this would search destinations
        showAlert('Search functionality would be implemented here', 'info');
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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            state.currentLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            updateFormFromMapClick(state.currentLocation, "Your Location");
          },
          (error) => {
            console.error('Geolocation error:', error);
            showAlert('Unable to get your location', 'error');
          },
          { timeout: 10000 }
        );
      } else {
        showAlert('Geolocation not supported by your browser', 'error');
      }
    });

    // Filter buttons
    elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // In a full implementation, this would filter results
      });
    });

    // View offers button
    elements.viewOffersBtn.addEventListener('click', () => {
      showAlert('Viewing all available offers', 'info');
    });

    // Form submission
    elements.bookingForm.addEventListener('submit', handleBookingSubmit);
  };

  /**
   * Initialize the application
   */
  const init = () => {
    // Load configuration from server in a real app
    // fetch('/api/config')
    //   .then(res => res.json())
    //   .then(data => {
    //     config.apiKey = data.mapsApiKey;
    //     initMap();
    //   });
    
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${HolidayFinder.config?.apiKey || 'YOUR_API_KEY'}&libraries=places&callback=initMap`;
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
  }
  
  if (!window.noUiSlider) {
    loadNoUiSlider();
  } else {
    HolidayFinder.init();
  }
});

// Make initMap globally available for Google Maps callback
window.initMap = HolidayFinder.init;