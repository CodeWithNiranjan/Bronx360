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
            
            // Sort reports by date (newest first) and take only the 6 most recent
            const recentReports = reports
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6);
            
            displayReports(recentReports);
            displayRecentReports(recentReports);
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

    // Display recent reports in the home page
    function displayRecentReports(reports) {
        const recentReportsContainer = document.getElementById('recentReports');
        if (!recentReportsContainer) return;

        recentReportsContainer.innerHTML = ''; // Clear existing content
        
        if (reports.length === 0) {
            recentReportsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        No reports available yet. Be the first to submit a report!
                    </div>
                </div>
            `;
            return;
        }

        reports.forEach(report => {
            const reportCard = createReportCard(report);
            recentReportsContainer.appendChild(reportCard);
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
                    <span class="report-type ${report.issueType.toLowerCase()}">
                        <i class="bi bi-${getTypeIcon(report.issueType)}"></i>
                        ${report.issueType}
                    </span>
                    <span class="report-status ${statusClass}">
                        ${report.status}
                    </span>
                </div>
                <h5 class="card-title">${report.title}</h5>
                <p class="report-description">${report.description}</p>
                <div class="report-meta">
                    <span>
                        <i class="bi bi-calendar"></i>
                        ${new Date(report.createdAt).toLocaleDateString()}
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
    return icons[type.toLowerCase()] || 'exclamation-circle';
} 