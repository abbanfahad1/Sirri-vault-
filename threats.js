// Threat Detection Module
class ThreatDetectionManager {
    constructor() {
        this.scanInProgress = false;
        this.securityStatus = 'secure';
        this.monitoringData = {};
        this.alerts = [];
        this.storageKey = 'sirrivault_threat_alerts';
        this.init();
    }

    init() {
        this.loadAlerts();
        this.startRealTimeMonitoring();
        this.updateSecurityStatus();
    }

    startRealTimeMonitoring() {
        // Update monitoring data every 5 seconds
        setInterval(() => {
            this.updateMonitoringData();
        }, 5000);

        // Initial update
        this.updateMonitoringData();
    }

    updateMonitoringData() {
        this.monitoringData = {
            networkTraffic: (50 + Math.random() * 200).toFixed(0) + ' KB/s',
            fileSystem: (1200 + Math.floor(Math.random() * 100)).toLocaleString() + ' files',
            encryptionStatus: 'AES-256',
            aiStatus: 'Active',
            cpuUsage: (10 + Math.random() * 30).toFixed(1) + '%',
            memoryUsage: (40 + Math.random() * 30).toFixed(1) + '%',
            lastUpdate: new Date().toLocaleTimeString()
        };

        this.renderMonitoringData();
    }

