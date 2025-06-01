document.addEventListener('DOMContentLoaded', function() {
    // Fetch recent reports
    fetch('http://localhost:3000/api/reports?limit=3')
        .then(response => response.json())
        .then(reports => {
            const recentReportsContainer = document.getElementById('recentReports');
            
            reports.forEach(report => {
                const reportCard = createReportCard(report);
                recentReportsContainer.appendChild(reportCard);
            });
        })
        .catch(error => {
            console.error('Error fetching recent reports:', error);
        });
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