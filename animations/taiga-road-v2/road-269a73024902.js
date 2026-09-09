(function(){function start(){if(window.taigaRoadStarted)return;if(!['about','industry','quiz','map'].every(id=>document.getElementById(id)))return;window.taigaRoadStarted=true;
(function(){
const sections=['about','industry','quiz','map'].map(id=>document.getElementById(id));
const ns='http://www.w3.org/2000/svg';
const layer=document.createElement('div');layer.id='road-preview';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer);
function draw(){
 const rects=sections.map(s=>{const r=s.getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,height:r.height}});
 const top=rects[0].top,H=rects[3].bottom-top,W=document.documentElement.clientWidth;
 const y=(i,f)=>rects[i].top-top+rects[i].height*f;
 const x=n=>W<700&&n>=0&&n<=1?28+(W-56)*n:W*n;
 const legend=document.querySelector('.geo-legend')?.getBoundingClientRect();
 const finishY=Math.min(H-35,(legend?legend.bottom+scrollY-top:H-80)+44);
 const d=`M ${x(-.08)} ${y(0,.18)} C ${x(.23)} ${y(0,.225)} ${x(.90)} ${y(0,.22)} ${x(.955)} ${y(0,.39)} C ${x(1.06)} ${y(0,.69)} ${x(.90)} ${y(0,.93)} ${x(.50)} ${y(0,.96)} C ${x(.15)} ${y(1,.02)} ${x(.035)} ${y(1,.15)} ${x(.035)} ${y(1,.43)} C ${x(.025)} ${y(1,1.045)} ${x(.40)} ${y(1,1.045)} ${x(.80)} ${y(1,1.0)} C ${x(1.06)} ${y(2,.01)} ${x(.965)} ${y(2,.44)} ${x(.965)} ${y(2,.67)} C ${x(.965)} ${y(2,1.02)} ${x(.30)} ${y(2,.91)} ${x(.10)} ${y(3,.04)} C ${x(.015)} ${y(3,.14)} ${x(.035)} ${y(3,.40)} ${x(.035)} ${y(3,.68)} C ${x(.035)} ${finishY-70} ${x(.12)} ${finishY} ${x(.29)} ${finishY} C ${x(.51)} ${finishY} ${x(.81)} ${finishY} ${x(1.08)} ${finishY}`;
 layer.style.top=top+'px';layer.style.height=H+'px';
 layer.innerHTML=`<svg xmlns="${ns}" width="100%" height="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><filter id="roadSoftShadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter></defs><path d="${d}" fill="none" stroke="#77848b" stroke-opacity=".13" stroke-width="92" filter="url(#roadSoftShadow)"/><path d="${d}" fill="none" stroke="#87959c" stroke-opacity=".37" stroke-width="82"/><path id="roadLine" d="${d}" fill="none" stroke="#adb5b9" stroke-opacity=".65" stroke-width="76"/><path d="${d}" fill="none" stroke="#f8f8f5" stroke-opacity=".95" stroke-width="68"/><path d="${d}" fill="none" stroke="#adb5b9" stroke-opacity=".85" stroke-width="64"/><path d="${d}" fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="3" stroke-dasharray="17 17"/></svg>`;
 // Narrower road leaves extra clearance around existing content.
 layer.querySelectorAll('path[stroke-width]').forEach(p=>{const n=Number(p.getAttribute('stroke-width'));if(n>10)p.setAttribute('stroke-width',n*(W<700?.58:.8))});
 // A non-layout mask protects the actual text bounds at every screen width.
 const svg=layer.firstChild,defs=svg.querySelector('defs');
 const mask=document.createElementNS(ns,'mask');mask.id='roadTextClearance';mask.setAttribute('maskUnits','userSpaceOnUse');
 const white=document.createElementNS(ns,'rect');white.setAttribute('width',W);white.setAttribute('height',H);white.setAttribute('fill','white');mask.appendChild(white);
 document.querySelectorAll('.ab-head h2,.ab-head .tag,.ab-badge,.prt-head,.qz-head,.mp-head,#prtHint,.geo-label,.geo-legend,.mp-note').forEach(e=>{
   const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let node;
   while(node=walker.nextNode()){
    if(!node.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(node);
    for(const r of range.getClientRects()){
     if(!r.width||!r.height)continue;
     const box=document.createElementNS(ns,'rect');box.setAttribute('x',r.left-12);box.setAttribute('y',r.top+scrollY-top-12);box.setAttribute('width',r.width+24);box.setAttribute('height',r.height+24);box.setAttribute('rx',10);box.setAttribute('fill','black');mask.appendChild(box);
    }
   }
 });defs.appendChild(mask);
 const roadGroup=document.createElementNS(ns,'g');roadGroup.setAttribute('mask','url(#roadTextClearance)');[...svg.children].filter(e=>e!==defs).forEach(e=>roadGroup.appendChild(e));svg.appendChild(roadGroup);
 const path=layer.querySelector('#roadLine'),len=path.getTotalLength();
 [0.055,.29,.49,.66,.92].forEach(t=>{const a=path.getPointAtLength(len*t),b=path.getPointAtLength(len*t+2);const arrow=document.createElementNS(ns,'path');arrow.setAttribute('d','M -8 -6 L 1 0 L -8 6');arrow.setAttribute('transform',`translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI})`);arrow.setAttribute('fill','none');arrow.setAttribute('stroke','#d78e43');arrow.setAttribute('stroke-width','3');layer.firstChild.appendChild(arrow)});
 // Direction markers use the same text protection as the road.
 [...svg.children].filter(e=>e.tagName==='path').forEach(e=>roadGroup.appendChild(e));
 window.roadPreviewMetrics={width:W,height:H,sections:rects,path:d};
 window.dispatchEvent(new Event('road-preview-ready'));
}
document.fonts.ready.then(draw);window.addEventListener('resize',draw);new ResizeObserver(draw).observe(document.getElementById('quiz'));
})();


(function(){
'use strict';
const ns='http://www.w3.org/2000/svg';
const sprite='https://qw3rez.github.io/landing-builder-assets/animations/taiga-road-v2/truck-a7ba5559f921.png';
let frame=0,path,truck,length=0,current=0,target=0,sceneTop=0,ready=false,previousTime=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
function el(tag,attrs,parent){const e=document.createElementNS(ns,tag);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(parent)parent.appendChild(e);return e}
function bounds(e,pad=18){const r=e.getBoundingClientRect();return {x:r.left-pad,y:r.top+scrollY-sceneTop-pad,w:r.width+pad*2,h:r.height+pad*2}}
function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function init(){
 cancelAnimationFrame(frame);frame=0;previousTime=0;
 const layer=document.getElementById('road-preview');if(!layer)return;
 path=layer.querySelector('#roadLine');if(!path)return;length=path.getTotalLength();sceneTop=parseFloat(layer.style.top)||0;
 const svg=layer.querySelector('svg'),group=svg.querySelector('g[mask]'),metrics=window.roadPreviewMetrics;
 const nature=el('g',{'class':'road-nature'},null);group.insertBefore(nature,group.firstChild);
 const occupied=[...document.querySelectorAll('.ab-card,.ab-head,.prt-card,.prt-head,.qz-head,.qz-card,.mp-head,.geo-card,.geo-legend,.mp-note,#prtHint')].map(e=>bounds(e));
 const placed=[];let count=0;
 function plant(x,y,kind,scale){
  const b={x:x-22*scale,y:y-42*scale,w:44*scale,h:52*scale};
  if(b.x<12||b.x+b.w>metrics.width-12||b.y<0||b.y+b.h>metrics.height||occupied.some(r=>overlaps(b,r))||placed.some(r=>overlaps(b,r)))return;
  placed.push(b);count++;
  const g=el('g',{transform:`translate(${x} ${y}) scale(${scale})`,'data-road-decor':kind},nature);
  el('ellipse',{cx:2,cy:3,rx:20,ry:6,fill:'#728077',opacity:'.13'},g);
  if(kind==='pine'){
   el('path',{d:'M -2 -6 L 0 5 L 3 5 L 2 -7',fill:'#8e8170'},g);
   el('path',{d:'M 0 -44 L -12 -25 L -7 -25 L -18 -9 L -10 -9 L -21 1 L 21 1 L 10 -9 L 18 -9 L 7 -25 L 12 -25 Z',fill:'#7e9e90'},g);
   el('path',{d:'M 0 -44 L 0 1 L 21 1 L 10 -9 L 18 -9 L 7 -25 L 12 -25 Z',fill:'#537d6d',opacity:'.7'},g);
   el('path',{d:'M -7 -25 L 0 -28 M -10 -9 L 0 -13',stroke:'#d1dcd1','stroke-width':1.2,fill:'none',opacity:'.75'},g);
  }else if(kind==='bush'){
   [[-10,-5,9],[1,-10,12],[12,-3,8]].forEach(([cx,cy,r],i)=>el('circle',{cx,cy,r,fill:['#a3b79b','#91aa8e','#b3c0a3'][i]},g));
   el('path',{d:'M -7 3 L 0 -8 M 4 3 L 7 -5',stroke:'#6f8d73','stroke-width':1.2,fill:'none'},g);
  }else{
   el('path',{d:'M -19 1 L -15 -10 L -5 -16 L 10 -14 L 20 -4 L 16 5 L -7 7 Z',fill:'#a8aaa4'},g);
   el('path',{d:'M -15 -10 L -5 -16 L 10 -14 L 5 -4 L -5 -3 Z',fill:'#d0d0c7'},g);
   el('path',{d:'M 5 -4 L 20 -4 L 16 5 L -7 7 L -5 -3 Z',fill:'#909993'},g);
   el('path',{d:'M 24 8 L 23 1 L 30 -3 L 36 2 L 34 8 Z',fill:'#b8b9b0'},g);
  }
 }
 for(let i=0,d=130;d<length-100;i++,d+=112){
  const p=path.getPointAtLength(d),a=path.getPointAtLength(Math.max(0,d-2)),b=path.getPointAtLength(Math.min(length,d+2));const dx=b.x-a.x,dy=b.y-a.y,m=Math.hypot(dx,dy)||1;
  for(const side of [-1,1]){
   const offset=61+(i%4)*7;const xx=p.x-side*dy/m*offset,yy=p.y+side*dx/m*offset;
   plant(xx,yy,['pine','rock','bush','pine','rock'][(i+(side>0?2:0))%5],.65+(i%3)*.12);
  }
 }
 truck=el('g',{'class':'road-truck','aria-hidden':'true'},group);
 const truckWidth=metrics.width<700?124:188;
 el('image',{href:sprite,x:-truckWidth/2,y:-truckWidth/8,width:truckWidth,height:truckWidth/4,preserveAspectRatio:'xMidYMid meet'},truck);
 window.roadLiveState={decorations:count,truckSource:'Blender render',ready:true,totalLength:length};
 ready=true;target=distanceForScroll();current=target;paint();
}
function distanceForScroll(){
 const maxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const start=Math.max(0,sceneTop-innerHeight*.35);
 const end=Math.max(start+1,Math.min(maxScroll,sceneTop+window.roadPreviewMetrics.height-innerHeight*.7));
 const t=Math.max(0,Math.min(1,(scrollY-start)/(end-start)));
 // Reserve the final drive across the page for when the bottom road is visible.
 const stops=[[0,0],[.25,.25],[.55,.55],[.78,.72],[.94,.86],[1,1]];
 let i=0;while(i<stops.length-2&&t>stops[i+1][0])i++;
 const a=stops[i],b=stops[i+1],h=b[0]-a[0],u=(t-a[0])/h;
 const slope=j=>{if(j===0)return 1;if(j===stops.length-1)return (stops[j][1]-stops[j-1][1])/(stops[j][0]-stops[j-1][0]);const l=(stops[j][1]-stops[j-1][1])/(stops[j][0]-stops[j-1][0]),r=(stops[j+1][1]-stops[j][1])/(stops[j+1][0]-stops[j][0]);return 2*l*r/(l+r)};
 const progress=(2*u**3-3*u**2+1)*a[1]+(u**3-2*u**2+u)*h*slope(i)+(-2*u**3+3*u**2)*b[1]+(u**3-u**2)*h*slope(i+1);
 Object.assign(window.roadLiveState,{scrollStart:start,scrollEnd:end,targetProgress:progress});
 return length*progress;
}
function paint(){
 const p=path.getPointAtLength(current),a=path.getPointAtLength(Math.max(0,current-4)),b=path.getPointAtLength(Math.min(length,current+4));
 const angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
 truck.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle})`);
 truck.style.visibility=(sceneTop+window.roadPreviewMetrics.height<scrollY||sceneTop>scrollY+innerHeight)?'hidden':'visible';
 if(window.roadLiveState)Object.assign(window.roadLiveState,{distance:current,progress:current/length,x:p.x,y:p.y,angle});
}
function step(now){
 frame=0;if(!ready)return;
 const dt=previousTime?Math.min(.05,(now-previousTime)/1000):1/60;previousTime=now;
 const diff=target-current;
 current=reduce.matches||Math.abs(diff)<.15?target:current+diff*(1-Math.exp(-dt/.35));
 paint();if(current!==target)frame=requestAnimationFrame(step);else previousTime=0;
}
function scroll(){if(!ready)return;target=distanceForScroll();if(!frame)frame=requestAnimationFrame(step)}
window.addEventListener('road-preview-ready',init);
window.addEventListener('scroll',scroll,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;previousTime=0}else scroll()});
if(window.roadPreviewMetrics)init();
})();

}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();})();
