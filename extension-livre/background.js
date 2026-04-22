// ============================================================
// background.js — Lovable Free Tools (sem chave de acesso)
// ============================================================

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// Captura Bearer token das requisições à API da Lovable
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!details.requestHeaders) return;
    for (const header of details.requestHeaders) {
      if (
        header.name.toLowerCase() === "authorization" &&
        typeof header.value === "string" &&
        header.value.startsWith("Bearer ")
      ) {
        const token = header.value.replace("Bearer ", "").trim();
        chrome.storage.local.set({ bearerToken: token, tokenCapturedAt: Date.now() }, () => {
          chrome.runtime
            .sendMessage({ type: "TOKEN_CAPTURED", token })
            .catch(() => {});
        });
        break;
      }
    }
  },
  { urls: ["https://api.lovable.dev/*", "https://lovable.dev/*"] },
  ["requestHeaders"]
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROJECT_ID_FOUND") {
    chrome.storage.local.set({ projectId: message.projectId }, () =>
      sendResponse({ success: true })
    );
    return true;
  }

  if (message.type === "GET_COLLECTED_DATA") {
    chrome.storage.local.get(
      ["bearerToken", "projectId", "tokenCapturedAt"],
      (data) => {
        sendResponse({
          bearerToken: data.bearerToken || null,
          projectId: data.projectId || null,
          tokenCapturedAt: data.tokenCapturedAt || null,
        });
      }
    );
    return true;
  }

  if (message.type === "CLEAR_DATA") {
    chrome.storage.local.remove(
      ["bearerToken", "projectId", "tokenCapturedAt"],
      () => sendResponse({ success: true })
    );
    return true;
  }

  // Encaminha CustomEvent para a aba ativa de preview (modo Debug Tool)
  if (message.type === "FIRE_DEBUG_ERROR") {
    chrome.tabs.query({ active: true, currentWindow: false }, (tabs) => {
      tabs.forEach((tab) => {
        if (
          tab.url &&
          /https:\/\/[^/]*\.(lovable\.app|lovableproject\.com)\//.test(tab.url)
        ) {
          chrome.scripting
            .executeScript({
              target: { tabId: tab.id },
              func: (msg) => {
                window.dispatchEvent(
                  new CustomEvent("lovable-debug-error", { detail: msg })
                );
                setTimeout(() => {
                  const s = document.createElement("script");
                  s.textContent =
                    "setTimeout(function(){throw new Error(" +
                    JSON.stringify(msg) +
                    ");},0);";
                  (document.head || document.documentElement).appendChild(s);
                  s.remove();
                }, 150);
              },
              args: [message.payload],
            })
            .catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }
});