    renderMonitoringData() {
        const elements = {
            networkTraffic: document.getElementById('networkTraffic'),
            fileSystem: document.getElementById('fileSystem'),
            encryptionStatus: document.getElementById('encryptionStatus'),
            aiStatus: document.getElementById('aiStatus')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key] && this.monitoringData[key]) {
                elements[key].textContent = this.monitoringData[key];
            }
        });
    }

    runQuickScan() {
        if (this.scanInProgress) {
            showNotification('Scan already in progress', 'warning');
            return;
        }

        this.scanInProgress = true;
        this.updateSecurityStatus('scanning', '🔄 Scanning...', 'Running quick security scan');

        let progress = 0;
        const scanInterval = setInterval(() => {
            progress += 10;
            this.updateScanProgress(progress);
            
            if (progress >= 100) {
                clearInterval(scanInterval);
                this.completeScan(false);
            }
        }, 200);
    }

    runFullScan() {
        if (this.scanInProgress) {
            showNotification('Scan already in progress', 'warning');
            return;
        }

        this.scanInProgress = true;
        this.updateSecurityStatus('scanning', '🔄 Deep Scan...', 'Running comprehensive system scan');

        let progress = 0;
        const scanInterval = setInterval(() => {
            progress += 4;
            this.updateScanProgress(progress);
            
            if (progress >= 100) {
                clearInterval(scanInterval);
                this.completeScan(true);
            }
        }, 200);
    }

    updateScanProgress(progress) {
        const statusElement = document.getElementById('securityStatus');
        const descElement = document.getElementById('statusDescription');
        
        if (descElement) {
            descElement.textContent = `Scanning... ${progress}% complete`;
        }

        // Visual progress indication
        if (statusElement) {
            statusElement.style.background = `
                linear-gradient(90deg, 
                var(--emerald) 0%, 
                var(--emerald) ${progress}%, 
                var(--cyber-sapphire) ${progress}%, 
                var(--cyber-sapphire) 100%)
            `;
        }
    }

    completeScan(isFullScan = false) {
        this.scanInProgress = false;
        
        const scannedFiles = isFullScan ? 
            1250 + Math.floor(Math.random() * 500) : 
            250 + Math.floor(Math.random() * 200);
        
        const threatsFound = Math.random() > 0.9 ? Math.floor(Math.random() * 3) + 1 : 0;
        const scanDuration = isFullScan ? '45s' : '12s';

        // Update analysis results
        this.updateAnalysisResults(scannedFiles, threatsFound, scanDuration);
        
        if (threatsFound > 0) {
            this.updateSecurityStatus('warning', '⚠️ Threats Detected', `${threatsFound} potential threat(s) found`);
            this.addAlert('Threat Detected', `${threatsFound} potential security threats detected during scan`, 'danger');
            showNotification(`Security threats detected! ${threatsFound} potential issue(s) found.`, 'warning');
        } else {
            this.updateSecurityStatus('safe', '✅ All Clear', 'No security threats detected');
            showNotification('Security scan completed successfully! No threats found.', 'success');
        }

        // Update last scan time
        document.getElementById('lastScanTime').textContent = new Date().toLocaleString();
        
        // Show analysis results
        document.getElementById('threatAnalysis').style.display = 'block';
    }

    updateAnalysisResults(scannedFiles, threatsFound, scanDuration) {
        const elements = {
            scannedFiles: document.getElementById('scannedFiles'),
            threatsFound: document.getElementById('threatsFound'),
            scanDuration: document.getElementById('scanDuration')
        };

        if (elements.scannedFiles) elements.scannedFiles.textContent = scannedFiles.toLocaleString();
        if (elements.threatsFound) {
            elements.threatsFound.textContent = threatsFound;
            elements.threatsFound.className = threatsFound > 0 ? 'detail-value danger' : 'detail-value safe';
        }
        if (elements.scanDuration) elements.scanDuration.textContent = scanDuration;
    }

    updateSecurityStatus(status = 'secure', title = 'System Secure', description = 'All systems operating normally') {
        this.securityStatus = status;
        
        const statusElement = document.getElementById('securityStatus');
        const titleElement = document.getElementById('statusTitle');
        const descElement = document.getElementById('statusDescription');

        if (statusElement) {
            // Remove previous status classes
            statusElement.className = 'security-status';
            // Add new status class
            statusElement.classList.add(status);
        }

        if (titleElement) titleElement.textContent = title;
        if (descElement) descElement.textContent = description;
    }

    addAlert(title, message, type = 'info') {
        const alert = {
            id: 'alert_' + Date.now(),
            title: title,
            message: message,
            type: type,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.alerts.unshift(alert);
        this.saveAlerts();
        this.renderAlerts();

        // Show notification for high priority alerts
        if (type === 'danger') {
            showNotification(`🚨 ${title}: ${message}`, 'error');
        }
    }

    loadAlerts() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.alerts = stored ? JSON.parse(stored) : this.getSampleAlerts();
            this.renderAlerts();
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.alerts = this.getSampleAlerts();
        }
    }

    getSampleAlerts() {
        return [
            {
                id: 'alert_1',
                title: 'System Update Available',
                message: 'New security patches ready for installation',
                type: 'info',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: true
            },
            {
                id: 'alert_2',
                title: 'Unusual Login Attempt',
                message: 'Failed login from unknown IP address',
                type: 'warning',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                read: true
            }
        ];
    }

    saveAlerts() {
        try {
            // Keep only last 50 alerts
            const alertsToSave = this.alerts.slice(0, 50);
            localStorage.setItem(this.storageKey, JSON.stringify(alertsToSave));
        } catch (error) {
            console.error('Error saving alerts:', error);
        }
    }

    renderAlerts() {
        const alertsList = document.querySelector('.alerts-list');
        if (!alertsList) return;

        // Show only unread and recent alerts
        const recentAlerts = this.alerts.slice(0, 10);
        
        alertsList.innerHTML = recentAlerts.map(alert => this.createAlertHTML(alert)).join('');
    }

    createAlertHTML(alert) {
        const timeAgo = this.formatTimeAgo(alert.timestamp);
        
        return `
            <div class="alert-item ${alert.type}" data-alert-id="${alert.id}">
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <span class="alert-time">${timeAgo}</span>
                </div>
                ${!alert.read ? '<div class="alert-badge">NEW</div>' : ''}
            </div>
        `;
    }

    getAlertIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'warning': '⚠️',
            'danger': '🚨',
            'success': '✅'
        };
        return icons[type] || 'ℹ️';
    }

    formatTimeAgo(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return '1 day ago';
        return `${diffDays} days ago`;
    }

    markAlertAsRead(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.read = true;
            this.saveAlerts();
            this.renderAlerts();
        }
    }

    clearAllAlerts() {
        if (this.alerts.length > 0) {
            this.alerts = [];
            this.saveAlerts();
            this.renderAlerts();
            showNotification('All alerts cleared', 'success');
        }
    }

    getSecurityStats() {
        return {
            status: this.securityStatus,
            totalScans: this.alerts.filter(a => a.title.includes('Scan')).length,
            threatsBlocked: this.alerts.filter(a => a.type === 'danger').length,
            lastThreat: this.alerts.find(a => a.type === 'danger')?.timestamp || 'Never'
        };
    }

    // Simulate threat detection (for demo purposes)
    simulateThreatDetection() {
        const threats = [
            { type: 'phishing', probability: 0.1 },
            { type: 'malware', probability: 0.05 },
            { type: 'unauthorized_access', probability: 0.02 }
        ];

        threats.forEach(threat => {
            if (Math.random() < threat.probability) {
                this.addAlert(
                    `Potential ${threat.type.replace('_', ' ')} detected`,
                    `AI system detected suspicious activity matching ${threat.type} patterns`,
                    'danger'
                );
            }
        });
    }

    viewThreatHistory() {
        showNotification('Opening threat history dashboard...', 'info');
        // This would open a detailed threat history view
    }
}

// Global threat detection functions
function runQuickScan() {
    threatManager.runQuickScan();
}

function runFullScan() {
    threatManager.runFullScan();
}

function viewThreatHistory() {
    threatManager.viewThreatHistory();
}

// Initialize threat manager
let threatManager;

function initializeThreatDetection() {
    threatManager = new ThreatDetectionManager();
    console.log('Threat detection module initialized');

    // Simulate occasional threat detection
    setInterval(() => {
        threatManager.simulateThreatDetection();
    }, 30000); // Check every 30 seconds
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThreatDetectionManager, initializeThreatDetection };
}