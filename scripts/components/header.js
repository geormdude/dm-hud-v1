/**
 * Header Component
 * 
 * Manages the header navigation and tab switching functionality.
 */

const Header = (function() {
    // DOM element references
    let elements = {
        header: null,
        tabButtons: null
    };
    
    // Cleanup functions
    let cleanup = null;
    
    /**
     * Initialize the header component
     */
    function init() {
        // Cache DOM elements
        cacheDOM();
        
        // Bind events
        bindEvents();
        
        console.log('Header component initialized');
    }
    
    /**
     * Cache DOM elements for later use
     */
    function cacheDOM() {
        elements.header = document.getElementById('main-header');
        elements.tabButtons = document.querySelectorAll('.tab-button');
    }
    
    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Clean up previous event listeners
        if (cleanup) {
            cleanup();
        }
        
        // Add click event listeners to tab buttons
        const cleanupFunctions = [];
        
        elements.tabButtons.forEach(button => {
            const cleanup = EventUtils.addListener(button, 'click', handleTabClick);
            cleanupFunctions.push(cleanup);
        });
        
        // Subscribe to state changes
        const unsubscribe = EventUtils.subscribe('state:changed:ui.activeTab', updateActiveTab);
        cleanupFunctions.push(unsubscribe);
        
        // Store cleanup function
        cleanup = function() {
            cleanupFunctions.forEach(fn => fn());
        };
    }
    
    /**
     * Handle tab button click
     * @param {Event} event - The click event
     */
    function handleTabClick(event) {
        const tabName = event.currentTarget.getAttribute('data-tab');
        
        if (tabName) {
            // Update state
            StateManager.setState('ui.activeTab', tabName);
        }
    }
    
    /**
     * Update the active tab based on state
     * @param {string} activeTab - The active tab name
     */
    function updateActiveTab(activeTab) {
        // Update tab buttons
        elements.tabButtons.forEach(button => {
            const tabName = button.getAttribute('data-tab');
            
            if (tabName === activeTab) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update tab content sections
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabContents.forEach(content => {
            const sectionId = content.id;
            const tabName = sectionId.replace('-section', '');
            
            if (tabName === activeTab) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
    }
    
    /**
     * Render the header component
     */
    function render() {
        // Get active tab from state
        const activeTab = StateManager.getState('ui.activeTab');
        
        // Update active tab
        updateActiveTab(activeTab);
    }
    
    // Public API
    return {
        init,
        render
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    Header.init();
});

console.log('header.js loaded'); 