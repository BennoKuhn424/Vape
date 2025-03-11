// Check if device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Theme state
let darkMode = true;

// Mock data for vape vending machines in Pretoria
const locations = [
  {
    id: 1,
    name: "Hatfield Mall",
    address: "1122 Burnett Street, Hatfield, Pretoria",
    coordinates: { lat: -25.749, lng: 28.235 },
    stock: [
      { name: "VUSE", flavor: "Berry Blend", price: "R299", available: 8, flavors: ["berry", "sweet"], rating: 4.5 },
      { name: "VUSE", flavor: "Menthol", price: "R299", available: 5, flavors: ["menthol", "cool"], rating: 4.7 },
      { name: "Nasty", flavor: "Amber", price: "R290", available: 12, flavors: ["tobacco", "rich"], rating: 4.2 },
      { name: "Airpops", flavor: "Vanilla Ice", price: "R350", available: 3, flavors: ["vanilla", "cream", "sweet"], rating: 4.8 }
    ]
  },
  {
    id: 2,
    name: "Brooklyn Square",
    address: "Corner Veale & Fehrsen Streets, Brooklyn, Pretoria",
    coordinates: { lat: -25.771, lng: 28.241 },
    stock: [
      { name: "Nasty", flavor: "Blue Razz", price: "R290", available: 6, flavors: ["blue raspberry", "fruity"], rating: 4.4 },
      { name: "VUSE", flavor: "Menthol", price: "R299", available: 0, flavors: ["menthol", "cool"], rating: 4.7 },
      { name: "Nasty", flavor: "Blue", price: "R290", available: 15, flavors: ["blueberry", "fruity"], rating: 4.3 },
      { name: "Airpops", flavor: "Mango", price: "R350", available: 7, flavors: ["mango", "tropical"], rating: 4.6 }
    ]
  },
  {
    id: 3,
    name: "Menlyn Park",
    address: "Cnr Lois & Aramist Avenue, Menlyn, Pretoria",
    coordinates: { lat: -25.782, lng: 28.276 },
    stock: [
      { name: "VUSE", flavor: "Classic Tobacco", price: "R299", available: 10, flavors: ["tobacco", "earthy"], rating: 4.0 },
      { name: "VUSE", flavor: "Menthol", price: "R299", available: 8, flavors: ["menthol", "cool"], rating: 4.7 },
      { name: "Nasty", flavor: "Strawberry", price: "R290", available: 4, flavors: ["strawberry", "fruity", "sweet"], rating: 4.6 },
      { name: "Airpops", flavor: "Watermelon", price: "R350", available: 2, flavors: ["watermelon", "fruity", "summer"], rating: 4.9 }
    ]
  },
  {
    id: 4,
    name: "Sunnyside Plaza",
    address: "253 Jorissen Street, Sunnyside, Pretoria",
    coordinates: { lat: -25.755, lng: 28.219 },
    stock: [
      { name: "Nasty", flavor: "Yellow", price: "R290", available: 20, flavors: ["citrus", "lemon", "fruity"], rating: 4.5 },
      { name: "Nasty", flavor: "Mint", price: "R290", available: 5, flavors: ["mint", "fresh", "cool"], rating: 4.2 },
      { name: "Airpops", flavor: "Coffee", price: "R350", available: 6, flavors: ["coffee", "rich", "aromatic"], rating: 4.4 },
      { name: "VUSE", flavor: "Berry Blend", price: "R299", available: 3, flavors: ["berry", "sweet", "fruity"], rating: 4.5 }
    ]
  },
  {
    id: 5,
    name: "Arcadia Center",
    address: "1106 Park Street, Arcadia, Pretoria",
    coordinates: { lat: -25.744, lng: 28.218 },
    stock: [
      { name: "Nasty", flavor: "Cherry", price: "R290", available: 9, flavors: ["cherry", "fruity", "sweet"], rating: 4.7 },
      { name: "VUSE", flavor: "Classic Tobacco", price: "R299", available: 7, flavors: ["tobacco", "earthy"], rating: 4.0 },
      { name: "Nasty", flavor: "Sienna", price: "R290", available: 14, flavors: ["cinnamon", "spicy", "warm"], rating: 4.3 },
      { name: "Airpops", flavor: "Vanilla Ice", price: "R350", available: 0, flavors: ["vanilla", "cream", "sweet"], rating: 4.8 }
    ]
  }
];

