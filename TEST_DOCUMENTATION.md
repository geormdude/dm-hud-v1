# DM HUD Testing Documentation

## Overview

This document outlines the testing process for the DM HUD (Dungeon Master's Heads-Up Display) application. The testing approach focuses on manual testing with some automated assistance to ensure the application functions correctly across all components.

## Testing Environment Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Local development server
- Git (for version control)

### Setting Up the Test Environment

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dm-hud
   ```

2. Start a local development server:
   ```bash
   # Using Python 3
   python -m http.server 8080
   
   # OR using Node.js with http-server
   npm install -g http-server
   http-server -p 8080
   ```

3. Open the application in your browser:
   ```
   http://localhost:8080
   ```

4. Load the testing tools by including the test scripts in your HTML:
   ```html
   <script src="test-runner.js"></script>
   <script src="test-data-generator.js"></script>
   ```

## Testing Tools

### Test Runner

The Test Runner provides a UI for executing and tracking manual tests. It displays a checklist of test cases organized by category and allows you to mark tests as passed, failed, or skipped.

Features:
- Test case organization by category
- Pass/Fail/Skip tracking
- Test results summary
- Export test results to JSON

### Test Data Generator

The Test Data Generator creates sample data for testing various aspects of the application. It can generate datasets of different sizes to test performance and edge cases.

Features:
- Generate small datasets for basic testing
- Generate large datasets for performance testing
- Create custom datasets with specified parameters
- Apply generated data directly to the application state

## Testing Process

### 1. State Management Testing

Test the core state management functionality to ensure data is properly maintained and persisted.

#### Test Cases:
- Initial state loading
- State persistence to localStorage
- State retrieval and manipulation
- State change event propagation

#### Testing Steps:
1. Open the application in a fresh browser session
2. Verify default state loads correctly
3. Make changes to the state through UI interactions
4. Refresh the page and verify state persists
5. Test state manipulation methods in the console

### 2. Component Testing

Test each major component of the application to ensure they function correctly.

#### Story Navigator Testing:
1. Create, edit, and delete plot threads
2. Add, edit, and delete story beats
3. Test reveal/hide functionality
4. Verify relationship visualization

#### Character Manager Testing:
1. Create, edit, and delete PCs and NPCs
2. Test character filtering and sorting
3. Verify character relationships
4. Test character detail display

#### Combat Console Testing:
1. Create a new encounter
2. Add combatants and roll initiative
3. Run through combat turns
4. Apply and remove conditions
5. End combat and verify state

### 3. Cross-Browser Testing

Test the application in different browsers to ensure compatibility.

#### Browsers to Test:
- Google Chrome
- Mozilla Firefox
- Apple Safari
- Microsoft Edge

#### Features to Test in Each Browser:
- State persistence
- Tab navigation
- Focus mode
- Import/Export functionality
- Responsive layout

### 4. Performance Testing

Test the application's performance with different data loads.

#### Test Cases:
- Small dataset (default)
- Medium dataset (generated)
- Large dataset (generated)

#### Metrics to Monitor:
- Initial load time
- UI responsiveness
- Memory usage
- localStorage performance

## Test Data

### Sample Campaign Data

The application includes sample campaign data for testing:

```json
{
    "id": "campaign-001",
    "name": "The Lost Mines of Phandelver",
    "description": "A D&D 5E starter campaign for levels 1-5",
    "currentLocation": "Phandalin",
    "chapters": [
        {
            "id": "chapter-001",
            "title": "Goblin Arrows",
            "description": "The adventure begins on the road to Phandalin",
            "locations": [
                {
                    "id": "loc-001",
                    "name": "Goblin Ambush",
                    "description": "A hidden ambush along the Triboar Trail",
                    "notes": "Two dead horses lie across the trail..."
                }
            ],
            "npcs": [
                {
                    "id": "npc-001",
                    "name": "Sildar Hallwinter",
                    "role": "Quest Giver",
                    "status": "Captured"
                }
            ]
        }
    ],
    "activeChapterId": "chapter-001",
    "partyLevel": 1,
    "createdAt": "2024-03-07T12:00:00Z",
    "lastModified": "2024-03-07T12:00:00Z"
}
```

### Generated Test Data

The Test Data Generator can create more complex datasets for testing:

- Small dataset: 3 threads, 5 beats per thread, 10 characters
- Large dataset: 20 threads, 50 beats per thread, 100 characters

## Bug Reporting

When reporting bugs, include the following information:

1. **Bug Description**: Clear description of the issue
2. **Steps to Reproduce**: Numbered steps to reproduce the bug
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, screen size
6. **Screenshots**: If applicable
7. **Test Data**: What data was being used when the bug occurred

## Test Case Execution

1. Open the application with the Test Runner
2. Select a test category to focus on
3. Execute each test case manually
4. Mark the test as Pass, Fail, or Skip
5. For failed tests, document the issue in the bug report
6. Export test results when complete

## Continuous Testing Process

1. Run the full test suite before each significant code change
2. Document any failures or unexpected behavior
3. Verify fixes don't introduce new issues
4. Update test cases as features evolve
5. Maintain test coverage as the application grows

## Performance Benchmarks

The application should meet these performance targets:

- Initial load time: < 2 seconds
- State update time: < 100ms
- Memory usage: < 50MB for normal usage
- localStorage operations: < 200ms

## Accessibility Testing

Test the application for accessibility compliance:

1. Keyboard navigation
2. Screen reader compatibility
3. Color contrast
4. Text scaling

## Conclusion

This testing documentation provides a comprehensive approach to testing the DM HUD application. By following these procedures, you can ensure the application functions correctly and provides a good user experience. 