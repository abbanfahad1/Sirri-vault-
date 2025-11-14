// Legacy Mode & Emergency Access Module
class LegacyManager {
    constructor() {
        this.trustedContacts = [];
        this.emergencySettings = {};
        this.storageKey = 'sirrivault_legacy_data';
        this.init();
    }

    init() {
        this.loadLegacyData();
        this.setupEventListeners();
        this.updateContactsCount();
    }

    setupEventListeners() {
        // Contact method radio buttons
        const contactMethods = document.querySelectorAll('input[name="contactMethod"]');
        const contactValue = document.getElementById('contactValue');
        
        if (contactMethods && contactValue) {
            contactMethods.forEach(method => {
                method.addEventListener('change', function() {
                    contactValue.placeholder = this.value === 'phone' ? 'Phone number' : 'Email address';
                    contactValue.type = this.value === 'phone' ? 'tel' : 'email';
                });
        }

        // Set initial placeholder
        const initialMethod = document.querySelector('input[name="contactMethod"]:checked');
        if (initialMethod && contactValue) {
            contactValue.placeholder = initialMethod.value === 'phone' ? 'Phone number' : 'Email address';
            contactValue.type = initialMethod.value === 'phone' ? 'tel' : 'email';
        }

        // Recovery delay setting
        const recoveryDelay = document.getElementById('recoveryDelay');
        if (recoveryDelay) {
            recoveryDelay.addEventListener('change', (e) => {
                this.updateRecoveryDelay(e.target.value);
            });
        }

        // Law enforcement access toggle
        const lawEnforcementAccess = document.getElementById('lawEnforcementAccess');
        if (lawEnforcementAccess) {
            lawEnforcementAccess.addEventListener('change', (e) => {
                this.updateLawEnforcementAccess(e.target.checked);
            });
        }
    }

    loadLegacyData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.trustedContacts = data.trustedContacts || this.getDefaultContacts();
                this.emergencySettings = data.emergencySettings || this.getDefaultSettings();
            } else {
                this.trustedContacts = this.getDefaultContacts();
                this.emergencySettings = this.getDefaultSettings();
            }
            this.renderContacts();
        } catch (error) {
            console.error('Error loading legacy data:', error);
            this.trustedContacts = this.getDefaultContacts();
            this.emergencySettings = this.getDefaultSettings();
        }
    }

    getDefaultContacts() {
        return [
            {
                id: 'contact_1',
                name: 'John Doe',
                relationship: 'brother',
                contactMethod: 'phone',
                contactValue: '+234 801 234 5678',
                trustLevel: 'high',
                addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                verified: true
            },
            {
                id: 'contact_2',
                name: 'Jane Smith',
                relationship: 'spouse',
                contactMethod: 'email',
                contactValue: 'jane.smith@email.com',
                trustLevel: 'high',
                addedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
                verified: true
            }
        ];
    }

    getDefaultSettings() {
        return {
            recoveryDelay: 48, // hours
            lawEnforcementAccess: true,
            emergencyMode: false,
            lastUpdated: new Date().toISOString()
        };
    }

    saveLegacyData() {
        try {
            const data = {
                trustedContacts: this.trustedContacts,
                emergencySettings: this.emergencySettings,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving legacy data:', error);
            showNotification('Error saving legacy settings', 'error');
        }
    }

    setupEmergencyMode() {
        if (this.trustedContacts.length === 0) {
            showNotification('Please add at least one trusted contact before activating emergency mode', 'warning');
            return;
        }

        if (confirm('Are you sure you want to activate emergency mode? This will allow trusted contacts to access your vault after the specified delay period.')) {
            this.emergencySettings.emergencyMode = true;
            this.emergencySettings.emergencyActivated = new Date().toISOString();
            this.saveLegacyData();
            this.updateEmergencyStatus();
            
            showNotification('⚡ Emergency mode activated! Trusted contacts will be notified.', 'success');
            
            // Notify trusted contacts (simulated)
            this.notifyTrustedContacts();
        }
    }

    notifyTrustedContacts() {
        this.trustedContacts.forEach(contact => {
            console.log(`Notifying ${contact.name} about emergency mode activation...`);
            // In real app, this would send email/SMS notifications
        });
    }

    updateEmergencyStatus() {
        const statusElement = document.querySelector('.emergency-status .status-value.inactive');
        if (statusElement && this.emergencySettings.emergencyMode) {
            statusElement.textContent = 'Active';
            statusElement.className = 'status-value active';
        }
    }

    addTrustedContact() {
        document.getElementById('addContactModal').style.display = 'flex';
    }

    saveNewContact(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const contactData = {
            id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: formData.get('name') || document.querySelector('#addContactForm input[type="text"]').value,
            relationship: formData.get('relationship') || document.querySelector('#addContactForm select').value,
            contactMethod: formData.get('contactMethod') || 'phone',
            contactValue: document.getElementById('contactValue').value,
            trustLevel: formData.get('trustLevel') || 'medium',
            addedDate: new Date().toISOString(),
            verified: false
        };

        if (!contactData.name || !contactData.contactValue) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.trustedContacts.push(contactData);
        this.saveLegacyData();
        this.renderContacts();
        this.updateContactsCount();
        
        closeModal('addContactModal');
        showNotification(`Trusted contact "${contactData.name}" added successfully!`, 'success');
        
        event.target.reset();
    }

    renderContacts() {
        const contactsList = document.getElementById('contactsList');
        if (!contactsList) return;

        contactsList.innerHTML = this.trustedContacts.map(contact => this.createContactCardHTML(contact)).join('');
    }

    createContactCardHTML(contact) {
        const relationship = contact.relationship.charAt(0).toUpperCase() + contact.relationship.slice(1);
        const contactInfo = contact.contactMethod === 'phone' ? 
            `📞 ${contact.contactValue}` : 
            `📧 ${contact.contactValue}`;

        return `
            <div class="contact-card" data-contact-id="${contact.id}">
                <div class="contact-avatar">${contact.name.charAt(0)}</div>
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <p>${relationship} • ${contactInfo}</p>
                    <div class="contact-trust">
                        Trust Level: <span class="trust-${contact.trustLevel}">
                        ${contact.trustLevel.charAt(0).toUpperCase() + contact.trustLevel.slice(1)}</span>
                        ${contact.verified ? ' • ✅ Verified' : ' • ⏳ Pending'}
                    </div>
                </div>
                <div class="contact-actions">
                    <button class="btn-small" onclick="legacyManager.editContact('${contact.id}')">✏️ Edit</button>
                    <button class="btn-small danger" onclick="legacyManager.removeContact('${contact.id}')">🗑️ Remove</button>
                </div>
            </div>
        `;
    }

    editContact(contactId) {
        const contact = this.trustedContacts.find(c => c.id === contactId);
        if (contact) {
            showNotification(`Editing contact: ${contact.name}`, 'info');
            // This would open an edit modal with pre-filled data
        }
    }

    removeContact(contactId) {
        const contact = this.trustedContacts.find(c => c.id === contactId);
        if (contact) {
            if (confirm(`Remove ${contact.name} from trusted contacts?`)) {
                this.trustedContacts = this.trustedContacts.filter(c => c.id !== contactId);
                this.saveLegacyData();
                this.renderContacts();
                this.updateContactsCount();
                showNotification('Contact removed from trusted contacts', 'warning');
            }
        }
    }

    updateContactsCount() {
        const countElement = document.getElementById('contactsCount');
        if (countElement) {
            countElement.textContent = this.trustedContacts.length;
        }
    }

    updateRecoveryDelay(hours) {
        this.emergencySettings.recoveryDelay = parseInt(hours);
        this.emergencySettings.lastUpdated = new Date().toISOString();
        this.saveLegacyData();
        
        showNotification(`Recovery delay updated to ${hours} hours`, 'success');
    }

    updateLawEnforcementAccess(enabled) {
        this.emergencySettings.lawEnforcementAccess = enabled;
        this.emergencySettings.lastUpdated = new Date().toISOString();
        this.saveLegacyData();
        
        showNotification(
            `Law enforcement access ${enabled ? 'enabled' : 'disabled'}`,
            enabled ? 'success' : 'warning'
        );
    }

    createDigitalWill() {
        if (this.trustedContacts.length === 0) {
            showNotification('Please add trusted contacts before creating a digital will', 'warning');
            return;
        }

        showNotification('Opening digital will creation wizard...', 'info');
        // This would open a digital will creation interface
    }

    getLegacyStats() {
        return {
            totalContacts: this.trustedContacts.length,
            verifiedContacts: this.trustedContacts.filter(c => c.verified).length,
            emergencyMode: this.emergencySettings.emergencyMode || false,
            recoveryDelay: this.emergencySettings.recoveryDelay || 48
        };
    }

    // Emergency access request simulation
    simulateEmergencyAccess(contactId) {
        const contact = this.trustedContacts.find(c => c.id === contactId);
        if (contact && this.emergencySettings.emergencyMode) {
            const activationTime = new Date(this.emergencySettings.emergencyActivated);
            const delayHours = this.emergencySettings.recoveryDelay;
            const accessTime = new Date(activationTime.getTime() + delayHours * 60 * 60 * 1000);
            
            if (new Date() >= accessTime) {
                showNotification(`Emergency access granted to ${contact.name}`, 'success');
                return true;
            } else {
                const remainingTime = accessTime - new Date();
                const remainingHours = Math.ceil(remainingTime / (60 * 60 * 1000));
                showNotification(`Emergency access available in ${remainingHours} hours`, 'info');
                return false;
            }
        }
        return false;
    }

    // Export legacy data (for backup)
    exportLegacyData() {
        const data = {
            trustedContacts: this.trustedContacts,
            emergencySettings: this.emergencySettings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sirrivault-legacy-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        showNotification('Legacy data exported successfully', 'success');
    }
}

// Global legacy functions
function setupEmergencyMode() {
    legacyManager.setupEmergencyMode();
}

function addTrustedContact() {
    legacyManager.addTrustedContact();
}

function saveNewContact(event) {
    legacyManager.saveNewContact(event);
}

function editContact(button) {
    const contactCard = button.closest('.contact-card');
    const contactId = contactCard?.getAttribute('data-contact-id');
    if (contactId) {
        legacyManager.editContact(contactId);
    }
}

function removeContact(button) {
    const contactCard = button.closest('.contact-card');
    const contactId = contactCard?.getAttribute('data-contact-id');
    if (contactId) {
        legacyManager.removeContact(contactId);
    }
}

function createDigitalWill() {
    legacyManager.createDigitalWill();
}

// Initialize legacy manager
let legacyManager;

function initializeLegacyMode() {
    legacyManager = new LegacyManager();
    console.log('Legacy mode module initialized');
    
    // Set up form submission
    const addContactForm = document.getElementById('addContactForm');
    if (addContactForm) {
        addContactForm.addEventListener('submit', saveNewContact);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LegacyManager, initializeLegacyMode };
}