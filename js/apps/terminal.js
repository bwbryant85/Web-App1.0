/* ════════════ HACKER TERMINAL ════════════ */
function initTerminal() {
  POS.markFlag('usedTerminal');
  POS.trackAppOpen('terminal');
  POS.addXP(10, 'terminal');

  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'width:100%;height:100%;display:flex;flex-direction:column;',
    'background:#000;font-family:"Share Tech Mono",monospace;',
    'overflow:hidden;',
  ].join('');
  content.appendChild(wrap);

  /* Scanline overlay */
  const scanlines = document.createElement('div');
  scanlines.style.cssText = [
    'position:absolute;inset:0;pointer-events:none;z-index:10;',
    'background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,0,.015) 3px,rgba(0,255,0,.015) 4px);',
  ].join('');
  wrap.style.position = 'relative';
  wrap.appendChild(scanlines);

  /* Output area */
  const out = document.createElement('div');
  out.style.cssText = [
    'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    'padding:calc(var(--safe-top,89px) + 8px) 16px 12px;',
    'display:flex;flex-direction:column;gap:1px;',
    'color:#00ff41;font-size:.72rem;line-height:1.7;letter-spacing:.04em;',
  ].join('');
  wrap.appendChild(out);

  /* Input row */
  const inputRow = document.createElement('div');
  inputRow.style.cssText = [
    'flex-shrink:0;display:flex;align-items:center;gap:6px;',
    'padding:8px 16px calc(var(--sb,20px) + 14px);',
    'border-top:1px solid #00ff4130;background:#000;',
  ].join('');
  inputRow.innerHTML = `<span style="color:#00ff41;font-size:.72rem;white-space:nowrap;">root@ipocket:~$ </span>`;

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.autocomplete = 'off';
  inp.autocapitalize = 'off';
  inp.style.cssText = [
    'flex:1;background:transparent;border:none;outline:none;',
    'color:#00ff41;font-family:"Share Tech Mono",monospace;font-size:.72rem;',
    'letter-spacing:.04em;caret-color:#00ff41;',
  ].join('');
  inputRow.appendChild(inp);
  wrap.appendChild(inputRow);

  // ── Command DB ─────────────────────────────────────
  const hostname = 'ipocket-device';
  const uptime = Math.floor(Math.random() * 86400);
  const uid = Math.floor(Math.random() * 9000) + 1000;

  const COMMANDS = {
    help: () => [
      '<span style="color:#00ffcc">Available commands:</span>',
      '  <span style="color:#ffd700">scan</span>        — scan network for devices',
      '  <span style="color:#ffd700">decrypt</span>     — decrypt target file',
      '  <span style="color:#ffd700">whoami</span>      — display current user',
      '  <span style="color:#ffd700">ls</span>          — list files',
      '  <span style="color:#ffd700">ps</span>          — list running processes',
      '  <span style="color:#ffd700">netstat</span>     — show network connections',
      '  <span style="color:#ffd700">hack [target]</span> — initiate attack sequence',
      '  <span style="color:#ffd700">ping [host]</span>  — ping a host',
      '  <span style="color:#ffd700">ssh [user@host]</span> — remote shell',
      '  <span style="color:#ffd700">crack</span>       — brute force password',
      '  <span style="color:#ffd700">matrix</span>      — enter the matrix',
      '  <span style="color:#ffd700">xp</span>          — show your XP stats',
      '  <span style="color:#ffd700">clear</span>       — clear terminal',
      '  <span style="color:#ffd700">exit</span>        — close terminal',
    ],
    whoami: () => [`<span style="color:#00ff41">root</span> (uid=${uid}, gid=0)`],
    ls: () => [
      '<span style="color:#00ffcc">drwxr-xr-x</span>  documents/',
      '<span style="color:#00ffcc">drwxr-xr-x</span>  games/',
      '<span style="color:#00ffcc">drwxr-xr-x</span>  system/',
      '<span style="color:#00ff41">-rwxr-xr-x</span>  kernel.bin',
      '<span style="color:#00ff41">-rw-r--r--</span>  config.sys',
      '<span style="color:#ff6d6d">-rw-------</span>  secrets.enc',
    ],
    ps: () => {
      const procs = [
        ['1','root','kernel'],['42','root','security-daemon'],
        ['87','root','net-monitor'],['133','root','ipocket-ui'],
        ['201','root','battery-svc'],['312','root','sensor-hub'],
      ];
      return [
        '<span style="color:#00ffcc">PID    USER    COMMAND</span>',
        ...procs.map(([pid,user,cmd]) => `${pid.padEnd(7)}${user.padEnd(8)}${cmd}`),
      ];
    },
    netstat: () => {
      const conns = [
        ['ESTABLISHED','192.168.1.1:443','api.openmeteo.com'],
        ['ESTABLISHED','10.0.0.1:80','cdn.jsdelivr.net'],
        ['LISTEN','0.0.0.0:8080','localhost'],
        ['TIME_WAIT','172.16.0.1:443','api.anthropic.com'],
      ];
      return [
        '<span style="color:#00ffcc">STATE          LOCAL              REMOTE</span>',
        ...conns.map(([s,l,r]) => `${s.padEnd(15)}${l.padEnd(20)}${r}`),
      ];
    },
    scan: () => {
      const devices = [
        `192.168.1.1   — Router         [OPEN]`,
        `192.168.1.${Math.floor(Math.random()*50)+10}  — Unknown device [VULNERABLE]`,
        `192.168.1.${Math.floor(Math.random()*50)+60}  — Smartphone    [SECURED]`,
        `192.168.1.254 — Gateway        [OPEN]`,
      ];
      return [
        '<span style="color:#ffd700">Scanning network 192.168.1.0/24…</span>',
        '...',
        '<span style="color:#00ff41">Scan complete. 4 hosts found:</span>',
        ...devices.map(d => `  ${d}`),
        '',
        '<span style="color:#ff6d6d">WARNING: Vulnerable device detected.</span>',
      ];
    },
    decrypt: () => [
      '<span style="color:#ffd700">Loading secrets.enc…</span>',
      'Trying AES-256 keys…',
      '<span style="color:#ff6d6d">████████████████████ 100%</span>',
      '<span style="color:#00ff41">Decryption complete.</span>',
      '',
      '<span style="color:#00ffcc">Contents:</span>',
      '  PROJECT_CODENAME: iPOCKET',
      '  STATUS: ACTIVE',
      `  OPERATOR: User #${uid}`,
      '  CLEARANCE: LEVEL 9',
    ],
    crack: () => {
      const time = (Math.random() * 3 + 0.5).toFixed(1);
      const pw = ['hunter2','correct-horse','p@ssw0rd1','letmein123'][Math.floor(Math.random()*4)];
      return [
        '<span style="color:#ffd700">Initiating brute-force attack…</span>',
        'Dictionary: rockyou.txt (14M entries)',
        '████████████████████ 100%',
        `<span style="color:#00ff41">Password found in ${time}s:</span> <span style="color:#ff4af8">${pw}</span>`,
      ];
    },
    matrix: () => {
      // Trigger a brief matrix rain effect
      setTimeout(() => startMatrixRain(wrap), 100);
      return ['<span style="color:#00ff41">Entering the matrix…</span>'];
    },
    xp: () => {
      const s = POS.get();
      const prog = POS.getXPProgress();
      return [
        '<span style="color:#00ffcc">── XP STATUS ──</span>',
        `Level:       ${s.level}`,
        `XP:          ${s.xp} / ${prog.needed}`,
        `Games:       ${s.gamesPlayed||0} played`,
        `Apps opened: ${s.appsOpened||0}`,
        `Achievements: ${Object.keys(s.achievements).length}`,
      ];
    },
    clear: () => { out.innerHTML = ''; return []; },
    exit: () => { setTimeout(() => { try { closeApp(); } catch {} }, 300); return ['Goodbye.']; },
  };

  // ── Print helper ───────────────────────────────────
  let printQueue = [];
  let printing = false;

  function printLines(lines, fast) {
    lines.forEach(l => printQueue.push(l));
    if (!printing) drainPrint(fast);
  }

  function drainPrint(fast) {
    if (!printQueue.length) { printing = false; return; }
    printing = true;
    const line = printQueue.shift();
    const el = document.createElement('div');
    el.innerHTML = line;
    out.appendChild(el);
    out.scrollTop = out.scrollHeight;
    setTimeout(() => drainPrint(fast), fast ? 0 : 22);
  }

  // ── Boot text ──────────────────────────────────────
  const bootLines = [
    '<span style="color:#00ffcc">iPOCKET TERMINAL v2.1</span>',
    `Connected to <span style="color:#ffd700">${hostname}</span> — uid=${uid}`,
    `Uptime: ${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m`,
    '',
    'Type <span style="color:#ffd700">help</span> for available commands.',
    '',
  ];
  printLines(bootLines, false);

  // ── Command dispatch ───────────────────────────────
  function runCommand(cmd) {
    const parts = cmd.trim().split(' ');
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Echo command
    const echo = document.createElement('div');
    echo.innerHTML = `<span style="color:#00ffcc">root@${hostname}:~$</span> ${cmd}`;
    out.appendChild(echo);
    out.scrollTop = out.scrollHeight;

    haptic('light');

    if (!cmd.trim()) return;

    // Special multi-arg commands
    if (name === 'ping') {
      const host = args[0] || '192.168.1.1';
      printLines([
        `<span style="color:#ffd700">PING ${host}…</span>`,
        `64 bytes from ${host}: icmp_seq=1 time=${(Math.random()*20+1).toFixed(1)}ms`,
        `64 bytes from ${host}: icmp_seq=2 time=${(Math.random()*20+1).toFixed(1)}ms`,
        `64 bytes from ${host}: icmp_seq=3 time=${(Math.random()*20+1).toFixed(1)}ms`,
        `<span style="color:#00ff41">3 packets transmitted, 3 received, 0% packet loss</span>`,
        '',
      ]);
      return;
    }

    if (name === 'ssh') {
      const target = args[0] || 'user@192.168.1.1';
      printLines([
        `<span style="color:#ffd700">Connecting to ${target}…</span>`,
        'Authenticating with key exchange…',
        '<span style="color:#ff6d6d">Connection refused: Permission denied (publickey)</span>',
        '',
      ]);
      return;
    }

    if (name === 'hack') {
      const target = args[0] || '192.168.1.1';
      printLines([
        `<span style="color:#ff4af8">INITIATING ATTACK: ${target}</span>`,
        'Phase 1: Reconnaissance… <span style="color:#00ff41">DONE</span>',
        'Phase 2: Exploit CVE-2024-9999… <span style="color:#00ff41">DONE</span>',
        'Phase 3: Privilege escalation… <span style="color:#00ff41">DONE</span>',
        `<span style="color:#00ff41">Root shell obtained on ${target}</span>`,
        '<span style="color:#ffd700">Remember: This is simulated. Always hack ethically.</span>',
        '',
      ]);
      POS.addXP(5, 'hack_command');
      return;
    }

    const handler = COMMANDS[name];
    if (handler) {
      const result = handler(args);
      if (result.length) printLines([...result, '']);
    } else {
      printLines([`<span style="color:#ff5252">bash: ${name}: command not found</span>`, '']);
    }
  }

  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = inp.value;
      inp.value = '';
      runCommand(val);
    }
  });

  // Focus input
  setTimeout(() => inp.focus(), 300);

  // ── Matrix rain easter egg ─────────────────────────
  function startMatrixRain(container) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;z-index:20;width:100%;height:100%;';
    container.appendChild(cv);
    cv.width = cv.offsetWidth;
    cv.height = cv.offsetHeight;
    const ctx = cv.getContext('2d');
    const cols = Math.floor(cv.width / 14);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*!アイウエオカキクケコ';

    let frame = 0;
    const raf = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = '13px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14);
        if (y * 14 > cv.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      if (++frame > 200) { clearInterval(raf); cv.remove(); }
    }, 40);
  }

  return () => {};
}