// DOM elements
const searchInput = document.getElementById('search-input');
const locationList = document.getElementById('location-list');
const mapMarkers = document.getElementById('map-markers');
const mapCount = document.getElementById('map-count');
const detailsContainer = document.getElementById('details-container');
const customCursor = document.getElementById('custom-cursor');
const cursorRing = document.getElementById('cursor-ring');
const smokeContainer = document.getElementById('smoke-container');
const locationModal = document.getElementById('location-modal');
const btnAllow = document.getElementById('btn-allow');
const btnSkip = document.getElementById('btn-skip');
const mapsLinkContainer = document.getElementById('maps-link-container');
const googleMapsLink = document.getElementById('google-maps-link');
const themeSwitch = document.getElementById('theme-switch');

// State
let selectedLocationId = null;
let filteredLocations = [...locations];
let particles = [];
let lastTimeParticleCreated = 0;
let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;
let mouseX = lastMouseX;
let mouseY = lastMouseY;
let userLocation = null;
let modalActive = false; // Track if any modal is active

// Initialize the application
function init() {
  setTimeout(() => {
    renderLocationList();
    renderMapMarkers();
    updateMapCount();
  }, 1000); // Simulate loading time

  // Setup event listeners
  searchInput.addEventListener('input', handleSearch);
  
  // Setup cursor and smoke effect only on non-mobile devices
  if (!isMobile && window.innerWidth >= 1024) {
    setupCursorEffect();
    setupParticleEffect();
  }
  
  // Show location permission modal after a short delay
  setTimeout(() => {
    showModal(locationModal);
  }, 2000);
  
  // Setup location modal buttons
  btnAllow.addEventListener('click', () => {
    hideModal(locationModal);
    getUserLocation();
  });
  
  btnSkip.addEventListener('click', () => {
    hideModal(locationModal);
  });
  
  // Setup theme switch
  themeSwitch.addEventListener('click', toggleTheme);
}

// Show modal and handle cursor
function showModal(modal) {
  modal.style.display = 'block';
  modalActive = true;
  document.body.classList.add('modal-active');
}

// Hide modal and restore cursor
function hideModal(modal) {
  modal.style.display = 'none';
  modalActive = false;
  document.body.classList.remove('modal-active');
}

// Get user's location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Calculate distances
        locations.forEach(location => {
          location.distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            location.coordinates.lat,
            location.coordinates.lng
          );
        });
        
        // Re-render with distance information
        renderLocationList();
        renderMapMarkers();
        if (selectedLocationId !== null) {
          renderDetailsPanel();
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

// Calculate distance between two coordinates using Haversine formula (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Format distance for display
function formatDistance(distance) {
  if (distance < 1) {
    // If less than 1 km, show in meters
    return `${Math.round(distance * 1000)} m`;
  } else {
    // Otherwise show in km with 1 decimal place
    return `${distance.toFixed(1)} km`;
  }
}

// Filter locations based on search term
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm) ||
    location.address.toLowerCase().includes(searchTerm) ||
    location.stock.some(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.flavor.toLowerCase().includes(searchTerm) ||
      (item.flavors && item.flavors.some(flavor => flavor.toLowerCase().includes(searchTerm)))
    )
  );
  
  renderLocationList();
  renderMapMarkers();
  updateMapCount();
  
  // Clear selection if filtered out
  if (selectedLocationId !== null) {
    const locationExists = filteredLocations.some(loc => loc.id === selectedLocationId);
    if (!locationExists) {
      selectLocation(null);
    }
  }
}

