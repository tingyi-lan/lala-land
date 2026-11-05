(function(){
  'use strict';
  const root=document.querySelector('.ai-case');if(!root)return;
  const tabs=[...root.querySelectorAll('[data-ai-tab]')];
  function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();select(tabs[n]);tabs[n].focus();});});
  const dialog=document.createElement('dialog');dialog.className='ai-lightbox';dialog.setAttribute('aria-label','产品图片大图');dialog.innerHTML='<div class="ai-lightbox-bar"><span></span><button type="button" aria-label="关闭大图">×</button></div><img alt="">';document.body.appendChild(dialog);
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  root.querySelectorAll('[data-ai-zoom]').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img'),img=dialog.querySelector('img');img.src=source.src;img.alt=source.alt;dialog.querySelector('span').textContent=source.alt;dialog.showModal();}));
  root.querySelectorAll('.ai-subnav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
})();
