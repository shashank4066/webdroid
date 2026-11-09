import { page } from './page';

/**
 * Productivity apps bundled with the local Play Store.
 * Each package is a complete standalone HTML document.
 */

// ---------------------------------------------------------------------------
// Calculator
// ---------------------------------------------------------------------------

const CALC = page(
  'Calculator',
  `
:root{--bg:#0b1210;--pad:#121a16;--btn:#1b2620;--btn2:#25342b;--acc:#3ddc84;--mut:#9fbfae}
body{background:var(--bg);color:#eaf6ee;display:flex;flex-direction:column;overflow:hidden}
.disp{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-end;padding:18px 22px 12px;gap:8px;min-height:0}
.expr{font-size:15px;color:var(--mut);min-height:20px;font-variant-numeric:tabular-nums;text-align:right;word-break:break-all}
.out{font-size:46px;font-weight:300;font-variant-numeric:tabular-nums;text-align:right;word-break:break-all;line-height:1.1}
.pad{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:12px;background:var(--pad);border-radius:20px 20px 0 0}
.k{border-radius:15px;height:54px;font-size:19px;background:var(--btn);transition:filter .12s,transform .05s}
.k:active{transform:scale(.95);filter:brightness(1.35)}
.op{background:var(--btn2);color:var(--acc)}
.fn{background:#18211c;color:var(--mut)}
.eq{background:var(--acc);color:#06281a;font-weight:700}
`,
  '<div class="disp"><div class="expr" id="expr"></div><div class="out" id="out">0</div></div><div class="pad" id="pad"></div>',
  `
var cur='0',prev=null,op=null,fresh=true,err=false;
var exprEl=document.getElementById('expr'),outEl=document.getElementById('out');
var pad=document.getElementById('pad');
var KEYS=['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='];
function fmt(n){ if(!isFinite(n)){err=true;return 'Error';}
 var s=Math.abs(n)>=1e12?n.toExponential(6):String(parseFloat(n.toPrecision(12)));
 if(s.length>14)s=String(parseFloat(n.toPrecision(10)));return s;}
function render(){ outEl.textContent=err?'Error':cur;
 exprEl.textContent=(prev!==null&&op)?fmt(prev)+' '+op:'';}
function calc(a,b,o){ if(o==='+')return a+b; if(o==='−')return a-b; if(o==='×')return a*b; return b===0?NaN:a/b;}
function digit(d){ if(err){err=false;cur='0';}
 if(fresh){cur=d;fresh=false;}
 else if(cur.replace('-','').replace('.','').length<12){cur=(cur==='0')?d:cur+d;}
 render();}
function dot(){ if(err){err=false;cur='0';}
 if(fresh){cur='0.';fresh=false;}
 else if(cur.indexOf('.')<0)cur+='.';
 render();}
function setOp(o){ if(err)return;
 if(op!==null&&prev!==null&&!fresh){prev=calc(parseFloat(prev),parseFloat(cur),op);cur=fmt(prev);}
 else if(prev===null)prev=parseFloat(cur);
 if(err)return; op=o;fresh=true;render();}
function equals(){ if(err)return;
 if(op!==null&&prev!==null){var r=calc(parseFloat(prev),parseFloat(cur),op);
  if(!isFinite(r)){err=true;}else{cur=fmt(r);prev=null;op=null;fresh=true;}}
 render();}
function pc(){ if(err)return;cur=fmt(parseFloat(cur)/100);fresh=false;render();}
function neg(){ if(err||cur==='0')return;
 cur=(cur.charAt(0)==='-')?cur.slice(1):'-'+cur;render();}
function back(){ if(fresh||err){cur='0';fresh=true;err=false;render();return;}
 cur=cur.slice(0,-1); if(cur===''||cur==='-'){cur='0';fresh=true;} render();}
function clear(){ cur='0';prev=null;op=null;fresh=true;err=false;render();}
KEYS.forEach(function(k){
 var b=document.createElement('button');
 b.className='k'+('÷×−+'.indexOf(k)>=0?' op':(k==='='?' eq':(k==='C'||k==='±'||k==='%'||k==='⌫'?' fn':'')));
 b.textContent=k; pad.appendChild(b);
 b.addEventListener('click',function(){
  if(k>='0'&&k<='9')digit(k);
  else if(k==='.')dot();
  else if(k==='=')equals();
  else if(k==='C')clear();
  else if(k==='±')neg();
  else if(k==='%')pc();
  else if(k==='⌫')back();
  else setOp(k);});
});
document.addEventListener('keydown',function(e){
 var m={'*':'×','x':'×','/':'÷','-':'−','+':'+'};
 if(e.key>='0'&&e.key<='9')digit(e.key);
 else if(e.key==='.')dot();
 else if(e.key==='Enter'||e.key==='=')equals();
 else if(e.key==='Backspace')back();
 else if(e.key==='Escape'||e.key==='Delete')clear();
 else if(e.key==='%')pc();
 else if(m[e.key])setOp(m[e.key]);
});
render();
`
);

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------