// Select a location and show its details
function selectLocation(locationId) {
  selectedLocationId = locationId;
  
  // Update location list UI
  document.querySelectorAll('.location-item').forEach(item => {
    item.classList.toggle('selected', parseInt(item.dataset.id) === locationId);
  });
  
  // Update map markers UI
  document.querySelectorAll('.map-marker').forEach(marker => {
    marker.classList.toggle('selected', parseInt(marker.dataset.id) === locationId);
  });
  
  // Update Google Maps link
  if (locationId) {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      const { lat, lng } = location.coordinates;
      googleMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      mapsLinkContainer.style.display = 'block';
      
      // For mobile, add a click event listener to open Google Maps app if available
      if (isMobile) {
        googleMapsLink.href = `geo:${lat},${lng}?q=${encodeURIComponent(location.name)}`;
        // Fallback for iOS
        googleMapsLink.addEventListener('click', (e) => {
          if (navigator.platform.indexOf('iPhone') !== -1 || 
              navigator.platform.indexOf('iPad') !== -1 || 
              navigator.platform.indexOf('iPod') !== -1) {
            e.preventDefault();
            window.location.href = `maps://maps.apple.com/?q=${lat},${lng}&z=16`;
          }
        });
      }
    }
  } else {
    mapsLinkContainer.style.display = 'none';
  }
  
  // Update details panel
  renderDetailsPanel();
  
  // Scroll to details on mobile
  if (isMobile && locationId) {
    setTimeout(() => {
      detailsContainer.scrollIntoView({behavior: 'smooth'});
    }, 300);
  }
}

// Render the list of locations
function renderLocationList() {
  if (filteredLocations.length === 0) {
    locationList.innerHTML = '<p class="loading-message">No locations found</p>';
    return;
  }
  
  // Copy and potentially sort the locations
  let locationsToRender = [...filteredLocations];
  
  // Sort by distance if user location is available
  if (userLocation) {
    locationsToRender.sort((a, b) => a.distance - b.distance);
  }
  
  locationList.innerHTML = '';
  locationsToRender.forEach(location => {
    const availableProducts = location.stock.filter(item => item.available > 0).length;
    const locationItem = document.createElement('div');
    locationItem.className = `location-item ${location.id === selectedLocationId ? 'selected' : ''}`;
    locationItem.dataset.id = location.id;
    
    // Distance HTML if available
    let distanceHTML = '';
    if (userLocation && location.distance !== undefined) {
      distanceHTML = `
        <div class="location-distance">
          <svg class="distance-icon icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${formatDistance(location.distance)} away</span>
        </div>
      `;
    }
    
    locationItem.innerHTML = `
      <div class="location-header">
        <svg class="location-icon icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <div>
          <div class="location-name">${location.name}</div>
          <div class="location-address">${location.address}</div>
          ${distanceHTML}
          <div class="location-stock">
            <svg class="stock-icon icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
            <span>${availableProducts} products available</span>
          </div>
        </div>
      </div>
    `;
    locationItem.addEventListener('click', () => selectLocation(location.id));
    locationList.appendChild(locationItem);
  });
}

// Render map markers
function renderMapMarkers() {
  mapMarkers.innerHTML = '';
  
  // Copy and potentially sort the locations
  let locationsToRender = [...filteredLocations];
  
  // Sort by distance if user location is available
  if (userLocation) {
    locationsToRender.sort((a, b) => a.distance - b.distance);
  }
  
  locationsToRender.forEach(location => {
    const marker = document.createElement('div');
    marker.className = `map-marker ${location.id === selectedLocationId ? 'selected' : ''}`;
    marker.dataset.id = location.id;
    
    // Include distance if available
    let markerText = location.name;
    if (userLocation && location.distance !== undefined) {
      markerText = `${location.name} (${formatDistance(location.distance)})`;
    }
    
    marker.innerHTML = `
      <svg class="map-marker-icon icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <span class="map-marker-name">${markerText}</span>
    `;
    marker.addEventListener('click', () => selectLocation(location.id));
    mapMarkers.appendChild(marker);
  });
}

// Update map count text
function updateMapCount() {
  mapCount.textContent = `Showing ${filteredLocations.length} vape vending machines in Pretoria`;
}

