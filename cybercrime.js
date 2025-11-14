// Cybercrime Reporting Module
class CybercrimeManager {
    constructor() {
        this.reports = [];
        this.storageKey = 'sirrivault_cybercrime_reports';
        this.authorities = [
            { id: 'police', name: 'Nigeria Police Cyber Unit', enabled: true },
            { id: 'efcc', name: 'EFCC Cybercrime Desk', enabled: true },
            { id: 'sirrishield', name: 'SirriShield CyberOps Team', enabled: false }
        ];
        this.init();
    }

    init() {
        this.loadReports();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Evidence upload handling
        const evidenceUpload = document.getElementById('evidenceUpload');
        if (evidenceUpload) {
            evidenceUpload.addEventListener('change', (e) => this.handleEvidenceUpload(e.target.files));
        }
    }

    loadReports() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.reports = stored ? JSON.parse(stored) : this.getSampleReports();
            this.renderRecentReports();
        } catch (error) {
            console.error('Error loading reports:', error);
            this.reports = this.getSampleReports();
        }
    }

    getSampleReports() {
        return [
            {
                id: 'report_1',
                type: 'phishing',
                title: 'Phishing Attempt - Gmail',
                description: 'Received suspicious email asking for login credentials',
                status: 'pending',
                caseNumber: 'SC-7842',
                submitted: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                authorities: ['police', 'efcc'],
                evidence: []
            },
            {
                id: 'report_2',
                type: 'unauthorized_access',
                title: 'Unauthorized Bank Access',
                description: 'Noticed unfamiliar transactions in bank account',
                status: 'resolved',
                caseNumber: 'SC-7791',
                submitted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                authorities: ['police'],
                evidence: []
            }
        ];
    }

    saveReports() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.reports));
        } catch (error) {
            console.error('Error saving reports:', error);
            showNotification('Error saving reports', 'error');
        }
    }

    openReportForm(type) {
        this.currentReportType = type;
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('reportModalTitle');
        
        const titles = {
            'hacking': '💻 Report Hacking Incident',
            'identity': '👤 Report Identity Theft',
            'scam': '⚠️ Report Online Scam',
            'breach': '🔓 Report Data Breach'
        };
        
        if (title) {
            title.textContent = titles[type] || 'Report Cybercrime';
        }
        
        const incidentType = document.getElementById('incidentType');
        if (incidentType) {
            incidentType.value = titles[type] || 'Cybercrime Incident';
        }
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    submitReport(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const reportData = {
            id: 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: this.currentReportType,
            title: this.getReportTitle(this.currentReportType),
            description: formData.get('description') || document.querySelector('#reportForm textarea').value,
            status: 'pending',
            caseNumber: 'SC-' + (8000 + Math.floor(Math.random() * 1000)),
            submitted: new Date().toISOString(),
            authorities: this.getSelectedAuthorities(),
            evidence: this.currentEvidence || []
        };

        this.reports.unshift(reportData);
        this.saveReports();
        this.renderRecentReports();
        
        showNotification(`🚨 Report submitted to authorities! Case number: ${reportData.caseNumber}`, 'success');
        this.closeReportModal();
        event.target.reset();
        this.currentEvidence = [];
    }

    getReportTitle(type) {
        const titles = {
            'hacking': 'Hacking Incident Report',
            'identity': 'Identity Theft Report',
            'scam': 'Online Scam Report',
            'breach': 'Data Breach Report'
        };
        return titles[type] || 'Cybercrime Report';
    }

    getSelectedAuthorities() {
        const checkboxes = document.querySelectorAll('.authority-checkboxes input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => {
            return cb.parentElement.textContent.trim().split(' ')[0].toLowerCase();
        });
    }

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEvidence = [];
    }

    triggerEvidenceUpload() {
        const input = document.getElementById('evidenceUpload');
        if (input) {
            input.click();
        }
    }

    handleEvidenceUpload(files) {
        if (files.length > 0) {
            this.currentEvidence = this.currentEvidence || [];
            
            Array.from(files).forEach(file => {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    showNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
                    return;
                }
                
                this.currentEvidence.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadDate: new Date().toISOString()
                });
            });
            
            showNotification(`📎 ${files.length} evidence file(s) attached`, 'success');
        }
    }

    renderRecentReports() {
        const reportsList = document.querySelector('.reports-list');
        if (!reportsList) return;

        // Show only recent reports (last 10)
        const recentReports = this.reports.slice(0, 10);
        
        reportsList.innerHTML = recentReports.map(report => this.createReportItemHTML(report)).join('');
    }

    createReportItemHTML(report) {
        const statusClass = report.status === 'resolved' ? 'resolved' : 'pending';
        const statusIcon = report.status === 'resolved' ? '🟢' : '🟡';
        const submitted = this.formatDate(report.submitted);

        return `
            <div class="report-item" data-report-id="${report.id}">
                <div class="report-status ${statusClass}">${statusIcon} ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}</div>
                <div class="report-details">
                    <h4>${report.title}</h4>
                    <p>Submitted: ${submitted} • Case ${report.caseNumber}</p>
                </div>
                <button class="btn-small" onclick="cybercrimeManager.viewReportDetails('${report.id}')">View</button>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    }

    viewReportDetails(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            this.showReportModal(report);
        }
    }

    showReportModal(report) {
        // This would show a detailed view of the report
        const details = `
            Type: ${report.type}
            Status: ${report.status}
            Case Number: ${report.caseNumber}
            Submitted: ${new Date(report.submitted).toLocaleString()}
            Authorities: ${report.authorities.join(', ')}
            ${report.evidence.length > 0 ? `Evidence: ${report.evidence.length} file(s)` : 'No evidence attached'}
        `;
        
        showNotification(`Report Details:\n${details}`, 'info');
    }

    getReportStats() {
        const stats = {
            total: this.reports.length,
            pending: this.reports.filter(r => r.status === 'pending').length,
            resolved: this.reports.filter(r => r.status === 'resolved').length,
            last24h: this.reports.filter(r => {
                const reportDate = new Date(r.submitted);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return reportDate > oneDayAgo;
            }).length
        };

        return stats;
    }

    updateAuthorityPreference(authorityId, enabled) {
        const authority = this.authorities.find(a => a.id === authorityId);
        if (authority) {
            authority.enabled = enabled;
            // Save preferences to localStorage
            localStorage.setItem('sirrivault_authorities', JSON.stringify(this.authorities));
        }
    }

    // Emergency reporting - immediate alert
    emergencyReport(incidentType, location = 'Unknown') {
        const emergencyReport = {
            id: 'emergency_' + Date.now(),
            type: incidentType,
            title: `EMERGENCY: ${incidentType}`,
            description: `Emergency report submitted from location: ${location}`,
            status: 'emergency',
            caseNumber: 'EMG-' + (100 + Math.floor(Math.random() * 900)),
            submitted: new Date().toISOString(),
            authorities: this.authorities.filter(a => a.enabled).map(a => a.id),
            priority: 'high'
        };

        this.reports.unshift(emergencyReport);
        this.saveReports();
        this.renderRecentReports();

        // Show immediate alert
        alert(`🚨 EMERGENCY REPORT SUBMITTED!\nCase Number: ${emergencyReport.caseNumber}\nAuthorities have been notified.`);
        
        return emergencyReport;
    }
}

// Global cybercrime functions
function openReportForm(type) {
    cybercrimeManager.openReportForm(type);
}

function submitReport(event) {
    cybercrimeManager.submitReport(event);
}

function triggerEvidenceUpload() {
    cybercrimeManager.triggerEvidenceUpload();
}

function handleEvidenceUpload(files) {
    cybercrimeManager.handleEvidenceUpload(files);
}

function viewReportDetails(button) {
    const reportItem = button.closest('.report-item');
    const reportId = reportItem?.getAttribute('data-report-id');
    if (reportId) {
        cybercrimeManager.viewReportDetails(reportId);
    }
}

// Initialize cybercrime manager
let cybercrimeManager;

function initializeCybercrime() {
    cybercrimeManager = new CybercrimeManager();
    console.log('Cybercrime module initialized');
    
    // Set up form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', submitReport);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CybercrimeManager, initializeCybercrime };
}
