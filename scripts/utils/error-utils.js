/**
 * Error Utilities Module
 * 
 * Provides error handling and logging functionality for the application.
 * Centralizes error handling to make debugging easier.
 */

const ErrorUtils = (function() {
    // Log levels
    const LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };
    
    // Current log level (can be changed in settings)
    let currentLogLevel = LOG_LEVELS.INFO;
    
    // Maximum number of errors to store
    const MAX_ERROR_HISTORY = 50;
    
    // Error history
    let errorHistory = [];
    
    /**
     * Set the current log level
     * @param {string} level - The log level to set
     */
    function setLogLevel(level) {
        if (LOG_LEVELS[level] !== undefined) {
            currentLogLevel = LOG_LEVELS[level];
            console.log(`Log level set to ${level}`);
        } else {
            console.warn(`Invalid log level: ${level}`);
        }
    }
    
    /**
     * Log a message at the specified level
     * @param {string} level - The log level
     * @param {string} message - The message to log
     * @param {*} [data] - Additional data to log
     */
    function log(level, message, data) {
        if (LOG_LEVELS[level] >= currentLogLevel) {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] [${level}] ${message}`;
            
            switch (level) {
                case 'DEBUG':
                    console.debug(logMessage, data || '');
                    break;
                case 'INFO':
                    console.info(logMessage, data || '');
                    break;
                case 'WARN':
                    console.warn(logMessage, data || '');
                    break;
                case 'ERROR':
                    console.error(logMessage, data || '');
                    // Store error in history
                    addToErrorHistory(message, data);
                    break;
                default:
                    console.log(logMessage, data || '');
            }
        }
    }
    
    /**
     * Add an error to the error history
     * @param {string} message - The error message
     * @param {*} [data] - Additional error data
     */
    function addToErrorHistory(message, data) {
        const error = {
            timestamp: new Date().toISOString(),
            message: message,
            data: data,
            stack: new Error().stack
        };
        
        // Add to beginning of array
        errorHistory.unshift(error);
        
        // Limit size of error history
        if (errorHistory.length > MAX_ERROR_HISTORY) {
            errorHistory.pop();
        }
    }
    
    /**
     * Get the error history
     * @return {Array} The error history
     */
    function getErrorHistory() {
        return [...errorHistory];
    }
    
    /**
     * Clear the error history
     */
    function clearErrorHistory() {
        errorHistory = [];
        log('INFO', 'Error history cleared');
    }
    
    /**
     * Handle an error
     * @param {Error|string} error - The error to handle
     * @param {string} [context] - The context in which the error occurred
     */
    function handleError(error, context = '') {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorData = error instanceof Error ? { stack: error.stack } : null;
        
        log('ERROR', `${context ? `[${context}] ` : ''}${errorMessage}`, errorData);
        
        // You could add additional error handling here, such as displaying a notification
        if (typeof UIUtils !== 'undefined' && UIUtils.showNotification) {
            UIUtils.showNotification(`Error: ${errorMessage}`, 'error');
        }
    }
    
    /**
     * Create a safe version of a function that catches and handles errors
     * @param {Function} fn - The function to make safe
     * @param {string} [context] - The context for error handling
     * @return {Function} A safe version of the function
     */
    function makeSafe(fn, context = '') {
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                handleError(error, context);
                return null;
            }
        };
    }
    
    // Public API
    return {
        // Log level constants
        LOG_LEVELS,
        
        // Logging functions
        setLogLevel,
        debug: (message, data) => log('DEBUG', message, data),
        info: (message, data) => log('INFO', message, data),
        warn: (message, data) => log('WARN', message, data),
        error: (message, data) => log('ERROR', message, data),
        
        // Error handling
        handleError,
        makeSafe,
        
        // Error history
        getErrorHistory,
        clearErrorHistory
    };
})(); 