const CLOCK = page(
  'Clock',
  `
body{background:#0d1114;color:#ecf2ee;display:flex;flex-direction:column;overflow:hidden}
.tabs{display:flex;gap:8px;padding:14px 16px 6px}
.tab{padding:7px 18px;border-radius:999px;background:#1a2226;color:#9db1a8;font-size:13px;font-weight:500}
.tab.on{background:#3ddc84;color:#062a19;font-weight:600}
.pane{flex:1;display:none;flex-direction:column;padding:8px 18px 18px;min-height:0}
.pane.on{display:flex}
.big{font-size:62px;font-weight:200;letter-spacing:-1px;text-align:center;margin-top:26px;font-variant-numeric:tabular-nums}
.date{text-align:center;color:#9db1a8;font-size:14px;margin-top:6px}
.world{margin-top:26px;background:#151c20;border-radius:16px;overflow:hidden}
.wrow{display:flex;justify-content:space-between;padding:12px 16px;font-size:13px}
.wrow+ .wrow{border-top:1px solid #1e272c}
.wcity{color:#c4d4cc}
.wtime{font-variant-numeric:tabular-nums;color:#3ddc84}
.swdisp{text-align:center;font-size:56px;font-weight:200;margin-top:34px;font-variant-numeric:tabular-nums;font-variant-numeric:tabular-nums}
.swbtns{display:flex;justify-content:center;gap:14px;margin-top:26px}
.swbtn{width:76px;height:44px;border-radius:999px;font-size:14px;font-weight:600;background:#1e282d;color:#e6efe9}
.swbtn.go{background:#3ddc84;color:#062a19}
.swbtn.stop{background:#f2544f;color:#fff}
.swbtn:disabled{opacity:.35}
.laps{flex:1;overflow-y:auto;margin-top:18px;background:#151c20;border-radius:14px}
.lap{display:flex;justify-content:space-between;padding:10px 16px;font-size:13px;font-variant-numeric:tabular-nums}
.lap+.lap{border-top:1px solid #1e272c}
.lap .ln{color:#9db1a8}
`,
  `<div class="tabs"><button class="tab on" id="t0">Clock</button><button class="tab" id="t1">Stopwatch</button></div>
<div class="pane on" id="p0"><div class="big" id="bigT">--:--</div><div class="date" id="bigD"></div>
<div class="world"><div class="wrow"><span class="wcity">Tokyo</span><span class="wtime" id="w0">--:--</span></div><div class="wrow"><span class="wcity">London</span><span class="wtime" id="w1">--:--</span></div><div class="wrow"><span class="wcity">New York</span><span class="wtime" id="w2">--:--</span></div></div></div>
<div class="pane" id="p1"><div class="swdisp" id="swd">00:00.00</div>
<div class="swbtns"><button class="swbtn stop" id="swReset">Reset</button><button class="swbtn go" id="swGo">Start</button><button class="swbtn" id="swLap" disabled>Lap</button></div>
<div class="laps" id="laps"></div></div>`,
  `
function pad(n){return (n<10?'0':'')+n;}
function renderClock(){var now=new Date();
 document.getElementById('bigT').textContent=now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 document.getElementById('bigD').textContent=now.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'});
 var zones=[['w0','Asia/Tokyo'],['w1','Europe/London'],['w2','America/New_York']];
 zones.forEach(function(z){var v='--:--';
  try{v=new Date().toLocaleTimeString([],{timeZone:z[1],hour:'2-digit',minute:'2-digit'});}catch(e){}
  document.getElementById(z[0]).textContent=v;});}
setInterval(renderClock,1000);renderClock();
var tabs=[document.getElementById('t0'),document.getElementById('t1')];
tabs.forEach(function(t,i){t.addEventListener('click',function(){
 tabs.forEach(function(x,j){x.classList.toggle('on',i===j);});
 document.getElementById('p0').classList.toggle('on',i===0);
 document.getElementById('p1').classList.toggle('on',i===1);});});
var running=false,base=0,acc=0,laps=[];
var swd=document.getElementById('swd'),go=document.getElementById('swGo'),lapB=document.getElementById('swLap'),reset=document.getElementById('swReset'),lapsEl=document.getElementById('laps');
function swNow(){return acc+(running?performance.now()-base:0);}
function fmtSw(ms){var m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),c=Math.floor((ms%1000)/10);return pad(m)+':'+pad(s)+'.'+pad(c);}
setInterval(function(){if(running)swd.textContent=fmtSw(swNow());},33);
go.addEventListener('click',function(){
 if(running){acc=swNow();running=false;go.textContent='Start';go.classList.add('go');go.classList.remove('stop');}
 else{base=performance.now();running=true;go.textContent='Stop';go.classList.remove('go');go.classList.add('stop');}
 lapB.disabled=!running;});
reset.addEventListener('click',function(){running=false;acc=0;laps=[];lapsEl.innerHTML='';swd.textContent='00:00.00';go.textContent='Start';go.classList.add('go');go.classList.remove('stop');lapB.disabled=true;});
lapB.addEventListener('click',function(){var total=swNow();var prevL=laps.length?laps[laps.length-1].total:0;
 laps.push({n:laps.length+1,total:total,split:total-prevL});
 var row=document.createElement('div');row.className='lap';
 row.innerHTML='<span class="ln">Lap '+laps.length+'</span><span>'+fmtSw(total)+'  ·  +'+fmtSw(total-prevL)+'</span>';
 lapsEl.insertBefore(row,lapsEl.firstChild);});
`
);

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

