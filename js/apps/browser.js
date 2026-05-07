/* ════════════ BROWSER v8 — Proxy Edition ════════════
   Uses corsproxy.io to fetch pages server-side,
   bypassing X-Frame-Options entirely.
   ════════════════════════════════════════════════════ */
function initBrowser() {
  var wrap = document.createElement('div');
  wrap.className = 'browser-wrap';
  content.appendChild(wrap);

  var toolbar = document.createElement('div');
  toolbar.className = 'browser-toolbar';
  toolbar.innerHTML =
    '<div class="browser-nav-group">' +
      '<button class="btn98 browser-back">◀</button>' +
      '<button class="btn98 browser-fwd">▶</button>' +
      '<button class="btn98 browser-reload">↺</button>' +
    '</div>' +
    '<div class="browser-url-group">' +
      '<input class="browser-url" type="text" placeholder="Search or enter URL…" autocorrect="off" autocapitalize="off" spellcheck="false" />' +
      '<button class="btn98 browser-go">Go</button>' +
    '</div>' +
    '<div class="browser-actions">' +
      '<button class="btn98 browser-safari">Open in Safari</button>' +
    '</div>';
  wrap.appendChild(toolbar);

  var frameWrap = document.createElement('div');
  frameWrap.className = 'browser-frame-wrap';

  var iframe = document.createElement('iframe');
  iframe.className = 'browser-iframe';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  frameWrap.appendChild(iframe);

  var loadOverlay = document.createElement('div');
  loadOverlay.className = 'browser-loading';
  loadOverlay.innerHTML = '<div class="browser-spinner"></div><div class="browser-load-text">Loading…</div>';
  loadOverlay.style.display = 'none';
  frameWrap.appendChild(loadOverlay);

  var errorOverlay = document.createElement('div');
  errorOverlay.className = 'browser-error';
  errorOverlay.style.display = 'none';
  frameWrap.appendChild(errorOverlay);

  wrap.appendChild(frameWrap);

  var status = document.createElement('div');
  status.className = 'browser-status';
  status.textContent = 'Enter a URL or search and tap Go.';
  wrap.appendChild(status);

  var urlInput  = wrap.querySelector('.browser-url');
  var goBtn     = wrap.querySelector('.browser-go');
  var backBtn   = wrap.querySelector('.browser-back');
  var fwdBtn    = wrap.querySelector('.browser-fwd');
  var reloadBtn = wrap.querySelector('.browser-reload');
  var safariBtn = wrap.querySelector('.browser-safari');

  var hist = [], histIdx = -1, currentUrl = '';

  function updateNav() {
    backBtn.disabled = histIdx <= 0;
    fwdBtn.disabled  = histIdx >= hist.length - 1;
  }

  function sanitize(value) {
    var url = value.trim();
    if (!url) return 'https://en.wikipedia.org/wiki/Main_Page';
    if (/^[\w]+:\/\//.test(url)) return url;
    if (url.includes(' ') || !url.includes('.')) return 'https://duckduckgo.com/html/?q=' + encodeURIComponent(url);
    return 'https://' + url;
  }

  function navigate(rawUrl, push) {
    if (push === undefined) push = true;
    var url = sanitize(rawUrl);
    currentUrl = url;
    urlInput.value = url;
    if (push) { hist = hist.slice(0, histIdx + 1); hist.push(url); histIdx = hist.length - 1; }
    updateNav();

    errorOverlay.style.display = 'none';
    loadOverlay.style.display  = 'flex';
    iframe.srcdoc = '';
    status.textContent = 'Fetching…';

    var proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(url);

    fetch(proxyUrl)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function(html) {
        if (!html || html.trim().length === 0) throw new Error('Empty response');
        var base = new URL(url);
        var basePath = base.pathname.replace(/\/[^/]*$/, '/');
        var baseTag = '<base href="' + base.origin + basePath + '">';
        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/<head([^>]*)>/i, '<head$1>' + baseTag);
        } else {
          html = baseTag + html;
        }
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
      '<div class="browser-err-msg">' + (reason || 'Could not fetch this page.') + '</div>' +
      '<div class="browser-err-url">' + url + '</div>' +
      '<button class="btn98 browser-err-safari" style="margin-top:12px">Open in Safari ↗</button>';
    errorOverlay.querySelector('.browser-err-safari').onclick = function() { window.open(url, '_blank'); };
    status.textContent = 'Failed.';
  }

  goBtn.onclick     = function() { navigate(urlInput.value); };
  backBtn.onclick   = function() { if (histIdx > 0) { histIdx--; navigate(hist[histIdx], false); } };
  fwdBtn.onclick    = function() { if (histIdx < hist.length - 1) { histIdx++; navigate(hist[histIdx], false); } };
  reloadBtn.onclick = function() { if (currentUrl) navigate(currentUrl, false); };
  safariBtn.onclick = function() { window.open(sanitize(urlInput.value), '_blank'); };
  urlInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); navigate(urlInput.value); } });
  urlInput.addEventListener('focus', function() { urlInput.select(); });

  navigate('https://en.wikipedia.org/wiki/Main_Page');
}
