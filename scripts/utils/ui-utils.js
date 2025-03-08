/**
 * UI Utilities
 * 
 * Provides utility functions for UI manipulation and interaction.
 */

const UIUtils = (function() {
    /**
     * Create an element with attributes and children
     * @param {string} tag - The tag name
     * @param {object} attributes - The attributes to set
     * @param {Array|string|Element} children - The children to append
     * @returns {Element} The created element
     */
    function createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        for (const key in attributes) {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'style' && typeof attributes[key] === 'object') {
                Object.assign(element.style, attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        }
        
        // Append children
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (child) {
                    element.appendChild(
                        typeof child === 'string' ? document.createTextNode(child) : child
                    );
                }
            });
        } else if (children) {
            element.appendChild(
                typeof children === 'string' ? document.createTextNode(children) : children
            );
        }
        
        return element;
    }
    
    /**
     * Clear all children from an element
     * @param {Element} element - The element to clear
     */
    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    
    /**
     * Show an element
     * @param {Element} element - The element to show
     */
    function showElement(element) {
        element.style.display = '';
    }
    
    /**
     * Hide an element
     * @param {Element} element - The element to hide
     */
    function hideElement(element) {
        element.style.display = 'none';
    }
    
    /**
     * Toggle an element's visibility
     * @param {Element} element - The element to toggle
     * @returns {boolean} Whether the element is now visible
     */
    function toggleElement(element) {
        const isHidden = element.style.display === 'none';
        element.style.display = isHidden ? '' : 'none';
        return isHidden;
    }
    
    /**
     * Add a class to an element
     * @param {Element} element - The element to add the class to
     * @param {string} className - The class to add
     */
    function addClass(element, className) {
        element.classList.add(className);
    }
    
    /**
     * Remove a class from an element
     * @param {Element} element - The element to remove the class from
     * @param {string} className - The class to remove
     */
    function removeClass(element, className) {
        element.classList.remove(className);
    }
    
    /**
     * Toggle a class on an element
     * @param {Element} element - The element to toggle the class on
     * @param {string} className - The class to toggle
     * @returns {boolean} Whether the class is now present
     */
    function toggleClass(element, className) {
        return element.classList.toggle(className);
    }
    
    /**
     * Create a modal dialog
     * @param {string} title - The modal title
     * @param {string|Element} content - The modal content
     * @param {Array} buttons - The modal buttons
     * @returns {Element} The modal element
     */
    function createModal(title, content, buttons = []) {
        // Create modal container
        const modal = createElement('div', { className: 'modal' });
        
        // Create modal content
        const modalContent = createElement('div', { className: 'modal-content' });
        
        // Create modal header
        const modalHeader = createElement('div', { className: 'modal-header' });
        const modalTitle = createElement('h2', {}, title);
        const closeButton = createElement('button', { className: 'modal-close' }, '×');
        closeButton.addEventListener('click', () => modal.remove());
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // Create modal body
        const modalBody = createElement('div', { className: 'modal-body' });
        if (typeof content === 'string') {
            modalBody.innerHTML = content;
        } else {
            modalBody.appendChild(content);
        }
        
        // Create modal footer
        const modalFooter = createElement('div', { className: 'modal-footer' });
        
        // Add buttons
        buttons.forEach(button => {
            const btn = createElement('button', { className: `modal-button ${button.className || ''}` }, button.text);
            btn.addEventListener('click', () => {
                if (button.action) {
                    button.action();
                }
                if (button.closeModal !== false) {
                    modal.remove();
                }
            });
            modalFooter.appendChild(btn);
        });
        
        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        // Add to document
        document.body.appendChild(modal);
        
        return modal;
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - The function to call when confirmed
     * @param {Function} onCancel - The function to call when cancelled
     * @returns {Element} The modal element
     */
    function confirm(message, onConfirm, onCancel) {
        return createModal('Confirm', message, [
            {
                text: 'Cancel',
                className: 'modal-button-secondary',
                action: onCancel
            },
            {
                text: 'Confirm',
                className: 'modal-button-primary',
                action: onConfirm
            }
        ]);
    }
    
    /**
     * Show an alert dialog
     * @param {string} message - The alert message
     * @param {Function} onClose - The function to call when closed
     * @returns {Element} The modal element
     */
    function alert(message, onClose) {
        return createModal('Alert', message, [
            {
                text: 'OK',
                className: 'modal-button-primary',
                action: onClose
            }
        ]);
    }
    
    /**
     * Show a prompt dialog
     * @param {string} message - The prompt message
     * @param {string} defaultValue - The default value
     * @param {Function} onSubmit - The function to call when submitted
     * @param {Function} onCancel - The function to call when cancelled
     * @returns {Element} The modal element
     */
    function prompt(message, defaultValue, onSubmit, onCancel) {
        const input = createElement('input', {
            type: 'text',
            value: defaultValue || '',
            className: 'modal-input'
        });
        
        const content = createElement('div', {}, [
            createElement('p', {}, message),
            input
        ]);
        
        return createModal('Prompt', content, [
            {
                text: 'Cancel',
                className: 'modal-button-secondary',
                action: onCancel
            },
            {
                text: 'OK',
                className: 'modal-button-primary',
                action: () => onSubmit(input.value)
            }
        ]);
    }
    
    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds
     * @param {Function} func - The function to debounce
     * @param {number} wait - The number of milliseconds to delay
     * @param {boolean} immediate - Whether to invoke the function immediately
     * @return {Function} The debounced function
     */
    function debounce(func, wait, immediate = false) {
        let timeout;
        
        return function executedFunction(...args) {
            const context = this;
            
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            
            const callNow = immediate && !timeout;
            
            clearTimeout(timeout);
            
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(context, args);
        };
    }
    
    /**
     * Creates a throttled function that only invokes func at most once per every wait milliseconds
     * @param {Function} func - The function to throttle
     * @param {number} wait - The number of milliseconds to wait between invocations
     * @return {Function} The throttled function
     */
    function throttle(func, wait) {
        let lastFunc;
        let lastRan;
        
        return function executedFunction(...args) {
            const context = this;
            
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= wait) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, wait - (Date.now() - lastRan));
            }
        };
    }
    
    // Public API
    return {
        createElement,
        clearElement,
        showElement,
        hideElement,
        toggleElement,
        addClass,
        removeClass,
        toggleClass,
        createModal,
        confirm,
        alert,
        prompt,
        debounce,
        throttle
    };
})();

console.log('ui-utils.js loaded'); 