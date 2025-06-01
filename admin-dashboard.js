document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    const reportsList = document.getElementById('reportsList');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const reportCount = document.getElementById('reportCount');
    const logoutBtn = document.getElementById('logoutBtn');
    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    const reportForm = document.getElementById('reportForm');
    const saveReportBtn = document.getElementById('saveReportBtn');

    let reports = [];

    // Get the backend URL from environment or use default
    const BACKEND_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://bronx360-backend.onrender.com';

    // Fetch reports
    async function fetchReports() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/reports`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }

            reports = await response.json();
            updateReportsList();
        } catch (error) {
            console.error('Error fetching reports:', error);
            showAlert('Failed to load reports. Please try again.', 'danger');
        }
    }

    // Update reports list
    function updateReportsList() {
        const filteredReports = reports.filter(report => {
            const statusMatch = !statusFilter.value || report.status === statusFilter.value;
            const typeMatch = !typeFilter.value || report.issueType === typeFilter.value;
            return statusMatch && typeMatch;
        });

        reportCount.textContent = `${filteredReports.length} report${filteredReports.length !== 1 ? 's' : ''}`;

        reportsList.innerHTML = filteredReports.map(report => `
            <div class="report-card" data-id="${report.id}">
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
                <div class="report-footer">
                    <button class="btn btn-sm btn-outline-primary edit-report" data-id="${report.id}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                </div>
            </div>
        `).join('');

        // Add click handlers for edit buttons
        document.querySelectorAll('.edit-report').forEach(button => {
            button.addEventListener('click', () => {
                const reportId = button.dataset.id;
                const report = reports.find(r => r.id === parseInt(reportId));
                if (report) {
                    showReportModal(report);
                }
            });
        });
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

    // Show report modal
    function showReportModal(report) {
        document.getElementById('reportId').value = report.id;
        document.getElementById('status').value = report.status;
        document.getElementById('adminNotes').value = report.adminNotes || '';
        reportModal.show();
    }

    // Show alert
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Find the container and insert the alert at the top
        const container = document.querySelector('.container');
        if (!container) {
            console.error('Container not found for alert');
            return;
        }

        // Find the first row or create one if it doesn't exist
        let firstRow = container.querySelector('.row');
        if (!firstRow) {
            firstRow = document.createElement('div');
            firstRow.className = 'row';
            container.appendChild(firstRow);
        }

        // Insert the alert before the first row
        container.insertBefore(alertDiv, firstRow);
        setTimeout(() => alertDiv.remove(), 5000);
    }

    // Save report changes
    async function saveReportChanges() {
        const reportId = document.getElementById('reportId').value;
        const status = document.getElementById('status').value;
        const adminNotes = document.getElementById('adminNotes').value;

        try {
            console.log('Saving report changes:', { reportId, status, adminNotes });
            
            const response = await fetch(`${BACKEND_URL}/api/admin/reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ 
                    status, 
                    adminNotes: adminNotes 
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to update report');
            }

            // Update local reports array
            console.log('Report updated successfully:', responseData);
            
            const index = reports.findIndex(r => r.id === parseInt(reportId));
            if (index !== -1) {
                reports[index] = responseData;
                updateReportsList();
            }

            reportModal.hide();
            showAlert('Report updated successfully', 'success');
        } catch (error) {
            console.error('Error updating report:', error);
            showAlert('Failed to update report: ' + error.message, 'danger');
        }
    }

    // Event listeners
    statusFilter.addEventListener('change', updateReportsList);
    typeFilter.addEventListener('change', updateReportsList);
    saveReportBtn.addEventListener('click', saveReportChanges);
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    });

    // Initial load
    fetchReports();
}); 