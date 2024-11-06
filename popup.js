document.getElementById("analyze-button").addEventListener("click", async () => {
    // Display loading message
    const resultsDiv = document.getElementById("results");
    resultsDiv.textContent = "Analyzing...";
  
    // Send a message to the content script to get the article text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.tabs.sendMessage(tab.id, { action: "getArticleText" }, async (response) => {
      if (chrome.runtime.lastError) {
        resultsDiv.textContent = "Error: " + chrome.runtime.lastError.message;
        return;
      }
  
      if (response && response.articleText) {
        // Send the article text to the backend server for analysis
        try {
            // Note: Replace "https://your-backend-server.com/analyze" with the actual URL of your backend server when it's ready.
          const analysis = await fetch("https://your-backend-server.com/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: response.articleText }),
          }).then((res) => res.json());
  
          // Display the results
          resultsDiv.textContent = JSON.stringify(analysis, null, 2);
        } catch (error) {
          resultsDiv.textContent = "Error fetching analysis: " + error.message;
        }
      } else {
        resultsDiv.textContent = "Could not retrieve article text.";
      }
    });
  });
  