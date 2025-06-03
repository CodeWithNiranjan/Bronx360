document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://bronx360-backend.onrender.com';

    // Fetch reports
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

    // Display reports
    function displayReports(reports) {
        const reportsList = document.getElementById('reportsList');
        reportsList.innerHTML = reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <div class="report-type">
                        <i class="bi bi-${getTypeIcon(report.issueType)}"></i>
                        ${report.issueType}
                    </div>
                    <div class="report-status status-${report.status}">
                        ${report.status}
                    </div>
                </div>
                <div class="report-body">
                    <p class="report-description">${report.description}</p>
                    <div class="report-meta">
                        <small class="text-muted">
                            <i class="bi bi-geo-alt"></i> ${report.location}
                        </small>
                        <small class="text-muted">
                            <i class="bi bi-clock"></i> ${new Date(report.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Get icon for report type
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