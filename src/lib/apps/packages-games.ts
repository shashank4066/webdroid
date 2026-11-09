import { page } from './page.ts';

/**
 * Games and creative apps bundled with the local Play Store.
 */

// ---------------------------------------------------------------------------
// Snake
// ---------------------------------------------------------------------------

const SNAKE = page(
  'Snake',
  `
body{background:#07100b;color:#e6f2e6;display:flex;flex-direction:column;align-items:center;overflow:hidden}
.top{width:100%;display:flex;justify-content:space-between;padding:16px 20px 8px;font-size:13px}
.top b{color:#3ddc84;font-weight:600;font-variant-numeric:tabular-nums}
.stage{position:relative;margin-top:6px}
canvas{display:block;border-radius:14px;background:#0a1410;box-shadow:0 0 0 1px rgba(61,220,132,.25)}
.ov{position:absolute;inset:0;border-radius:14px;background:rgba(5,12,8,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:20px}
.ov h2{font-size:22px;font-weight:600;color:#eafff2}
.ov p{font-size:12.5px;color:#9dbfa9;line-height:1.6}
.ov button{margin-top:6px;background:#3ddc84;color:#062a19;font-weight:700;font-size:14px;padding:11px 30px;border-radius:999px}
.pad{display:grid;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(2,44px);gap:6px;margin:18px 0 14px}
.pk{border-radius:12px;background:#16241a;border:1px solid #24352a;color:#3ddc84;font-size:16px;display:flex;align-items:center;justify-content:center}
.pk:active{background:#1f3122}
.pk.up{grid-column:2}.pk.left{grid-column:1;grid-row:2}.pk.down{grid-column:2;grid-row:2}.pk.right{grid-column:3;grid-row:2}
`,
  `<div class="top"><span>Score <b id="sc">0</b></span><span>Best <b id="bs">0</b></span></div>
<div class="stage"><canvas id="cv" width="336" height="336"></canvas>
<div class="ov" id="ov"><h2 id="ovT">Snake</h2><p id="ovP">Swipe the board or use the pad to steer.<br>Eat the golden apple. Do not hit walls or yourself.</p><button id="ovB">Tap to start</button></div></div>
<div class="pad">
<button class="pk up" data-d="u">▲</button>
<button class="pk left" data-d="l">◀</button><button class="pk down" data-d="d">▼</button><button class="pk right" data-d="r">▶</button>
</div>`,
  `
var CELL=21,N=16;
var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
var snake,dir,ndir,food,score,speed,playing=false,timer=null;
var best=parseInt(localStorage.getItem('wd.snake.best')||'0',10);
document.getElementById('bs').textContent=best;
function placeFood(){while(true){var f={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)};
 if(!snake.some(function(s){return s.x===f.x&&s.y===f.y;})){food=f;return;}}}
function start(){clearTimeout(timer);
 snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}];dir={x:1,y:0};ndir=dir;
 score=0;speed=145;playing=true;
 document.getElementById('sc').textContent='0';
 document.getElementById('ov').style.display='none';
 placeFood();draw();loop();}
function loop(){timer=setTimeout(function(){step();if(playing)loop();},speed);}
function over(){playing=false;clearTimeout(timer);
 if(score>best){best=score;localStorage.setItem('wd.snake.best',String(best));document.getElementById('bs').textContent=best;}
 document.getElementById('ovT').textContent='Game over';
 document.getElementById('ovP').innerHTML='Score '+score+'  ·  Best '+best+'<br>Tap below to slither again.';
 document.getElementById('ovB').textContent='Play again';
 document.getElementById('ov').style.display='flex';}
function step(){dir=ndir;
 var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
 var bit=snake.some(function(s){return s.x===h.x&&s.y===h.y;});
 if(h.x<0||h.y<0||h.x>=N||h.y>=N||bit){over();return;}
 snake.unshift(h);
 if(h.x===food.x&&h.y===food.y){score+=10;
  document.getElementById('sc').textContent=score;
  speed=Math.max(72,speed-2);placeFood();}
 else snake.pop();
 draw();}
function rr(x,y,w,h,r){ctx.beginPath();
 ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
 ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function draw(){ctx.fillStyle='#0a1410';ctx.fillRect(0,0,336,336);
 ctx.strokeStyle='rgba(61,220,132,0.06)';ctx.lineWidth=1;
 for(var i=1;i<N;i++){ctx.beginPath();ctx.moveTo(i*CELL,0);ctx.lineTo(i*CELL,336);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,i*CELL);ctx.lineTo(336,i*CELL);ctx.stroke();}
 ctx.fillStyle='#f5b83d';ctx.beginPath();ctx.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL*0.34,0,Math.PI*2);ctx.fill();
 for(var j=snake.length-1;j>=0;j--){var s=snake[j];
  ctx.fillStyle=j===0?'#3ddc84':'rgba(61,220,132,'+Math.max(0.3,0.8-j*0.035)+')';
  rr(s.x*CELL+1.5,s.y*CELL+1.5,CELL-3,CELL-3,6);ctx.fill();}}
function steer(d){if(!playing)return;
 var m={u:{x:0,y:-1},d:{x:0,y:1},l:{x:-1,y:0},r:{x:1,y:0}}[d];
 if(!m)return;
 if(m.x===-dir.x&&m.y===-dir.y)return;
 ndir=m;}
document.querySelectorAll('.pk').forEach(function(b){
 b.addEventListener('click',function(){steer(b.getAttribute('data-d'));});});
var ts=null;
cv.addEventListener('touchstart',function(e){ts=e.touches[0];},{passive:true});
cv.addEventListener('touchend',function(e){if(!ts)return;
 var t=e.changedTouches[0],dx=t.clientX-ts.clientX,dy=t.clientY-ts.clientY;
 if(Math.max(Math.abs(dx),Math.abs(dy))<24){ts=null;return;}
 steer(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'));ts=null;},{passive:true});
document.addEventListener('keydown',function(e){
 var m={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r'};
 if(m[e.key]){e.preventDefault();steer(m[e.key]);}
 if((e.key===' '||e.key==='Enter')&&!playing){e.preventDefault();start();}});
document.getElementById('ovB').addEventListener('click',start);
draw();
`
);

