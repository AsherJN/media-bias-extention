/**
 * Utility functions for working with the prompt framework JSON
 */

/**
 * Loads the prompt framework from the JSON file
 * @returns {Promise<Object>} The prompt framework object
 */
async function loadPromptFramework() {
  return new Promise((resolve, reject) => {
    try {
      // Check if running in Chrome extension context
      const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
      
      if (isExtension) {
        // Load from Chrome storage
        chrome.storage.local.get(['promptFramework'], (data) => {
          if (data.promptFramework) {
            resolve(data.promptFramework);
          } else {
            // If not in storage, fetch from file and store it
            fetch(chrome.runtime.getURL('promptFramework.json'))
              .then(response => response.json())
              .then(framework => {
                // Store in Chrome storage for future use
                chrome.storage.local.set({ promptFramework: framework });
                resolve(framework);
              })
              .catch(error => {
                console.error('Error loading prompt framework from file:', error);
                reject(error);
              });
          }
        });
      } else {
        // Not in extension context, fetch directly from file
        fetch('promptFramework.json')
          .then(response => response.json())
          .then(framework => resolve(framework))
          .catch(error => {
            console.error('Error loading prompt framework from file:', error);
            reject(error);
          });
      }
    } catch (error) {
      console.error('Error in loadPromptFramework:', error);
      reject(error);
    }
  });
}

/**
 * Flattens the nested sections structure into a single array
 * @param {Object} framework - The prompt framework object
 * @returns {Array} Array of all sections from all categories
 */
function flattenSections(framework) {
  try {
    const flatSections = [];
    
    // Iterate through each category
    for (const categoryKey in framework.sections) {
      const category = framework.sections[categoryKey];
      if (category.items && Array.isArray(category.items)) {
        // Add all items from this category to the flat array
        flatSections.push(...category.items);
      }
    }
    
    return flatSections;
  } catch (error) {
    console.error('Error in flattenSections:', error);
    throw error;
  }
}

/**
 * Concatenates the prompt framework sections into a complete prompt object with system and user content
 * @param {Object} framework - The prompt framework object
 * @param {string} articleText - The article text to insert into the prompt
 * @returns {Object} Object containing systemContent and userContent
 */
function concatenatePrompt(framework, articleText) {
  try {
    // Get all sections from all categories and flatten them
    const allSections = flattenSections(framework);
    
    // Sort sections by order
    const sortedSections = [...allSections].sort((a, b) => a.order - b.order);
    
    // Delimiter line
    const delimiter = '────────────────────────────────────────────────────────────────────────';
    
    // Find the article_text section
    const articleTextSection = allSections.find(section => section.id === 'article_text');
    
    // Build the system content (everything except the article text)
    let systemContent = '';
    
    // Build the user content (just the article text)
    let userContent = articleText;
    
    sortedSections.forEach((section, index) => {
      // Skip the article_text section as we'll handle it separately
      if (section.id === 'article_text') {
        return;
      }
      
      // Add section content to system content
      let sectionContent = section.content;
      
      // Replace article_text placeholder if present (shouldn't happen, but just in case)
      if (section.has_placeholder && section.placeholder === '{article_text}') {
        sectionContent = sectionContent.replace('{article_text}', '[ARTICLE_TEXT_PLACEHOLDER]');
      }
      
      systemContent += sectionContent;
      
      // Add delimiter after each section except the last one
      if (index < sortedSections.length - 1) {
        systemContent += '\n\n' + delimiter + '\n\n';
      }
    });
    
    return {
      systemContent,
      userContent
    };
  } catch (error) {
    console.error('Error in concatenatePrompt:', error);
    throw error;
  }
}

/**
 * Finds a section by ID in the nested structure
 * @param {Object} framework - The prompt framework object
 * @param {string} sectionId - The ID of the section to find
 * @returns {Object} Object containing the section, its category, and its index
 */
