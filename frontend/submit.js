// Map variables
let map;
let marker;

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
        console.error('Leaflet is not loaded!');
        document.getElementById('map').innerHTML = '<div class="alert alert-danger">Map library failed to load. Please refresh the page.</div>';
        return;
    }
    
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    console.log('Map container:', mapContainer);
    
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }

    try {
        // Initialize the map
        console.log('Initializing map...');
        map = L.map('map', {
            center: [40.8448, -73.8648], // Centered on the Bronx
            zoom: 13,
            zoomControl: true
        });
        console.log('Map initialized');

        // Add the tile layer
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        });
        
        tileLayer.addTo(map);
        console.log('Tile layer added');

        // Force a resize event to ensure the map is properly rendered
        setTimeout(() => {
            map.invalidateSize();
            console.log('Map size invalidated');
        }, 100);

        // Add click handler to the map
        map.on('click', function(e) {
            console.log('Map clicked:', e.latlng);
            // Remove existing marker if any
            if (marker) {
                map.removeLayer(marker);
            }

            // Add new marker
            marker = L.marker(e.latlng).addTo(map);

            // Update the hidden fields
            document.getElementById('latitude').value = e.latlng.lat;
            document.getElementById('longitude').value = e.latlng.lng;
        });
    } catch (error) {
        console.error('Error initializing map:', error);
        document.getElementById('map').innerHTML = '<div class="alert alert-danger">Failed to initialize map: ' + error.message + '</div>';
    }

    // Handle form submission
    const form = document.getElementById('reportForm');
    if (!form) {
        console.error('Report form not found!');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        // Validate required fields
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        const location = document.getElementById('location').value;
        const latitude = document.getElementById('latitude').value;
        const longitude = document.getElementById('longitude').value;

        console.log('Form values:', { type, description, location, latitude, longitude });

        if (!type || !description || !location) {
            console.error('Missing required fields');
            alert('Please fill in all required fields');
            return;
        }

        if (!latitude || !longitude) {
            console.error('No location selected on map');
            alert('Please select a location on the map');
            return;
        }

        const formData = {
            title: type, // Using type as title
            description: description.trim(),
            location: location.trim(),
            issueType: type, // Using type as issueType
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            status: 'open',
            createdAt: new Date().toISOString()
        };

        console.log('Submitting form data:', formData);

        // Handle photo upload if present
        const photoInput = document.getElementById('photo');
        if (photoInput.files.length > 0) {
            const photo = photoInput.files[0];
            console.log('Photo selected:', photo.name);
            // TODO: Implement photo upload functionality
        }

        try {
            console.log('Sending request to server...');
            const response = await fetch('http://localhost:3000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Server response status:', response.status);
            
            const responseData = await response.json();
            console.log('Server response:', responseData);
            
            if (response.ok) {
                console.log('Report submitted successfully');
                alert('Report submitted successfully!');
                form.reset();
                if (marker) {
                    map.removeLayer(marker);
                }
                window.location.href = 'reports.html';
            } else {
                console.error('Server error:', responseData);
                throw new Error(responseData.error || 'Failed to submit report');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report: ' + error.message);
        }
    });
}); 