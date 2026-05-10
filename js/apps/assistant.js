/* ════════════ AI ASSISTANT ════════════ */
function initAssistant() {
  POS.markFlag('usedAI');
  POS.trackAppOpen('assistant');

  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:var(--win-chrome);overflow:hidden;';
  content.appendChild(wrap);

  /* ── Header ── */
  const hdr = document.createElement('div');
  hdr.style.cssText = [
    'flex-shrink:0;padding:5px 10px;',
    'border-bottom:2px solid;',
    'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    'display:flex;align-items:center;gap:10px;',
    'background:var(--win-title-active);',
  ].join('');
  hdr.innerHTML = `
    <span style="font-size:1.2rem;flex-shrink:0;">🤖</span>
    <div>
      <div style="font-family:var(--pixel-font);font-size:1rem;font-weight:bold;color:#fff;letter-spacing:.04em;">iPOCKET Assistant</div>
      <div style="font-family:var(--pixel-font);font-size:.8rem;color:rgba(255,255,255,.7);">Powered by Claude</div>
    </div>
  `;
  wrap.appendChild(hdr);

  /* ── Messages area ── */
  const msgs = document.createElement('div');
  msgs.style.cssText = [
    'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    'padding:8px 10px;display:flex;flex-direction:column;gap:8px;',
    'background:#fff;',
  ].join('');
  wrap.appendChild(msgs);

  /* ── Quick prompts bar ── */
  const quickBar = document.createElement('div');
  quickBar.style.cssText = [
    'display:flex;gap:6px;overflow-x:auto;padding:5px 8px;flex-shrink:0;scrollbar-width:none;',
    'border-top:1px solid var(--win-chrome-dark);border-bottom:1px solid var(--win-chrome-dark);',
    'background:var(--win-chrome);',
  ].join('');
  const quickPrompts = ['What time is it?', 'Tell me a fact', 'Open Notes', 'My level?', 'Tell me a joke'];
  quickPrompts.forEach(q => {
    const chip = document.createElement('button');
    chip.textContent = q;
    chip.style.cssText = [
      'flex-shrink:0;font-family:var(--pixel-font);font-size:.82rem;',
      'color:var(--win-text);',
      'border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);',
      'background:var(--win-btn-face);',
      'padding:3px 10px;cursor:pointer;white-space:nowrap;',
      '-webkit-tap-highlight-color:transparent;',
    ].join('');
    chip.onclick = () => { textarea.value = q; sendMessage(); };
    quickBar.appendChild(chip);
  });
  wrap.appendChild(quickBar);

  /* ── Input bar ── */
  const inputBar = document.createElement('div');
  inputBar.style.cssText = [
    'flex-shrink:0;display:flex;align-items:flex-end;gap:6px;',
    'padding:6px 8px;',
    'border-top:2px solid;',
    'border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    'background:var(--win-chrome);',
  ].join('');

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Ask me anything…';
  textarea.rows = 1;
  textarea.style.cssText = [
    'flex:1;background:#fff;',
    'border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    'padding:6px 8px;',
    'font-family:var(--pixel-font);font-size:.95rem;color:#000;',
    'outline:none;resize:none;max-height:100px;overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;line-height:1.4;',
  ].join('');
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  });

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.cssText = [
    'flex-shrink:0;',
    'font-family:var(--pixel-font);font-size:.95rem;',
    'color:var(--win-select-text);background:var(--win-select);',
    'border:2px solid;border-color:var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light);',
    'padding:6px 14px;cursor:pointer;',
    '-webkit-tap-highlight-color:transparent;',
  ].join('');
  sendBtn.addEventListener('touchstart', () => { sendBtn.style.borderColor = 'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)'; sendBtn.style.transform = 'translateY(1px)'; }, { passive: true });
  sendBtn.addEventListener('touchend',   () => { sendBtn.style.borderColor = 'var(--win-chrome-light) var(--win-chrome-dark) var(--win-chrome-dark) var(--win-chrome-light)'; sendBtn.style.transform = ''; }, { passive: true });

  inputBar.appendChild(textarea);
  inputBar.appendChild(sendBtn);
  wrap.appendChild(inputBar);

  // Conversation history for context
  const history = [];

  // Greet
  addMessage('assistant', '👋 Hey! I\'m your iPOCKET Assistant. Ask me anything — questions, jokes, facts, or even "open notes" to launch an app.');

  function addMessage(role, text, isLoading) {
    const row = document.createElement('div');
    row.style.cssText = `display:flex;${role === 'user' ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}margin-bottom:2px;`;

    const bubble = document.createElement('div');
    bubble.style.cssText = [
      'max-width:84%;padding:6px 10px;',
      'font-family:var(--pixel-font);font-size:.92rem;line-height:1.5;',
      role === 'user'
        ? 'background:var(--win-select);color:var(--win-select-text);border:2px solid var(--win-select);'
        : 'background:var(--win-chrome);color:var(--win-text);border:2px solid;border-color:var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark);',
    ].join('');

    if (isLoading) {
      bubble.innerHTML = '<span style="letter-spacing:.2em;">···</span>';
      bubble.id = 'ai-loading-bubble';
    } else {
      bubble.textContent = text;
    }

    row.appendChild(bubble);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }

  let sending = false;

  async function sendMessage() {
    const text = textarea.value.trim();
    if (!text || sending) return;
    sending = true;
    haptic('medium');

    textarea.value = '';
    textarea.style.height = 'auto';

    addMessage('user', text);
    history.push({ role: 'user', content: text });

    // Handle local commands
    const lower = text.toLowerCase();
    if (lower.includes('open notes') || lower === 'notes') {
      addMessage('assistant', '📝 Opening Notes for you!');
      setTimeout(() => { window._openAppById && window._openAppById('notes'); }, 800);
      sending = false; return;
    }
    if (lower.includes('my level') || lower.includes('what level')) {
      const s = POS.get();
      const prog = POS.getXPProgress();
      addMessage('assistant', `You're Level ${s.level} with ${s.xp}/${prog.needed} XP. You've played ${s.gamesPlayed||0} games and opened ${s.appsOpened||0} apps! 🎮`);
      sending = false; return;
    }
    if (lower === 'what time is it?' || lower === 'what time is it' || lower === 'time') {
      const now = new Date();
      addMessage('assistant', `It's ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} right now.`);
      sending = false; return;
    }

    const loadBubble = addMessage('assistant', '', true);

    try {
      const systemPrompt = `You are the iPOCKET Assistant — a compact, witty AI living inside a pocket OS called iPOCKET. Keep replies SHORT (2-4 sentences max) and snappy. You can reference the app's features: games (Snake, Flappy, Pong, Breakout, Simon, 2048, Pac-Man), utilities (Notes, Weather, Timer, Clock), and creative apps (DJ Pad, Visualizer, ASCII Cam). If asked to "open [app]", say you're launching it. Be friendly and fun.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: history,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t get a response. Try again!';

      const existing = document.getElementById('ai-loading-bubble');
      if (existing) { existing.textContent = reply; existing.id = ''; }

      history.push({ role: 'assistant', content: reply });
      if (history.length > 20) history.splice(0, 2);

      POS.addXP(3, 'ai_chat');
      msgs.scrollTop = msgs.scrollHeight;
    } catch (err) {
      const existing = document.getElementById('ai-loading-bubble');
      if (existing) { existing.textContent = '⚠️ Connection error. Make sure you\'re online and try again.'; existing.id = ''; }
    }

    sending = false;
  }

  sendBtn.onclick = sendMessage;
  textarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}
