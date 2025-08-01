// Use module pattern to avoid polluting global namespace
const DestinationsModule = (() => {
    // Private variables
    const API_ENDPOINT = '/api/destinations';
    let currentRegion = 'global';
    
    // Cache DOM elements
    const elements = {
        topDestinations: document.getElementById('top-destinations'),
        trendingDestinations: document.getElementById('trending-destinations'),
        seasonalDestinations: document.getElementById('seasonal-destinations'),
        regionTitle: document.getElementById('region-title'),
        regionButtons: {
            global: document.getElementById('btn-global'),
            europe: document.getElementById('btn-europe'),
            asia: document.getElementById('btn-asia'),
            americas: document.getElementById('btn-americas')
        }
    };
    
    // Private methods
    const fetchDestinations = async (region) => {
        try {
            // In production, this would be a real API call
            // const response = await fetch(`${API_ENDPOINT}?region=${region}`);
            // const data = await response.json();
            
            // Mock data for demonstration
            const mockData = {
                top: generateMockDestinations(10, 'top'),
                trending: generateMockDestinations(6, 'trending'),
                seasonal: generateMockDestinations(4, 'seasonal')
            };
            
            return mockData;
        } catch (error) {
            console.error('Error fetching destinations:', error);
            showErrorState();
            return null;
        }
    };
    
    const generateMockDestinations = (count, type) => {
        const regions = {
            global: ['Paris', 'Tokyo', 'New York', 'London', 'Sydney'],
            europe: ['Paris', 'Rome', 'Barcelona', 'Amsterdam', 'Santorini'],
            asia: ['Tokyo', 'Bangkok', 'Bali', 'Seoul', 'Singapore'],
            americas: ['New York', 'Cancun', 'Rio de Janeiro', 'Vancouver', 'Machu Picchu']
        };
        
        return Array.from({ length: count }, (_, i) => {
            const regionDestinations = regions[currentRegion] || regions.global;
            const name = `${regionDestinations[i % regionDestinations.length]} ${type === 'seasonal' ? 'Seasonal' : ''}`;
            
            return {
                id: `${type}-${i}-${Date.now()}`,
                name: name,
                image: `https://source.unsplash.com/random/600x400/?${name.split(',')[0].toLowerCase()},city`,
                description: `Experience the beauty of ${name} with our exclusive travel packages.`,
                rank: i + 1,
                trend: type === 'trending' ? ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)] : null,
                tags: ['cultural', 'beach', 'mountain', 'city'][Math.floor(Math.random() * 4)]
            };
        });
    };
    
    const renderDestinationCard = (destination, type) => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="card h-100 destination-card">
                <img src="${destination.image}" class="card-img-top" alt="${destination.name}" loading="lazy">
                <div class="card-body">
                    ${type === 'top' ? `
                    <div class="d-flex align-items-center mb-2">
                        <span class="ranking-badge ${destination.rank === 1 ? 'gold' : destination.rank === 2 ? 'silver' : 'bronze'}">
                            ${destination.rank}
                        </span>
                        <h3 class="h5 mb-0">${destination.name}</h3>
                    </div>
                    ` : `<h3 class="h5 mb-2">${destination.name}</h3>`}
                    
                    ${destination.trend ? `
                    <div class="mb-2">
                        <span class="badge ${destination.trend === 'up' ? 'bg-success' : destination.trend === 'down' ? 'bg-danger' : 'bg-secondary'}">
                            <i class="fas fa-arrow-${destination.trend === 'up' ? 'up' : 'down'} me-1"></i>
                            ${destination.trend === 'up' ? 'Rising' : destination.trend === 'down' ? 'Declining' : 'Stable'}
                        </span>
                    </div>
                    ` : ''}
                    
                    <p class="card-text text-muted small">${destination.description}</p>
                    <div class="d-flex flex-wrap gap-1">
                        <span class="badge bg-light text-dark">${destination.tags}</span>
                        ${type === 'seasonal' ? '<span class="badge bg-warning text-dark">Seasonal</span>' : ''}
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top-0">
                    <button class="btn btn-sm btn-outline-primary w-100 view-details" data-id="${destination.id}">
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
        elements.trendingDestinations.innerHTML = '';
        elements.seasonalDestinations.innerHTML = '';
        
        document.getElementById('retry-loading').addEventListener('click', loadData);
    };
    
    const showLoadingState = () => {
        elements.topDestinations.innerHTML = `
            <div class="col-12 spinner-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading destinations...</span>
                </div>
            </div>
        `;
    };
    
    const updateRegionTitle = (region) => {
        const regionNames = {
            global: 'Worldwide',
            europe: 'Europe',
            asia: 'Asia',
            americas: 'Americas'
        };
        
        elements.regionTitle.textContent = regionNames[region] || 'Worldwide';
        elements.regionTitle.classList.remove('visually-hidden');
    };
    
    const setActiveRegionButton = (region) => {
        // Remove active class from all buttons
        Object.values(elements.regionButtons).forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Add active class to selected button
        if (elements.regionButtons[region]) {
            elements.regionButtons[region].classList.add('active');
            elements.regionButtons[region].setAttribute('aria-selected', 'true');
        }
    };
    
    const loadData = async () => {
        showLoadingState();
        
        const data = await fetchDestinations(currentRegion);
        if (!data) return;
        
        // Clear existing content
        elements.topDestinations.innerHTML = '';
        elements.trendingDestinations.innerHTML = '';
        elements.seasonalDestinations.innerHTML = '';
        
        // Render top destinations
        data.top.forEach(destination => {
            elements.topDestinations.appendChild(renderDestinationCard(destination, 'top'));
        });
        
        // Render trending destinations
        data.trending.forEach(destination => {
            elements.trendingDestinations.appendChild(renderDestinationCard(destination, 'trending'));
        });
        
        // Render seasonal destinations
        data.seasonal.forEach(destination => {
            elements.seasonalDestinations.appendChild(renderDestinationCard(destination, 'seasonal'));
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const destinationId = e.target.getAttribute('data-id');
                // In a real app, this would navigate to a details page
                alert(`Viewing details for destination ID: ${destinationId}`);
            });
        });
    };
    
    // Public methods
    const init = () => {
        // Set up region filter buttons
        Object.entries(elements.regionButtons).forEach(([region, button]) => {
            button.addEventListener('click', () => {
                currentRegion = region;
                updateRegionTitle(region);
                setActiveRegionButton(region);
                loadData();
            });
        });
        
        // Initial load
        loadData();
    };
    
    return {
        init
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', DestinationsModule.init);