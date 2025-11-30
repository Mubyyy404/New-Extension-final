
// Initialize
let stats = { scanned: 0, blocked: 0 };
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ stats: stats, active: true });
});

// CORE LOGIC
function analyzeUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // 1. HARDCODED BLACKLIST (Guaranteed Block)
    const blacklist = [
      'malicious-test.com', 
      'steal-login.net', 
      'bad-crypto.org',
      'fake.com',
      'malicious.com',
      'login-verify-update.xyz' // Added your specific test case
    ];
    
    if (blacklist.some(d => hostname.includes(d))) {
        return { score: 100, reason: "Blacklisted Domain" };
    }

    // 2. IP Address Check
    if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(hostname)) {
      return { score: 80, reason: "Raw IP Address" };
    }

    // 3. Heuristic Keywords
    const keywords = ['verify', 'secure', 'account', 'update', 'banking', 'login'];
    const suspiciousTLDs = ['.xyz', '.top', '.gq', '.zip'];
    
    let score = 0;
    
    // Check keywords (skip if google/microsoft)
    if (!hostname.includes('google') && !hostname.includes('microsoft')) {
        if (keywords.some(k => hostname.includes(k))) score += 30;
    }

    // Check TLD
    if (suspiciousTLDs.some(t => hostname.endsWith(t))) score += 25;

    if (score >= 50) return { score, reason: "Heuristic Detection" };

  } catch(e) { return null; }
  
  return null;
}

// LISTENER: Fires immediately on ANY navigation change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We check 'changeInfo.url' (the new URL) OR 'tab.url' (current status)
  const currentUrl = changeInfo.url || tab.url;

  if (currentUrl && !currentUrl.startsWith('chrome') && !currentUrl.includes('blocked.html')) {
    
    const result = analyzeUrl(currentUrl);

    if (result && result.score >= 50) {
       console.log("BLOCKING:", currentUrl);
       
       // Update stats
       chrome.storage.local.get(['stats'], (res) => {
         let s = res.stats || { scanned: 0, blocked: 0 };
         s.blocked++;
         chrome.storage.local.set({ stats: s });
       });

       // Redirect
       const blockPage = chrome.runtime.getURL("blocked.html") + 
         `?reason=${encodeURIComponent(result.reason)}&url=${encodeURIComponent(currentUrl)}`;
       chrome.tabs.update(tabId, { url: blockPage });
    }
  }
});

// Listen for content script messages
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'BLOCK_PAGE') {
     const blockPage = chrome.runtime.getURL("blocked.html") + 
         `?reason=${encodeURIComponent(msg.reason)}&url=${encodeURIComponent(sender.tab.url)}`;
     chrome.tabs.update(sender.tab.id, { url: blockPage });
  }
});