const NOTES = page(
  'Notes',
  `
body{background:#101410;color:#e8f2e6;display:flex;flex-direction:column;overflow:hidden}
.hdr{display:flex;align-items:center;gap:10px;padding:16px 18px 10px}
.hdr h1{font-size:19px;font-weight:600;flex:1}
.add{width:40px;height:40px;border-radius:999px;background:#3ddc84;color:#062a19;font-size:26px;line-height:1;font-weight:600;display:flex;align-items:center;justify-content:center}
.list{flex:1;overflow-y:auto;padding:6px 14px 18px;display:flex;flex-direction:column;gap:10px}
.card{background:#171f16;border:1px solid #222d20;border-radius:16px;padding:13px 15px}
.card h3{font-size:14.5px;font-weight:600;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card p{font-size:12.5px;color:#a7bda4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card time{font-size:10.5px;color:#6f8a6c;display:block;margin-top:7px}
.empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#6f8a6c;text-align:center;padding:30px}
.empty b{color:#a7bda4;font-weight:500}
.ed{position:absolute;inset:0;background:#101410;display:none;flex-direction:column}
.ed.on{display:flex}
.ed .bar{display:flex;align-items:center;gap:8px;padding:12px 14px}
.back{width:36px;height:36px;border-radius:999px;background:#1c261b;display:flex;align-items:center;justify-content:center}
.del{margin-left:auto;color:#ff7a70;background:#2a1614;padding:8px 14px;border-radius:999px;font-size:12.5px}
.ed input{background:none;border:0;outline:none;font-size:19px;font-weight:600;padding:8px 18px;color:#e8f2e6}
.ed textarea{flex:1;background:none;border:0;outline:none;resize:none;padding:6px 18px 18px;font-size:14.5px;line-height:1.55;color:#cfe0c8}
.saved{font-size:11px;color:#5d7a5c;padding:0 18px 12px}
`,
  `<div class="hdr"><h1>Notes</h1><button class="add" id="add" aria-label="New note">+</button></div>
<div class="list" id="list"></div>
<div class="ed" id="ed"><div class="bar"><button class="back" id="bk" aria-label="Back">←</button><span class="saved" id="saved"></span><button class="del" id="del">Delete</button></div>
<input id="ti" placeholder="Title" /><textarea id="bo" placeholder="Start writing…"></textarea></div>`,
  `
var KEY='wd.notes.v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[];}catch(e){return [];}}
function save(v){try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
var list=document.getElementById('list'),ed=document.getElementById('ed');
var cur=null,tmr=null;
function when(ts){var d=new Date(ts);return d.toLocaleDateString([],{month:'short',day:'numeric'})+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function render(){var items=load().sort(function(a,b){return b.updated-a.updated;});
 list.innerHTML='';
 if(!items.length){list.innerHTML='<div class="empty"><b>No notes yet</b><span>Tap + to capture a thought.</span></div>';return;}
 items.forEach(function(n){
  var c=document.createElement('div');c.className='card';
  c.innerHTML='<h3>'+esc(n.title||'Untitled')+'</h3><p>'+esc((n.body||'').slice(0,80)||'No additional text')+'</p><time>'+when(n.updated)+'</time>';
  c.addEventListener('click',function(){open(n.id);});
  list.appendChild(c);});}
function open(id){cur=load().find(function(x){return x.id===id;})||null;
 document.getElementById('ti').value=cur?cur.title:'';
 document.getElementById('bo').value=cur?cur.body:'';
 document.getElementById('saved').textContent='';
 ed.classList.add('on');}
function close(){ed.classList.remove('on');cur=null;render();}
function persist(){if(!cur)return;
 cur.title=document.getElementById('ti').value;
 cur.body=document.getElementById('bo').value;
 cur.updated=Date.now();
 var items=load();var i=items.findIndex(function(x){return x.id===cur.id;});
 if(i<0)items.push(cur);else items[i]=cur;
 save(items);
 document.getElementById('saved').textContent='Saved';
 setTimeout(function(){document.getElementById('saved').textContent='';},1200);}
document.getElementById('add').addEventListener('click',function(){
 var n={id:String(Date.now())+'-'+Math.floor(Math.random()*999),title:'',body:'',updated:Date.now()};
 var items=load();items.push(n);save(items);open(n.id);});
document.getElementById('bk').addEventListener('click',function(){persist();close();});
document.getElementById('del').addEventListener('click',function(){
 if(!cur)return;save(load().filter(function(x){return x.id!==cur.id;}));close();});
document.getElementById('ti').addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(persist,400);});
document.getElementById('bo').addEventListener('input',function(){clearTimeout(tmr);tmr=setTimeout(persist,400);});
render();
`
);

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