// Render details panel for selected location
function renderDetailsPanel() {
  if (selectedLocationId === null) {
    detailsContainer.innerHTML = `
      <div class="details-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
        <p>Select a location to view details</p>
      </div>
    `;
    mapsLinkContainer.style.display = 'none';
    return;
  }
  
  const location = locations.find(loc => loc.id === selectedLocationId);
  if (!location) return;
  
  // Add distance information if available
  let distanceHTML = '';
  if (userLocation && location.distance !== undefined) {
    distanceHTML = `
      <p class="location-distance" style="margin-top: 8px;">
        <svg class="distance-icon icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${formatDistance(location.distance)} from your location</span>
      </p>
    `;
  }
  
  let stockHTML = '';
  location.stock.forEach(item => {
    // Create flavor tags HTML
    let flavorTagsHTML = '';
    if (item.flavors && item.flavors.length > 0) {
      item.flavors.forEach(flavor => {
        flavorTagsHTML += `
          <span class="flavor-tag" data-flavor="${flavor}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
              <circle cx="17" cy="7" r="5"></circle>
            </svg>
            ${flavor}
          </span>
        `;
      });
    }
    
    // Create rating stars
    const rating = item.rating || 4.0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
      starsHTML += `<span style="color: #f59e0b;">★</span>`;
    }
    if (hasHalfStar) {
      starsHTML += `<span style="color: #f59e0b;">★</span>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += `<span style="color: #64748b;">★</span>`;
    }
    
    stockHTML += `
      <div class="stock-item">
        <div>
          <div class="stock-name">${item.name}</div>
          <div class="stock-flavor">${item.flavor}</div>
          <div class="stock-rating" style="margin-top: 4px; font-size: 0.85rem;">
            ${starsHTML} <span style="color: var(--text-muted); margin-left: 4px;">${rating.toFixed(1)}</span>
          </div>
          <div class="flavor-tags">${flavorTagsHTML}</div>
          <div class="stock-price">${item.price}</div>
        </div>
        <div class="stock-availability ${item.available > 0 ? 'in-stock' : 'out-of-stock'}">
          ${item.available > 0 ? `${item.available} left` : 'Out of stock'}
        </div>
      </div>
    `;
  });
  
  detailsContainer.innerHTML = `
    <div class="details-header">
      <div>
        <h2 class="details-title">${location.name}</h2>
        <p class="details-address">${location.address}</p>
        ${distanceHTML}
      </div>
      <div class="details-status">Open 24/7</div>
    </div>
    
    <div class="stock-section">
      <h3 class="stock-title">
        <svg class="stock-title-icon icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 10h-7l3-3"></path>
          <path d="M18 14h-7l3 3"></path>
          <path d="M8 18.945V20a2 2 0 01-2 2H2"></path>
          <path d="M2 6v12"></path>
          <path d="M6 2H4a2 2 0 00-2 2v2"></path>
        </svg>
        Current Stock
      </h3>
      
      <div class="stock-grid">
        ${stockHTML}
      </div>
    </div>
  `;
  
  // Add Web Share API button if available
  if (navigator.share && isMobile) {
    const shareContainer = document.createElement('div');
    shareContainer.style.textAlign = 'center';
    shareContainer.style.marginTop = '2rem';
    
    const shareButton = document.createElement('button');
    shareButton.className = 'share-button';
    shareButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
      <span>Share Location</span>
    `;
    
    shareButton.addEventListener('click', function() {
      const shareData = {
        title: 'CloudChasers™ Vape Location',
        text: `Check out ${location.name} at ${location.address}`,
        url: window.location.href
      };
      
      navigator.share(shareData)
        .catch((error) => console.error('Error sharing:', error));
    });
    
    shareContainer.appendChild(shareButton);
    detailsContainer.appendChild(shareContainer);
  }
  
  // Add event listeners to flavor tags
  document.querySelectorAll('.flavor-tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const flavor = this.dataset.flavor;
      searchInput.value = flavor;
      handleSearch();
      
      // Scroll back to top on mobile
      if (isMobile) {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    });
  });
}

