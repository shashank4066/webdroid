import { page } from './page';

/**
 * Media + system-adjacent apps: Wave Music (silent demo player) and
 * WASM Terminal — a real x86 machine (Linux demo image) booted through
 * the v86 WebAssembly engine bundled with WebDroid.
 */

// ---------------------------------------------------------------------------
// Wave Music (demo player)
// ---------------------------------------------------------------------------

const MUSIC = page(
  'Wave Music',
  `
body{background:#120e1a;color:#efeaf6;display:flex;flex-direction:column;overflow:hidden}
.top{display:flex;align-items:center;gap:8px;padding:14px 16px 6px}
.top b{font-size:18px;font-weight:600;flex:1}
.chip{font-size:10px;color:#a48fd0;border:1px solid #3a2f56;padding:5px 10px;border-radius:999px}
.list{flex:1;overflow-y:auto;padding:8px 14px}
.tr{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:14px}
.tr:active,.tr:hover{background:#1c162b}
.tr .n{width:20px;text-align:center;color:#8f7fb8;font-size:12px}
.art{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.meta{flex:1;min-width:0}
.meta b{display:block;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.meta span{font-size:11.5px;color:#a08fc4}
.dur{font-size:11.5px;color:#8f7fb8;font-variant-numeric:tabular-nums}
.pl{position:absolute;inset:0;background:#120e1a;display:none;flex-direction:column;padding:14px 20px 18px}
.pl.on{display:flex}
.pl .bar{display:flex;align-items:center}
.pl .bar b{flex:1;text-align:center;font-size:15px;font-weight:600}
.back{width:36px;height:36px;border-radius:999px;background:#1c162b;display:flex;align-items:center;justify-content:center}
.bigart{margin:26px auto 0;width:210px;height:210px;border-radius:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 18px 50px -18px rgba(0,0,0,.8)}
.viz{display:flex;align-items:flex-end;justify-content:center;gap:3px;height:36px;margin-top:22px}
.viz i{width:4px;border-radius:999px;background:#8f6fd0;height:8px;transition:height .12s}
.seek{margin-top:16px;height:4px;border-radius:999px;background:#2a2140;overflow:hidden}
.seek i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#8f6fd0,#3ddc84)}
.times{display:flex;justify-content:space-between;font-size:11px;color:#8f7fb8;margin-top:6px;font-variant-numeric:tabular-nums}
.ctrls{display:flex;align-items:center;justify-content:center;gap:26px;margin-top:20px}
.cbtn{width:52px;height:52px;border-radius:999px;background:#1c162b;display:flex;align-items:center;justify-content:center;color:#cbb8ef;font-size:18px}
.cbtn.main{width:64px;height:64px;background:#3ddc84;color:#062a19;font-size:22px;font-weight:700}
`,
  `<div class="top"><b>Wave Music</b><span class="chip">Silent demo</span></div>
<div class="list" id="list"></div>
<div class="pl" id="pl">
<div class="bar"><button class="back" id="bk">←</button><b>Now playing</b><span style="width:36px"></span></div>
<div class="bigart" id="art"></div>
<div class="viz" id="viz"></div>
<div style="text-align:center;margin-top:18px"><div style="font-size:19px;font-weight:600" id="tt"></div><div style="font-size:12.5px;color:#a08fc4;margin-top:3px" id="ta"></div></div>
<div class="seek"><i id="sk"></i></div>
<div class="times"><span id="t0">0:00</span><span id="t1">0:00</span></div>
<div class="ctrls"><button class="cbtn" id="prev">⏮</button><button class="cbtn main" id="pp">▶</button><button class="cbtn" id="next">⏭</button></div>
</div>`,
  `
var TRACKS=[
 {t:'Neon Skyline',a:'Aurora Drive',d:214,g:'linear-gradient(135deg,#7c3aed,#db2777)'},
 {t:'Green Circuit',a:'WASM Ensemble',d:187,g:'linear-gradient(135deg,#059669,#3ddc84)'},
 {t:'Terminal Dusk',a:'Bootloader',d:243,g:'linear-gradient(135deg,#f59e0b,#ef4444)'},
 {t:'Pixel Drift',a:'Sprite Club',d:198,g:'linear-gradient(135deg,#0ea5e9,#8b5cf6)'},
 {t:'Silicon Dreams',a:'Aurora Drive',d:226,g:'linear-gradient(135deg,#e11d48,#f59e0b)'}];
function el(id){return document.getElementById(id);}
function fmt(s){var m=Math.floor(s/60);s=Math.floor(s%60);return m+':'+(s<10?'0':'')+s;}
var cur=0,playing=false,elapsed=0,tick=null,vzt=null;
var list=el('list');
TRACKS.forEach(function(tr,i){
 var row=document.createElement('div');row.className='tr';
 row.innerHTML='<span class="n">'+(i+1)+'</span><div class="art" style="background:'+tr.g+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="rgba(255,255,255,.85)"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg></div><div class="meta"><b>'+tr.t+'</b><span>'+tr.a+'</span></div><span class="dur">'+fmt(tr.d)+'</span>';
 row.addEventListener('click',function(){open(i);});
 list.appendChild(row);});
var vizEl=el('viz');
for(var i=0;i<22;i++){var b=document.createElement('i');vizEl.appendChild(b);}
function bars(){var hs=vizEl.children;
 for(var i=0;i<hs.length;i++){hs[i].style.height=(playing?6+Math.random()*30:4+Math.random()*3)+'px';}}
function open(i){cur=i;var tr=TRACKS[i];
 el('art').style.background=tr.g;
 el('tt').textContent=tr.t;el('ta').textContent=tr.a+'  ·  Demo track';
 el('t1').textContent=fmt(tr.d);
 elapsed=0;render();el('pl').classList.add('on');play();}
function render(){var tr=TRACKS[cur];
 el('sk').style.width=(elapsed/tr.d*100)+'%';
 el('t0').textContent=fmt(elapsed);}
function play(){playing=true;el('pp').textContent='❚❚';
 clearInterval(tick);
 tick=setInterval(function(){elapsed+=1;
  if(elapsed>=TRACKS[cur].d){next();return;}
  render();},1000);
 clearInterval(vzt);vzt=setInterval(bars,120);}
function pause(){playing=false;el('pp').textContent='▶';
 clearInterval(tick);clearInterval(vzt);bars();}
function next(){elapsed=0;cur=(cur+1)%TRACKS.length;open(cur);}
function prev(){elapsed=0;cur=(cur-1+TRACKS.length)%TRACKS.length;open(cur);}
el('pp').addEventListener('click',function(){playing?pause():play();});
el('next').addEventListener('click',next);
el('prev').addEventListener('click',prev);
el('bk').addEventListener('click',function(){pause();el('pl').classList.remove('on');});
bars();
`
);