const WEATHER = page(
  'Weather',
  `
body{overflow:hidden;color:#f4f7f2;transition:background .4s;display:flex;flex-direction:column;background:#0a4d5e}
.citybar{display:flex;gap:8px;padding:14px 16px 4px;overflow-x:auto}
.chip{padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.14);font-size:12.5px;white-space:nowrap}
.chip.on{background:rgba(255,255,255,.92);color:#123328;font-weight:600}
.cur{display:flex;align-items:center;gap:14px;padding:16px 22px 4px}
.cur .ic{width:54px;height:54px}
.cur .ic svg{width:100%;height:100%}
.tnow{font-size:56px;font-weight:200;line-height:1}
.cond{font-size:14px;opacity:.9}
.hilo{font-size:12px;opacity:.75;margin-top:3px}
.sect{background:rgba(10,16,12,.32);backdrop-filter:blur(4px);border-radius:16px;padding:10px 12px}
.sect h4{font-size:10.5px;text-transform:uppercase;letter-spacing:.12em;opacity:.6;margin:2px 2px 8px}
.hr{display:flex;gap:14px;overflow-x:auto;padding-bottom:2px}
.hr .u{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px;min-width:34px;opacity:.95}
.hr .u .ic{width:22px;height:22px}.hr .u .ic svg{width:100%;height:100%}
.days{display:flex;flex-direction:column}
.drow{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px}
.drow .dn{width:44px;opacity:.8}
.drow .ic{width:20px;height:20px}.drow .ic svg{width:100%;height:100%}
.drow .bar{flex:1;height:4px;border-radius:999px;background:rgba(255,255,255,.18);position:relative}
.drow .bar i{position:absolute;top:0;bottom:0;border-radius:999px;background:#ffd76e}
.drow .dt{font-variant-numeric:tabular-nums;width:74px;text-align:right;opacity:.9}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cell{background:rgba(10,16,12,.32);border-radius:14px;padding:10px 14px}
.cell b{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;opacity:.55;font-weight:500}
.cell span{font-size:15px;font-weight:500}
.wrap{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:12px 16px 16px}
`,
  `<div class="citybar" id="cities"></div>
<div class="cur"><div class="ic" id="cIc"></div><div><div class="tnow" id="cT">--</div><div class="cond" id="cC"></div><div class="hilo" id="cH"></div></div></div>
<div class="wrap">
<div class="sect"><h4>Hourly forecast</h4><div class="hr" id="hr"></div></div>
<div class="sect"><h4>5-day forecast</h4><div class="days" id="days"></div></div>
<div class="grid" id="grid"></div>
</div>`,
  `
var ICONS={
 sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" fill="#ffd76e"/><g stroke="#ffd76e" stroke-width="1.7" stroke-linecap="round"><line x1="12" y1="2.6" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21.4"/><line x1="2.6" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21.4" y2="12"/><line x1="5.2" y1="5.2" x2="6.9" y2="6.9"/><line x1="17.1" y1="17.1" x2="18.8" y2="18.8"/><line x1="5.2" y1="18.8" x2="6.9" y2="17.1"/><line x1="17.1" y1="6.9" x2="18.8" y2="5.2"/></g></svg>',
 cloud:'<svg viewBox="0 0 24 24"><path d="M7 18a4.5 4.5 0 1 1 .7-8.95A5.5 5.5 0 0 1 18.4 11 3.75 3.75 0 0 1 17.5 18Z" fill="#d5e5ee"/></svg>',
 pcloud:'<svg viewBox="0 0 24 24"><circle cx="9.5" cy="8" r="3.1" fill="#ffd76e"/><path d="M8.5 19a3.8 3.8 0 1 1 .6-7.56A4.6 4.6 0 0 1 18.2 12.7 3.1 3.1 0 0 1 17.5 19Z" fill="#d5e5ee"/></svg>',
 rain:'<svg viewBox="0 0 24 24"><path d="M7 14a4.5 4.5 0 1 1 .7-8.95A5.5 5.5 0 0 1 18.4 7 3.75 3.75 0 0 1 17.5 14Z" fill="#d5e5ee"/><g stroke="#8fd0ee" stroke-width="1.7" stroke-linecap="round"><line x1="9" y1="17" x2="8" y2="20.5"/><line x1="13" y1="17" x2="12" y2="20.5"/><line x1="17" y1="17" x2="16" y2="20.5"/></g></svg>',
 snow:'<svg viewBox="0 0 24 24"><path d="M7 14a4.5 4.5 0 1 1 .7-8.95A5.5 5.5 0 0 1 18.4 7 3.75 3.75 0 0 1 17.5 14Z" fill="#d5e5ee"/><g fill="#cfe8f5"><circle cx="9" cy="18" r="1.2"/><circle cx="13" cy="19.5" r="1.2"/><circle cx="16.5" cy="18" r="1.2"/></g></svg>'};
var CITIES=[
 {name:'Mountain View',bg:'linear-gradient(168deg,#0a4d5e,#12876e)',t:23,cond:'Partly cloudy',hi:26,lo:15,hum:54,wind:12,uv:3,press:1014,
  hourly:[['Now',23,'pcloud'],['15:00',25,'sun'],['18:00',21,'pcloud'],['21:00',18,'cloud'],['00:00',16,'cloud'],['03:00',15,'cloud'],['06:00',16,'pcloud'],['09:00',19,'sun']],
  daily:[['Mon',26,15,'sun'],['Tue',24,14,'pcloud'],['Wed',22,13,'rain'],['Thu',25,15,'pcloud'],['Fri',27,16,'sun']]},
 {name:'Dubai',bg:'linear-gradient(168deg,#7a4a10,#d99a3d)',t:36,cond:'Sunny',hi:39,lo:27,hum:38,wind:9,uv:9,press:1008,
  hourly:[['Now',36,'sun'],['15:00',39,'sun'],['18:00',35,'sun'],['21:00',31,'cloud'],['00:00',29,'cloud'],['03:00',28,'cloud'],['06:00',28,'pcloud'],['09:00',32,'sun']],
  daily:[['Mon',39,27,'sun'],['Tue',40,28,'sun'],['Wed',38,27,'pcloud'],['Thu',37,26,'pcloud'],['Fri',39,28,'sun']]},
 {name:'Oslo',bg:'linear-gradient(168deg,#25333f,#5b7a99)',t:-3,cond:'Light snow',hi:-1,lo:-8,hum:71,wind:18,uv:0,press:1002,
  hourly:[['Now',-3,'snow'],['15:00',-2,'snow'],['18:00',-4,'snow'],['21:00',-5,'cloud'],['00:00',-6,'cloud'],['03:00',-7,'cloud'],['06:00',-7,'pcloud'],['09:00',-4,'snow']],
  daily:[['Mon',-1,-8,'snow'],['Tue',0,-6,'snow'],['Wed',1,-4,'cloud'],['Thu',-1,-5,'pcloud'],['Fri',2,-3,'pcloud']]}];
var cur=0;
function el(id){return document.getElementById(id);}
function render(){
 var c=CITIES[cur];
 document.body.style.background=c.bg;
 el('cIc').innerHTML=ICONS[c.hourly[0][2]];
 el('cT').textContent=(c.t>0?c.t+'°':c.t+'°');
 el('cC').textContent=c.cond;
 el('cH').textContent='H:'+c.hi+'°  L:'+c.lo+'°  ·  feels like '+(c.t+1)+'°';
 var ch='';
 c.hourly.forEach(function(h){ch+='<div class="u"><span>'+h[0]+'</span><div class="ic">'+ICONS[h[2]]+'</div><span>'+h[1]+'°</span></div>';});
 el('hr').innerHTML=ch;
 var min=99,max=-99;
 c.daily.forEach(function(d){if(d[1]>max)max=d[1];if(d[2]<min)min=d[2];});
 var dh='';
 c.daily.forEach(function(d){
  var l=((d[2]-min)/(max-min))*100, r=((d[1]-min)/(max-min))*100;
  dh+='<div class="drow"><span class="dn">'+d[0]+'</span><div class="ic">'+ICONS[d[3]]+'</div><div class="bar"><i style="left:'+l+'%;width:'+Math.max(8,r-l)+'%"></i></div><span class="dt">'+d[2]+'° / '+d[1]+'°</span></div>';});
 el('days').innerHTML=dh;
 el('grid').innerHTML=
  '<div class="cell"><b>Humidity</b><span>'+c.hum+'%</span></div>'+
  '<div class="cell"><b>Wind</b><span>'+c.wind+' km/h</span></div>'+
  '<div class="cell"><b>UV index</b><span>'+c.uv+' of 11</span></div>'+
  '<div class="cell"><b>Pressure</b><span>'+c.press+' hPa</span></div>';
 var cb='';
 CITIES.forEach(function(x,i){cb+='<button class="chip'+(i===cur?' on':'')+'" data-i="'+i+'">'+x.name+'</button>';});
 el('cities').innerHTML=cb;
 Array.prototype.forEach.call(el('cities').children,function(b){
  b.addEventListener('click',function(){cur=+b.getAttribute('data-i');render();});});
}
render();
`
);

