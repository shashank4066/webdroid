import { page } from './page.ts';

// ---------------------------------------------------------------------------
// Music player — five bundled demo tracks with animated canvas visualizer
// ---------------------------------------------------------------------------

const MUSIC = page(
  'Wave Music',
  `
body{background:#0a0c10;color:#e8edf5;display:flex;flex-direction:column;overflow:hidden}
.hdr{display:flex;align-items:center;padding:14px 16px 8px;gap:10px}
.hdr h1{font-size:18px;font-weight:700;flex:1}
.badge{font-size:10px;color:#a07cf8;background:rgba(160,124,248,.12);border:1px solid rgba(160,124,248,.25);padding:3px 9px;border-radius:999px;font-weight:600}
.list{flex:1;overflow-y:auto;padding:4px 12px 76px}
.row{display:flex;align-items:center;gap:12px;padding:10px;border-radius:14px;cursor:pointer;transition:background .15s}
.row:hover{background:rgba(255,255,255,.05)}
.row.active{background:rgba(160,124,248,.14)}
.art{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#db2777);display:grid;place-items:center;font-size:18px;color:#fff;flex-shrink:0}
.meta{flex:1;min-width:0}
.tt{font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ta{font-size:11.5px;color:#8f9ba8;margin-top:2px}
.dur{font-size:11px;color:#6b7886;font-variant-numeric:tabular-nums}
.player{position:absolute;inset-x:0;bottom:0;background:rgba(16,20,28,.95);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.08);padding:10px 14px 14px;display:flex;flex-direction:column;gap:8px;transform:translateY(110%);transition:transform .25s ease-out}
.player.on{transform:translateY(0)}
.track-bar{display:flex;align-items:center;gap:10px}
.seek{flex:1;height:4px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden;position:relative}
.seek-fill{height:100%;width:0;background:#a07cf8;transition:width .2s linear}
.time{font-size:10px;color:#7d8c9b;font-variant-numeric:tabular-nums;width:28px}
.ctrls{display:flex;align-items:center;justify-content:space-between}
.btn{background:none;border:none;color:#e8edf5;padding:8px;border-radius:999px;cursor:pointer;font-size:14px}
.btn.big{width:42px;height:42px;background:#a07cf8;color:#0a0c10;display:grid;place-items:center;font-size:16px;font-weight:bold}
.viz{display:flex;align-items:flex-end;gap:2px;height:24px;padding:0 6px}
.viz i{flex:1;background:#a07cf8;border-radius:2px 2px 0 0;min-height:3px;opacity:.8;transition:height .08s ease}
`,
  `
<div class="hdr"><h1>Wave Music</h1><span class="badge">Offline Demo</span></div>
<div class="list" id="list"></div>
<div class="player" id="pl">
  <div class="track-bar">
    <span class="time" id="t0">0:00</span>
    <div class="seek"><div class="seek-fill" id="sk"></div></div>
    <span class="time" id="t1">0:00</span>
  </div>
  <div class="ctrls">
    <button class="btn" id="bk">◀</button>
    <div style="display:flex;align-items:center;gap:8px">
      <button class="btn" id="prev">⏮</button>
      <button class="btn big" id="pp">▶</button>
      <button class="btn" id="next">⏭</button>
    </div>
    <div class="viz" id="viz"></div>
  </div>
</div>
`,
  `
var TRACKS=[
 {t:'Neon Skyline',a:'Aurora Drive',d:214,g:'linear-gradient(135deg,#7c3aed,#db2777)'},
 {t:'Midnight Protocol',a:'Subnet 8',d:178,g:'linear-gradient(135deg,#2563eb,#06b6d4)'},
 {t:'Solar Flare',a:'Kroma',d:245,g:'linear-gradient(135deg,#f59e0b,#ef4444)'},
 {t:'Emerald Rain',a:'Prism Echo',d:192,g:'linear-gradient(135deg,#10b981,#3b82f6)'},
 {t:'Cosmic Dust',a:'Vektor 9',d:260,g:'linear-gradient(135deg,#ec4899,#8b5cf6)'}
];
function el(id){return document.getElementById(id);}
function fmt(s){var m=Math.floor(s/60),sec=s%60;return m+':'+(sec<10?'0':'')+sec;}
var cur=-1,playing=false,elapsed=0,tick=null,vzt=null;
var list=el('list');
TRACKS.forEach(function(tr,i){
 var row=document.createElement('div');row.className='row';
 row.innerHTML='<div class="art" style="background:'+tr.g+'">♬</div><div class="meta"><div class="tt">'+tr.t+'</div><div class="ta">'+tr.a+'</div></div><span class="dur">'+fmt(tr.d)+'</span>';
 row.addEventListener('click',function(){open(i);});
 list.appendChild(row);
});
var vizEl=el('viz');
for(var i=0;i<18;i++){var b=document.createElement('i');vizEl.appendChild(b);}
function bars(){
 var hs=vizEl.children;
 for(var i=0;i<hs.length;i++){
   hs[i].style.height=(playing?6+Math.random()*18:3+Math.random()*2)+'px';
 }
}
function open(i){
 cur=i;var tr=TRACKS[i];
 elapsed=0;render();el('pl').classList.add('on');play();
}
function render(){
 var tr=TRACKS[cur];
 el('sk').style.width=(elapsed/tr.d*100)+'%';
 el('t0').textContent=fmt(elapsed);
 el('t1').textContent=fmt(tr.d);
}
function play(){
 playing=true;el('pp').textContent='❚❚';
 clearInterval(tick);
 tick=setInterval(function(){
   elapsed+=1;
   if(elapsed>=TRACKS[cur].d){next();return;}
   render();
 },1000);
 clearInterval(vzt);vzt=setInterval(bars,120);
}
function pause(){
 playing=false;el('pp').textContent='▶';
 clearInterval(tick);clearInterval(vzt);bars();
}
function next(){elapsed=0;cur=(cur+1)%TRACKS.length;open(cur);}
function prev(){elapsed=0;cur=(cur-1+TRACKS.length)%TRACKS.length;open(cur);}
el('pp').addEventListener('click',function(){playing?pause():play();});
el('next').addEventListener('click',next);
el('prev').addEventListener('click',prev);
el('bk').addEventListener('click',function(){pause();el('pl').classList.remove('on');});

// Handle OS background pause/resume
window.addEventListener('message',function(e){
 if(!e.data)return;
 if(e.data.type==='wd:pause'){pause();}
});
bars();
`
);

