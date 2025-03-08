/**
 * DM HUD Performance Test
 * 
 * Utility script to measure performance metrics for the DM HUD application.
 * This helps identify performance bottlenecks and ensure the application
 * meets performance targets.
 */

const PerformanceTest = (function() {
    // Performance metrics
    const metrics = {
        initialLoad: null,
        stateUpdates: [],
        renderTimes: {},
        memoryUsage: [],
        localStorageOps: []
    };
    
    // Test configuration
    const config = {
        stateUpdateCount: 20,
        renderTestIterations: 5,
        localStorageTestSize: 5 // MB
    };
    
    // DOM elements
    let elements = {
        container: null,
        results: null,
        startButton: null,
        downloadButton: null
    };
    
    /**
     * Initialize the performance test UI
     */
    function init() {
        // Create UI
        createUI();
        
        // Bind events
        bindEvents();
        
        console.log('Performance Test initialized');
    }
    
    /**
     * Create the performance test UI
     */
    function createUI() {
        // Create container
        const container = document.createElement('div');
        container.id = 'performance-test';
        container.className = 'performance-test';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .performance-test {
                position: fixed;
                top: 20px;
                left: 20px;
                width: 400px;
                background: #2a2a2a;
                color: #eee;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                font-family: Arial, sans-serif;
                padding: 15px;
            }
            .performance-test h3 {
                margin-top: 0;
                margin-bottom: 10px;
            }
            .performance-test button {
                background: #444;
                border: none;
                color: #fff;
                padding: 8px 12px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 8px;
                margin-bottom: 8px;
            }
            .performance-test button:hover {
                background: #555;
            }
            .performance-test-results {
                margin-top: 15px;
                padding: 10px;
                background: #333;
                border-radius: 4px;
                font-family: monospace;
                white-space: pre-wrap;
                max-height: 300px;
                overflow-y: auto;
            }
            .performance-test-results .pass {
                color: #4caf50;
            }
            .performance-test-results .fail {
                color: #f44336;
            }
            .performance-test-results .warn {
                color: #ff9800;
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
        
        // Create content
        container.innerHTML = `
            <div class="performance-test-header">
                <h3>Performance Test</h3>
                <button class="minimize-button" data-action="minimize">−</button>
            </div>
            <div class="performance-test-controls">
                <button id="start-performance-test">Run All Tests</button>
                <button id="test-initial-load">Test Initial Load</button>
                <button id="test-state-updates">Test State Updates</button>
                <button id="test-rendering">Test Rendering</button>
                <button id="test-local-storage">Test LocalStorage</button>
                <button id="test-memory">Test Memory Usage</button>
                <button id="download-results" disabled>Download Results</button>
            </div>
            <div class="performance-test-results">Results will appear here...</div>
        `;
        
        // Add to document
        document.body.appendChild(container);
        
        // Cache elements
        elements.container = container;
        elements.results = container.querySelector('.performance-test-results');
        elements.startButton = document.getElementById('start-performance-test');
        elements.downloadButton = document.getElementById('download-results');
    }
    
    /**
     * Bind events to the performance test UI
     */
    function bindEvents() {
        // Start all tests
        document.getElementById('start-performance-test').addEventListener('click', runAllTests);
        
        // Individual tests
        document.getElementById('test-initial-load').addEventListener('click', testInitialLoad);
        document.getElementById('test-state-updates').addEventListener('click', testStateUpdates);
        document.getElementById('test-rendering').addEventListener('click', testRendering);
        document.getElementById('test-local-storage').addEventListener('click', testLocalStorage);
        document.getElementById('test-memory').addEventListener('click', testMemoryUsage);
        
        // Download results
        document.getElementById('download-results').addEventListener('click', downloadResults);
        
        // Minimize button
        elements.container.querySelector('[data-action="minimize"]').addEventListener('click', toggleMinimize);
    }
    
    /**
     * Run all performance tests
     */
    async function runAllTests() {
        // Clear previous results
        clearResults();
        
        // Disable buttons during test
        setButtonsEnabled(false);
        
        // Log start
        logResult('Starting performance tests...\n');
        
        // Run tests
        await testInitialLoad();
        await testStateUpdates();
        await testRendering();
        await testLocalStorage();
        await testMemoryUsage();
        
        // Log summary
        logResult('\nPerformance test complete!');
        
        // Enable download button
        elements.downloadButton.disabled = false;
        
        // Enable buttons
        setButtonsEnabled(true);
    }
    
    /**
     * Test initial load time
     */
    async function testInitialLoad() {
        logResult('Testing initial load time...');
        
        // Measure time to reload the page
        const startTime = performance.now();
        
        // Simulate reload by clearing state and reinitializing
        StateManager.resetState();
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for state reset
        
        // Reinitialize components
        if (typeof App !== 'undefined' && App.init) {
            App.init();
        }
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Store metric
        metrics.initialLoad = loadTime;
        
        // Log result
        const result = `Initial load time: ${loadTime.toFixed(2)}ms`;
        if (loadTime < 1000) {
            logResult(`✓ ${result}`, 'pass');
        } else if (loadTime < 2000) {
            logResult(`⚠ ${result}`, 'warn');
        } else {
            logResult(`✗ ${result}`, 'fail');
        }
        
        return loadTime;
    }
    
    /**
     * Test state update performance
     */
    async function testStateUpdates() {
        logResult('\nTesting state update performance...');
        
        // Clear previous metrics
        metrics.stateUpdates = [];
        
        // Generate test data
        const testData = TestDataGenerator.generateSmallDataset();
        
        // Test simple property updates
        logResult('Simple property updates:');
        for (let i = 0; i < config.stateUpdateCount; i++) {
            const startTime = performance.now();
            
            // Update a simple property
            StateManager.setState('ui.activeTab', ['story', 'characters', 'combat', 'settings'][i % 4]);
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            // Store metric
            metrics.stateUpdates.push({
                type: 'simple',
                time: updateTime
            });
            
            // Log every 5th result
            if (i % 5 === 0) {
                logResult(`  Update ${i+1}: ${updateTime.toFixed(2)}ms`);
            }
            
            // Wait a bit between updates
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Test complex property updates
        logResult('Complex property updates:');
        for (let i = 0; i < config.stateUpdateCount; i++) {
            const startTime = performance.now();
            
            // Update a complex property (array of objects)
            const characters = testData.characters.characters.slice(0, 5);
            StateManager.setState('characters.characters', characters);
            
            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            // Store metric
            metrics.stateUpdates.push({
                type: 'complex',
                time: updateTime
            });
            
            // Log every 5th result
            if (i % 5 === 0) {
                logResult(`  Update ${i+1}: ${updateTime.toFixed(2)}ms`);
            }
            
            // Wait a bit between updates
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Calculate average
        const simpleUpdates = metrics.stateUpdates.filter(m => m.type === 'simple');
        const complexUpdates = metrics.stateUpdates.filter(m => m.type === 'complex');
        
        const simpleAvg = simpleUpdates.reduce((sum, m) => sum + m.time, 0) / simpleUpdates.length;
        const complexAvg = complexUpdates.reduce((sum, m) => sum + m.time, 0) / complexUpdates.length;
        
        // Log summary
        logResult(`Average simple update time: ${simpleAvg.toFixed(2)}ms`);
        logResult(`Average complex update time: ${complexAvg.toFixed(2)}ms`);
        
        // Evaluate performance
        if (simpleAvg < 50 && complexAvg < 100) {
            logResult('✓ State update performance is good', 'pass');
        } else if (simpleAvg < 100 && complexAvg < 200) {
            logResult('⚠ State update performance is acceptable', 'warn');
        } else {
            logResult('✗ State update performance needs improvement', 'fail');
        }
        
        return { simpleAvg, complexAvg };
    }
    
    /**
     * Test rendering performance
     */
    async function testRendering() {
        logResult('\nTesting rendering performance...');
        
        // Clear previous metrics
        metrics.renderTimes = {};
        
        // Test each tab
        const tabs = ['story', 'characters', 'combat', 'settings'];
        
        for (const tab of tabs) {
            logResult(`Rendering ${tab} tab:`);
            
            metrics.renderTimes[tab] = [];
            
            for (let i = 0; i < config.renderTestIterations; i++) {
                // Switch to tab
                const startTime = performance.now();
                
                // Update UI state to switch tab
                StateManager.setState('ui.activeTab', tab);
                
                // Wait for rendering to complete
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const endTime = performance.now();
                const renderTime = endTime - startTime;
                
                // Store metric
                metrics.renderTimes[tab].push(renderTime);
                
                // Log result
                logResult(`  Iteration ${i+1}: ${renderTime.toFixed(2)}ms`);
                
                // Wait a bit between renders
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Calculate average
            const avg = metrics.renderTimes[tab].reduce((sum, time) => sum + time, 0) / metrics.renderTimes[tab].length;
            
            // Log summary
            logResult(`Average ${tab} tab render time: ${avg.toFixed(2)}ms`);
            
            // Evaluate performance
            if (avg < 200) {
                logResult(`✓ ${tab} tab rendering is fast`, 'pass');
            } else if (avg < 500) {
                logResult(`⚠ ${tab} tab rendering is acceptable`, 'warn');
            } else {
                logResult(`✗ ${tab} tab rendering is slow`, 'fail');
            }
        }
        
        return metrics.renderTimes;
    }
    
    /**
     * Test localStorage performance
     */
    async function testLocalStorage() {
        logResult('\nTesting localStorage performance...');
        
        // Clear previous metrics
        metrics.localStorageOps = [];
        
        // Generate test data of increasing size
        const sizes = [0.1, 0.5, 1, 2, config.localStorageTestSize]; // MB
        
        for (const size of sizes) {
            // Generate string of specified size
            const dataSize = size * 1024 * 1024; // Convert MB to bytes
            const testData = generateTestString(dataSize);
            
            // Test write
            const writeStartTime = performance.now();
            try {
                localStorage.setItem('performanceTest', testData);
                const writeEndTime = performance.now();
                const writeTime = writeEndTime - writeStartTime;
                
                // Store metric
                metrics.localStorageOps.push({
                    type: 'write',
                    size: size,
                    time: writeTime
                });
                
                // Log result
                logResult(`Write ${size}MB: ${writeTime.toFixed(2)}ms`);
                
                // Test read
                const readStartTime = performance.now();
                const data = localStorage.getItem('performanceTest');
                const readEndTime = performance.now();
                const readTime = readEndTime - readStartTime;
                
                // Store metric
                metrics.localStorageOps.push({
                    type: 'read',
                    size: size,
                    time: readTime
                });
                
                // Log result
                logResult(`Read ${size}MB: ${readTime.toFixed(2)}ms`);
                
                // Clean up
                localStorage.removeItem('performanceTest');
            } catch (e) {
                logResult(`✗ Error with ${size}MB: ${e.message}`, 'fail');
                break;
            }
            
            // Wait a bit between tests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Calculate averages
        const writes = metrics.localStorageOps.filter(m => m.type === 'write');
        const reads = metrics.localStorageOps.filter(m => m.type === 'read');
        
        const writeAvg = writes.reduce((sum, m) => sum + m.time, 0) / writes.length;
        const readAvg = reads.reduce((sum, m) => sum + m.time, 0) / reads.length;
        
        // Log summary
        logResult(`Average write time: ${writeAvg.toFixed(2)}ms`);
        logResult(`Average read time: ${readAvg.toFixed(2)}ms`);
        
        // Evaluate performance
        if (writeAvg < 100 && readAvg < 50) {
            logResult('✓ localStorage performance is good', 'pass');
        } else if (writeAvg < 200 && readAvg < 100) {
            logResult('⚠ localStorage performance is acceptable', 'warn');
        } else {
            logResult('✗ localStorage performance needs improvement', 'fail');
        }
        
        return { writeAvg, readAvg };
    }
    
    /**
     * Test memory usage
     */
    async function testMemoryUsage() {
        logResult('\nTesting memory usage...');
        
        // Clear previous metrics
        metrics.memoryUsage = [];
        
        // Check if performance.memory is available (Chrome only)
        if (!performance.memory) {
            logResult('⚠ Memory measurement not supported in this browser', 'warn');
            return null;
        }
        
        // Measure baseline memory
        const baseline = performance.memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
        metrics.memoryUsage.push({
            stage: 'baseline',
            memory: baseline
        });
        
        logResult(`Baseline memory usage: ${baseline.toFixed(2)}MB`);
        
        // Generate and apply small dataset
        logResult('Applying small dataset...');
        const smallData = TestDataGenerator.generateSmallDataset();
        TestDataGenerator.applyTestData(smallData);
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Measure memory after small dataset
        const smallDatasetMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
        metrics.memoryUsage.push({
            stage: 'small-dataset',
            memory: smallDatasetMemory
        });
        
        logResult(`Memory usage with small dataset: ${smallDatasetMemory.toFixed(2)}MB`);
        logResult(`Increase: ${(smallDatasetMemory - baseline).toFixed(2)}MB`);
        
        // Generate and apply large dataset
        logResult('Applying large dataset...');
        const largeData = TestDataGenerator.generateLargeDataset();
        TestDataGenerator.applyTestData(largeData);
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Measure memory after large dataset
        const largeDatasetMemory = performance.memory.usedJSHeapSize / (1024 * 1024);
        metrics.memoryUsage.push({
            stage: 'large-dataset',
            memory: largeDatasetMemory
        });
        
        logResult(`Memory usage with large dataset: ${largeDatasetMemory.toFixed(2)}MB`);
        logResult(`Increase from baseline: ${(largeDatasetMemory - baseline).toFixed(2)}MB`);
        
        // Evaluate performance
        if (largeDatasetMemory < 50) {
            logResult('✓ Memory usage is good', 'pass');
        } else if (largeDatasetMemory < 100) {
            logResult('⚠ Memory usage is acceptable', 'warn');
        } else {
            logResult('✗ Memory usage is high', 'fail');
        }
        
        // Reset state
        StateManager.resetState();
        
        return metrics.memoryUsage;
    }
    
    /**
     * Generate a string of the specified size
     */
    function generateTestString(size) {
        const chunk = 'x'.repeat(1024); // 1KB chunk
        const chunks = Math.ceil(size / 1024);
        return chunk.repeat(chunks).substring(0, size);
    }
    
    /**
     * Log a result to the results container
     */
    function logResult(message, type = '') {
        const line = document.createElement('div');
        line.textContent = message;
        if (type) {
            line.className = type;
        }
        elements.results.appendChild(line);
        
        // Scroll to bottom
        elements.results.scrollTop = elements.results.scrollHeight;
    }
    
    /**
     * Clear the results container
     */
    function clearResults() {
        elements.results.textContent = '';
    }
    
    /**
     * Enable or disable all buttons
     */
    function setButtonsEnabled(enabled) {
        const buttons = elements.container.querySelectorAll('button:not(.minimize-button):not(#download-results)');
        buttons.forEach(button => {
            button.disabled = !enabled;
        });
    }
    
    /**
     * Download test results as JSON
     */
    function downloadResults() {
        const results = {
            timestamp: new Date().toISOString(),
            metrics: metrics,
            summary: {
                initialLoad: {
                    time: metrics.initialLoad,
                    rating: metrics.initialLoad < 1000 ? 'good' : (metrics.initialLoad < 2000 ? 'acceptable' : 'poor')
                },
                stateUpdates: {
                    simpleAvg: metrics.stateUpdates.filter(m => m.type === 'simple').reduce((sum, m) => sum + m.time, 0) / 
                              metrics.stateUpdates.filter(m => m.type === 'simple').length,
                    complexAvg: metrics.stateUpdates.filter(m => m.type === 'complex').reduce((sum, m) => sum + m.time, 0) / 
                               metrics.stateUpdates.filter(m => m.type === 'complex').length
                },
                renderTimes: Object.fromEntries(
                    Object.entries(metrics.renderTimes).map(([tab, times]) => [
                        tab, 
                        times.reduce((sum, time) => sum + time, 0) / times.length
                    ])
                ),
                localStorage: {
                    writeAvg: metrics.localStorageOps.filter(m => m.type === 'write').reduce((sum, m) => sum + m.time, 0) / 
                              metrics.localStorageOps.filter(m => m.type === 'write').length,
                    readAvg: metrics.localStorageOps.filter(m => m.type === 'read').reduce((sum, m) => sum + m.time, 0) / 
                             metrics.localStorageOps.filter(m => m.type === 'read').length
                },
                memoryUsage: metrics.memoryUsage.length > 0 ? 
                    metrics.memoryUsage[metrics.memoryUsage.length - 1].memory : null
            }
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dmhud-performance-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Toggle minimize state of the performance test UI
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
                if (!child.classList.contains('performance-test-header')) {
                    child.style.display = '';
                }
            });
        } else {
            container.classList.add('minimized');
            button.textContent = '+';
            button.title = 'Expand';
            
            // Hide all elements except header
            Array.from(container.children).forEach(child => {
                if (!child.classList.contains('performance-test-header')) {
                    child.style.display = 'none';
                }
            });
            
            // Adjust container size
            container.style.height = 'auto';
            container.style.width = 'auto';
        }
    }
    
    // Public API
    return {
        init: init,
        runAllTests: runAllTests,
        testInitialLoad: testInitialLoad,
        testStateUpdates: testStateUpdates,
        testRendering: testRendering,
        testLocalStorage: testLocalStorage,
        testMemoryUsage: testMemoryUsage,
        getMetrics: () => metrics
    };
})();

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure the main app is loaded
    setTimeout(function() {
        PerformanceTest.init();
    }, 1000);
}); 