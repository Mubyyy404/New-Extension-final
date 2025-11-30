
chrome.storage.local.get(['stats'], r => {
  document.getElementById('count').textContent = r.stats?.blocked || 0;
});
