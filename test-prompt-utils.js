/**
 * Test script for promptUtils.js with the new JSON structure
 */

// Import the prompt utilities
const {
  loadPromptFramework,
  concatenatePrompt,
  updatePromptSection,
  savePromptFramework,
  flattenSections,
  findSectionById,
  getSectionsByCategory
} = require('./promptUtils.js');

// Mock fetch for testing
global.fetch = (url) => {
  return Promise.resolve({
    json: () => Promise.resolve(require('./promptFramework.json'))
  });
};

// Mock chrome storage for testing
global.chrome = {
  storage: {
    local: {
      get: (keys, callback) => {
        callback({ promptFramework: require('./promptFramework.json') });
      },
      set: (data, callback) => {
        if (callback) callback();
      }
    }
  },
  runtime: {
    getURL: (path) => path
  }
};

// Test functions
async function runTests() {
  console.log('Starting tests for promptUtils.js with new JSON structure...');
  
  try {
    // Test loading the framework
    console.log('Testing loadPromptFramework()...');
    const framework = await loadPromptFramework();
    console.log('Framework loaded successfully.');
    
    // Test flattening sections
    console.log('\nTesting flattenSections()...');
    const flatSections = flattenSections(framework);
    console.log(`Flattened sections count: ${flatSections.length}`);
    
    // Test finding sections by ID
    console.log('\nTesting findSectionById()...');
    const roleSection = findSectionById(framework, 'role');
    console.log(`Found 'role' section: ${roleSection !== null}`);
    if (roleSection) {
      console.log(`Category: ${roleSection.categoryKey}`);
      console.log(`Index: ${roleSection.sectionIndex}`);
    }
    
    // Test getting sections by category
    console.log('\nTesting getSectionsByCategory()...');
    const personalitySections = getSectionsByCategory(framework, 'personality');
    console.log(`Personality sections count: ${personalitySections.length}`);
    
    // Test concatenating prompt
    console.log('\nTesting concatenatePrompt()...');
    const articleText = 'This is a test article.';
    const prompt = concatenatePrompt(framework, articleText);
    console.log('Prompt concatenated successfully.');
    console.log(`Prompt length: ${prompt.length} characters`);
    
    // Test updating a section
    console.log('\nTesting updatePromptSection()...');
    const newContent = 'Updated role content for testing.';
    const updatedFramework = updatePromptSection(framework, 'role', newContent);
    const updatedRoleSection = findSectionById(updatedFramework, 'role');
    const contentMatches = updatedRoleSection && updatedRoleSection.section.content === newContent;
    console.log(`Section updated successfully: ${contentMatches}`);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

// Run the tests
runTests();
