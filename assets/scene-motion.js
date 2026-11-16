(() => {
  'use strict';
  const scriptURL = document.currentScript.src;
  const asset = path => new URL(path, scriptURL).href;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const EASE = 'cubic-bezier(.23,1,.32,1)';
  const TRAVEL = 'cubic-bezier(.77,0,.175,1)';
  const shell = !!document.getElementById('page-home') && parent === window;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const themes = {
    home: ['sea', '#a3c4ea', 'lala-island-interior.png', '回到岛上的风景'],
    system: ['sea', '#277db8', 'thought-walk/oil-sea.png', '从一片蓝色的海出发'],
    works: ['sea', '#94b9d1', 'lala-island-interior.png', '把好奇，变成作品'],
    literature: ['paper', '#f7f4ee', 'literary-workbench-folio.png', '走进文字里的世界'],
    tea: ['paper', '#efe9d9', 'tea-road-book.png', '沿着茶路，走进故事'],
    ai: ['sea', '#a6c4da', 'ai-lover/image3.png', '让陪伴，有真实的回应'],
    travel: ['sea', '#a7cad5', 'kyoto-story-map.png', '出发总是美丽的']
  };
  function themeFor(href = '') {
    const key = /tea-road/.test(href) ? 'tea' : /ai-lover/.test(href) ? 'ai' : /literature|literary/.test(href) ? 'literature' : /thought|system/.test(href) ? 'system' : /travel|kyoto|beijing/.test(href) ? 'travel' : /works/.test(href) ? 'works' : 'home';
    return themes[key];
  }
  let keyboard = false;
  let current = null;
  let origin = null;
  let stageHref = '';
  let stageSource = null;
  let desired = '';
  const scrollPositions = new Map();
  const tabOrigins = new Map();
  addEventListener('keydown', event => { if (!event.metaKey && !event.ctrlKey && !event.altKey) keyboard = true; }, true);
  addEventListener('pointerdown', () => { keyboard = false; }, true);

  // Convert an iframe-local trigger to viewport coordinates, retaining its focus target.
  function anchor(element, includeImage = true) {
    if (!element?.getBoundingClientRect) return element || null;
    const rect = element.getBoundingClientRect();
    let x = rect.left, y = rect.top, w = rect.width, h = rect.height;
    let view = element.ownerDocument.defaultView;
    const fromKeyboard = view.SceneMotion?.keyboard ?? keyboard;
    while (view !== window && view.frameElement) {
      const frameRect = view.frameElement.getBoundingClientRect();
      const sx = frameRect.width / view.innerWidth, sy = frameRect.height / view.innerHeight;
      x = frameRect.left + x * sx; y = frameRect.top + y * sy; w *= sx; h *= sy;
      view = view.parent;
    }
    const picture = includeImage && (element.matches('img') ? element : element.querySelector('img') || element.closest('.detail-content, article')?.querySelector('img'));
    return { x, y, w, h, element, keyboard: fromKeyboard,
      image: picture?.complete && picture.naturalWidth ? { src: picture.currentSrc || picture.src, ...anchor(picture, false) } : null };
  }
  function play(owner, element, frames, duration, easing = EASE, delay = 0) {
    const animation = element.animate(frames, { duration, easing, delay, fill: 'both' });
    owner.animations.push(animation);
    return animation.finished.catch(() => {});
  }
  function cancel() {
    if (!current) return;
    current.abort.abort();
    current.animations.forEach(animation => animation.cancel());
    current.layer?.remove();
    current.shared?.remove();
    current.cleanup?.();
    current = null;
  }
  function makePortal(href) {
    const [kind, color, picture, title] = themeFor(href);
    const layer = document.createElement('div');
    layer.className = 'scene-portal'; layer.dataset.kind = kind;
    layer.setAttribute('aria-hidden', 'true'); layer.style.background = color;
    const image = new Image(); image.className = 'scene-portal-image'; image.alt = ''; image.src = asset(picture);
    const light = document.createElement('div'); light.className = 'scene-portal-light';
    const caption = document.createElement('p'); caption.className = 'scene-portal-caption'; caption.textContent = title;
    layer.append(image, light, caption); document.body.append(layer);
    return { layer, image, caption, kind };
  }
  async function transition({ href, source, back = false, prepare, commit, cleanup }) {
    cancel();
    const run = { animations: [], abort: new AbortController(), cleanup };
    current = run;
    const point = anchor(source);
    const gentle = reduced.matches || (point ? point.keyboard : keyboard);
    const x = clamp(point ? point.x + point.w / 2 : innerWidth / 2, 0, innerWidth);
    const y = clamp(point ? point.y + point.h / 2 : innerHeight / 2, 0, innerHeight);
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const small = `circle(${Math.max(24, Math.min(point?.w || 80, point?.h || 80) / 2)}px at ${x}px ${y}px)`;
    const full = `circle(${radius}px at ${x}px ${y}px)`;
    const portal = makePortal(href);
    run.layer = portal.layer;
    let sharedFrom;
    if (!back && !gentle && point?.image?.w > 50) {
      const picture = point.image;
      const shared = new Image(); shared.className = 'scene-shared-image'; shared.src = picture.src; shared.alt = '';
      shared.setAttribute('aria-hidden', 'true');
      shared.style.cssText = `left:${picture.x}px;top:${picture.y}px;width:${picture.w}px;height:${picture.h}px`;
      document.body.append(shared); run.shared = shared;
      const scale = Math.min(innerWidth / picture.w, innerHeight / picture.h) * .86;
      sharedFrom = `translate(${innerWidth/2-picture.x-picture.w/2}px,${innerHeight/2-picture.y-picture.h/2}px) scale(${scale})`;
      portal.image.style.opacity = '.15';
      play(run, shared, [{ transform: 'none' }, { transform: sharedFrom }], 520, TRAVEL);
    }
    const paper = portal.kind === 'paper';
    const closed = paper ? `inset(${y}px ${innerWidth-x}px ${innerHeight-y}px ${x}px)` : small;
    const open = paper ? 'inset(0px 0px 0px 0px)' : full;
    try {
      // Preload concurrently with departure; never guess readiness using a fixed animation timer.
      const ready = prepare ? prepare(run.abort.signal) : Promise.resolve();
      const cover = play(run, portal.layer, gentle || back
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ clipPath: closed }, { clipPath: open }], gentle ? 100 : back ? 180 : 520, TRAVEL);
      if (!gentle) {
        play(run, portal.image, [{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }], 800, TRAVEL);
        play(run, portal.caption, [{ opacity: 0 }, { opacity: 1 }], 260, EASE, 160);
      } else portal.caption.hidden = true;
      await Promise.all([ready, cover]);
      if (current !== run) return;
      commit();
      activate();
      const soft = gentle || reduced.matches;
      if (soft) run.shared?.remove();
      if (run.shared && !soft) {
        const nextFrame = document.querySelector('#lanlanStage > iframe, .tab-page.active iframe');
        const nextDocument = nextFrame?.contentDocument || document;
        const target = [...nextDocument.images].find(image => (image.currentSrc || image.src) === point.image.src && image.getBoundingClientRect().width > 0);
        const end = target ? anchor(target, false) : null;
        const picture = point.image;
        const landsInView = end && end.y < innerHeight && end.y + end.h > 0;
        const transform = landsInView
          ? `translate(${end.x+end.w/2-picture.x-picture.w/2}px,${end.y+end.h/2-picture.y-picture.h/2}px) scale(${end.w/picture.w},${end.h/picture.h})`
          : `${sharedFrom} scale(1.08)`;
        play(run, run.shared, [{ transform: sharedFrom, opacity: 1 }, { transform, opacity: 0 }], 420, EASE);
      }
      if (back && !soft) {
        await play(run, portal.layer, [{ clipPath: open, opacity: 1 }, { clipPath: closed, opacity: 0 }], 480, TRAVEL);
      } else {
        await play(run, portal.layer, soft ? [{ opacity: 1 }, { opacity: 0 }]
          : [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.12)' }], soft ? 120 : 420);
      }
    } catch (error) {
      if (current === run && error.name !== 'AbortError') {
        console.warn('Scene transition: keeping the current page available.', error.message);
        if (shell) history.replaceState({ ...history.state, lanlanScene: { tab: activeTab(), href: stageHref } }, '', `#${activeTab()}`);
        const notice = document.createElement('div'); notice.className = 'scene-load-note'; notice.setAttribute('role', 'status');
        notice.textContent = '页面还没有准备好，可以再点一次入口。'; document.body.append(notice);
        setTimeout(() => notice.remove(), 5000);
      }
    } finally {
      if (current === run) cancel();
      else { run.layer?.remove(); run.shared?.remove(); cleanup?.(); }
    }
  }
  function loadFrame(frame, href, signal) {
    return new Promise((resolve, reject) => {
      let timer;
      const finish = error => {
        clearTimeout(timer); frame.removeEventListener('load', loaded);
        signal?.removeEventListener('abort', aborted);
        error ? reject(error) : resolve();
      };
      const loaded = () => finish();
      const aborted = () => finish(new DOMException('Cancelled', 'AbortError'));
      frame.addEventListener('load', loaded, { once: true });
      signal?.addEventListener('abort', aborted, { once: true });
      // A slow image must not strand the visitor behind a transition.
      timer = setTimeout(() => {
        if (frame.contentDocument?.body?.children.length) loaded();
        else finish(new Error('The next page did not become ready.'));
      }, 4500);
      if (frame.getAttribute('src') !== href) frame.src = href;
      else if (frame.contentDocument?.readyState === 'complete') loaded();
    });
  }
  function activeTab() { return document.querySelector('.tab-page.active')?.id.replace('page-', '') || 'home'; }
  function setHistory(tab, href = '') {
    history.pushState({ ...history.state, lanlanScene: { tab, href } }, '', `#${tab}`);
  }
  function refreshFrame(frame, source) {
    const child = frame.contentWindow;
    frame.contentDocument?.documentElement.classList.add('scene-embedded-case');
    child.SceneMotion?.activate();
    // Return is to the actual entry, including the precise wind-chime / bookcase position.
    const label = origin?.tab === 'system' ? '← 返回原野中的故事' : origin?.tab === 'home' ? '← 返回岛上的唱片' : '← 返回火花工坊';
    frame.contentDocument?.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.href);
      if (url.pathname === new URL('index.html', asset('../')).pathname && /返回|←/.test(link.textContent)) {
        link.textContent = label;
        link.href = new URL(`index.html#${origin?.tab || 'home'}`, asset('../')).href;
        link.dataset.sceneReturn = '';
      }
    });
    const heading = frame.contentDocument?.querySelector('h1, .ai-hero h2');
    if (heading) { heading.tabIndex = -1; heading.dataset.sceneFocus = ''; heading.focus({ preventScroll: true }); }
  }
  function openStage(href, source, push = true) {
    const url = new URL(href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
    href = url.pathname + url.search + url.hash;
    if (desired === href || (stageHref === href && !current)) return;
    desired = href;
    const tab = activeTab();
    if (!document.getElementById('lanlanStage')) origin = { tab, source: anchor(source), scroll: scrollY };
    if (push) setHistory(tab, href);
    const stage = document.createElement('div'); stage.className = 'scene-stage'; stage.dataset.motionStaged = '';
    const frame = document.createElement('iframe'); frame.dataset.motionStaged = ''; frame.title = themeFor(href)[3];
    const close = document.createElement('button'); close.type = 'button'; close.className = 'scene-stage-close';
    close.textContent = '×'; close.setAttribute('aria-label', '返回进入前的场景');
    close.addEventListener('click', () => returnToOrigin());
    stage.append(frame, close); document.body.append(stage);
    let committed = false;
    transition({ href, source,
      prepare: signal => loadFrame(frame, href, signal),
      commit: () => {
        document.getElementById('lanlanStage')?.remove();
        stage.id = 'lanlanStage'; delete stage.dataset.motionStaged; delete frame.dataset.motionStaged;
        stageHref = href; stageSource = anchor(source); committed = true;
        document.querySelectorAll('.tab-page.active').forEach(page => { page.inert = true; });
        refreshFrame(frame, source);
        window.lanlanPlaceSound?.();
      },
      cleanup: () => { if (!committed) stage.remove(); }
    }).finally(() => { if (desired === href) desired = ''; if (!committed) stage.remove(); });
  }
  function returnToOrigin(push = true) {
    goTab(origin?.tab || activeTab(), origin?.source, { back: true, push, preserve: true });
  }
  function goTab(tab, source, { back = tab === 'home', push = true, preserve = false } = {}) {
    if (!['home', 'works', 'system', 'literature'].includes(tab)) tab = 'home';
    if (desired === `#${tab}`) return;
    const oldTab = activeTab();
    const hasStage = !!document.getElementById('lanlanStage');
    if (oldTab === tab && !hasStage && !current) return;
    desired = `#${tab}`;
    if (!back && oldTab !== tab) tabOrigins.set(tab, { tab: oldTab, source: anchor(source) });
    scrollPositions.set(oldTab, scrollY);
    if (push) setHistory(tab);
    const frame = document.getElementById(tab === 'system' ? 'canvasFrame' : tab === 'literature' ? 'literatureFrame' : '');
    transition({ href: tab, source, back,
      prepare: frame ? signal => loadFrame(frame, frame.getAttribute('src') || frame.dataset.src, signal) : null,
      commit: () => {
        document.getElementById('lanlanStage')?.remove(); stageHref = '';
        document.querySelectorAll('.tab-page').forEach(page => { page.inert = false; });
        window.lanlanSwitchTab(tab);
        if (preserve || back) scrollTo({ top: scrollPositions.get(tab) ?? (origin?.tab === tab ? origin.scroll : 0), behavior: 'instant' });
        frame?.classList.add('scene-ready'); frame?.contentWindow.SceneMotion?.activate();
        if (tab === 'literature' && tabOrigins.get(tab)?.tab === 'system') {
          const backLink = frame?.contentDocument?.querySelector('.topbar .back');
          if (backLink) { backLink.textContent = '← 返回原野的书架'; backLink.href = new URL('index.html#system', asset('../')).href; }
        }
        const target = back ? source?.element : frame?.contentDocument?.querySelector('h1') || frame || document.querySelector(`#page-${tab} h1`);
        if (target?.isConnected) { if (!target.matches('a,button')) { target.tabIndex = -1; target.dataset.sceneFocus = ''; } target.focus({ preventScroll: true }); }
        window.lanlanPlaceSound?.();
      }
    }).finally(() => { if (desired === `#${tab}`) desired = ''; });
  }
  function navigate(href, source) {
    const url = new URL(href, location.href);
    if (parent !== window) {
      try { if (parent.SceneMotion) return parent.SceneMotion.navigate(url.href, parent.SceneMotion.anchor(source?.element || source)); } catch (_) {}
    }
    if (!shell) {
      const arrival = { href: url.href, time: Date.now() };
      transition({ href: url.href, source, commit: () => {
        try { sessionStorage.setItem('lanlan-motion-arrival', JSON.stringify(arrival)); } catch (_) {}
        location.assign(url.href);
      } });
      return;
    }
    const isIndex = /\/index\.html$/.test(url.pathname) && !url.pathname.includes('/works/');
    const hashRoute = url.pathname === location.pathname && ['#home', '#works', '#system', '#literature'].includes(url.hash);
    if (isIndex || hashRoute) {
      if (document.getElementById('lanlanStage') && (source?.element || source)?.hasAttribute?.('data-scene-return')) returnToOrigin();
      else {
        const tab = url.hash.slice(1) || 'home';
        const previous = tabOrigins.get(activeTab());
        if (previous?.tab === tab) goTab(tab, previous.source, { back: true, preserve: true });
        else goTab(tab, source);
      }
    } else if (/thought-walk\.html$/.test(url.pathname)) goTab('system', source, { back: false });
    else if (/\/literature\.html$/.test(url.pathname)) goTab('literature', source, { back: false });
    else openStage(url.href, source);
  }

  // Reveal only editorial groups, never controls, data tables, or the working reader.
  const seen = new WeakSet();
  const entrances = new Set();
  let observer;
  let scrollFrame = 0;
  let depthItems = [];
  let progress;
  function reveal(element) {
    if (seen.has(element) || element.closest('[hidden]')) return;
    seen.add(element); observer?.unobserve(element);
    const role = element.dataset.motionReveal;
    const gentle = reduced.matches || keyboard;
    const frames = gentle ? [{ opacity: .4 }, { opacity: 1 }] : role === 'image'
      ? [{ clipPath: 'inset(9% 0 12% 0)', opacity: .25 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }]
      : [{ opacity: 0, transform: `translate3d(0,${role === 'title' ? 24 : 12}px,0)` }, { opacity: 1, transform: 'translate3d(0,0,0)' }];
    const animation = element.animate(frames, { duration: gentle ? 120 : role === 'image' ? 650 : role === 'title' ? 600 : 500,
      delay: gentle ? 0 : Number(element.dataset.motionDelay || 0), easing: EASE, fill: 'backwards' });
    entrances.add(animation); animation.finished.catch(() => {}).finally(() => entrances.delete(animation));
  }
  function mark(selector, role, delay = 0) {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.closest('[data-motion-reveal]')) return;
      element.dataset.motionReveal = role;
      element.dataset.motionDelay = String(Array.isArray(delay) ? delay[Math.min(index, delay.length - 1)] : delay);
      observer.observe(element);
    });
  }
  function scrollPaint() {
    scrollFrame = 0;
    if (document.hidden) return;
    const height = innerHeight;
    const reads = depthItems.map(item => ({ ...item, rect: item.container.getBoundingClientRect() }));
    const max = Math.max(1, document.documentElement.scrollHeight - height);
    if (progress) progress.style.transform = `scaleX(${clamp(scrollY / max, 0, 1)})`;
    for (const { image, rect, gateway } of reads) {
      if (reduced.matches || (mobile.matches && !gateway)) { image.style.transform = ''; continue; }
      if (rect.bottom < 0 || rect.top > height || rect.height === 0) continue;
      const p = clamp((height - rect.top) / (height + rect.height), 0, 1);
      image.style.transform = gateway
        ? mobile.matches ? `scale(${1.06-p*.04})` : `translate3d(0,${(p-.5)*28}px,0) scale(${1.16-p*.12})`
        : `translate3d(0,${(p - .5) * 20}px,0) scale(${1.065 - p * .025})`;
    }
  }
  function schedule() { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollPaint); }
  function activate() {
    if (!observer || window.frameElement?.hasAttribute('data-motion-staged')) return;
    document.querySelectorAll('[data-motion-reveal]').forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight) reveal(element);
    });
    schedule();
  }
  function initContent() {
    if (!('IntersectionObserver' in window) || document.getElementById('world')) return;
    observer = new IntersectionObserver(entries => {
      if (window.frameElement?.hasAttribute('data-motion-staged')) return;
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold: .06 });
    mark('.hero h1, .workflow-headline, .ai-hero-title h2, .archive-intro h1, .cover h1', 'title');
    mark('.hero-lede, .hero-copy .lede, .hero-line, .workflow-subtitle, .ai-hero-title h3, .archive-intro .lede, .cover .sub', 'copy', 70);
    mark('.constellation-wrap, .ai-hero-media, .archive-intro .book-cover, main > .preview', 'image', 110);
    mark('.section h2, .ai-chapter-head, .portfolio-copy h3, .research-strip h3, .closing', 'title');
    mark('.portfolio-media, .ai-gesture-grid > article, .case-card, .writing-card, .course-paths > article, .production-list > li, .workflow-col, .grid > .panel', 'copy', [0,55,90,115]);
    mark('.section-intro, .portfolio-copy .dim-desc, .ai-project-meta, .profile-copy', 'copy', 70);
    mark('.scene-next-copy', 'copy');
    document.querySelectorAll('.portfolio-media, .case-image, .scene-next').forEach(container => {
      const image = container.querySelector(':scope > img');
      if (image) { container.classList.add('motion-media'); depthItems.push({ container, image, gateway: container.classList.contains('scene-next') }); }
    });
    if (!shell && !document.getElementById('reader')) {
      progress = document.createElement('div'); progress.className = 'motion-progress'; progress.setAttribute('aria-hidden', 'true'); document.body.append(progress);
    }
    activate();
  }
  window.SceneMotion = { navigate, goTab, openStage, returnToOrigin, transition, anchor, activate,
    get keyboard() { return keyboard; }, get busy() { return !!current; } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  reduced.addEventListener('change', () => {
    entrances.forEach(animation => animation.finish());
    if (reduced.matches) current?.animations.forEach(animation => animation.finish());
    schedule();
  });
  addEventListener('pagehide', cancel);
  addEventListener('pageshow', () => { activate(); });
  if (shell) {
    document.documentElement.classList.add('has-scene-motion');
    const startTab = activeTab();
    if (!history.state?.lanlanScene) history.replaceState({ ...history.state, lanlanScene: { tab: startTab, href: '' } }, '');
    addEventListener('popstate', () => {
      const state = history.state?.lanlanScene;
      if (state?.href) openStage(state.href, stageSource, false);
      else goTab(state?.tab || location.hash.slice(1) || 'home', origin?.source, { push: false, back: true, preserve: true });
    });
    addEventListener('hashchange', () => {
      if (desired) return;
      goTab(location.hash.slice(1) || 'home', null, { push: false });
    });
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      if (['#home','#works','#system','#literature'].includes(link.getAttribute('href'))) {
        event.preventDefault(); navigate(link.href, link);
      }
    });
    if (history.state?.lanlanScene?.href) openStage(history.state.lanlanScene.href, null, false);
  }
  // Capture navigation, then let target listeners save their narrative state first.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download') || link.hasAttribute('data-motion-skip')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith('.html') || (url.pathname === location.pathname && url.search === location.search)) return;
    event.preventDefault();
    setTimeout(() => navigate(url.href, link), 0);
  }, true);
  if (!shell && parent === window) {
    try {
      const saved = JSON.parse(sessionStorage.getItem('lanlan-motion-arrival') || 'null');
      sessionStorage.removeItem('lanlan-motion-arrival');
      if (saved && saved.href === location.href && Date.now() - saved.time < 10000) {
        const portal = makePortal(location.href);
        portal.caption.hidden = true;
        const animation = portal.layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduced.matches ? 120 : 420, easing: EASE });
        animation.finished.finally(() => portal.layer.remove());
      }
    } catch (_) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initContent, { once: true });
  else initContent();
})();
