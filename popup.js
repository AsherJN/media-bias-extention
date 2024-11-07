document.getElementById("analyze-button").addEventListener("click", async () => {
  const resultsDiv = document.getElementById("results");
  const loadingDiv = document.getElementById("loading");
  resultsDiv.textContent = "Analyzing...";
  loadingDiv.style.display = "block"; // Show spinner

  // Get the current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send a message to the content script to get the article text
  console.log("fuck you2");

  chrome.tabs.sendMessage(tab.id, { action: "getArticleText" }, async (response) => {
    console.log("fuck you");
      if (chrome.runtime.lastError) {
          loadingDiv.style.display = "none"; // Hide spinner
          resultsDiv.textContent = "Error: " + chrome.runtime.lastError.message;
          return;
      }

      if (response && response.articleText) {
        console.log("entered if statement")
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
                  resultsDiv.textContent = "Error: " + analysis.error;
              } else {
                  loadingDiv.style.display = "none"; // Hide spinner
                  // Display the results in the dashboard
                  displayResults(analysis);
              }
          } catch (error) {
              loadingDiv.style.display = "none"; // Hide spinner
              resultsDiv.textContent = "Error fetching analysis: " + error.message;
          }
      } else {
          loadingDiv.style.display = "none"; // Hide spinner
          resultsDiv.textContent = "Could not retrieve article text.";
      }
  });
});

function displayResults(analysis) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  // Bias Score
  const biasScoreElem = document.createElement("div");
  biasScoreElem.className = "result-item";
  const biasTitle = document.createElement("div");
  biasTitle.className = "result-title";
  biasTitle.textContent = "Bias Score:";
  const biasContent = document.createElement("div");
  biasContent.className = "result-content";
  biasContent.textContent = analysis.bias_score;
  biasScoreElem.appendChild(biasTitle);
  biasScoreElem.appendChild(biasContent);
  resultsDiv.appendChild(biasScoreElem);

  // Language Tone
  const languageToneElem = document.createElement("div");
  languageToneElem.className = "result-item";
  const toneTitle = document.createElement("div");
  toneTitle.className = "result-title";
  toneTitle.textContent = "Language Tone:";
  const toneContent = document.createElement("div");
  toneContent.className = "result-content";
  toneContent.textContent = analysis.language_tone;
  languageToneElem.appendChild(toneTitle);
  languageToneElem.appendChild(toneContent);
  resultsDiv.appendChild(languageToneElem);

  // Framing Perspective
  const framingElem = document.createElement("div");
  framingElem.className = "result-item";
  const framingTitle = document.createElement("div");
  framingTitle.className = "result-title";
  framingTitle.textContent = "Framing Perspective:";
  const framingContent = document.createElement("div");
  framingContent.className = "result-content";
  framingContent.textContent = analysis.framing_perspective;
  framingElem.appendChild(framingTitle);
  framingElem.appendChild(framingContent);
  resultsDiv.appendChild(framingElem);

  // Disputed Claims
  const disputedClaimsElem = document.createElement("div");
  disputedClaimsElem.className = "result-item";
  const claimsTitle = document.createElement("div");
  claimsTitle.className = "result-title";
  claimsTitle.textContent = "Disputed Claims:";
  disputedClaimsElem.appendChild(claimsTitle);

  if (analysis.disputed_claims && analysis.disputed_claims.length > 0) {
    const claimsList = document.createElement("ul");
    analysis.disputed_claims.forEach((claim) => {
      const listItem = document.createElement("li");
      listItem.textContent = claim;
      claimsList.appendChild(listItem);
    });
    disputedClaimsElem.appendChild(claimsList);
  } else {
    const noClaimsContent = document.createElement("div");
    noClaimsContent.className = "result-content";
    noClaimsContent.textContent = "No disputed claims found.";
    disputedClaimsElem.appendChild(noClaimsContent);
  }

  resultsDiv.appendChild(disputedClaimsElem);
}



// function displayResults(analysis) {
//   const resultsDiv = document.getElementById("results");
//   resultsDiv.innerHTML = ""; // Clear previous results

//   // Bias Score
//   const biasScoreElem = document.createElement("div");
//   biasScoreElem.textContent = `Bias Score: ${analysis.bias_score}`;
//   resultsDiv.appendChild(biasScoreElem);

//   // Language Tone
//   const languageToneElem = document.createElement("div");
//   languageToneElem.textContent = `Language Tone: ${analysis.language_tone}`;
//   resultsDiv.appendChild(languageToneElem);

//   // Framing Perspective
//   const framingElem = document.createElement("div");
//   framingElem.textContent = `Framing Perspective: ${analysis.framing_perspective}`;
//   resultsDiv.appendChild(framingElem);

//   // Disputed Claims
//   if (analysis.disputed_claims && analysis.disputed_claims.length > 0) {
//       const disputedClaimsElem = document.createElement("div");
//       disputedClaimsElem.textContent = "Disputed Claims:";
//       const claimsList = document.createElement("ul");
//       analysis.disputed_claims.forEach((claim) => {
//           const listItem = document.createElement("li");
//           listItem.textContent = claim;
//           claimsList.appendChild(listItem);
//       });
//       disputedClaimsElem.appendChild(claimsList);
//       resultsDiv.appendChild(disputedClaimsElem);
//   } else {
//       const noClaimsElem = document.createElement("div");
//       noClaimsElem.textContent = "No disputed claims found.";
//       resultsDiv.appendChild(noClaimsElem);
//   }
// }
