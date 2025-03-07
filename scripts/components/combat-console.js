/**
 * Combat Console Component
 * 
 * Manages combat tracking including:
 * - Initiative order and turn management
 * - Combat status and round tracking
 * - Combatant health and conditions
 * - Combat actions and state changes
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

const CombatConsole = (function() {
    // ============================
    // 1. PRIVATE VARIABLES & DOM ELEMENTS
    // ============================
    
    // DOM element references
    let _elements = {
        container: null,
        initiativeList: null,
        combatControls: null,
        combatantDetail: null,
        startCombatButton: null,
        endCombatButton: null,
        nextTurnButton: null,
        roundCounter: null,
        addCombatantButton: null,
        saveCombatButton: null
    };
    
    // Track active combatant for animations
    let _activeCombatantId = null;
    
    // ============================
    // 2. DOM MANIPULATION & RENDERING
    // ============================
    
    /**
     * Cache DOM elements for later use
     */
    function _cacheDOM() {
        _elements.container = document.getElementById('combat-console');
        
        if (!_elements.container) {
            console.error('Combat Console container not found');
            return false;
        }
        
        _elements.initiativeList = _elements.container.querySelector('.initiative-list');
        _elements.combatControls = _elements.container.querySelector('.combat-controls');
        _elements.combatantDetail = _elements.container.querySelector('.combatant-detail');
        _elements.startCombatButton = _elements.container.querySelector('.start-combat-button');
        _elements.endCombatButton = _elements.container.querySelector('.end-combat-button');
        _elements.nextTurnButton = _elements.container.querySelector('.next-turn-button');
        _elements.roundCounter = _elements.container.querySelector('.round-counter');
        _elements.addCombatantButton = _elements.container.querySelector('.add-combatant-button');
        _elements.saveCombatButton = _elements.container.querySelector('.save-combat-button');
        
        return true;
    }
    
    /**
     * Render the entire component
     */
    function _render() {
        _renderCombatControls();
        _renderInitiativeList();
        _renderCombatantDetail();
    }
    
    /**
     * Render the combat controls section
     */
    function _renderCombatControls() {
        if (!_elements.combatControls) return;
        
        const state = StateManager.getState();
        const { inCombat, round } = state.combat;
        
        _elements.combatControls.innerHTML = `
            <div class="combat-status">
                ${inCombat ? `
                    <div class="round-display">Round ${round}</div>
                    <button class="next-turn-button">Next Turn</button>
                    <button class="end-combat-button">End Combat</button>
                ` : `
                    <button class="start-combat-button">Start Combat</button>
                `}
                <button class="add-combatant-button">Add Combatant</button>
                ${inCombat ? `<button class="save-combat-button">Save Encounter</button>` : ''}
            </div>
        `;
    }
    
    /**
     * Render the initiative list
     */
    function _renderInitiativeList() {
        if (!_elements.initiativeList) return;
        
        const state = StateManager.getState();
        const { initiative, activeIndex, inCombat } = state.combat;
        
        // Clear current list
        _elements.initiativeList.innerHTML = '';
        
        if (initiative.length === 0) {
            _elements.initiativeList.innerHTML = `
                <div class="empty-state">
                    <p>No combatants added</p>
                    <button class="add-combatant-button">Add Combatant</button>
                </div>
            `;
            return;
        }
        
        // Sort by initiative
        const sortedCombatants = [...initiative].sort((a, b) => b.initiative - a.initiative);
        
        const initiativeList = document.createElement('div');
        initiativeList.className = 'initiative-order';
        
        sortedCombatants.forEach((combatant, index) => {
            const isActive = inCombat && index === activeIndex;
            const combatantEl = document.createElement('div');
            combatantEl.className = 'combatant-item';
            combatantEl.dataset.id = combatant.id;
            
            if (isActive) {
                combatantEl.classList.add('active');
                _activeCombatantId = combatant.id;
            }
            
            // Calculate health percentage
            const healthPercent = Math.max(0, Math.min(100, 
                (combatant.currentHP / combatant.maxHP) * 100
            ));
            
            // Determine health status class
            let healthStatus = 'healthy';
            if (healthPercent <= 25) healthStatus = 'critical';
            else if (healthPercent <= 50) healthStatus = 'wounded';
            
            combatantEl.innerHTML = `
                <div class="initiative-roll">${combatant.initiative}</div>
                <div class="combatant-info">
                    <div class="combatant-header">
                        <h3 class="combatant-name">${combatant.name}</h3>
                        <div class="combatant-actions">
                            <button class="edit-combatant-button" aria-label="Edit combatant">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="remove-combatant-button" aria-label="Remove from combat">×</button>
                        </div>
                    </div>
                    <div class="health-bar ${healthStatus}">
                        <div class="health-fill" style="width: ${healthPercent}%"></div>
                        <div class="health-text">${combatant.currentHP} / ${combatant.maxHP} HP</div>
                    </div>
                    ${combatant.conditions.length > 0 ? `
                        <div class="condition-tags">
                            ${combatant.conditions.map(condition => `
                                <span class="condition-tag" data-condition="${condition.type}">
                                    ${condition.type}
                                    ${condition.duration ? `(${condition.duration})` : ''}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            
            initiativeList.appendChild(combatantEl);
        });
        
        _elements.initiativeList.appendChild(initiativeList);
    }
    
    /**
     * Render the combatant detail panel
     */
    function _renderCombatantDetail() {
        if (!_elements.combatantDetail || !_activeCombatantId) {
            _elements.combatantDetail.innerHTML = '<div class="empty-state"><p>Select a combatant to view details</p></div>';
            return;
        }
        
        const state = StateManager.getState();
        const combatant = state.combat.initiative.find(c => c.id === _activeCombatantId);
        
        if (!combatant) {
            _elements.combatantDetail.innerHTML = '<div class="empty-state"><p>Combatant not found</p></div>';
            return;
        }
        
        _elements.combatantDetail.innerHTML = `
            <div class="detail-header">
                <h2>${combatant.name}</h2>
                <div class="detail-actions">
                    <button class="heal-damage-button">Heal/Damage</button>
                    <button class="add-condition-button">Add Condition</button>
                </div>
            </div>
            <div class="detail-content">
                <div class="detail-section">
                    <h3>Combat Stats</h3>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <label>Initiative</label>
                            <div>${combatant.initiative}</div>
                        </div>
                        <div class="stat-item">
                            <label>Armor Class</label>
                            <div>${combatant.armorClass}</div>
                        </div>
                        <div class="stat-item">
                            <label>Current HP</label>
                            <div>${combatant.currentHP}</div>
                        </div>
                        <div class="stat-item">
                            <label>Max HP</label>
                            <div>${combatant.maxHP}</div>
                        </div>
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Conditions</h3>
                    ${combatant.conditions.length > 0 ? `
                        <div class="condition-list">
                            ${combatant.conditions.map(condition => `
                                <div class="condition-item">
                                    <div class="condition-header">
                                        <span class="condition-name">${condition.type}</span>
                                        <div class="condition-actions">
                                            ${condition.duration ? `
                                                <button class="decrease-duration-button" data-condition-id="${condition.id}">-1</button>
                                            ` : ''}
                                            <button class="remove-condition-button" data-condition-id="${condition.id}">×</button>
                                        </div>
                                    </div>
                                    ${condition.duration ? `
                                        <div class="condition-duration">Duration: ${condition.duration} rounds</div>
                                    ` : ''}
                                    ${condition.notes ? `
                                        <div class="condition-notes">${condition.notes}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <p>No active conditions</p>
                    `}
                </div>
                <div class="detail-section">
                    <h3>Notes</h3>
                    <div class="combat-notes">${combatant.notes || 'No combat notes'}</div>
                </div>
            </div>
        `;
    }
    
    // ============================
    // 3. EVENT HANDLERS
    // ============================
    
    /**
     * Bind event listeners to DOM elements
     */
    function _bindEvents() {
        // Combat controls event delegation
        if (_elements.combatControls) {
            _elements.combatControls.addEventListener('click', _handleCombatControlsClick);
        }
        
        // Initiative list event delegation
        if (_elements.initiativeList) {
            _elements.initiativeList.addEventListener('click', _handleInitiativeListClick);
        }
        
        // Combatant detail event delegation
        if (_elements.combatantDetail) {
            _elements.combatantDetail.addEventListener('click', _handleCombatantDetailClick);
        }
        
        // Listen for state changes
        document.addEventListener('stateChanged', _handleStateChange);
    }
    
    /**
     * Handle clicks on combat controls
     * @param {Event} e - Click event
     */
    function _handleCombatControlsClick(e) {
        // Start combat
        if (e.target.closest('.start-combat-button')) {
            _startCombat();
            return;
        }
        
        // End combat
        if (e.target.closest('.end-combat-button')) {
            _endCombat();
            return;
        }
        
        // Next turn
        if (e.target.closest('.next-turn-button')) {
            _nextTurn();
            return;
        }
        
        // Add combatant
        if (e.target.closest('.add-combatant-button')) {
            _addCombatant();
            return;
        }
        
        // Save encounter
        if (e.target.closest('.save-combat-button')) {
            _saveEncounter();
            return;
        }
    }
    
    /**
     * Handle clicks on the initiative list
     * @param {Event} e - Click event
     */
    function _handleInitiativeListClick(e) {
        const combatantItem = e.target.closest('.combatant-item');
        
        // Select combatant
        if (combatantItem && !e.target.closest('button')) {
            const combatantId = combatantItem.dataset.id;
            _selectCombatant(combatantId);
            return;
        }
        
        // Edit combatant
        if (e.target.closest('.edit-combatant-button')) {
            const combatantId = e.target.closest('.combatant-item').dataset.id;
            _editCombatant(combatantId);
            return;
        }
        
        // Remove combatant
        if (e.target.closest('.remove-combatant-button')) {
            const combatantId = e.target.closest('.combatant-item').dataset.id;
            _removeCombatant(combatantId);
            return;
        }
    }
    
    /**
     * Handle clicks on the combatant detail panel
     * @param {Event} e - Click event
     */
    function _handleCombatantDetailClick(e) {
        // Heal/Damage button
        if (e.target.closest('.heal-damage-button')) {
            _showHealDamageDialog(_activeCombatantId);
            return;
        }
        
        // Add condition button
        if (e.target.closest('.add-condition-button')) {
            _showAddConditionDialog(_activeCombatantId);
            return;
        }
        
        // Decrease condition duration
        if (e.target.closest('.decrease-duration-button')) {
            const conditionId = e.target.dataset.conditionId;
            _decreaseConditionDuration(_activeCombatantId, conditionId);
            return;
        }
        
        // Remove condition
        if (e.target.closest('.remove-condition-button')) {
            const conditionId = e.target.dataset.conditionId;
            _removeCondition(_activeCombatantId, conditionId);
            return;
        }
    }
    
    /**
     * Handle state changes from the state manager
     * @param {CustomEvent} e - State change event
     */
    function _handleStateChange(e) {
        const { path } = e.detail;
        
        // Only update if combat state has changed
        if (path.startsWith('combat.')) {
            _render();
        }
    }
    
    // ============================
    // 4. STATE MANAGEMENT
    // ============================
    
    /**
     * Start combat encounter
     */
    function _startCombat() {
        const state = StateManager.getState();
        
        if (state.combat.initiative.length === 0) {
            console.error('Cannot start combat: No combatants added');
            return;
        }
        
        StateManager.setState('combat', {
            ...state.combat,
            inCombat: true,
            round: 1,
            activeIndex: 0
        });
    }
    
    /**
     * End current combat encounter
     */
    function _endCombat() {
        const state = StateManager.getState();
        
        StateManager.setState('combat', {
            ...state.combat,
            inCombat: false,
            round: 0,
            activeIndex: -1
        });
    }
    
    /**
     * Advance to next turn
     */
    function _nextTurn() {
        const state = StateManager.getState();
        const { initiative, activeIndex, round } = state.combat;
        
        // Calculate next active index
        const nextIndex = (activeIndex + 1) % initiative.length;
        
        // If we've wrapped around, increment the round
        const nextRound = nextIndex === 0 ? round + 1 : round;
        
        StateManager.setState('combat', {
            ...state.combat,
            activeIndex: nextIndex,
            round: nextRound
        });
        
        // Update conditions at the start of each round
        if (nextIndex === 0) {
            _updateConditions();
        }
    }
    
    /**
     * Add a new combatant to the encounter
     */
    function _addCombatant() {
        const newCombatant = {
            id: _generateId(),
            name: 'New Combatant',
            initiative: 10,
            currentHP: 10,
            maxHP: 10,
            armorClass: 10,
            conditions: [],
            notes: ''
        };
        
        StateManager.addItem('combat.initiative', newCombatant);
    }
    
    /**
     * Select a combatant for detailed view
     * @param {string} combatantId - ID of the combatant to select
     */
    function _selectCombatant(combatantId) {
        _activeCombatantId = combatantId;
        _renderCombatantDetail();
    }
    
    /**
     * Edit a combatant's details
     * @param {string} combatantId - ID of the combatant to edit
     */
    function _editCombatant(combatantId) {
        // In a real implementation, this would show a modal or form
        console.log(`Edit combatant: ${combatantId}`);
    }
    
    /**
     * Remove a combatant from combat
     * @param {string} combatantId - ID of the combatant to remove
     */
    function _removeCombatant(combatantId) {
        StateManager.removeItem('combat.initiative', combatantId);
        
        if (_activeCombatantId === combatantId) {
            _activeCombatantId = null;
        }
    }
    
    /**
     * Show dialog for healing or damaging a combatant
     * @param {string} combatantId - ID of the combatant to modify
     */
    function _showHealDamageDialog(combatantId) {
        // In a real implementation, this would show a modal or form
        console.log(`Show heal/damage dialog for: ${combatantId}`);
    }
    
    /**
     * Show dialog for adding a condition to a combatant
     * @param {string} combatantId - ID of the combatant to modify
     */
    function _showAddConditionDialog(combatantId) {
        // In a real implementation, this would show a modal or form
        console.log(`Show add condition dialog for: ${combatantId}`);
    }
    
    /**
     * Decrease the duration of a condition
     * @param {string} combatantId - ID of the combatant
     * @param {string} conditionId - ID of the condition
     */
    function _decreaseConditionDuration(combatantId, conditionId) {
        const state = StateManager.getState();
        const combatant = state.combat.initiative.find(c => c.id === combatantId);
        
        if (!combatant) return;
        
        const updatedConditions = combatant.conditions.map(condition => {
            if (condition.id === conditionId && condition.duration > 0) {
                return { ...condition, duration: condition.duration - 1 };
            }
            return condition;
        }).filter(condition => condition.duration > 0);
        
        StateManager.updateItem('combat.initiative', combatantId, {
            conditions: updatedConditions
        });
    }
    
    /**
     * Remove a condition from a combatant
     * @param {string} combatantId - ID of the combatant
     * @param {string} conditionId - ID of the condition to remove
     */
    function _removeCondition(combatantId, conditionId) {
        const state = StateManager.getState();
        const combatant = state.combat.initiative.find(c => c.id === combatantId);
        
        if (!combatant) return;
        
        const updatedConditions = combatant.conditions.filter(
            condition => condition.id !== conditionId
        );
        
        StateManager.updateItem('combat.initiative', combatantId, {
            conditions: updatedConditions
        });
    }
    
    /**
     * Update conditions at the start of a new round
     */
    function _updateConditions() {
        const state = StateManager.getState();
        
        state.combat.initiative.forEach(combatant => {
            const updatedConditions = combatant.conditions
                .map(condition => {
                    if (condition.duration > 0) {
                        return { ...condition, duration: condition.duration - 1 };
                    }
                    return condition;
                })
                .filter(condition => condition.duration > 0);
            
            if (updatedConditions.length !== combatant.conditions.length) {
                StateManager.updateItem('combat.initiative', combatant.id, {
                    conditions: updatedConditions
                });
            }
        });
    }
    
    /**
     * Save current encounter for later use
     */
    function _saveEncounter() {
        const state = StateManager.getState();
        const encounter = {
            id: _generateId(),
            name: 'Saved Encounter',
            initiative: state.combat.initiative,
            savedAt: new Date().toISOString()
        };
        
        StateManager.addItem('combat.encounters', encounter);
    }
    
    // ============================
    // 5. HELPER FUNCTIONS
    // ============================
    
    /**
     * Generate a unique ID
     * @return {string} Unique ID
     */
    function _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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
            console.error('Failed to initialize Combat Console: DOM elements not found');
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
        startCombat: _startCombat,
        endCombat: _endCombat,
        nextTurn: _nextTurn,
        render: _render
    };
})(); 