// Utility Functions for SirriVault

// Security Utilities
class SecurityUtils {
    static simulateEncryption(data) {
        // In a real app, this would use Web Crypto API or similar
        // This is a mock implementation for demonstration
        const timestamp = Date.now();
        const randomSalt = Math.random().toString(36).substring(2, 15);
        return btoa(JSON.stringify(data) + '|' + timestamp + '|' + randomSalt) + '|encrypted';
    }

    static simulateDecryption(encryptedData) {
        try {
            const cleanData = encryptedData.split('|')[0];
            const decoded = atob(cleanData);
            const parts = decoded.split('|');
            return JSON.parse(parts[0]);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    static generateSecureKey(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let result = '';
        const cryptoArray = new Uint8Array(length);
        
        if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(cryptoArray);
            for (let i = 0; i < length; i++) {
                result += chars[cryptoArray[i] % chars.length];
            }
        } else {
            // Fallback for browsers without crypto support
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        return result;
    }

    static validatePassword(password) {
        const requirements = {
            minLength: 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumbers: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        return {
            isValid: password.length >= requirements.minLength &&
                    requirements.hasUpperCase &&
                    requirements.hasLowerCase &&
                    requirements.hasNumbers &&
                    requirements.hasSpecialChar,
            requirements: requirements
        };
    }
}

// Storage Utilities
class StorageUtils {
    static setItem(key, value) {
        try {
            localStorage.setItem(`sirrivault_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            showNotification('Storage error: Could not save data', 'error');
            return false;
        }
    }

    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`sirrivault_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(`sirrivault_${key}`);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static clearAll() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('sirrivault_'));
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static getStorageInfo() {
        const sirriKeys = Object.keys(localStorage).filter(key => key.startsWith('sirrivault_'));
        let totalSize = 0;

        sirriKeys.forEach(key => {
            totalSize += localStorage.getItem(key).length;
        });

        return {
            totalItems: sirriKeys.length,
            totalSize: totalSize,
            formattedSize: this.formatBytes(totalSize)
        };
    }

    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

// Date and Time Utilities
class DateUtils {
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static timeAgo(date) {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
        if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    }

    static isRecent(date, hours = 24) {
        const then = new Date(date);
        const now = new Date();
        const diffHours = (now - then) / (1000 * 60 * 60);
        return diffHours <= hours;
    }
}

// File Utilities
class FileUtils {
    static validateFile(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
            allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
        } = options;

        const errors = [];

        // Check file size
        if (file.size > maxSize) {
            errors.push(`File size must be less than ${this.formatBytes(maxSize)}`);
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            errors.push('File type not allowed');
        }

        // Check file extension
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
            errors.push('File extension not allowed');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const iconMap = {
            // Images
            'jpg': '📷', 'jpeg': '📷', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️', 'svg': '🖼️',
            // Documents
            'pdf': '📄', 'doc': '📄', 'docx': '📄', 'txt': '📄', 'rtf': '📄',
            // Spreadsheets
            'xls': '📊', 'xlsx': '📊', 'csv': '📊',
            // Presentations
            'ppt': '📽️', 'pptx': '📽️',
            // Archives
            'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦',
            // Audio
            'mp3': '🎵', 'wav': '🎵', 'm4a': '🎵', 'flac': '🎵',
            // Video
            'mp4': '🎥', 'avi': '🎥', 'mov': '🎥', 'wmv': '🎥',
            // Code
            'js': '📝', 'html': '📝', 'css': '📝', 'py': '📝', 'java': '📝'
        };

        return iconMap[extension] || '📁';
    }

    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    static readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// UI Utilities
class UIUtils {
    static showLoading(element, text = 'Loading...') {
        const originalContent = element.innerHTML;
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>${text}</span>
            </div>
        `;
        element.disabled = true;

        return {
            restore: () => {
                element.innerHTML = originalContent;
                element.disabled = false;
            }
        };
    }

    static createModal(title, content, buttons = []) {
        const modalId = 'modal_' + Date.now();
        const modalHTML = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="close-modal" onclick="document.getElementById('${modalId}').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${buttons.length > 0 ? `
                        <div class="modal-footer">
                            ${buttons.map(btn => `
                                <button class="${btn.class || 'btn-primary'}" 
                                        onclick="${btn.onclick}">
                                    ${btn.text}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        return modalId;
    }

    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (err) {
                    reject(err);
                }
                
                document.body.removeChild(textArea);
            }
        });
    }
}

// Validation Utilities
class ValidationUtils {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(phone);
    }

    static isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}

// Export all utilities for global access
window.SecurityUtils = SecurityUtils;
window.StorageUtils = StorageUtils;
window.DateUtils = DateUtils;
window.FileUtils = FileUtils;
window.UIUtils = UIUtils;
window.ValidationUtils = ValidationUtils;

console.log('Utility modules loaded successfully!');