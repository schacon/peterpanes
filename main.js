const path = require("path");
const { app, BrowserWindow } = require("electron");

let mainWindow = null;
let rendererLoaded = false;
let pendingExternalUrl = null;

function isWebUrl(value) {
  return /^https?:\/\//i.test(value);
}

function extractUrlFromArgv(argv) {
  return argv.find((arg) => isWebUrl(arg));
}

function deliverPendingExternalUrl() {
  if (!pendingExternalUrl || !mainWindow || mainWindow.isDestroyed() || !rendererLoaded) {
    return;
  }

  mainWindow.webContents.send("open-external-url", pendingExternalUrl);
  pendingExternalUrl = null;
}

function handleIncomingUrl(url) {
  if (!isWebUrl(url)) return;
  pendingExternalUrl = url;

  if (app.isReady() && (!mainWindow || mainWindow.isDestroyed())) {
    createWindow();
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }

  deliverPendingExternalUrl();
}

function createWindow() {
  rendererLoaded = false;
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    hasShadow: process.platform !== "darwin",
    webPreferences: {
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.webContents.on("did-finish-load", () => {
    rendererLoaded = true;
    deliverPendingExternalUrl();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    rendererLoaded = false;
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  return mainWindow;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const incomingUrl = extractUrlFromArgv(argv);
    if (incomingUrl) {
      handleIncomingUrl(incomingUrl);
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleIncomingUrl(url);
  });

  app.whenReady().then(() => {
    createWindow();

    if (app.isPackaged) {
      app.setAsDefaultProtocolClient("http");
      app.setAsDefaultProtocolClient("https");
    }

    const startupUrl = extractUrlFromArgv(process.argv);
    if (startupUrl) {
      handleIncomingUrl(startupUrl);
    }

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
