// OTP Authenticator Module
class AuthenticatorManager {
    constructor() {
        this.accounts = [];
        this.otpInterval = null;
        this.timerInterval = null;
        this.storageKey = 'sirrivault_authenticator';
        this.init();
    }

    init() {
        this.loadAccounts();
        this.startOTPGenerator();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Contact method radio buttons
        const contactMethods = document.querySelectorAll('input[name="contactMethod"]');
        const contactValue = document.getElementById('contactValue');
        
        if (contactMethods && contactValue) {
            contactMethods.forEach(method => {
                method.addEventListener('change', function() {
                    contactValue.placeholder = this.value === 'phone' ? 'Phone number' : 'Email address';
                });
            });
        }
    }

    loadAccounts() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.accounts = stored ? JSON.parse(stored) : this.getDefaultAccounts();
            this.renderAccounts();
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.accounts = this.getDefaultAccounts();
        }
    }

    getDefaultAccounts() {
        return [
            {
                id: 'google_1',
                name: 'Google Account',
                email: 'user@gmail.com',
                secret: 'JBSWY3DPEHPK3PXP',
                issuer: 'Google',
                icon: 'G',
                color: '#EA4335',
                lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
            },
            {
                id: 'asrat_1',
                name: 'AsratChain Wallet',
                email: 'wallet.asrat',
                secret: 'JBSWY3DPEHPK3PXP',
                issuer: 'AsratChain',
                icon: 'A',
                color: '#6A0DAD',
                lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            }
        ];
    }

    saveAccounts() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.accounts));
        } catch (error) {
            console.error('Error saving accounts:', error);
            showNotification('Error saving accounts', 'error');
        }
    }

    startOTPGenerator() {
        // Generate initial OTPs
        this.generateAllOTPs();
        
        // Update every 30 seconds
        this.otpInterval = setInterval(() => {
            this.generateAllOTPs();
        }, 30000);

        // Start timer countdown
        this.startTimer();
    }

    generateAllOTPs() {
        // Update current OTP display
        const currentOtpElement = document.getElementById('currentOtp');
        if (currentOtpElement) {
            currentOtpElement.textContent = this.formatOTP(this.generateOTP());
        }

        // Update account OTPs
        this.accounts.forEach(account => {
            account.currentOTP = this.generateOTP(account.secret);
            account.lastUpdated = new Date().toISOString();
        });

        this.renderAccounts();
    }

    generateOTP(secret = 'default') {
        // Simple OTP generation (in real app, use proper TOTP algorithm like otplib)
        // This is a mock implementation
        const time = Math.floor(Date.now() / 30000); // 30-second intervals
        const seed = secret + time.toString();
        
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return Math.abs(hash % 1000000).toString().padStart(6, '0');
    }

    formatOTP(otp) {
        return otp.substring(0, 3) + ' ' + otp.substring(3);
    }

    startTimer() {
        let timeLeft = 30;
        const timerElement = document.getElementById('timer');
        
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        this.timerInterval = setInterval(() => {
            timeLeft--;
            if (timerElement) {
                timerElement.textContent = timeLeft;
            }
            
            if (timeLeft <= 0) {
                timeLeft = 30;
            }
        }, 1000);
    }

    renderAccounts() {
        const accountsList = document.getElementById('accountsList');
        if (!accountsList) return;

        accountsList.innerHTML = this.accounts.map(account => this.createAccountCardHTML(account)).join('');
    }

    createAccountCardHTML(account) {
        const lastUsed = this.formatLastUsed(account.lastUsed);
        const otpDisplay = account.currentOTP || this.generateOTP(account.secret);

        return `
            <div class="account-card" data-account-id="${account.id}">
                <div class="account-avatar" style="background: ${account.color};">${account.icon}</div>
                <div class="account-info">
                    <h4>${account.name}</h4>
                    <p>${account.email} • Last used: ${lastUsed}</p>
                </div>
                <div class="account-otp">
                    <div class="otp-display" id="otp_${account.id}">${otpDisplay}</div>
                    <div class="otp-copy" onclick="authenticatorManager.copyOTP('${account.id}')">📋</div>
                </div>
            </div>
        `;
    }

    formatLastUsed(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    }

    addAccount(accountData) {
        const newAccount = {
            id: 'account_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: accountData.name,
            email: accountData.email || '',
            secret: accountData.secret || 'JBSWY3DPEHPK3PXP',
            issuer: accountData.issuer || 'Custom',
            icon: accountData.name.charAt(0).toUpperCase(),
            color: this.generateRandomColor(),
            lastUsed: new Date().toISOString(),
            currentOTP: this.generateOTP(accountData.secret)
        };

        this.accounts.push(newAccount);
        this.saveAccounts();
        this.renderAccounts();
        
        showNotification(`Account "${accountData.name}" added successfully!`, 'success');
        return newAccount;
    }

    generateRandomColor() {
        const colors = ['#EA4335', '#4285F4', '#34A853', '#FBBC05', '#6A0DAD', '#FF6B6B', '#4ECDC4', '#45B7D1'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    copyOTP(accountId) {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (account && account.currentOTP) {
            navigator.clipboard.writeText(account.currentOTP).then(() => {
                showNotification('OTP copied to clipboard!', 'success');
                
                // Visual feedback
                const otpElement = document.getElementById(`otp_${accountId}`);
                if (otpElement) {
                    otpElement.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        otpElement.style.transform = 'scale(1)';
                    }, 200);
                }
            }).catch(err => {
                console.error('Failed to copy OTP:', err);
                showNotification('Failed to copy OTP', 'error');
            });
        }
    }

    deleteAccount(accountId) {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (account) {
            if (confirm(`Are you sure you want to delete "${account.name}"?`)) {
                this.accounts = this.accounts.filter(acc => acc.id !== accountId);
                this.saveAccounts();
                this.renderAccounts();
                showNotification('Account deleted', 'warning');
            }
        }
    }

    getAccountStats() {
        return {
            total: this.accounts.length,
            recent: this.accounts.filter(acc => {
                const lastUsed = new Date(acc.lastUsed);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return lastUsed > oneDayAgo;
            }).length
        };
    }

    // Cleanup when module is destroyed
    destroy() {
        if (this.otpInterval) {
            clearInterval(this.otpInterval);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// Global authenticator functions
function showAddAccountModal() {
    document.getElementById('addAccountModal').style.display = 'flex';
}

function addNewAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const accountData = {
        name: formData.get('accountName') || document.querySelector('#addAccountForm input[type="text"]').value,
        secret: formData.get('secretKey') || document.querySelector('#addAccountForm input[type="text"]:nth-child(2)').value
    };

    if (!accountData.name || !accountData.secret) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    authenticatorManager.addAccount(accountData);
    closeModal('addAccountModal');
    event.target.reset();
}

function copyOtp(elementId) {
    const otpElement = document.getElementById(elementId);
    if (otpElement) {
        const otp = otpElement.textContent.replace(/\s/g, '');
        navigator.clipboard.writeText(otp).then(() => {
            showNotification('OTP copied to clipboard!', 'success');
        });
    }
}

// Initialize authenticator manager
let authenticatorManager;

function initializeAuthenticator() {
    authenticatorManager = new AuthenticatorManager();
    console.log('Authenticator module initialized');
    
    // Set up form submission
    const addAccountForm = document.getElementById('addAccountForm');
    if (addAccountForm) {
        addAccountForm.addEventListener('submit', addNewAccount);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthenticatorManager, initializeAuthenticator };
}