// ---------------------------------------------------------------------------
// WASM Terminal — boots the bundled Linux demo image through v86
// ---------------------------------------------------------------------------

const TERMINAL = page(
  'WASM Terminal',
  `
body{background:#050807;color:#cfe8d6;display:flex;flex-direction:column;overflow:hidden;position:relative}
.hdr{display:flex;align-items:center;gap:10px;padding:12px 14px 8px}
.hdr b{font-size:15.5px;font-weight:600;flex:1}
.badge{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;border:1px solid #234534;color:#5fd894;padding:4px 9px;border-radius:999px;white-space:nowrap}
.dot{width:8px;height:8px;border-radius:999px;background:#5c6b60;transition:background .3s}
.dot.load{background:#f5b83d}.dot.run{background:#3ddc84;box-shadow:0 0 8px rgba(61,220,132,.8)}
.status{font-size:11px;color:#7e967f;padding:0 14px 8px}
#screen{flex:1;margin:0 10px;background:#000;border-radius:12px;overflow:auto;padding:8px;border:1px solid #1c2a20;min-height:0;cursor:text}
#screen div{white-space:pre;font:11px/13px "Courier New",monospace;color:#c9dcc9}
#screen canvas{display:none}
.btns{display:flex;gap:8px;padding:10px 14px 4px}
.tb{flex:1;height:40px;border-radius:12px;background:#122418;border:1px solid #234534;color:#5fd894;font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center;cursor:pointer}
.tb:disabled{opacity:.4;cursor:not-allowed}
.tb.off{background:#241414;border-color:#452323;color:#e08c7f}
.tb.sec{background:#161d19;border-color:#2a3a30;color:#9db1a5}
.foot{font-size:10.5px;color:#58705a;text-align:center;padding:8px 16px 12px;line-height:1.5}
#mobile-input{position:fixed;top:-200px;left:-200px;opacity:0;pointer-events:none}
`,
  `<div class="hdr"><span class="dot" id="dot"></span><b>WASM Terminal</b><span class="badge">v86 · WebAssembly x86</span></div>
<div class="status" id="status">Idle — press Boot to power on a 64 MB x86 virtual machine.</div>
<div id="screen" tabindex="0"><div></div><canvas></canvas></div>
<input type="text" id="mobile-input" autocomplete="off" autocapitalize="off" spellcheck="false" />
<div class="btns">
  <button class="tb" id="boot">Boot Linux</button>
  <button class="tb sec" id="kb-btn">Keyboard</button>
  <button class="tb off" id="stop" disabled>Power off</button>
</div>
<div class="foot">Boots a 5.7 MB Buildroot Linux demo image in a 64 MB x86 guest.<br>Runs completely offline in WebAssembly.</div>`,
  `
var machine=null,busy=false;
var dot=document.getElementById('dot'),statusEl=document.getElementById('status');
var bootB=document.getElementById('boot'),stopB=document.getElementById('stop'),kbB=document.getElementById('kb-btn');
var mobileInp=document.getElementById('mobile-input'),screenEl=document.getElementById('screen');

function set(s,cls){statusEl.textContent=s;dot.className='dot'+(cls?' '+cls:'');}

function loadScript(src){
 return new Promise(function(res,rej){
  var s=document.createElement('script');s.src=src;s.onload=res;
  s.onerror=function(){rej(new Error('Failed to load WebAssembly engine (check cache)'));};
  document.head.appendChild(s);
 });
}

async function boot(){
 if(busy||machine)return;
 busy=true;
 bootB.disabled=true;
 try{
  set('Loading WebAssembly engine…','load');
  if(!window.V86)await loadScript('/v86/libv86.js');

  set('Fetching demo Linux image (5.7 MB)…','load');
  var resp=await fetch('/v86/images/demo-linux.iso');
  if(!resp.ok)throw new Error('Image fetch failed with status '+resp.status);
  var buf=await resp.arrayBuffer();

  set('Starting x86 BIOS & hardware…','load');
  screenEl.innerHTML='<div></div><canvas></canvas>';

  machine=new window.V86({
   wasm_path:'/v86/v86.wasm',
   memory_size:64*1024*1024,
   screen_container:screenEl,
   bios:{url:'/v86/seabios.bin'},
   vga_bios:{url:'/v86/vgabios.bin'},
   cdrom:{buffer:buf},
   autostart:true
  });

  machine.add_listener('emulator-ready',function(){
   set('Running — Linux booted. System ready.','run');
  });

  machine.add_listener('emulator-stopped',function(){
   set('Emulator paused.','load');
  });

  set('Running — BIOS starting, Linux loading…','run');
 }catch(e){
  set('Error: '+(e&&e.message?e.message:e),'');
  machine=null;
 }
 busy=false;
 bootB.disabled=!!machine;
 stopB.disabled=!machine;
}

function off(){
 if(machine){
  try{machine.destroy();}catch(e){}
  machine=null;
 }
 set('Powered off.','');
 bootB.disabled=false;
 stopB.disabled=true;
 screenEl.innerHTML='<div></div><canvas></canvas>';
}

// Touch keyboard focus forwarder
function focusKeyboard(){
 if(mobileInp){
  mobileInp.focus();
 }
}

screenEl.addEventListener('click',focusKeyboard);
kbB.addEventListener('click',focusKeyboard);

mobileInp.addEventListener('input',function(e){
 if(!machine)return;
 var val=mobileInp.value;
 if(val){
  if(machine.keyboard_send_text){
   machine.keyboard_send_text(val);
  }
  mobileInp.value='';
 }
});

mobileInp.addEventListener('keydown',function(e){
 if(!machine)return;
 if(e.key==='Enter'&&machine.keyboard_send_keys){
  machine.keyboard_send_keys([0x1c]);
 }else if(e.key==='Backspace'&&machine.keyboard_send_keys){
  machine.keyboard_send_keys([0x0e]);
 }
});

// OS Lifecycle pause/resume handler
window.addEventListener('message',function(e){
 if(!machine||!e.data)return;
 if(e.data.type==='wd:pause'){
  try{machine.stop();}catch(err){}
  set('Paused in background','load');
 }else if(e.data.type==='wd:resume'){
  try{machine.run();}catch(err){}
  set('Running — resumed','run');
 }
});

bootB.addEventListener('click',boot);
stopB.addEventListener('click',off);
`
);