// Setup particle background effect
function setupParticleEffect() {
  const animatedBg = document.getElementById('animated-bg');
  
  // Create particles
  for(let i = 0; i < 20; i++) {
    createParticle(animatedBg);
  }
  
  // Add new particles periodically
  setInterval(() => {
    if(animatedBg.children.length < 30) {
      createParticle(animatedBg);
    }
  }, 3000);
}

// Create a single floating particle
function createParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  
  // Random size
  const size = Math.random() * 20 + 5;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  
  // Random position
  particle.style.left = `${Math.random() * 100}%`;
  particle.style.bottom = `-${size}px`;
  
  // Random animation duration and delay
  const duration = Math.random() * 15 + 10;
  const delay = Math.random() * 5;
  particle.style.animationDuration = `${duration}s`;
  particle.style.animationDelay = `${delay}s`;
  
  // Random opacity
  particle.style.opacity = Math.random() * 0.5 + 0.1;
  
  container.appendChild(particle);
  
  // Remove particle after animation completes
  setTimeout(() => {
    if(container.contains(particle)) {
      container.removeChild(particle);
    }
  }, (duration + delay) * 1000);
}

// Toggle between light and dark mode
function toggleTheme() {
  darkMode = !darkMode;
  
  if (darkMode) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
  
  // Update theme icon
  const themeIcon = document.querySelector('#theme-switch svg');
  if(darkMode) {
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
  } else {
    themeIcon.innerHTML = `
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    `;
  }
}

// Setup the custom cursor and smoke effect
function setupCursorEffect() {
  // Setup cursor and ring
  document.addEventListener('mousemove', (e) => {
    if (modalActive) return; // Don't update cursor when modal is open
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    // Calculate movement distance
    const moveDistance = Math.sqrt(
      Math.pow(currentX - lastMouseX, 2) + 
      Math.pow(currentY - lastMouseY, 2)
    );
    
    // Update cursor position
    mouseX = currentX;
    mouseY = currentY;
    
    if(customCursor) {
      customCursor.style.left = `${mouseX}px`;
      customCursor.style.top = `${mouseY}px`;
    }
    
    if(cursorRing) {
      cursorRing.style.left = `${mouseX}px`;
      cursorRing.style.top = `${mouseY}px`;
    }
    
    // Create particles based on mouse speed and time
    const now = Date.now();
    if (now - lastTimeParticleCreated > 30) { // Reduced particle creation rate
      const particlesPerMove = Math.min(Math.ceil(moveDistance / 20), 3); // Reduced particles
      
      for (let i = 0; i < particlesPerMove; i++) {
        createSmokeParticle();
      }
      lastTimeParticleCreated = now;
    }
    
    lastMouseX = currentX;
    lastMouseY = currentY;
  });
  
  // Animate smoke particles
  setInterval(animateSmokeParticles, 16);
  
  // Set up hover interactions for interactive elements
  document.addEventListener('mouseover', function(e) {
    if(modalActive || !customCursor || !cursorRing) return;
    
    const target = e.target;
    
    // Check if target is an interactive element
    if(
      target.tagName === 'BUTTON' ||
      target.classList.contains('location-item') ||
      target.classList.contains('map-marker') ||
      target.classList.contains('stock-item') ||
      target.classList.contains('flavor-tag') ||
      target.classList.contains('btn') ||
      target.closest('a') ||
      target.id === 'theme-switch'
    ) {
      customCursor.classList.add('hover');
      cursorRing.classList.add('hover');
    } else {
      customCursor.classList.remove('hover');
      cursorRing.classList.remove('hover');
    }
  });
}

