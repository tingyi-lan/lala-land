(function(){
  'use strict';
  const shell=window.parent===window&&!!document.getElementById('page-home')&&!!document.getElementById('canvasFrame');
  if(window.parent!==window){
    document.documentElement.classList.add('lanlan-framed');
    document.addEventListener('click',function(event){
      if((event.button&&event.button!==0)||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const link=event.target.closest('a[href]');
      if(!link||link.target==='_blank')return;
      let url;
      try{url=new URL(link.href,location.href);}catch(error){return;}
      if(url.origin!==location.origin||!url.pathname.endsWith('.html'))return;
      if(url.pathname===location.pathname&&url.search===location.search)return;
      event.preventDefault();
      const toIndex=/\/index\.html$/.test(url.pathname)&&url.pathname.indexOf('/works/')===-1;
      const hash=(url.hash||'#home').replace(/^#/,'')||'home';
      const href=url.pathname+url.search+url.hash;
      setTimeout(function(){
        try{
          if(toIndex){
            if(parent.LanlanBgm)parent.LanlanBgm.close();
            const next='#'+hash;
            if(parent.location.hash!==next)parent.location.hash=next;
            return;
          }
          if(parent.LanlanBgm){parent.LanlanBgm.open(href);return;}
        }catch(error){}
        parent.postMessage(toIndex?{type:'lanlan-nav',hash:hash}:{type:'lanlan-open',href:href},location.origin);
      },0);
    },true);
    return;
  }

  const STARTED='lanlan-bgm-started',TIME='lanlan-bgm-time';
  const audio=new Audio(new URL('lala-land-bgm.m4a',document.currentScript.src).href);
  audio.loop=true;audio.preload='auto';
  let started=sessionStorage.getItem(STARTED)==='1';
  let volume=Math.min(100,Math.max(0,Number(localStorage.getItem('lanlan-bgm-volume')??70)));
  if(!Number.isFinite(volume))volume=70;
  let muted=localStorage.getItem('lanlan-bgm-muted')==='1';
  let seekApplied=false,armed=false;

  function paint(){
    const toggle=document.getElementById('soundToggle'),slider=document.getElementById('soundVolume');
    if(!toggle||!slider)return;
    const audible=!muted&&volume>0;
    toggle.setAttribute('aria-pressed',String(audible));
    toggle.setAttribute('aria-label',audible?'关闭声音':'打开声音');
    slider.value=String(volume);
    slider.setAttribute('aria-valuenow',String(volume));
    audio.volume=audible?volume/100:0;
  }
  function remember(){
    if(!seekApplied||!started)return;
    sessionStorage.setItem(TIME,String(audio.currentTime||0));
  }
  function applySeek(){
    if(seekApplied)return;
    const saved=Number(sessionStorage.getItem(TIME)||0);
    if(saved>0.4&&Number.isFinite(audio.duration)&&audio.duration>0){
      audio.currentTime=Math.min(saved,Math.max(0,audio.duration-0.25));
    }
    seekApplied=true;
  }
  function arm(){
    if(armed)return;
    armed=true;
    const kick=()=>{document.removeEventListener('pointerdown',kick,true);sync();};
    document.addEventListener('pointerdown',kick,true);
  }
  function sync(){
    paint();
    if(window.lanlanPlaceSound)window.lanlanPlaceSound();
    if(!started||muted||volume<=0){if(started)audio.pause();return;}
    const go=()=>{const playing=audio.play();if(playing)playing.catch(arm);};
    if(!seekApplied){
      const kick=()=>{applySeek();go();};
      if(audio.readyState>=1)kick();
      else audio.addEventListener('loadedmetadata',kick,{once:true});
      return;
    }
    if(audio.paused)go();
  }
  function begin(){started=true;sessionStorage.setItem(STARTED,'1');sync();}
  function bind(){
    const toggle=document.getElementById('soundToggle'),slider=document.getElementById('soundVolume');
    if(!toggle||toggle.dataset.bound)return;
    toggle.dataset.bound='1';
    toggle.addEventListener('click',()=>{muted=!muted;localStorage.setItem('lanlan-bgm-muted',muted?'1':'0');sync();});
    slider.addEventListener('input',()=>{volume=Number(slider.value);if(volume>0)muted=false;localStorage.setItem('lanlan-bgm-volume',String(volume));localStorage.setItem('lanlan-bgm-muted',muted?'1':'0');sync();});
  }
  function ensureControl(){
    if(document.getElementById('soundToggle')){bind();return;}
    if(document.getElementById('lanlan-bgm-style'))return;
    const style=document.createElement('style');
    style.id='lanlan-bgm-style';
    style.textContent='.land-sound{display:flex;align-items:center;gap:2px;border:1px solid #fff9;background:#f3f8ffdc;border-radius:30px;padding:2px 10px 2px 2px}.land-sound button{border:0;background:transparent;box-shadow:none;border-radius:30px;padding:7px 8px;line-height:0;color:#456b8e;cursor:pointer}.land-sound button[aria-pressed=true]{background:#6e9ce9;color:#fff}.land-sound svg{display:block;width:14px;height:14px}.land-sound .sound-off{display:none}.land-sound button[aria-pressed=false] .sound-on{display:none}.land-sound button[aria-pressed=false] .sound-off{display:block}.land-sound input{width:68px;height:18px;margin:0;accent-color:#6e9ce9;cursor:pointer}.land-sound.is-floating{position:fixed;top:22px;right:3%;z-index:80;box-shadow:0 8px 22px #283c5a22}';
    document.head.appendChild(style);
    const dock=document.createElement('div');
    dock.className='land-sound is-floating';
    dock.innerHTML='<button type="button" id="soundToggle" aria-pressed="true" aria-label="关闭声音"><svg class="sound-on" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5v5h3.2L12 18.6V5.4L7.2 9.5H4z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M15.2 9.2a3.6 3.6 0 0 1 0 5.6M17.6 7a6.2 6.2 0 0 1 0 10"/></svg><svg class="sound-off" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9.5v5h3.2L12 18.6V5.4L7.2 9.5H4z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M16 10l4 4M20 10l-4 4"/></svg></button><input id="soundVolume" type="range" min="0" max="100" value="70" aria-label="音量">';
    document.body.appendChild(dock);
    bind();
  }
  function closeStage(){
    const stage=document.getElementById('lanlanStage');
    if(stage)stage.remove();
    if(window.lanlanPlaceSound)window.lanlanPlaceSound();
  }
  function rememberChime(){
    if(location.hash!=='#system')return;
    sessionStorage.setItem('lanlan-case-origin','thought');
    if(!sessionStorage.getItem('lanlan-thought-return'))sessionStorage.setItem('lanlan-thought-return',JSON.stringify({mode:'detail'}));
  }
  function openStage(href){
    rememberChime();
    let stage=document.getElementById('lanlanStage');
    if(!stage){
      stage=document.createElement('div');
      stage.id='lanlanStage';
      stage.style.cssText='position:fixed;inset:0;z-index:60;background:#f7f4ee';
      const frame=document.createElement('iframe');
      frame.title='页面';
      frame.style.cssText='width:100%;height:100%;border:0;background:#fff';
      stage.appendChild(frame);
      document.body.appendChild(stage);
    }
    const fresh=href+(href.indexOf('?')===-1?'?':'&')+'stay=2';
    if(stage.firstElementChild.src!==new URL(fresh,location.href).href)stage.firstElementChild.src=fresh;
    if(window.lanlanPlaceSound)window.lanlanPlaceSound();
  }
  audio.addEventListener('timeupdate',remember);
  addEventListener('pagehide',remember);
  window.LanlanBgm={begin:begin,sync:sync,started:()=>started,open:openStage,close:closeStage,current:()=>audio.currentTime,paused:()=>audio.paused};
  ensureControl();
  paint();
  if(started)sync();

  if(!shell)return;
  addEventListener('message',function(event){
    if(event.origin!==location.origin||!event.data)return;
    if(event.data.type==='lanlan-nav'){
      closeStage();
      const next='#'+(event.data.hash||'home');
      if(location.hash!==next)location.hash=next;
    }else if(event.data.type==='lanlan-open'&&event.data.href){
      openStage(event.data.href);
    }
  });
  document.addEventListener('click',function(event){
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const link=event.target.closest('a[href]');
    if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
    let url;
    try{url=new URL(link.href,location.href);}catch(error){return;}
    if(url.origin!==location.origin||!url.pathname.endsWith('.html'))return;
    if(url.pathname===location.pathname)return;
    event.preventDefault();
    if(/\/index\.html$/.test(url.pathname)&&url.pathname.indexOf('/works/')===-1){
      closeStage();
      const next=url.hash||'#home';
      if(location.hash!==next)location.hash=next;
    }else openStage(url.pathname+url.search+url.hash);
  },true);
  const homeLink=document.getElementById('islandReturn');
  if(homeLink)homeLink.addEventListener('click',function(){closeStage();});
  addEventListener('hashchange',closeStage);
})();
