/* ════════════ BROWSER v8 — Proxy Edition ════════════
   Uses allorigins.win CORS proxy to actually load pages.
   Falls back gracefully with an "Open in Safari" button.
   ════════════════════════════════════════════════════ */
function initBrowser() {
  const wrap = document.createElement('div');
  wrap.className = 'browser-wrap';
  content.appendChild(wrap);

  /* ── Toolbar ─────────────────────────────────────── */
  const toolbar = document.createElement('div');
  toolbar.className = 'browser-toolbar';
  toolbar.innerHTML = `
    <div class="browser-nav-group">
      <button class="btn98 browser-back" title="Back">◀</button>
      <button class="btn98 browser-fwd"  title="Forward">▶</button>
      <button class="btn98 browser-reload" title="Reload">↺</button>
    </div>
    <div class="browser-url-group">
      <input class="browser-url" type="text" placeholder="Search or enter URL…" autocorrect="off" autocapitalize="off" spellcheck="false" />
      <button class="btn98 browser-go">Go</button>
    </div>
    <div class="browser-actions">
      <button class="btn98 browser-safari">Open in Safari</button>
    </div>
  `;
  wrap.appendChild(toolbar);

  /* ── Frame area ──────────────────────────────────── */
  const frameWrap = document.createElement('div');
  frameWrap.className = 'browser-frame-wrap';

  const iframe = document.createElement('iframe');
  iframe.className = 'browser-iframe';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  frameWrap.appendChild(iframe);

  /* Loading overlay */
  const loadOverlay = document.createElement('div');
  loadOverlay.className = 'browser-loading';
  loadOverlay.innerHTML = `<div class="browser-spinner"></div><div class="browser-load-text">Loading…</div>`;
  loadOverlay.style.display = 'none';
  frameWrap.appendChild(loadOverlay);

  /* Error overlay */
  const errorOverlay = document.createElement('div');
  errorOverlay.className = 'browser-error';
  errorOverlay.style.display = 'none';
  frameWrap.appendChild(errorOverlay);

  wrap.appendChild(frameWrap);

  /* Status bar */
  const status = document.createElement('div');
  status.className = 'browser-status';
  status.textContent = 'Enter a URL or search term and tap Go.';
  wrap.appendChild(status);

  /* ── Refs ────────────────────────────────────────── */
  const urlInput  = toolbar.querySelector('.browser-url');
  const goBtn     = toolbar.querySelector('.browser-go');
  const backBtn   = toolbar.querySelector('.browser-back');
  const fwdBtn    = toolbar.querySelector('.browser-fwd');
  const reloadBtn = toolbar.querySelector('.browser-reload');
  const safariBtn = toolbar.querySelector('.browser-safari');

  /* ── History ─────────────────────────────────────── */
  let history = [];
  let histIdx  = -1;
  let currentUrl = '';

  function updateNavBtns() {
    backBtn.disabled = histIdx <= 0;
    fwdBtn.disabled  = histIdx >= history.length - 1;
  }

  /* ── URL helpers ─────────────────────────────────── */
  function sanitize(value) {
    let url = value.trim();
    if (!url) return 'https://en.wikipedia.org/wiki/Main_Page';
    if (url.match(/^[\w]+:\/\//)) return url;
    if (url.includes(' ') || !url.includes('.')) {
      return 'https://duckduckgo.com/html/?q=' + encodeURIComponent(url);
    }
    return 'https://' + url;
  }

  /* ── Core load via proxy ─────────────────────────── */
  function navigate(rawUrl, pushHistory) {
    if (pushHistory === undefined) pushHistory = true;
    const url = sanitize(rawUrl);
    currentUrl = url;
    urlInput.value = url;

    if (pushHistory) {
      history = history.slice(0, histIdx + 1);
      history.push(url);
      histIdx = history.length - 1;
    }
    updateNavBtns();

    errorOverlay.style.display = 'none';
    loadOverlay.style.display  = 'flex';
    status.textContent = 'Fetching ' + url + ' …';
    iframe.srcdoc = '';

    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);

    fetch(proxyUrl)
      .then(function(r) {
        if (!r.ok) throw new Error('Proxy returned ' + r.status);
        return r.json();
      })
      .then(function(data) {
        if (!data || !data.contents) throw new Error('Empty response from proxy');

        var html = data.contents;
        var base = new URL(url);
        var basePath = base.pathname.replace(/\/[^/]*$/, '/');
        var baseTag = '<base href="' + base.origin + basePath + '">';

        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/<head([^>]*)>/i, '<head$1>' + baseTag);
        } else {
          html = baseTag + html;
        }

        html = html.replace(/<meta[^>]+x-frame-options[^>]*>/gi, '');

        iframe.srcdoc = html;
        loadOverlay.style.display = 'none';
        status.textContent = '✓ ' + url;
        setTimeout(function() { status.textContent = url; }, 2500);
      })
      .catch(function(err) {
        loadOverlay.style.display = 'none';
        showError(url, err.message);
      });
  }

  function showError(url, reason) {
    errorOverlay.style.display = 'flex';
    errorOverlay.innerHTML =
      '<div class="browser-err-ico">⚠️</div>' +
      '<div class="browser-err-title">Can\'t load page</div>' +
      '<div class="browser-err-msg">' + (reason || 'The proxy could not fetch this page.') + '</div>' +
      '<div class="browser-err-url">' + url + '</div>' +
      '<button class="btn98 browser-err-safari" style="margin-top:12px">Open in Safari ↗</button>';
    errorOverlay.querySelector('.browser-err-safari').onclick = function() { window.open(url, '_blank'); };
    status.textContent = 'Failed to load page.';
  }

  /* ── Event handlers ──────────────────────────────── */
  var onGo     = function() { navigate(urlInput.value); };
  var onKey    = function(e) { if (e.key === 'Enter') { e.preventDefault(); navigate(urlInput.value); } };
  var onBack   = function() { if (histIdx > 0) { histIdx--; navigate(history[histIdx], false); } };
  var onFwd    = function() { if (histIdx < history.length - 1) { histIdx++; navigate(history[histIdx], false); } };
  var onReload = function() { if (currentUrl) navigate(currentUrl, false); };
  var onSafari = function() { window.open(sanitize(urlInput.value), '_blank'); };

  goBtn.addEventListener('click', onGo);
  urlInput.addEventListener('keydown', onKey);
  urlInput.addEventListener('focus', function() { urlInput.select(); });
  backBtn.addEventListener('click', onBack);
  fwdBtn.addEventListener('click', onFwd);
  reloadBtn.addEventListener('click', onReload);
  safariBtn.addEventListener('click', onSafari);

  /* ── Initial page ────────────────────────────────── */
  navigate('https://en.wikipedia.org/wiki/Main_Page');

  /* ── Cleanup ─────────────────────────────────────── */
  return function() {
    goBtn.removeEventListener('click', onGo);
    urlInput.removeEventListener('keydown', onKey);
    backBtn.removeEventListener('click', onBack);
    fwdBtn.removeEventListener('click', onFwd);
    reloadBtn.removeEventListener('click', onReload);
    safariBtn.removeEventListener('click', onSafari);
  };
}
