/* ════════════ BROWSER ════════════ */
function initBrowser() {
  const wrap = document.createElement('div');
  wrap.className = 'browser-wrap';
  content.appendChild(wrap);

  const toolbar = document.createElement('div');
  toolbar.className = 'browser-toolbar';
  toolbar.innerHTML = `
    <div class="browser-url-group">
      <input class="browser-url" type="text" placeholder="Search or enter url" value="https://duckduckgo.com/" />
      <button class="btn98 browser-go">Go</button>
    </div>
    <div class="browser-actions">
      <button class="btn98 browser-new">Open in New Tab</button>
      <button class="btn98 browser-clear">Home</button>
    </div>
  `;
  wrap.appendChild(toolbar);

  const frameWrap = document.createElement('div');
  frameWrap.className = 'browser-frame-wrap';
  frameWrap.style.background = '#fff';
  const iframe = document.createElement('iframe');
  iframe.className = 'browser-iframe';
  iframe.src = 'https://duckduckgo.com/';
  iframe.style.backgroundColor = '#fff';
  frameWrap.appendChild(iframe);

  const errorOverlay = document.createElement('div');
  errorOverlay.className = 'browser-error';
  errorOverlay.textContent = 'Page blocked or unavailable. Use "Open in New Tab".';
  errorOverlay.style.display = 'none';
  frameWrap.appendChild(errorOverlay);

  wrap.appendChild(frameWrap);

  const status = document.createElement('div');
  status.className = 'browser-status';
  status.textContent = 'Type a search or a website address and tap Go.';
  wrap.appendChild(status);

  const urlInput = toolbar.querySelector('.browser-url');
  const goBtn = toolbar.querySelector('.browser-go');
  const newBtn = toolbar.querySelector('.browser-new');
  const homeBtn = toolbar.querySelector('.browser-clear');

  function sanitize(value) {
    let url = value.trim();
    if (!url) return 'https://duckduckgo.com/';
    if (url.match(/^\w+:\/\//)) return url;
    if (url.includes(' ')) return 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
    if (url.includes('.') && !url.includes(' ')) return 'https://' + url;
    return 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
  }

  function navigate(value) {
    const url = sanitize(value);
    status.textContent = 'Loading ' + url + ' ...';
    iframe.src = url;
    urlInput.value = url;
  }

  const onGo = () => navigate(urlInput.value);
  const onKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigate(urlInput.value);
    }
  };
  const onNew = () => {
    const url = sanitize(urlInput.value);
    window.open(url, '_blank');
  };
  const onHome = () => {
    urlInput.value = 'https://duckduckgo.com/';
    navigate(urlInput.value);
  };
  const onLoad = () => {
    errorOverlay.style.display = 'none';
    status.textContent = 'Loaded: ' + iframe.src;
    setTimeout(() => {
      status.textContent = 'If a site blocks embedding, use "Open in New Tab".';
    }, 900);
  };
  const onError = () => {
    errorOverlay.style.display = 'flex';
    status.textContent = 'Unable to display this page inside the app.';
  };

  goBtn.addEventListener('click', onGo);
  urlInput.addEventListener('keydown', onKey);
  newBtn.addEventListener('click', onNew);
  homeBtn.addEventListener('click', onHome);
  iframe.addEventListener('load', onLoad);
  iframe.addEventListener('error', onError);

  return () => {
    goBtn.removeEventListener('click', onGo);
    urlInput.removeEventListener('keydown', onKey);
    newBtn.removeEventListener('click', onNew);
    homeBtn.removeEventListener('click', onHome);
    iframe.removeEventListener('load', onLoad);
    iframe.removeEventListener('error', onError);
  };
}
