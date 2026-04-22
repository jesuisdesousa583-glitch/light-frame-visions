// content-editor.js — roda em lovable.dev para extrair o project_id
(function () {
  "use strict";
  function extractProjectId(url) {
    const m = url.match(/lovable\.dev\/projects\/([a-f0-9\-]{36})/i);
    return m ? m[1] : null;
  }
  function send() {
    const id = extractProjectId(location.href);
    if (id) {
      chrome.runtime
        .sendMessage({ type: "PROJECT_ID_FOUND", projectId: id })
        .catch(() => {});
    }
  }
  send();
  let last = location.href;
  new MutationObserver(() => {
    if (location.href !== last) {
      last = location.href;
      send();
    }
  }).observe(document, { subtree: true, childList: true });
  window.addEventListener("popstate", send);
  setInterval(send, 2000);
})();
