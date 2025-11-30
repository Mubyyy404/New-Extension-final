document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. BUTTON LOGIC (Fixes the loop) ---
    const backButton = document.getElementById('back');

    if (backButton) {
        backButton.addEventListener('click', () => {
            // We use 'replace' instead of 'href'.
            // This replaces the current history entry so the user can't 
            // accidentally click "Back" and land on the blocked page again.
            window.location.replace("https://www.google.com");
        });
    }

    // --- 2. DYNAMIC REASON TEXT ---
    // This reads the URL (e.g., blocked.html?reason=Phishing) and updates the UI
    const urlParams = new URLSearchParams(window.location.search);
    const reasonParam = urlParams.get('reason');
    const reasonElement = document.getElementById('reason');

    if (reasonParam && reasonElement) {
        // Updates the text on the red screen
        reasonElement.textContent = reasonParam;
    }

    // --- 3. AESTHETIC LOGS (Optional) ---
    console.log("%c [WebGuard] THREAT BLOCKED SUCCESSFULLY ", "background: #ff4b4b; color: #fff; font-weight: bold; padding: 4px;");
    console.log("Redirect path set to: Secure Origin (Google)");
});