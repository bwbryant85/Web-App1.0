/* ════════════ CASINO 🎰 ════════════ */

/* ── Wallet lives OUTSIDE initCasino so it survives app re-opens ──
   First call reads localStorage. After that the in-memory value is
   authoritative and localStorage is kept in sync on every change.   */
const _CASINO_KEY = 'ipocket_casino_coins';
let _casinoCoins = null; // null = not yet loaded

const _loadCoins  = () => {
  if (_casinoCoins !== null) return; // already loaded this session
  try {
    const v = parseInt(localStorage.getItem(_CASINO_KEY));
    _casinoCoins = (!isNaN(v) && v >= 0) ? v : 1000;
  } catch(e) { _casinoCoins = 1000; }
};
const _saveCoins  = () => {
  try { localStorage.setItem(_CASINO_KEY, _casinoCoins); } catch(e) {}
};
const _addCoins   = delta => {
  _casinoCoins = Math.max(0, _casinoCoins + delta);
  _saveCoins();
};

/* ════════════════════════════════════════════════════════════════ */
function initCasino() {
  _loadCoins(); // no-op after first call in a session

  let activeGame = null;

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;';
  content.appendChild(root);

  /* ── Styles ── */
  if (!document.getElementById('casino-styles')) {
    const st = document.createElement('style');
    st.id = 'casino-styles';
    st.textContent = `
      @keyframes cs-deal  {from{opacity:0;transform:translateY(-40px) rotate(-8deg)}to{opacity:1;transform:translateY(0) rotate(0)}}
      @keyframes cs-win   {0%,100%{transform:scale(1)}25%{transform:scale(1.18)}75%{transform:scale(1.1)}}
      @keyframes cs-shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
      @keyframes cs-spinb {from{filter:blur(4px);transform:translateY(-60px)}to{filter:blur(0);transform:translateY(0)}}
      @keyframes cs-coins {0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(1.4);opacity:0}}
      @keyframes cs-pulse {0%,100%{box-shadow:0 0 20px rgba(255,215,0,.4)}50%{box-shadow:0 0 40px rgba(255,215,0,.9)}}
    `;
    document.head.appendChild(st);
  }

  /* ── Header ── */
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:89px 18px 0;background:#050508;';
  root.appendChild(header);

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;';
  headerRow.innerHTML = `
    <button id="cs-back" style="display:none;font-family:'Orbitron',sans-serif;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);background:transparent;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 0;text-shadow:var(--gc);">← Back</button>
    <div id="cs-title" style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;">🎰 Casino</div>
    <div id="cs-wallet" style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,.6);letter-spacing:.06em;">🪙 ${_casinoCoins.toLocaleString()}</div>`;
  header.appendChild(headerRow);

  /* ── Body ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  root.appendChild(body);

  /* ── Wallet helpers ── */
  const refreshWalletDisplay = () => {
    const el = document.getElementById('cs-wallet');
    if (el) el.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
    const lb = document.getElementById('cs-lobby-bal');
    if (lb) lb.textContent = `🪙 ${_casinoCoins.toLocaleString()}`;
  };

  const updateWallet = (delta, refEl) => {
    _addCoins(delta);
    refreshWalletDisplay();
    if (delta !== 0 && refEl) {
      const float = document.createElement('div');
      float.style.cssText = `position:fixed;font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;color:${delta>0?'#ffd700':'#ff6b6b'};pointer-events:none;z-index:9999;animation:cs-coins .8s ease forwards;`;
      float.textContent = (delta > 0 ? '+' : '') + delta.toLocaleString();
      const r = refEl.getBoundingClientRect();
      float.style.left = (r.left + r.width/2 - 30) + 'px';
      float.style.top  = r.top + 'px';
      document.body.appendChild(float);
      setTimeout(() => float.remove(), 900);
    }
  };

  /* ════ LOBBY ════ */
  const lobbyPanel = document.createElement('div');
  lobbyPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 60px;display:flex;flex-direction:column;gap:14px;';
  body.appendChild(lobbyPanel);

  const GAMES = [
    {id:'slots',     name:'Slot Machine', ico:'🎰', desc:'3 reels · Match to win',         col:'#ffd700', grad:'linear-gradient(145deg,#3d2000,#1a0d00)', jackpot:'50×'},
    {id:'hilo',      name:'Hi-Lo',        ico:'🃏', desc:'Higher or lower?',               col:'#ff6b6b', grad:'linear-gradient(145deg,#2a0010,#0a0005)', jackpot:'×streak'},
    {id:'blackjack', name:'Blackjack',    ico:'♠️', desc:'Beat the dealer to 21',           col:'#00ffcc', grad:'linear-gradient(145deg,#003322,#000f0a)', jackpot:'1.5×'},
  ];

  // Balance card at top
  const balCard = document.createElement('div');
  balCard.style.cssText = `
    margin-bottom:18px;padding:20px 20px 16px;border-radius:22px;
    background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,140,0,.04));
    border:1px solid rgba(255,215,0,.2);
    box-shadow:0 0 30px rgba(255,215,0,.06);
    text-align:center;position:relative;overflow:hidden;`;
  balCard.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#ffd700,transparent);"></div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:rgba(255,215,0,.45);letter-spacing:.22em;text-transform:uppercase;margin-bottom:8px;">Your Balance</div>
    <div id="cs-lobby-bal" style="font-family:'Orbitron',sans-serif;font-size:2.4rem;font-weight:900;color:#ffd700;text-shadow:0 0 24px rgba(255,215,0,.6);letter-spacing:.04em;">🪙 ${_casinoCoins.toLocaleString()}</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">
      <button id="cs-refill" style="font-family:'Orbitron',sans-serif;font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.4);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:7px 18px;border-radius:14px;cursor:pointer;-webkit-tap-highlight-color:transparent;">↑ Refill to 1,000</button>
    </div>`;
  lobbyPanel.appendChild(balCard);

  // Section label
  const lobbyHdr = document.createElement('div');
  lobbyHdr.style.cssText = 'font-family:"Orbitron",sans-serif;font-size:.52rem;color:var(--dim);letter-spacing:.22em;text-transform:uppercase;margin-bottom:12px;padding:0 2px;';
  lobbyHdr.textContent = '// Games //';
  lobbyPanel.appendChild(lobbyHdr);

  GAMES.forEach((g, idx) => {
    const card = document.createElement('div');
    card.style.cssText = `
      padding:0;border-radius:24px;
      background:${g.grad};
      border:1px solid ${g.col}35;
      box-shadow:0 6px 28px rgba(0,0,0,.55),0 0 0 0 ${g.col};
      cursor:pointer;-webkit-tap-highlight-color:transparent;
      transition:transform .14s,box-shadow .14s;
      position:relative;overflow:hidden;
      animation:sp-fade-in .4s ${idx*.1}s both;`;
    card.innerHTML = `
      <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,${g.col}cc,transparent);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 20% 30%,rgba(255,255,255,.04),transparent 60%);pointer-events:none;"></div>
      <div style="display:flex;align-items:center;gap:0;padding:20px 20px;">
        <!-- Big icon -->
        <div style="width:64px;height:64px;border-radius:18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0;margin-right:16px;">
          ${g.ico}
        </div>
        <!-- Info -->
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;letter-spacing:.06em;color:#fff;margin-bottom:4px;">${g.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:rgba(255,255,255,.35);letter-spacing:.05em;">${g.desc}</div>
          <div style="margin-top:7px;display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.06);border:1px solid ${g.col}40;padding:3px 10px;border-radius:8px;">
            <span style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:${g.col};letter-spacing:.08em;text-transform:uppercase;">Max payout</span>
            <span style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;color:${g.col};">${g.jackpot}</span>
          </div>
        </div>
        <!-- Arrow -->
        <div style="font-size:1.6rem;color:${g.col};opacity:.4;flex-shrink:0;margin-left:8px;">›</div>
      </div>`;
    card.addEventListener('touchstart', () => {
      card.style.transform='scale(.97)';
      card.style.boxShadow=`0 2px 14px rgba(0,0,0,.4),0 0 22px ${g.col}33`;
    }, {passive:true});
    card.addEventListener('touchend', () => {
      card.style.transform='';
      card.style.boxShadow=`0 6px 28px rgba(0,0,0,.55)`;
    }, {passive:true});
    card.addEventListener('click', () => openGame(g.id));
    lobbyPanel.appendChild(card);
  });

  document.getElementById('cs-refill').onclick = () => {
    if (_casinoCoins < 1000) { updateWallet(1000 - _casinoCoins, balCard); haptic('success'); }
  };

  /* ── Game panels ── */
  const gamePanels = {};
  const makePanel = () => {
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 16px 60px;transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1.56,.64,1);';
    body.appendChild(p);
    return p;
  };

  /* ── Open / close ── */
  const openGame = id => {
    haptic('medium');
    activeGame = id;
    const g = GAMES.find(g=>g.id===id);
    document.getElementById('cs-title').textContent = g.name;
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);text-shadow:var(--gc);flex:1;background:none;-webkit-text-fill-color:unset;';
    document.getElementById('cs-back').style.display = '';
    lobbyPanel.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
    lobbyPanel.style.transform  = 'translateX(-100%)';
    if (!gamePanels[id]) {
      gamePanels[id] = makePanel();
      if (id==='slots')     buildSlots(gamePanels[id]);
      if (id==='hilo')      buildHiLo(gamePanels[id]);
      if (id==='blackjack') buildBlackjack(gamePanels[id]);
    }
    gamePanels[id].style.transform = 'translateX(0)';
  };

  const closeGame = () => {
    haptic('light');
    if (gamePanels[activeGame]) gamePanels[activeGame].style.transform = 'translateX(100%)';
    lobbyPanel.style.transform = 'translateX(0)';
    document.getElementById('cs-title').innerHTML = '';
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;';
    document.getElementById('cs-title').textContent = '🎰 Casino';
    document.getElementById('cs-back').style.display = 'none';
    activeGame = null;
    refreshWalletDisplay();
  };

  document.getElementById('cs-back').addEventListener('click', closeGame);

  /* ════ SLOT MACHINE ════ */
  const buildSlots = wrap => {
    const SYMBOLS = ['🍒','🍋','🍊','🍇','⭐','💎','7️⃣','🔔'];
    const PAYS = {'7️⃣7️⃣7️⃣':50,'💎💎💎':30,'⭐⭐⭐':20,'🔔🔔🔔':15,'🍇🍇🍇':10,'🍊🍊🍊':8,'🍋🍋🍋':6,'🍒🍒🍒':5,'💎💎':3,'7️⃣7️⃣':3,'⭐⭐':2,'🍒🍒':2,'🔔🔔':2};
    let bet=10, spinning=false;

    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding-top:10px;">
        <div style="position:relative;background:linear-gradient(180deg,#0a0800,#1a1200,#0a0800);border:2px solid rgba(255,215,0,.3);border-radius:20px;padding:8px;box-shadow:0 0 30px rgba(255,215,0,.1),inset 0 0 20px rgba(0,0,0,.8);">
          <div style="position:absolute;left:8px;right:8px;top:50%;transform:translateY(-50%);height:68px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:10px;pointer-events:none;z-index:2;"></div>
          <div style="display:flex;gap:8px;position:relative;z-index:1;" id="sl-reels">
            ${[0,1,2].map(i=>`<div id="sl-r${i}" style="width:72px;height:68px;display:flex;align-items:center;justify-content:center;font-size:2.6rem;border-radius:10px;background:rgba(255,255,255,.04);">🍒</div>`).join('')}
          </div>
        </div>
        <div id="sl-res" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;min-height:28px;text-align:center;"></div>
        <div style="display:flex;align-items:center;gap:14px;">
          <button id="sl-bd" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
          <div style="text-align:center;"><div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;">BET</div><div id="sl-bet" style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#ffd700;">10</div></div>
          <button id="sl-bu" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
          <button id="sl-max" style="font-family:'Orbitron',sans-serif;font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;color:#ffd700;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.25);padding:8px 14px;border-radius:14px;cursor:pointer;-webkit-tap-highlight-color:transparent;">MAX</button>
        </div>
        <button id="sl-spin" style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#ffd700,#ff8c00);border:none;padding:18px 52px;border-radius:50px;cursor:pointer;box-shadow:0 4px 24px rgba(255,165,0,.5);-webkit-tap-highlight-color:transparent;animation:cs-pulse 2s infinite;">SPIN</button>
        <div style="width:100%;max-width:320px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:14px 16px;">
          <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;">Payouts (× bet)</div>
          ${Object.entries(PAYS).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);"><span style="font-size:.8rem;">${k}</span><span style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#ffd700;">×${v}</span></div>`).join('')}
        </div>
      </div>`;

    const betEl=document.getElementById('sl-bet'), resEl=document.getElementById('sl-res'), spinBtn=document.getElementById('sl-spin');
    const setBet=v=>{bet=Math.max(5,Math.min(200,v));betEl.textContent=bet;};
    document.getElementById('sl-bd').onclick=()=>{haptic('light');setBet(bet-5);};
    document.getElementById('sl-bu').onclick=()=>{haptic('light');setBet(bet+5);};
    document.getElementById('sl-max').onclick=()=>{haptic('light');setBet(200);};

    spinBtn.addEventListener('click',()=>{
      if(spinning||_casinoCoins<bet){if(_casinoCoins<bet){resEl.style.color='#ff6b6b';resEl.textContent='Not enough coins!';}return;}
      spinning=true;haptic('medium');updateWallet(-bet,spinBtn);resEl.textContent='';
      const final=[0,1,2].map(()=>SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]);
      if(Math.random()<.3)final[1]=final[0];
      [0,1,2].forEach(i=>{
        const r=document.getElementById(`sl-r${i}`);let t=0,max=8+i*5;
        const iv=setInterval(()=>{r.textContent=SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];r.style.filter='blur(2px)';t++;
          if(t>=max){clearInterval(iv);r.textContent=final[i];r.style.filter='';
            if(i===2)setTimeout(()=>{
              const k3=final.join(''),k2a=final[0]===final[1]?final[0]+final[0]:null,k2b=final[1]===final[2]?final[1]+final[1]:null;
              const m=PAYS[k3]||(k2a&&PAYS[k2a])||(k2b&&PAYS[k2b])||0;
              if(m>0){const p=bet*m;updateWallet(p,spinBtn);resEl.style.color='#ffd700';resEl.textContent=`🏆 ×${m}  +${p} coins!`;haptic('success');
                [0,1,2].forEach(j=>{const rj=document.getElementById(`sl-r${j}`);rj.style.background='rgba(255,215,0,.18)';rj.style.boxShadow='0 0 20px rgba(255,215,0,.6)';setTimeout(()=>{rj.style.background='rgba(255,255,255,.04)';rj.style.boxShadow='';},1200);});}
              else{resEl.style.color='rgba(255,255,255,.3)';resEl.textContent='No match. Try again.';haptic('light');}
              spinning=false;
            },150);}
        },80);
      });
    });
    spinBtn.addEventListener('touchstart',()=>spinBtn.style.transform='scale(.95)',{passive:true});
    spinBtn.addEventListener('touchend',()=>spinBtn.style.transform='',{passive:true});
  };

  /* ════ HI-LO ════ */
  const buildHiLo = wrap => {
    const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const VALUES={A:1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:11,Q:12,K:13};
    const SCOL={'♠':'#111','♣':'#111','♥':'#cc0000','♦':'#cc0000'};
    let deck=[],cur=null,streak=0,bet=10,busy=false;
    const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s,v:VALUES[r]})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
    const draw=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
    const cHTML=(c,hidden)=>hidden?`<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:2rem;">🂠</div>`
      :`<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:8px;color:${SCOL[c.s]};animation:cs-deal .3s both;"><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;">${c.r}<br><span style="font-size:1.2rem;">${c.s}</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">${c.s}</div><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;align-self:flex-end;transform:rotate(180deg);">${c.r}<br><span style="font-size:1.2rem;">${c.s}</span></div></div>`;

    const render=()=>{
      wrap.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding-top:10px;">
        <div style="display:flex;align-items:center;gap:8px;"><div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;">Streak</div><div id="hl-st" style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#ffd700;min-width:30px;text-align:center;">${streak}</div>${streak>=3?'<div style="font-size:.7rem;color:#ffd700;">🔥</div>':''}</div>
        <div style="display:flex;align-items:center;gap:14px;"><div id="hl-cur">${cHTML(cur,false)}</div><div style="font-size:2rem;color:rgba(255,255,255,.2);">→</div><div id="hl-nxt">${cHTML(null,true)}</div></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--dim);letter-spacing:.1em;">Current: <span style="color:var(--text);">${cur.r}${cur.s} (${cur.v})</span></div>
        <div id="hl-res" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;min-height:26px;text-align:center;"></div>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,255,255,.25);text-align:center;">Streak bonus: ×${Math.max(1,streak)} on next win</div>
        <div style="display:flex;gap:12px;" id="hl-btns">
          <button id="hl-lo" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#0033cc,#001a66);border:2px solid #4488ff;padding:16px 32px;border-radius:22px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 20px rgba(0,100,255,.4);">▼ Lower</button>
          <button id="hl-hi" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#cc0000,#660000);border:2px solid #ff4444;padding:16px 32px;border-radius:22px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 20px rgba(255,0,0,.4);">▲ Higher</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;">
          <button id="hl-bd" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
          <div style="text-align:center;"><div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;">Bet</div><div id="hl-bet" style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#ffd700;">${bet}</div></div>
          <button id="hl-bu" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
          ${streak>0?`<button id="hl-cash" style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#050508;background:#ffd700;border:none;padding:10px 20px;border-radius:16px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 0 16px rgba(255,215,0,.5);">Cash Out ×${streak}</button>`:''}
        </div>
      </div>`;
      const setBet=v=>{bet=Math.max(5,Math.min(200,v));document.getElementById('hl-bet').textContent=bet;};
      document.getElementById('hl-bd').onclick=()=>{haptic('light');setBet(bet-5);};
      document.getElementById('hl-bu').onclick=()=>{haptic('light');setBet(bet+5);};
      const guess=choice=>{
        if(busy)return;if(_casinoCoins<bet){document.getElementById('hl-res').style.color='#ff6b6b';document.getElementById('hl-res').textContent='Not enough coins!';return;}
        busy=true;updateWallet(-bet,document.getElementById('hl-btns'));haptic('medium');
        const next=draw();document.getElementById('hl-nxt').innerHTML=cHTML(next,false);
        setTimeout(()=>{
          const res=document.getElementById('hl-res'),tie=next.v===cur.v,correct=!tie&&((choice==='hi'&&next.v>cur.v)||(choice==='lo'&&next.v<cur.v));
          if(tie){res.style.color='#ffd700';res.textContent='🤝 Tie — bet returned!';updateWallet(bet,res);streak=0;haptic('light');}
          else if(correct){streak++;const p=bet*Math.max(1,streak);updateWallet(p,res);res.style.color='#ffd700';res.textContent=`✓ Correct! +${p} (×${Math.max(1,streak)} streak)`;haptic('success');}
          else{res.style.color='#ff6b6b';res.textContent=`✗ Wrong! ${next.r}${next.s} (${next.v})`;streak=0;haptic('heavy');}
          cur=next;setTimeout(()=>{busy=false;render();},1200);
        },400);
      };
      document.getElementById('hl-hi').onclick=()=>guess('hi');
      document.getElementById('hl-lo').onclick=()=>guess('lo');
      const ce=document.getElementById('hl-cash');
      if(ce)ce.onclick=()=>{haptic('success');const p=bet*streak;updateWallet(p,ce);streak=0;render();};
    };
    mkDeck();cur=draw();render();
  };

  /* ════ BLACKJACK ════ */
  const buildBlackjack = wrap => {
    const SUITS=['♠','♥','♦','♣'],RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const SCOL={'♠':'#111','♣':'#111','♥':'#cc0000','♦':'#cc0000'};
    let deck=[],ph=[],dh=[],bet=20,gs='idle';
    const mkDeck=()=>{deck=[];SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}};
    const draw=()=>deck.length?deck.pop():(mkDeck(),deck.pop());
    const val=c=>['J','Q','K'].includes(c.r)?10:c.r==='A'?11:parseInt(c.r);
    const hval=h=>{let t=h.reduce((s,c)=>s+val(c),0),a=h.filter(c=>c.r==='A').length;while(t>21&&a>0){t-=10;a--;}return t;};
    const cHTML=(c,fd)=>fd?`<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">🂠</div>`
      :`<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:5px;color:${SCOL[c.s]};font-family:'Orbitron',sans-serif;flex-shrink:0;animation:cs-deal .25s both;"><div style="font-size:.65rem;font-weight:900;line-height:1.1;">${c.r}${c.s}</div><div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${c.s}</div><div style="font-size:.65rem;font-weight:900;line-height:1.1;align-self:flex-end;transform:rotate(180deg);">${c.r}${c.s}</div></div>`;
    const handHTML=(h,hide2)=>`<div style="display:flex;gap:6px;flex-wrap:wrap;">${h.map((c,i)=>i===1&&hide2?cHTML(c,true):cHTML(c,false)).join('')}</div>`;

    const idle=()=>{
      wrap.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:22px;padding-top:20px;"><div style="font-size:4rem;">♠️</div><div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:var(--cyan);letter-spacing:.1em;">BLACKJACK</div><div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--dim);text-align:center;line-height:1.7;max-width:260px;">Get closer to 21 than the dealer.<br>Dealer stands on 17. Blackjack pays 1.5×.</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <button id="bj-bd" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
          <div style="text-align:center;"><div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;">Bet</div><div id="bj-bet" style="font-family:'Orbitron',sans-serif;font-size:1.2rem;font-weight:900;color:#ffd700;">${bet}</div></div>
          <button id="bj-bu" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
        </div>
        <button id="bj-deal" style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#00ffcc,#00aa88);border:none;padding:18px 52px;border-radius:50px;cursor:pointer;box-shadow:0 4px 24px rgba(0,255,204,.4);-webkit-tap-highlight-color:transparent;">Deal</button>
        <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:rgba(255,255,255,.15);text-align:center;">Blackjack pays ×1.5 · Dealer stands on 17</div>
      </div>`;
      const sb=v=>{bet=Math.max(5,Math.min(500,v));document.getElementById('bj-bet').textContent=bet;};
      document.getElementById('bj-bd').onclick=()=>{haptic('light');sb(bet-5);};
      document.getElementById('bj-bu').onclick=()=>{haptic('light');sb(bet+5);};
      document.getElementById('bj-deal').onclick=()=>{
        if(_casinoCoins<bet)return;haptic('medium');updateWallet(-bet,document.getElementById('bj-deal'));
        ph=[draw(),draw()];dh=[draw(),draw()];gs='playing';playing();
      };
    };

    const playing=(rev=false)=>{
      const pv=hval(ph),dv=hval(dh),bust=pv>21,bj=ph.length===2&&pv===21;
      wrap.innerHTML=`<div style="display:flex;flex-direction:column;gap:16px;padding-top:8px;">
        <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:14px 16px;"><div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">Dealer ${rev?'— '+dv:''}</div>${handHTML(dh,!rev)}</div>
        <div style="background:rgba(0,255,204,.04);border:1px solid rgba(0,255,204,.12);border-radius:18px;padding:14px 16px;"><div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">You — <span style="color:${pv>21?'#ff6b6b':pv===21?'#ffd700':'var(--cyan)'}">${pv}</span></div>${handHTML(ph,false)}</div>
        <div id="bj-res" style="font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;letter-spacing:.1em;text-align:center;min-height:28px;"></div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          ${bust||bj||rev
            ?`<button id="bj-ag" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#00ffcc,#00aa88);border:none;padding:16px 40px;border-radius:50px;cursor:pointer;box-shadow:0 4px 20px rgba(0,255,204,.4);-webkit-tap-highlight-color:transparent;">Play Again</button>`
            :`<button id="bj-hit" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#e53935,#8b0000);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(200,0,0,.4);-webkit-tap-highlight-color:transparent;">Hit</button>
             <button id="bj-st" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#1565c0,#0d47a1);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(0,80,200,.4);-webkit-tap-highlight-color:transparent;">Stand</button>
             ${ph.length===2&&_casinoCoins>=bet?`<button id="bj-dbl" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#6a0dad,#3a006d);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(100,0,200,.4);-webkit-tap-highlight-color:transparent;">Double</button>`:''}`
          }
        </div>
      </div>`;
      const re=document.getElementById('bj-res');
      if(bust){re.style.color='#ff6b6b';re.textContent='💥 Bust! Dealer wins.';haptic('heavy');}
      else if(bj){const p=Math.round(bet*1.5)+bet;updateWallet(p,re);re.style.color='#ffd700';re.textContent=`🃏 Blackjack! +${p}`;haptic('success');}
      else if(rev){
        if(hval(dh)>21||pv>dv){const p=bet*2;updateWallet(p,re);re.style.color='#00ffcc';re.textContent=`🏆 You win! +${p}`;haptic('success');}
        else if(pv===dv){updateWallet(bet,re);re.style.color='#ffd700';re.textContent='🤝 Push — bet returned';haptic('light');}
        else{re.style.color='#ff6b6b';re.textContent=`💀 Dealer wins (${hval(dh)} vs ${pv})`;haptic('heavy');}
      }
      const h=document.getElementById('bj-hit'),s=document.getElementById('bj-st'),d=document.getElementById('bj-dbl'),a=document.getElementById('bj-ag');
      if(h)h.onclick=()=>{haptic('medium');ph.push(draw());if(hval(ph)>21)playing(true);else playing(false);};
      if(s)s.onclick=()=>{haptic('medium');while(hval(dh)<17)dh.push(draw());playing(true);};
      if(d)d.onclick=()=>{haptic('medium');updateWallet(-bet,d);bet*=2;ph.push(draw());while(hval(dh)<17)dh.push(draw());playing(true);};
      if(a)a.onclick=()=>{gs='idle';bet=Math.min(bet,Math.max(_casinoCoins,5));idle();};
    };

    mkDeck();idle();
  };

  /* ── Init ── */
  return () => { _saveCoins(); };
}
