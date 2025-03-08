/**
 * DM HUD Test Data Generator
 * 
 * Utility script to generate test data for the DM HUD application.
 * This helps create large datasets for performance testing and edge cases.
 */

const TestDataGenerator = (function() {
    // Sample data templates
    const templates = {
        campaign: {
            id: "campaign-{id}",
            name: "Test Campaign {id}",
            description: "A test campaign for DM HUD",
            setting: "Fantasy World",
            currentSession: 1
        },
        thread: {
            id: "thread-{id}",
            title: "Plot Thread {id}",
            description: "A test plot thread",
            status: "active",
            color: "#3498db"
        },
        beat: {
            id: "beat-{id}",
            threadId: "thread-{threadId}",
            title: "Story Beat {id}",
            description: "A test story beat",
            isRevealed: false,
            order: 0
        },
        character: {
            id: "char-{id}",
            name: "Character {id}",
            type: "npc", // or "pc"
            race: "Human",
            class: "Fighter",
            level: 1,
            hp: { current: 10, max: 10 },
            ac: 10,
            stats: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            notes: "Test character notes"
        },
        relationship: {
            id: "rel-{id}",
            sourceId: "char-{sourceId}",
            targetId: "char-{targetId}",
            type: "ally", // or "enemy", "neutral", "family", etc.
            description: "Test relationship"
        },
        location: {
            id: "loc-{id}",
            name: "Location {id}",
            description: "A test location",
            notes: "Test location notes"
        },
        encounter: {
            id: "enc-{id}",
            name: "Encounter {id}",
            description: "A test encounter",
            status: "planned", // or "active", "completed"
            combatants: []
        },
        combatant: {
            id: "comb-{id}",
            characterId: "char-{charId}",
            initiative: 10,
            hp: { current: 10, max: 10 },
            conditions: []
        }
    };

    /**
     * Generate a random integer between min and max (inclusive)
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generate a random hex color
     */
    function randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    /**
     * Generate a random item from an array
     */
    function randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Replace template placeholders with values
     */
    function applyTemplate(template, values) {
        const result = JSON.parse(JSON.stringify(template)); // Deep clone
        
        // Replace placeholders in all string values
        function replacePlaceholders(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    for (const placeholder in values) {
                        obj[key] = obj[key].replace(`{${placeholder}}`, values[placeholder]);
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    replacePlaceholders(obj[key]);
                }
            }
        }
        
        replacePlaceholders(result);
        return result;
    }

    /**
     * Generate a test campaign with the specified number of elements
     */
    function generateCampaign(options = {}) {
        const defaults = {
            threadCount: 5,
            beatsPerThread: 10,
            characterCount: 20,
            pcCount: 5,
            locationCount: 10,
            relationshipCount: 15,
            encounterCount: 3,
            combatantsPerEncounter: 5
        };
        
        const config = { ...defaults, ...options };
        
        // Generate campaign
        const campaign = applyTemplate(templates.campaign, { id: 1 });
        
        // Generate threads
        const threads = [];
        for (let i = 1; i <= config.threadCount; i++) {
            const thread = applyTemplate(templates.thread, { id: i });
            thread.color = randomColor();
            threads.push(thread);
        }
        
        // Generate beats
        const beats = [];
        let beatId = 1;
        for (let threadId = 1; threadId <= config.threadCount; threadId++) {
            for (let j = 1; j <= config.beatsPerThread; j++) {
                const beat = applyTemplate(templates.beat, { id: beatId, threadId: threadId });
                beat.order = j;
                beat.isRevealed = Math.random() > 0.5;
                beats.push(beat);
                beatId++;
            }
        }
        
        // Generate characters
        const characters = [];
        const characterTypes = ['pc', 'npc'];
        const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Orc', 'Tiefling'];
        const classes = ['Fighter', 'Wizard', 'Cleric', 'Rogue', 'Bard', 'Druid', 'Paladin', 'Ranger'];
        
        // Generate PCs
        for (let i = 1; i <= config.pcCount; i++) {
            const character = applyTemplate(templates.character, { id: i });
            character.type = 'pc';
            character.race = randomItem(races);
            character.class = randomItem(classes);
            character.level = randomInt(1, 10);
            character.hp.max = randomInt(10, 100);
            character.hp.current = character.hp.max;
            character.ac = randomInt(10, 20);
            
            // Random stats
            for (const stat in character.stats) {
                character.stats[stat] = randomInt(8, 18);
            }
            
            characters.push(character);
        }
        
        // Generate NPCs
        for (let i = config.pcCount + 1; i <= config.characterCount; i++) {
            const character = applyTemplate(templates.character, { id: i });
            character.type = 'npc';
            character.race = randomItem(races);
            character.class = randomItem(classes);
            character.level = randomInt(1, 10);
            character.hp.max = randomInt(10, 100);
            character.hp.current = character.hp.max;
            character.ac = randomInt(10, 20);
            
            // Random stats
            for (const stat in character.stats) {
                character.stats[stat] = randomInt(8, 18);
            }
            
            characters.push(character);
        }
        
        // Generate locations
        const locations = [];
        for (let i = 1; i <= config.locationCount; i++) {
            const location = applyTemplate(templates.location, { id: i });
            locations.push(location);
        }
        
        // Generate relationships
        const relationships = [];
        const relationshipTypes = ['ally', 'enemy', 'neutral', 'family', 'rival', 'mentor', 'student'];
        
        for (let i = 1; i <= config.relationshipCount; i++) {
            const sourceId = randomInt(1, config.characterCount);
            let targetId;
            do {
                targetId = randomInt(1, config.characterCount);
            } while (targetId === sourceId);
            
            const relationship = applyTemplate(templates.relationship, { 
                id: i, 
                sourceId: sourceId, 
                targetId: targetId 
            });
            relationship.type = randomItem(relationshipTypes);
            relationships.push(relationship);
        }
        
        // Generate encounters
        const encounters = [];
        const encounterStatuses = ['planned', 'active', 'completed'];
        const conditions = ['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'poisoned', 'prone', 'restrained', 'stunned'];
        
        for (let i = 1; i <= config.encounterCount; i++) {
            const encounter = applyTemplate(templates.encounter, { id: i });
            encounter.status = randomItem(encounterStatuses);
            
            // Add combatants
            const combatants = [];
            for (let j = 1; j <= config.combatantsPerEncounter; j++) {
                const combatantId = (i - 1) * config.combatantsPerEncounter + j;
                const charId = randomInt(1, config.characterCount);
                
                const combatant = applyTemplate(templates.combatant, { id: combatantId, charId: charId });
                combatant.initiative = randomInt(1, 20);
                
                // Random HP
                combatant.hp.max = randomInt(10, 100);
                combatant.hp.current = randomInt(1, combatant.hp.max);
                
                // Random conditions (0-2)
                const conditionCount = randomInt(0, 2);
                for (let k = 0; k < conditionCount; k++) {
                    combatant.conditions.push(randomItem(conditions));
                }
                
                combatants.push(combatant);
            }
            
            encounter.combatants = combatants;
            encounters.push(encounter);
        }
        
        // Assemble complete state
        return {
            story: {
                campaign: campaign,
                plotThreads: threads,
                storyBeats: beats,
                locations: locations
            },
            characters: {
                characters: characters,
                relationships: relationships
            },
            combat: {
                encounters: encounters,
                activeEncounterId: encounters.length > 0 ? encounters[0].id : null
            }
        };
    }

    /**
     * Generate a large dataset for performance testing
     */
    function generateLargeDataset() {
        return generateCampaign({
            threadCount: 20,
            beatsPerThread: 50,
            characterCount: 100,
            pcCount: 8,
            locationCount: 50,
            relationshipCount: 200,
            encounterCount: 10,
            combatantsPerEncounter: 15
        });
    }

    /**
     * Generate a small dataset for basic testing
     */
    function generateSmallDataset() {
        return generateCampaign({
            threadCount: 3,
            beatsPerThread: 5,
            characterCount: 10,
            pcCount: 4,
            locationCount: 5,
            relationshipCount: 8,
            encounterCount: 2,
            combatantsPerEncounter: 4
        });
    }

    /**
     * Apply the generated data to the application state
     */
    function applyTestData(data) {
        // Clear existing state first
        StateManager.resetState();
        
        // Apply each section of the test data
        for (const section in data) {
            for (const key in data[section]) {
                StateManager.setState(`${section}.${key}`, data[section][key]);
            }
        }
        
        console.log('Test data applied to application state');
    }

    /**
     * Initialize the test data generator UI
     */
    function init() {
        // Create UI for test data generation
        const container = document.createElement('div');
        container.id = 'test-data-generator';
        container.className = 'test-data-generator';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .test-data-generator {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: #2a2a2a;
                color: #eee;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 9999;
                font-family: Arial, sans-serif;
                padding: 15px;
            }
            .test-data-generator h3 {
                margin-top: 0;
                margin-bottom: 10px;
            }
            .test-data-generator button {
                background: #444;
                border: none;
                color: #fff;
                padding: 8px 12px;
                border-radius: 3px;
                cursor: pointer;
                margin-right: 8px;
                margin-bottom: 8px;
            }
            .test-data-generator button:hover {
                background: #555;
            }
        `;
        document.head.appendChild(style);
        
        // Create content
        container.innerHTML = `
            <h3>Test Data Generator</h3>
            <button id="generate-small">Generate Small Dataset</button>
            <button id="generate-large">Generate Large Dataset</button>
            <button id="generate-custom">Generate Custom Dataset</button>
            <button id="reset-state">Reset to Default State</button>
        `;
        
        // Add to document
        document.body.appendChild(container);
        
        // Bind events
        document.getElementById('generate-small').addEventListener('click', function() {
            const data = generateSmallDataset();
            applyTestData(data);
        });
        
        document.getElementById('generate-large').addEventListener('click', function() {
            const data = generateLargeDataset();
            applyTestData(data);
        });
        
        document.getElementById('generate-custom').addEventListener('click', function() {
            const threadCount = parseInt(prompt('Number of threads:', '5'));
            const beatsPerThread = parseInt(prompt('Beats per thread:', '10'));
            const characterCount = parseInt(prompt('Total characters:', '20'));
            const pcCount = parseInt(prompt('Number of PCs:', '5'));
            
            if (isNaN(threadCount) || isNaN(beatsPerThread) || isNaN(characterCount) || isNaN(pcCount)) {
                alert('Please enter valid numbers');
                return;
            }
            
            const data = generateCampaign({
                threadCount,
                beatsPerThread,
                characterCount,
                pcCount
            });
            
            applyTestData(data);
        });
        
        document.getElementById('reset-state').addEventListener('click', function() {
            StateManager.resetState();
            console.log('State reset to default');
        });
    }

    // Public API
    return {
        init: init,
        generateSmallDataset: generateSmallDataset,
        generateLargeDataset: generateLargeDataset,
        generateCampaign: generateCampaign,
        applyTestData: applyTestData
    };
})();

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure the main app is loaded
    setTimeout(function() {
        TestDataGenerator.init();
    }, 1000);
}); 