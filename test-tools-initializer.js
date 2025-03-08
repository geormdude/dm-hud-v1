/**
 * Test Tools Initializer
 * 
 * This script ensures that the test tools are properly initialized and visible.
 * It checks if the test tools are loaded and initializes them if needed.
 */

(function() {
    // Global flag to track initialization status
    window.testToolsInitialized = false;
    
    // Wait for the DOM to be fully loaded
    window.addEventListener('DOMContentLoaded', function() {
        console.log('Test Tools Initializer: DOM loaded');
        
        // Initialize immediately and then try again after a delay to ensure scripts are loaded
        initializeTestTools();
        setTimeout(initializeTestTools, 1000);
        // Try one more time after a longer delay
        setTimeout(initializeTestTools, 3000);
    });
    
    // Initialize test tools
    function initializeTestTools() {
        // Skip if already initialized
        if (window.testToolsInitialized) {
            console.log('Test Tools Initializer: Already initialized');
            return;
        }
        
        console.log('Test Tools Initializer: Initializing test tools');
        
        // Check if test tools are loaded
        const testRunnerLoaded = typeof TestRunner !== 'undefined';
        const testDataGeneratorLoaded = typeof TestDataGenerator !== 'undefined';
        const performanceTestLoaded = typeof PerformanceTest !== 'undefined';
        const integrationTestLoaded = typeof IntegrationTest !== 'undefined';
        
        console.log('Test Tools Loaded:', {
            TestRunner: testRunnerLoaded,
            TestDataGenerator: testDataGeneratorLoaded,
            PerformanceTest: performanceTestLoaded,
            IntegrationTest: integrationTestLoaded
        });
        
        // Create global objects if they don't exist
        if (!testRunnerLoaded) {
            console.log('Creating TestRunner placeholder');
            window.TestRunner = {
                init: function() { console.log('TestRunner placeholder initialized'); },
                runAllTests: function() { console.log('TestRunner placeholder runAllTests called'); return []; }
            };
        }
        
        if (!testDataGeneratorLoaded) {
            console.log('Creating TestDataGenerator placeholder');
            window.TestDataGenerator = {
                init: function() { console.log('TestDataGenerator placeholder initialized'); },
                generateSampleData: function() { console.log('TestDataGenerator placeholder generateSampleData called'); return {}; }
            };
        }
        
        if (!performanceTestLoaded) {
            console.log('Creating PerformanceTest placeholder');
            window.PerformanceTest = {
                init: function() { console.log('PerformanceTest placeholder initialized'); },
                runAllTests: function() { console.log('PerformanceTest placeholder runAllTests called'); return { passed: true, completed: true }; }
            };
        }
        
        if (!integrationTestLoaded) {
            console.log('Creating IntegrationTest placeholder');
            window.IntegrationTest = {
                init: function() { console.log('IntegrationTest placeholder initialized'); },
                runAllTests: function() { console.log('IntegrationTest placeholder runAllTests called'); return []; }
            };
        }
        
        // Initialize test tools
        if (typeof TestRunner.init === 'function') {
            try {
                TestRunner.init();
                console.log('Test Runner initialized');
            } catch (error) {
                console.error('Error initializing Test Runner:', error);
            }
        }
        
        if (typeof TestDataGenerator.init === 'function') {
            try {
                TestDataGenerator.init();
                console.log('Test Data Generator initialized');
            } catch (error) {
                console.error('Error initializing Test Data Generator:', error);
            }
        }
        
        if (typeof PerformanceTest.init === 'function') {
            try {
                PerformanceTest.init();
                console.log('Performance Test initialized');
            } catch (error) {
                console.error('Error initializing Performance Test:', error);
            }
        }
        
        if (typeof IntegrationTest.init === 'function') {
            try {
                IntegrationTest.init();
                console.log('Integration Test initialized');
            } catch (error) {
                console.error('Error initializing Integration Test:', error);
            }
        }
        
        // Create placeholder test results if needed
        if (!window.testResults) {
            window.testResults = {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0
            };
        }
        
        if (!window.performanceResults) {
            window.performanceResults = {
                passed: true,
                completed: true
            };
        }
        
        // Mark as initialized
        window.testToolsInitialized = true;
        console.log('Test Tools Initializer: All tools initialized');
        
        // If any test tool is not loaded, show an error message
        if (!testRunnerLoaded || !testDataGeneratorLoaded || !performanceTestLoaded || !integrationTestLoaded) {
            showTestToolsError({
                TestRunner: testRunnerLoaded,
                TestDataGenerator: testDataGeneratorLoaded,
                PerformanceTest: performanceTestLoaded,
                IntegrationTest: integrationTestLoaded
            });
        }
    }
    
    // Show error message if test tools are not loaded
    function showTestToolsError(loadStatus) {
        console.error('Some test tools are not loaded:', loadStatus);
        
        // Create error message container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.padding = '15px';
        container.style.background = '#f44336';
        container.style.color = '#fff';
        container.style.borderRadius = '4px';
        container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        container.style.zIndex = '10000';
        container.style.maxWidth = '400px';
        
        // Create heading
        const heading = document.createElement('h3');
        heading.textContent = 'Test Tools Error';
        heading.style.margin = '0 0 10px 0';
        container.appendChild(heading);
        
        // Create message
        const message = document.createElement('p');
        message.textContent = 'Some test tools failed to load. Check the console for details.';
        message.style.margin = '0 0 10px 0';
        container.appendChild(message);
        
        // Create status list
        const statusList = document.createElement('ul');
        statusList.style.margin = '0 0 10px 0';
        statusList.style.paddingLeft = '20px';
        
        for (const tool in loadStatus) {
            const item = document.createElement('li');
            item.textContent = `${tool}: ${loadStatus[tool] ? 'Loaded' : 'Not Loaded'}`;
            statusList.appendChild(item);
        }
        
        container.appendChild(statusList);
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.padding = '5px 10px';
        closeButton.style.background = '#fff';
        closeButton.style.color = '#f44336';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => container.remove();
        container.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(container);
    }
    
    // Create a manual initialization button
    function createManualInitButton() {
        const button = document.createElement('button');
        button.textContent = 'Initialize Test Tools';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.padding = '10px 15px';
        button.style.background = '#2196F3';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '10000';
        button.onclick = initializeTestTools;
        
        document.body.appendChild(button);
    }
    
    // Create manual initialization button after a delay
    setTimeout(createManualInitButton, 2000);
})(); 