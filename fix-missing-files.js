/**
 * Fix Missing Files Utility
 * 
 * This script checks for missing files referenced in index.html and creates
 * placeholder files to prevent 404 errors.
 */

(function() {
    // List of files to check and create if missing
    const filesToCheck = [
        // Utility scripts
        'scripts/utils/data-utils.js',
        'scripts/utils/ui-utils.js',
        'scripts/utils/event-utils.js',
        
        // Component scripts
        'scripts/components/header.js',
        
        // Component styles
        'styles/components/header.css',
        'styles/components/character-manager.css',
        'styles/components/combat-console.css'
    ];
    
    // Template content for different file types
    const templates = {
        js: (filename) => `/**
 * ${filename}
 * 
 * Placeholder file created by fix-missing-files.js
 * Replace with actual implementation.
 */

// Placeholder to prevent errors
console.log('${filename} loaded');
`,
        css: (filename) => `/**
 * ${filename}
 * 
 * Placeholder file created by fix-missing-files.js
 * Replace with actual implementation.
 */

/* Placeholder styles */
`
    };
    
    // Check and create missing files
    function checkAndCreateFiles() {
        console.log('Checking for missing files...');
        
        let createdCount = 0;
        
        filesToCheck.forEach(filepath => {
            try {
                // Try to fetch the file
                const xhr = new XMLHttpRequest();
                xhr.open('HEAD', filepath, false);
                xhr.send();
                
                if (xhr.status === 404) {
                    // File doesn't exist, create it
                    createFile(filepath);
                    createdCount++;
                } else {
                    console.log(`✓ ${filepath} exists`);
                }
            } catch (error) {
                console.error(`Error checking ${filepath}:`, error);
            }
        });
        
        console.log(`Done! Created ${createdCount} missing files.`);
        
        if (createdCount > 0) {
            alert(`Created ${createdCount} missing files. Please refresh the page.`);
        }
    }
    
    // Create a file with placeholder content
    function createFile(filepath) {
        console.log(`Creating ${filepath}...`);
        
        // Determine file type
        const fileExtension = filepath.split('.').pop();
        const template = templates[fileExtension] || (() => '');
        
        // Create content
        const content = template(filepath);
        
        // Create a download link
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filepath.split('/').pop();
        a.textContent = `Download ${filepath}`;
        a.style.display = 'block';
        a.style.margin = '10px 0';
        
        // Add to document
        const container = document.getElementById('fix-missing-files-container') || 
                          document.createElement('div');
        
        if (!container.id) {
            container.id = 'fix-missing-files-container';
            container.style.position = 'fixed';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.background = '#fff';
            container.style.padding = '20px';
            container.style.borderRadius = '8px';
            container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            container.style.zIndex = '10000';
            container.style.maxWidth = '80%';
            container.style.maxHeight = '80vh';
            container.style.overflow = 'auto';
            
            const heading = document.createElement('h2');
            heading.textContent = 'Missing Files';
            container.appendChild(heading);
            
            const instructions = document.createElement('p');
            instructions.textContent = 'Please download these files and place them in the correct directories:';
            container.appendChild(instructions);
            
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.marginTop = '20px';
            closeButton.style.padding = '8px 16px';
            closeButton.style.background = '#f44336';
            closeButton.style.color = '#fff';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            closeButton.onclick = () => container.remove();
            
            const directoryNote = document.createElement('div');
            directoryNote.style.marginTop = '20px';
            directoryNote.style.padding = '10px';
            directoryNote.style.background = '#f5f5f5';
            directoryNote.style.borderRadius = '4px';
            directoryNote.innerHTML = `
                <p><strong>Note:</strong> You may need to create these directories:</p>
                <ul>
                    <li>scripts/utils/</li>
                    <li>scripts/components/</li>
                    <li>styles/components/</li>
                </ul>
            `;
            
            container.appendChild(directoryNote);
            container.appendChild(closeButton);
            
            document.body.appendChild(container);
        }
        
        // Add file path info
        const pathInfo = document.createElement('div');
        pathInfo.style.fontWeight = 'bold';
        pathInfo.textContent = filepath;
        container.insertBefore(pathInfo, container.querySelector('button'));
        
        // Add download link
        container.insertBefore(a, container.querySelector('button'));
        
        console.log(`Created download link for ${filepath}`);
    }
    
    // Run the check when the page is loaded
    window.addEventListener('load', checkAndCreateFiles);
})(); 