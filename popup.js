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


// document.getElementById("analyze-button").addEventListener("click", async () => {
//   const resultsDiv = document.getElementById("results");
//   const loadingDiv = document.getElementById("loading");
//   resultsDiv.textContent = "Analyzing...";
//   loadingDiv.style.display = "block"; // Show spinner

//   // Get the current active tab
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   // Send a message to the content script to get the article text
//   console.log("fuck you2");

//   chrome.tabs.sendMessage(tab.id, { action: "getArticleText" }, async (response) => {
//     console.log("fuck you");
//       if (chrome.runtime.lastError) {
//           loadingDiv.style.display = "none"; // Hide spinner
//           resultsDiv.textContent = "Error: " + chrome.runtime.lastError.message;
//           return;
//       }

//       if (response && response.articleText) {
//         console.log("entered if statement")
//           try {
//               // Send the article text to your backend server
//               const res = await fetch("http://127.0.0.1:5000/analyze", {
//                   method: "POST",
//                   headers: {
//                       "Content-Type": "application/json",
//                   },
//                   body: JSON.stringify({ text: response.articleText }),
//               });

//               if (!res.ok) {
//                   throw new Error(`Server error: ${res.statusText}`);
//               }

//               const analysis = await res.json();

//               if (analysis.error) {
//                   loadingDiv.style.display = "none"; // Hide spinner
//                   resultsDiv.textContent = "Error: " + analysis.error;
//               } else {
//                   loadingDiv.style.display = "none"; // Hide spinner
//                   // Display the results in the dashboard
//                   displayResults(analysis);
//               }
//           } catch (error) {
//               loadingDiv.style.display = "none"; // Hide spinner
//               resultsDiv.textContent = "Error fetching analysis: " + error.message;
//           }
//       } else {
//           loadingDiv.style.display = "none"; // Hide spinner
//           resultsDiv.textContent = "Could not retrieve article text.";
//       }
//   });
// });

// function displayResults(analysis) {
//   const resultsDiv = document.getElementById("results");
//   resultsDiv.innerHTML = ""; // Clear previous results

//   // Bias Score
//   const biasScoreElem = document.createElement("div");
//   biasScoreElem.className = "result-item";
//   const biasTitle = document.createElement("div");
//   biasTitle.className = "result-title";
//   biasTitle.textContent = "Bias Score:";
//   const biasContent = document.createElement("div");
//   biasContent.className = "result-content";
//   biasContent.textContent = analysis.bias_score;
//   biasScoreElem.appendChild(biasTitle);
//   biasScoreElem.appendChild(biasContent);
//   resultsDiv.appendChild(biasScoreElem);

//   // Language Tone
//   const languageToneElem = document.createElement("div");
//   languageToneElem.className = "result-item";
//   const toneTitle = document.createElement("div");
//   toneTitle.className = "result-title";
//   toneTitle.textContent = "Language Tone:";
//   const toneContent = document.createElement("div");
//   toneContent.className = "result-content";
//   toneContent.textContent = analysis.language_tone;
//   languageToneElem.appendChild(toneTitle);
//   languageToneElem.appendChild(toneContent);
//   resultsDiv.appendChild(languageToneElem);

//   // Framing Perspective
//   const framingElem = document.createElement("div");
//   framingElem.className = "result-item";
//   const framingTitle = document.createElement("div");
//   framingTitle.className = "result-title";
//   framingTitle.textContent = "Framing Perspective:";
//   const framingContent = document.createElement("div");
//   framingContent.className = "result-content";
//   framingContent.textContent = analysis.framing_perspective;
//   framingElem.appendChild(framingTitle);
//   framingElem.appendChild(framingContent);
//   resultsDiv.appendChild(framingElem);

//   // Disputed Claims
//   const disputedClaimsElem = document.createElement("div");
//   disputedClaimsElem.className = "result-item";
//   const claimsTitle = document.createElement("div");
//   claimsTitle.className = "result-title";
//   claimsTitle.textContent = "Disputed Claims:";
//   disputedClaimsElem.appendChild(claimsTitle);

//   if (analysis.disputed_claims && analysis.disputed_claims.length > 0) {
//     const claimsList = document.createElement("ul");
//     analysis.disputed_claims.forEach((claim) => {
//       const listItem = document.createElement("li");
//       listItem.textContent = claim;
//       claimsList.appendChild(listItem);
//     });
//     disputedClaimsElem.appendChild(claimsList);
//   } else {
//     const noClaimsContent = document.createElement("div");
//     noClaimsContent.className = "result-content";
//     noClaimsContent.textContent = "No disputed claims found.";
//     disputedClaimsElem.appendChild(noClaimsContent);
//   }

//   resultsDiv.appendChild(disputedClaimsElem);

//         }
      