// Create a new smoke particle
function createSmokeParticle() {
  if (!smokeContainer) return;
  
  // Create new particle element
  const particle = document.createElement('div');
  
  // Random size for varied smoke appearance
  const size = Math.floor(Math.random() * 15) + 10;
  
  // Varied offsets from cursor
  const offsetX = (Math.random() - 0.5) * 10;
  const offsetY = (Math.random() - 0.5) * 10;
  
  // Variable movement patterns
  const speedX = (Math.random() - 0.5) * 1.2;
  const speedY = (Math.random() * -2) - 0.5; // Upward drift
  const rotation = Math.random() * 360;
  const rotationSpeed = (Math.random() - 0.5) * 1;
  
  // Random blur for soft edges
  const blurAmount = Math.random() * 3 + 2;
  
  // Slight color variation
  const hue = 220 + Math.random() * 40; // Slight blue tint
  const saturation = Math.random() * 5; // Very subtle saturation
  const lightness = 95 + Math.random() * 5; // Nearly white
  const color1 = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.5 + Math.random() * 0.2})`;
  const color2 = `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`;
  
  // Apply styles
  particle.style.position = 'absolute';
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.left = `${mouseX + offsetX}px`;
  particle.style.top = `${mouseY + offsetY}px`;
  particle.style.borderRadius = '50%';
  particle.style.opacity = `${0.3 + Math.random() * 0.3}`;
  particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  particle.style.filter = `blur(${blurAmount}px)`;
  particle.style.background = `radial-gradient(circle, ${color1} 0%, ${color2} 80%)`;
  particle.style.mixBlendMode = 'screen';
  particle.style.pointerEvents = 'none';
  
  // Add to container
  smokeContainer.appendChild(particle);
  
  // Store particle data
  particles.push({
    element: particle,
    size: size,
    speedX: speedX,
    speedY: speedY,
    rotation: rotation,
    rotationSpeed: rotationSpeed,
    opacity: 0.3 + Math.random() * 0.3,
    x: mouseX + offsetX,
    y: mouseY + offsetY,
    growRate: 0.1 + Math.random() * 0.1,
    fadeRate: 0.008 + Math.random() * 0.006,
    maxSize: size * (2 + Math.random() * 2),
    turbulenceX: Math.random() * 0.03 - 0.015,
    turbulenceY: Math.random() * 0.03 - 0.015,
    turbulencePhase: Math.random() * Math.PI * 2
  });
  
  // Limit particles to prevent performance issues
  const maxParticles = 50;
  if (particles.length > maxParticles) {
    if (particles[0].element && smokeContainer.contains(particles[0].element)) {
      smokeContainer.removeChild(particles[0].element);
    }
    particles.shift();
  }
}

// Animate smoke particles
function animateSmokeParticles() {
  const particlesToRemove = [];
  
  particles.forEach((particle, index) => {
    if (!particle.element) {
      particlesToRemove.push(index);
      return;
    }
    
    // Add turbulence for natural movement
    particle.turbulencePhase += 0.05;
    const turbX = Math.sin(particle.turbulencePhase) * particle.turbulenceX;
    const turbY = Math.cos(particle.turbulencePhase) * particle.turbulenceY;
    
    // Gradual slowdown of horizontal movement
    particle.speedX *= 0.99;
    // Slight acceleration upward
    particle.speedY *= 1.005;
    
    // Update position with turbulence
    particle.x += particle.speedX + turbX;
    particle.y += particle.speedY + turbY;
    
    // Update size and opacity
    if (particle.size < particle.maxSize) {
      particle.size += particle.growRate;
    }
    particle.opacity -= particle.fadeRate;
    
    // Update rotation for swirling effect
    particle.rotation += particle.rotationSpeed;
    
    // Check if the particle is still visible on screen - if not, mark for removal
    const isOffScreen = 
      particle.x < 0 || 
      particle.x > window.innerWidth || 
      particle.y < 0 || 
      particle.y > window.innerHeight;
    
    // Apply updates to DOM element
    if (!isOffScreen && particle.opacity > 0.01) {
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
      particle.element.style.width = `${particle.size}px`;
      particle.element.style.height = `${particle.size}px`;
      particle.element.style.opacity = particle.opacity;
      particle.element.style.transform = `translate(-50%, -50%) rotate(${particle.rotation}deg) scale(${1 + Math.sin(particle.turbulencePhase) * 0.03})`;
    } else {
      particlesToRemove.push(index);
    }
  });
  
  // Remove faded or off-screen particles
  for (let i = particlesToRemove.length - 1; i >= 0; i--) {
    const index = particlesToRemove[i];
    if (particles[index] && particles[index].element) {
      if (smokeContainer.contains(particles[index].element)) {
        smokeContainer.removeChild(particles[index].element);
      }
      particles.splice(index, 1);
    }
  }
}

// Handle window resize
window.addEventListener('resize', function() {
  // Adjust cursor visibility based on screen size
  if (window.innerWidth < 1024) {
    if (customCursor) customCursor.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
  } else if (!modalActive) {
    if (customCursor) customCursor.style.display = 'block';
    if (cursorRing) cursorRing.style.display = 'block';
  }
});

// Handle touch events on mobile - make cursor follow touch on larger tablets
if (isMobile && window.innerWidth >= 768) {
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      mouseX = touch.clientX;
      mouseY = touch.clientY;
      
      // Only update cursor if it's visible in this mode
      if (window.innerWidth >= 1024 && !modalActive) {
        if (customCursor) {
          customCursor.style.left = `${mouseX}px`;
          customCursor.style.top = `${mouseY}px`;
        }
        
        if (cursorRing) {
          cursorRing.style.left = `${mouseX}px`;
          cursorRing.style.top = `${mouseY}px`;
        }
      }
    }
  });
}

// Fix for iOS Safari 100vh issue
function fixIOSViewportHeight() {
  // First we get the viewport height and multiply it by 1% to get a value for a vh unit
  const vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Handle network status changes
window.addEventListener('online', () => {
  // Refresh data when coming back online
  if (document.visibilityState === 'visible') {
    renderLocationList();
    renderMapMarkers();
    updateMapCount();
  }
});

window.addEventListener('offline', () => {
  // Show offline notification
  const offlineToast = document.createElement('div');
  offlineToast.className = 'offline-toast';
  offlineToast.textContent = 'You are currently offline';
  document.body.appendChild(offlineToast);
  
  setTimeout(() => {
    offlineToast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    offlineToast.classList.remove('show');
    setTimeout(() => offlineToast.remove(), 500);
  }, 3000);
});

// Add fade-in animations for elements as they enter the viewport
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('.sidebar, .map-container, .details-container');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  animatedElements.forEach(element => {
    element.classList.add('animate-on-scroll');
    observer.observe(element);
  });
}

// Implement pull-to-refresh on mobile
let touchStartY = 0;
let touchEndY = 0;
const refreshThreshold = 150; // Pixels

document.addEventListener('touchstart', e => {
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', e => {
  touchEndY = e.touches[0].clientY;
  
  // Check if at top of page and pulling down
  if (window.scrollY === 0 && touchEndY > touchStartY) {
    const pullDistance = touchEndY - touchStartY;
    
    // Add visual feedback for pull-to-refresh
    if (pullDistance > 50) {
      document.body.style.paddingTop = `${pullDistance / 3}px`;
    }
  }
});

document.addEventListener('touchend', e => {
  // Check pull distance against threshold
  if (window.scrollY === 0 && touchEndY > touchStartY) {
    const pullDistance = touchEndY - touchStartY;
    
    if (pullDistance > refreshThreshold) {
      // Perform refresh
      location.reload();
    }
    
    // Reset padding regardless
    document.body.style.paddingTop = '0';
  }
  
  // Reset values
  touchStartY = 0;
  touchEndY = 0;
});

// Run the function initially and on resize
fixIOSViewportHeight();
window.addEventListener('resize', fixIOSViewportHeight);

// Register service worker for offline capability if supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered');
      })
      .catch(error => {
        console.warn('ServiceWorker registration failed:', error);
      });
  });
}

// Run setup functions once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupScrollAnimations();
  
  // Add classes needed for animations
  document.querySelectorAll('.sidebar, .map-container, .details-container').forEach(el => {
    el.classList.add('animate-on-scroll');
  });
});
