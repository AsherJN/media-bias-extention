console.log("Background script running.");

// Register the side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for extension icon clicks to open the side panel
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel when the extension icon is clicked
  chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzePage") {
    console.log("Received analyze page request");
    // You can add additional logic here if needed
    sendResponse({ status: "received" });
  }
  return true; // Keep the message channel open for async responses
});
