/**
 * DM HUD Test Runner
 * 
 * A utility script to help execute and track manual tests for the DM HUD application.
 * This script provides a simple interface for running through test cases and recording results.
 */

const TestRunner = (function() {
    // Track test results
    const testResults = {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        results: {}
    };

    // DOM elements
    let elements = {
        container: null,
        testList: null,
        resultsSummary: null,
        exportButton: null
    };

    // Test categories from TESTING_CHECKLIST.md
    const testCategories = [
        {
            name: "State Initialization and Persistence",
            tests: [
                { id: "init-default-state", name: "Application initializes with default state when no saved state exists" },
                { id: "init-ui-render", name: "All UI components render correctly with default state" },
                { id: "init-campaign-defaults", name: "Default campaign name and settings are applied" },
                { id: "state-auto-save", name: "State is automatically saved to localStorage at configured intervals" },
                { id: "state-manual-save", name: "Manual save functionality works via UI controls" },
                { id: "state-timestamp", name: "Saved timestamp updates correctly in UI" },
                { id: "state-refresh", name: "Application recovers state correctly after page refresh" },
                { id: "state-persistence", name: "State persists correctly between browser sessions" },
                { id: "state-large-objects", name: "Large state objects don't cause performance issues" },
                { id: "state-get-complete", name: "StateManager.getState() returns correct complete state" },
                { id: "state-get-nested", name: "StateManager.getState('path.to.property') returns correct nested properties" },
                { id: "state-set", name: "StateManager.setState() correctly updates specified properties" },
                { id: "state-ui-updates", name: "State changes trigger appropriate UI updates" },
                { id: "state-array-ops", name: "Array operations (addItem, updateItem, removeItem) function correctly" },
                { id: "state-events", name: "State change events are properly dispatched to components" }
            ]
        },
        {
            name: "Component Testing",
            tests: [
                // Story Navigator
                { id: "story-thread-create", name: "Story Navigator: Thread creation works correctly" },
                { id: "story-thread-edit", name: "Story Navigator: Thread editing works correctly" },
                { id: "story-beat-manage", name: "Story Navigator: Beat management functions properly" },
                { id: "story-relationship", name: "Story Navigator: Relationship visualization works" },
                { id: "story-persistence", name: "Story Navigator: State persists correctly" },
                
                // Character Manager
                { id: "char-pc-create", name: "Character Manager: PC creation works correctly" },
                { id: "char-npc-create", name: "Character Manager: NPC creation works correctly" },
                { id: "char-edit", name: "Character Manager: Character editing functions properly" },
                { id: "char-relationship", name: "Character Manager: Relationship management works" },
                { id: "char-filter-sort", name: "Character Manager: Filtering and sorting work correctly" },
                
                // Combat Console
                { id: "combat-initiative", name: "Combat Console: Initiative tracking works correctly" },
                { id: "combat-turn", name: "Combat Console: Turn management functions properly" },
                { id: "combat-condition", name: "Combat Console: Condition tracking works" },
                { id: "combat-save", name: "Combat Console: Encounter saving works correctly" }
            ]
        },
        {
            name: "UI Testing",
            tests: [
                { id: "ui-state-chrome", name: "State Persistence in Chrome" },
                { id: "ui-state-firefox", name: "State Persistence in Firefox" },
                { id: "ui-state-safari", name: "State Persistence in Safari" },
                { id: "ui-state-edge", name: "State Persistence in Edge" },
                
                { id: "ui-tab-chrome", name: "Tab Navigation in Chrome" },
                { id: "ui-tab-firefox", name: "Tab Navigation in Firefox" },
                { id: "ui-tab-safari", name: "Tab Navigation in Safari" },
                { id: "ui-tab-edge", name: "Tab Navigation in Edge" },
                
                { id: "ui-focus-chrome", name: "Focus Mode in Chrome" },
                { id: "ui-focus-firefox", name: "Focus Mode in Firefox" },
                { id: "ui-focus-safari", name: "Focus Mode in Safari" },
                { id: "ui-focus-edge", name: "Focus Mode in Edge" },
                
                { id: "ui-import-chrome", name: "Import/Export in Chrome" },
                { id: "ui-import-firefox", name: "Import/Export in Firefox" },
                { id: "ui-import-safari", name: "Import/Export in Safari" },
                { id: "ui-import-edge", name: "Import/Export in Edge" },
                
                { id: "ui-responsive-chrome", name: "Responsive Layout in Chrome" },
                { id: "ui-responsive-firefox", name: "Responsive Layout in Firefox" },
                { id: "ui-responsive-safari", name: "Responsive Layout in Safari" },
                { id: "ui-responsive-edge", name: "Responsive Layout in Edge" }
            ]
        }
    ];

    /**
     * Initialize the test runner
     */
    function init() {
        // Create test runner UI
        createTestRunnerUI();
        
        // Bind events
        bindEvents();
        
        console.log("Test Runner initialized");
    }

    /**
     * Create the test runner UI
     */
    function createTestRunnerUI() {
        // Create container
        const container = document.createElement('div');
        container.id = 'test-runner';
        container.className = 'test-runner';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .test-runner {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                max-height: 80vh;
                background: #2a2a2a;
                color: #eee;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                overflow: auto;
                font-family: Arial, sans-serif;
                padding: 15px;
            }
            .test-runner h2 {
                margin-top: 0;
                border-bottom: 1px solid #444;
                padding-bottom: 10px;
            }
            .test-runner h3 {
                margin: 15px 0 5px;
            }
            .test-category {
                margin-bottom: 15px;
            }
            .test-item {
                display: flex;
                align-items: center;
                padding: 5px 0;
                border-bottom: 1px solid #333;
            }
            .test-name {
                flex-grow: 1;
            }
            .test-actions {
                display: flex;
                gap: 5px;
            }
            .test-actions button {
                background: #444;
                border: none;
                color: #fff;
                padding: 3px 8px;
                border-radius: 3px;
                cursor: pointer;
            }
            .test-actions button:hover {
                background: #555;
            }
            .test-actions button.pass {
                background: #2a6b2a;
            }
            .test-actions button.fail {
                background: #6b2a2a;
            }
            .test-actions button.skip {
                background: #6b6b2a;
            }
            .test-summary {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #444;
            }
            .test-summary button {
                background: #444;
                border: none;
                color: #fff;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                margin-top: 10px;
            }
            .test-summary button:hover {
                background: #555;
            }
            .test-status {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 10px;
            }
            .test-status.pass {
                background: #2a6b2a;
            }
            .test-status.fail {
                background: #6b2a2a;
            }
            .test-status.skip {
                background: #6b6b2a;
            }
            .test-status.pending {
                background: #444;
            }
            .test-runner-controls {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
            }
            .test-runner-controls button {
                background: #444;
                border: none;
                color: #fff;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
            }
            .test-runner-controls button:hover {
                background: #555;
            }
            .minimize-button {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #ccc;
                cursor: pointer;
                font-size: 18px;
            }
        `;
        document.head.appendChild(style);
        
        // Create header
        const header = document.createElement('div');
        header.className = 'test-runner-header';
        
        const title = document.createElement('h2');
        title.textContent = 'DM HUD Test Runner';
        header.appendChild(title);
        
        const minimizeButton = document.createElement('button');
        minimizeButton.className = 'minimize-button';
        minimizeButton.textContent = '−';
        minimizeButton.title = 'Minimize';
        minimizeButton.setAttribute('data-action', 'minimize');
        header.appendChild(minimizeButton);
        
        container.appendChild(header);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'test-runner-controls';
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All Tests';
        resetButton.setAttribute('data-action', 'reset-all');
        controls.appendChild(resetButton);
        
        const runAllButton = document.createElement('button');
        runAllButton.textContent = 'Run All Tests';
        runAllButton.setAttribute('data-action', 'run-all');
        controls.appendChild(runAllButton);
        
        container.appendChild(controls);
        
        // Create test list
        const testList = document.createElement('div');
        testList.className = 'test-list';
        
        // Add test categories and tests
        testCategories.forEach(category => {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'test-category';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.name;
            categoryEl.appendChild(categoryTitle);
            
            // Add tests
            category.tests.forEach(test => {
                const testItem = document.createElement('div');
                testItem.className = 'test-item';
                testItem.setAttribute('data-test-id', test.id);
                
                const testStatus = document.createElement('span');
                testStatus.className = 'test-status pending';
                testItem.appendChild(testStatus);
                
                const testName = document.createElement('span');
                testName.className = 'test-name';
                testName.textContent = test.name;
                testItem.appendChild(testName);
                
                const testActions = document.createElement('div');
                testActions.className = 'test-actions';
                
                const passButton = document.createElement('button');
                passButton.className = 'pass';
                passButton.textContent = 'Pass';
                passButton.setAttribute('data-action', 'pass');
                passButton.setAttribute('data-test-id', test.id);
                testActions.appendChild(passButton);
                
                const failButton = document.createElement('button');
                failButton.className = 'fail';
                failButton.textContent = 'Fail';
                failButton.setAttribute('data-action', 'fail');
                failButton.setAttribute('data-test-id', test.id);
                testActions.appendChild(failButton);
                
                const skipButton = document.createElement('button');
                skipButton.className = 'skip';
                skipButton.textContent = 'Skip';
                skipButton.setAttribute('data-action', 'skip');
                skipButton.setAttribute('data-test-id', test.id);
                testActions.appendChild(skipButton);
                
                testItem.appendChild(testActions);
                categoryEl.appendChild(testItem);
                
                // Initialize test result
                testResults.results[test.id] = {
                    id: test.id,
                    name: test.name,
                    category: category.name,
                    status: 'pending',
                    notes: ''
                };
                testResults.total++;
            });
            
            testList.appendChild(categoryEl);
        });
        
        container.appendChild(testList);
        
        // Create summary
        const summary = document.createElement('div');
        summary.className = 'test-summary';
        
        const summaryTitle = document.createElement('h3');
        summaryTitle.textContent = 'Test Summary';
        summary.appendChild(summaryTitle);
        
        const summaryContent = document.createElement('div');
        summaryContent.className = 'summary-content';
        summaryContent.innerHTML = `
            <p>Total: ${testResults.total}</p>
            <p>Passed: ${testResults.passed}</p>
            <p>Failed: ${testResults.failed}</p>
            <p>Skipped: ${testResults.skipped}</p>
            <p>Pending: ${testResults.total - testResults.passed - testResults.failed - testResults.skipped}</p>
        `;
        summary.appendChild(summaryContent);
        
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export Results';
        exportButton.setAttribute('data-action', 'export');
        summary.appendChild(exportButton);
        
        container.appendChild(summary);
        
        // Add to document
        document.body.appendChild(container);
        
        // Cache elements
        elements.container = container;
        elements.testList = testList;
        elements.resultsSummary = summaryContent;
        elements.exportButton = exportButton;
    }

    /**
     * Bind events to the test runner UI
     */
    function bindEvents() {
        elements.container.addEventListener('click', function(e) {
            const action = e.target.getAttribute('data-action');
            const testId = e.target.getAttribute('data-test-id');
            
            if (!action) return;
            
            switch (action) {
                case 'pass':
                    markTest(testId, 'pass');
                    break;
                case 'fail':
                    markTest(testId, 'fail');
                    break;
                case 'skip':
                    markTest(testId, 'skip');
                    break;
                case 'reset-all':
                    resetAllTests();
                    break;
                case 'run-all':
                    runAllTests();
                    break;
                case 'export':
                    exportResults();
                    break;
                case 'minimize':
                    toggleMinimize();
                    break;
            }
        });
    }

    /**
     * Mark a test with the given status
     */
    function markTest(testId, status) {
        // Update test result
        const oldStatus = testResults.results[testId].status;
        testResults.results[testId].status = status;
        
        // Update counters
        if (oldStatus === 'pass') testResults.passed--;
        if (oldStatus === 'fail') testResults.failed--;
        if (oldStatus === 'skip') testResults.skipped--;
        
        if (status === 'pass') testResults.passed++;
        if (status === 'fail') testResults.failed++;
        if (status === 'skip') testResults.skipped++;
        
        // Update UI
        const testItem = elements.testList.querySelector(`[data-test-id="${testId}"]`);
        const testStatus = testItem.querySelector('.test-status');
        
        testStatus.className = `test-status ${status}`;
        
        // Update summary
        updateSummary();
    }

    /**
     * Reset all tests to pending
     */
    function resetAllTests() {
        // Reset counters
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.skipped = 0;
        
        // Reset test results
        Object.keys(testResults.results).forEach(testId => {
            testResults.results[testId].status = 'pending';
            testResults.results[testId].notes = '';
        });
        
        // Update UI
        const testStatuses = elements.testList.querySelectorAll('.test-status');
        testStatuses.forEach(status => {
            status.className = 'test-status pending';
        });
        
        // Update summary
        updateSummary();
    }

    /**
     * Run all tests (placeholder for future automation)
     */
    function runAllTests() {
        alert('This is a manual test runner. Please run each test manually and mark the results.');
    }

    /**
     * Update the summary display
     */
    function updateSummary() {
        elements.resultsSummary.innerHTML = `
            <p>Total: ${testResults.total}</p>
            <p>Passed: ${testResults.passed}</p>
            <p>Failed: ${testResults.failed}</p>
            <p>Skipped: ${testResults.skipped}</p>
            <p>Pending: ${testResults.total - testResults.passed - testResults.failed - testResults.skipped}</p>
        `;
    }

    /**
     * Export test results as JSON
     */
    function exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            summary: {
                total: testResults.total,
                passed: testResults.passed,
                failed: testResults.failed,
                skipped: testResults.skipped,
                pending: testResults.total - testResults.passed - testResults.failed - testResults.skipped
            },
            tests: Object.values(testResults.results)
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dmhud-test-results-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /**
     * Toggle minimize state of the test runner
     */
    function toggleMinimize() {
        const container = elements.container;
        const button = container.querySelector('.minimize-button');
        
        if (container.classList.contains('minimized')) {
            container.classList.remove('minimized');
            button.textContent = '−';
            button.title = 'Minimize';
            
            // Show all elements except header
            Array.from(container.children).forEach(child => {
                if (!child.classList.contains('test-runner-header')) {
                    child.style.display = '';
                }
            });
        } else {
            container.classList.add('minimized');
            button.textContent = '+';
            button.title = 'Expand';
            
            // Hide all elements except header
            Array.from(container.children).forEach(child => {
                if (!child.classList.contains('test-runner-header')) {
                    child.style.display = 'none';
                }
            });
            
            // Adjust container size
            container.style.height = 'auto';
        }
    }

    // Public API
    return {
        init: init
    };
})();

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure the main app is loaded
    setTimeout(function() {
        TestRunner.init();
    }, 1000);
}); 