// ---------------------------------------------------------------------------
// Unit Converter
// ---------------------------------------------------------------------------

const CONVERTER = page(
  'Converter',
  `
body{background:#12100c;color:#f4efe4;display:flex;flex-direction:column;overflow:hidden}
.hdr{padding:16px 18px 4px;font-size:19px;font-weight:600}
.cats{display:flex;gap:8px;padding:12px 16px;overflow-x:auto}
.cat{padding:8px 15px;border-radius:999px;background:#221d15;color:#cbbf9f;font-size:12.5px;white-space:nowrap}
.cat.on{background:#f5b83d;color:#241a04;font-weight:600}
.card{margin:4px 16px;background:#1c180f;border:1px solid #2c2517;border-radius:18px;padding:16px}
.row{display:flex;gap:10px;align-items:center}
.row input{flex:1;background:#26200f;border:1px solid #3a3116;border-radius:12px;padding:12px 14px;font-size:17px;outline:none;min-width:0}
.row input:focus{border-color:#f5b83d}
.row select{background:#26200f;border:1px solid #3a3116;border-radius:12px;padding:11px 10px;font-size:14px;outline:none}
.swap{margin:10px auto;width:38px;height:38px;border-radius:999px;background:#2c2414;border:1px solid #453915;display:flex;align-items:center;justify-content:center;color:#f5b83d;font-size:16px}
.res{text-align:center;margin-top:14px}
.res .v{font-size:30px;font-weight:300;color:#f5b83d;font-variant-numeric:tabular-nums;word-break:break-all}
.res .u{font-size:12px;color:#a3977a;margin-top:4px}
.info{margin:auto 16px 16px;background:#171410;border-radius:14px;padding:12px 16px;font-size:12px;color:#a3977a;line-height:1.6}
`,
  `<div class="hdr">Converter</div><div class="cats" id="cats"></div>
<div class="card">
<div class="row"><input id="in" type="number" value="1" inputmode="decimal"><select id="from"></select></div>
<button class="swap" id="swap" aria-label="Swap units">⇅</button>
<div class="row"><input id="out" readonly tabindex="-1"><select id="to"></select></div>
<div class="res"><div class="v" id="rv">1</div><div class="u" id="ru">1 m = 3.28084 ft</div></div>
</div>
<div class="info" id="info">All conversions run fully offline on your device. Temperature uses offset formulas; other categories use exact SI factors.</div>`,
  `
var CATS={
 Length:{units:{mm:0.001,cm:0.01,m:1,km:1000,inch:0.0254,ft:0.3048,mi:1609.344}},
 Weight:{units:{mg:1e-6,g:0.001,kg:1,t:1000,oz:0.0283495,lb:0.453592}},
 Volume:{units:{ml:0.001,L:1,'m³':1000,gal:3.78541,cup:0.24}},
 Data:{units:{B:1,KB:1024,MB:1048576,GB:1073741824,TB:1099511627776}},
 Temperature:null};
var cur='Length';
function el(id){return document.getElementById(id);}
function tToC(v,u){if(u==='C')return v;if(u==='F')return (v-32)*5/9;return v-273.15;}
function tFromC(v,u){if(u==='C')return v;if(u==='F')return v*9/5+32;return v+273.15;}
function convert(){
 var v=parseFloat(el('in').value);
 if(isNaN(v)){el('out').value='';el('rv').textContent='—';el('ru').textContent='';return;}
 if(cur==='Temperature'){
  var r=tFromC(tToC(v,el('from').value),el('to').value);
  el('out').value=Math.round(r*100)/100;
 }else{
  var u=CATS[cur].units;
  var r=v*u[el('from').value]/u[el('to').value];
  el('out').value=Math.abs(r)>=1e9?r.toExponential(6):Math.round(r*1e6)/1e6;
 }
 el('rv').textContent=el('out').value+' '+el('to').value;
 el('ru').textContent=v+' '+el('from').value+' = '+el('out').value+' '+el('to').value;}
function fill(){
 var names=cur==='Temperature'?['C','F','K']:Object.keys(CATS[cur].units);
 var fo='',to='';
 names.forEach(function(n){var o='<option value="'+n+'">'+n+'</option>';fo+=o;to+=o;});
 el('from').innerHTML=fo;el('to').innerHTML=to;
 if(cur==='Length'){el('from').value='m';el('to').value='ft';}
 if(cur==='Weight'){el('from').value='kg';el('to').value='lb';}
 if(cur==='Volume'){el('from').value='L';el('to').value='gal';}
 if(cur==='Data'){el('from').value='MB';el('to').value='GB';}
 if(cur==='Temperature'){el('from').value='C';el('to').value='F';}
 convert();}
var cb='';
Object.keys(CATS).forEach(function(k){cb+='<button class="cat'+(k===cur?' on':'')+'" data-k="'+k+'">'+k+'</button>';});
el('cats').innerHTML=cb;
Array.prototype.forEach.call(el('cats').children,function(b){
 b.addEventListener('click',function(){cur=b.getAttribute('data-k');
  Array.prototype.forEach.call(el('cats').children,function(x){x.classList.toggle('on',x===b);});
  fill();});});
el('in').addEventListener('input',convert);
el('from').addEventListener('change',convert);
el('to').addEventListener('change',convert);
el('swap').addEventListener('click',function(){
 var a=el('from').value;el('from').value=el('to').value;el('to').value=a;convert();});
fill();
`
);

