/* ════════════ BROWSER v8 — Win98 Proxy Edition ════════════ */
function initBrowser() {
  var wrap = document.createElement('div');
  wrap.className = 'browser-wrap';
  content.appendChild(wrap);

  /* Menubar */
  var menu = document.createElement('div');
  menu.className = 'win-menubar';
  menu.innerHTML = '<div class="win-menu-item">File</div><div class="win-menu-item">View</div><div class="win-menu-item">Favorites</div>';
  wrap.appendChild(menu);

  /* Toolbar */
  var toolbar = document.createElement('div');
  toolbar.className = 'browser-toolbar';
  toolbar.innerHTML =
    '<div class="browser-nav-group">' +
      '<button class="btn98 browser-back">◀ Back</button>' +
      '<button class="btn98 browser-fwd">Fwd ▶</button>' +
      '<button class="btn98 browser-reload">↺ Refresh</button>' +
    '</div>' +
    '<div class="browser-url-group">' +
      '<input class="browser-url" type="text" placeholder="Address" autocorrect="off" autocapitalize="off" spellcheck="false" />' +
      '<button class="btn98 primary browser-go">Go</button>' +
    '</div>';
  wrap.appendChild(toolbar);

  /* Second toolbar row */
  var toolbar2 = document.createElement('div');
  toolbar2.className = 'browser-toolbar';
  toolbar2.style.paddingTop = '0';
  toolbar2.innerHTML = '<button class="btn98 browser-safari">⬡ Open in Safari</button>';
  wrap.appendChild(toolbar2);

  /* Frame */
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
  status.textContent = 'Ready';
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

  function sanitize(v) {
    var url = v.trim();
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
    status.textContent = 'Connecting to ' + url + '...';

    fetch('https://corsproxy.io/?' + encodeURIComponent(url))
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function(html) {
        if (!html || !html.trim()) throw new Error('Empty response');
        var base = new URL(url);
        var bp = base.pathname.replace(/\/[^/]*$/, '/');
        var bt = '<base href="' + base.origin + bp + '">';
        html = /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, '<head$1>' + bt) : bt + html;
        iframe.srcdoc = html;
        loadOverlay.style.display = 'none';
        status.textContent = 'Done';
        setTimeout(function() { status.textContent = url; }, 1500);
      })
      .catch(function(err) {
        loadOverlay.style.display = 'none';
        errorOverlay.style.display = 'flex';
        errorOverlay.innerHTML =
          '<div class="browser-err-ico">⚠️</div>' +
          '<div class="browser-err-title">Cannot display the webpage</div>' +
          '<div class="browser-err-msg">' + err.message + '</div>' +
          '<div class="browser-err-url">' + url + '</div>' +
          '<button class="btn98" style="margin-top:10px" id="brerr-ext">Open in Safari</button>';
        errorOverlay.querySelector('#brerr-ext').onclick = function() { window.open(url, '_blank'); };
        status.textContent = 'Error: ' + err.message;
      });
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
