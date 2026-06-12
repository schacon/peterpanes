const navForm = document.getElementById("nav-form");
const urlInput = document.getElementById("url-input");
const browserView = document.getElementById("browser-view");

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function navigateTo(value) {
  const nextUrl = normalizeUrl(value);
  if (!nextUrl) return;
  browserView.src = nextUrl;
  urlInput.value = nextUrl;
}

navForm.addEventListener("submit", (event) => {
  event.preventDefault();
  navigateTo(urlInput.value);
});

browserView.addEventListener("did-navigate", (event) => {
  urlInput.value = event.url;
});

browserView.addEventListener("did-navigate-in-page", (event) => {
  urlInput.value = event.url;
});

if (window.miniBrowser && typeof window.miniBrowser.onOpenExternalUrl === "function") {
  window.miniBrowser.onOpenExternalUrl((url) => {
    navigateTo(url);
  });
}

urlInput.value = browserView.src;
