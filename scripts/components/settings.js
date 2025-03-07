/**
 * Settings Component
 * 
 * Manages application settings including:
 * - Theme selection and application
 * - Font size adjustments
 * - Data import/export
 * - Settings reset functionality
 * - Local storage preferences
 * 
 * Contents:
 * 1. Private Variables & DOM Elements
 * 2. DOM Manipulation & Rendering
 * 3. Event Handlers
 * 4. Settings Management
 * 5. Data Management
 * 6. Helper Functions
 * 7. Initialization
 */

const Settings = (function() {
    // ============================
    // 1. PRIVATE VARIABLES & DOM ELEMENTS
    // ============================
    
    let _elements = {
        displaySettings: null,
        dataManagement: null,
        themeToggle: null,
        fontSizeControls: null,
        exportButton: null,
        importButton: null,
        importInput: null,
        resetButton: null,
        settingsForm: null
    };

    // Font size limits
    const MIN_FONT_SIZE = 12;
    const MAX_FONT_SIZE = 24;
    const DEFAULT_FONT_SIZE = 16;

    // ============================
    // 2. DOM MANIPULATION & RENDERING
    // ============================
    
    /**
     * Cache DOM elements for later use
     */
    function _cacheDOM() {
        _elements.displaySettings = document.getElementById('display-settings');
        _elements.dataManagement = document.getElementById('data-management');
        
        // Create settings form if it doesn't exist
        if (!document.getElementById('settings-form')) {
            _createSettingsForm();
        }
        
        _elements.settingsForm = document.getElementById('settings-form');
        _elements.themeToggle = document.getElementById('theme-toggle');
        _elements.fontSizeControls = document.querySelectorAll('.font-size-control');
        _elements.exportButton = document.getElementById('export-button');
        _elements.importButton = document.getElementById('import-button');
        _elements.importInput = document.getElementById('import-input');
        _elements.resetButton = document.getElementById('reset-button');
    }

    /**
     * Creates the settings form structure
     */
    function _createSettingsForm() {
        // Display Settings Panel
        const displaySettingsHTML = `
            <h2>Display Settings</h2>
            <form id="settings-form">
                <div class="setting-group">
                    <label for="theme-toggle">Theme</label>
                    <div class="theme-toggle-wrapper">
                        <input type="checkbox" id="theme-toggle" name="theme">
                        <span class="toggle-label">Dark</span>
                    </div>
                </div>
                
                <div class="setting-group">
                    <label>Font Size</label>
                    <div class="font-size-controls">
                        <button type="button" class="font-size-control" data-action="decrease" aria-label="Decrease font size">-</button>
                        <button type="button" class="font-size-control" data-action="reset" aria-label="Reset font size">Reset</button>
                        <button type="button" class="font-size-control" data-action="increase" aria-label="Increase font size">+</button>
                    </div>
                </div>

                <div class="setting-group">
                    <label for="autosave-interval">Autosave Interval (seconds)</label>
                    <input type="number" id="autosave-interval" name="autosaveInterval" min="30" max="300" step="30">
                </div>

                <div class="setting-group">
                    <label for="confirm-delete">
                        <input type="checkbox" id="confirm-delete" name="confirmBeforeDelete">
                        Confirm before delete
                    </label>
                </div>

                <div class="setting-group">
                    <label for="show-hidden">
                        <input type="checkbox" id="show-hidden" name="showHiddenInfo">
                        Show hidden information
                    </label>
                </div>

                <div class="setting-group">
                    <label for="dice-roller">
                        <input type="checkbox" id="dice-roller" name="diceRollerEnabled">
                        Enable dice roller
                    </label>
                </div>

                <div class="setting-group">
                    <label for="sound-effects">
                        <input type="checkbox" id="sound-effects" name="soundEffectsEnabled">
                        Enable sound effects
                    </label>
                </div>

                <div class="setting-group">
                    <label for="notifications">
                        <input type="checkbox" id="notifications" name="notificationsEnabled">
                        Enable notifications
                    </label>
                </div>
            </form>
        `;
        
        // Data Management Panel
        const dataManagementHTML = `
            <h2>Data Management</h2>
            <div class="data-controls">
                <button id="export-button" class="primary-button">Export Campaign Data</button>
                <div class="import-wrapper">
                    <button id="import-button" class="secondary-button">Import Campaign Data</button>
                    <input type="file" id="import-input" accept=".json" hidden>
                </div>
                <button id="reset-button" class="danger-button">Reset All Settings</button>
            </div>
        `;

        _elements.displaySettings.innerHTML = displaySettingsHTML;
        _elements.dataManagement.innerHTML = dataManagementHTML;
    }

    /**
     * Renders the settings UI with current values
     */
    function _render() {
        const settings = StateManager.getState('settings');
        const theme = StateManager.getState('ui.theme');
        
        // Update theme toggle
        _elements.themeToggle.checked = theme === 'light';
        _elements.themeToggle.nextElementSibling.textContent = theme === 'light' ? 'Light' : 'Dark';
        
        // Update other settings
        Object.entries(settings).forEach(([key, value]) => {
            const input = _elements.settingsForm.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
            }
        });
    }

    // ============================
    // 3. EVENT HANDLERS
    // ============================
    
    /**
     * Binds event listeners to DOM elements
     */
    function _bindEvents() {
        // Theme toggle
        _elements.themeToggle.addEventListener('change', _handleThemeToggle);
        
        // Font size controls
        _elements.fontSizeControls.forEach(control => {
            control.addEventListener('click', _handleFontSizeChange);
        });
        
        // Form changes
        _elements.settingsForm.addEventListener('change', _handleSettingChange);
        
        // Data management
        _elements.exportButton.addEventListener('click', _handleExport);
        _elements.importButton.addEventListener('click', () => _elements.importInput.click());
        _elements.importInput.addEventListener('change', _handleImport);
        _elements.resetButton.addEventListener('click', _handleReset);
        
        // Listen for state changes
        document.addEventListener('stateChanged', _handleStateChange);
    }

    /**
     * Handles theme toggle changes
     * @param {Event} e - Change event
     */
    function _handleThemeToggle(e) {
        const theme = e.target.checked ? 'light' : 'dark';
        _setTheme(theme);
    }

    /**
     * Handles font size control clicks
     * @param {Event} e - Click event
     */
    function _handleFontSizeChange(e) {
        const action = e.currentTarget.dataset.action;
        _adjustFontSize(action);
    }

    /**
     * Handles setting changes from the form
     * @param {Event} e - Change event
     */
    function _handleSettingChange(e) {
        const input = e.target;
        const key = input.name;
        let value = input.type === 'checkbox' ? input.checked : input.value;
        
        // Convert number inputs to numbers
        if (input.type === 'number') {
            value = Number(value);
        }
        
        StateManager.setState(`settings.${key}`, value);
    }

    /**
     * Handles state changes from StateManager
     * @param {CustomEvent} e - State change event
     */
    function _handleStateChange(e) {
        const { path } = e.detail;
        if (path.startsWith('settings.') || path === 'ui.theme') {
            _render();
        }
    }

    // ============================
    // 4. SETTINGS MANAGEMENT
    // ============================
    
    /**
     * Sets the application theme
     * @param {String} theme - Theme name ('dark' or 'light')
     */
    function _setTheme(theme) {
        StateManager.setState('ui.theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Adjusts the base font size
     * @param {String} action - 'increase', 'decrease', or 'reset'
     */
    function _adjustFontSize(action) {
        const html = document.documentElement;
        let currentSize = parseFloat(getComputedStyle(html).fontSize);
        let newSize;
        
        switch (action) {
            case 'increase':
                newSize = Math.min(currentSize + 2, MAX_FONT_SIZE);
                break;
            case 'decrease':
                newSize = Math.max(currentSize - 2, MIN_FONT_SIZE);
                break;
            case 'reset':
                newSize = DEFAULT_FONT_SIZE;
                break;
            default:
                return;
        }
        
        html.style.fontSize = `${newSize}px`;
        StateManager.setState('settings.fontSize', newSize);
    }

    // ============================
    // 5. DATA MANAGEMENT
    // ============================
    
    /**
     * Handles data export
     */
    function _handleExport() {
        const state = StateManager.getState();
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `dm-hud-campaign-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Handles data import
     * @param {Event} e - Change event from file input
     */
    function _handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const success = StateManager.import(event.target.result);
                if (success) {
                    _showNotification('Campaign data imported successfully', 'success');
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
            e.target.value = '';
        };
        
        reader.readAsText(file);
    }

    /**
     * Handles settings reset
     */
    function _handleReset() {
        if (confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
            StateManager.resetState();
            _showNotification('Settings reset to defaults', 'info');
        }
    }

    // ============================
    // 6. HELPER FUNCTIONS
    // ============================
    
    /**
     * Shows a notification message
     * @param {String} message - Message to display
     * @param {String} type - Notification type ('info', 'success', 'warning', 'error')
     */
    function _showNotification(message, type) {
        const event = new CustomEvent('showNotification', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    }

    // ============================
    // 7. INITIALIZATION
    // ============================
    
    /**
     * Initializes the Settings component
     */
    function init() {
        _cacheDOM();
        _bindEvents();
        _render();
    }

    // Public API
    return {
        init
    };
})(); 