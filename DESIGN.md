# DM HUD Design Document

## Architecture Overview

The DM HUD is a client-side web application built with vanilla JavaScript following component-based architecture. It's designed to help Dungeon Masters manage game sessions with minimal cognitive load.

### Core Principles

1. **Cognitive Optimization**: UI designed to reduce mental load during gameplay
2. **Component Isolation**: Each module functions independently with clear interfaces
3. **Centralized State**: Single source of truth for all application data
4. **Persistence**: Local storage for saving between sessions
5. **No Dependencies**: Zero external libraries for maximum control and simplicity

## State Management

### State Structure

The application uses a centralized state manager with immutable update patterns:

```javascript
{
  // UI state
  ui: {
    activeTab: 'story',
    focusMode: false,
    theme: 'dark',
    panelSizes: {
      story: { threadList: 25, beatDisplay: 50, relationshipMap: 25 },
      characters: { characterList: 25, npcList: 25, characterDetail: 50 },
      combat: { combatControls: 20, initiativeList: 30, combatDetail: 50 }
    },
    lastSaved: null,
    sidebarCollapsed: false
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
    plotThreads: [ /* array of threads */ ],
    storyBeats: [ /* array of story beats */ ],
    locations: [],
    notes: []
  },
  
  // Character state
  characters: {
    playerCharacters: [ /* array of PCs */ ],
    npcs: [ /* array of NPCs */ ],
    relationships: [ /* array of relationships */ ],
    factions: []
  },
  
  // Combat state
  combat: {
    inCombat: false,
    currentEncounter: null,
    initiative: [],
    round: 0,
    activeIndex: -1,
    encounters: [],
    conditions: []
  },
  
  // Settings
  settings: {
    autosaveInterval: 60,
    confirmBeforeDelete: true,
    showHiddenInfo: false,
    diceRollerEnabled: true,
    soundEffectsEnabled: false,
    notificationsEnabled: true
  }
}
```

### State Manager API

The state manager provides the following methods for state manipulation:

```javascript
// Get state or subset of state
StateManager.getState()
StateManager.getState('path.to.property')

// Update state
StateManager.setState('path.to.property', newValue)

// Array operations
StateManager.addItem('array.path', newItem)
StateManager.updateItem('array.path', itemId, updates)
StateManager.removeItem('array.path', itemId)
```

## Component Architecture

### Common Component Pattern

Each component follows this structure:

```javascript
const ComponentName = (function() {
    // 1. Private Variables & DOM Elements
    let _elements = { /* DOM references */ };
    let _state = { /* component state */ };
    
    // 2. DOM Manipulation & Rendering
    function _cacheDOM() { /* cache DOM elements */ }
    function _render() { /* render component */ }
    
    // 3. Event Handlers
    function _bindEvents() { /* bind event listeners */ }
    function _handleEvent() { /* handle specific events */ }
    
    // 4. State Management
    function _handleStateChange() { /* handle state updates */ }
    
    // 5. Helper Functions
    function _helperFunction() { /* utility functions */ }
    
    // 6. Initialization
    function init() {
        _cacheDOM();
        _bindEvents();
        _render();
    }
    
    // 7. Public API
    return {
        init,
        // Other public methods
    };
})();
```

### Implemented Components

#### Story Navigator

- **Purpose**: Manages plot threads, story beats, and narrative flow
- **Features**:
  - Thread listing and filtering
  - Beat display with reveal toggling
  - Relationship visualization
  - Thread and beat creation/editing
- **State Paths**: `story.plotThreads`, `story.storyBeats`
- **Events**: Thread selection, beat reveal, relationship updates

#### Character Manager

- **Purpose**: Manages PCs, NPCs, and their relationships
- **Features**:
  - Separate PC and NPC lists with filtering
  - Detailed character information display
  - Character relationship management
  - Character creation and editing
- **State Paths**: `characters.playerCharacters`, `characters.npcs`, `characters.relationships`
- **Events**: Character selection, relationship updates, character updates

### Component Communication

Components communicate through the state manager using:

1. **State Updates**:

```javascript
StateManager.updateItem('characters.playerCharacters', characterId, updates);
```

