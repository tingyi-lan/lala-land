(() => {
  const flag = document.getElementById('islandWalkFlag');
  const frame = document.getElementById('canvasFrame');
  const stage = document.getElementById('desktopSurface');
  const veil = document.getElementById('transitionOverlay');
  const systemPage = document.getElementById('page-system');
  const worksReturn = document.getElementById('worksReturn');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let entering = false;

  function revealScene() {
    if (!frame?.getAttribute('src')) return;
    if (systemPage.classList.contains('story-return')) {
      const child = frame.contentDocument;
      const detail = child?.getElementById('detail-overlay');
      const shelf = child?.getElementById('bookshelf-scene');
      if (detail?.hidden !== false && !shelf?.classList.contains('ready')) return;
    }
    frame.classList.add('scene-ready');
  }
  frame?.addEventListener('load', revealScene);
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame?.contentWindow) return;
    if (event.data?.type === 'lanlan-thought-restored') revealScene();
  });
  if (frame?.getAttribute('src') && frame.contentDocument?.readyState === 'complete') revealScene();

  flag?.addEventListener('click', () => {
    if (window.SceneMotion) {
      sessionStorage.removeItem('lanlan-thought-return');
      sessionStorage.removeItem('lanlan-case-origin');
      systemPage.classList.remove('story-return', 'shelf-return');
      window.SceneMotion.goTab('system', flag, { back: false });
      return;
    }
    if (entering) return;
    entering = true;
    flag.disabled = true;
    sessionStorage.removeItem('lanlan-thought-return');
    sessionStorage.removeItem('lanlan-case-origin');
    systemPage.classList.remove('story-return', 'shelf-return');
    frame.classList.remove('scene-ready');
    const rect = flag.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width * .5;
    const cy = rect.top + rect.height * .42;
    stage.style.setProperty('--walk-origin-x', `${cx - stageRect.left}px`);
    stage.style.setProperty('--walk-origin-y', `${cy - stageRect.top}px`);
    stage.style.setProperty('--walk-pan-x', `${innerWidth / 2 - cx}px`);
    stage.style.setProperty('--walk-pan-y', `${innerHeight / 2 - cy}px`);
    stage.style.setProperty('--walk-pan-mid-x', `${(innerWidth / 2 - cx) * .65}px`);
    stage.style.setProperty('--walk-pan-mid-y', `${(innerHeight / 2 - cy) * .65}px`);
    frame.src = `${frame.dataset.src}?visit=${Date.now()}`;
    if (reduced.matches) {
      location.hash = 'system';
      flag.disabled = false;
      entering = false;
      return;
    }
    stage.classList.add('walk-camera');
    veil.classList.add('walk-dissolve');
    setTimeout(() => { location.hash = 'system'; }, 1320);
    setTimeout(() => {
      stage.classList.remove('walk-camera');
      veil.classList.remove('walk-dissolve');
      flag.disabled = false;
      entering = false;
    }, 1800);
  });
  function updateWorksReturn() {
    const toThought = sessionStorage.getItem('lanlan-case-origin') === 'thought' && !!sessionStorage.getItem('lanlan-thought-return');
    worksReturn.href = toThought ? '#system' : '#home';
    worksReturn.textContent = toThought ? '← 返回风铃旁的故事' : '← 返回岛上的唱片';
  }
  worksReturn?.addEventListener('click', () => {
    sessionStorage.removeItem('lanlan-case-origin');
  });
  addEventListener('hashchange', updateWorksReturn);
  updateWorksReturn();
})();
