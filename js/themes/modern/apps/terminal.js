/* ════════════ HACKER TERMINAL v8 MODERN ════════════
   Modern terminal with glass effects
   ════════════════════════════════════ */

function initTerminal() {
  POS.markFlag('usedTerminal');
  POS.trackAppOpen('terminal');
  POS.addXP(10, 'terminal');

  const c = window.content;
  c.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:rgba(248,249,252,.92);border-radius:28px;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:16px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(15,23,42,.08);border-radius:28px 28px 0 0;display:flex;align-items:center;gap:8px;';
  header.innerHTML = `
    <div style="font-size:1.5rem;">💻</div>
    <div style="font-family:'Inter',sans-serif;font-size:1.2rem;color:#111;font-weight:600;">Terminal</div>
  `;
  c.appendChild(header);

  // Terminal area
  const terminal = document.createElement('div');
  terminal.style.cssText = 'flex:1;display:flex;flex-direction:column;background:#000;border-radius:0 0 28px 28px;overflow:hidden;position:relative;';

  // Scanline overlay
  const scanlines = document.createElement('div');
  scanlines.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,0,.015) 3px,rgba(0,255,0,.015) 4px);';
  terminal.appendChild(scanlines);

  // Output area
  const out = document.createElement('div');
  out.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px;display:flex;flex-direction:column;gap:1px;color:#00ff41;font-family:"Share Tech Mono",monospace;font-size:.8rem;line-height:1.6;letter-spacing:.04em;';
  terminal.appendChild(out);

  // Input row
  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:6px;padding:12px 16px;border-top:1px solid #00ff4130;background:#000;';
  inputRow.innerHTML = `<span style="color:#00ff41;font-size:.8rem;white-space:nowrap;">root@ipocket:~$ </span>`;

  const inp = document.createElement('input');
  inp.type = 'text';
  inp.autocomplete = 'off';
  inp.autocapitalize = 'off';
  inp.style.cssText = 'flex:1;background:transparent;border:none;outline:none;color:#00ff41;font-family:"Share Tech Mono",monospace;font-size:.8rem;letter-spacing:.04em;caret-color:#00ff41;';
  inputRow.appendChild(inp);
  terminal.appendChild(inputRow);

  c.appendChild(terminal);

  let history = [];
  let histIdx = -1;
  let matrixRaf = null;

  function print(text, color = '#00ff41') {
    const line = document.createElement('div');
    line.style.color = color;
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  function clear() {
    out.innerHTML = '';
  }

  function matrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;';
    terminal.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = terminal.offsetWidth;
    canvas.height = terminal.offsetHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const drops = [];

    for (let i = 0; i < canvas.width / 20; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    function draw() {
      matrixRaf = requestAnimationFrame(draw);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff41';
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 20, drops[i]);
        if (drops[i] > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 20;
      }
    }
    draw();
  }

  const commands = {
    help: () => {
      print('Available commands:');
      print('  help          - Show this help');
      print('  clear         - Clear terminal');
      print('  ls            - List directory');
      print('  pwd           - Print working directory');
      print('  whoami        - Show current user');
      print('  date          - Show current date/time');
      print('  echo [text]   - Echo text');
      print('  scan          - Network scan animation');
      print('  decrypt       - Decryption animation');
      print('  hack          - Hacking animation');
      print('  matrix        - Matrix rain effect');
      print('  stop          - Stop animations');
      print('  exit          - Close terminal');
    },
    clear: clear,
    ls: () => print('Documents  Downloads  Pictures  Music  Videos  System'),
    pwd: () => print('/home/user'),
    whoami: () => print('root'),
    date: () => print(new Date().toString()),
    echo: (args) => print(args.join(' ')),
    scan: () => {
      print('Scanning network...');
      let progress = 0;
      const scanInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          clearInterval(scanInterval);
          print('Scan complete. Found 127.0.0.1');
        } else {
          print(`Scanning... ${Math.floor(progress)}%`);
        }
      }, 200);
    },
    decrypt: () => {
      print('Decrypting data...');
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      let iterations = 0;
      const decryptInterval = setInterval(() => {
        result = '';
        for (let i = 0; i < 16; i++) {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
        print(`Decrypting: ${result}`);
        iterations++;
        if (iterations > 20) {
          clearInterval(decryptInterval);
          print('Decryption complete: PASSWORD123');
        }
      }, 100);
    },
    hack: () => {
      const targets = ['bank.com', 'cia.gov', 'nasa.gov', 'apple.com'];
      const target = targets[Math.floor(Math.random() * targets.length)];
      print(`Hacking ${target}...`);
      let progress = 0;
      const hackInterval = setInterval(() => {
        progress += Math.random() * 10;
        const actions = ['Bypassing firewall...', 'Cracking passwords...', 'Injecting payload...', 'Extracting data...'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        print(`${action} ${Math.floor(progress)}%`);
        if (progress >= 100) {
          clearInterval(hackInterval);
          print('Hack successful! Access granted.');
        }
      }, 300);
    },
    matrix: () => {
      if (matrixRaf) cancelAnimationFrame(matrixRaf);
      matrixRain();
    },
    stop: () => {
      if (matrixRaf) {
        cancelAnimationFrame(matrixRaf);
        matrixRaf = null;
        const canvas = terminal.querySelector('canvas');
        if (canvas) canvas.remove();
      }
    },
    exit: () => OS.closeApp(OS.openWindows.find(w => w.appId === 'terminal')?.id),
  };

  function execute(cmd) {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commands[command]) {
      commands[command](args);
    } else {
      print(`Command not found: ${command}. Type 'help' for available commands.`);
    }
  }

  inp.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const cmd = inp.value.trim();
      if (cmd) {
        print(`root@ipocket:~$ ${cmd}`);
        history.push(cmd);
        histIdx = history.length;
        execute(cmd);
      }
      inp.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        inp.value = history[histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        inp.value = history[histIdx];
      } else {
        histIdx = history.length;
        inp.value = '';
      }
    }
  };

  print('iPOCKET Terminal v8.0');
  print('Type "help" for available commands.');
  inp.focus();

  return () => {
    if (matrixRaf) cancelAnimationFrame(matrixRaf);
  };
}