function findSectionById(framework, sectionId) {
  try {
    // Search in each category
    for (const categoryKey in framework.sections) {
      const category = framework.sections[categoryKey];
      if (category.items && Array.isArray(category.items)) {
        const sectionIndex = category.items.findIndex(section => section.id === sectionId);
        
        if (sectionIndex !== -1) {
          return {
            section: category.items[sectionIndex],
            categoryKey: categoryKey,
            sectionIndex: sectionIndex
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in findSectionById:', error);
    throw error;
  }
}

/**
 * Updates a section in the prompt framework
 * @param {Object} framework - The prompt framework object
 * @param {string} sectionId - The ID of the section to update
 * @param {string} newContent - The new content for the section
 * @returns {Object} The updated framework object
 */
function updatePromptSection(framework, sectionId, newContent) {
  try {
    const updatedFramework = JSON.parse(JSON.stringify(framework)); // Deep copy
    
    // Find the section to update
    const sectionInfo = findSectionById(updatedFramework, sectionId);
    
    if (!sectionInfo) {
      throw new Error(`Section with ID "${sectionId}" not found`);
    }
    
    // Update the section content
    updatedFramework.sections[sectionInfo.categoryKey].items[sectionInfo.sectionIndex].content = newContent;
    
    // Update the last_updated timestamp
    updatedFramework.metadata.last_updated = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    return updatedFramework;
  } catch (error) {
    console.error('Error in updatePromptSection:', error);
    throw error;
  }
}

/**
 * Updates a section title in the prompt framework
 * @param {Object} framework - The prompt framework object
 * @param {string} sectionId - The ID of the section to update
 * @param {string} newTitle - The new title for the section
 * @returns {Object} The updated framework object
 */
function updateSectionTitle(framework, sectionId, newTitle) {
  try {
    const updatedFramework = JSON.parse(JSON.stringify(framework)); // Deep copy
    
    // Find the section to update
    const sectionInfo = findSectionById(updatedFramework, sectionId);
    
    if (!sectionInfo) {
      throw new Error(`Section with ID "${sectionId}" not found`);
    }
    
    // Update the section title
    updatedFramework.sections[sectionInfo.categoryKey].items[sectionInfo.sectionIndex].title = newTitle;
    
    // Update the last_updated timestamp
    updatedFramework.metadata.last_updated = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    return updatedFramework;
  } catch (error) {
    console.error('Error in updateSectionTitle:', error);
    throw error;
  }
}

/**
 * Saves the prompt framework to storage
 * @param {Object} framework - The prompt framework object to save
 * @returns {Promise<void>}
 */
async function savePromptFramework(framework) {
  return new Promise((resolve, reject) => {
    try {
      // Check if running in Chrome extension context
      const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
      
      if (isExtension) {
        // Save to Chrome storage
        chrome.storage.local.set({ promptFramework: framework }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // Not in extension context, log a warning
        console.warn('Cannot save prompt framework: Not in Chrome extension context');
        resolve();
      }
    } catch (error) {
      console.error('Error in savePromptFramework:', error);
      reject(error);
    }
  });
}

/**
 * Gets all sections from a specific category
 * @param {Object} framework - The prompt framework object
 * @param {string} categoryKey - The key of the category to get sections from
 * @returns {Array} Array of sections from the specified category
 */
function getSectionsByCategory(framework, categoryKey) {
  try {
    // Get sections from the specified category
    if (framework.sections[categoryKey] && framework.sections[categoryKey].items) {
      return framework.sections[categoryKey].items;
    }
    
    return [];
  } catch (error) {
    console.error('Error in getSectionsByCategory:', error);
    throw error;
  }
}

// Export functions if in a module context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadPromptFramework,
    concatenatePrompt,
    updatePromptSection,
    updateSectionTitle,
    savePromptFramework,
    flattenSections,
    findSectionById,
    getSectionsByCategory
  };
}
