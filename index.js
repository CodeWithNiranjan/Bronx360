document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://bronx360-backend.onrender.com';

    // Initialize map
    const map = L.map('map').setView([40.8448, -73.8648], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Fetch and display reports
    async function fetchReports() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/reports`);
            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }
            const reports = await response.json();
            displayReports(reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            showAlert('Failed to load reports. Please try again.', 'danger');
        }
    }

    // Display reports on map
    function displayReports(reports) {
        reports.forEach(report => {
            const marker = L.marker([report.latitude, report.longitude])
                .bindPopup(`
                    <strong>${report.issueType}</strong><br>
                    ${report.description}<br>
                    <small>Status: ${report.status}</small>
                `)
                .addTo(map);
        });
    }

    // Show alert
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.row'));
        setTimeout(() => alertDiv.remove(), 5000);
    }

    // Initial load
    fetchReports();
});

function createReportCard(report) {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    
    const statusClass = {
        'open': 'status-open',
        'in-progress': 'status-in-progress',
        'resolved': 'status-resolved'
    }[report.status] || 'status-open';

    col.innerHTML = `
        <div class="card report-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="report-type ${report.type}">
                        <i class="bi bi-${getTypeIcon(report.type)}"></i>
                        ${report.type}
                    </span>
                    <span class="report-status ${statusClass}">
                        ${report.status}
                    </span>
                </div>
                <p class="report-description">${report.description}</p>
                <div class="report-meta">
                    <span>
                        <i class="bi bi-calendar"></i>
                        ${new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span>
                        <i class="bi bi-geo-alt"></i>
                        ${report.location}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function getTypeIcon(type) {
    const icons = {
        'pothole': 'cone-striped',
        'graffiti': 'brush',
        'streetlight': 'lightbulb',
        'garbage': 'trash',
        'other': 'exclamation-circle'
    };
    return icons[type] || 'exclamation-circle';
} 