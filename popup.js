document.addEventListener("DOMContentLoaded", async () => {
  // Check if running in Chrome extension context
  const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  
  // Add click event listener to the logo
  const logoElement = document.querySelector('.header-logo');
  if (logoElement) {
    logoElement.addEventListener('click', () => {
      // Reset the view to initial state
      document.getElementById("results").style.display = "none";
      document.getElementById("bias-meter-container").style.display = "none";
      document.getElementById("loading").style.display = "none";
      document.getElementById("progress-updates-container").style.display = "none";
      
      // Hide notification banner
      const notificationBanner = document.getElementById("notification-banner");
      notificationBanner.style.display = "none";
      notificationBanner.style.opacity = "0";
      
      // If in extension context, clear stored results
      if (isExtension) {
        chrome.storage.local.remove(['analysisResults', 'analyzedUrl']);
      }
    });
  }
  
  if (isExtension) {
    // On side panel load, check for saved analysis results and display if present
    chrome.storage.local.get(['analysisResults', 'analyzedUrl'], (data) => {
      if (data.analysisResults) {
        displayResults(data.analysisResults);
        document.getElementById("results").style.display = "block";
        
        // Check if the current URL matches the analyzed URL
        checkUrlAndShowNotification();
      }
    });
    
    // Get the current active tab when the side panel is opened
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        console.log("Side panel opened for tab:", tabs[0].url);
        
        // Check if the current URL matches the analyzed URL
        checkUrlAndShowNotification();
      }
    } catch (error) {
      console.log("Error querying tabs:", error);
    }
    
    // Listen for tab updates to check URL changes
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
        checkUrlAndShowNotification();
      }
    });
  }
  
  // Function to check if current URL matches the analyzed URL and show notification if needed
  function checkUrlAndShowNotification() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const currentUrl = tabs[0].url;
        
        chrome.storage.local.get(['analyzedUrl', 'analysisResults'], (data) => {
          const notificationBanner = document.getElementById('notification-banner');
          const resultsContainer = document.getElementById('results');
          
          // If we have analysis results but URL doesn't match, show notification
          if (data.analysisResults && data.analyzedUrl && data.analyzedUrl !== currentUrl) {
            notificationBanner.style.display = 'block';
            notificationBanner.style.opacity = '1';
            
            // Adjust the results container padding to make room for the banner
            // Header height + banner height + small gap
            // resultsContainer.style.paddingTop = '160px';
          } else {
            notificationBanner.style.display = 'none';
            notificationBanner.style.opacity = '0';
            
            // Reset padding when banner is hidden
            // resultsContainer.style.paddingTop = '110px';
          }
        });
      }
    });
  }

  // Settings toggle functionality
  const settingsIcon = document.getElementById("settings-icon");
  const settingsPage = document.getElementById("settings-page");
  const settingsClose = document.getElementById("settings-close");

  // Toggle settings page when settings icon is clicked
  settingsIcon.addEventListener("click", () => {
    settingsPage.style.display = "flex";
  });

  // Close settings page when close button is clicked
  settingsClose.addEventListener("click", () => {
    settingsPage.style.display = "none";
  });

  // History page functionality
  const historyButton = document.getElementById("history-button");
  const historyPage = document.getElementById("history-page");
  const historyBack = document.getElementById("history-back");

  // Show history page when history button is clicked
  historyButton.addEventListener("click", () => {
    historyPage.style.display = "flex";
    displayHistoryEntries();
  });

  // Return to settings page when back button is clicked
  historyBack.addEventListener("click", () => {
    historyPage.style.display = "none";
  });
  
  // Prompt view page functionality
  const viewPromptButton = document.getElementById("view-prompt-button");
  const promptViewPage = document.getElementById("prompt-view-page");
  const promptBack = document.getElementById("prompt-back");
  
  // Show prompt view page when view prompt button is clicked
  viewPromptButton.addEventListener("click", () => {
    promptViewPage.style.display = "flex";
    fetchAndDisplayPrompt();
  });
  
  // Return to settings page when back button is clicked
  promptBack.addEventListener("click", () => {
    promptViewPage.style.display = "none";
  });
  
  // Advanced Settings page functionality
  const advancedSettingsButton = document.getElementById("advanced-settings-button");
  const advancedSettingsPage = document.getElementById("advanced-settings-page");
  const advancedSettingsBack = document.getElementById("advanced-settings-back");
  
  // Show advanced settings page when advanced settings button is clicked
  advancedSettingsButton.addEventListener("click", () => {
    advancedSettingsPage.style.display = "flex";
    loadFullPrompt();
  });
  
  // Return to prompt view page when back button is clicked
  advancedSettingsBack.addEventListener("click", () => {
    advancedSettingsPage.style.display = "none";
  });
  
  // Function to load the full prompt into the textarea
  async function loadFullPrompt() {
    try {
      // Get the full prompt from storage
      const prompt = await getStoredPrompt();
      
      // Display the full prompt in the textarea
      document.getElementById("full-prompt-textarea").value = prompt;
      
      // Set up event listeners for save and reset buttons
      document.getElementById("full-prompt-save").addEventListener("click", saveFullPrompt);
      document.getElementById("full-prompt-reset").addEventListener("click", resetFullPrompt);
    } catch (error) {
      console.error("Error loading full prompt:", error);
      alert("Error loading prompt: " + error.message);
    }
  }
  
  // Function to save the full prompt
  async function saveFullPrompt() {
    try {
      const fullPromptTextarea = document.getElementById("full-prompt-textarea");
      const fullPrompt = fullPromptTextarea.value.trim();
      
      // Validate that the prompt contains the article_text placeholder
      if (!fullPrompt.includes("{article_text}")) {
        if (!confirm("Warning: The prompt does not contain the {article_text} placeholder. This is required for the extension to work properly. Do you want to add it automatically?")) {
          return; // User cancelled
        }
        
        // Add the placeholder at the end of the prompt
        fullPromptTextarea.value = fullPrompt + "\n\n{article_text}";
      }
      
      // Parse the new prompt into sections and dashboard items
      const sections = parsePromptIntoSections(fullPromptTextarea.value);
      const dashboardItems = parsePromptIntoDashboardItems(fullPromptTextarea.value);
      
      // Update the global dashboard items
      window.dashboardItems = dashboardItems;
      
      // Save the full prompt to storage
      chrome.storage.local.set({ 
        biasAnalysisPrompt: fullPromptTextarea.value,
        promptSections: sections,
        dashboardItems: dashboardItems,
        lastPromptUpdate: Date.now()
      }, () => {
        alert("Full prompt saved successfully!");
        
        // Update the section textareas in the prompt view page
        populatePromptEditorFields(sections);
        
        // Render the dashboard items list
        renderDashboardItemsList(dashboardItems);
      });
    } catch (error) {
      console.error("Error saving full prompt:", error);
      alert("Error saving prompt: " + error.message);
    }
  }
  
  // Function to reset the full prompt to default
  async function resetFullPrompt() {
    try {
      if (confirm("Are you sure you want to reset the prompt to default? All customizations will be lost.")) {
        // Get the default prompt from background script
        chrome.runtime.sendMessage({ action: "getDefaultPrompt" }, (response) => {
          if (response && response.defaultPrompt) {
            // Display the default prompt in the textarea
            document.getElementById("full-prompt-textarea").value = response.defaultPrompt;
            
            // Parse the default prompt into sections and dashboard items
            const sections = parsePromptIntoSections(response.defaultPrompt);
            const dashboardItems = parsePromptIntoDashboardItems(response.defaultPrompt);
            
            // Update the global dashboard items
            window.dashboardItems = dashboardItems;
            
            // Save the default prompt to storage
            chrome.storage.local.set({ 
              biasAnalysisPrompt: response.defaultPrompt,
              promptSections: sections,
              dashboardItems: dashboardItems,
              lastPromptUpdate: Date.now()
            }, () => {
              alert("Prompt reset to default!");
              
              // Update the section textareas in the prompt view page
              populatePromptEditorFields(sections);
              
              // Render the dashboard items list
              renderDashboardItemsList(dashboardItems);
            });
          } else {
            console.error("Failed to get default prompt");
            alert("Failed to get default prompt");
          }
        });
      }
    } catch (error) {
      console.error("Error resetting full prompt:", error);
      alert("Error resetting prompt: " + error.message);
    }
  }
  
  // Function to get the stored prompt from Chrome storage
  async function getStoredPrompt() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['biasAnalysisPrompt'], (data) => {
        if (data.biasAnalysisPrompt) {
          resolve(data.biasAnalysisPrompt);
        } else {
          // If prompt not found in storage, fetch from backend as fallback
          fetchPromptFromBackend()
            .then(prompt => {
              // Store the fetched prompt for future use
              chrome.storage.local.set({ biasAnalysisPrompt: prompt });
              resolve(prompt);
            })
            .catch(error => {
              console.error("Error fetching prompt from backend:", error);
              // Use a minimal fallback prompt if all else fails
              const fallbackPrompt = `
Role: You are a highly vigilant internet watchdog who's main priority is to assist users in navigating media bias that may be present in the news/media that people consume.

[This is a preview of the AI prompt used for bias analysis. The full prompt contains detailed instructions for analyzing article bias across multiple dimensions.]
`;
              resolve(fallbackPrompt);
            });
        }
      });
    });
  }
  
  // Function to parse the prompt into dashboard items
  function parsePromptIntoDashboardItems(prompt) {
    const dashboardItems = [];
    
    // Regex to find all dashboard items
    const dashboardItemRegex = /\*\*Dashboard Item (\d+)\*\*([\s\S]*?)(?=\*\*Dashboard Item \d+\*\*|────+|Listed below, delimited by triple dashes|$)/g;
    
    let match;
    while ((match = dashboardItemRegex.exec(prompt)) !== null) {
      const itemNumber = match[1];
      const itemContent = match[2].trim();
      
      // Extract individual fields
      const titleMatch = itemContent.match(/Title:\s*(.*?)(?=\n|$)/);
      const jsonIdMatch = itemContent.match(/JSON ID:\s*(.*?)(?=\n|$)/);
      const wordCountMatch = itemContent.match(/Word Count:\s*(.*?)(?=\n|$)/);
      const definitionMatch = itemContent.match(/Definition:\s*([\s\S]*?)(?=How to Assess:|$)/);
      const howToAssessMatch = itemContent.match(/How to Assess:\s*([\s\S]*?)(?=Key Questions:|$)/);
      const keyQuestionsMatch = itemContent.match(/Key Questions:\s*([\s\S]*?)(?=$)/);
      
      const dashboardItem = {
        itemNumber,
        title: titleMatch ? titleMatch[1].trim() : "",
        jsonId: jsonIdMatch ? jsonIdMatch[1].trim() : "",
        wordCount: wordCountMatch ? wordCountMatch[1].trim() : "",
        definition: definitionMatch ? definitionMatch[1].trim() : "",
        howToAssess: howToAssessMatch ? howToAssessMatch[1].trim() : "",
        keyQuestions: keyQuestionsMatch ? keyQuestionsMatch[1].trim() : ""
      };
      
      dashboardItems.push(dashboardItem);
    }
    
    return dashboardItems;
  }

  // Function to fetch the prompt from the backend (used as fallback)
  async function fetchPromptFromBackend() {
    const response = await fetch("http://127.0.0.1:5000/get-prompt");
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.prompt;
  }

  // Function to parse the prompt into sections
  function parsePromptIntoSections(prompt) {
    // Default empty sections
    const sections = {
      role: "",
      context: "",
      overallBiasScore: "",
      languageTone: "",
      framingPerspective: "",
      alternativePerspectives: "",
      task: "",
      outputInstructions: "",
      outputExample: ""
    };
    
    try {
      // Regular expressions to match each section
      const roleRegex = /Role:\s*([\s\S]*?)(?=Context:|────+|$)/i;
      const contextRegex = /Context:\s*([\s\S]*?)(?=\*\*Dashboard Item 1\*\*|────+|$)/i;
      const taskRegex = /Task \(step‑by‑step\):\s*([\s\S]*?)(?=Required JSON Schema|$)/i;
      const outputSchemaRegex = /Required JSON Schema\s*([\s\S]*?)(?=$)/i;
      
      // Extract each section using regex
      const roleMatch = prompt.match(roleRegex);
      if (roleMatch) sections.role = roleMatch[1].trim();
      
      const contextMatch = prompt.match(contextRegex);
      if (contextMatch) sections.context = contextMatch[1].trim();
      
      // Extract dashboard items
      const dashboardItems = parsePromptIntoDashboardItems(prompt);
      
      // Find specific dashboard items by their item number
      const biasScoreItem = dashboardItems.find(item => item.itemNumber === "1");
      const languageToneItem = dashboardItems.find(item => item.itemNumber === "5");
      const framingItem = dashboardItems.find(item => item.itemNumber === "6");
      const alternativesItem = dashboardItems.find(item => item.itemNumber === "7");
      
      // Format dashboard items for sections
      if (biasScoreItem) {
        sections.overallBiasScore = formatDashboardItemForSection(biasScoreItem);
      }
      
      if (languageToneItem) {
        sections.languageTone = formatDashboardItemForSection(languageToneItem);
      }
      
      if (framingItem) {
        sections.framingPerspective = formatDashboardItemForSection(framingItem);
      }
      
      if (alternativesItem) {
        sections.alternativePerspectives = formatDashboardItemForSection(alternativesItem);
      }
      
      // For task, we'll use the Task section
      const taskMatch = prompt.match(taskRegex);
      if (taskMatch) sections.task = taskMatch[1].trim();
      
      // For output instructions and example, we'll extract from the JSON schema
      const outputSchemaMatch = prompt.match(outputSchemaRegex);
      if (outputSchemaMatch) {
        sections.outputInstructions = "Your output is strictly supposed to be in JSON formatting and your output should contain nothing else beyond the JSON content.";
        sections.outputExample = outputSchemaMatch[1].trim();
      }
      
      console.log("Parsed prompt into sections successfully");
    } catch (error) {
      console.error("Error parsing prompt into sections:", error);
    }
    
    return sections;
  }
  
  // Helper function to format a dashboard item for a section
  function formatDashboardItemForSection(item) {
    return `**Dashboard Item ${item.itemNumber}**
Title: ${item.title}
JSON ID: ${item.jsonId}
${item.wordCount ? `Word Count: ${item.wordCount}` : ''}
Definition: ${item.definition}

How to Assess:
${item.howToAssess}

Key Questions:   
${item.keyQuestions}`;
  }
  
  // Function to concatenate sections into a full prompt
  function concatenatePromptSections(sections) {
    // Make sure the task section includes the article_text placeholder
    let taskSection = sections.task;
    
    // Check if the task section or alternatives section already contains the placeholder
    const hasPlaceholder = taskSection.includes("{article_text}") || 
                          sections.alternativePerspectives.includes("{article_text}");
    
    // If not, ensure we add the placeholder in the proper format
    if (!hasPlaceholder) {
      // Add the article text placeholder with proper formatting
      if (!taskSection.includes("Listed below, delimited by triple dashes")) {
        taskSection = taskSection.trim() + "\n\nListed below, delimited by triple dashes, is the **full text** of the news article you will analyze. **Do not modify it.**\n---\n{article_text}\n---";
      }
    }
    
    // Format the prompt according to the new structure
    return `
Role: ${sections.role}

────────────────────────────────────────────────────────────────────────

Context: ${sections.context}

────────────────────────────────────────────────────────────────────────

${sections.overallBiasScore}

────────────────────────────────────────────────────────────────────────

${sections.languageTone}

────────────────────────────────────────────────────────────────────────

${sections.framingPerspective}

────────────────────────────────────────────────────────────────────────

${sections.alternativePerspectives}

────────────────────────────────────────────────────────────────────────

Task (step‑by‑step): ${taskSection}

Required JSON Schema

${sections.outputExample}
`.trim();
  }
  
  // Function to populate the prompt editor fields
  function populatePromptEditorFields(sections) {
    // Safely set value for each element, checking if it exists first
    const setValueIfElementExists = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value || '';
      }
    };
    
    // Safely set text content for each element, checking if it exists first
    const setTextContentIfElementExists = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value || '';
      }
    };
    
    // Set values for all textarea elements
    setValueIfElementExists("prompt-role", sections.role);
    setValueIfElementExists("prompt-context", sections.context);
    setValueIfElementExists("prompt-bias-score", sections.overallBiasScore);
    setValueIfElementExists("prompt-language-tone", sections.languageTone);
    setValueIfElementExists("prompt-framing", sections.framingPerspective);
    setValueIfElementExists("prompt-alternatives", sections.alternativePerspectives);
    setValueIfElementExists("prompt-task", sections.task);
    
    // Populate read-only sections
    setTextContentIfElementExists("prompt-output-instructions", sections.outputInstructions);
    setTextContentIfElementExists("prompt-output-example", sections.outputExample);
    
    console.log("Populated prompt editor fields successfully");
  }
  
  // Function to get sections from the prompt editor fields
  function getSectionsFromPromptEditorFields() {
    // Safely get value from each element, checking if it exists first
    const getValueIfElementExists = (id) => {
      const element = document.getElementById(id);
      return element ? element.value.trim() : '';
    };
    
    // Safely get text content from each element, checking if it exists first
    const getTextContentIfElementExists = (id) => {
      const element = document.getElementById(id);
      return element ? element.textContent.trim() : '';
    };
    
    return {
      role: getValueIfElementExists("prompt-role"),
      context: getValueIfElementExists("prompt-context"),
      overallBiasScore: getValueIfElementExists("prompt-bias-score"),
      languageTone: getValueIfElementExists("prompt-language-tone"),
      framingPerspective: getValueIfElementExists("prompt-framing"),
      alternativePerspectives: getValueIfElementExists("prompt-alternatives"),
      task: getValueIfElementExists("prompt-task"),
      outputInstructions: getTextContentIfElementExists("prompt-output-instructions"),
      outputExample: getTextContentIfElementExists("prompt-output-example")
    };
  }
  
  // Function to save the prompt to Chrome storage
  async function savePromptToStorage() {
    const sections = getSectionsFromPromptEditorFields();
    const dashboardItems = window.dashboardItems || [];
    const fullPrompt = concatenatePromptSectionsWithItems(sections, dashboardItems);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ 
        biasAnalysisPrompt: fullPrompt,
        promptSections: sections,
        dashboardItems: dashboardItems,
        lastPromptUpdate: Date.now()
      }, () => {
        resolve();
      });
    });
  }
  
  // Function to reset the prompt to default
  async function resetPromptToDefault() {
    return new Promise((resolve) => {
      // Get the default prompt from background script
      chrome.runtime.sendMessage({ action: "getDefaultPrompt" }, (response) => {
        if (response && response.defaultPrompt) {
          // Parse the default prompt into sections
          const sections = parsePromptIntoSections(response.defaultPrompt);
          
          // Parse the default prompt into dashboard items
          const dashboardItems = parsePromptIntoDashboardItems(response.defaultPrompt);
          
          // Update the global dashboard items
          window.dashboardItems = dashboardItems;
          
          // Save to storage
          chrome.storage.local.set({ 
            biasAnalysisPrompt: response.defaultPrompt,
            promptSections: sections,
            dashboardItems: dashboardItems,
            lastPromptUpdate: Date.now()
          }, () => {
            // Populate the editor fields
            populatePromptEditorFields(sections);
            
            // Render the dashboard items list
            renderDashboardItemsList(dashboardItems);
            
            resolve();
          });
        } else {
          console.error("Failed to get default prompt");
          resolve();
        }
      });
    });
  }
  
  // Function to render the dashboard items list
  function renderDashboardItemsList(dashboardItems) {
    const container = document.getElementById("dashboard-items-list");
    container.innerHTML = ""; // Clear existing content
    
    const template = document.getElementById("dashboard-item-template");
    
    dashboardItems.forEach((item, index) => {
      const clone = document.importNode(template.content, true);
      
      // Set item number and title
      clone.querySelector(".item-number").textContent = `Item ${item.itemNumber}:`;
      clone.querySelector(".item-title").textContent = item.title;
      
      // Set data attribute for identifying the item
      const dashboardItem = clone.querySelector(".dashboard-item");
      dashboardItem.dataset.itemIndex = index;
      
      container.appendChild(clone);
    });
    
    // Set up event listeners for the dashboard items
    setupDashboardItemsEventListeners();
  }
  
  // Function to set up event listeners for dashboard items
  function setupDashboardItemsEventListeners() {
    // Click event for item headers (expand/collapse)
    document.querySelectorAll(".dashboard-item-header").forEach(header => {
      header.addEventListener("click", function() {
        const item = this.closest(".dashboard-item");
        const content = item.querySelector(".dashboard-item-content");
        const toggleIcon = this.querySelector(".toggle-icon");
        const itemIndex = parseInt(item.dataset.itemIndex);
        
        // If content is hidden, populate fields before showing
        if (content.style.display === "none") {
          populateItemFields(content, window.dashboardItems[itemIndex]);
          content.style.display = "block";
          toggleIcon.textContent = "−";
        } else {
          content.style.display = "none";
          toggleIcon.textContent = "+";
        }
      });
    });
    
    // Save button click event
    document.querySelectorAll(".save-item-button").forEach(button => {
      button.addEventListener("click", function() {
        const item = this.closest(".dashboard-item");
        const itemIndex = parseInt(item.dataset.itemIndex);
        saveItemChanges(item, itemIndex);
      });
    });
    
    // Cancel button click event
    document.querySelectorAll(".cancel-item-button").forEach(button => {
      button.addEventListener("click", function() {
        const item = this.closest(".dashboard-item");
        const content = item.querySelector(".dashboard-item-content");
        const toggleIcon = item.querySelector(".toggle-icon");
        
        content.style.display = "none";
        toggleIcon.textContent = "+";
      });
    });
  }
  
  // Function to populate item fields with data
  function populateItemFields(contentElement, itemData) {
    contentElement.querySelector(".item-title-input").value = itemData.title;
    contentElement.querySelector(".item-json-id-input").value = itemData.jsonId;
    contentElement.querySelector(".item-word-count-input").value = itemData.wordCount;
    contentElement.querySelector(".item-definition-input").value = itemData.definition;
    contentElement.querySelector(".item-how-to-assess-input").value = itemData.howToAssess;
    contentElement.querySelector(".item-key-questions-input").value = itemData.keyQuestions;
  }
  
  // Function to save changes to an item
  function saveItemChanges(itemElement, itemIndex) {
    const content = itemElement.querySelector(".dashboard-item-content");
    const dashboardItem = window.dashboardItems[itemIndex];
    
    // Update the item data with form values
    dashboardItem.title = content.querySelector(".item-title-input").value.trim();
    dashboardItem.wordCount = content.querySelector(".item-word-count-input").value.trim();
    dashboardItem.definition = content.querySelector(".item-definition-input").value.trim();
    dashboardItem.howToAssess = content.querySelector(".item-how-to-assess-input").value.trim();
    dashboardItem.keyQuestions = content.querySelector(".item-key-questions-input").value.trim();
    
    // Update the item title in the header
    itemElement.querySelector(".item-title").textContent = dashboardItem.title;
    
    // Reconstruct the full prompt and save to storage
    const sections = getSectionsFromPromptEditorFields();
    const fullPrompt = concatenatePromptSectionsWithItems(sections, window.dashboardItems);
    
    chrome.storage.local.set({ 
      biasAnalysisPrompt: fullPrompt,
      promptSections: sections,
      dashboardItems: window.dashboardItems,
      lastPromptUpdate: Date.now()
    }, () => {
      // Show success message
      alert("Dashboard item saved successfully!");
      
      // Close the dropdown
      content.style.display = "none";
      itemElement.querySelector(".toggle-icon").textContent = "+";
    });
  }
  
  // Function to concatenate sections and dashboard items into a full prompt
  function concatenatePromptSectionsWithItems(sections, dashboardItems) {
    // Make sure the task section includes the article_text placeholder
    let taskSection = sections.task;
    
    // Check if the task section already contains the placeholder
    const hasPlaceholder = taskSection.includes("{article_text}");
    
    // If not, ensure we add the placeholder in the proper format
    if (!hasPlaceholder) {
      // Add the article text placeholder with proper formatting
      if (!taskSection.includes("Listed below, delimited by triple dashes")) {
        taskSection = taskSection.trim() + "\n\nListed below, delimited by triple dashes, is the **full text** of the news article you will analyze. **Do not modify it.**\n---\n{article_text}\n---";
      }
    }
    
    // Build the dashboard items section
    let dashboardItemsText = "";
    
    // Sort dashboard items by item number to ensure correct order
    const sortedItems = [...dashboardItems].sort((a, b) => parseInt(a.itemNumber) - parseInt(b.itemNumber));
    
    sortedItems.forEach((item, index) => {
      // Format the dashboard item
      const formattedItem = `
**Dashboard Item ${item.itemNumber}**
Title: ${item.title}
JSON ID: ${item.jsonId}
${item.wordCount ? `Word Count: ${item.wordCount}` : ''}
Definition: ${item.definition}

How to Assess:
${item.howToAssess}

Key Questions:   
${item.keyQuestions}
`;
      
      dashboardItemsText += formattedItem;
      
      // Add separator between items (except after the last one)
      if (index < sortedItems.length - 1) {
        dashboardItemsText += "\n\n────────────────────────────────────────────────────────────────────────\n\n";
      }
    });
    
    // Format the prompt according to the new structure
    const fullPrompt = `
Role: ${sections.role}

────────────────────────────────────────────────────────────────────────

Context: ${sections.context}

────────────────────────────────────────────────────────────────────────

${dashboardItemsText}

────────────────────────────────────────────────────────────────────────

Task (step‑by‑step): ${taskSection}

Required JSON Schema

${sections.outputExample}
`.trim();

    console.log("Rebuilt prompt successfully");
    return fullPrompt;
  }
  
  // Function to fetch and display the AI bias prompt
  async function fetchAndDisplayPrompt() {
    try {
      // Get prompt from Chrome storage
      const prompt = await getStoredPrompt();
      
      // Parse the prompt into sections
      const sections = parsePromptIntoSections(prompt);
      
      // Parse the prompt into dashboard items
      const dashboardItems = parsePromptIntoDashboardItems(prompt);
      
      // Store the items in memory for later use
      window.dashboardItems = dashboardItems;
      
      // Populate the editor fields
      populatePromptEditorFields(sections);
      
      // Render the dashboard items list
      renderDashboardItemsList(dashboardItems);
      
      // Set up event listeners for the save and reset buttons
      document.getElementById("prompt-save").addEventListener("click", async () => {
        await savePromptToStorage();
        alert("Prompt saved successfully!");
      });
      
      document.getElementById("prompt-reset").addEventListener("click", async () => {
        if (confirm("Are you sure you want to reset the prompt to default? All customizations will be lost.")) {
          await resetPromptToDefault();
          alert("Prompt reset to default!");
        }
      });
      
      // Set up auto-save for text fields
      const textareas = document.querySelectorAll(".prompt-textarea");
      textareas.forEach(textarea => {
        textarea.addEventListener("blur", async () => {
          await savePromptToStorage();
          console.log("Prompt auto-saved");
        });
      });
      
    } catch (error) {
      console.error("Error fetching prompt:", error);
      alert("Error loading prompt: " + error.message);
    }
  }
  
  // History menu functionality
  const historyMenu = document.getElementById("history-menu");
  const historyMenuDropdown = document.getElementById("history-menu-dropdown");
  
  // Toggle history menu dropdown when menu icon is clicked
  historyMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    historyMenuDropdown.style.display = historyMenuDropdown.style.display === 'none' ? 'block' : 'none';
  });
  
  // Clear history when clear option is clicked
  document.getElementById("clear-history").addEventListener("click", () => {
    clearAllHistory();
  });
  
  // Close dropdown when clicking elsewhere
  document.addEventListener("click", () => {
    historyMenuDropdown.style.display = 'none';
    
    // Also close any entry option dropdowns
    document.querySelectorAll('.entry-dropdown').forEach(dropdown => {
      dropdown.style.display = 'none';
    });
  });

  // Function to display history entries
  function displayHistoryEntries() {
    const historyContent = document.querySelector('.history-content');
    
    // Clear existing content
    historyContent.innerHTML = '';
    
    // Check if running in Chrome extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    
    if (!isExtension) {
      historyContent.innerHTML = '<p>History feature requires the Chrome extension environment to work properly.</p>';
      return;
    }
    
    // Get history from storage
    chrome.storage.local.get('analysisHistory', (data) => {
      const history = data.analysisHistory || [];
      
      if (history.length === 0) {
        historyContent.innerHTML = '<p>No analysis history yet.</p>';
        return;
      }
      
      // Create container for history entries
      const entriesContainer = document.createElement('div');
      entriesContainer.className = 'history-entries';
      
      // Create each history entry
      history.forEach(entry => {
        const entryElement = createHistoryEntryElement(entry);
        entriesContainer.appendChild(entryElement);
      });
      
      historyContent.appendChild(entriesContainer);
    });
  }

  // Function to create a history entry element
  function createHistoryEntryElement(entry) {
    // Create main container - change from <a> to <div> to prevent navigation on entire entry
    const entryElement = document.createElement('div');
    entryElement.className = 'history-entry';
    
    // Create favicon container
    const faviconContainer = document.createElement('div');
    faviconContainer.className = 'entry-favicon';
    
    // Create favicon image
    const favicon = document.createElement('img');
    favicon.src = entry.favicon;
    favicon.alt = 'Site Icon';
    favicon.onerror = function() {
      // Fallback if favicon fails to load
      this.src = 'icons/icon16.png';
    };
    
    faviconContainer.appendChild(favicon);
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'entry-content';
    
    // Create title (make it a link)
    const titleLink = document.createElement('a');
    titleLink.href = entry.url;
    titleLink.target = '_blank';
    titleLink.className = 'entry-title-link';
    
    const title = document.createElement('div');
    title.className = 'entry-title';
    title.textContent = entry.title;
    
    titleLink.appendChild(title);
    
    // Create date
    const date = document.createElement('div');
    date.className = 'entry-date';
    date.textContent = new Date(entry.timestamp).toLocaleString();
    
    // Create options menu
    const optionsMenu = document.createElement('div');
    optionsMenu.className = 'entry-options';
    
    const optionsIcon = document.createElement('img');
    optionsIcon.src = 'icons/three-dots-menu.svg';
    optionsIcon.alt = 'Options';
    
    optionsMenu.appendChild(optionsIcon);
    
    // Create dropdown for entry options
    const optionsDropdown = document.createElement('div');
    optionsDropdown.className = 'entry-dropdown';
    optionsDropdown.style.display = 'none';
    
    const deleteOption = document.createElement('div');
    deleteOption.className = 'entry-option';
    deleteOption.textContent = 'Delete';
    deleteOption.dataset.id = entry.id;
    
    optionsDropdown.appendChild(deleteOption);
    
    // Assemble the elements
    contentContainer.appendChild(titleLink);
    contentContainer.appendChild(date);
    
    entryElement.appendChild(faviconContainer);
    entryElement.appendChild(contentContainer);
    entryElement.appendChild(optionsMenu);
    entryElement.appendChild(optionsDropdown);
    
    // Add event listeners
    optionsMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      // Close any other open dropdowns
      document.querySelectorAll('.entry-dropdown').forEach(dropdown => {
        if (dropdown !== optionsDropdown) {
          dropdown.style.display = 'none';
        }
      });
      // Toggle this dropdown
      optionsDropdown.style.display = optionsDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    deleteOption.addEventListener('click', function(e) {
      e.stopPropagation();
      deleteHistoryEntry(entry.id);
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
      optionsDropdown.style.display = 'none';
    });
    
    return entryElement;
  }

  // Function to delete a single history entry
  function deleteHistoryEntry(entryId) {
    // Check if running in Chrome extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    
    if (!isExtension) {
      console.log("Cannot delete history entry: Extension context not available");
      return;
    }
    
    chrome.storage.local.get('analysisHistory', (data) => {
      const history = data.analysisHistory || [];
      
      // Filter out the entry with the matching ID
      const updatedHistory = history.filter(entry => entry.id !== entryId);
      
      // Save the updated history back to storage
      chrome.storage.local.set({ analysisHistory: updatedHistory }, () => {
        // Refresh the history display
        displayHistoryEntries();
      });
    });
  }

  // Function to clear all history
  function clearAllHistory() {
    // Check if running in Chrome extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    
    if (!isExtension) {
      console.log("Cannot clear history: Extension context not available");
      return;
    }
    
    // Confirm with the user before clearing
    if (confirm("Are you sure you want to clear all history?")) {
      // Clear the history by setting an empty array
      chrome.storage.local.set({ analysisHistory: [] }, () => {
        // Refresh the history display
        displayHistoryEntries();
        // Hide the dropdown
        document.getElementById('history-menu-dropdown').style.display = 'none';
      });
    }
  }

  // Function to generate a unique ID
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Function to save an entry to history
  function saveToHistory(analysis, articleInfo) {
    // Check if running in Chrome extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    
    if (!isExtension) {
      console.log("Cannot save to history: Extension context not available");
      return;
    }
    
    chrome.storage.local.get('analysisHistory', (data) => {
      const history = data.analysisHistory || [];
      
      // Create new history entry
      const historyEntry = {
        id: generateUniqueId(),
        title: articleInfo.title,
        url: articleInfo.url,
        favicon: articleInfo.favicon,
        timestamp: Date.now(),
        biasScore: analysis.bias_score
      };
      
      // Add to beginning of array (newest first)
      history.unshift(historyEntry);
      
      // Limit history to 50 entries to prevent excessive storage use
      const limitedHistory = history.slice(0, 50);
      
      // Save back to storage
      chrome.storage.local.set({ analysisHistory: limitedHistory });
    });
  }

  // Function to update progress status with fade effect
