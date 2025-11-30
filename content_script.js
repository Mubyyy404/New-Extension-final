// content_script.js

(function() {
  // --- 1. WHITELIST (Prevent blocking Google, GitHub, etc.) ---
  const safeDomains = [
    'google.com',
    'youtube.com',
    'bing.com',
    'github.com',
    'stackoverflow.com',
    'microsoft.com',
    '127.0.0.1',
    'localhost'
  ];

  const currentHost = window.location.hostname;
  
  // If the current site is in our safe list, STOP here.
  if (safeDomains.some(domain => currentHost.includes(domain))) {
    // console.log("[WebGuard] Skipped safe domain:", currentHost);
    return; 
  }

  // --- 2. SCANNING FUNCTION ---
  function scanPage() {
    // Check if body exists (just in case)
    if (!document.body) return;

    const bodyText = document.body.innerText.toLowerCase();

    // Expanded list of phishing triggers
    const phrases = [
      "verify your account",
      "confirm password",
      "unusual sign-in",
      "bank account suspended",
      "urgent action required",
      "click here to unlock",
      "identity verification",
      "update payment details"
    ];

    // Check if any phrase exists in the page text
    const foundPhrase = phrases.find(p => bodyText.includes(p));

    if (foundPhrase) {
      console.log(`[WebGuard] Phishing detected! Trigger: "${foundPhrase}"`);
      
      // Send blocking request to background.js
      chrome.runtime.sendMessage({ 
        type: 'BLOCK_PAGE', 
        reason: `Phishing Text Detected: "${foundPhrase}"` 
      });
    }
  }

  // --- 3. TIMING HANDLING ---
  // Since manifest runs at "document_start", the body might not be ready yet.
  if (document.body) {
    scanPage();
  } else {
    // Wait for the content to load before scanning
    document.addEventListener('DOMContentLoaded', scanPage);
    // Optional: Also scan on full load to catch late-loading text
    window.addEventListener('load', scanPage);
  }

})();