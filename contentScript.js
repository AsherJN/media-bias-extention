
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticleText") {
      // Extract the article text from the page
      const articleText = extractArticleText();
      sendResponse({ articleText });
    }
  });
  
  function extractArticleText() {
    // Simple example: get all paragraph text
    const paragraphs = document.querySelectorAll("p");
    let articleText = "";
    paragraphs.forEach((p) => {
      articleText += p.innerText + "\n";
    });
    return articleText;
  }
  
  chrome.runtime.sendMessage({ action: "analyzePage" }, response => {
    if (chrome.runtime.lastError) {
      console.error("Runtime error:", chrome.runtime.lastError);
    } else {
      console.log("Message sent successfully");
    }
  });
