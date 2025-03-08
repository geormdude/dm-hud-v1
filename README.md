# DM HUD - Dungeon Master's Heads-Up Display

A lightweight, browser-based tool designed to help Dungeon Masters manage tabletop RPG sessions with minimal cognitive load.

## Features

- **Story Management**: Track plot threads, story beats, and relationships
- **Character Management**: Manage player characters and NPCs
- **Combat Tracker**: Initiative tracking and combat management
- **Settings**: Customize your DM HUD experience
- **Local Storage**: All data is stored locally in your browser

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Node.js (for development)

### Installation

#### Running Locally

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dm-hud.git
   cd dm-hud
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

#### Using Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/dm-hud.git
   cd dm-hud
   ```

2. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Architecture

DM HUD is built with vanilla JavaScript using a component-based architecture:

- **Module Pattern**: Each component is encapsulated in a revealing module pattern
- **Event-Driven**: Components communicate through a pub/sub event system
- **Centralized State**: Single source of truth for application data
- **Local Storage**: Persistent data storage between sessions

### Project Structure

```
dm-hud/
├── assets/            # Images, icons, and other static assets
├── scripts/
│   ├── components/    # UI components
│   ├── state/         # State management
│   ├── utils/         # Utility functions
│   ├── app.js         # Main application entry point
│   └── component-initializer.js # Component initialization
├── styles/
│   ├── components/    # Component-specific styles
│   └── main.css       # Main stylesheet
├── index.html         # Main HTML file
├── server.js          # Development server
├── Dockerfile         # Docker configuration
└── docker-compose.yml # Docker Compose configuration
```

## Development

### Coding Standards

- **Module Pattern**: Use the revealing module pattern for components
- **Event-Driven**: Use the pub/sub pattern for component communication
- **Immutable State**: Never directly modify state, use state manager methods
- **Descriptive Naming**: Use clear, descriptive names for variables and functions
- **JSDoc Comments**: Document complex logic with JSDoc comments

### Component Structure

Each component should follow this structure:

1. **Initialization**: `init()` function to set up the component
2. **DOM Caching**: `cacheDOM()` function to store DOM references
3. **Event Binding**: `bindEvents()` function to attach event listeners
4. **Rendering**: `render()` function to update the UI based on state

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the needs of Dungeon Masters everywhere
- Built with vanilla JavaScript to minimize dependencies 