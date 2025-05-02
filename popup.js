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
            // Increased to account for banner height plus spacing
            resultsContainer.style.paddingTop = '190px';
          } else {
            notificationBanner.style.display = 'none';
            notificationBanner.style.opacity = '0';
            
            // Reset padding when banner is hidden
            resultsContainer.style.paddingTop = '125px';
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

  // Function to fetch and display the AI bias prompt
  async function fetchAndDisplayPrompt() {
    const promptTextContainer = document.getElementById("prompt-text");
    
    try {
      // Get prompt from Chrome storage
      const prompt = await getStoredPrompt();
      promptTextContainer.textContent = prompt;
    } catch (error) {
      promptTextContainer.textContent = "Error loading prompt: " + error.message;
      console.error("Error fetching prompt:", error);
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

  document.getElementById("analyze-button").addEventListener("click", async () => {
    const resultsDiv = document.getElementById("results");
    const loadingDiv = document.getElementById("loading");
    
    // Check if running in Chrome extension context
    const isExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    
    if (isExtension) {
      // Clear previous results from storage before new analysis
      chrome.storage.local.remove('analysisResults');
    }

    resultsDiv.style.display = "none"; // Hide results
    loadingDiv.style.display = "block"; // Show spinner

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

      // Send a message to the content script to get the article text
      chrome.tabs.sendMessage(tab.id, { action: "getArticleText" }, async (response) => {
        if (chrome.runtime.lastError) {
          loadingDiv.style.display = "none"; // Hide spinner
          alert("Error: " + chrome.runtime.lastError.message);
          return;
        }

        if (response && response.articleText) {
          try {
            // Get the prompt from Chrome storage
            const prompt = await getStoredPrompt();
            
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

            const analysis = await res.json();

            if (analysis.error) {
              loadingDiv.style.display = "none"; // Hide spinner
              alert("Error: " + analysis.error);
            } else {
              loadingDiv.style.display = "none"; // Hide spinner
              resultsDiv.style.display = "block"; // Show results
              // Display the results in the dashboard
              displayResults(analysis);
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
              document.getElementById("results").style.paddingTop = "125px";
              
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
  createTextBubble("Article Summary", analysis.content_summary, otherResultsDiv);
  createTextBubble("Language Tone", analysis.language_tone, otherResultsDiv);
  createTextBubble("Framing Perspective", analysis.framing_perspective, otherResultsDiv);
  createTextBubble("Historical Context", analysis.context, otherResultsDiv);
  createTextBubble("Alternative Perspectives", analysis.alternative_perspectives, otherResultsDiv);
  createTextBubble("Article Publisher Bias", analysis.publisher_bias, otherResultsDiv);

  
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
