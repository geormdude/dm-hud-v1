/**
 * Character Manager Component
 * 
 * Manages character and NPC information including:
 * - Player character and NPC listings
 * - Character detail display and editing
 * - Character filtering and selection
 * - Character relationship management
 * 
 * Component Structure:
 * 1. Private Variables & DOM Elements
 * 2. DOM Manipulation & Rendering
 * 3. Event Handlers
 * 4. State Management
 * 5. Helper Functions
 * 6. Initialization
 * 7. Public API
 */

const CharacterManager = (function() {
    // ============================
    // 1. PRIVATE VARIABLES & DOM ELEMENTS
    // ============================
    
    // DOM element references
    let _elements = {
        container: null,
        pcList: null,
        npcList: null,
        detailPanel: null,
        newCharacterButton: null,
        newNpcButton: null,
        pcFilter: null,
        npcFilter: null,
        characterTabs: null,
        relationshipPanel: null
    };
    
    // Track currently selected character
    let _selectedCharacterId = null;
    let _activeTab = 'pc'; // 'pc' or 'npc'
    
    // ============================
    // 2. DOM MANIPULATION & RENDERING
    // ============================
    
    /**
     * Cache DOM elements for later use
     */
    function _cacheDOM() {
        _elements.container = document.getElementById('character-manager');
        
        if (!_elements.container) {
            console.error('Character Manager container not found');
            return false;
        }
        
        _elements.pcList = document.getElementById('character-list');
        _elements.npcList = document.getElementById('npc-list');
        _elements.detailPanel = document.getElementById('character-detail');
        _elements.newCharacterButton = _elements.container.querySelector('.new-character-button');
        _elements.newNpcButton = _elements.container.querySelector('.new-npc-button');
        _elements.pcFilter = _elements.container.querySelector('.pc-filter');
        _elements.npcFilter = _elements.container.querySelector('.npc-filter');
        _elements.characterTabs = _elements.container.querySelector('.character-tabs');
        _elements.relationshipPanel = _elements.container.querySelector('.relationship-panel');
        
        return true;
    }
    
    /**
     * Render the entire component
     */
    function _render() {
        _renderCharacterLists();
        _renderDetailPanel();
        _renderRelationships();
    }
    
    /**
     * Render both PC and NPC lists
     */
    function _renderCharacterLists() {
        _renderPCList();
        _renderNPCList();
        _updateTabVisibility();
    }
    
    /**
     * Render the player character list
     */
    function _renderPCList() {
        if (!_elements.pcList) return;
        
        const state = StateManager.getState();
        const characters = state.characters.playerCharacters;
        
        // Clear current list
        _elements.pcList.innerHTML = '';
        
        // Filter value (if filter is active)
        const filterValue = _elements.pcFilter ? 
            _elements.pcFilter.value.toLowerCase() : '';
        
        // Create character items
        const filteredCharacters = characters.filter(char => 
            !filterValue || 
            char.name.toLowerCase().includes(filterValue) ||
            char.class?.toLowerCase().includes(filterValue) ||
            char.race?.toLowerCase().includes(filterValue)
        );
        
        if (filteredCharacters.length > 0) {
            const characterList = document.createElement('div');
            characterList.className = 'character-list';
            
            filteredCharacters.forEach(char => {
                const charEl = document.createElement('div');
                charEl.className = 'character-item';
                charEl.dataset.id = char.id;
                
                if (char.id === _selectedCharacterId) {
                    charEl.classList.add('selected');
                }
                
                charEl.innerHTML = `
                    <div class="character-header">
                        <div class="character-avatar">${char.name.charAt(0)}</div>
                        <div class="character-info">
                            <h3 class="character-name">${char.name}</h3>
                            <div class="character-subtitle">
                                ${char.race ? `<span class="character-race">${char.race}</span>` : ''}
                                ${char.class ? `<span class="character-class">${char.class}</span>` : ''}
                            </div>
                        </div>
                        <button class="edit-character-button" aria-label="Edit character">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                    ${char.status ? `<div class="character-status">${char.status}</div>` : ''}
                `;
                
                characterList.appendChild(charEl);
            });
            
            _elements.pcList.appendChild(characterList);
        } else {
            // Empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No player characters found${filterValue ? ' matching filter' : ''}.</p>
                <button class="new-character-button-inline">Add a player character</button>
            `;
            _elements.pcList.appendChild(emptyState);
        }
    }
    
    /**
     * Render the NPC list
     */
    function _renderNPCList() {
        if (!_elements.npcList) return;
        
        const state = StateManager.getState();
        const npcs = state.characters.npcs;
        
        // Clear current list
        _elements.npcList.innerHTML = '';
        
        // Filter value (if filter is active)
        const filterValue = _elements.npcFilter ? 
            _elements.npcFilter.value.toLowerCase() : '';
        
        // Create NPC items
        const filteredNPCs = npcs.filter(npc => 
            !filterValue || 
            npc.name.toLowerCase().includes(filterValue) ||
            npc.role?.toLowerCase().includes(filterValue) ||
            npc.faction?.toLowerCase().includes(filterValue)
        );
        
        if (filteredNPCs.length > 0) {
            const npcList = document.createElement('div');
            npcList.className = 'npc-list';
            
            filteredNPCs.forEach(npc => {
                const npcEl = document.createElement('div');
                npcEl.className = 'npc-item';
                npcEl.dataset.id = npc.id;
                
                if (npc.id === _selectedCharacterId) {
                    npcEl.classList.add('selected');
                }
                
                npcEl.innerHTML = `
                    <div class="npc-header">
                        <div class="npc-avatar">${npc.name.charAt(0)}</div>
                        <div class="npc-info">
                            <h3 class="npc-name">${npc.name}</h3>
                            <div class="npc-subtitle">
                                ${npc.role ? `<span class="npc-role">${npc.role}</span>` : ''}
                                ${npc.faction ? `<span class="npc-faction">${npc.faction}</span>` : ''}
                            </div>
                        </div>
                        <button class="edit-npc-button" aria-label="Edit NPC">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>
                    ${npc.status ? `<div class="npc-status">${npc.status}</div>` : ''}
                `;
                
                npcList.appendChild(npcEl);
            });
            
            _elements.npcList.appendChild(npcList);
        } else {
            // Empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No NPCs found${filterValue ? ' matching filter' : ''}.</p>
                <button class="new-npc-button-inline">Add an NPC</button>
            `;
            _elements.npcList.appendChild(emptyState);
        }
    }
    
    /**
     * Render the detail panel for the selected character
     */
    function _renderDetailPanel() {
        if (!_elements.detailPanel || !_selectedCharacterId) {
            _elements.detailPanel.innerHTML = '<div class="empty-state"><p>Select a character or NPC to view details</p></div>';
            return;
        }
        
        const state = StateManager.getState();
        const character = _findCharacterById(_selectedCharacterId);
        
        if (!character) {
            _elements.detailPanel.innerHTML = '<div class="empty-state"><p>Selected character not found</p></div>';
            return;
        }
        
        const isPC = state.characters.playerCharacters.some(pc => pc.id === _selectedCharacterId);
        
        _elements.detailPanel.innerHTML = `
            <div class="detail-header">
                <h2>${character.name}</h2>
                <div class="detail-actions">
                    <button class="edit-button">Edit</button>
                    <button class="delete-button">Delete</button>
                </div>
            </div>
            <div class="detail-content">
                ${isPC ? _renderPCDetails(character) : _renderNPCDetails(character)}
            </div>
        `;
    }
    
    /**
     * Render PC-specific details
     * @param {Object} pc - Player character data
     * @return {string} HTML string
     */
    function _renderPCDetails(pc) {
        return `
            <div class="detail-section">
                <h3>Character Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Race</label>
                        <div>${pc.race || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <label>Class</label>
                        <div>${pc.class || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <label>Level</label>
                        <div>${pc.level || '1'}</div>
                    </div>
                    <div class="detail-item">
                        <label>Background</label>
                        <div>${pc.background || '-'}</div>
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <h3>Character Notes</h3>
                <div class="detail-notes">${pc.notes || 'No notes added'}</div>
            </div>
            <div class="detail-section">
                <h3>Goals & Motivations</h3>
                <div class="detail-goals">${pc.goals || 'No goals specified'}</div>
            </div>
        `;
    }
    
    /**
     * Render NPC-specific details
     * @param {Object} npc - NPC data
     * @return {string} HTML string
     */
    function _renderNPCDetails(npc) {
        return `
            <div class="detail-section">
                <h3>NPC Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Role</label>
                        <div>${npc.role || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <label>Faction</label>
                        <div>${npc.faction || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <label>Location</label>
                        <div>${npc.location || '-'}</div>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <div>${npc.status || 'Active'}</div>
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <h3>Description</h3>
                <div class="detail-description">${npc.description || 'No description added'}</div>
            </div>
            <div class="detail-section">
                <h3>Plot Significance</h3>
                <div class="detail-plot">${npc.plotSignificance || 'No plot significance specified'}</div>
            </div>
            <div class="detail-section">
                <h3>DM Notes</h3>
                <div class="detail-notes">${npc.notes || 'No notes added'}</div>
            </div>
        `;
    }
    
    /**
     * Render the relationships for the selected character
     */
    function _renderRelationships() {
        if (!_elements.relationshipPanel || !_selectedCharacterId) {
            return;
        }
        
        const state = StateManager.getState();
        const relationships = state.characters.relationships.filter(rel => 
            rel.character1Id === _selectedCharacterId || 
            rel.character2Id === _selectedCharacterId
        );
        
        _elements.relationshipPanel.innerHTML = '';
        
        if (relationships.length === 0) {
            _elements.relationshipPanel.innerHTML = `
                <div class="empty-state">
                    <p>No relationships found for this character</p>
                    <button class="new-relationship-button">Add Relationship</button>
                </div>
            `;
            return;
        }
        
        const relationshipList = document.createElement('div');
        relationshipList.className = 'relationship-list';
        
        relationships.forEach(rel => {
            const otherId = rel.character1Id === _selectedCharacterId ? 
                rel.character2Id : rel.character1Id;
            const otherChar = _findCharacterById(otherId);
            
            if (!otherChar) return;
            
            const relEl = document.createElement('div');
            relEl.className = 'relationship-item';
            relEl.classList.add(`relationship-${rel.type}`);
            
            relEl.innerHTML = `
                <div class="relationship-header">
                    <div class="other-character">
                        <div class="character-avatar">${otherChar.name.charAt(0)}</div>
                        <span>${otherChar.name}</span>
                    </div>
                    <div class="relationship-type">${rel.type}</div>
                    <button class="edit-relationship-button" aria-label="Edit relationship">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
                ${rel.description ? `<div class="relationship-description">${rel.description}</div>` : ''}
            `;
            
            relationshipList.appendChild(relEl);
        });
        
        _elements.relationshipPanel.appendChild(relationshipList);
        _elements.relationshipPanel.insertAdjacentHTML('beforeend', `
            <button class="new-relationship-button">Add Relationship</button>
        `);
    }
    
    /**
     * Update tab visibility based on active tab
     */
    function _updateTabVisibility() {
        if (!_elements.pcList || !_elements.npcList) return;
        
        if (_activeTab === 'pc') {
            _elements.pcList.classList.add('active');
            _elements.npcList.classList.remove('active');
        } else {
            _elements.pcList.classList.remove('active');
            _elements.npcList.classList.add('active');
        }
    }
    
    // ============================
    // 3. EVENT HANDLERS
    // ============================
    
    /**
     * Bind event listeners to DOM elements
     */
    function _bindEvents() {
        // Character list event delegation
        if (_elements.pcList) {
            _elements.pcList.addEventListener('click', _handleCharacterListClick);
        }
        
        if (_elements.npcList) {
            _elements.npcList.addEventListener('click', _handleCharacterListClick);
        }
        
        // New character buttons
        if (_elements.newCharacterButton) {
            _elements.newCharacterButton.addEventListener('click', () => _createNewCharacter('pc'));
        }
        
        if (_elements.newNpcButton) {
            _elements.newNpcButton.addEventListener('click', () => _createNewCharacter('npc'));
        }
        
        // Filters
        if (_elements.pcFilter) {
            _elements.pcFilter.addEventListener('input', _debounce(() => _renderPCList(), 300));
        }
        
        if (_elements.npcFilter) {
            _elements.npcFilter.addEventListener('input', _debounce(() => _renderNPCList(), 300));
        }
        
        // Character tabs
        if (_elements.characterTabs) {
            _elements.characterTabs.addEventListener('click', _handleTabClick);
        }
        
        // Detail panel event delegation
        if (_elements.detailPanel) {
            _elements.detailPanel.addEventListener('click', _handleDetailPanelClick);
        }
        
        // Relationship panel event delegation
        if (_elements.relationshipPanel) {
            _elements.relationshipPanel.addEventListener('click', _handleRelationshipPanelClick);
        }
        
        // Listen for state changes
        document.addEventListener('stateChanged', _handleStateChange);
    }
    
    /**
     * Handle clicks on character lists
     * @param {Event} e - Click event
     */
    function _handleCharacterListClick(e) {
        const characterItem = e.target.closest('.character-item, .npc-item');
        
        // Handle character selection
        if (characterItem && !e.target.closest('button')) {
            const characterId = characterItem.dataset.id;
            _selectCharacter(characterId);
            return;
        }
        
        // Handle edit button
        if (e.target.closest('.edit-character-button, .edit-npc-button')) {
            const characterId = e.target.closest('.character-item, .npc-item').dataset.id;
            _editCharacter(characterId);
            return;
        }
        
        // Handle new character button in empty state
        if (e.target.closest('.new-character-button-inline')) {
            _createNewCharacter('pc');
            return;
        }
        
        // Handle new NPC button in empty state
        if (e.target.closest('.new-npc-button-inline')) {
            _createNewCharacter('npc');
            return;
        }
    }
    
    /**
     * Handle clicks on the detail panel
     * @param {Event} e - Click event
     */
    function _handleDetailPanelClick(e) {
        // Handle edit button
        if (e.target.closest('.edit-button')) {
            _editCharacter(_selectedCharacterId);
            return;
        }
        
        // Handle delete button
        if (e.target.closest('.delete-button')) {
            _deleteCharacter(_selectedCharacterId);
            return;
        }
    }
    
    /**
     * Handle clicks on the relationship panel
     * @param {Event} e - Click event
     */
    function _handleRelationshipPanelClick(e) {
        // Handle new relationship button
        if (e.target.closest('.new-relationship-button')) {
            _createNewRelationship(_selectedCharacterId);
            return;
        }
        
        // Handle edit relationship button
        if (e.target.closest('.edit-relationship-button')) {
            const relationshipItem = e.target.closest('.relationship-item');
            const otherCharId = _findOtherCharacterId(relationshipItem);
            _editRelationship(_selectedCharacterId, otherCharId);
            return;
        }
    }
    
    /**
     * Handle tab clicks
     * @param {Event} e - Click event
     */
    function _handleTabClick(e) {
        const tab = e.target.closest('[data-tab]');
        if (!tab) return;
        
        _activeTab = tab.dataset.tab;
        _updateTabVisibility();
    }
    
    /**
     * Handle state changes from the state manager
     * @param {CustomEvent} e - State change event
     */
    function _handleStateChange(e) {
        const { path } = e.detail;
        
        // Only update if relevant state has changed
        if (
            path.startsWith('characters.playerCharacters') || 
            path.startsWith('characters.npcs') || 
            path.startsWith('characters.relationships')
        ) {
            _render();
        }
    }
    
    // ============================
    // 4. STATE MANAGEMENT
    // ============================
    
    /**
     * Select a character and update the UI
     * @param {string} characterId - ID of the character to select
     */
    function _selectCharacter(characterId) {
        _selectedCharacterId = characterId;
        _render();
    }
    
    /**
     * Create a new character or NPC
     * @param {string} type - Type of character to create ('pc' or 'npc')
     */
    function _createNewCharacter(type) {
        const newCharacter = {
            id: _generateId(),
            name: type === 'pc' ? 'New Character' : 'New NPC',
            createdAt: new Date().toISOString()
        };
        
        if (type === 'pc') {
            newCharacter.race = '';
            newCharacter.class = '';
            newCharacter.level = 1;
            newCharacter.background = '';
            StateManager.addItem('characters.playerCharacters', newCharacter);
        } else {
            newCharacter.role = '';
            newCharacter.faction = '';
            newCharacter.location = '';
            newCharacter.status = 'Active';
            StateManager.addItem('characters.npcs', newCharacter);
        }
        
        _selectCharacter(newCharacter.id);
    }
    
    /**
     * Edit an existing character
     * @param {string} characterId - ID of the character to edit
     */
    function _editCharacter(characterId) {
        // In a real implementation, this would show a modal or form
        console.log(`Edit character: ${characterId}`);
    }
    
    /**
     * Delete a character
     * @param {string} characterId - ID of the character to delete
     */
    function _deleteCharacter(characterId) {
        const state = StateManager.getState();
        const isPC = state.characters.playerCharacters.some(pc => pc.id === characterId);
        
        if (isPC) {
            StateManager.removeItem('characters.playerCharacters', characterId);
        } else {
            StateManager.removeItem('characters.npcs', characterId);
        }
        
        // Also remove any relationships involving this character
        const relationships = state.characters.relationships.filter(rel =>
            rel.character1Id === characterId || rel.character2Id === characterId
        );
        
        relationships.forEach(rel => {
            StateManager.removeItem('characters.relationships', rel.id);
        });
        
        _selectedCharacterId = null;
        _render();
    }
    
    /**
     * Create a new relationship
     * @param {string} character1Id - ID of the first character
     */
    function _createNewRelationship(character1Id) {
        // In a real implementation, this would show a modal or form
        console.log(`Create relationship for character: ${character1Id}`);
    }
    
    /**
     * Edit an existing relationship
     * @param {string} character1Id - ID of the first character
     * @param {string} character2Id - ID of the second character
     */
    function _editRelationship(character1Id, character2Id) {
        // In a real implementation, this would show a modal or form
        console.log(`Edit relationship between ${character1Id} and ${character2Id}`);
    }
    
    // ============================
    // 5. HELPER FUNCTIONS
    // ============================
    
    /**
     * Find a character by ID from either PC or NPC list
     * @param {string} id - Character ID to find
     * @return {Object|null} Character object or null if not found
     */
    function _findCharacterById(id) {
        const state = StateManager.getState();
        return state.characters.playerCharacters.find(pc => pc.id === id) ||
               state.characters.npcs.find(npc => npc.id === id) ||
               null;
    }
    
    /**
     * Find the other character ID in a relationship item
     * @param {HTMLElement} relationshipItem - Relationship item element
     * @return {string|null} Other character's ID or null
     */
    function _findOtherCharacterId(relationshipItem) {
        // In a real implementation, this would extract the ID from the relationship item
        return null;
    }
    
    /**
     * Generate a unique ID
     * @return {string} Unique ID
     */
    function _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Debounce function to limit how often a function can be called
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @return {Function} Debounced function
     */
    function _debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // ============================
    // 6. INITIALIZATION
    // ============================
    
    /**
     * Initialize the component
     */
    function init() {
        const domCached = _cacheDOM();
        
        if (!domCached) {
            console.error('Failed to initialize Character Manager: DOM elements not found');
            return false;
        }
        
        _bindEvents();
        _render();
        
        return true;
    }
    
    // ============================
    // 7. PUBLIC API
    // ============================
    
    return {
        init,
        // Expose methods for external use
        selectCharacter: _selectCharacter,
        createCharacter: _createNewCharacter,
        render: _render
    };
})(); 