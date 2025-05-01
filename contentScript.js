
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getArticleText") {
      // Extract the article text and info from the page
      const articleText = extractArticleText();
      const articleInfo = extractArticleInfo();
      sendResponse({ 
        articleText,
        articleInfo
      });
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

  function extractArticleInfo() {
    return {
      title: document.title,
      url: window.location.href,
      favicon: getFaviconUrl()
    };
  }

  function getFaviconUrl() {
    // Try to get the favicon from link tags
    const linkIcon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (linkIcon) return linkIcon.href;
    
    // Fallback to default favicon location
    return new URL('/favicon.ico', window.location.origin).href;
  }
  
  chrome.runtime.sendMessage({ action: "analyzePage" }, response => {
    if (chrome.runtime.lastError) {
      console.error("Runtime error:", chrome.runtime.lastError);
    } else {
      console.log("Message sent successfully");
    }
  });
