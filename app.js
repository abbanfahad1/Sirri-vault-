// Main SirriVault Application JavaScript
class SirriVaultApp {
    constructor() {
        this.currentTab = 'vault';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        this.initializeModules();
        console.log('SirriVault initialized successfully! 🔒');
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-tab')) {
                const tab = e.target.closest('.nav-tab');
                const tabName = tab.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.switchTab(tabName);
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all buttons
        document.querySelectorAll('.nav-tab').forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabName;
            
            // Initialize tab-specific functionality
            this.initializeTab(tabName);
        }
        
        // Activate clicked button
        event.currentTarget.classList.add('active');
    }

    initializeTab(tabName) {
        switch(tabName) {
            case 'authenticator':
                if (typeof initializeAuthenticator === 'function') {
                    initializeAuthenticator();
                }
                break;
            case 'threats':
                if (typeof initializeThreatDetection === 'function') {
                    initializeThreatDetection();
                }
                break;
            case 'legacy':
                if (typeof initializeLegacyMode === 'function') {
                    initializeLegacyMode();
                }
                break;
        }
    }

    initializeModules() {
        // Initialize all modules that are available
        const modules = [
            'initializeVault',
            'initializeAuthenticator', 
            'initializeCybercrime',
            'initializeThreatDetection',
            'initializeLegacyMode'
        ];

        modules.forEach(module => {
            if (typeof window[module] === 'function') {
                window[module]();
            }
        });
    }

    loadUserPreferences() {
        // Load theme preference
        const theme = localStorage.getItem('sirrivault_theme') || 'dark';
        this.applyTheme(theme);

        // Load language preference
        const language = localStorage.getItem('sirrivault_language') || 'en';
        this.applyLanguage(language);

        // Load other user preferences
        const preferences = JSON.parse(localStorage.getItem('sirrivault_preferences') || '{}');
        this.applyPreferences(preferences);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('sirrivault_theme', theme);
    }

    applyLanguage(lang) {
        // This would integrate with a proper i18n system
        console.log('Applying language:', lang);
        localStorage.setItem('sirrivault_language', lang);
    }

    applyPreferences(preferences) {
        // Apply various user preferences
        Object.keys(preferences).forEach(key => {
            // Implementation for each preference
        });
    }

    // Modal management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    // Security functions
    checkSecurityStatus() {
        // This would integrate with actual security checks
        return {
            status: 'secure',
            lastScan: new Date(),
            threats: 0
        };
    }

    // Encryption simulation
    simulateEncryption(data) {
        // In a real app, this would use proper encryption
        return btoa(JSON.stringify(data)) + '|encrypted';
    }

    simulateDecryption(encryptedData) {
        try {
            const cleanData = encryptedData.split('|')[0];
            return JSON.parse(atob(cleanData));
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
}

// Global utility functions
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);

    return notification;
}

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize the app when DOM is loaded
let sirriVaultApp;

document.addEventListener('DOMContentLoaded', function() {
    sirriVaultApp = new SirriVaultApp();
    
    // Global close modal function
    window.closeModal = function(modalId) {
        sirriVaultApp.closeModal(modalId);
    };

    // Global show notification function
    window.showNotification = showNotification;

    // Global format functions
    window.formatFileSize = formatFileSize;
    window.formatDate = formatDate;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SirriVaultApp, showNotification, formatFileSize, formatDate };
}
