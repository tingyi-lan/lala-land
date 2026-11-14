/* 笺读设计预览：共用原读本与圈点数据，视图偏好独立保存。 */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const load = (key, fallback) => { try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;} };
  const save = (key, value) => {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{window.Jiandu?.toast('浏览器存储空间不足，请先导出札记。');return false;}};
  const paths = {
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    bookmark:'<path d="M6 4h12v17l-6-4-6 4Z"/>',
    notebook:'<path d="M7 3h13v18H7ZM4 7h5M4 12h5M4 17h5M11 7h5M11 11h5"/>',
    library:'<path d="M4 4v16M8 4v16M12 4v16M16 4l5 15"/>',
    upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6"/>',
    focus:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    feather:'<path d="M4 21 16 9M8 17l-1-5 6-7c6-5 11 0 6 6l-7 6Z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
  };
  $$('[data-icon]').forEach(el=>el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[el.dataset.icon]||''}</svg>`);
  const names = {lyceum:'吕克昂 · 校读',aegean:'爱琴 · 页边',theatre:'剧场 · 夜读'};
  const greek = {fanli:'EDITORIAL NOTES',daodu:'PROLEGOMENA',persons:'DRAMATIS PERSONAE',prologue:'PROLOGOS',parodos:'PARODOS',ep1:'EPEISODION I',stas1:'STASIMON I',ep2:'EPEISODION II',stas2:'STASIMON II',ep3:'EPEISODION III',stas3:'STASIMON III',ep4:'KASSANDRA',murder:'THE CRY WITHIN',kommos:'KOMMOS',exodos:'EXODOS',works:'BIBLIOGRAPHIA'};
  let currentBlock = null;
  let showAll = false;
  let resizeObserver;
  let updatePending = false;
  const prefs=load('jiandu.preview.design.v1',{design:'lyceum',lines:true,loose:false});
  const requested=new URLSearchParams(location.search).get('design');
  if(names[requested]) prefs.design=requested;
  function setDesign(name){
    if(!names[name])name='lyceum';
    prefs.design=name;document.body.dataset.design=name;
    $$('[data-design-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.designChoice===name)));
    save('jiandu.preview.design.v1',prefs);
    requestAnimationFrame(()=>window.Jiandu?.drawAllInk());
  }
  setDesign(prefs.design);
  document.body.classList.toggle('hide-lines',!prefs.lines);
  document.body.classList.toggle('loose-lines',prefs.loose);
  $('#show-lines').checked=prefs.lines;$('#loose-lines').checked=prefs.loose;
  const state = () => window.Jiandu?.state;
  const section = () => state()?.book?.sections.find(s=>s.id===state().sectionId);
  const allBlocks = () => state().book.sections.flatMap(s=>s.blocks.map(b=>({s,b})));
  const noteKey = () => 'jiandu.journal.v1.'+state().book.id;
  const bookmarks = () => load('jiandu.bookmarks.v1',[]);
  function modal(id){document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('#'+id).showModal();}
  function closePanels(){document.body.classList.remove('side-on','dock-on');}
  function updateChrome(){
    const S=state();if(!S?.book)return;
    const sec=section(), b=S.book;
    $('#side-title').textContent=b.title;$('#side-original').textContent=b.titleOriginal||'';$('#side-author').textContent=b.author;
    $('.plate-greek').textContent=b.authorOriginal||'CLASSICAL LIBRARY';
    $('#edition-caption').textContent=b.id==='agamemnon'?'希腊文 · Smyth 1926\n中文 · 笺读台译本':(b.cite||b.edition);
    $('#section-count').textContent=String(b.sections.length).padStart(2,'0');
    $('#toc').innerHTML=b.sections.map((s,i)=>`<button data-sec="${esc(s.id)}" class="${s.id===S.sectionId?'on':''}" ${s.id===S.sectionId?'aria-current="location"':''}><span class="toc-index">${String(i+1).padStart(2,'0')}</span><span>${esc(s.title)}</span><small>${esc(s.loc||'')}</small></button>`).join('');
    $('#crumb-book').textContent=b.series||b.title;$('#crumb-section').textContent=sec.title;
    $('#chapter-title').textContent=sec.title;$('#chapter-kicker').textContent=greek[sec.id]||'CLASSICAL READING';
    $('#chapter-subtitle').textContent=sec.head||`${b.author}《${b.title}》 · ${sec.kind==='drama'?'依人物与场景展开对读':'文本与注疏'}`;
    $('#reading-range').textContent=sec.loc?`${sec.loc} 行`:`${sec.blocks.length} 段`;
    const notes=sec.blocks.flatMap(b=>b.notes||[]);
    $('#reading-count').textContent=`${new Set(notes.map(n=>n.id)).size} 则疏证`;
    $('#source-label').innerHTML=`原文 <small>${b.id==='agamemnon'?'Ἑλληνική':'English'}</small>`;
    $('.column-labels>span:nth-child(2)').innerHTML=`译文 <small>${b.id==='agamemnon'?'中文 · 笺读台译本':'中文 · DeepL 辅助译文'}</small>`;
    $('#line-open').disabled=!b.sections.some(s=>s.blocks.some(b=>b.lines?.length));
    $('#line-open').title=$('#line-open').disabled?'当前读本没有通行行号':'按底本诗行编号定位';
    $('#note-total').textContent=`${Object.keys(S.notes||{}).length} 则疏证`;
    const pos=b.sections.findIndex(s=>s.id===sec.id);
    $('#chapter-position').textContent=`${pos+1} / ${b.sections.length}`;
    $('#prev-section').disabled=pos===0;$('#next-section').disabled=pos===b.sections.length-1;
    $('#font-value').textContent=S.font;
    updateCounts();
  }
  function updateCounts(){
    const S=state();if(!S?.book)return;
    const bs=bookmarks().filter(x=>x.bookId===S.book.id);
    const pinned=bs.some(x=>x.sectionId===S.sectionId);
    $('#pin-section').setAttribute('aria-pressed',String(pinned));$('#pin-section').title=pinned?'取消本节书签':'收藏本节';
    $('#pin-section').setAttribute('aria-label',pinned?'取消本节书签':'收藏本节');
    $('#bookmark-count').textContent=bs.length;
    $('#notebook-count').textContent=load(noteKey(),[]).length+S.ann.highlights.filter(h=>h.note?.trim()).length;
  }
  function ready(e){
    updateChrome();
    currentBlock=e.detail?.blockId||section().blocks.find(b=>b.trans)?.id||null;
    document.querySelectorAll('#paper .block').forEach(el=>el.classList.toggle('is-current',el.dataset.block===currentBlock));
    updateNotes();
    resizeObserver?.disconnect();
    resizeObserver=new ResizeObserver(()=>window.Jiandu.drawAllInk());
    const sec=$('#paper .section');if(sec)resizeObserver.observe(sec);
    $('#note-anchor').textContent=`${state().book.title} · ${section().title}`;
    requestAnimationFrame(trackBlock);
  }
  function updateNotes(){
    const S=state();if(!S?.book)return;
    const sec=section();const block=sec.blocks.find(b=>b.id===currentBlock);
    // 没有段内疏证时展示本节疏证，避免读到无注段落时变成空面板。
    const local=block?.notes?.length?block.notes:sec.blocks.flatMap(b=>b.notes||[]);
    const allowed=new Set(local.map(n=>n.id));
    $$('#dock-body .note').forEach(el=>el.classList.toggle('scope-hidden',!showAll&&!allowed.has(el.id.replace(/^note-/,''))));
    $('#note-context-text').textContent=showAll?'全书疏证':block?.notes?.length?`随读 · ${block.loc||sec.title}`:`本节 · ${sec.title}`;
    $('#note-scope').textContent=showAll?'随读':'全部';$('#note-scope').setAttribute('aria-pressed',String(showAll));
    $('#note-scope').hidden=S.tab!=='notes';
    const old=$('#scope-empty');if(old)old.remove();
    if(S.tab==='notes'&&!showAll&&!allowed.size){const p=document.createElement('p');p.id='scope-empty';p.className='empty';p.textContent='本段暂无疏证。可以查看全书疏证，或写下自己的札记。';$('#dock-body').append(p);}
    $('#current-locus').textContent=`${sec.title}${block?.loc?' · '+block.loc+' 行':''}`;
  }
  function trackBlock(){
    updatePending=false;
    const scroller=$('#scroll');const top=scroller.getBoundingClientRect().top+110;
    const blocks=$$('#paper .block');if(!blocks.length)return;
    let pick=blocks[0];for(const b of blocks){if(b.getBoundingClientRect().top<=top)pick=b;else break;}
    if(currentBlock!==pick.dataset.block){currentBlock=pick.dataset.block;blocks.forEach(b=>b.classList.toggle('is-current',b===pick));updateNotes();}
  }
  $('#scroll').addEventListener('scroll',()=>{if(!updatePending){updatePending=true;requestAnimationFrame(trackBlock);}}, {passive:true});
  document.addEventListener('jiandu:chrome',updateChrome);
  document.addEventListener('jiandu:ready',ready);
  new MutationObserver(mutations=>{
    if(mutations.every(m=>[...m.addedNodes,...m.removedNodes].every(n=>n.id==='scope-empty')))return;
    updateNotes();updateCounts();
  }).observe($('#dock-body'),{childList:true});
  document.addEventListener('click',e=>{
    const choice=e.target.closest('[data-design-choice]');if(choice)setDesign(choice.dataset.designChoice);
    if(e.target.closest('[data-dialog-close]'))e.target.closest('dialog').close();
    if(e.target.closest('[data-close-panels]'))closePanels();
    const fn=e.target.closest('.fn');if(fn){showAll=true;updateNotes();}
    const h=e.target.closest('#paper .block');if(h&&state().tool==='select'){currentBlock=h.dataset.block;updateNotes();}
  });
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  $('#about-open').onclick=()=>modal('about-dialog');
  $('#settings-open').onclick=()=>{updateChrome();modal('settings-dialog');};
  $('#focus-toggle').onclick=()=>{const on=document.body.classList.toggle('focus-mode');$('#focus-toggle').setAttribute('aria-pressed',String(on));window.Jiandu.drawAllInk();};
  $('#show-lines').onchange=e=>{prefs.lines=e.target.checked;document.body.classList.toggle('hide-lines',!prefs.lines);save('jiandu.preview.design.v1',prefs);window.Jiandu.drawAllInk();};
  $('#loose-lines').onchange=e=>{prefs.loose=e.target.checked;document.body.classList.toggle('loose-lines',prefs.loose);save('jiandu.preview.design.v1',prefs);window.Jiandu.drawAllInk();};
  $('#prev-section').onclick=()=>window.Jiandu.moveSec(-1);$('#next-section').onclick=()=>window.Jiandu.moveSec(1);
  $('#note-scope').onclick=()=>{showAll=!showAll;updateNotes();};
  $('#library-open').onclick=()=>{
    $('#library-list').innerHTML=state().books.map(b=>`<button class="book-option ${b.id===state().book.id?'on':''}" data-choice-book="${esc(b.id)}"><strong>${esc(b.title)}</strong><small>${esc(b.author)} · ${esc(b.cite||b.edition||'自备读本')}</small></button>`).join('');modal('library-dialog');
  };
  $('#library-list').onclick=e=>{const b=e.target.closest('[data-choice-book]');if(b){$('#library-dialog').close();window.Jiandu.openBook(b.dataset.choiceBook);}};
  $('#line-open').onclick=()=>{$('#line-feedback').textContent='';$('#line-input').value='';modal('line-dialog');$('#line-input').focus();};
  $('#line-form').onsubmit=e=>{
    e.preventDefault();const n=Number($('#line-input').value);const hit=allBlocks().find(({b})=>b.lines?.some(l=>l.n===n));
    if(!hit){$('#line-feedback').textContent='当前读本中未找到这一行，请检查行号。';return;}
    $('#line-dialog').close();window.Jiandu.goSection(hit.s.id,hit.b.id);currentBlock=hit.b.id;updateNotes();
    const line=[...document.getElementById('blk-'+hit.b.id).querySelectorAll('.gl')].find(el=>Number(el.querySelector('.ln').textContent)===n);
    line?.scrollIntoView({block:'center'});window.Jiandu.toast(`已定位第 ${n} 行`);
  };
  function openSearch(){modal('search-dialog');$('#search-input').focus();runSearch();}
  $('#search-open').onclick=openSearch;
  let results=[];
  function runSearch(){
    const q=$('#search-input').value.trim();results=[];
    if(!q){$('#search-results').innerHTML='<p class="search-empty">试着查找「命运」「沉默」或 δίκη。<br>搜索范围包括本书原文、译文与疏证。</p>';return;}
    const needle=q.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();
    for(const {s,b}of allBlocks()){
      const fields=[['原文',window.Jiandu.blockPlain(b,'source')],['译文',window.Jiandu.blockPlain(b,'trans')],...(b.notes||[]).map(n=>['疏证',n.lemma+' '+n.body,n.id])];
      for(const [type,text,noteId]of fields){const hay=text.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase();const at=hay.indexOf(needle);if(at>=0)results.push({s,b,type,noteId,text,at});}
    }
    const shown=results.slice(0,100);
    $('#search-results').innerHTML=shown.length?`<p class="search-hint">${results.length} 处匹配${results.length>100?' · 显示前 100 处':''}</p>`+shown.map((r,i)=>`<button class="search-result" data-result="${i}"><small>${esc(r.s.title)} · ${esc(r.b.loc||'')} ${esc(r.type)}</small><p>${esc(r.text.slice(Math.max(0,r.at-25),r.at+100))}</p></button>`).join(''):'<p class="search-empty">没有找到。可以缩短词语，或尝试另一种译名。</p>';
  }
  $('#search-input').oninput=runSearch;
  $('#search-results').onclick=e=>{
    const button=e.target.closest('[data-result]');if(!button)return;const r=results[Number(button.dataset.result)];
    $('#search-dialog').close();window.Jiandu.goSection(r.s.id,r.b.id);currentBlock=r.b.id;
    if(r.noteId){state().tab='notes';state().activeNote=r.noteId;showAll=true;window.Jiandu.renderDock();document.body.classList.remove('dock-off');if(matchMedia('(max-width:1100px)').matches)document.body.classList.add('dock-on');}
    updateNotes();window.Jiandu.toast(`已定位：${r.s.title} ${r.b.loc||''}`);
  };
  document.addEventListener('keydown',e=>{
    const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if((e.metaKey||e.ctrlKey)&&['k','f'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();openSearch();}
    if(e.key==='Escape'){closePanels();if(document.body.classList.contains('focus-mode'))$('#focus-toggle').click();}
    if(e.altKey&&!typing&&['1','2','3'].includes(e.key)){e.preventDefault();setDesign(['lyceum','aegean','theatre'][Number(e.key)-1]);}
  },true);
  $('#pin-section').onclick=()=>{
    const S=state();const bs=bookmarks();const i=bs.findIndex(b=>b.bookId===S.book.id&&b.sectionId===S.sectionId);
    if(i>=0)bs.splice(i,1);else bs.push({bookId:S.book.id,sectionId:S.sectionId,title:S.book.title,sectionTitle:section().title,created:Date.now()});
    if(save('jiandu.bookmarks.v1',bs)){updateCounts();window.Jiandu.toast(i>=0?'已取消书签':'已收藏本节');}
  };
  $('#bookmarks-open').onclick=()=>{
    const bs=bookmarks().filter(b=>b.bookId===state().book.id);
    $('#bookmark-list').innerHTML=bs.length?bs.map(b=>`<button class="book-option" data-bookmark="${esc(b.sectionId)}"><strong>${esc(b.sectionTitle)}</strong><small>${esc(b.title)}</small></button>`).join(''):'<p class="empty">还没有书签。点击篇章标题旁的书签图标，留住想再读的地方。</p>';modal('bookmarks-dialog');
  };
  $('#bookmark-list').onclick=e=>{const b=e.target.closest('[data-bookmark]');if(b){$('#bookmarks-dialog').close();window.Jiandu.goSection(b.dataset.bookmark);}};
  function renderJournal(){
    const S=state();const notes=load(noteKey(),[]);
    const hs=S.ann.highlights.filter(h=>h.note?.trim()).map(h=>({...h,sectionId:S.book.sections.find(s=>s.blocks.some(b=>b.id===h.blockId))?.id,body:h.note,kind:'眉批'}));
    const entries=[...notes,...hs].sort((a,b)=>b.created-a.created);
    $('#notebook-list').innerHTML=entries.length?entries.map(n=>{const sec=S.book.sections.find(s=>s.id===n.sectionId);return `<article class="journal-item"><small>${esc(n.kind||'札记')} · ${esc(sec?.title||'待重新定位')} · ${new Date(n.created).toLocaleDateString('zh-CN')}</small>${n.quote?`<blockquote>${esc(n.quote)}</blockquote>`:''}<p>${esc(n.body)}</p>${sec?`<button data-note-sec="${esc(sec.id)}" data-note-block="${esc(n.blockId||'')}">回到正文 ↗</button>`:''}</article>`;}).join(''):'<p class="empty">还没有札记。读到一个值得追问的词，就从这里开始。</p>';
    $('#note-anchor').textContent=`${S.book.title} · ${section().title}${currentBlock?' · '+(section().blocks.find(b=>b.id===currentBlock)?.loc||''):''}`;updateCounts();
  }
  function openJournal(){renderJournal();modal('notebook-dialog');}
  $('#notebook-open').onclick=openJournal;$('#add-note').onclick=()=>{openJournal();$('#new-note').focus();};
  $('#save-note').onclick=()=>{
    const body=$('#new-note').value.trim();if(!body){$('#new-note').focus();return;}
    const notes=load(noteKey(),[]);notes.push({id:crypto.randomUUID?.()||String(Date.now()),body,sectionId:state().sectionId,blockId:currentBlock,created:Date.now()});
    if(save(noteKey(),notes)){$('#new-note').value='';renderJournal();window.Jiandu.toast('札记已保存');}
  };
  $('#notebook-list').onclick=e=>{const b=e.target.closest('[data-note-sec]');if(b){$('#notebook-dialog').close();window.Jiandu.goSection(b.dataset.noteSec,b.dataset.noteBlock||undefined);}};
  $('#dock-body').addEventListener('input',()=>queueMicrotask(updateCounts));
  $('#export-markdown').onclick=()=>{
    const S=state();let text=`# ${S.book.title} · 研究札记\n\n底本：${S.book.edition||''}\n\n`;
    for(const n of load(noteKey(),[])){const sec=S.book.sections.find(s=>s.id===n.sectionId),block=sec?.blocks.find(b=>b.id===n.blockId);text+=`## ${sec?.title||'未定位'} ${block?.loc||''}\n\n${n.body}\n\n`;}
    for(const h of S.ann.highlights){const hit=allBlocks().find(x=>x.b.id===h.blockId);text+=`## 圈点 · ${hit?.s.title||''} ${hit?.b.loc||''}\n\n> ${h.quote.replace(/\n/g,'\n> ')}\n\n${h.note||''}\n\n`;}
    const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=S.book.title+'-研究札记.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);window.Jiandu.toast('已导出研究札记');
  };
})();