// ---------------------------------------------------------------------------
// 2048
// ---------------------------------------------------------------------------

const G2048 = page(
  '2048',
  `
body{background:#151009;color:#f0e9d8;display:flex;flex-direction:column;align-items:center;overflow:hidden}
.top{width:100%;display:flex;align-items:center;padding:16px 20px 8px;gap:10px}
.logo{font-size:26px;font-weight:800;color:#f5b83d;letter-spacing:1px;flex:1}
.scorebox{background:#2a2113;border-radius:10px;padding:6px 14px;text-align:center}
.scorebox span{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.12em;color:#b8a675}
.scorebox b{font-size:15px;font-variant-numeric:tabular-nums}
.board{position:relative;margin-top:8px;background:#33270f;border-radius:14px;padding:8px;box-shadow:0 0 0 1px rgba(245,184,61,.2)}
.grid{display:grid;grid-template-columns:repeat(4,76px);grid-template-rows:repeat(4,76px);gap:8px}
.cell{border-radius:10px;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:26px;transition:background .12s}
.cell.pop{animation:pop .16s ease-out}
@keyframes pop{from{transform:scale(.55)}to{transform:scale(1)}}
.ov{position:absolute;inset:0;border-radius:14px;background:rgba(20,12,4,.86);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.ov.show{display:flex}
.ov h2{font-size:24px;color:#ffd76e;font-weight:700}
.ov p{font-size:13px;color:#cbb98d}
.ov button,.ng{background:#f5b83d;color:#241a04;font-weight:700;padding:10px 26px;border-radius:999px;font-size:14px}
.hint{font-size:11.5px;color:#a5945f;margin-top:12px;text-align:center;line-height:1.6}
.pad{display:grid;grid-template-columns:repeat(3,52px);grid-template-rows:repeat(2,40px);gap:5px;margin:12px 0 6px}
.pk{border-radius:10px;background:#2a2113;border:1px solid #403316;color:#f5b83d;font-size:14px}
.pk.up{grid-column:2}.pk.left{grid-column:1;grid-row:2}.pk.down{grid-column:2;grid-row:2}.pk.right{grid-column:3;grid-row:2}
`,
  `<div class="top"><div class="logo">2048</div>
<div class="scorebox"><span>Score</span><b id="sc">0</b></div>
<div class="scorebox"><span>Best</span><b id="bs">0</b></div>
<button class="ng" id="ng">New</button></div>
<div class="board"><div class="grid" id="g"></div>
<div class="ov" id="ov"><h2 id="ovT">No moves left</h2><p id="ovP">Score 0</p><button id="ovB">Try again</button></div></div>
<div class="pad"><button class="pk up" data-d="u">▲</button><button class="pk left" data-d="l">◀</button><button class="pk down" data-d="d">▼</button><button class="pk right" data-d="r">▶</button></div>
<div class="hint">Swipe the board or use arrow keys.<br>Join tiles with the same number to reach 2048.</div>`,
  `
var SIZE=4,grid,score,over,won;
var best=parseInt(localStorage.getItem('wd.g2048.best')||'0',10);
document.getElementById('bs').textContent=best;
var COLORS={2:['#efe6d4','#4a3d20'],4:['#e8d7ab','#4a3d20'],8:['#f2b179','#3d2a10'],16:['#ec8f54','#3d1c0a'],32:['#f25f3d','#fff'],64:['#e23c22','#fff'],128:['#f5b83d','#241a04'],256:['#f0a41f','#241a04'],512:['#3ddc84','#062a19'],1024:['#2fb56b','#fff'],2048:['#ffd76e','#4a3305'],4096:['#a78bfa','#fff'],8192:['#f2544f','#fff']};
function el(id){return document.getElementById(id);}
function empty(){var out=[];for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++)if(!grid[r][c])out.push([r,c]);return out;}
function addRandom(){var es=empty();if(!es.length)return;
 var p=es[Math.floor(Math.random()*es.length)];
 grid[p[0]][p[1]]=Math.random()<0.9?2:4;
 var cell=el('g').children[p[0]*SIZE+p[1]];
 cell.classList.remove('pop');void cell.offsetWidth;cell.classList.add('pop');}
function newGame(){grid=[];for(var r=0;r<SIZE;r++){grid.push([0,0,0,0]);}
 score=0;over=false;won=false;
 el('ov').classList.remove('show');el('sc').textContent='0';
 render();addRandom();addRandom();render();}
function slide(row){var a=row.filter(function(v){return v;});var out=[],moved=false;
 for(var i=0;i<a.length;i++){
  if(i+1<a.length&&a[i]===a[i+1]){out.push(a[i]*2);i++;moved=true;}
  else out.push(a[i]);}
 while(out.length<SIZE)out.push(0);
 for(var j=0;j<SIZE;j++)if(out[j]!==row[j])moved=true;
 return {row:out,moved:moved};}
function move(dir){if(over)return;
 var moved=false;
 var got=[];
 function handle(row){var res=slide(row);moved=moved||res.moved;got.push(res.row);}
 if(dir==='l'||dir==='r'){for(var r=0;r<SIZE;r++){var row=grid[r].slice();if(dir==='r')row.reverse();handle(row);if(dir==='r')got[r].reverse();}}
 else{for(var c=0;c<SIZE;c++){var col=[];for(var r2=0;r2<SIZE;r2++)col.push(grid[r2][c]);
  if(dir==='d')col.reverse();handle(col);if(dir==='d')got[c].reverse();}}
 if(dir==='u'||dir==='d'){for(var r3=0;r3<SIZE;r3++)for(var c3=0;c3<SIZE;c3++)grid[r3][c3]=got[r3][c3];}
 else{for(var r4=0;r4<SIZE;r4++)for(var c4=0;c4<SIZE;c4++)grid[r4][c4]=got[r4][c4];}
 if(!moved)return;
 addRandom();
 if(score>best){best=score;localStorage.setItem('wd.g2048.best',String(best));el('bs').textContent=best;}
 render();
 if(!won){for(var r5=0;r5<SIZE;r5++)for(var c5=0;c5<SIZE;c5++)if(grid[r5][c5]===2048){won=true;
  el('ovT').textContent='You made 2048';
  el('ovP').textContent='Score '+score+' — keep going?';
  el('ovB').textContent='Continue';
  el('ov').classList.add('show');}}
 var can=false;
 for(var r6=0;r6<SIZE&&!can;r6++)for(var c6=0;c6<SIZE&&!can;c6++){
  if(!grid[r6][c6])can=true;
  else{if(c6<SIZE-1&&grid[r6][c6]===grid[r6][c6+1])can=true;
   if(r6<SIZE-1&&grid[r6][c6]===grid[r6+1][c6])can=true;}}
 if(!can&&!won){over=true;el('ovT').textContent='No moves left';
  el('ovP').textContent='Final score '+score;el('ovB').textContent='Try again';
  el('ov').classList.add('show');}}
function render(){el('sc').textContent=score;
 var g=el('g');g.innerHTML='';
 for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){var v=grid[r][c];
  var d=document.createElement('div');d.className='cell';
  if(v){d.textContent=v;var pair=COLORS[v]||['#3ddc84','#062a19'];
   d.style.background=pair[0];d.style.color=pair[1];
   if(v>=1024)d.style.fontSize='19px';else if(v>=128)d.style.fontSize='23px';}
  g.appendChild(d);}}
document.querySelectorAll('.pk').forEach(function(b){
 b.addEventListener('click',function(){move({u:'u',d:'d',l:'l',r:'r'}[b.getAttribute('data-d')]);});});
document.addEventListener('keydown',function(e){
 var m={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r'};
 if(m[e.key]){e.preventDefault();move(m[e.key]);}});
var ts=null;
el('g').addEventListener('touchstart',function(e){ts=e.touches[0];},{passive:true});
el('g').addEventListener('touchend',function(e){if(!ts)return;
 var t=e.changedTouches[0],dx=t.clientX-ts.clientX,dy=t.clientY-ts.clientY;ts=null;
 if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
 move(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'));},{passive:true});
el('ng').addEventListener('click',newGame);
el('ovB').addEventListener('click',function(){el('ov').classList.remove('show');if(over)newGame();});
newGame();
`
);

