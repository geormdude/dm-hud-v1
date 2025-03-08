/**
 * Data Utilities
 * 
 * Provides utility functions for data manipulation and transformation.
 */

const DataUtils = (function() {
    /**
     * Generate a unique ID
     * @returns {string} A unique ID
     */
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    /**
     * Deep clone an object
     * @param {object} obj - The object to clone
     * @returns {object} A deep clone of the object
     */
    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    
    /**
     * Get a nested property from an object using a path string
     * @param {object} obj - The object to get the property from
     * @param {string} path - The path to the property (e.g. 'a.b.c')
     * @param {*} defaultValue - The default value to return if the property doesn't exist
     * @returns {*} The property value or the default value
     */
    function getNestedProperty(obj, path, defaultValue = undefined) {
        const parts = path.split('.');
        let current = obj;
        
        for (const part of parts) {
            if (current === undefined || current === null) {
                return defaultValue;
            }
            current = current[part];
        }
        
        return current !== undefined ? current : defaultValue;
    }
    
    /**
     * Set a nested property on an object using a path string
     * @param {object} obj - The object to set the property on
     * @param {string} path - The path to the property (e.g. 'a.b.c')
     * @param {*} value - The value to set
     * @returns {object} The modified object
     */
    function setNestedProperty(obj, path, value) {
        const parts = path.split('.');
        let current = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (current[part] === undefined) {
                current[part] = {};
            }
            current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
        return obj;
    }
    
    /**
     * Sort an array of objects by a property
     * @param {Array} array - The array to sort
     * @param {string} property - The property to sort by
     * @param {boolean} ascending - Whether to sort in ascending order
     * @returns {Array} The sorted array
     */
    function sortByProperty(array, property, ascending = true) {
        return [...array].sort((a, b) => {
            const aValue = getNestedProperty(a, property);
            const bValue = getNestedProperty(b, property);
            
            if (aValue < bValue) return ascending ? -1 : 1;
            if (aValue > bValue) return ascending ? 1 : -1;
            return 0;
        });
    }
    
    /**
     * Filter an array of objects by a property value
     * @param {Array} array - The array to filter
     * @param {string} property - The property to filter by
     * @param {*} value - The value to filter for
     * @returns {Array} The filtered array
     */
    function filterByProperty(array, property, value) {
        return array.filter(item => getNestedProperty(item, property) === value);
    }
    
    /**
     * Search an array of objects for a text match
     * @param {Array} array - The array to search
     * @param {string} text - The text to search for
     * @param {Array} properties - The properties to search in
     * @returns {Array} The matching items
     */
    function searchByText(array, text, properties) {
        if (!text) return array;
        
        const lowerText = text.toLowerCase();
        
        return array.filter(item => {
            return properties.some(prop => {
                const value = getNestedProperty(item, prop);
                return value && value.toString().toLowerCase().includes(lowerText);
            });
        });
    }
    
    /**
     * Creates an immutable copy of an object with updates applied
     * @param {Object} obj - The original object
     * @param {Object} updates - The updates to apply
     * @return {Object} A new object with updates applied
     */
    function immutableUpdate(obj, updates) {
        // Return a new object with the updates applied
        return { ...obj, ...updates };
    }
    
    /**
     * Creates an immutable copy of an array with an item added
     * @param {Array} array - The original array
     * @param {*} item - The item to add
     * @return {Array} A new array with the item added
     */
    function immutableArrayAdd(array, item) {
        // Return a new array with the item added
        return [...array, item];
    }
    
    /**
     * Creates an immutable copy of an array with an item updated
     * @param {Array} array - The original array
     * @param {Function} predicate - Function to identify the item to update
     * @param {Object|Function} updates - Updates to apply or function that returns updates
     * @return {Array} A new array with the item updated
     */
    function immutableArrayUpdate(array, predicate, updates) {
        // Return a new array with the item updated
        return array.map(item => {
            if (predicate(item)) {
                // If updates is a function, call it with the item
                if (typeof updates === 'function') {
                    return { ...item, ...updates(item) };
                }
                // Otherwise, apply the updates directly
                return { ...item, ...updates };
            }
            return item;
        });
    }
    
    /**
     * Creates an immutable copy of an array with an item removed
     * @param {Array} array - The original array
     * @param {Function} predicate - Function to identify the item to remove
     * @return {Array} A new array with the item removed
     */
    function immutableArrayRemove(array, predicate) {
        // Return a new array with the item removed
        return array.filter(item => !predicate(item));
    }
    
    // Public API
    return {
        generateId,
        deepClone,
        getNestedProperty,
        setNestedProperty,
        sortByProperty,
        filterByProperty,
        searchByText,
        immutableUpdate,
        immutableArrayAdd,
        immutableArrayUpdate,
        immutableArrayRemove
    };
})();

console.log('data-utils.js loaded'); 