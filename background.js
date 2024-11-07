console.log("Background script running.");
chrome.runtime.sendMessage({ action: "analyzePage" });

