let allListings = [];
let filteredListings = [];
function MainModule(listingsID = "#listings") {
  const me = {};


  const listingsElement = document.querySelector(listingsID);

function getListingCode(listing) {
  console.log("Processing listing:", listing.name); // DEBUG LINE
  console.log("Host name:", listing.host_name);
  // Parse amenities safely
  let amenities = [];
  try {
    if (listing.amenities) {
      amenities = JSON.parse(listing.amenities).slice(0, 5);
    }
  } catch (e) {
    amenities = ['No amenities listed'];
  }

  return `<div class="col-lg-4 col-md-6 mb-4">
    <div class="listing card h-100">
      <img
        src="${listing.picture_url || 'https://via.placeholder.com/300x200'}"
        class="card-img-top"
        alt="${listing.name}"
        style="height: 200px; object-fit: cover;"
      />
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${listing.name}</h5>
        
        <!-- Description -->
        <p class="card-text description">
          ${listing.description ? listing.description.substring(0, 120) + '...' : 'No description available'}
        </p>
        
        <!-- Host Info -->
        <div class="host-info d-flex align-items-center mb-2">
          <img 
            src="${listing.host_thumbnail_url || 'https://via.placeholder.com/40x40'}" 
            alt="${listing.host_name || 'Host'}" 
            class="rounded-circle me-2" 
            width="40" 
            height="40"
            style="object-fit: cover;"
          />
          <div>
            <small class="text-muted d-block">Hosted by</small>
            <strong>${listing.host_name || 'Unknown Host'}</strong>
          </div>
        </div>
        
        <!-- Amenities -->
        <div class="amenities mb-3">
          <small class="text-muted d-block mb-1">Top Amenities:</small>
          <div>
            ${amenities.map(amenity => `<span class="badge bg-light text-dark me-1 mb-1">${amenity}</span>`).join('')}
          </div>
        </div>
        
        <!-- Price at bottom -->
        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center">
            <strong class="text-success fs-4">${listing.price || 'Price N/A'}</strong>
            <small class="text-muted">per night</small>
          </div>
        </div>
      <!-- View on Airbnb Button -->
          <a 
            href="${listing.listing_url}" 
            target="_blank" 
            rel="noopener noreferrer"
            class="btn btn-danger w-100 d-flex align-items-center justify-content-center"
            style="background-color: #FF5A5F; border-color: #FF5A5F;"
          >
            View on Airbnb
          </a>
        </div>
      </div>
    </div>
  </div>`;
}

  function redraw(listings) {
    listingsElement.innerHTML = "";
    // for (let i = 0; i < listings.length; i++) {
    //   listingsElement.innerHTML += getListingCode(listings[i]);
    // }

    // for (let listing of listings) {
    //   console.log("listing", listing );
    //   listingsElement.innerHTML += getListingCode(listing);
    // }

    listingsElement.innerHTML = listings.map(getListingCode).join("\n");
  }

async function loadData() {
  const res = await fetch("./airbnb_sf_listings_500.json");
  const listings = await res.json();
  
  allListings = listings.slice(0, 50);
  filteredListings = [...allListings];
  
  me.redraw(filteredListings);
  setupEventListeners();
}

// Add these new functions
function setupEventListeners() {
  const searchInput = document.querySelector('#searchInput');
  const priceFilter = document.querySelector('#priceFilter');
  const resetBtn = document.querySelector('#resetBtn');

  searchInput?.addEventListener('input', filterListings);
  priceFilter?.addEventListener('change', filterListings);
  resetBtn?.addEventListener('click', resetFilters);
}

function filterListings() {
  const searchTerm = document.querySelector('#searchInput')?.value.toLowerCase() || '';
  const priceRange = document.querySelector('#priceFilter')?.value || '';

  filteredListings = allListings.filter(listing => {
    // Search filter
    const matchesSearch = !searchTerm || 
      listing.name?.toLowerCase().includes(searchTerm) ||
      listing.neighbourhood_cleansed?.toLowerCase().includes(searchTerm) ||
      listing.description?.toLowerCase().includes(searchTerm);

    // Price filter
    let matchesPrice = true;
    if (priceRange && listing.price) {
      const price = parseFloat(listing.price.replace('$', ''));
      if (priceRange === '0-100') matchesPrice = price < 100;
      else if (priceRange === '100-200') matchesPrice = price >= 100 && price <= 200;
      else if (priceRange === '200-500') matchesPrice = price >= 200 && price <= 500;
      else if (priceRange === '500+') matchesPrice = price > 500;
    }

    return matchesSearch && matchesPrice;
  });

  me.redraw(filteredListings);
}

function resetFilters() {
  document.querySelector('#searchInput').value = '';
  document.querySelector('#priceFilter').value = '';
  filteredListings = [...allListings];
  me.redraw(filteredListings);
}


  me.redraw = redraw;
  me.loadData = loadData;

  return me;
}

const main = MainModule();


main.loadData();