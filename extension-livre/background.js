// ============================================================
// background.js — Lovable Free Tools (sem chave de acesso)
// ============================================================

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

const PREVIEW_URL_RE = /https:\/\/[^/]*\.(lovable\.app|lovableproject\.com)\//;

const getPreviewTabs = async () => {
  const tabs = await chrome.tabs.query({});
  return tabs.filter((tab) => typeof tab.id === "number" && tab.url && PREVIEW_URL_RE.test(tab.url));
};

const fireDebugErrorInTab = async (tabId, payload) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (msg) => {
      window.dispatchEvent(new CustomEvent("lovable-debug-error", { detail: msg }));

      setTimeout(() => {
        const s = document.createElement("script");
        s.textContent =
          "setTimeout(function(){throw new Error(" + JSON.stringify(msg) + ");},0);";
        (document.head || document.documentElement).appendChild(s);
        s.remove();
      }, 150);
    },
    args: [payload],
  });
};

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
          chrome.runtime.sendMessage({ type: "TOKEN_CAPTURED", token }).catch(() => {});
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
    chrome.storage.local.get(["bearerToken", "projectId", "tokenCapturedAt"], (data) => {
      sendResponse({
        bearerToken: data.bearerToken || null,
        projectId: data.projectId || null,
        tokenCapturedAt: data.tokenCapturedAt || null,
      });
    });
    return true;
  }

  if (message.type === "CLEAR_DATA") {
    chrome.storage.local.remove(["bearerToken", "projectId", "tokenCapturedAt"], () =>
      sendResponse({ success: true })
    );
    return true;
  }

  // Encaminha CustomEvent para qualquer aba de preview aberta (modo Debug Tool)
  if (message.type === "FIRE_DEBUG_ERROR") {
    (async () => {
      try {
        const previewTabs = await getPreviewTabs();

        if (previewTabs.length === 0) {
          sendResponse({
            success: false,
            error: "Nenhuma aba de preview encontrada. Abra uma URL .lovable.app ou .lovableproject.com.",
          });
          return;
        }

        const settled = await Promise.allSettled(
          previewTabs.map((tab) => fireDebugErrorInTab(tab.id, message.payload))
        );

        const successCount = settled.filter((result) => result.status === "fulfilled").length;

        if (successCount === 0) {
          sendResponse({
            success: false,
            error: "Não foi possível disparar o erro na aba de preview.",
          });
          return;
        }

        sendResponse({ success: true, count: successCount });
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    return true;
  }
});