function updateProgressStatus(message) {
  const progressContainer = document.getElementById("progress-updates-container");
  const progressText = document.getElementById("progress-update-text");
  
  // Show container if hidden
  if (progressContainer.style.display === "none") {
    progressContainer.style.display = "flex";
  }
  
  // Fade out current text, update, then fade in
  progressText.style.opacity = "0";
  
  setTimeout(() => {
    progressText.textContent = message;
    progressText.style.opacity = "1";
  }, 300);
}

// Generate a unique session ID for WebSocket communication
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

document.getElementById("analyze-button").addEventListener("click", async () => {
    const resultsDiv = document.getElementById("results");
    const loadingDiv = document.getElementById("loading");
    const progressContainer = document.getElementById("progress-updates-container");
    
    // Check if running in Chrome extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    
    if (isExtension) {
      // Clear previous results from storage before new analysis
      chrome.storage.local.remove('analysisResults');
    }

    resultsDiv.style.display = "none"; // Hide results
    loadingDiv.style.display = "block"; // Show spinner
    progressContainer.style.display = "flex"; // Show progress updates
    
    // Initial progress update
    updateProgressStatus("Initializing analysis...");

    // For testing outside of the extension
    if (!isExtension) {
      // Simulate loading for 2 seconds
      setTimeout(() => {
        loadingDiv.style.display = "none";
        alert("This feature requires the Chrome extension environment to work properly.");
      }, 2000);
      return;
    }

    try {
      // Get the current active tab - for side panel, we need to get the tab the panel is attached to
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error("No active tab found");
      }

      // Update progress status
      updateProgressStatus("Extracting article content...");
      
      // Send a message to the content script to get the article text
      chrome.tabs.sendMessage(tab.id, { action: "getArticleText" }, async (response) => {
        if (chrome.runtime.lastError) {
          loadingDiv.style.display = "none"; // Hide spinner
          progressContainer.style.display = "none"; // Hide progress updates
          alert("Error: " + chrome.runtime.lastError.message);
          return;
        }

        if (response && response.articleText) {
          try {
            // Update progress status
            updateProgressStatus("Preparing analysis...");
            
            // Get the prompt from Chrome storage
            const prompt = await getStoredPrompt();
            
            // Update progress status
            updateProgressStatus("Sending to AI for analysis...");
            
            // Send the article text AND prompt to your backend server
            const res = await fetch("http://127.0.0.1:5000/analyze", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                text: response.articleText,
                prompt: prompt
              }),
            });

            if (!res.ok) {
              throw new Error(`Server error: ${res.statusText}`);
            }

            // Update progress status
            updateProgressStatus("Processing AI response...");
            
            const analysis = await res.json();

            if (analysis.error) {
              loadingDiv.style.display = "none"; // Hide spinner
              progressContainer.style.display = "none"; // Hide progress updates
              alert("Error: " + analysis.error);
            } else {
              // Update progress status
              updateProgressStatus("Building your dashboard...");
              
              // Short delay to allow the user to see the final progress message
              setTimeout(() => {
                loadingDiv.style.display = "none"; // Hide spinner
                progressContainer.style.display = "none"; // Hide progress updates
                resultsDiv.style.display = "block"; // Show results
                // Display the results in the dashboard
                displayResults(analysis);
              }, 800);
              // Save results to chrome.storage.local for persistence
              chrome.storage.local.set({ 
                analysisResults: analysis,
                analyzedUrl: tab.url // Store the current URL with the analysis results
              });
              
              // Hide notification banner if it's visible
              const notificationBanner = document.getElementById("notification-banner");
              notificationBanner.style.display = "none";
              notificationBanner.style.opacity = "0";
              
              // Reset padding when banner is hidden
              // document.getElementById("results").style.paddingTop = "125px";
              
              // Save to history if article info is available
              if (response.articleInfo) {
                saveToHistory(analysis, response.articleInfo);
              }
            }
          } catch (error) {
            loadingDiv.style.display = "none"; // Hide spinner
            alert("Error fetching analysis: " + error.message);
          }
        } else {
          loadingDiv.style.display = "none"; // Hide spinner
          alert("Could not retrieve article text.");
        }
      });
    } catch (error) {
      loadingDiv.style.display = "none"; // Hide spinner
      alert("Error: " + error.message);
    }
  });
});