// ---------------------------------------------------------------------------
// Pocket Paint
// ---------------------------------------------------------------------------

const PAINT = page(
  'Pocket Paint',
  `
body{background:#0f1412;color:#e7f0e9;display:flex;flex-direction:column;overflow:hidden}
.hdr{display:flex;align-items:center;gap:6px;padding:12px 14px 8px}
.hdr b{font-size:17px;font-weight:600;flex:1}
.tb{height:38px;padding:0 14px;border-radius:999px;background:#1c2620;color:#cfe0d2;font-size:12.5px;display:flex;align-items:center;justify-content:center}
.tb.warn{background:#2a1715;color:#ff8a80}
.tb:active{filter:brightness(1.3)}
.colors{display:flex;gap:8px;padding:4px 14px 8px;align-items:center}
.sw{width:30px;height:30px;border-radius:999px;flex:0 0 auto;border:2px solid transparent}
.sw.on{border-color:#fff;transform:scale(1.12)}
.sz{display:flex;gap:6px;margin-left:8px;align-items:center}
.szb{border-radius:999px;background:#1c2620;display:flex;align-items:center;justify-content:center}
.szb.on{outline:2px solid #3ddc84}
.szb i{border-radius:999px;background:#e7f0e9;display:block}
.stage{flex:1;padding:4px 14px 14px;min-height:0}
canvas{width:100%;height:100%;border-radius:18px;background:#131a16;box-shadow:0 0 0 1px rgba(255,255,255,.08);touch-action:none;cursor:crosshair}
`,
  `<div class="hdr"><b>Pocket Paint</b><button class="tb" id="undo">Undo</button><button class="tb warn" id="clear">Clear</button></div>
<div class="colors" id="colors">
<div class="sz"><button class="szb" data-s="3"><i style="width:6px;height:6px"></i></button><button class="szb" data-s="7"><i style="width:11px;height:11px"></i></button><button class="szb" data-s="14"><i style="width:18px;height:18px"></i></button></div>
</div>
<div class="stage"><canvas id="cv"></canvas></div>`,
  `
var COLORS=['#f4f7f2','#3ddc84','#f5b83d','#fb7185','#a78bfa','#38bdf8','#f97316','#8b5a2b'];
var color=COLORS[0],size=7,drawing=false,last=null;
var cv=document.getElementById('cv'),ctx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect();
 cv.width=Math.round(r.width*devicePixelRatio);cv.height=Math.round(r.height*devicePixelRatio);
 ctx.scale(devicePixelRatio,devicePixelRatio);
 fillBg();}
function fillBg(){var w=cv.width/devicePixelRatio,h=cv.height/devicePixelRatio;
 ctx.fillStyle='#131a16';ctx.fillRect(0,0,w,h);}
var stack=[];
function snap(){try{var w=cv.width,h=cv.height;
 stack.push({d:ctx.getImageData(0,0,w,h),w:w,h:h,ow:cv.width/devicePixelRatio,oh:cv.height/devicePixelRatio});
 if(stack.length>10)stack.shift();}catch(e){}}
function undo(){var s=stack.pop();if(!s)return;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);
 ctx.putImageData(s.d,0,0);
 ctx.restore();}
var cw=document.getElementById('colors');
COLORS.forEach(function(c,i){var b=document.createElement('button');
 b.className='sw'+(i===0?' on':'');b.style.background=c;b.setAttribute('aria-label','Color '+(i+1));
 b.addEventListener('click',function(){color=c;
  document.querySelectorAll('.sw').forEach(function(x){x.classList.remove('on');});
  b.classList.add('on');});
 cw.insertBefore(b,document.querySelector('.sz'));});
document.querySelectorAll('.szb').forEach(function(b){
 b.addEventListener('click',function(){size=+b.getAttribute('data-s');
  document.querySelectorAll('.szb').forEach(function(x){x.classList.remove('on');});
  b.classList.add('on');});
 if(b.getAttribute('data-s')==='7')b.classList.add('on');});
cv.addEventListener('pointerdown',function(e){drawing=true;last=pt(e);snap();stroke(last,last);});
cv.addEventListener('pointermove',function(e){if(!drawing)return;var p=pt(e);stroke(last,p);last=p;});
window.addEventListener('pointerup',function(){drawing=false;});
function pt(e){var r=cv.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function stroke(a,b){ctx.strokeStyle=color;ctx.lineWidth=size;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x+0.01,b.y+0.01);ctx.stroke();}
document.getElementById('clear').addEventListener('click',function(){snap();fillBg();});
document.getElementById('undo').addEventListener('click',undo);
window.addEventListener('resize',fit);
fit();
requestAnimationFrame(fit);
`
);

