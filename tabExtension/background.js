// background.js

// This file runs CONSTANTLY in the background, even when your popup is closed.
// The popup only exists when the user has it open — background.js always exists.

// Right now you only need one thing from it: 
// listen for Chrome startup so we know the extension is alive.

chrome.runtime.onInstalled.addListener(() => {
    console.log("AI Tabs Manager installed");
});

// Later (when you add backend sync), you'll add things like:
// chrome.tabs.onUpdated.addListener(() => { syncToBackend() })
// chrome.tabs.onRemoved.addListener(() => { syncToBackend() })
// But don't add those yet — you have no backend to sync to.
// Adding listeners that call nothing just wastes memory.