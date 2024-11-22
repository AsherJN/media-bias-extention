document.getElementById("analyze-button").addEventListener("click", async () => {
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.getElementById("loading");

  resultsDiv.style.display = "none"; // Hide results
  loadingDiv.style.display = "block"; // Show spinner

  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send a message to the content script to get the article text
  chrome.tabs.sendMessage(tab.id, { action: "getArticleText" }, async (response) => {
    if (chrome.runtime.lastError) {
      loadingDiv.style.display = "none"; // Hide spinner
      alert("Error: " + chrome.runtime.lastError.message);
      return;
    }

    if (response && response.articleText) {
      try {
        // Send the article text to your backend server
        const res = await fetch("http://127.0.0.1:5000/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: response.articleText }),
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

  // Other Results
  const otherResultsDiv = document.getElementById("other-results");
  otherResultsDiv.innerHTML = ""; // Clear previous results

  // Create text bubbles for other metrics
  createTextBubble("Context", analysis.context, otherResultsDiv);
  createTextBubble("Summary", analysis.content_summary, otherResultsDiv);
  createTextBubble("Language Tone", analysis.language_tone, otherResultsDiv);
  createTextBubble("Framing Perspective", analysis.framing_perspective, otherResultsDiv);
  createTextBubble("Alternative Perspectives", analysis.alternative_perspectives, otherResultsDiv);
}

function createTextBubble(title, content, parentElement) {
  const bubble = document.createElement("div");
  bubble.className = "text-bubble";

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


      

