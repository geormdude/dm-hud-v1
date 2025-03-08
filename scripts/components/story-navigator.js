/**
 * Story Navigator Component
 * 
 * Manages the story navigation interface including:
 * - Plot thread listing and selection
 * - Story beat display and reveal toggling
 * - Relationship visualization
 * - Creation and management of story elements
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

const StoryNavigator = (function() {
    // ============================
    // 1. PRIVATE VARIABLES & DOM ELEMENTS
    // ============================
    
    // DOM element references
    let _elements = {
        container: null,
        threadList: null,
        beatDisplay: null,
        relationshipMap: null,
        newThreadButton: null,
        newBeatButton: null,
        threadFilter: null,
        beatSearch: null,
        revealToggle: null
    };
    
    // Track currently selected thread and beat
    let _selectedThreadId = null;
    let _selectedBeatId = null;
    
    // ============================
    // 2. DOM MANIPULATION & RENDERING
    // ============================
    
    /**
     * Cache DOM elements for later use
     */
    function _cacheDOM() {
        _elements.container = document.getElementById('story-navigator');
        
        if (!_elements.container) {
            console.error('Story Navigator container not found');
            return false;
        }
        
        _elements.threadList = document.getElementById('thread-list');
        _elements.beatDisplay = document.getElementById('beat-display');
        _elements.relationshipMap = document.getElementById('relationship-map');
        _elements.newThreadButton = _elements.container.querySelector('.new-thread-button');
        _elements.newBeatButton = _elements.container.querySelector('.new-beat-button');
        _elements.threadFilter = _elements.container.querySelector('.thread-filter');
        _elements.beatSearch = _elements.container.querySelector('.beat-search');
        _elements.revealToggle = _elements.container.querySelector('.reveal-toggle');
        
        return true;
    }
    
    /**
     * Render the entire component
     */
    function _render() {
        _renderThreadList();
        _renderBeats();
        _renderRelationships();
    }
    
    /**
     * Render the thread list based on current state
     */
    function _renderThreadList() {
        if (!_elements.threadList) return;
        
        const state = StateManager.getState();
        const threads = state.story.plotThreads;
        const showHidden = state.settings.showHiddenInfo;
        
        // Clear current list
        _elements.threadList.innerHTML = '';
        
        // Filter value (if filter is active)
        const filterValue = _elements.threadFilter ? 
            _elements.threadFilter.value.toLowerCase() : '';
        
        // Create thread items
        threads.forEach(thread => {
            // Skip hidden threads if showHidden is false
            if (!showHidden && thread.hidden) return;
            
            // Skip if doesn't match filter
            if (filterValue && !thread.name.toLowerCase().includes(filterValue)) return;
            
            const threadEl = document.createElement('div');
            threadEl.className = 'thread-item';
            threadEl.dataset.id = thread.id;
            
            if (thread.id === _selectedThreadId) {
                threadEl.classList.add('selected');
            }
            
            if (thread.hidden) {
                threadEl.classList.add('hidden');
            }
            
            if (thread.status) {
                threadEl.classList.add(`status-${thread.status.toLowerCase()}`);
            }
            
            threadEl.innerHTML = `
                <div class="thread-header">
                    <h3 class="thread-name">${thread.name}</h3>
                    <div class="thread-actions">
                        <button class="edit-thread-button" aria-label="Edit thread">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="toggle-thread-visibility" aria-label="${thread.hidden ? 'Show thread' : 'Hide thread'}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="${thread.hidden ? 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22' : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'}"></path>
                                ${!thread.hidden ? '<circle cx="12" cy="12" r="3"></circle>' : ''}
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="thread-description">${thread.description || ''}</div>
                <div class="thread-meta">
                    <span class="thread-status">${thread.status || 'Active'}</span>
                    <span class="thread-beat-count">${_countThreadBeats(thread.id)} beats</span>
                </div>
            `;
            
            _elements.threadList.appendChild(threadEl);
        });
        
        // Add empty state if no threads
        if (_elements.threadList.children.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No plot threads found${filterValue ? ' matching filter' : ''}.</p>
                <button class="new-thread-button-inline">Create your first thread</button>
            `;
            _elements.threadList.appendChild(emptyState);
        }
    }
    
    /**
     * Render the beats display based on selected thread
     */
    function _renderBeats() {
        if (!_elements.beatDisplay) return;
        
        const state = StateManager.getState();
        const beats = state.story.storyBeats;
        const showHidden = state.settings.showHiddenInfo;
        
        // Clear current display
        _elements.beatDisplay.innerHTML = '';
        
        // If no thread selected, show empty state
        if (!_selectedThreadId) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>Select a thread to view its story beats</p>';
            _elements.beatDisplay.appendChild(emptyState);
            return;
        }
        
        // Filter beats for selected thread
        const threadBeats = beats.filter(beat => 
            beat.threadId === _selectedThreadId && (showHidden || !beat.hidden)
        );
        
        // Search value (if search is active)
        const searchValue = _elements.beatSearch ? 
            _elements.beatSearch.value.toLowerCase() : '';
            
        // Filter by search if needed
        const filteredBeats = searchValue ? 
            threadBeats.filter(beat => 
                beat.title.toLowerCase().includes(searchValue) || 
                beat.content.toLowerCase().includes(searchValue)
            ) : threadBeats;
        
        // Sort beats by order
        filteredBeats.sort((a, b) => a.order - b.order);
        
        // Create beat items
        if (filteredBeats.length > 0) {
            const beatList = document.createElement('div');
            beatList.className = 'beat-list';
            
            filteredBeats.forEach(beat => {
                const beatEl = document.createElement('div');
                beatEl.className = 'beat-item';
                beatEl.dataset.id = beat.id;
                
                if (beat.id === _selectedBeatId) {
                    beatEl.classList.add('selected');
                }
                
                if (beat.hidden) {
                    beatEl.classList.add('hidden');
                }
                
                if (beat.revealed) {
                    beatEl.classList.add('revealed');
                }
                
                beatEl.innerHTML = `
                    <div class="beat-header">
                        <h4 class="beat-title">${beat.title}</h4>
                        <div class="beat-actions">
                            <button class="edit-beat-button" aria-label="Edit beat">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="toggle-beat-reveal" aria-label="${beat.revealed ? 'Hide from players' : 'Reveal to players'}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="${beat.revealed ? 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' : 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22'}"></path>
                                    ${beat.revealed ? '<circle cx="12" cy="12" r="3"></circle>' : ''}
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="beat-content">${beat.content}</div>
                    ${beat.notes ? `<div class="beat-notes">${beat.notes}</div>` : ''}
                    <div class="beat-meta">
                        ${beat.location ? `<span class="beat-location">📍 ${beat.location}</span>` : ''}
                        ${beat.characters && beat.characters.length ? 
                            `<span class="beat-characters">👥 ${beat.characters.join(', ')}</span>` : ''}
                    </div>
                `;
                
                beatList.appendChild(beatEl);
            });
            
            _elements.beatDisplay.appendChild(beatList);
        } else {
            // Empty state for no beats
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>No story beats found${searchValue ? ' matching search' : ''}.</p>
                <button class="new-beat-button-inline">Add a beat to this thread</button>
            `;
            _elements.beatDisplay.appendChild(emptyState);
        }
    }
    
    /**
     * Render the relationship map visualization
     */
    function _renderRelationships() {
        if (!_elements.relationshipMap) return;
        
        const state = StateManager.getState();
        const relationships = state.characters.relationships;
        const characters = [
            ...state.characters.playerCharacters,
            ...state.characters.npcs
        ];
        
        // Clear current map
        _elements.relationshipMap.innerHTML = '';
        
        // If no relationships or characters, show empty state
        if (relationships.length === 0 || characters.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>No character relationships to display</p>';
            _elements.relationshipMap.appendChild(emptyState);
            return;
        }
        
        // Filter relationships relevant to selected thread if one is selected
        let relevantRelationships = relationships;
        let relevantCharacterIds = new Set();
        
        if (_selectedThreadId) {
            // Get beats for this thread
            const threadBeats = state.story.storyBeats.filter(
                beat => beat.threadId === _selectedThreadId
            );
            
            // Get character IDs from these beats
            const threadCharacterIds = new Set();
            threadBeats.forEach(beat => {
                if (beat.characters && beat.characters.length) {
                    beat.characters.forEach(id => threadCharacterIds.add(id));
                }
            });
            
            // Filter relationships where both characters are in this thread
            relevantRelationships = relationships.filter(rel => 
                threadCharacterIds.has(rel.character1Id) && 
                threadCharacterIds.has(rel.character2Id)
            );
            
            // Update relevant character IDs
            relevantRelationships.forEach(rel => {
                relevantCharacterIds.add(rel.character1Id);
                relevantCharacterIds.add(rel.character2Id);
            });
        } else {
            // If no thread selected, all characters with relationships are relevant
            relationships.forEach(rel => {
                relevantCharacterIds.add(rel.character1Id);
                relevantCharacterIds.add(rel.character2Id);
            });
        }
        
        // If no relevant relationships, show empty state
        if (relevantRelationships.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>No relationships for characters in this thread</p>';
            _elements.relationshipMap.appendChild(emptyState);
            return;
        }
        
        // Create simple relationship visualization
        // In a real implementation, this would use a proper graph visualization library
        const relationshipContainer = document.createElement('div');
        relationshipContainer.className = 'relationship-container';
        
        // Create character nodes
        const characterNodes = document.createElement('div');
        characterNodes.className = 'character-nodes';
        
        const relevantCharacters = characters.filter(
            char => relevantCharacterIds.has(char.id)
        );
        
        relevantCharacters.forEach(char => {
            const charNode = document.createElement('div');
            charNode.className = 'character-node';
            charNode.dataset.id = char.id;
            charNode.classList.add(char.type || 'npc'); // PC or NPC styling
            
            charNode.innerHTML = `
                <div class="node-icon">${char.name.charAt(0)}</div>
                <div class="node-name">${char.name}</div>
            `;
            
            characterNodes.appendChild(charNode);
        });
        
        // Create relationship lines
        const relationshipLines = document.createElement('div');
        relationshipLines.className = 'relationship-lines';
        
        relevantRelationships.forEach(rel => {
            const relationshipLine = document.createElement('div');
            relationshipLine.className = 'relationship-line';
            relationshipLine.dataset.char1 = rel.character1Id;
            relationshipLine.dataset.char2 = rel.character2Id;
            relationshipLine.classList.add(`relationship-${rel.type}`);
            
            relationshipLine.innerHTML = `
                <div class="relationship-label">${rel.description || rel.type}</div>
            `;
            
            relationshipLines.appendChild(relationshipLine);
        });
        
        relationshipContainer.appendChild(characterNodes);
        relationshipContainer.appendChild(relationshipLines);
        _elements.relationshipMap.appendChild(relationshipContainer);
    }
    
    // ============================
    // 3. EVENT HANDLERS
    // ============================
    
    /**
     * Bind event listeners to DOM elements
     */
    function _bindEvents() {
        // Thread list event delegation
        if (_elements.threadList) {
            _elements.threadList.addEventListener('click', _handleThreadListClick);
        }
        
        // Beat display event delegation
        if (_elements.beatDisplay) {
            _elements.beatDisplay.addEventListener('click', _handleBeatDisplayClick);
        }
        
        // New thread button
        if (_elements.newThreadButton) {
            _elements.newThreadButton.addEventListener('click', _createNewThread);
        }
        
        // New beat button
        if (_elements.newBeatButton) {
            _elements.newBeatButton.addEventListener('click', _createNewBeat);
        }
        
        // Thread filter
        if (_elements.threadFilter) {
            _elements.threadFilter.addEventListener('input', _debounce(_renderThreadList, 300));
        }
        
        // Beat search
        if (_elements.beatSearch) {
            _elements.beatSearch.addEventListener('input', _debounce(_renderBeats, 300));
        }
        
        // Reveal toggle
        if (_elements.revealToggle) {
            _elements.revealToggle.addEventListener('click', _toggleShowHidden);
        }
        
        // Listen for state changes
        document.addEventListener('stateChanged', _handleStateChange);
    }
    
    /**
     * Handle clicks on the thread list
     * @param {Event} e - Click event
     */
    function _handleThreadListClick(e) {
        const threadItem = e.target.closest('.thread-item');
        
        // Handle thread selection
        if (threadItem && !e.target.closest('button')) {
            const threadId = threadItem.dataset.id;
            _selectThread(threadId);
            return;
        }
        
        // Handle edit thread button
        if (e.target.closest('.edit-thread-button')) {
            const threadId = e.target.closest('.thread-item').dataset.id;
            _editThread(threadId);
            return;
        }
        
        // Handle visibility toggle
        if (e.target.closest('.toggle-thread-visibility')) {
            const threadId = e.target.closest('.thread-item').dataset.id;
            _toggleThreadVisibility(threadId);
            return;
        }
        
        // Handle new thread button in empty state
        if (e.target.closest('.new-thread-button-inline')) {
            _createNewThread();
            return;
        }
    }
    
    /**
     * Handle clicks on the beat display
     * @param {Event} e - Click event
     */
    function _handleBeatDisplayClick(e) {
        const beatItem = e.target.closest('.beat-item');
        
        // Handle beat selection
        if (beatItem && !e.target.closest('button')) {
            const beatId = beatItem.dataset.id;
            _selectBeat(beatId);
            return;
        }
        
        // Handle edit beat button
        if (e.target.closest('.edit-beat-button')) {
            const beatId = e.target.closest('.beat-item').dataset.id;
            _editBeat(beatId);
            return;
        }
        
        // Handle reveal toggle
        if (e.target.closest('.toggle-beat-reveal')) {
            const beatId = e.target.closest('.beat-item').dataset.id;
            _toggleBeatReveal(beatId);
            return;
        }
        
        // Handle new beat button in empty state
        if (e.target.closest('.new-beat-button-inline')) {
            _createNewBeat();
            return;
        }
    }
    
    /**
     * Handle state changes from the state manager
     * @param {CustomEvent} e - State change event
     */
    function _handleStateChange(e) {
        const { path } = e.detail;
        
        // Only update if relevant state has changed
        if (
            path.startsWith('story.plotThreads') || 
            path.startsWith('story.storyBeats') || 
            path.startsWith('characters.relationships') ||
            path.startsWith('characters.playerCharacters') ||
            path.startsWith('characters.npcs') ||
            path.startsWith('settings.showHiddenInfo')
        ) {
            _render();
        }
    }
    
    // ============================
    // 4. STATE MANAGEMENT
    // ============================
    
    /**
     * Select a thread and update the state
     * @param {string} threadId - ID of the thread to select
     */
    function _selectThread(threadId) {
        _selectedThreadId = threadId;
        _selectedBeatId = null; // Clear beat selection when thread changes
        
        // Update UI
        _renderThreadList();
        _renderBeats();
        _renderRelationships();
    }
    
    /**
     * Select a beat and update the state
     * @param {string} beatId - ID of the beat to select
     */
    function _selectBeat(beatId) {
        _selectedBeatId = beatId;
        
        // Update UI
        _renderBeats();
    }
    
    /**
     * Toggle thread visibility
     * @param {string} threadId - ID of the thread to toggle
     */
    function _toggleThreadVisibility(threadId) {
        const state = StateManager.getState();
        const thread = state.story.plotThreads.find(t => t.id === threadId);
        
        if (thread) {
            StateManager.updateItem('story.plotThreads', threadId, {
                hidden: !thread.hidden
            });
        }
    }
    
    /**
     * Toggle beat reveal status
     * @param {string} beatId - ID of the beat to toggle
     */
    function _toggleBeatReveal(beatId) {
        const state = StateManager.getState();
        const beat = state.story.storyBeats.find(b => b.id === beatId);
        
        if (beat) {
            StateManager.updateItem('story.storyBeats', beatId, {
                revealed: !beat.revealed
            });
        }
    }
    
    /**
     * Toggle showing hidden elements
     */
    function _toggleShowHidden() {
        const state = StateManager.getState();
        StateManager.setState('settings.showHiddenInfo', !state.settings.showHiddenInfo);
    }
    
    /**
     * Create a new thread
     */
    function _createNewThread() {
        // In a real implementation, this would show a modal or form
        // For now, we'll create a simple thread with default values
        
        const newThread = {
            id: _generateId(),
            name: 'New Thread',
            description: 'Description of this plot thread',
            status: 'Active',
            hidden: false,
            createdAt: new Date().toISOString()
        };
        
        StateManager.addItem('story.plotThreads', newThread);
        
        // Select the new thread
        _selectThread(newThread.id);
    }
    
    /**
     * Edit an existing thread
     * @param {string} threadId - ID of the thread to edit
     */
    function _editThread(threadId) {
        // In a real implementation, this would show a modal or form with the thread data
        console.log(`Edit thread: ${threadId}`);
    }
    
    /**
     * Create a new beat in the selected thread
     */
    function _createNewBeat() {
        // Ensure a thread is selected
        if (!_selectedThreadId) {
            console.error('Cannot create beat: No thread selected');
            return;
        }
        
        // Get the current highest order for beats in this thread
        const state = StateManager.getState();
        const threadBeats = state.story.storyBeats.filter(
            beat => beat.threadId === _selectedThreadId
        );
        
        const highestOrder = threadBeats.length > 0 ?
            Math.max(...threadBeats.map(beat => beat.order)) : 0;
        
        // Create new beat
        const newBeat = {
            id: _generateId(),
            threadId: _selectedThreadId,
            title: 'New Story Beat',
            content: 'Description of what happens in this beat',
            notes: 'DM notes (not shown to players)',
            order: highestOrder + 10, // Leave space between beats
            revealed: false,
            hidden: false,
            characters: [],
            location: '',
            createdAt: new Date().toISOString()
        };
        
        StateManager.addItem('story.storyBeats', newBeat);
        
        // Select the new beat
        _selectBeat(newBeat.id);
    }
    
    /**
     * Edit an existing beat
     * @param {string} beatId - ID of the beat to edit
     */
    function _editBeat(beatId) {
        // In a real implementation, this would show a modal or form with the beat data
        console.log(`Edit beat: ${beatId}`);
    }
    
    // ============================
    // 5. HELPER FUNCTIONS
    // ============================
    
    /**
     * Count the number of beats in a thread
     * @param {string} threadId - ID of the thread
     * @return {number} Number of beats
     */
    function _countThreadBeats(threadId) {
        const state = StateManager.getState();
        return state.story.storyBeats.filter(beat => beat.threadId === threadId).length;
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
            console.error('Failed to initialize Story Navigator: DOM elements not found');
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
        selectThread: _selectThread,
        selectBeat: _selectBeat,
        createNewThread: _createNewThread,
        createNewBeat: _createNewBeat,
        render: _render
    };
})(); 