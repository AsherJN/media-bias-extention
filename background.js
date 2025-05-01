console.log("Background script running.");

// Register the side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for extension icon clicks to open the side panel
chrome.action.onClicked.addListener((tab) => {
  // Open the side panel when the extension icon is clicked
  chrome.sidePanel.open({ tabId: tab.id });
});
