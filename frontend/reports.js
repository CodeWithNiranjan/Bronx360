document.addEventListener('DOMContentLoaded', function() {
    loadReports();
});

async function loadReports() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const reports = await response.json();
        
        const reportsList = document.getElementById('reportsList');
        reportsList.innerHTML = '';

        reports.forEach(report => {
            const reportCard = createReportCard(report);
            reportsList.appendChild(reportCard);
        });
    } catch (error) {
        console.error('Error loading reports:', error);
        document.getElementById('reportsList').innerHTML = 
            '<div class="alert alert-danger">Failed to load reports. Please try again later.</div>';
    }
}

function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    const statusClass = report.status === 'open' ? 'text-success' : 'text-secondary';
    
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${report.title}</h5>
            <h6 class="card-subtitle mb-2 ${statusClass}">${report.status.toUpperCase()}</h6>
            <p class="card-text">${report.description}</p>
            <div class="card-text">
                <small class="text-muted">
                    <strong>Location:</strong> ${report.location}<br>
                    <strong>Issue Type:</strong> ${report.issueType}<br>
                    <strong>Reported:</strong> ${new Date(report.createdAt).toLocaleDateString()}
                </small>
            </div>
        </div>
    `;
    
    return card;
} 