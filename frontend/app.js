// Constants
const API_URL = 'http://localhost:3000/api';

// Map setup
let map;
let currentMarker;

// Create and setup the map
function setupMap() {
    // Basic map setup
    map = L.map('map', {
        center: [40.8448, -73.8648], // Bronx coordinates
        zoom: 13
    });

    // Add map tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler
    map.on('click', function(e) {
        addMarker(e.latlng);
    });
}

// Add or update marker
function addMarker(latlng) {
    // Remove existing marker if any
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create new marker
    currentMarker = L.marker(latlng).addTo(map);

    // Update location input
    const locationInput = document.getElementById('location');
    if (locationInput) {
        locationInput.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
    }
}

// Setup the report form
function setupReportForm() {
    const form = document.getElementById('reportForm');
    if (!form) return;

    // Initialize map
    setupMap();

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!currentMarker) {
            alert('Please select a location on the map');
            return;
        }

        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            type: document.getElementById('issueType').value,
            latitude: currentMarker.getLatLng().lat,
            longitude: currentMarker.getLatLng().lng
        };

        try {
            const response = await fetch(`${API_URL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit report');
            }

            alert('Report submitted successfully!');
            window.location.href = 'reports.html';
        } catch (error) {
            alert('Error submitting report: ' + error.message);
        }
    });
}

// Fetch reports from API
async function fetchReports() {
    try {
        const response = await fetch(`${API_URL}/reports`);
        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
}

// Display reports on the page
function displayReports(reports) {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = `
        <h2 class="mb-4">Community Reports</h2>
        <div class="row">
            ${reports.map(report => `
                <div class="col-md-6 mb-4">
                    <div class="card report-card">
                        <div class="card-body">
                            <h5 class="card-title">${report.title}</h5>
                            <span class="report-type ${report.type}">${report.type}</span>
                            <span class="report-status ${report.status}">${report.status}</span>
                            <p class="card-text">${report.description}</p>
                            <p class="card-text"><small class="text-muted">${new Date(report.created_at).toLocaleString()}</small></p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    
    if (path.includes('reports.html')) {
        fetchReports().then(displayReports);
    } else if (path.includes('submit.html')) {
        setupReportForm();
    } else {
        // Home page
        fetchReports().then(reports => {
            const content = document.getElementById('content');
            if (content) {
                content.innerHTML = `
                    <div class="text-center">
                        <h1 class="display-4 mb-4">Welcome to Bronx360</h1>
                        <p class="lead">Report and track community issues in the Bronx</p>
                        <a href="submit.html" class="btn btn-primary btn-lg">Submit a Report</a>
                        <a href="reports.html" class="btn btn-outline-primary btn-lg ms-2">View Reports</a>
                    </div>
                `;
            }
        });
    }
}); 