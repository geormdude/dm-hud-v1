/**
 * State Manager Module
 * 
 * Maintains centralized application state using the revealing module pattern.
 * Handles state updates, persistence, and notifies components of changes.
 * 
 * Contents:
 * 1. Private State & Variables
 * 2. Helper Functions
 * 3. State Initialization
 * 4. State Access & Mutation
 * 5. Event Notification
 * 6. Local Storage Persistence
 * 7. Public API
 */

const StateManager = (function() {
    // ============================
    // 1. PRIVATE STATE & VARIABLES
    // ============================
    
    // Main state object - single source of truth
    let _state = {
        // UI state
        ui: {
            activeTab: 'story',
            focusMode: false,
            lastSaved: null,
            sidebarCollapsed: false,
            theme: 'dark',
            panelSizes: {
                story: { threadList: 25, beatDisplay: 50, relationshipMap: 25 },
                characters: { characterList: 25, npcList: 25, characterDetail: 50 },
                combat: { combatControls: 20, initiativeList: 30, combatDetail: 50 }
            }
        },
        
        // Story state
        story: {
            campaign: {
                id: '',
                name: '',
                description: '',
                setting: '',
                currentSession: 1
            },
            plotThreads: [], // Array of story threads
            storyBeats: [],  // Array of story beats/events
            locations: [],   // Array of important locations
            notes: []        // Array of campaign notes
        },
        
        // Character state
        characters: {
            playerCharacters: [], // Array of PCs
            npcs: [],             // Array of NPCs
            factions: [],         // Array of factions/groups
            relationships: []     // Array of relationships between characters
        },
        
        // Combat state
        combat: {
            inCombat: false,
            currentEncounter: null,
            initiative: [],       // Array of ordered combatants
            round: 0,
            activeIndex: -1,
            encounters: [],       // Saved encounter templates
            conditions: []        // Status effects/conditions
        },
        
        // Settings
        settings: {
            autosaveInterval: 60, // In seconds
            confirmBeforeDelete: true,
            showHiddenInfo: false,
            diceRollerEnabled: true,
            soundEffectsEnabled: false,
            notificationsEnabled: true
        }
    };
    
    // Subscribers for state changes
    let _subscribers = [];
    
    // Throttling variables for localStorage
    let _saveTimeout = null;
    const SAVE_DELAY = 2000; // 2 seconds
    
    // ============================
    // 2. HELPER FUNCTIONS
    // ============================
    
    /**
     * Gets a value from a nested object using a dot-notation path
     * @param {Object} obj - The object to get the value from
     * @param {String} path - Dot notation path (e.g., 'ui.activeTab')
     * @return {*} The value at the path or undefined
     */
    function _getNestedValue(obj, path) {
        return path.split('.').reduce((prev, curr) => {
            return prev && prev[curr] !== undefined ? prev[curr] : undefined;
        }, obj);
    }
    
    /**
     * Sets a value in a nested object using a dot-notation path
     * @param {Object} obj - The object to set the value in
     * @param {String} path - Dot notation path (e.g., 'ui.activeTab')
     * @param {*} value - The value to set
     * @return {Object} A new object with the updated value
     */
    function _setNestedValue(obj, path, value) {
        // Create a deep copy of the object to maintain immutability
        const result = JSON.parse(JSON.stringify(obj));
        const parts = path.split('.');
        let current = result;
        
        // Navigate to the nested property, creating objects as needed
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        
        // Set the value at the final property
        current[parts[parts.length - 1]] = value;
        return result;
    }
    
    /**
     * Generates a unique ID for new items
     * @return {String} A unique ID string
     */
    function _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Deep merges two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object to merge in
     * @return {Object} Merged object
     */
    function _deepMerge(target, source) {
        const output = Object.assign({}, target);
        
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = _deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        
        return output;
        
        function isObject(item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
        }
    }
    
    // ============================
    // 3. STATE INITIALIZATION
    // ============================
    
    /**
     * Initializes the state with sample data for testing
     */
    function _initializeWithSampleData() {
        // Sample campaign
        _state.story.campaign = {
            id: _generateId(),
            name: 'The Lost Mines of Phandelver',
            description: 'A starter adventure for new players and DMs',
            setting: 'Forgotten Realms',
            currentSession: 1
        };
        
        // Sample plot threads
        _state.story.plotThreads = [
            {
                id: _generateId(),
                name: 'Black Spider\'s Plot',
                description: 'The drow Nezznar seeks Wave Echo Cave for the Forge of Spells',
                status: 'active',
                progress: 0
            },
            {
                id: _generateId(),
                name: 'Redbrands Takeover',
                description: 'The Redbrands have taken over Phandalin under Glasstaff\'s leadership',
                status: 'active',
                progress: 0
            },
            {
                id: _generateId(),
                name: 'Gundren\'s Kidnapping',
                description: 'Gundren Rockseeker has been kidnapped by goblins',
                status: 'active',
                progress: 0
            }
        ];
        
        // Sample story beats
        _state.story.storyBeats = [
            {
                id: _generateId(),
                threadId: _state.story.plotThreads[2].id,
                name: 'Ambush on Triboar Trail',
                description: 'Players find an ambushed wagon with dead horses',
                revealed: false,
                completed: false,
                order: 1
            },
            {
                id: _generateId(),
                threadId: _state.story.plotThreads[2].id,
                name: 'Cragmaw Hideout',
                description: 'Goblin hideout where Sildar is being held',
                revealed: false,
                completed: false,
                order: 2
            },
            {
                id: _generateId(),
                threadId: _state.story.plotThreads[1].id,
                name: 'Trouble in Phandalin',
                description: 'Players learn about Redbrand trouble in town',
                revealed: false,
                completed: false,
                order: 1
            }
        ];
        
        // Sample locations
        _state.story.locations = [
            {
                id: _generateId(),
                name: 'Phandalin',
                description: 'Small frontier town',
                notes: 'Currently terrorized by the Redbrands'
            },
            {
                id: _generateId(),
                name: 'Cragmaw Hideout',
                description: 'Goblin hideout in a cave',
                notes: 'Where Sildar is being held prisoner'
            },
            {
                id: _generateId(),
                name: 'Wave Echo Cave',
                description: 'Lost mine containing the Forge of Spells',
                notes: 'Final dungeon of the adventure'
            }
        ];
        
        // Sample player characters
        _state.characters.playerCharacters = [
            {
                id: _generateId(),
                name: 'Bruenor',
                race: 'Dwarf',
                class: 'Fighter',
                level: 1,
                hp: { current: 12, max: 12 },
                ac: 16,
                notes: 'Shield dwarf with a battleaxe',
                active: true
            },
            {
                id: _generateId(),
                name: 'Regis',
                race: 'Halfling',
                class: 'Rogue',
                level: 1,
                hp: { current: 8, max: 8 },
                ac: 14,
                notes: 'Stealthy and quick-witted',
                active: true
            }
        ];
        
        // Sample NPCs
        _state.characters.npcs = [
            {
                id: _generateId(),
                name: 'Sildar Hallwinter',
                race: 'Human',
                occupation: 'Warrior',
                description: 'Member of the Lords\' Alliance',
                disposition: 'friendly',
                hp: { current: 27, max: 27 },
                ac: 16,
                notes: 'Captured by goblins'
            },
            {
                id: _generateId(),
                name: 'Glasstaff (Iarno Albrek)',
                race: 'Human',
                occupation: 'Wizard',
                description: 'Leader of the Redbrands',
                disposition: 'hostile',
                hp: { current: 22, max: 22 },
                ac: 12,
                notes: 'Former Lords\' Alliance member turned corrupt'
            },
            {
                id: _generateId(),
                name: 'Gundren Rockseeker',
                race: 'Dwarf',
                occupation: 'Miner',
                description: 'Expedition leader seeking Wave Echo Cave',
                disposition: 'friendly',
                hp: { current: 12, max: 12 },
                ac: 10,
                notes: 'Kidnapped by goblins'
            }
        ];
        
        // Sample factions
        _state.characters.factions = [
            {
                id: _generateId(),
                name: 'Lords\' Alliance',
                description: 'Coalition of political powers concerned with mutual security',
                disposition: 'friendly'
            },
            {
                id: _generateId(),
                name: 'Redbrands',
                description: 'Band of mercenaries that have taken over Phandalin',
                disposition: 'hostile'
            },
            {
                id: _generateId(),
                name: 'Cragmaw Goblins',
                description: 'Goblin tribe serving the Black Spider',
                disposition: 'hostile'
            }
        ];
        
        // Sample relationships
        _state.characters.relationships = [
            {
                id: _generateId(),
                source: _state.characters.npcs[0].id, // Sildar
                target: _state.characters.npcs[2].id, // Gundren
                type: 'ally',
                description: 'Sildar was hired to protect Gundren'
            },
            {
                id: _generateId(),
                source: _state.characters.npcs[1].id, // Glasstaff
                target: _state.characters.factions[1].id, // Redbrands
                type: 'leader',
                description: 'Glasstaff leads the Redbrands'
            }
        ];
        
        // Sample encounter
        const goblinEncounterId = _generateId();
        _state.combat.encounters = [
            {
                id: goblinEncounterId,
                name: 'Goblin Ambush',
                description: 'Four goblins ambush the party on Triboar Trail',
                difficulty: 'easy',
                location: 'Triboar Trail',
                enemies: [
                    { id: _generateId(), name: 'Goblin 1', hp: { current: 7, max: 7 }, ac: 15, initiative: 0 },
                    { id: _generateId(), name: 'Goblin 2', hp: { current: 7, max: 7 }, ac: 15, initiative: 0 },
                    { id: _generateId(), name: 'Goblin 3', hp: { current: 7, max: 7 }, ac: 15, initiative: 0 },
                    { id: _generateId(), name: 'Goblin 4', hp: { current: 7, max: 7 }, ac: 15, initiative: 0 }
                ]
            },
            {
                id: _generateId(),
                name: 'Redbrand Ruffians',
                description: 'Four Redbrand ruffians confront the party in Phandalin',
                difficulty: 'medium',
                location: 'Phandalin',
                enemies: [
                    { id: _generateId(), name: 'Ruffian 1', hp: { current: 16, max: 16 }, ac: 14, initiative: 0 },
                    { id: _generateId(), name: 'Ruffian 2', hp: { current: 16, max: 16 }, ac: 14, initiative: 0 },
                    { id: _generateId(), name: 'Ruffian 3', hp: { current: 16, max: 16 }, ac: 14, initiative: 0 },
                    { id: _generateId(), name: 'Ruffian 4', hp: { current: 16, max: 16 }, ac: 14, initiative: 0 }
                ]
            }
        ];
        
        // Sample conditions
        _state.combat.conditions = [
            { id: _generateId(), name: 'Blinded', description: 'Cannot see, automatically fails sight-based checks, attack rolls have disadvantage' },
            { id: _generateId(), name: 'Charmed', description: 'Cannot attack charmer, charmer has advantage on social checks' },
            { id: _generateId(), name: 'Frightened', description: 'Disadvantage on checks while source of fear in sight, cannot move closer to source' },
            { id: _generateId(), name: 'Poisoned', description: 'Disadvantage on attack rolls and ability checks' },
            { id: _generateId(), name: 'Stunned', description: 'Incapacitated, cannot move, speaks falteringly, auto-fails STR and DEX saves' }
        ];
    }
    
    /**
     * Loads state from localStorage if available
     */
    function _loadFromStorage() {
        try {
            const savedState = localStorage.getItem('dmHudState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                // Merge saved state with default state to ensure structure integrity
                _state = _deepMerge(_state, parsedState);
                console.log('State loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('Error loading state from localStorage:', error);
        }
        return false;
    }
    
    // ============================
    // 4. STATE ACCESS & MUTATION
    // ============================
    
    /**
     * Gets the current state or a specific part of it
     * @param {String} [path] - Optional dot notation path to specific state
     * @return {*} The requested state
     */
    function _getState(path) {
        if (!path) {
            // Return a deep copy of the entire state
            return JSON.parse(JSON.stringify(_state));
        }
        
        // Return a deep copy of the specific state path
        const value = _getNestedValue(_state, path);
        return value !== undefined ? JSON.parse(JSON.stringify(value)) : undefined;
    }
    
    /**
     * Updates the state at the specified path
     * @param {String} path - Dot notation path to update
     * @param {*} value - New value to set
     * @param {Boolean} [silent=false] - If true, doesn't notify subscribers
     */
    function _setState(path, value, silent = false) {
        // Update the state immutably
        _state = _setNestedValue(_state, path, value);
        
        // Update last saved timestamp
        _state.ui.lastSaved = new Date().toISOString();
        
        // Schedule save to localStorage
        _throttledSave();
        
        // Notify subscribers unless silent
        if (!silent) {
            _notifySubscribers(path, value);
        }
    }
    
    /**
     * Updates multiple state properties at once
     * @param {Object} updates - Object with paths as keys and new values as values
     * @param {Boolean} [silent=false] - If true, doesn't notify subscribers
     */
    function _batchUpdate(updates, silent = false) {
        let updatedState = _state;
        
        // Apply all updates
        for (const [path, value] of Object.entries(updates)) {
            updatedState = _setNestedValue(updatedState, path, value);
        }
        
        // Set the new state
        _state = updatedState;
        
        // Update last saved timestamp
        _state.ui.lastSaved = new Date().toISOString();
        
        // Schedule save to localStorage
        _throttledSave();
        
        // Notify subscribers unless silent
        if (!silent) {
            for (const path of Object.keys(updates)) {
                _notifySubscribers(path, _getNestedValue(_state, path));
            }
        }
    }
    
    /**
     * Adds an item to an array in the state
     * @param {String} arrayPath - Path to the array
     * @param {Object} item - Item to add
     * @return {String} ID of the added item
     */
    function _addItem(arrayPath, item) {
        // Ensure item has an ID
        if (!item.id) {
            item.id = _generateId();
        }
        
        // Get current array
        const array = _getState(arrayPath) || [];
        
        // Add item to array
        const newArray = [...array, item];
        
        // Update state
        _setState(arrayPath, newArray);
        
        return item.id;
    }
    
    /**
     * Updates an item in an array by ID
     * @param {String} arrayPath - Path to the array
     * @param {String} itemId - ID of the item to update
     * @param {Object} updates - Properties to update
     * @return {Boolean} True if item was found and updated
     */
    function _updateItem(arrayPath, itemId, updates) {
        // Get current array
        const array = _getState(arrayPath) || [];
        
        // Find item index
        const index = array.findIndex(item => item.id === itemId);
        if (index === -1) return false;
        
        // Create updated item
        const updatedItem = { ...array[index], ...updates };
        
        // Create new array with updated item
        const newArray = [
            ...array.slice(0, index),
            updatedItem,
            ...array.slice(index + 1)
        ];
        
        // Update state
        _setState(arrayPath, newArray);
        
        return true;
    }
    
    /**
     * Removes an item from an array by ID
     * @param {String} arrayPath - Path to the array
     * @param {String} itemId - ID of the item to remove
     * @return {Boolean} True if item was found and removed
     */
    function _removeItem(arrayPath, itemId) {
        // Get current array
        const array = _getState(arrayPath) || [];
        
        // Filter out the item
        const newArray = array.filter(item => item.id !== itemId);
        
        // If array length didn't change, item wasn't found
        if (newArray.length === array.length) return false;
        
        // Update state
        _setState(arrayPath, newArray);
        
        return true;
    }
    
    // ============================
    // 5. EVENT NOTIFICATION
    // ============================
    
    /**
     * Subscribes a callback to state changes
     * @param {Function} callback - Function to call on state changes
     * @return {Function} Unsubscribe function
     */
    function _subscribe(callback) {
        _subscribers.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = _subscribers.indexOf(callback);
            if (index !== -1) {
                _subscribers.splice(index, 1);
            }
        };
    }
    
    /**
     * Notifies all subscribers of a state change
     * @param {String} path - Path that was changed
     * @param {*} newValue - New value at the path
     */
    function _notifySubscribers(path, newValue) {
        // Create custom event
        const event = new CustomEvent('stateChanged', {
            detail: {
                path,
                value: newValue,
                timestamp: new Date().toISOString()
            }
        });
        
        // Dispatch event
        document.dispatchEvent(event);
        
        // Call subscribers
        _subscribers.forEach(callback => {
            try {
                callback(path, newValue);
            } catch (error) {
                console.error('Error in state subscriber:', error);
            }
        });
    }
    
    // ============================
    // 6. LOCAL STORAGE PERSISTENCE
    // ============================
    
    /**
     * Saves the current state to localStorage with throttling
     */
    function _throttledSave() {
        // Clear any existing timeout
        if (_saveTimeout) {
            clearTimeout(_saveTimeout);
        }
        
        // Set new timeout
        _saveTimeout = setTimeout(() => {
            _saveToStorage();
            _saveTimeout = null;
        }, SAVE_DELAY);
    }
    
    /**
     * Saves the current state to localStorage
     */
    function _saveToStorage() {
        try {
            localStorage.setItem('dmHudState', JSON.stringify(_state));
            console.log('State saved to localStorage');
        } catch (error) {
            console.error('Error saving state to localStorage:', error);
        }
    }
    
    /**
     * Forces an immediate save to localStorage
     */
    function _forceSave() {
        // Clear any existing timeout
        if (_saveTimeout) {
            clearTimeout(_saveTimeout);
            _saveTimeout = null;
        }
        
        // Save immediately
        _saveToStorage();
    }
    
    /**
     * Exports the current state as a JSON string
     * @return {String} JSON string of current state
     */
    function _exportState() {
        return JSON.stringify(_state, null, 2);
    }
    
    /**
     * Imports state from a JSON string
     * @param {String} jsonState - JSON string to import
     * @return {Boolean} True if import was successful
     */
    function _importState(jsonState) {
        try {
            const newState = JSON.parse(jsonState);
            _state = _deepMerge(_state, newState);
            _forceSave();
            _notifySubscribers('', _state);
            return true;
        } catch (error) {
            console.error('Error importing state:', error);
            return false;
        }
    }
    
    /**
     * Resets the state to default values
     */
    function _resetState() {
        // Create a new default state
        _state = {
            ui: {
                activeTab: 'story',
                focusMode: false,
                lastSaved: null,
                sidebarCollapsed: false,
                theme: 'dark',
                panelSizes: {
                    story: { threadList: 25, beatDisplay: 50, relationshipMap: 25 },
                    characters: { characterList: 25, npcList: 25, characterDetail: 50 },
                    combat: { combatControls: 20, initiativeList: 30, combatDetail: 50 }
                }
            },
            story: {
                campaign: {
                    id: '',
                    name: '',
                    description: '',
                    setting: '',
                    currentSession: 1
                },
                plotThreads: [],
                storyBeats: [],
                locations: [],
                notes: []
            },
            characters: {
                playerCharacters: [],
                npcs: [],
                factions: [],
                relationships: []
            },
            combat: {
                inCombat: false,
                currentEncounter: null,
                initiative: [],
                round: 0,
                activeIndex: -1,
                encounters: [],
                conditions: []
            },
            settings: {
                autosaveInterval: 60,
                confirmBeforeDelete: true,
                showHiddenInfo: false,
                diceRollerEnabled: true,
                soundEffectsEnabled: false,
                notificationsEnabled: true
            }
        };
        
        // Save and notify
        _forceSave();
        _notifySubscribers('', _state);
    }
    
    // ============================
    // 7. PUBLIC API
    // ============================
    
    /**
     * Initializes the state manager
     */
    function initialize() {
        // Try to load from localStorage first
        const loaded = _loadFromStorage();
        
        // If nothing was loaded, initialize with sample data
        if (!loaded) {
            _initializeWithSampleData();
            _forceSave();
        }
        
        // Notify subscribers of initial state
        _notifySubscribers('', _state);
        
        console.log('StateManager initialized');
    }
    
    // Return public API
    return {
        // Core state management
        initialize,
        getState: _getState,
        setState: _setState,
        batchUpdate: _batchUpdate,
        subscribe: _subscribe,
        
        // Array item operations
        addItem: _addItem,
        updateItem: _updateItem,
        removeItem: _removeItem,
        
        // Persistence
        save: _forceSave,
        export: _exportState,
        import: _importState,
        reset: _resetState,
        
        // Utility functions
        generateId: _generateId
    };
})();

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    StateManager.initialize();
});

// Export for use in other modules
window.StateManager = StateManager; 