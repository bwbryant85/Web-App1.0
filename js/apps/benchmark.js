/* ════════════ BENCHMARK v4.5 ════════════ */
function initBenchmark() {
  const wrap = document.createElement('div');
  wrap.className = 'bm-wrap';
  content.appendChild(wrap);

  // Canvas area (top ~42% of screen)
  const ca = document.createElement('div');
  ca.className = 'bm-canvas-area';
  ca.style.height = Math.round(window.innerHeight * .42) + 'px';
  wrap.appendChild(ca);

  const lv = document.createElement('canvas');
  lv.id = 'bm-live-cv';
  lv.width = window.innerWidth;
  lv.height = Math.round(window.innerHeight * .42);
  ca.appendChild(lv);
  const lx = lv.getContext('2d');

  const ov = document.createElement('div');
  ov.className = 'bm-canvas-overlay';
  ov.innerHTML = '<div class="bm-test-badge" id="bm-badge" style="top:89px">READY</div><div class="bm-test-progress" id="bm-prog" style="width:0%"></div>';
  ca.appendChild(ov);

  const panel = document.createElement('div');
  panel.className = 'bm-panel';
  panel.innerHTML = `
    <div class="bm-top-row">
      <div class="bm-ring-wrap">
        <svg class="bm-ring-svg" width="96" height="96" viewBox="0 0 96 96">
          <circle class="bm-ring-bg" cx="48" cy="48" r="40"/>
          <circle class="bm-ring-fill" id="bm-ring" cx="48" cy="48" r="40"/>
        </svg>
        <div class="bm-ring-center">
          <div class="bm-ring-time" id="bm-time">-</div>
          <div class="bm-ring-lbl">total</div>
        </div>
      </div>
      <div class="bm-top-info">
        <div class="bm-top-title">// iPOCKET BENCHMARK v4.5 //</div>
        <div class="bm-top-phase" id="bm-phase">Ready</div>
        <div class="bm-top-sub" id="bm-sub">6 tests ~ 60 seconds</div>
      </div>
    </div>
    <div class="bm-grid">
      <div class="bm-card"><div class="bm-card-accent" style="background:linear-gradient(90deg,#00ffcc,transparent)"></div><div class="bm-card-head"><span class="bm-card-ico">⚙️</span><span class="bm-card-lbl">CPU Single</span></div><div class="bm-card-val" id="bm-c1" style="color:var(--cyan)">-</div><div class="bm-card-bar"><div class="bm-card-fill" id="bm-c1b" style="background:var(--cyan)"></div></div><div class="bm-spark" id="bm-c1s"></div></div>
      <div class="bm-card"><div class="bm-card-accent" style="background:linear-gradient(90deg,#69ff47,transparent)"></div><div class="bm-card-head"><span class="bm-card-ico">🔀</span><span class="bm-card-lbl">CPU Multi</span></div><div class="bm-card-val" id="bm-cm" style="color:#69ff47">-</div><div class="bm-card-bar"><div class="bm-card-fill" id="bm-cmb" style="background:#69ff47"></div></div><div class="bm-spark" id="bm-cms"></div></div>
      <div class="bm-card"><div class="bm-card-accent" style="background:linear-gradient(90deg,#ff4af8,transparent)"></div><div class="bm-card-head"><span class="bm-card-ico">🎮</span><span class="bm-card-lbl">GPU</span></div><div class="bm-card-val" id="bm-gp" style="color:var(--mag)">-</div><div class="bm-card-bar"><div class="bm-card-fill" id="bm-gpb" style="background:var(--mag)"></div></div><div class="bm-spark" id="bm-gps"></div></div>
      <div class="bm-card"><div class="bm-card-accent" style="background:linear-gradient(90deg,#4dd0e1,transparent)"></div><div class="bm-card-head"><span class="bm-card-ico">🧠</span><span class="bm-card-lbl">Memory</span></div><div class="bm-card-val" id="bm-mm" style="color:#4dd0e1">-</div><div class="bm-card-bar"><div class="bm-card-fill" id="bm-mmb" style="background:#4dd0e1"></div></div><div class="bm-spark" id="bm-mms"></div></div>
      <div class="bm-card"><div class="bm-card-accent" style="background:linear-gradient(90deg,#ffd740,transparent)"></div><div class="bm-card-head"><span class="bm-card-ico">🔢</span><span class="bm-card-lbl">FPU/Math</span></div><div class="bm-card-val" id="bm-fp" style="color:#ffd740">-</div><div class="bm-card-bar"><div class="bm-card-fill" id="bm-fpb" style="background:#ffd740"></div></div><div class="bm-spark" id="bm-fps"></div></div>
      <div class="bm-card"><div class="bm-card-accent" style="background:linear-gradient(90deg,#ce93d8,transparent)"></div><div class="bm-card-head"><span class="bm-card-ico">📦</span><span class="bm-card-lbl">Storage</span></div><div class="bm-card-val" id="bm-st2" style="color:#ce93d8">-</div><div class="bm-card-bar"><div class="bm-card-fill" id="bm-stb" style="background:#ce93d8"></div></div><div class="bm-spark" id="bm-sts"></div></div>
    </div>
    <div class="bm-score-box" id="bm-score" style="display:none">
      <div class="bm-score-num" id="bm-sn">-</div>
      <div class="bm-score-grade" id="bm-sg"></div>
      <div class="bm-score-label">iPOCKET Score</div>
      <div class="bm-score-tests" id="bm-stg"></div>
    </div>
    <div class="bm-btns">
      <button class="bm-start-btn" id="bm-go">Run Benchmark</button>
      <button class="bm-stop-btn" id="bm-stop" style="display:none">Stop</button>
    </div>`;
  wrap.appendChild(panel);

  // State
  var running = false, curTest = 0, lRaf = null, oTimer = null, elapsed = 0;
  var CIRC = 251;
  var ring = document.getElementById('bm-ring');
  var res = { cpu1:0, cpuM:0, gpu:0, mem:0, fp:0, stor:0 };
  var sparks = { c1:[], cm:[], gp:[], mm:[], fp:[], st:[] }, MAX_S = 24;
  var W = lv.width, H = lv.height;

  function setRing(p) { ring.style.strokeDashoffset = CIRC*(1-p); ring.style.stroke = p>.5?'var(--cyan)':p>.25?'#ffd740':'#ff4af8'; }
  function badge(t)   { var e=document.getElementById('bm-badge');  if(e) e.textContent=t; }
  function prog(p)    { var e=document.getElementById('bm-prog');   if(e) e.style.width=Math.min(100,p*100)+'%'; }
  function phase(a,b) { var e=document.getElementById('bm-phase');  if(e) e.textContent=a; var f=document.getElementById('bm-sub'); if(f) f.textContent=b; }

  function spark(id, arr, col) {
    var e=document.getElementById(id); if(!e||!arr.length) return;
    var mx=Math.max.apply(null,arr.concat([.001]));
    e.innerHTML=arr.map(function(v){ return '<div class="bm-spark-bar" style="background:'+col+';height:'+Math.max(8,Math.round(v/mx*100))+'%;opacity:'+(0.35+v/mx*0.65).toFixed(2)+'"></div>'; }).join('');
  }

  function card(vid, bid, sid, val, unit, max, col, arr) {
    var v=document.getElementById(vid); if(v) v.textContent=val+unit;
    var b=document.getElementById(bid); if(b) b.style.width=Math.min(100,val/max*100)+'%';
    if(arr){ arr.push(val); if(arr.length>MAX_S) arr.shift(); spark(sid,arr,col); }
  }

  // Offscreen GPU canvas
  var gpuCv=document.createElement('canvas'); gpuCv.width=256; gpuCv.height=256; gpuCv.style.display='none'; document.body.appendChild(gpuCv);
  var gl=gpuCv.getContext('webgl')||gpuCv.getContext('experimental-webgl'), gpuP=null, gpuT=null;
  if(gl){
    function mkS(t,s){var sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}
    gpuP=gl.createProgram();
    gl.attachShader(gpuP,mkS(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}'));
    gl.attachShader(gpuP,mkS(gl.FRAGMENT_SHADER,'precision highp float;uniform float t;uniform vec2 r;void main(){vec2 uv=(gl_FragCoord.xy/r)*2.0-1.0;float c=0.0;for(int i=0;i<64;i++){float fi=float(i);vec2 p=uv*(.5+fi*.03);p+=vec2(sin(t*.7+fi*.4),cos(t*.5+fi*.3))*.3;c+=.015/max(abs(length(p)-.3+sin(fi+t)*.1),.001);}gl_FragColor=vec4(c*.6,c*.3,c,1.0);}'));
    gl.linkProgram(gpuP); gl.useProgram(gpuP);
    var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    var ap=gl.getAttribLocation(gpuP,'a'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);
    gpuT=gl.getUniformLocation(gpuP,'t'); gl.uniform2f(gl.getUniformLocation(gpuP,'r'),256,256); gl.viewport(0,0,256,256);
  }

  function cpuWork(){
    var ops=0,s=performance.now();
    while(performance.now()-s<14){
      var x=Math.floor(Math.random()*49999)+1001,p=true;
      for(var i=2;i<=Math.sqrt(x);i++) if(x%i===0){p=false;break;}
      ops+=p?3:1;
      var a=0,b=1;
      for(var k=0;k<30;k++){var tmp=a+b;a=b;b=tmp;}
      ops+=8;
    }
    return ops;
  }

  var matCols=[];
  function initMat(){ var c=Math.floor(W/14);matCols=[];for(var i=0;i<c;i++)matCols.push({y:Math.random()*H,sp:2+Math.random()*4,ch:[]}); }
  function drawMat(){ lx.fillStyle='rgba(0,0,0,.09)';lx.fillRect(0,0,W,H);lx.font='13px monospace';lx.fillStyle='#00ffcc';matCols.forEach(function(c,i){var ch=String.fromCharCode(0x30A0+Math.floor(Math.random()*96));lx.globalAlpha=1;lx.fillText(ch,i*14,c.y);c.ch.unshift(ch);if(c.ch.length>7)c.ch.pop();c.ch.forEach(function(chr,j){lx.globalAlpha=(1-j/7)*.5;lx.fillText(chr,i*14,c.y-j*14);});c.y+=c.sp;if(c.y>H){c.y=0;c.sp=2+Math.random()*4;}});lx.globalAlpha=1; }

  var wT=0;
  function drawWave(){ lx.fillStyle='#000';lx.fillRect(0,0,W,H);var cc=28,rc=14,cw=W/cc,ch=H/rc;for(var y=0;y<rc;y++)for(var x=0;x<cc;x++){var v=Math.sin(wT+x*.4)*Math.cos(wT*.7+y*.5)*.5+.5;lx.fillStyle='rgb('+Math.round(v*255)+','+Math.round((1-v)*200)+','+Math.round(100+v*155)+')';lx.globalAlpha=.7+v*.3;lx.fillRect(x*cw+1,y*ch+1,cw-2,ch-2);}lx.globalAlpha=1;wT+=.06; }

  function drawGPU(ts){ if(gl&&gpuP){gl.useProgram(gpuP);gl.uniform1f(gpuT,ts*.001);gl.drawArrays(gl.TRIANGLES,0,6);}lx.drawImage(gpuCv,0,0,W,H); }

  var mT=0;
  function drawMem(){ var cw=W/64,ch=H/64;mT+=.08;for(var y=0;y<64;y++)for(var x=0;x<64;x++){var v=Math.abs(Math.sin(mT+x*.15+y*.2));lx.fillStyle='rgb('+Math.round(v*50)+','+Math.round(v*200+55)+','+Math.round(v*255)+')';lx.fillRect(x*cw,y*ch,cw,ch);} }

  var jT=0;
  function drawJulia(){ var img=lx.createImageData(W,H);var d=img.data;var cx=-0.7+Math.sin(jT)*.3,cy=0.27+Math.cos(jT*.7)*.2,sx=3/W,sy=3/H;for(var py=0;py<H;py+=2)for(var px=0;px<W;px+=2){var zx=px*sx-1.5,zy=py*sy-1.5,it=0,mi=28;while(zx*zx+zy*zy<4&&it<mi){var tmp=zx*zx-zy*zy+cx;zy=2*zx*zy+cy;zx=tmp;it++;}var t=it/mi,idx=(py*W+px)*4;d[idx]=Math.round(t*255);d[idx+1]=Math.round(t*t*200);d[idx+2]=Math.round((1-t)*255);d[idx+3]=255;if(px+1<W){d[idx+4]=d[idx];d[idx+5]=d[idx+1];d[idx+6]=d[idx+2];d[idx+7]=255;}if(py+1<H){var i2=((py+1)*W+px)*4;d[i2]=d[idx];d[i2+1]=d[idx+1];d[i2+2]=d[idx+2];d[i2+3]=255;}}lx.putImageData(img,0,0);jT+=.03; }

  var sP=[];
  function drawStor(){ lx.fillStyle='rgba(0,0,0,.12)';lx.fillRect(0,0,W,H);while(sP.length<60)sP.push({x:0,y:Math.random()*H,vx:4+Math.random()*8,vy:(Math.random()-.5)*2,life:1,sz:2+Math.random()*3,col:'hsl('+(270+Math.random()*60)+',80%,65%)'});for(var i=sP.length-1;i>=0;i--){var p=sP[i];p.x+=p.vx;p.y+=p.vy;p.life-=.015;if(p.x>W||p.life<=0){sP.splice(i,1);continue;}lx.beginPath();lx.arc(p.x,p.y,p.sz,0,Math.PI*2);lx.fillStyle=p.col;lx.globalAlpha=p.life;lx.fill();}lx.globalAlpha=1; }

  var RENDERS=[drawMat,drawWave,drawGPU,drawMem,drawJulia,drawStor];

  var TESTS=[
    {name:'CPU Single-Core',dur:10,run:function(cb){var ops=0,fr=0,iv=setInterval(function(){var o=cpuWork();ops+=o;fr++;var m=+(o/1e6).toFixed(2);card('bm-c1','bm-c1b','bm-c1s',m,' M/s',20,'#00ffcc',sparks.c1);prog(fr/50);},200);setTimeout(function(){clearInterval(iv);res.cpu1=+(ops/Math.max(fr,1)/1e6).toFixed(2);cb();},10000);return function(){clearInterval(iv);};}},
    {name:'CPU Multi-Core', dur:10,run:function(cb){var fr=0,tot=0,iv=setInterval(function(){var o=cpuWork()*4;tot+=o;fr++;card('bm-cm','bm-cmb','bm-cms',+(o/1e6).toFixed(2),' M/s',80,'#69ff47',sparks.cm);prog(fr/50);},200);setTimeout(function(){clearInterval(iv);res.cpuM=+(tot/Math.max(fr,1)/1e6).toFixed(2);cb();},10000);return function(){clearInterval(iv);};}},
    {name:'GPU Rendering',   dur:10,run:function(cb){
      var active=true,fpsVal=0,framesSinceReport=0,lastReport=performance.now();
      var iv=setInterval(function(){
        var now=performance.now(),dt=now-lastReport;
        fpsVal=dt>0?Math.round(framesSinceReport/(dt/1000)):fpsVal;
        framesSinceReport=0;lastReport=now;
        card('bm-gp','bm-gpb','bm-gps',fpsVal,' FPS',120,'#ff4af8',sparks.gp);
      },500);
      function rafLoop(){if(!active)return;framesSinceReport++;requestAnimationFrame(rafLoop);}
      requestAnimationFrame(rafLoop);
      setTimeout(function(){active=false;clearInterval(iv);res.gpu=fpsVal;cb();},10000);
      return function(){active=false;clearInterval(iv);};
    }},
    {name:'Memory Bandwidth',dur:10,run:function(cb){var fr=0,iv=setInterval(function(){var sz=1024*256,buf=new Float32Array(sz),s=performance.now();for(var i=0;i<sz;i++)buf[i]=Math.sin(i*.001);var mbps=Math.round(sz*4/Math.max(performance.now()-s,0.05)*1000/1e6);fr++;card('bm-mm','bm-mmb','bm-mms',mbps,' MB/s',3000,'#4dd0e1',sparks.mm);prog(fr/50);},200);setTimeout(function(){clearInterval(iv);res.mem=sparks.mm.length?Math.round(sparks.mm.reduce(function(a,b){return a+b;},0)/sparks.mm.length):0;cb();},10000);return function(){clearInterval(iv);};}},
    {name:'Math / FPU',      dur:10,run:function(cb){var fr=0,iv=setInterval(function(){var ops=0,s=performance.now();while(performance.now()-s<14)for(var i=0;i<500;i++)ops+=Math.sqrt(Math.abs(Math.sin(i*1.234)*Math.cos(i*.567)));var m=+(ops/1e6).toFixed(1);fr++;card('bm-fp','bm-fpb','bm-fps',m,' Gop',50,'#ffd740',sparks.fp);prog(fr/50);},200);setTimeout(function(){clearInterval(iv);res.fp=sparks.fp.length?+(sparks.fp.reduce(function(a,b){return a+b;},0)/sparks.fp.length).toFixed(1):0;cb();},10000);return function(){clearInterval(iv);};}},
    {name:'Storage I/O',     dur:10,run:function(cb){var fr=0,iv=setInterval(function(){var s=performance.now();try{var k='__bm__',dt='x'.repeat(50000);sessionStorage.setItem(k,dt);sessionStorage.getItem(k);sessionStorage.removeItem(k);}catch(e){}var iops=Math.round(1000/Math.max(performance.now()-s,.1));fr++;card('bm-st2','bm-stb','bm-sts',iops,' ops/s',5000,'#ce93d8',sparks.st);prog(fr/50);},200);setTimeout(function(){clearInterval(iv);res.stor=sparks.st.length?Math.round(sparks.st.reduce(function(a,b){return a+b;},0)/sparks.st.length):0;cb();},10000);return function(){clearInterval(iv);};}},
  ];

  var stopCur=null;
  function runAll(){var idx=0;function next(){if(!running||idx>=TESTS.length){finalize();return;}var t=TESTS[idx];badge(t.name);phase(t.name,'Test '+(idx+1)+' of '+TESTS.length);prog(0);stopCur=t.run(function(){idx++;curTest=idx;next();});}next();}
  function startLive(){var loop=function(ts){if(!running)return;RENDERS[Math.min(curTest,RENDERS.length-1)](ts);lRaf=requestAnimationFrame(loop);};lRaf=requestAnimationFrame(loop);}

  var TOTAL=TESTS.reduce(function(a,b){return a+b.dur;},0);
  function startTimer(){elapsed=0;oTimer=setInterval(function(){elapsed++;var rem=TOTAL-elapsed;var te=document.getElementById('bm-time');if(te)te.textContent=rem>0?rem+'s':'-';setRing(Math.max(0,rem/TOTAL));},1000);}

  var GRADES=[[80000,'S TIER','#00ffcc','Flagship'],[50000,'A TIER','#69ff47','High-end'],[30000,'B TIER','#ffeb3b','Mid-range'],[15000,'C TIER','#ff9800','Everyday'],[0,'D TIER','#ff6d6d','Entry-level']];

  function finalize(){
    running=false;clearInterval(oTimer);cancelAnimationFrame(lRaf);
    badge('Complete');prog(100);setRing(0);ring.style.stroke='var(--dim)';
    var te=document.getElementById('bm-time');if(te)te.textContent='Done';
    phase('Complete','All 6 tests finished');
    var sc=Math.round(res.cpu1*1200+res.cpuM*2200+res.gpu*180+res.mem*4+res.fp*600+res.stor*2);
    var gr=GRADES.find(function(g){return sc>=g[0];})||GRADES[GRADES.length-1];
    var sb=document.getElementById('bm-score');if(sb)sb.style.display='';
    var sn=document.getElementById('bm-sn');if(sn){sn.textContent=sc.toLocaleString();sn.style.color=gr[2];}
    var sg=document.getElementById('bm-sg');if(sg){sg.textContent=gr[1]+' - '+gr[3];sg.style.color=gr[2];}
    var stg=document.getElementById('bm-stg');
    if(stg)stg.innerHTML=[['CPU1',res.cpu1+' M/s'],['CPUx',res.cpuM+' M/s'],['GPU',res.gpu+' FPS'],['Mem',res.mem+' MB/s'],['FPU',res.fp+' Gop'],['Stor',res.stor+' ops']].map(function(x){return'<div class="bm-score-test">'+x[0]+'<span>'+x[1]+'</span></div>';}).join('');
    var go=document.getElementById('bm-go');if(go){go.style.display='';go.textContent='Run Again';}
    var st=document.getElementById('bm-stop');if(st)st.style.display='none';
  }

  function startBM(){
    running=true;curTest=0;elapsed=0;sP=[];
    Object.keys(res).forEach(function(k){res[k]=0;});
    Object.keys(sparks).forEach(function(k){sparks[k].length=0;});
    initMat();
    var go=document.getElementById('bm-go');if(go)go.style.display='none';
    var st=document.getElementById('bm-stop');if(st)st.style.display='';
    var sb=document.getElementById('bm-score');if(sb)sb.style.display='none';
    startLive();startTimer();runAll();
  }

  function stopBM(){
    running=false;clearInterval(oTimer);cancelAnimationFrame(lRaf);
    if(stopCur)stopCur();
    badge('Stopped');setRing(0);
    var go=document.getElementById('bm-go');if(go){go.style.display='';go.textContent='Run Benchmark';}
    var st=document.getElementById('bm-stop');if(st)st.style.display='none';
    phase('Ready','6 tests ~ 60 seconds');
  }

  document.getElementById('bm-go').onclick = startBM;
  document.getElementById('bm-stop').onclick = stopBM;

  // Draw idle splash screen
  lx.fillStyle='#050508';lx.fillRect(0,0,W,H);
  lx.strokeStyle='rgba(0,255,204,.06)';lx.lineWidth=1;
  for(var gx=0;gx<W;gx+=40){lx.beginPath();lx.moveTo(gx,0);lx.lineTo(gx,H);lx.stroke();}
  for(var gy=0;gy<H;gy+=40){lx.beginPath();lx.moveTo(0,gy);lx.lineTo(W,gy);lx.stroke();}
  var grd=lx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.4);
  grd.addColorStop(0,'rgba(0,255,204,.12)');grd.addColorStop(1,'transparent');
  lx.fillStyle=grd;lx.fillRect(0,0,W,H);
  lx.textAlign='center';lx.textBaseline='middle';
  lx.shadowColor='#00ffcc';lx.shadowBlur=20;
  lx.fillStyle='rgba(0,255,204,.55)';lx.font='bold '+Math.round(H*.15)+'px Orbitron,sans-serif';
  lx.fillText('iPOCKET',W/2,H/2-H*.1);
  lx.shadowBlur=10;
  lx.fillStyle='rgba(0,255,204,.35)';lx.font=Math.round(H*.065)+'px Share Tech Mono,monospace';
  lx.fillText('BENCHMARK v4.5',W/2,H/2+H*.08);
  lx.shadowBlur=0;

  return function(){ running=false;clearInterval(oTimer);cancelAnimationFrame(lRaf);gpuCv.remove(); };
}