function displayResults(analysis) {
  // Hide loading spinner
  const loadingDiv = document.getElementById("loading");
  loadingDiv.style.display = "none";

  // Display Bias Meter
  const biasMeterContainer = document.getElementById("bias-meter-container");
  biasMeterContainer.style.display = "block";

  const biasArrow = document.getElementById("bias-arrow");

  // Calculate the position of the arrow based on bias score
  const biasScore = analysis.bias_score; // Assume bias_score is between -5 and +5
  let biasPercentage = ((biasScore + 5) / 10) * 100; // Map -5 to 0%, +5 to 100%

  // Clamp the percentage between 0% and 100%
  biasPercentage = Math.max(0, Math.min(100, biasPercentage));

  // Update arrow position
  biasArrow.style.left = `${biasPercentage}%`;

  // Summary
  const summaryDiv = document.getElementById("summary");
  summaryDiv.innerHTML = ""; // Clear previous results

  // Other Results
  const otherResultsDiv = document.getElementById("other-results");
  otherResultsDiv.innerHTML = ""; // Clear previous results

  // Create text bubbles for other metrics
  createSummaryBubble("Bias Analysis Result", analysis.analysis_summary, summaryDiv);
  
  // Map the new dashboard item IDs to the appropriate UI elements
  createTextBubble("Article Summary", analysis.dashboard_item_3 || analysis.content_summary, otherResultsDiv);
  createTextBubble("Historical Context", analysis.dashboard_item_4 || analysis.context, otherResultsDiv);
  createTextBubble("Language & Tone", analysis.dashboard_item_5 || analysis.language_tone, otherResultsDiv);
  createTextBubble("Framing & Perspective", analysis.dashboard_item_6 || analysis.framing_perspective, otherResultsDiv);
  createTextBubble("Alternative Perspectives", analysis.dashboard_item_7 || analysis.alternative_perspectives, otherResultsDiv);
  createTextBubble("Publisher Bias", analysis.dashboard_item_8 || analysis.publisher_bias, otherResultsDiv);
}