2. **State Change Events**:

```javascript
document.addEventListener('stateChanged', (e) => {
    const { path } = e.detail;
    if (path.startsWith('characters.')) {
        _render();
    }
});
```

3. **DOM Events** (for direct user interactions):

```javascript
element.addEventListener('click', _handleClick);
```

## UI Implementation

### Layout Structure

```
+------------------+------------------+------------------+
|    Navigation    |     Content     |     Details     |
|                 |                 |                 |
| - Tab Selection | - Main Display  | - Detail Panel  |
| - Quick Actions | - List Views    | - Edit Forms    |
| - Filters       | - Visualizations| - Relationships |
|                 |                 |                 |
+------------------+------------------+------------------+
```

### Component-Specific UI

#### Story Navigator

- Three-panel layout: Threads → Beats → Relationships
- Card-based thread and beat display
- Relationship visualization with force-directed graph
- Inline editing capabilities

#### Character Manager

- Two-panel layout with detail sidebar
- Tabbed interface for PC/NPC switching
- Grid layout for character details
- Relationship matrix visualization

### Visual Styling

- **Color System**:

  ```css
  :root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --accent-primary: #4a9eff;
    --accent-secondary: #ff4a4a;
    --status-success: #4caf50;
    --status-warning: #ff9800;
    --status-danger: #f44336;
  }
  ```

## Development Guidelines

### Code Organization

- Components in `scripts/components/`
- State management in `scripts/state/`
- Utilities in `scripts/utils/`
- Styles in `styles/`

### Naming Conventions

- Components: PascalCase (e.g., `StoryNavigator`)
- Private methods/variables: underscore prefix (e.g., `_handleClick`)
- Event handlers: verb prefix (e.g., `handleClick`, `onStateChange`)
- CSS classes: kebab-case (e.g., `character-list`)

### Best Practices

- Use event delegation for dynamic elements
- Debounce frequent operations (filtering, saving)
- Maintain clear separation of concerns
- Document complex logic with JSDoc comments
- Follow functional programming principles where appropriate

## Future Enhancements

### Planned Features

1. Character Sheet Integration
2. Combat Tracker Enhancement
3. Map Management System
4. Timeline Visualization
5. Session Notes System

### Technical Improvements

1. State persistence optimization
2. Performance monitoring
3. Offline support
4. Data export/import
5. Undo/redo functionality

## Implementation Phases

### Phase 1: Core Infrastructure

- Basic HTML structure
- State manager implementation
- Tab navigation system
- Local storage persistence

### Phase 2: Story Navigator

- Thread list implementation
- Beat display system
- Reveal toggling
- Basic relationship visualization

### Phase 3: Character Manager

- Character/NPC lists
- Detail panel implementation
- Selection behavior
- Basic filtering

### Phase 4: Combat Console

- Initiative tracker
- Turn management
- HP/condition tracking
- Combat state toggling

### Phase 5: Integration & Refinement

- Cross-component interactions
- UI polish
- Performance optimization
- User testing feedback implementation

## Technical Decisions

### Vanilla JS Approach

We've chosen vanilla JavaScript over frameworks to:

- Minimize cognitive load in codebase
- Maintain full control over performance
- Avoid dependency management
- Simplify long-term maintenance

### Module Pattern

Components use the revealing module pattern for:

- Private/public method separation
- Clean interface definition
- Encapsulation of internal workings
- Prevention of global namespace pollution

### Event-Driven Architecture

The application uses custom events for:

- Loose coupling between components
- Simplified testing and debugging
- Extensibility for future features
- Predictable data flow

## Performance Considerations

- DOM manipulation minimized through targeted updates
- Event delegation for dynamic elements
- Throttled save operations
- Lazy initialization of inactive components
- Efficient data structures for quick lookups

## Future Considerations

- Export/import functionality for campaign data
- Dice roller integration
- Timeline visualization enhancements
- Map integration
- Rules reference system
- Optional cloud sync

## Development Guidelines

- Test changes in isolation before integration
- Document state structure changes in comments
- Maintain backward compatibility with saved states
- Follow the established component pattern
- Use descriptive commit messages referencing features
