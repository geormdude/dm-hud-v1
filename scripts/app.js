/**
 * DM HUD - Main Application Module
 * 
 * Handles core application functionality including:
 * - Tab navigation
 * - Focus mode
 * - Settings management
 * - UI state synchronization
 * - Keyboard shortcuts
 * - Application initialization
 * 
 * Uses the revealing module pattern for encapsulation.
 */

const App = (function() {
    // ============================
    // PRIVATE VARIABLES
    // ============================
    
    // DOM element references
    let _elements = {
        app: null,
        tabButtons: null,
        tabContents: null,
        focusModeToggle: null,
        saveButton: null,
        settingsForm: null,
        exportButton: null,
        importButton: null,
        importInput: null,
        themeToggle: null,
        fontSizeControls: null
    };
    
    // Keyboard shortcut mappings
    const _keyboardShortcuts = {
        's': { ctrl: true, action: _manualSave },
        'f': { ctrl: true, action: _toggleFocusMode },
        '1': { ctrl: true, action: () => _switchTab('story') },
        '2': { ctrl: true, action: () => _switchTab('characters') },
        '3': { ctrl: true, action: () => _switchTab('combat') },
        '4': { ctrl: true, action: () => _switchTab('settings') },
        'e': { ctrl: true, shift: true, action: _exportData },
        'i': { ctrl: true, shift: true, action: _promptImportData }
    };
    
    // ============================
    // DOM MANIPULATION
    // ============================
    
    /**
     * Caches DOM elements for later use
     */
    function _cacheDOM() {
        _elements.app = document.getElementById('app');
        _elements.tabButtons = document.querySelectorAll('.tab-button');
        _elements.tabContents = document.querySelectorAll('.tab-content');
        
        // Create focus mode toggle if it doesn't exist
        if (!document.getElementById('focus-mode-toggle')) {
            const focusToggle = document.createElement('button');
            focusToggle.id = 'focus-mode-toggle';
            focusToggle.innerHTML = '<span class="sr-only">Toggle Focus Mode</span>';
            focusToggle.setAttribute('aria-label', 'Toggle Focus Mode');
            focusToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
            document.body.appendChild(focusToggle);
        }
        
        _elements.focusModeToggle = document.getElementById('focus-mode-toggle');
        
        // Settings elements
        _elements.saveButton = document.getElementById('save-button') || null;
        _elements.settingsForm = document.getElementById('settings-form') || null;
        _elements.exportButton = document.getElementById('export-button') || null;
        _elements.importButton = document.getElementById('import-button') || null;
        _elements.importInput = document.getElementById('import-input') || null;
        _elements.themeToggle = document.getElementById('theme-toggle') || null;
        _elements.fontSizeControls = document.querySelectorAll('.font-size-control') || null;
    }
    
    /**
     * Updates the UI based on the current state
     */
    function _syncUIWithState() {
        const state = StateManager.getState();
        
        // Set active tab
        _switchTab(state.ui.activeTab, true);
        
        // Set focus mode
        if (state.ui.focusMode) {
            document.body.classList.add('focus-mode');
        } else {
            document.body.classList.remove('focus-mode');
        }
        
        // Set theme
        document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
        
        // Update last saved indicator if it exists
        const lastSavedEl = document.getElementById('last-saved');
        if (lastSavedEl && state.ui.lastSaved) {
            const lastSaved = new Date(state.ui.lastSaved);
            lastSavedEl.textContent = `Last saved: ${lastSaved.toLocaleTimeString()}`;
        }
    }
    
    // ============================
    // TAB NAVIGATION
    // ============================
    
    /**
     * Initializes tab navigation
     */
    function _initTabNavigation() {
        // Add click event listeners to tab buttons
        _elements.tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                _switchTab(tabName);
            });
        });
        
        // Set initial active tab from state
        const activeTab = StateManager.getState('ui.activeTab');
        _switchTab(activeTab, true);
    }
    
    /**
     * Switches to the specified tab
     * @param {String} tabName - Name of the tab to switch to
     * @param {Boolean} [silent=false] - If true, doesn't update state
     */
    function _switchTab(tabName, silent = false) {
        // Update tab buttons
        _elements.tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update tab content sections
        _elements.tabContents.forEach(content => {
            const sectionId = content.id;
            if (sectionId === `${tabName}-section`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Update state unless silent
        if (!silent) {
            StateManager.setState('ui.activeTab', tabName);
        }
        
        // Trigger a resize event to ensure panels adjust
        window.dispatchEvent(new Event('resize'));
    }
    
    // ============================
    // FOCUS MODE
    // ============================
    
    /**
     * Initializes focus mode toggle
     */
    function _initFocusMode() {
        // Add click event listener to focus mode toggle
        _elements.focusModeToggle.addEventListener('click', _toggleFocusMode);
        
        // Set initial focus mode from state
        const focusMode = StateManager.getState('ui.focusMode');
        if (focusMode) {
            document.body.classList.add('focus-mode');
        }
        
        // Add click listeners to panels for focus panel selection
        document.querySelectorAll('.panel').forEach(panel => {
            panel.addEventListener('click', (e) => {
                if (document.body.classList.contains('focus-mode')) {
                    // Remove focus-panel class from all panels
                    document.querySelectorAll('.panel').forEach(p => {
                        p.classList.remove('focus-panel');
                    });
                    
                    // Add focus-panel class to clicked panel
                    panel.classList.add('focus-panel');
                }
            });
        });
    }
    
    /**
     * Toggles focus mode on/off
     */
    function _toggleFocusMode() {
        const currentFocusMode = StateManager.getState('ui.focusMode');
        const newFocusMode = !currentFocusMode;
        
        // Update state
        StateManager.setState('ui.focusMode', newFocusMode);
        
        // Update UI
        if (newFocusMode) {
            document.body.classList.add('focus-mode');
        } else {
            document.body.classList.remove('focus-mode');
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('focus-panel');
            });
        }
    }
    
    // ============================
    // SETTINGS MANAGEMENT
    // ============================
    
    /**
     * Initializes settings controls
     */
    function _initSettings() {
        // Manual save button
        if (_elements.saveButton) {
            _elements.saveButton.addEventListener('click', _manualSave);
        }
        
        // Theme toggle
        if (_elements.themeToggle) {
            _elements.themeToggle.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'light' : 'dark';
                _setTheme(theme);
            });
            
            // Set initial theme toggle state
            const currentTheme = StateManager.getState('settings.theme') || 'dark';
            _elements.themeToggle.checked = currentTheme === 'light';
        }
        
        // Font size controls
        if (_elements.fontSizeControls && _elements.fontSizeControls.length) {
            _elements.fontSizeControls.forEach(control => {
                control.addEventListener('click', (e) => {
                    const action = e.currentTarget.getAttribute('data-action');
                    _adjustFontSize(action);
                });
            });
        }
        
        // Export button
        if (_elements.exportButton) {
            _elements.exportButton.addEventListener('click', _exportData);
        }
        
        // Import button
        if (_elements.importButton && _elements.importInput) {
            _elements.importButton.addEventListener('click', _promptImportData);
            _elements.importInput.addEventListener('change', _importData);
        }
        
        // Settings form
        if (_elements.settingsForm) {
            _elements.settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                _saveSettings();
            });
            
            // Populate form with current settings
            _populateSettingsForm();
        }
    }
    
    /**
     * Saves the current state manually
     */
    function _manualSave() {
        StateManager.save();
        
        // Show save confirmation
        _showNotification('Game state saved successfully', 'success');
    }
    
    /**
     * Sets the application theme
     * @param {String} theme - Theme name ('dark' or 'light')
     */
    function _setTheme(theme) {
        // Update state
        StateManager.setState('settings.theme', theme);
        
        // Update UI
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    /**
     * Adjusts the base font size
     * @param {String} action - 'increase', 'decrease', or 'reset'
     */
    function _adjustFontSize(action) {
        // Get current font size
        const html = document.documentElement;
        let currentSize = parseFloat(getComputedStyle(html).fontSize);
        let newSize;
        
        // Adjust size based on action
        switch (action) {
            case 'increase':
                newSize = Math.min(currentSize + 2, 24); // Max 24px
                break;
            case 'decrease':
                newSize = Math.max(currentSize - 2, 12); // Min 12px
                break;
            case 'reset':
                newSize = 16; // Default 16px
                break;
            default:
                return;
        }
        
        // Update font size
        html.style.fontSize = `${newSize}px`;
        
        // Save to state
        StateManager.setState('settings.fontSize', newSize);
    }
    
    /**
     * Exports application data
     */
    function _exportData() {
        // Get state as JSON
        const stateJson = StateManager.export();
        
        // Create download link
        const blob = new Blob([stateJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Set filename with date
        const date = new Date().toISOString().split('T')[0];
        const campaignName = StateManager.getState('story.campaign.name') || 'campaign';
        const safeCampaignName = campaignName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        
        a.href = url;
        a.download = `dmhud-${safeCampaignName}-${date}.json`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        _showNotification('Campaign data exported successfully', 'success');
    }
    
    /**
     * Prompts for file selection to import data
     */
    function _promptImportData() {
        if (_elements.importInput) {
            _elements.importInput.click();
        }
    }
    
    /**
     * Imports application data from selected file
     */
    function _importData(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const jsonData = event.target.result;
                const success = StateManager.import(jsonData);
                
                if (success) {
                    _showNotification('Campaign data imported successfully', 'success');
                    _syncUIWithState();
                } else {
                    _showNotification('Failed to import campaign data', 'error');
                }
            } catch (error) {
                console.error('Import error:', error);
                _showNotification('Invalid campaign data file', 'error');
            }
            
            // Reset file input
            e.target.value = '';
        };
        
        reader.onerror = () => {
            _showNotification('Error reading file', 'error');
            // Reset file input
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    /**
     * Populates settings form with current values
     */
    function _populateSettingsForm() {
        if (!_elements.settingsForm) return;
        
        const settings = StateManager.getState('settings');
        
        // Populate each input with corresponding setting
        Object.entries(settings).forEach(([key, value]) => {
            const input = _elements.settingsForm.querySelector(`[name="${key}"]`);
            if (!input) return;
            
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        });
    }
    
    /**
     * Saves settings from form
     */
    function _saveSettings() {
        if (!_elements.settingsForm) return;
        
        const formData = new FormData(_elements.settingsForm);
        const settings = {};
        
        // Process form data
        for (const [key, value] of formData.entries()) {
            const input = _elements.settingsForm.querySelector(`[name="${key}"]`);
            
            if (input.type === 'checkbox') {
                settings[key] = input.checked;
            } else if (input.type === 'number') {
                settings[key] = Number(value);
            } else {
                settings[key] = value;
            }
        }
        
        // Update state
        StateManager.setState('settings', settings);
        
        _showNotification('Settings saved', 'success');
    }
    
    // ============================
    // EVENT HANDLERS
    // ============================
    
    /**
     * Initializes keyboard shortcuts
     */
    function _initKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ignore if in input, textarea, or select
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }
            
            const key = e.key.toLowerCase();
            const shortcut = _keyboardShortcuts[key];
            
            if (shortcut) {
                // Check if required modifier keys are pressed
                const ctrlPressed = e.ctrlKey || e.metaKey;
                const shiftPressed = e.shiftKey;
                
                if (
                    (shortcut.ctrl && !ctrlPressed) ||
                    (shortcut.shift && !shiftPressed) ||
                    (!shortcut.ctrl && ctrlPressed) ||
                    (!shortcut.shift && shiftPressed)
                ) {
                    return;
                }
                
                // Prevent default browser action
                e.preventDefault();
                
                // Execute shortcut action
                shortcut.action();
            }
        });
    }
    
    /**
     * Initializes window event handlers
     */
    function _initWindowEvents() {
        // Handle beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            // Check if there are unsaved changes
            const lastSaved = StateManager.getState('ui.lastSaved');
            if (!lastSaved) return;
            
            const lastSavedTime = new Date(lastSaved).getTime();
            const currentTime = new Date().getTime();
            const timeSinceLastSave = currentTime - lastSavedTime;
            
            // If changes in the last minute, show warning
            if (timeSinceLastSave < 60000) {
                return;
            }
            
            // Standard message for unsaved changes
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        });
        
        // Handle visibility change to save when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                StateManager.save();
            }
        });
        
        // Handle state changes
        document.addEventListener('stateChanged', (e) => {
            // Update UI for specific state changes
            const path = e.detail.path;
            
            if (path === 'ui.activeTab') {
                _switchTab(e.detail.value, true);
            } else if (path === 'ui.focusMode') {
                if (e.detail.value) {
                    document.body.classList.add('focus-mode');
                } else {
                    document.body.classList.remove('focus-mode');
                }
            } else if (path === 'settings.theme') {
                document.documentElement.setAttribute('data-theme', e.detail.value);
            }
        });
    }
    
    // ============================
    // UTILITY FUNCTIONS
    // ============================
    
    /**
     * Shows a notification message
     * @param {String} message - Message to display
     * @param {String} [type='info'] - Notification type ('info', 'success', 'warning', 'error')
     * @param {Number} [duration=3000] - Duration in milliseconds
     */
    function _showNotification(message, type = 'info', duration = 3000) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification hidden';
            document.body.appendChild(notification);
        }
        
        // Set message and type
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => {
            notification.classList.remove('hidden');
        }, 10);
        
        // Hide after duration
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }
    
    // ============================
    // INITIALIZATION
    // ============================
    
    /**
     * Initializes the application
     */
    function init() {
        console.log('Initializing DM HUD application...');
        
        // Cache DOM elements
        _cacheDOM();
        
        // Initialize tab navigation
        _initTabNavigation();
        
        // Initialize focus mode
        _initFocusMode();
        
        // Initialize settings
        _initSettings();
        
        // Initialize keyboard shortcuts
        _initKeyboardShortcuts();
        
        // Initialize window events
        _initWindowEvents();
        
        // Sync UI with current state
        _syncUIWithState();
        
        console.log('DM HUD application initialized');
    }
    
    // Return public API
    return {
        init,
        showNotification: _showNotification
    };
})();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
}); 