/**
 * Event Utilities
 * 
 * Provides utility functions for event handling and pub/sub pattern.
 */

const EventUtils = (function() {
    // Event subscribers
    const subscribers = {};
    
    /**
     * Subscribe to an event
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     * @returns {Function} A function to unsubscribe
     */
    function subscribe(event, callback) {
        if (!subscribers[event]) {
            subscribers[event] = [];
        }
        
        subscribers[event].push(callback);
        
        // Return unsubscribe function
        return function unsubscribe() {
            subscribers[event] = subscribers[event].filter(cb => cb !== callback);
        };
    }
    
    /**
     * Publish an event
     * @param {string} event - The event name
     * @param {*} data - The event data
     */
    function publish(event, data) {
        if (!subscribers[event]) {
            return;
        }
        
        subscribers[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
    
    /**
     * Add an event listener with automatic cleanup
     * @param {Element} element - The element to add the listener to
     * @param {string} event - The event name
     * @param {Function} handler - The event handler
     * @param {object} options - The event listener options
     * @returns {Function} A function to remove the listener
     */
    function addListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return function removeListener() {
            element.removeEventListener(event, handler, options);
        };
    }
    
    /**
     * Add multiple event listeners with automatic cleanup
     * @param {Element} element - The element to add the listeners to
     * @param {object} events - An object mapping event names to handlers
     * @param {object} options - The event listener options
     * @returns {Function} A function to remove all listeners
     */
    function addListeners(element, events, options) {
        const cleanupFunctions = [];
        
        for (const event in events) {
            const cleanup = addListener(element, event, events[event], options);
            cleanupFunctions.push(cleanup);
        }
        
        // Return cleanup function for all listeners
        return function removeAllListeners() {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }
    
    /**
     * Create a debounced function
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce wait time in milliseconds
     * @returns {Function} The debounced function
     */
    function debounce(func, wait) {
        let timeout;
        
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Create a throttled function
     * @param {Function} func - The function to throttle
     * @param {number} limit - The throttle limit in milliseconds
     * @returns {Function} The throttled function
     */
    function throttle(func, limit) {
        let inThrottle;
        
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    }
    
    // Public API
    return {
        subscribe,
        publish,
        addListener,
        addListeners,
        debounce,
        throttle
    };
})();

console.log('event-utils.js loaded'); 