export const BASIC_APPS = [
  {
    id: 'calculator',
    name: 'Calculator',
    pkg: 'app.webdroid.calculator',
    developer: 'WebDroid Labs',
    category: 'Apps' as const,
    rating: 4.7,
    reviews: '8.2K',
    downloads: '500K+',
    sizeMB: 3.2,
    version: '2.4.1',
    tagline: 'Fast, precise, distraction-free math',
    description:
      'A clean calculator built for one-handed use. Chained operations, percent support, full keyboard control on desktop, and an instant-response keypad tuned for touch.',
    whatsNew: 'Added keyboard input, percent key and improved decimal precision.',
    html: CALC,
  },
  {
    id: 'clock',
    name: 'Desk Clock',
    pkg: 'app.webdroid.clock',
    developer: 'WebDroid Labs',
    category: 'Apps' as const,
    rating: 4.5,
    reviews: '5.1K',
    downloads: '200K+',
    sizeMB: 4.1,
    version: '1.9.0',
    tagline: 'Clock, world times and a precise stopwatch',
    description:
      'A live clock with world-time rows for Tokyo, London and New York, plus a centisecond-accurate stopwatch with lap splits. Everything runs locally on the device.',
    whatsNew: 'Lap splits now show delta against the previous lap.',
    html: CLOCK,
  },
  {
    id: 'notes',
    name: 'Leafy Notes',
    pkg: 'app.webdroid.notes',
    developer: 'Verdant Software',
    category: 'Apps' as const,
    rating: 4.6,
    reviews: '12.4K',
    downloads: '1M+',
    sizeMB: 6.8,
    version: '3.1.2',
    tagline: 'Notes that stay on your device',
    description:
      'A minimal, private notebook. Create, edit and delete notes with instant autosave — your notes never leave the phone because they are stored in the device itself.',
    whatsNew: 'Autosave indicator, faster list rendering, friendlier empty state.',
    html: NOTES,
  },
  {
    id: 'weather',
    name: 'Aura Weather',
    pkg: 'app.webdroid.weather',
    developer: 'Aura Studio',
    category: 'Apps' as const,
    rating: 4.4,
    reviews: '21.7K',
    downloads: '5M+',
    sizeMB: 12.5,
    version: '5.0.3',
    tagline: 'Beautiful forecasts for three cities',
    description:
      'Hourly and 5-day forecasts for Mountain View, Dubai and Oslo with humidity, wind, UV and pressure details — all generated on-device, no network needed.',
    whatsNew: 'City switcher redesigned; temperature range bars added.',
    html: WEATHER,
  },
  {
    id: 'converter',
    name: 'Unit Converter',
    pkg: 'app.webdroid.converter',
    developer: 'WebDroid Labs',
    category: 'Apps' as const,
    rating: 4.3,
    reviews: '3.9K',
    downloads: '150K+',
    sizeMB: 2.7,
    version: '1.5.0',
    tagline: 'Length, weight, volume, data and temperature',
    description:
      'Convert between metric and imperial units with exact SI factors, or shift between Celsius, Fahrenheit and Kelvin. Swap units with one tap.',
    whatsNew: 'Added data-size category and temperature offset formulas.',
    html: CONVERTER,
  },
];
