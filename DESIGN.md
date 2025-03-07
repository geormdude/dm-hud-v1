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
  activeTab: 'storyNavigator',
  focusMode: false,
  
  // Story state
  campaign: { /* campaign data */ },
  plotThreads: [ /* array of threads */ ],
  storyBeats: [ /* array of story beats */ ],
  
  // Character state
  playerCharacters: [ /* array of PCs */ ],
  npcs: [ /* array of NPCs */ ],
  relationships: [ /* array of relationships */ ],
  
  // Combat state
  inCombat: false,
  currentEncounter: { /* encounter data */ },
  initiative: [ /* array of combatants */ ],
  round: 0,
  activeIndex: -1
}
```

### Update Pattern

All state updates flow through the state manager's `update()` method:

```javascript
StateManager.update('path.to.property', newValue);
```

Components observe state changes through event listeners:

```javascript
document.addEventListener('stateChanged', (e) => {
  if (e.detail.path.startsWith('propertyPrefix')) {
    this.render();
  }
});
```

## Component Structure

Each component follows a consistent pattern:

1. **Initialization**: Setup and initial render
2. **DOM Caching**: Store references to DOM elements
3. **Event Binding**: Attach event listeners
4. **Rendering**: Update DOM based on current state
5. **Action Methods**: Handle user interactions

### Component Communication

Components communicate exclusively through the state manager:

1. Component A updates state via `StateManager.update()`
2. State manager emits `stateChanged` event
3. Component B receives event and re-renders

## Data Persistence

Application state is periodically saved to local storage and loaded on startup:

```javascript
// Save state
localStorage.setItem('dmHudState', JSON.stringify(state));

// Load state
const savedState = localStorage.getItem('dmHudState');
if (savedState) {
  state = JSON.parse(savedState);
}
```

## UI Design Decisions

### Layout Structure

- Tab-based navigation for major components
- Card-based UI for story and character elements
- List-based UI for combat tracking
- Context-specific panels that appear when needed

### Visual Hierarchy

- Primary information: Large, prominent placement
- Secondary information: Smaller, collapsible sections
- Contextual actions: Adjacent to relevant content
- Global actions: Fixed position in header/footer

### Color System

- Background: Dark, low-contrast for eye comfort
- Text: High contrast for readability
- Status indicators: Color-coded (green/yellow/red)
- Relationship indicators: Color-coded (blue/gray/red)
- Selection highlights: Distinct accent color

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
