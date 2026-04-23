// ============================================================
// background.js — Lovable Free Tools (sem chave de acesso)
// ============================================================

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

const EDITOR_URL_RE = /^https:\/\/lovable\.dev\//;
const PREVIEW_URL_RE = /^https:\/\/[^/]*\.(lovable\.app|lovableproject\.com)\//;
const TARGET_URL_RE = /^(https:\/\/lovable\.dev\/|https:\/\/[^/]*\.(lovable\.app|lovableproject\.com)\/)/;

const getTargetTabs = async () => {
  const tabs = await chrome.tabs.query({});
  return tabs.filter(
    (tab) => typeof tab.id === "number" && typeof tab.url === "string" && TARGET_URL_RE.test(tab.url)
  );
};

const fireDebugErrorInTab = async (tabId, payload) => {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: (msg) => {
      const isPreviewFrame = /(^|\.)lovable\.app$/.test(location.hostname) || /(^|\.)lovableproject\.com$/.test(location.hostname);

      if (!isPreviewFrame) {
        return { skipped: true, href: location.href };
      }

      window.dispatchEvent(new CustomEvent("lovable-debug-error", { detail: msg }));

      setTimeout(() => {
        const s = document.createElement("script");
        s.textContent =
          "setTimeout(function(){throw new Error(" + JSON.stringify(msg) + ");},0);";
        (document.head || document.documentElement).appendChild(s);
        s.remove();
      }, 150);

      return { skipped: false, href: location.href };
    },
    args: [payload],
  });

  return results.filter((result) => !result.result?.skipped);
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

  if (message.type === "FIRE_DEBUG_ERROR") {
    (async () => {
      try {
        const targetTabs = await getTargetTabs();

        if (targetTabs.length === 0) {
          sendResponse({
            success: false,
            error: "Nenhuma aba do editor ou preview foi encontrada. Abra o projeto no lovable.dev com o preview visível.",
          });
          return;
        }

        const settled = await Promise.allSettled(
          targetTabs.map((tab) => fireDebugErrorInTab(tab.id, message.payload))
        );

        const injectedFrames = settled
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value);

        if (injectedFrames.length === 0) {
          sendResponse({
            success: false,
            error: "Nenhum frame de preview elegível foi encontrado. Deixe o preview aberto dentro do editor ou em uma aba publicada/preview.",
          });
          return;
        }

        sendResponse({ success: true, count: injectedFrames.length });
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
