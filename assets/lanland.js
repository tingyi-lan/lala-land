(function(){
  'use strict';
  const land=document.getElementById('desktop'),stage=document.getElementById('desktopSurface'),caseButton=document.getElementById('airpodsCase'),folders=[...document.querySelectorAll('.land-folder')],folderLayer=document.getElementById('islandFolders'),controls=document.getElementById('landControls'),status=document.getElementById('landStatus');
  const mobile=()=>matchMedia('(max-width:600px)').matches;
  const scattered=[[63,36],[77,32],[89,40],[63,51],[77,49],[90,57],[59,69],[73,65],[86,70],[70,76]];
  const tidy=[[60,37],[74,37],[88,37],[60,51],[74,51],[88,51],[60,65],[74,65],[88,65],[74,77]];
  const returnButton=document.getElementById('returnToSea'),hint=document.getElementById('caseHint');
  let phase='sea',layout='scatter',focusSource,timers=[];
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const ARRIVAL=3400;
  let cameraFrom=0,cameraRaf=0,cameraToken=0;
  function later(fn,ms){timers.push(setTimeout(fn,reduced.matches?0:ms));}
  function clearSequence(){timers.forEach(clearTimeout);timers=[];cancelAnimationFrame(cameraRaf);cameraToken++;}
  function clamp01(v){return v<0?0:v>1?1:v;}
  function lerp(a,b,t){return a+(b-a)*t;}
  function bezier(x,x1,y1,x2,y2){
    const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
    const sampleX=t=>((ax*t+bx)*t+cx)*t,sampleY=t=>((ay*t+by)*t+cy)*t,sampleDX=t=>(3*ax*t+2*bx)*t+cx;
    let t=x;
    for(let i=0;i<8;i++){const diff=sampleX(t)-x,den=sampleDX(t);if(Math.abs(diff)<1e-5||Math.abs(den)<1e-5)break;t=Math.min(1,Math.max(0,t-diff/den));}
    return sampleY(t);
  }
  function unitEase(x){return bezier(x,0.42,0.02,0.18,1);}
  function smooth(x){return x*x*(3-2*x);}
  function seg(ms,a,b,easeFn){const t=clamp01((ms-a)/(b-a));return (easeFn||unitEase)(t);}
  function seaEnd(){if(matchMedia('(max-width:600px)').matches)return 1.55;if(matchMedia('(max-width:1000px)').matches)return 1.8;return 2.05;}
  function paintCamera(ms){
    const approach=seg(ms,0,2500),fade=seg(ms,875,1450,smooth),depth=seg(ms,1450,2350);
    land.style.setProperty('--sea-scale',lerp(1,seaEnd(),approach).toFixed(4));
    land.style.setProperty('--sea-opacity',(1-fade).toFixed(4));
    land.style.setProperty('--court-opacity',fade.toFixed(4));
    land.style.setProperty('--court-scale',lerp(0.97,1,Math.max(fade,depth)).toFixed(4));
    land.style.setProperty('--sea-shift',lerp(0,-35,approach).toFixed(2)+'px');
  }
  function runCamera(to,done){
    cancelAnimationFrame(cameraRaf);
    const token=++cameraToken;
    if(reduced.matches){paintCamera(to);cameraFrom=to;if(done)done();return;}
    const from=cameraFrom,t0=performance.now(),duration=Math.max(1,Math.abs(to-from));
    const step=now=>{
      if(token!==cameraToken)return;
      const t=Math.min(1,(now-t0)/duration);
      cameraFrom=from+(to-from)*t;
      paintCamera(cameraFrom);
      if(t<1)cameraRaf=requestAnimationFrame(step);
      else if(done)done();
    };
    cameraRaf=requestAnimationFrame(step);
  }
  function place(items,center){
    land.dataset.layout=layout;
    document.getElementById('tidyFolders').setAttribute('aria-pressed',String(layout==='tidy'));
    document.getElementById('scatterFolders').setAttribute('aria-pressed',String(layout==='scatter'));
    folders.forEach((folder,i)=>{
    folder.style.transitionDelay=center?'0s':(i*35)+'ms';
    folder.style.left=center?'var(--case-x)':items[i][0]+'%';
    folder.style.top=center?'var(--case-y)':items[i][1]+'%';
    folder.style.setProperty('--tilt',layout==='tidy'?'0deg':((i%2?-1:1)*(3+i%5))+'deg');
  });}
  place(scattered,true);
  function openCase(){
    if(phase!=='sea')return;
    clearSequence();phase='entering';caseButton.disabled=true;
    caseButton.setAttribute('aria-busy','true');caseButton.setAttribute('aria-expanded','true');
    land.classList.add('is-landing');
    document.querySelector('.land-copy').setAttribute('aria-hidden','true');
    hint.innerHTML='<b>正在靠近这座岛…</b>';status.textContent='镜头拉近，准备登岛。';
    runCamera(ARRIVAL);
    later(()=>{land.classList.add('is-open');hint.innerHTML='<b>好奇心，已连接。</b>';},2300);
    later(()=>{land.classList.add('is-host-visible','is-listening');document.getElementById('avatarCaption').textContent='岛主蓝蓝 · 正在听歌';},2500);
    later(()=>{land.classList.add('has-records');folderLayer.inert=false;requestAnimationFrame(()=>requestAnimationFrame(()=>place(layout==='tidy'?tidy:scattered,false)));},2750);
    later(()=>{
      phase='island';land.classList.add('is-ready');controls.inert=false;returnButton.disabled=false;caseButton.disabled=false;
      caseButton.removeAttribute('aria-busy');caseButton.setAttribute('aria-label','合上耳机仓，返回海面远景');
      hint.innerHTML='<b>点一下耳机仓，返回海面</b>';
      status.textContent=mobile()?'向下逛逛，选一张黄色唱片。':'选一张黄色唱片，也可以随机逛逛或一键整理。';
    },3600);
  }
  function closeCase(){
    if(phase!=='island')return;
    clearSequence();phase='leaving';caseButton.disabled=true;returnButton.disabled=true;controls.inert=true;folderLayer.inert=true;
    land.classList.remove('is-ready','has-records','is-host-visible','is-listening');place(scattered,true);
    hint.innerHTML='<b>回到海面，再慢慢出发。</b>';status.textContent='正在返回海面远景。';
    if(mobile())window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
    later(()=>land.classList.remove('is-open'),250);
    later(()=>{land.classList.remove('is-landing');hint.innerHTML='<b>点击耳机仓 · 登岛</b>';},900);
    runCamera(0,()=>{
      phase='sea';document.querySelector('.land-copy').removeAttribute('aria-hidden');caseButton.disabled=false;caseButton.setAttribute('aria-expanded','false');caseButton.setAttribute('aria-label','点击耳机仓，拉近镜头登岛');
      document.getElementById('avatarCaption').textContent='岛主蓝蓝 · 等你登岛';status.textContent='打开耳机仓，让好奇心登岛。';caseButton.focus({preventScroll:true});
    });
  }
  caseButton.addEventListener('click',()=>phase==='sea'?openCase():closeCase());
  returnButton.addEventListener('click',closeCase);
  folders.forEach(folder=>{
    let drag=null,dragged=false;
    folder.addEventListener('pointerdown',e=>{if(e.button!==0||mobile())return;dragged=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:parseFloat(folder.style.left),top:parseFloat(folder.style.top)};folder.setPointerCapture(e.pointerId);});
    folder.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!dragged&&Math.abs(dx)+Math.abs(dy)<7)return;dragged=true;folder.classList.add('dragging');folder.style.transitionDelay='0s';folder.style.left=Math.max(6,Math.min(94,drag.left+dx/stage.clientWidth*100))+'%';folder.style.top=Math.max(12,Math.min(81,drag.top+dy/stage.clientHeight*100))+'%';layout='custom';land.dataset.layout=layout;document.getElementById('tidyFolders').setAttribute('aria-pressed','false');document.getElementById('scatterFolders').setAttribute('aria-pressed','false');});
    function finish(e){if(!drag)return;if(folder.hasPointerCapture(e.pointerId))folder.releasePointerCapture(e.pointerId);folder.classList.remove('dragging');drag=null;if(dragged)status.textContent='唱片已放好。随时可以一键整理。';}
    folder.addEventListener('pointerup',finish);folder.addEventListener('pointercancel',finish);
    folder.addEventListener('click',e=>{if(dragged){dragged=false;e.preventDefault();return;}focusSource=folder;window.lanlandOpen(folder);});
  });
  document.getElementById('tidyFolders').addEventListener('click',()=>{layout='tidy';place(tidy,false);status.textContent='整理好了，每张唱片都有自己的位置。';});
  document.getElementById('scatterFolders').addEventListener('click',()=>{layout='scatter';place(scattered,false);status.textContent='让想法自由散落，随心打开一个。';});
  let lastRandom=-1;
  document.getElementById('randomFolder').addEventListener('click',()=>{let n;do{n=Math.floor(Math.random()*folders.length);}while(n===lastRandom);lastRandom=n;status.textContent='这次去看看：'+folders[n].querySelector('.folder-label').textContent;folders[n].click();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const windows=[...stage.querySelectorAll('.os-window')];if(!windows.length)return;windows.sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex));windows[0].querySelector('.tl-close').click();if(focusSource?.isConnected)focusSource.focus();}});
  window.addEventListener('resize',()=>{if(phase==='island'&&layout!=='custom')place(layout==='tidy'?tidy:scattered,false);});
})();