// ---------------------------------------------------------------------------
// WASM Terminal — boots the bundled Linux demo image through v86
// ---------------------------------------------------------------------------

const TERMINAL = page(
  'WASM Terminal',
  `
body{background:#050807;color:#cfe8d6;display:flex;flex-direction:column;overflow:hidden}
.hdr{display:flex;align-items:center;gap:10px;padding:12px 14px 8px}
.hdr b{font-size:15.5px;font-weight:600;flex:1}
.badge{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;border:1px solid #234534;color:#5fd894;padding:4px 9px;border-radius:999px;white-space:nowrap}
.dot{width:8px;height:8px;border-radius:999px;background:#5c6b60;transition:background .3s}
.dot.load{background:#f5b83d}.dot.run{background:#3ddc84;box-shadow:0 0 8px rgba(61,220,132,.8)}
.status{font-size:11px;color:#7e967f;padding:0 14px 8px}
#screen{flex:1;margin:0 10px;background:#000;border-radius:12px;overflow:auto;padding:8px;border:1px solid #1c2a20;min-height:0}
#screen div{white-space:pre;font:11px/13px "Courier New",monospace;color:#c9dcc9}
#screen canvas{display:none}
.btns{display:flex;gap:8px;padding:10px 14px 4px}
.tb{flex:1;height:40px;border-radius:12px;background:#122418;border:1px solid #234534;color:#5fd894;font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center}
.tb:disabled{opacity:.4}
.tb.off{background:#241414;border-color:#452323;color:#e08c7f}
.foot{font-size:10.5px;color:#58705a;text-align:center;padding:8px 16px 12px;line-height:1.5}
`,
  `<div class="hdr"><span class="dot" id="dot"></span><b>WASM Terminal</b><span class="badge">v86 · WebAssembly x86</span></div>
<div class="status" id="status">Idle — press Boot to power on a real emulated x86 machine.</div>
<div id="screen"><div></div><canvas></canvas></div>
<div class="btns"><button class="tb" id="boot">Boot demo Linux</button><button class="tb off" id="stop" disabled>Power off</button></div>
<div class="foot">Boots the bundled Buildroot demo image (5.7 MB) on a 64 MB x86 machine<br>emulated entirely in WebAssembly. Tap the screen, then type.</div>`,
  `
var machine=null,busy=false;
var dot=document.getElementById('dot'),statusEl=document.getElementById('status');
var bootB=document.getElementById('boot'),stopB=document.getElementById('stop');
function set(s,cls){statusEl.textContent=s;dot.className='dot'+(cls?' '+cls:'');}
function loadScript(src){return new Promise(function(res,rej){
 var s=document.createElement('script');s.src=src;s.onload=res;
 s.onerror=function(){rej(new Error('Failed to load engine (check offline cache)'));};
 document.head.appendChild(s);});}
async function boot(){ if(busy||machine)return; busy=true;
 bootB.disabled=true;
 try{
  set('Loading WebAssembly engine…','load');
  if(!window.V86)await loadScript('/v86/libv86.js');
  set('Fetching demo image (5.7 MB)…','load');
  var buf=await (await fetch('/v86/images/demo-linux.iso')).arrayBuffer();
  set('Booting x86 machine…','load');
  var sc=document.getElementById('screen');
  sc.innerHTML='<div></div><canvas></canvas>';
  machine=new window.V86({
   wasm_path:'/v86/v86.wasm',
   memory_size:64*1024*1024,
   screen_container:sc,
   bios:{url:'/v86/seabios.bin'},
   vga_bios:{url:'/v86/vgabios.bin'},
   cdrom:{buffer:buf},
   autostart:true});
  set('Running — BIOS starting, Linux will arrive shortly','run');
 }catch(e){ set('Error: '+(e&&e.message?e.message:e),''); machine=null; }
 busy=false;
 bootB.disabled=!!machine; stopB.disabled=!machine;}
function off(){ if(machine){ try{machine.destroy();}catch(e){} machine=null; }
 set('Powered off.',''); bootB.disabled=false; stopB.disabled=true;
 document.getElementById('screen').innerHTML='<div></div><canvas></canvas>';}
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
    tagline: 'A fluid player for your offline library',
    description:
      'A beautiful demo player with five bundled demo tracks, animated visualizer and seamless queue navigation. Runs silently by design — a showcase of the UI.',
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
    tagline: 'A real x86 PC, emulated in WebAssembly',
    description:
      'Boot the bundled Linux demo image on a fully emulated 64 MB x86 machine. The CPU executes through a WebAssembly JIT (v86) right inside your browser — no server, no cloud, works offline.',
    whatsNew: 'Engine updated to v86 0.5.x; faster boot; power-off resets the display.',
    html: TERMINAL,
  },
];
