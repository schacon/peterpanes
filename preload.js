const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("miniBrowser", {
  onOpenExternalUrl(callback) {
    if (typeof callback !== "function") return;
    ipcRenderer.on("open-external-url", (_event, url) => callback(url));
  }
});