export const EXTRA_APPS = [
  {
    id: 'music',
    name: 'Wave Music',
    pkg: 'app.webdroid.music',
    developer: 'Resonant Labs',
    category: 'Apps' as const,
    rating: 4.4,
    reviews: '9.3K',
    downloads: '2M+',
    sizeMB: 9.6,
    version: '3.0.1',
    tagline: 'Fluid player for your offline music library',
    description:
      'A beautiful demo player with five bundled demo tracks, animated visualizer and seamless queue navigation. Supports background audio pause and resume.',
    whatsNew: 'Visualizer reacts to play state; new gradient artwork per track.',
    html: MUSIC,
  },
  {
    id: 'terminal',
    name: 'WASM Terminal',
    pkg: 'os.webdroid.terminal',
    developer: 'WebDroid Labs',
    category: 'Apps' as const,
    rating: 4.9,
    reviews: '6.7K',
    downloads: '90K+',
    sizeMB: 18.2,
    version: '1.2.0',
    tagline: '64 MB x86 virtual machine in WebAssembly',
    description:
      'Boot the bundled Buildroot Linux demo image on a 64 MB x86 machine emulated in WebAssembly via v86. Features background pause/resume and mobile keyboard support.',
    whatsNew: 'Mobile keyboard forwarder; lifecycle pause/resume; emulator-ready events.',
    html: TERMINAL,
  },
];
