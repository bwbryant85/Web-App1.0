/* ════════════ BROWSER v8 MODERN — Proxy Edition ════════════
   Uses allorigins.win CORS proxy to actually load pages.
   Modern glass UI with back/forward/reload + Open in Safari.
   ════════════════════════════════════════════════════════ */
function initBrowser() {
  var c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.97);border-radius:28px;';

  /* ── Toolbar ─────────────────────────────────────── */
  var toolbar = document.createElement('div');
  toolbar.style.cssText = 'flex-shrink:0;padding:12px 16px;background:rgba(255,255,255,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;flex-direction:column;gap:10px;';

  var navRow = document.createElement('div');
  navRow.style.cssText = 'display:flex;gap:8px;align-items:center;';
  navRow.innerHTML =
    '<button id="br-back"   style="font-size:1.1rem;background:#f0f2f5;border:none;border-radius:10px;width:36px;height:36px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;">◀</button>' +
    '<button id="br-fwd"    style="font-size:1.1rem;background:#f0f2f5;border:none;border-radius:10px;width:36px;height:36px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;">▶</button>' +
    '<button id="br-reload" style="font-size:1.1rem;background:#f0f2f5;border:none;border-radius:10px;width:36px;height:36px;cursor:pointer;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;">↺</button>' +
    '<input  id="br-url" type="text" placeholder="Search or enter URL…" autocorrect="off" autocapitalize="off" spellcheck="false" style="flex:1;padding:10px 14px;background:#f0f2f5;border:none;border-radius:14px;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#111;outline:none;" />' +
    '<button id="br-go" style="font-family:\'Inter\',sans-serif;font-size:.9rem;color:#fff;background:#4a90d9;border:none;border-radius:14px;padding:10px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;white-space:nowrap;">Go</button>';
  toolbar.appendChild(navRow);

  var actRow = document.createElement('div');
  actRow.style.cssText = 'display:flex;gap:8px;';
  actRow.innerHTML =
    '<button id="br-safari" style="font-family:\'Inter\',sans-serif;font-size:.85rem;color:#4a90d9;background:#edf4fd;border:none;border-radius:12px;padding:8px 16px;cursor:pointer;-webkit-tap-highlight-color:transparent;">Open in Safari ↗</button>';
  toolbar.appendChild(actRow);
  c.appendChild(toolbar);

  /* ── Frame area ──────────────────────────────────── */
  var frameWrap = document.createElement('div');
  frameWrap.style.cssText = 'flex:1;position:relative;background:#fff;border-radius:0 0 28px 28px;overflow:hidden;';

  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:100%;border:none;background:#fff;';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  frameWrap.appendChild(iframe);

  /* Loading overlay */
  var loadOverlay = document.createElement('div');
  loadOverlay.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(248,249,252,.97);gap:16px;';
  loadOverlay.innerHTML =
    '<div style="width:40px;height:40px;border:3px solid #e0e4ef;border-top-color:#4a90d9;border-radius:50%;animation:brSpin .8s linear infinite;"></div>' +
    '<div style="font-family:\'Inter\',sans-serif;font-size:.95rem;color:#666;">Loading…</div>';
  loadOverlay.style.display = 'none';
  frameWrap.appendChild(loadOverlay);

  /* Error overlay */
  var errorOverlay = document.createElement('div');
  errorOverlay.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(248,249,252,.97);padding:32px;text-align:center;gap:8px;';
  errorOverlay.style.display = 'none';
  frameWrap.appendChild(errorOverlay);

  c.appendChild(frameWrap);

  /* Status bar */
  var status = document.createElement('div');
  status.style.cssText = 'display:none;'; /* hidden in modern — clean look */
  c.appendChild(status);

  /* Spin keyframe */
  if (!document.getElementById('br-spin-style')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'br-spin-style';
    styleEl.textContent = '@keyframes brSpin{to{transform:rotate(360deg)}}';
    document.head.appendChild(styleEl);
  }

  /* ── Refs ────────────────────────────────────────── */
  var urlInput  = toolbar.querySelector('#br-url');
  var goBtn     = toolbar.querySelector('#br-go');
  var backBtn   = toolbar.querySelector('#br-back');
  var fwdBtn    = toolbar.querySelector('#br-fwd');
  var reloadBtn = toolbar.querySelector('#br-reload');
  var safariBtn = toolbar.querySelector('#br-safari');

  /* ── History ─────────────────────────────────────── */
  var hist    = [];
  var histIdx = -1;
  var currentUrl = '';

  function updateNav() {
    backBtn.style.opacity   = histIdx <= 0 ? '0.35' : '1';
    fwdBtn.style.opacity    = histIdx >= hist.length - 1 ? '0.35' : '1';
    backBtn.style.pointerEvents = histIdx <= 0 ? 'none' : 'auto';
    fwdBtn.style.pointerEvents  = histIdx >= hist.length - 1 ? 'none' : 'auto';
  }

  /* ── URL helpers ─────────────────────────────────── */
  function sanitize(value) {
    var url = value.trim();
    if (!url) return 'https://en.wikipedia.org/wiki/Main_Page';
    if (/^[\w]+:\/\//.test(url)) return url;
    if (url.includes(' ') || !url.includes('.')) {
      return 'https://duckduckgo.com/html/?q=' + encodeURIComponent(url);
    }
    return 'https://' + url;
  }

  /* ── Navigate via proxy ──────────────────────────── */
  function navigate(rawUrl, push) {
    if (push === undefined) push = true;
    var url = sanitize(rawUrl);
    currentUrl = url;
    urlInput.value = url;

    if (push) {
      hist = hist.slice(0, histIdx + 1);
      hist.push(url);
      histIdx = hist.length - 1;
    }
    updateNav();

    errorOverlay.style.display = 'none';
    loadOverlay.style.display  = 'flex';
    iframe.srcdoc = '';

    var proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);

    fetch(proxyUrl)
      .then(function(r) {
        if (!r.ok) throw new Error('Proxy error ' + r.status);
        return r.json();
      })
      .then(function(data) {
        if (!data || !data.contents) throw new Error('Empty proxy response');

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
      })
      .catch(function(err) {
        loadOverlay.style.display = 'none';
        showError(url, err.message);
      });
  }

  function showError(url, reason) {
    errorOverlay.style.display = 'flex';
    errorOverlay.innerHTML =
      '<div style="font-size:2.5rem;margin-bottom:4px;">⚠️</div>' +
      '<div style="font-family:\'Inter\',sans-serif;font-size:1.1rem;font-weight:600;color:#111;">Can\'t load page</div>' +
      '<div style="font-family:\'Inter\',sans-serif;font-size:.85rem;color:#999;max-width:280px;">' + (reason || 'Proxy could not fetch this page.') + '</div>' +
      '<div style="font-family:\'Inter\',sans-serif;font-size:.8rem;color:#bbb;word-break:break-all;max-width:280px;margin-top:4px;">' + url + '</div>' +
      '<button id="err-safari-btn" style="margin-top:16px;font-family:\'Inter\',sans-serif;font-size:.9rem;color:#fff;background:#4a90d9;border:none;border-radius:14px;padding:10px 22px;cursor:pointer;">Open in Safari ↗</button>';
    errorOverlay.querySelector('#err-safari-btn').onclick = function() { window.open(url, '_blank'); };
  }

  /* ── Handlers ────────────────────────────────────── */
  goBtn.onclick     = function() { navigate(urlInput.value); };
  urlInput.onkeydown = function(e) { if (e.key === 'Enter') { e.preventDefault(); navigate(urlInput.value); } };
  urlInput.onfocus  = function() { urlInput.select(); };
  backBtn.onclick   = function() { if (histIdx > 0) { histIdx--; navigate(hist[histIdx], false); } };
  fwdBtn.onclick    = function() { if (histIdx < hist.length - 1) { histIdx++; navigate(hist[histIdx], false); } };
  reloadBtn.onclick = function() { if (currentUrl) navigate(currentUrl, false); };
  safariBtn.onclick = function() { window.open(sanitize(urlInput.value), '_blank'); };

  /* ── Initial load ────────────────────────────────── */
  navigate('https://en.wikipedia.org/wiki/Main_Page');
}
