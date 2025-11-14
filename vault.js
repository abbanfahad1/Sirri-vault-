
// Vault Module - Secure File Storage
class VaultManager {
    constructor() {
        this.storageKey = 'sirrivault_files';
        this.encryptedFiles = [];
        this.init();
    }

    init() {
        this.loadFilesFromStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // File upload handling
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files));
        }
    }

    loadFilesFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.encryptedFiles = stored ? JSON.parse(stored) : [];
            this.renderFiles();
        } catch (error) {
            console.error('Error loading files from storage:', error);
            this.encryptedFiles = [];
        }
    }

    saveFilesToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.encryptedFiles));
        } catch (error) {
            console.error('Error saving files to storage:', error);
            showNotification('Error saving files to storage', 'error');
        }
    }

    async addFile(file, type = 'document') {
        return new Promise((resolve) => {
            // Simulate encryption process
            setTimeout(() => {
                const fileData = {
                    id: this.generateFileId(),
                    name: file.name,
                    type: type,
                    size: file.size,
                    encryptedData: this.simulateEncryption(file),
                    uploadDate: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                };

                this.encryptedFiles.unshift(fileData);
                this.saveFilesToStorage();
                this.renderFiles();

                showNotification(`File "${file.name}" encrypted and stored securely! 🔒`, 'success');
                resolve(fileData);
            }, 1000);
        });
    }

    simulateEncryption(file) {
        // In a real app, this would use proper encryption like AES-256
        return btoa(file.name + '|' + file.size + '|' + Date.now()) + '|encrypted';
    }

    simulateDecryption(encryptedData) {
        try {
            const cleanData = encryptedData.split('|')[0];
            return atob(cleanData);
        } catch (error) {
            return 'Decrypted file data';
        }
    }

    generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    renderFiles() {
        const filesGrid = document.getElementById('filesGrid');
        if (!filesGrid) return;

        if (this.encryptedFiles.length === 0) {
            filesGrid.innerHTML = this.getEmptyStateHTML();
            return;
        }

        filesGrid.innerHTML = this.encryptedFiles.map(file => this.createFileCardHTML(file)).join('');
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🔒</div>
                <h3>Your Vault is Empty</h3>
                <p>Add files to secure them with zero-knowledge encryption</p>
                <button class="btn-primary" onclick="showAddFileModal()">Add Your First File</button>
            </div>
        `;
    }

    createFileCardHTML(file) {
        const icon = this.getFileIcon(file.type);
        const size = this.formatFileSize(file.size);
        const uploadDate = this.formatDate(file.uploadDate);

        return `
            <div class="file-card" data-file-id="${file.id}">
                <div class="file-icon">${icon}</div>
                <div class="file-info">
                    <h4>${file.name}</h4>
                    <p>${size} • Encrypted</p>
                    <small>Uploaded: ${uploadDate}</small>
                </div>
                <div class="file-actions">
                    <button class="btn-small" onclick="vaultManager.viewFile('${file.id}')">👁️ View</button>
                    <button class="btn-small" onclick="vaultManager.downloadFile('${file.id}')">📥 Download</button>
                    <button class="btn-small danger" onclick="vaultManager.deleteFile('${file.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    getFileIcon(fileType) {
        const icons = {
            'photo': '📷',
            'document': '📄',
            'video': '🎥',
            'audio': '🎤',
            'default': '📁'
        };
        return icons[fileType] || icons.default;
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    viewFile(fileId) {
        const file = this.encryptedFiles.find(f => f.id === fileId);
        if (file) {
            showNotification(`Opening encrypted file: ${file.name}`, 'info');
            // In real app, this would decrypt and display the file
            file.lastAccessed = new Date().toISOString();
            this.saveFilesToStorage();
        }
    }

    downloadFile(fileId) {
        const file = this.encryptedFiles.find(f => f.id === fileId);
        if (file) {
            showNotification(`Downloading encrypted file: ${file.name}`, 'info');
            // In real app, this would create a download link for the decrypted file
            file.lastAccessed = new Date().toISOString();
            this.saveFilesToStorage();
        }
    }

    deleteFile(fileId) {
        const file = this.encryptedFiles.find(f => f.id === fileId);
        if (file) {
            if (confirm(`Are you sure you want to permanently delete "${file.name}"? This action cannot be undone.`)) {
                this.encryptedFiles = this.encryptedFiles.filter(f => f.id !== fileId);
                this.saveFilesToStorage();
                this.renderFiles();
                showNotification('File permanently deleted', 'warning');
            }
        }
    }

    getStorageUsage() {
        const totalSize = this.encryptedFiles.reduce((sum, file) => sum + file.size, 0);
        return {
            used: totalSize,
            files: this.encryptedFiles.length,
            formatted: this.formatFileSize(totalSize)
        };
    }

    searchFiles(query) {
        if (!query) {
            this.renderFiles();
            return;
        }

        const filteredFiles = this.encryptedFiles.filter(file => 
            file.name.toLowerCase().includes(query.toLowerCase()) ||
            file.type.toLowerCase().includes(query.toLowerCase())
        );

        const filesGrid = document.getElementById('filesGrid');
        if (filesGrid) {
            filesGrid.innerHTML = filteredFiles.length > 0 
                ? filteredFiles.map(file => this.createFileCardHTML(file)).join('')
                : `<div class="empty-state"><p>No files found matching "${query}"</p></div>`;
        }
    }

    clearAllFiles() {
        if (this.encryptedFiles.length === 0) {
            showNotification('Vault is already empty', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${this.encryptedFiles.length} files? This action cannot be undone.`)) {
            this.encryptedFiles = [];
            this.saveFilesToStorage();
            this.renderFiles();
            showNotification('All files deleted from vault', 'warning');
        }
    }
}

// Global vault functions
function addFile(type) {
    const fileTypes = {
        'photo': {icon: '📷', name: 'encrypted_photo.jpg', size: (1 + Math.random() * 4).toFixed(1) * 1024 * 1024},
        'document': {icon: '📄', name: 'secure_document.pdf', size: (0.5 + Math.random() * 3).toFixed(1) * 1024 * 1024},
        'video': {icon: '🎥', name: 'protected_video.mp4', size: (2 + Math.random() * 5).toFixed(1) * 1024 * 1024},
        'audio': {icon: '🎤', name: 'voice_note.m4a', size: (0.3 + Math.random() * 2).toFixed(1) * 1024 * 1024}
    };
    
    const file = fileTypes[type];
    if (!file) return;

    // Create a mock file object
    const mockFile = {
        name: file.name,
        size: file.size,
        type: 'image/jpeg' // default type
    };

    vaultManager.addFile(mockFile, type);
}

function showAddFileModal() {
    // This would show a modal for actual file upload
    showNotification('File upload modal would open here', 'info');
}

function triggerFileUpload(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = getAcceptAttribute(type);
    input.onchange = (e) => handleFileUpload(e.target.files, type);
    input.click();
}

function getAcceptAttribute(type) {
    const acceptTypes = {
        'photo': 'image/*',
        'document': '.pdf,.doc,.docx,.txt',
        'video': 'video/*',
        'audio': 'audio/*'
    };
    return acceptTypes[type] || '*/*';
}

function handleFileUpload(files, type = 'document') {
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            vaultManager.addFile(file, type);
        });
    }
}

function startAudioRecording() {
    showNotification('Audio recording feature would start here', 'info');
    // Implementation for audio recording would go here
}

// Initialize vault manager
let vaultManager;

function initializeVault() {
    vaultManager = new VaultManager();
    console.log('Vault module initialized');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VaultManager, initializeVault };
}