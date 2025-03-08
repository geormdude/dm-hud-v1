/**
 * Component Initializer
 * 
 * Initializes all application components when the DOM is loaded.
 * This ensures that all components are properly initialized in the correct order.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing components...');
    
    // Initialize components
    // Header is self-initializing, so we don't need to initialize it here
    
    // Initialize Story Navigator
    if (typeof StoryNavigator !== 'undefined' && StoryNavigator.init) {
        StoryNavigator.init();
        console.log('Story Navigator initialized');
    }
    
    // Initialize Character Manager
    if (typeof CharacterManager !== 'undefined' && CharacterManager.init) {
        CharacterManager.init();
        console.log('Character Manager initialized');
    }
    
    // Initialize Combat Console
    if (typeof CombatConsole !== 'undefined' && CombatConsole.init) {
        CombatConsole.init();
        console.log('Combat Console initialized');
    }
    
    // Initialize Settings
    if (typeof Settings !== 'undefined' && Settings.init) {
        Settings.init();
        console.log('Settings initialized');
    }
    
    console.log('All components initialized');
}); 