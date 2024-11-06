// Listen for messages from the popup script
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
  