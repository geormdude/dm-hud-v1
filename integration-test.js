/**
 * DM HUD Integration Test Suite
 * 
 * This script provides automated integration testing for the DM HUD application.
 * It tests interactions between components and ensures data flows correctly
 * throughout the application.
 */

const IntegrationTest = (function() {
    // Test results tracking
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
        runAllButton: null,
        exportButton: null
    };

    // Integration test cases
    const integrationTests = [
        // State and Component Integration Tests
        {
            id: "state-component-sync",
            name: "State changes propagate to all components",
            test: testStateComponentSync,
            dependencies: []
        },
        {
            id: "component-state-updates",
            name: "Component changes update global state correctly",
            test: testComponentStateUpdates,
            dependencies: ["state-component-sync"]
        },
        
        // Cross-Component Data Flow Tests
        {
            id: "character-to-combat-flow",
            name: "Character data flows correctly to combat console",
            test: testCharacterToCombatFlow,
            dependencies: ["component-state-updates"]
        },
        {
            id: "story-character-integration",
            name: "Story and character components interact correctly",
            test: testStoryCharacterIntegration,
            dependencies: ["component-state-updates"]
        },
        
        // End-to-End Workflow Tests
        {
            id: "combat-workflow",
            name: "Complete combat workflow functions correctly",
            test: testCombatWorkflow,
            dependencies: ["character-to-combat-flow"]
        },
        {
            id: "story-tracking-workflow",
            name: "Complete story tracking workflow functions correctly",
            test: testStoryTrackingWorkflow,
            dependencies: ["story-character-integration"]
        },
        
        // Persistence Tests
        {
            id: "cross-component-persistence",
            name: "Cross-component state persists correctly",
            test: testCrossComponentPersistence,
            dependencies: ["combat-workflow", "story-tracking-workflow"]
        }
    ];

    /**
     * Initialize the integration test UI
     */
    function init() {
        console.log('Integration Test: Initializing');
        
        // Create UI
        createUI();
        
        // Bind events
        bindEvents();
        
        console.log('Integration Test: Initialized');
    }
    
    /**
     * Create the integration test UI
     */
    function createUI() {
        // Create container
        const container = document.createElement('div');
        container.id = 'integration-test';
        container.className = 'integration-test';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .integration-test {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                background: #2a2a2a;
                color: #eee;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                font-family: Arial, sans-serif;
                padding: 15px;
            }
            .integration-test h3 {
                margin-top: 0;
                margin-bottom: 10px;
            }
            .integration-test button {
                background: #444;
                border: none;
                color: #fff;
                padding: 8px 12px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 8px;
                margin-bottom: 8px;
            }
            .integration-test button:hover {
                background: #555;
            }
            .integration-test-list {
                margin-top: 15px;
                max-height: 300px;
                overflow-y: auto;
            }
            .integration-test-item {
                padding: 8px;
                margin-bottom: 5px;
                border-radius: 3px;
                background: #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .integration-test-item.passed {
                border-left: 4px solid #4caf50;
            }
            .integration-test-item.failed {
                border-left: 4px solid #f44336;
            }
            .integration-test-item.skipped {
                border-left: 4px solid #ff9800;
            }
            .integration-test-item.running {
                border-left: 4px solid #2196f3;
            }
            .integration-test-results {
                margin-top: 15px;
                padding: 10px;
                background: #333;
                border-radius: 4px;
                font-family: monospace;
            }
            .integration-test-results .pass {
                color: #4caf50;
            }
            .integration-test-results .fail {
                color: #f44336;
            }
        `;
        document.head.appendChild(style);
        
        // Create header
        const header = document.createElement('h3');
        header.textContent = 'Integration Tests';
        container.appendChild(header);
        
        // Create buttons
        const buttonContainer = document.createElement('div');
        
        const runAllButton = document.createElement('button');
        runAllButton.textContent = 'Run All Tests';
        runAllButton.id = 'run-all-tests';
        buttonContainer.appendChild(runAllButton);
        
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export Results';
        exportButton.id = 'export-results';
        buttonContainer.appendChild(exportButton);
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.id = 'close-integration-test';
        buttonContainer.appendChild(closeButton);
        
        container.appendChild(buttonContainer);
        
        // Create test list
        const testList = document.createElement('div');
        testList.className = 'integration-test-list';
        
        integrationTests.forEach(test => {
            const testItem = document.createElement('div');
            testItem.className = 'integration-test-item';
            testItem.id = `test-${test.id}`;
            
            const testName = document.createElement('span');
            testName.textContent = test.name;
            testItem.appendChild(testName);
            
            const testActions = document.createElement('div');
            
            const runButton = document.createElement('button');
            runButton.textContent = 'Run';
            runButton.dataset.testId = test.id;
            runButton.className = 'run-test';
            testActions.appendChild(runButton);
            
            testItem.appendChild(testActions);
            testList.appendChild(testItem);
        });
        
        container.appendChild(testList);
        
        // Create results summary
        const resultsSummary = document.createElement('div');
        resultsSummary.className = 'integration-test-results';
        resultsSummary.textContent = 'No tests run yet.';
        container.appendChild(resultsSummary);
        
        // Add to document
        document.body.appendChild(container);
        
        // Cache elements
        elements.container = container;
        elements.testList = testList;
        elements.resultsSummary = resultsSummary;
        elements.runAllButton = runAllButton;
        elements.exportButton = exportButton;
    }
    
    /**
     * Bind events to UI elements
     */
    function bindEvents() {
        // Run all tests
        elements.runAllButton.addEventListener('click', runAllTests);
        
        // Export results
        elements.exportButton.addEventListener('click', exportResults);
        
        // Close button
        document.getElementById('close-integration-test').addEventListener('click', () => {
            elements.container.remove();
        });
        
        // Individual test run buttons
        document.querySelectorAll('.run-test').forEach(button => {
            button.addEventListener('click', (e) => {
                const testId = e.target.dataset.testId;
                runTest(testId);
            });
        });
    }
    
    /**
     * Run all integration tests
     */
    function runAllTests() {
        console.log('Integration Test: Running all tests');
        
        // Reset results
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.skipped = 0;
        testResults.total = integrationTests.length;
        testResults.results = {};
        
        // Update UI
        updateResultsSummary();
        
        // Run tests in sequence, respecting dependencies
        runTestsInSequence(integrationTests.map(test => test.id));
    }
    
    /**
     * Run tests in sequence, respecting dependencies
     * @param {Array} testIds - Array of test IDs to run
     */
    function runTestsInSequence(testIds) {
        if (testIds.length === 0) {
            console.log('Integration Test: All tests complete');
            return;
        }
        
        // Find tests that can be run (all dependencies satisfied)
        const runnableTests = testIds.filter(testId => {
            const test = integrationTests.find(t => t.id === testId);
            return test.dependencies.every(depId => 
                testResults.results[depId] && testResults.results[depId].status === 'passed'
            );
        });
        
        // If no tests can be run, some dependencies failed
        if (runnableTests.length === 0) {
            // Skip remaining tests
            testIds.forEach(testId => {
                markTestSkipped(testId, 'Dependency failed');
            });
            return;
        }
        
        // Run the first runnable test
        const testId = runnableTests[0];
        const remainingTests = testIds.filter(id => id !== testId);
        
        runTest(testId).then(() => {
            // Run remaining tests
            runTestsInSequence(remainingTests);
        });
    }
    
    /**
     * Run a single integration test
     * @param {string} testId - ID of the test to run
     * @returns {Promise} - Promise that resolves when the test is complete
     */
    async function runTest(testId) {
        console.log(`Integration Test: Running test ${testId}`);
        
        // Find the test
        const test = integrationTests.find(t => t.id === testId);
        if (!test) {
            console.error(`Integration Test: Test ${testId} not found`);
            return Promise.resolve();
        }
        
        // Check dependencies
        for (const depId of test.dependencies) {
            if (!testResults.results[depId] || testResults.results[depId].status !== 'passed') {
                markTestSkipped(testId, `Dependency ${depId} not satisfied`);
                return Promise.resolve();
            }
        }
        
        // Mark as running
        const testElement = document.getElementById(`test-${testId}`);
        testElement.className = 'integration-test-item running';
        
        try {
            // Run the test
            const result = await test.test();
            
            if (result.passed) {
                markTestPassed(testId, result.message);
            } else {
                markTestFailed(testId, result.message);
            }
        } catch (error) {
            markTestFailed(testId, `Error: ${error.message}`);
        }
        
        return Promise.resolve();
    }
    
    /**
     * Mark a test as passed
     * @param {string} testId - ID of the test
     * @param {string} message - Result message
     */
    function markTestPassed(testId, message) {
        console.log(`Integration Test: Test ${testId} passed`);
        
        // Update results
        testResults.passed++;
        testResults.results[testId] = {
            status: 'passed',
            message: message
        };
        
        // Update UI
        const testElement = document.getElementById(`test-${testId}`);
        testElement.className = 'integration-test-item passed';
        
        updateResultsSummary();
    }
    
    /**
     * Mark a test as failed
     * @param {string} testId - ID of the test
     * @param {string} message - Error message
     */
    function markTestFailed(testId, message) {
        console.log(`Integration Test: Test ${testId} failed: ${message}`);
        
        // Update results
        testResults.failed++;
        testResults.results[testId] = {
            status: 'failed',
            message: message
        };
        
        // Update UI
        const testElement = document.getElementById(`test-${testId}`);
        testElement.className = 'integration-test-item failed';
        
        updateResultsSummary();
    }
    
    /**
     * Mark a test as skipped
     * @param {string} testId - ID of the test
     * @param {string} message - Skip reason
     */
    function markTestSkipped(testId, message) {
        console.log(`Integration Test: Test ${testId} skipped: ${message}`);
        
        // Update results
        testResults.skipped++;
        testResults.results[testId] = {
            status: 'skipped',
            message: message
        };
        
        // Update UI
        const testElement = document.getElementById(`test-${testId}`);
        testElement.className = 'integration-test-item skipped';
        
        updateResultsSummary();
    }
    
    /**
     * Update the results summary
     */
    function updateResultsSummary() {
        const summary = `
            Tests: ${testResults.total}
            Passed: <span class="pass">${testResults.passed}</span>
            Failed: <span class="fail">${testResults.failed}</span>
            Skipped: ${testResults.skipped}
        `;
        
        elements.resultsSummary.innerHTML = summary;
    }
    
    /**
     * Export test results to JSON file
     */
    function exportResults() {
        const results = {
            timestamp: new Date().toISOString(),
            summary: {
                total: testResults.total,
                passed: testResults.passed,
                failed: testResults.failed,
                skipped: testResults.skipped
            },
            tests: testResults.results
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `integration-test-results-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // ========== TEST IMPLEMENTATIONS ==========
    
    /**
     * Test that state changes propagate to all components
     * @returns {Promise<Object>} - Test result
     */
    async function testStateComponentSync() {
        try {
            // Get the state manager
            const stateManager = window.StateManager;
            if (!stateManager) {
                return { passed: false, message: "StateManager not found" };
            }
            
            // Create a test value
            const testValue = `test-value-${Date.now()}`;
            
            // Set a test value in state
            stateManager.setState('testValue', testValue);
            
            // Wait for state to propagate
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check if components received the update
            const components = [
                window.StoryNavigator,
                window.CharacterManager,
                window.CombatConsole,
                window.Settings
            ];
            
            for (const component of components) {
                if (!component) {
                    return { passed: false, message: "One or more components not found" };
                }
                
                // Check if component has the updated state
                // This assumes components have a getState method or access to state
                const componentState = component.getState ? component.getState() : null;
                if (!componentState || componentState.testValue !== testValue) {
                    return { 
                        passed: false, 
                        message: `Component ${component.name} did not receive state update` 
                    };
                }
            }
            
            return { passed: true, message: "State changes propagate to all components" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    /**
     * Test that component changes update global state correctly
     * @returns {Promise<Object>} - Test result
     */
    async function testComponentStateUpdates() {
        try {
            // Get components
            const storyNavigator = window.StoryNavigator;
            const characterManager = window.CharacterManager;
            const combatConsole = window.CombatConsole;
            
            if (!storyNavigator || !characterManager || !combatConsole) {
                return { passed: false, message: "One or more components not found" };
            }
            
            // Test story navigator updates
            const testThreadName = `Test Thread ${Date.now()}`;
            await storyNavigator.createThread({
                name: testThreadName,
                description: "Test thread description"
            });
            
            // Check if state was updated
            const stateManager = window.StateManager;
            const state = stateManager.getState();
            
            const threadExists = state.threads && 
                state.threads.some(thread => thread.name === testThreadName);
            
            if (!threadExists) {
                return { 
                    passed: false, 
                    message: "Story Navigator failed to update global state" 
                };
            }
            
            return { passed: true, message: "Component changes update global state correctly" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    /**
     * Test that character data flows correctly to combat console
     * @returns {Promise<Object>} - Test result
     */
    async function testCharacterToCombatFlow() {
        try {
            // Get components
            const characterManager = window.CharacterManager;
            const combatConsole = window.CombatConsole;
            
            if (!characterManager || !combatConsole) {
                return { passed: false, message: "Required components not found" };
            }
            
            // Create a test character
            const testCharName = `Test Character ${Date.now()}`;
            await characterManager.createCharacter({
                name: testCharName,
                type: "npc",
                hp: 20,
                ac: 15,
                initiative: 2
            });
            
            // Wait for state to propagate
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Add character to combat
            await combatConsole.addCombatant(testCharName);
            
            // Check if character was added to combat
            const combatState = combatConsole.getState();
            const characterInCombat = combatState.combatants && 
                combatState.combatants.some(c => c.name === testCharName);
            
            if (!characterInCombat) {
                return { 
                    passed: false, 
                    message: "Character data did not flow to combat console" 
                };
            }
            
            return { passed: true, message: "Character data flows correctly to combat console" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    /**
     * Test that story and character components interact correctly
     * @returns {Promise<Object>} - Test result
     */
    async function testStoryCharacterIntegration() {
        try {
            // Get components
            const storyNavigator = window.StoryNavigator;
            const characterManager = window.CharacterManager;
            
            if (!storyNavigator || !characterManager) {
                return { passed: false, message: "Required components not found" };
            }
            
            // Create a test character
            const testCharName = `Test Character ${Date.now()}`;
            await characterManager.createCharacter({
                name: testCharName,
                type: "npc",
                description: "Test character description"
            });
            
            // Create a test thread with the character
            const testThreadName = `Test Thread ${Date.now()}`;
            await storyNavigator.createThread({
                name: testThreadName,
                description: "Test thread description",
                relatedCharacters: [testCharName]
            });
            
            // Check if character is linked to thread
            const stateManager = window.StateManager;
            const state = stateManager.getState();
            
            const thread = state.threads && 
                state.threads.find(t => t.name === testThreadName);
            
            if (!thread || !thread.relatedCharacters || 
                !thread.relatedCharacters.includes(testCharName)) {
                return { 
                    passed: false, 
                    message: "Story and character components failed to integrate" 
                };
            }
            
            return { passed: true, message: "Story and character components interact correctly" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    /**
     * Test complete combat workflow
     * @returns {Promise<Object>} - Test result
     */
    async function testCombatWorkflow() {
        try {
            // Get combat console
            const combatConsole = window.CombatConsole;
            
            if (!combatConsole) {
                return { passed: false, message: "Combat Console not found" };
            }
            
            // Start a new encounter
            await combatConsole.startNewEncounter();
            
            // Add combatants
            await combatConsole.addCombatant({
                name: "Test Fighter",
                initiative: 18,
                hp: 30,
                maxHp: 30
            });
            
            await combatConsole.addCombatant({
                name: "Test Goblin",
                initiative: 12,
                hp: 10,
                maxHp: 10
            });
            
            // Start combat
            await combatConsole.startCombat();
            
            // Check if combat started
            const combatState = combatConsole.getState();
            if (!combatState.inCombat) {
                return { passed: false, message: "Failed to start combat" };
            }
            
            // Advance turn
            await combatConsole.nextTurn();
            
            // Apply damage
            await combatConsole.applyDamage("Test Goblin", 5);
            
            // Check if damage was applied
            const updatedState = combatConsole.getState();
            const goblin = updatedState.combatants.find(c => c.name === "Test Goblin");
            
            if (!goblin || goblin.hp !== 5) {
                return { passed: false, message: "Failed to apply damage" };
            }
            
            // End combat
            await combatConsole.endCombat();
            
            // Check if combat ended
            const finalState = combatConsole.getState();
            if (finalState.inCombat) {
                return { passed: false, message: "Failed to end combat" };
            }
            
            return { passed: true, message: "Complete combat workflow functions correctly" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    /**
     * Test complete story tracking workflow
     * @returns {Promise<Object>} - Test result
     */
    async function testStoryTrackingWorkflow() {
        try {
            // Get story navigator
            const storyNavigator = window.StoryNavigator;
            
            if (!storyNavigator) {
                return { passed: false, message: "Story Navigator not found" };
            }
            
            // Create a thread
            const threadName = `Test Thread ${Date.now()}`;
            await storyNavigator.createThread({
                name: threadName,
                description: "Test thread description"
            });
            
            // Add a beat
            await storyNavigator.addBeat({
                threadName: threadName,
                content: "Test beat content",
                isRevealed: false
            });
            
            // Check if beat was added
            const stateManager = window.StateManager;
            const state = stateManager.getState();
            
            const thread = state.threads && 
                state.threads.find(t => t.name === threadName);
            
            if (!thread || !thread.beats || thread.beats.length === 0) {
                return { passed: false, message: "Failed to add beat to thread" };
            }
            
            // Reveal the beat
            await storyNavigator.revealBeat({
                threadName: threadName,
                beatIndex: 0
            });
            
            // Check if beat was revealed
            const updatedState = stateManager.getState();
            const updatedThread = updatedState.threads && 
                updatedState.threads.find(t => t.name === threadName);
            
            if (!updatedThread || !updatedThread.beats || 
                !updatedThread.beats[0].isRevealed) {
                return { passed: false, message: "Failed to reveal beat" };
            }
            
            return { passed: true, message: "Complete story tracking workflow functions correctly" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    /**
     * Test cross-component state persistence
     * @returns {Promise<Object>} - Test result
     */
    async function testCrossComponentPersistence() {
        try {
            // Get state manager
            const stateManager = window.StateManager;
            
            if (!stateManager) {
                return { passed: false, message: "StateManager not found" };
            }
            
            // Create test data
            const testData = {
                threadName: `Test Thread ${Date.now()}`,
                characterName: `Test Character ${Date.now()}`
            };
            
            // Create a thread and character
            const storyNavigator = window.StoryNavigator;
            const characterManager = window.CharacterManager;
            
            await storyNavigator.createThread({
                name: testData.threadName,
                description: "Test thread description"
            });
            
            await characterManager.createCharacter({
                name: testData.characterName,
                type: "npc",
                description: "Test character description"
            });
            
            // Force state save
            await stateManager.saveState();
            
            // Simulate page reload by clearing and reloading state
            await stateManager.clearState();
            await stateManager.loadState();
            
            // Check if data persisted
            const state = stateManager.getState();
            
            const threadExists = state.threads && 
                state.threads.some(t => t.name === testData.threadName);
                
            const characterExists = state.characters && 
                state.characters.some(c => c.name === testData.characterName);
            
            if (!threadExists || !characterExists) {
                return { 
                    passed: false, 
                    message: "Cross-component state did not persist correctly" 
                };
            }
            
            return { passed: true, message: "Cross-component state persists correctly" };
        } catch (error) {
            return { passed: false, message: `Error: ${error.message}` };
        }
    }
    
    // Return public API
    return {
        init: init,
        runAllTests: runAllTests,
        runTest: runTest
    };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for app to initialize
    setTimeout(function() {
        IntegrationTest.init();
    }, 1000);
}); 