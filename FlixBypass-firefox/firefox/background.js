// FlixBypass - Background Script (Firefox)
// Injects the content script on all Netflix pages.
// Also uses webRequest API (available in Firefox MV3) as an additional defense layer.

const CONTENT_SCRIPT_FILE = 'content.js';
const STORAGE_KEY = 'extensionEnabled';
const GRAPHQL_URL = 'web.prod.cloud.netflix.com/graphql';

const HOUSEHOLD_MARKERS = [
    'household',
    'in-home',
    'inhome',
    'setlocationcontext',
    'householdstatus',
    'updatememberstate',
    'memberstatus'
];

let isExtensionEnabled = true;

// --- State Management ---

async function updateEnabledState() {
    try {
        const api = typeof browser !== 'undefined' ? browser : chrome;
        const data = await api.storage.local.get(STORAGE_KEY);
        isExtensionEnabled = data[STORAGE_KEY] !== false;
        console.log(`[FlixBypass] Extension enabled: ${isExtensionEnabled}`);
        if (isExtensionEnabled) checkAllTabs();
    } catch (error) {
        console.error("[FlixBypass] State error:", error);
        isExtensionEnabled = true;
    }
}

// --- Content Script Injection ---

async function injectContentScript(tabId) {
    if (!isExtensionEnabled) return;
    try {
        const api = typeof browser !== 'undefined' ? browser : chrome;
        await api.scripting.executeScript({
            target: { tabId: tabId },
            files: [CONTENT_SCRIPT_FILE]
        });
    } catch (error) {
        const msg = error.message || '';
        if (!msg.includes('already been injected') &&
            !msg.includes('Invalid tab ID') &&
            !msg.includes('Cannot access') &&
            !msg.includes('Missing host permission')) {
            console.error(`[FlixBypass] Inject error for tab ${tabId}:`, msg);
        }
    }
}

function handleNavigation(tabId, url) {
    if (!isExtensionEnabled) return;
    if (!url || !url.includes('netflix.com')) return;
    injectContentScript(tabId);
}

// --- Navigation Listeners ---

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId === 0 && details.url?.includes('netflix.com')) {
        handleNavigation(details.tabId, details.url);
    }
});

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0 && details.url?.includes('netflix.com')) {
        handleNavigation(details.tabId, details.url);
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId === 0 && details.url?.includes('netflix.com')) {
        handleNavigation(details.tabId, details.url);
    }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab?.url) handleNavigation(activeInfo.tabId, tab.url);
    } catch (e) { /* ignore */ }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[STORAGE_KEY]) {
        updateEnabledState();
    }
});

// --- webRequest Defense Layer (Firefox MV3 exclusive) ---
// Blocks GraphQL requests containing household markers at the browser level.
// This is IN ADDITION to declarativeNetRequest rules and fetch/XHR patching.

try {
    const api = typeof browser !== 'undefined' ? browser : chrome;
    if (api.webRequest && api.webRequest.onBeforeRequest) {
        api.webRequest.onBeforeRequest.addListener(
            function (details) {
                if (!isExtensionEnabled) return {};

                // Check if this is a GraphQL request to Netflix
                if (details.url && details.url.includes(GRAPHQL_URL)) {
                    // Try to read the request body for household markers
                    if (details.requestBody) {
                        let bodyText = '';

                        if (details.requestBody.raw) {
                            try {
                                const decoder = new TextDecoder('utf-8');
                                for (const element of details.requestBody.raw) {
                                    if (element.bytes) {
                                        bodyText += decoder.decode(element.bytes);
                                    }
                                }
                            } catch (e) { /* ignore decode errors */ }
                        }

                        if (details.requestBody.formData) {
                            bodyText += JSON.stringify(details.requestBody.formData);
                        }

                        if (bodyText) {
                            const lower = bodyText.toLowerCase();
                            for (const marker of HOUSEHOLD_MARKERS) {
                                if (lower.includes(marker)) {
                                    console.log(`[FlixBypass] webRequest blocked household request (marker: ${marker})`);
                                    return { cancel: true };
                                }
                            }
                        }
                    }
                }
                return {};
            },
            { urls: ["*://web.prod.cloud.netflix.com/*"] },
            ["blocking", "requestBody"]
        );
        console.log("[FlixBypass] webRequest defense layer active.");
    }
} catch (e) {
    // webRequest blocking may not be available in all Firefox builds
    console.log("[FlixBypass] webRequest blocking not available, using other layers.");
}

// --- Tab Check ---

async function checkAllTabs() {
    if (!isExtensionEnabled) return;
    try {
        const tabs = await chrome.tabs.query({ url: "*://*.netflix.com/*" });
        tabs.forEach(tab => handleNavigation(tab.id, tab.url));
    } catch (e) { console.error("[FlixBypass] checkAllTabs error:", e); }
}

// --- Init ---

chrome.runtime.onInstalled.addListener(async () => { await updateEnabledState(); });
chrome.runtime.onStartup.addListener(async () => { await updateEnabledState(); });
updateEnabledState();
console.log("FlixBypass background script loaded (Firefox).");
