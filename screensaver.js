/* ════════════ SCREENSAVER (WebGL metaballs + ripples) ════════════ */
function initScreensaver() {
  const cv = document.createElement('canvas');
  cv.id = 'ss-cv';
  content.appendChild(cv);

  const gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
  if (!gl) { content.innerHTML = '<div class="ld">WebGL not supported</div>'; return () => {}; }

  const vs = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}`;
  const fs = `precision highp float;
    uniform vec2 u_res;uniform float u_time;
    uniform vec2 u_blobs[10];uniform float u_radii[10];
    const int N=10;
    uniform vec3 u_ripples[6];uniform int u_rippleCount;uniform float u_rippleDur;
    vec3 h2r(vec3 c){vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);}
    void main(){
      vec2 p=gl_FragCoord.xy;float f=0.0,ha=0.0;
      for(int i=0;i<N;i++){vec2 d=p-u_blobs[i];float d2=dot(d,d)+1.0,r=u_radii[i],c=(r*r)/d2;f+=c;ha+=c*(float(i)/float(N));}
      float rf=0.0;
      for(int i=0;i<6;i++){if(i>=u_rippleCount)break;float age=u_time-u_ripples[i].z,life=age/u_rippleDur;if(life<0.0||life>1.0)continue;float radius=age*550.0,rW=70.0,dist=length(p-u_ripples[i].xy),wave=exp(-pow((dist-radius)/rW,2.0));rf+=wave*(1.0-life)*0.65;}
      float tf=f+rf,hue=mod(ha/max(f,0.001)+u_time*0.08,1.0);
      if(tf>1.0){float sat=0.85,bri=0.55+0.45*smoothstep(1.0,2.5,tf),rim=1.0-smoothstep(1.0,1.6,tf);bri=mix(bri,1.0,rim*0.6);sat=mix(sat,0.5,rim*0.4);vec3 col=h2r(vec3(hue,sat,bri));col+=vec3(rim*rim*0.35);col+=h2r(vec3(mod(hue+0.15,1.0),0.6,1.0))*rf*0.45;gl_FragColor=vec4(col,1.0);}
      else{float a=pow(max(tf,0.0),0.5)*0.85;vec3 g=h2r(vec3(hue,0.9,1.0))*a;float b=pow(max(tf,0.0),0.25)*0.3;g+=h2r(vec3(mod(hue+0.05,1.0),0.7,1.0))*b;g+=h2r(vec3(mod(hue+0.1,1.0),0.85,1.0))*rf*0.75;gl_FragColor=vec4(g,1.0);}
    }`;

  const cmp = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
  const prog = gl.createProgram();
  gl.attachShader(prog, cmp(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, cmp(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uR   = gl.getUniformLocation(prog, 'u_res');
  const uT   = gl.getUniformLocation(prog, 'u_time');
  const uB   = gl.getUniformLocation(prog, 'u_blobs[0]');
  const uRad = gl.getUniformLocation(prog, 'u_radii[0]');
  const uRip = gl.getUniformLocation(prog, 'u_ripples[0]');
  const uRC  = gl.getUniformLocation(prog, 'u_rippleCount');
  const uRD  = gl.getUniformLocation(prog, 'u_rippleDur');

  const RDUR = 2.0; gl.uniform1f(uRD, RDUR);
  const BN = 10; let W = 0, H = 0, raf;

  const blobs = Array.from({ length: BN }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - .5) * .0008, vy: (Math.random() - .5) * .0008,
    base: .14 + Math.random() * .08,
    pulse: Math.random() * Math.PI * 2,
    speed: .7 + Math.random() * .6,
  }));

  const MAX_R = 6, ripples = [], rArr = new Float32Array(MAX_R * 3);
  const addRip = (cx, cy, t) => {
    const rc = cv.getBoundingClientRect();
    const sx = W / rc.width, sy = H / rc.height;
    const rx = (cx - rc.left) * sx, ry = H - (cy - rc.top) * sy;
    if (ripples.length >= MAX_R) { if ((t - ripples[0].t) < RDUR * .8) return; ripples.shift(); }
    ripples.push({ x: rx, y: ry, t });
  };

  cv.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = performance.now() * .001;
    for (const to of e.changedTouches) addRip(to.clientX, to.clientY, t);
  }, { passive: false });
  cv.addEventListener('mousedown', e => addRip(e.clientX, e.clientY, performance.now() * .001));

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    W = cv.width  = Math.round(window.innerWidth  * dpr);
    H = cv.height = Math.round(window.innerHeight * dpr);
    cv.style.width  = window.innerWidth  + 'px';
    cv.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, W, H);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(content);
  setTimeout(resize, 30);

  const pArr = new Float32Array(BN * 2), radArr = new Float32Array(BN);

  const frame = ts => {
    const t = ts * .001;
    blobs.forEach((b, i) => {
      b.x += b.vx * b.speed; b.y += b.vy * b.speed;
      if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
      if (b.x > 1) { b.x = 1; b.vx = -Math.abs(b.vx); }
      if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
      if (b.y > 1) { b.y = 1; b.vy = -Math.abs(b.vy); }
      pArr[i * 2]   = b.x * W;
      pArr[i * 2+1] = b.y * H;
      radArr[i] = (b.base + Math.sin(t * 1.2 + b.pulse) * .03) * Math.min(W, H);
    });
    const cut = t - RDUR;
    while (ripples.length && ripples[0].t < cut) ripples.shift();
    for (let i = 0; i < MAX_R; i++) {
      const r = ripples[i];
      rArr[i*3] = r ? r.x : 0;
      rArr[i*3+1] = r ? r.y : 0;
      rArr[i*3+2] = r ? r.t : -999;
    }
    gl.uniform2f(uR, W, H);
    gl.uniform1f(uT, t);
    gl.uniform2fv(uB, pArr);
    gl.uniform1fv(uRad, radArr);
    gl.uniform3fv(uRip, rArr);
    gl.uniform1i(uRC, ripples.length);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}
