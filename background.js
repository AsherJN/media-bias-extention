console.log("Background script running.");

// Import the prompt utilities
importScripts('promptUtils.js');

// Initialize the prompt framework in Chrome storage when the extension is installed
chrome.runtime.onInstalled.addListener(async () => {
  try {
    // Check if prompt framework already exists in storage
    const data = await chrome.storage.local.get(['promptFramework']);
    
    // If not, initialize with default prompt framework from file
    if (!data.promptFramework) {
      // Fetch the prompt framework from the JSON file
      const response = await fetch(chrome.runtime.getURL('promptFramework.json'));
      const promptFramework = await response.json();
      
      // Store in Chrome storage
      chrome.storage.local.set({ promptFramework });
      console.log("Default prompt framework initialized in storage");
    }
  } catch (error) {
    console.error("Error initializing prompt framework:", error);
  }
});

// Register the side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for extension icon clicks to open the side panel
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel when the extension icon is clicked
  chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle request for default prompt
  if (request.action === "getDefaultPrompt") {
    // Load the prompt framework and generate the full prompt
    loadPromptFramework()
      .then(framework => {
        const promptObj = concatenatePrompt(framework, "{article_text}");
        
        // For backward compatibility, also generate a full prompt string
        const allSections = flattenSections(framework);
        const sortedSections = [...allSections].sort((a, b) => a.order - b.order);
        const delimiter = '────────────────────────────────────────────────────────────────────────';
        
        let fullPrompt = '';
        sortedSections.forEach((section, index) => {
          let sectionContent = section.content;
          if (section.has_placeholder && section.placeholder === '{article_text}') {
            sectionContent = sectionContent.replace('{article_text}', "{article_text}");
          }
          
          fullPrompt += sectionContent;
          
          if (index < sortedSections.length - 1) {
            fullPrompt += '\n\n' + delimiter + '\n\n';
          }
        });
        
        sendResponse({ 
          defaultPrompt: fullPrompt,
          promptObj: promptObj
        });
      })
      .catch(error => {
        console.error("Error generating default prompt:", error);
        sendResponse({ error: "Failed to generate default prompt" });
      });
    
    return true; // Keep the message channel open for async response
  }
  
  // Handle request for prompt framework
  if (request.action === "getPromptFramework") {
    loadPromptFramework()
      .then(framework => {
        sendResponse({ promptFramework: framework });
      })
      .catch(error => {
        console.error("Error loading prompt framework:", error);
        sendResponse({ error: "Failed to load prompt framework" });
      });
    
    return true; // Keep the message channel open for async response
  }
  
  // Handle request to update prompt framework
  if (request.action === "updatePromptFramework") {
    savePromptFramework(request.promptFramework)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error("Error saving prompt framework:", error);
        sendResponse({ error: "Failed to save prompt framework" });
      });
    
    return true; // Keep the message channel open for async response
  }
});
