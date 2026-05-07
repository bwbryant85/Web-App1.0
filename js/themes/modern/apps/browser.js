/* ════════════ BROWSER v8 MODERN ════════════
   Modern browser with glass effects
   ════════════════════════════════════ */

function initBrowser() {
  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;flex-direction:column;gap:12px;';

  const urlRow = document.createElement('div');
  urlRow.style.cssText = 'display:flex;gap:8px;';
  urlRow.innerHTML = `
    <input id="browser-url" type="text" placeholder="Search or enter URL" value="https://duckduckgo.com/" style="flex:1;padding:12px 16px;background:#f8f9fa;border:1px solid rgba(15,23,42,.12);border-radius:16px;font-family:'Inter',sans-serif;font-size:1rem;color:#111;outline:none;" />
    <button id="browser-go" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#fff;background:#4a90d9;border:none;border-radius:16px;padding:12px 20px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Go</button>
  `;
  toolbar.appendChild(urlRow);

  const actionsRow = document.createElement('div');
  actionsRow.style.cssText = 'display:flex;gap:8px;';
  actionsRow.innerHTML = `
    <button id="browser-new" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#111;background:#f8f9fa;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Open in New Tab</button>
    <button id="browser-home" style="font-family:'Inter',sans-serif;font-size:.9rem;color:#111;background:#f8f9fa;border:1px solid rgba(15,23,42,.12);border-radius:12px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Home</button>
  `;
  toolbar.appendChild(actionsRow);
  c.appendChild(toolbar);

  const frameWrap = document.createElement('div');
  frameWrap.style.cssText = 'flex:1;position:relative;background:#ffffff;border-radius:0 0 28px 28px;overflow:hidden;';
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:100%;border:none;background:#ffffff;';
  iframe.src = 'https://duckduckgo.com/';
  frameWrap.appendChild(iframe);

  const errorOverlay = document.createElement('div');
  errorOverlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#ffffff;font-family:\'Inter\',sans-serif;font-size:1rem;color:#666;text-align:center;padding:20px;display:none;';
  errorOverlay.innerHTML = 'Page blocked or unavailable.<br>Use "Open in New Tab" to view externally.';
  frameWrap.appendChild(errorOverlay);
  c.appendChild(frameWrap);

  const status = document.createElement('div');
  status.style.cssText = 'flex-shrink:0;padding:12px 16px;text-align:center;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#666;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.08);';
  status.textContent = 'Type a search or website address and tap Go';
  c.appendChild(status);

  const urlInput = toolbar.querySelector('#browser-url');
  const goBtn = toolbar.querySelector('#browser-go');
  const newBtn = toolbar.querySelector('#browser-new');
  const homeBtn = toolbar.querySelector('#browser-home');

  function sanitize(value) {
    let url = value.trim();
    if (!url) return 'https://duckduckgo.com/';
    if (!url.includes('://')) {
      if (url.includes('.') || url.includes('localhost')) {
        url = 'https://' + url;
      } else {
        url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
      }
    }
    return url;
  }

  function loadUrl(url) {
    const cleanUrl = sanitize(url);
    urlInput.value = cleanUrl;
    iframe.src = cleanUrl;
    errorOverlay.style.display = 'none';
    status.textContent = 'Loading...';
  }

  goBtn.onclick = () => loadUrl(urlInput.value);
  urlInput.onkeydown = (e) => { if (e.key === 'Enter') loadUrl(urlInput.value); };

  newBtn.onclick = () => {
    const url = sanitize(urlInput.value);
    window.open(url, '_blank');
  };

  homeBtn.onclick = () => loadUrl('https://duckduckgo.com/');

  iframe.onload = () => {
    status.textContent = 'Page loaded successfully';
    setTimeout(() => status.textContent = '', 2000);
  };

  iframe.onerror = () => {
    errorOverlay.style.display = 'flex';
    status.textContent = 'Failed to load page';
  };
}