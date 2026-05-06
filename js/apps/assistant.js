/* ════════════ AI ASSISTANT ════════════ */
function initAssistant() {
  POS.markFlag('usedAI');
  POS.trackAppOpen('assistant');

  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;';
  content.appendChild(wrap);

  /* ── Header ── */
  const hdr = document.createElement('div');
  hdr.style.cssText = [
    'flex-shrink:0;padding:8px 20px 14px;',
    'border-bottom:1px solid rgba(0,255,204,.1);',
    'display:flex;align-items:center;gap:12px;',
  ].join('');
  hdr.innerHTML = `
    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--mag));display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;box-shadow:0 0 16px rgba(0,255,204,.4);">🤖</div>
    <div>
      <div style="font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--cyan);">Assistant</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:.48rem;color:var(--dim);letter-spacing:.1em;margin-top:2px;">Powered by Claude</div>
    </div>
  `;
  wrap.appendChild(hdr);

  /* ── Messages area ── */
  const msgs = document.createElement('div');
  msgs.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 16px 8px;display:flex;flex-direction:column;gap:12px;';
  wrap.appendChild(msgs);

  /* ── Input bar ── */
  const inputBar = document.createElement('div');
  inputBar.style.cssText = [
    'flex-shrink:0;display:flex;align-items:flex-end;gap:10px;',
    'padding:12px 16px 8px;',
    'border-top:1px solid rgba(255,255,255,.05);',
    'background:#050508;',
  ].join('');

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Ask me anything…';
  textarea.rows = 1;
  textarea.style.cssText = [
    'flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);',
    'border-radius:18px;padding:10px 14px;',
    'font-family:"Share Tech Mono",monospace;font-size:.8rem;color:var(--text);',
    'outline:none;resize:none;max-height:120px;overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;line-height:1.5;',
  ].join('');

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  });

  const sendBtn = document.createElement('button');
  sendBtn.style.cssText = [
    'flex-shrink:0;width:40px;height:40px;border-radius:50%;',
    'background:var(--cyan);border:none;cursor:pointer;',
    'display:flex;align-items:center;justify-content:center;',
    'box-shadow:0 0 16px rgba(0,255,204,.4);',
    '-webkit-tap-highlight-color:transparent;',
    'font-size:1rem;transition:transform .15s,background .15s;',
  ].join('');
  sendBtn.textContent = '↑';
  sendBtn.addEventListener('touchstart', () => { sendBtn.style.transform = 'scale(.88)'; }, { passive: true });
  sendBtn.addEventListener('touchend', () => { sendBtn.style.transform = ''; }, { passive: true });

  inputBar.appendChild(textarea);
  inputBar.appendChild(sendBtn);
  wrap.appendChild(inputBar);

  // Conversation history for context
  const history = [];

  // Greet
  addMessage('assistant', '👋 Hey! I\'m your iPOCKET Assistant. Ask me anything — questions, jokes, facts, or even "open notes" to launch an app.');

  // Quick prompts
  const quickBar = document.createElement('div');
  quickBar.style.cssText = 'display:flex;gap:8px;overflow-x:auto;padding:0 0 8px;flex-shrink:0;scrollbar-width:none;';
  const quickPrompts = ['What time is it?', 'Tell me a fact', 'Open Notes', 'My level?', 'Tell me a joke'];
  quickPrompts.forEach(q => {
    const chip = document.createElement('button');
    chip.textContent = q;
    chip.style.cssText = [
      'flex-shrink:0;font-family:"Share Tech Mono",monospace;font-size:.55rem;',
      'letter-spacing:.08em;color:var(--cyan);',
      'border:1px solid rgba(0,255,204,.28);background:rgba(0,255,204,.05);',
      'padding:6px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;',
      '-webkit-tap-highlight-color:transparent;',
    ].join('');
    chip.onclick = () => { textarea.value = q; sendMessage(); };
    quickBar.appendChild(chip);
  });
  msgs.parentNode.insertBefore(quickBar, msgs.nextSibling);
  // Actually insert before inputBar
  wrap.insertBefore(quickBar, inputBar);

  function addMessage(role, text, isLoading) {
    const row = document.createElement('div');
    row.style.cssText = `display:flex;${role === 'user' ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}`;

    const bubble = document.createElement('div');
    bubble.style.cssText = [
      'max-width:82%;padding:10px 14px;border-radius:18px;',
      'font-family:"Share Tech Mono",monospace;font-size:.78rem;line-height:1.55;',
      role === 'user'
        ? 'background:rgba(0,255,204,.12);border:1px solid rgba(0,255,204,.25);color:var(--text);border-bottom-right-radius:4px;'
        : 'background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:var(--text);border-bottom-left-radius:4px;',
    ].join('');

    if (isLoading) {
      bubble.innerHTML = '<span style="opacity:.5;letter-spacing:.2em;">···</span>';
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
      setTimeout(() => {
        const app = { id: 'notes', name: 'Notes' };
        const el = document.createElement('div');
        window._openAppById && window._openAppById('notes');
      }, 800);
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
      if (history.length > 20) history.splice(0, 2); // keep context manageable

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