function createSummaryBubble(title, content, parentElement) {
  const bubble = document.createElement("div");
  bubble.className = "summary-text-bubble";

  const bubbleTitle = document.createElement("h3");
  bubbleTitle.textContent = title;
  bubble.appendChild(bubbleTitle);

  if (Array.isArray(content)) {
    if (content.length > 0) {
      const list = document.createElement("ul");
      content.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        list.appendChild(listItem);
      });
      bubble.appendChild(list);
    } else {
      const bubbleContent = document.createElement("p");
      bubbleContent.textContent = "No disputed claims found.";
      bubble.appendChild(bubbleContent);
    }
  } else {
    const bubbleContent = document.createElement("p");
    bubbleContent.textContent = content;
    bubble.appendChild(bubbleContent);
  }

  parentElement.appendChild(bubble);
}

function createTextBubble(title, content, parentElement) {
  const bubble = document.createElement("div");
  bubble.className = "text-bubble";

  // Create the title element
  const bubbleTitle = document.createElement("h3");
  bubbleTitle.className = "bubble-title";
  bubbleTitle.textContent = title;

  bubble.appendChild(bubbleTitle);


  // Create an icon element
  const icon = document.createElement("span");
  icon.className = "toggle-icon";
  icon.textContent = "+"; // Initial state is collapsed
  bubbleTitle.appendChild(icon);

  bubble.appendChild(bubbleTitle);

  // Create the content container
  const bubbleContentContainer = document.createElement("div");
  bubbleContentContainer.className = "bubble-content";

  if (Array.isArray(content)) {
    if (content.length > 0) {
      const list = document.createElement("ul");
      content.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        list.appendChild(listItem);
      });
      bubbleContentContainer.appendChild(list);
    } else {
      const bubbleContent = document.createElement("p");
      bubbleContent.textContent = "No disputed claims found.";
      bubbleContentContainer.appendChild(bubbleContent);
    }
  } else {
    const bubbleContent = document.createElement("p");
    bubbleContent.textContent = content;
    bubbleContentContainer.appendChild(bubbleContent);
  }

  bubble.appendChild(bubbleContentContainer);
  parentElement.appendChild(bubble);

  // Add click event listener to the title
  bubbleTitle.addEventListener("click", function() {
    const isOpen = bubbleContentContainer.classList.toggle("open");
    icon.textContent = isOpen ? "−" : "+";
  });
}
