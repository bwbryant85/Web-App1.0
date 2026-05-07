/* ════════════ AI ASSISTANT v8 MODERN ════════════
   Modern AI assistant with glass effects
   ════════════════════════════════════ */

function initAssistant() {
  POS.markFlag('usedAI');
  POS.trackAppOpen('assistant');

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;align-items:center;gap:12px;';
  header.innerHTML = `
    <div style="width:40px;height:40px;border-radius:20px;background:linear-gradient(135deg,#4a90d9,#00d4aa);display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🤖</div>
    <div>
      <div style="font-family:'Inter',sans-serif;font-size:1.2rem;color:#111;font-weight:600;">AI Assistant</div>
      <div style="font-family:'Inter',sans-serif;font-size:.8rem;color:#666;">Powered by advanced AI</div>
    </div>
  `;
  c.appendChild(header);

  // Messages area
  const messages = document.createElement('div');
  messages.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;display:flex;flex-direction:column;gap:16px;';
  c.appendChild(messages);

  // Input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(15,23,42,.08);border-radius:0 0 28px 28px;display:flex;gap:12px;';
  inputArea.innerHTML = `
    <textarea id="assistant-input" placeholder="Ask me anything…" style="flex:1;border:1px solid rgba(15,23,42,.12);border-radius:20px;padding:12px 16px;font-family:'Inter',sans-serif;font-size:1rem;color:#111;outline:none;resize:none;max-height:100px;overflow-y:auto;-webkit-overflow-scrolling:touch;line-height:1.4;min-height:44px;"></textarea>
    <button id="assistant-send" style="width:44px;height:44px;border-radius:22px;background:#4a90d9;border:none;color:#fff;font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">↑</button>
  `;
  c.appendChild(inputArea);

  const textarea = inputArea.querySelector('#assistant-input');
  const sendBtn = inputArea.querySelector('#assistant-send');

  let conversation = [];

  function addMessage(text, isUser = false) {
    const message = document.createElement('div');
    message.style.cssText = `display:flex;${isUser ? 'justify-content:flex-end;' : ''}`;
    
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      max-width:80%;padding:12px 16px;border-radius:18px;
      font-family:'Inter',sans-serif;font-size:.95rem;line-height:1.4;
      ${isUser 
        ? 'background:#4a90d9;color:#fff;border-bottom-right-radius:4px;' 
        : 'background:#f8f9fa;color:#111;border-bottom-left-radius:4px;'
      }
    `;
    bubble.textContent = text;
    message.appendChild(bubble);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.style.cssText = 'display:flex;';
    typing.innerHTML = `
      <div style="background:#f8f9fa;color:#111;padding:12px 16px;border-radius:18px;border-bottom-left-radius:4px;font-family:'Inter',sans-serif;font-size:.95rem;">
        <div style="display:flex;gap:4px;">
          <div class="dot" style="width:6px;height:6px;border-radius:3px;background:#666;animation:typing 1.4s infinite;"></div>
          <div class="dot" style="width:6px;height:6px;border-radius:3px;background:#666;animation:typing 1.4s infinite .2s;"></div>
          <div class="dot" style="width:6px;height:6px;border-radius:3px;background:#666;animation:typing 1.4s infinite .4s;"></div>
        </div>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function removeTyping(typingEl) {
    if (typingEl && typingEl.parentNode) {
      typingEl.parentNode.removeChild(typingEl);
    }
  }

  function generateResponse(userMessage) {
    const responses = {
      'hello': 'Hello! How can I help you today?',
      'hi': 'Hi there! What can I do for you?',
      'help': 'I can help you with various tasks. Try asking me about the weather, time, or general questions!',
      'time': `The current time is ${new Date().toLocaleTimeString()}.`,
      'date': `Today is ${new Date().toLocaleDateString()}.`,
      'weather': 'I can show you the weather! Try opening the Weather app.',
      'apps': 'You can access various apps from the home screen. Try the App Store to discover more!',
      'games': 'There are many games available! Check out Snake, Pong, Breakout, and more.',
      'settings': 'You can customize the app in Settings. Change themes, sound, and more.',
      'thank': 'You\'re welcome! Is there anything else I can help with?',
      'bye': 'Goodbye! Have a great day!',
    };

    const lowerMsg = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMsg.includes(key)) {
        return response;
      }
    }

    // Default responses
    if (lowerMsg.includes('?')) {
      return 'That\'s a great question! I\'m here to help with information about your iPOCKET device and its features.';
    } else if (lowerMsg.includes('open') || lowerMsg.includes('launch')) {
      return 'I can help you open apps! Try tapping the icons on your home screen.';
    } else {
      return 'I understand you\'re asking about something. I\'m designed to help with iPOCKET features, weather, time, and general assistance. What would you like to know?';
    }
  }

  function sendMessage() {
    const text = textarea.value.trim();
    if (!text) return;

    addMessage(text, true);
    conversation.push({ role: 'user', content: text });
    textarea.value = '';
    textarea.style.height = 'auto';

    const typingEl = showTyping();

    setTimeout(() => {
      removeTyping(typingEl);
      const response = generateResponse(text);
      addMessage(response);
      conversation.push({ role: 'assistant', content: response });
    }, 1000 + Math.random() * 2000);
  }

  sendBtn.onclick = sendMessage;
  textarea.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  textarea.oninput = () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  };

  // Welcome message
  setTimeout(() => {
    addMessage('Hello! I\'m your AI assistant. How can I help you today?');
  }, 500);

  // Add typing animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
    }
  `;
  document.head.appendChild(style);
}