export const GAME_APPS = [
  {
    id: 'snake',
    name: 'Snake Classic',
    pkg: 'game.webdroid.snake',
    developer: 'Retro Pixel Works',
    category: 'Games' as const,
    rating: 4.8,
    reviews: '31.2K',
    downloads: '10M+',
    sizeMB: 5.4,
    version: '4.2.0',
    tagline: 'The arcade legend, rebuilt for touch',
    description:
      'Swipe the board or use the D-pad to steer your snake. Golden apples grow your tail and speed things up. Your best score is stored on the device — beat yourself offline.',
    whatsNew: 'Snake tail now fades with distance; swipe controls refined.',
    html: SNAKE,
  },
  {
    id: 'g2048',
    name: '2048 Merge',
    pkg: 'game.webdroid.2048',
    developer: 'Retro Pixel Works',
    category: 'Games' as const,
    rating: 4.6,
    reviews: '18.9K',
    downloads: '5M+',
    sizeMB: 4.8,
    version: '2.8.1',
    tagline: 'Swipe, merge, chase the golden tile',
    description:
      'A dark-gold take on the classic 2048. Swipe or use arrow keys to slide tiles, merge equal numbers and reach the 2048 tile. Best score is saved locally.',
    whatsNew: 'Tile pop animations and a smarter no-moves detector.',
    html: G2048,
  },
  {
    id: 'paint',
    name: 'Pocket Paint',
    pkg: 'app.webdroid.paint',
    developer: 'Studio Tela',
    category: 'Apps' as const,
    rating: 4.5,
    reviews: '7.6K',
    downloads: '300K+',
    sizeMB: 7.3,
    version: '1.7.4',
    tagline: 'A tiny canvas that fits in your pocket',
    description:
      'Sketch with eight colors, three brush sizes, undo and a clean canvas. Pointer and touch friendly — press lightly, paint boldly.',
    whatsNew: 'Hi-DPI canvas, 10-step undo history, smoother strokes.',
    html: PAINT,
  },
];
