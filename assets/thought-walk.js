(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const glyphOrder = '万里茶道我走过的分之一让陪伴真有回应把想法带到这和蓝段抽张牌';
  document.querySelectorAll('[data-glyph]').forEach(line => {
    const content = line.dataset.glyph;
    line.setAttribute('aria-label', content);
    [...content].forEach((character, index) => {
      const glyph = document.createElement('span');
      glyph.className = 'glyph';
      glyph.setAttribute('aria-hidden', 'true');
      glyph.style.setProperty('--i', index);
      glyph.style.setProperty('--angle', `${(index % 5 - 2) * 2}deg`);
      glyph.style.backgroundSize = `${glyphOrder.length * 100}% 100%`;
      glyph.style.backgroundPosition = `${glyphOrder.indexOf(character) * 100 / (glyphOrder.length - 1)}% center`;
      line.append(glyph);
    });
  });
  document.querySelectorAll('.sea-title .raster-line').forEach(line => line.classList.add('active-line'));

  const holder = document.getElementById('world-holder');
  const world = document.getElementById('world');
  const spacer = document.getElementById('scroll-space');
  const seaScene = document.getElementById('sea-scene');
  const tarotScene = document.getElementById('tarot-scene');
  const bookshelfScene = document.getElementById('bookshelf-scene');
  const continueToShelf = document.getElementById('continue-to-shelf');
  const hint = document.getElementById('journey-hint');
  const progress = document.getElementById('progress-fill');
  progress.style.height = '100%';
  progress.style.transformOrigin = 'top';
  const seaPainting = document.querySelector('.sea-painting');
  const seaTitle = document.querySelector('.sea-title');
  const seaCharacter = document.querySelector('.sea-character');
  const characterOne = document.querySelector('.character-one');
  const characterTwo = document.querySelector('.character-two');
  const foregroundFlowers = [...document.querySelectorAll('.foreground-flower')];
  const shelfFrame = document.querySelector('.bookshelf-frame');
  const shelfHeading = bookshelfScene.querySelector('h2');
  const seaFlower = document.getElementById('sea-flower');
  const narrativeLines = [ ['.tea-copy',660], ['.ai-copy',2450], ['.end-copy',4300], ['.tarot-intro',5650] ]
    .map(([selector, at]) => ({ lines: [...document.querySelectorAll(`${selector} .raster-line`)], at }));
  const GATE_Y = 4880;
  const TAROT_CAP = 6266;
  const SHELF_END = 8500;
  let gateOpen = false;
  let curtainLock = false;
  let tarotComplete = false;
  let scale = 1;
  let targetY = scrollY;
  let displayY = scrollY;
  let frame = 0;
  let paused = false;
  let pointer = { x: innerWidth / 2, y: innerHeight / 2, cx: innerWidth / 2, cy: innerHeight / 2, hx: innerWidth / 2, hy: innerHeight / 2 };
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  function sizeWorld() {
    scale = Math.max(innerWidth / 2912, innerHeight / 1632);
    holder.style.width = `${2912 * scale}px`;
    holder.style.height = `${5208 * scale}px`;
    world.style.transform = `scale(${scale})`;
    spacer.style.height = `${SHELF_END * scale + innerHeight}px`;
    targetY = scrollY;
    displayY = targetY;
    schedule();
  }
  function activateSceneLines(y) {
    narrativeLines.forEach(group => group.lines.forEach(el => el.classList.toggle('active-line', y > group.at)));
  }
  function render() {
    frame = 0;
    if (document.hidden) return;
    if (!paused) {
      displayY += (targetY - displayY) * (reduced.matches ? 1 : .13);
      if (Math.abs(displayY - targetY) < .1) displayY = targetY;
      const y = displayY / scale;
      const worldY = clamp(y - 1300, 0, 4966);
      holder.style.transform = `translate3d(-50%,${-worldY * scale}px,0)`;
      const seaOpacity = 1 - smooth(310, 1280, y);
      const seaDepth = reduced.matches ? 0 : smooth(0, 1450, y);
      const mobileDepth = innerWidth < 600 ? .5 : 1;
      seaPainting.style.transform = `scale(${1 + seaDepth * .2 * mobileDepth})`;
      seaTitle.style.transform = `translate3d(0,${-seaDepth * 95 * mobileDepth}px,0)`;
      seaCharacter.style.transform = `translateX(-50%) translateY(${seaDepth * 100 * mobileDepth}px) scale(${1 + seaDepth * .14 * mobileDepth})`;
      seaFlower.style.transform = `translateY(${seaDepth * 150 * mobileDepth}px)`;
      seaScene.style.opacity = seaOpacity.toFixed(3);
      seaScene.style.visibility = seaOpacity < .002 ? 'hidden' : 'visible';
      holder.style.pointerEvents = seaOpacity > .5 ? 'none' : 'auto';
      const shelfOpacity = tarotComplete ? smooth(6350, 7850, y) : 0;
      const tarotOpacity = smooth(5350, 6080, y) * (1 - shelfOpacity);
      tarotScene.style.opacity = tarotOpacity.toFixed(3);
      tarotScene.classList.toggle('ready', tarotOpacity > .9);
      const tarotBlocked = tarotOpacity < .9;
      if (tarotScene.inert !== tarotBlocked) tarotScene.inert = tarotBlocked;
      bookshelfScene.style.opacity = shelfOpacity.toFixed(3);
      const shelfDepth = reduced.matches ? 1 : smooth(6350, 8300, y);
      shelfFrame.style.transform = `translate3d(0,${(1-shelfDepth)*60}px,0) scale(${.92+shelfDepth*.08})`;
      shelfHeading.style.transform = `translate3d(0,${(1-shelfDepth)*24}px,0)`;
      bookshelfScene.classList.toggle('ready', shelfOpacity > .9);
      const shelfBlocked = shelfOpacity < .9;
      if (bookshelfScene.inert !== shelfBlocked) bookshelfScene.inert = shelfBlocked;
      activateSceneLines(y);
      progress.style.transform = `scaleY(${clamp(y / SHELF_END, 0, 1)})`;
      const nextHint = !gateOpen && y >= 4600 ? '点开这朵黄花，帷幕才会落下' : y < 1000 ? '滚动，和蓝蓝走一走 ↓' : y < 1700 ? '粉色门上的风铃，点开看看 ↓' : y < 2800 ? '沿着花间小路往前走 ↓' : y < 4700 ? '溪边可以抓大鹅，也可以画圈救蓝蓝' : y < 5600 ? '快到旅途的礼物了 ↓' : tarotComplete ? '往下走，书架在等你 ↓' : '点开一张牌，再点一次看解读';
      if (hint.textContent !== nextHint) hint.textContent = nextHint;
      hint.style.opacity = tarotOpacity > .8 || shelfOpacity > .2 ? '0' : '1';
    }
    if (finePointer.matches && !reduced.matches && !paused) {
      const nx = (pointer.x / innerWidth - .5) * 2;
      const ny = (pointer.y / innerHeight - .5) * 2;
      seaPainting.style.translate = `${-nx * 22}px ${-ny * 17}px`;
      seaTitle.style.translate = `${nx * 8}px ${ny * 5}px`;
      seaCharacter.style.translate = `${nx * 18}px ${ny * 10}px`;
      characterOne.style.translate = `${nx * 18}px ${ny * 9}px`;
      characterTwo.style.translate = `${nx * 14}px ${ny * 8}px`;
      foregroundFlowers.forEach((flower, index) => flower.style.translate = `${nx * (index ? 26 : -26)}px ${ny * 13}px`);
    }
    if (!paused && Math.abs(targetY - displayY) > .1) schedule();
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  const scrollCap = () => curtainLock || !gateOpen ? GATE_Y * scale : tarotComplete ? Infinity : TAROT_CAP * scale;
  addEventListener('resize', sizeWorld);
  addEventListener('scroll', () => {
    const cap = scrollCap();
    if (scrollY > cap) {
      scrollTo(0, cap);
      targetY = cap;
    } else targetY = scrollY;
    schedule();
  }, { passive: true });
  addEventListener('wheel', event => {
    if (curtainLock) { event.preventDefault(); return; }
    if (event.deltaY > 0 && scrollY >= scrollCap() - 1) event.preventDefault();
  }, { passive: false });
  let touchStartY = 0;
  addEventListener('touchstart', event => { touchStartY = event.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', event => {
    const pullingUp = event.touches[0].clientY < touchStartY;
    if (curtainLock || (pullingUp && scrollY >= scrollCap() - 1)) event.preventDefault();
  }, { passive: false });
  addEventListener('keydown', event => {
    const down = event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === 'End' || event.key === ' ';
    if (!down || event.target.closest?.('button, a, input, textarea')) return;
    if (curtainLock || scrollY >= scrollCap() - 1) event.preventDefault();
  });
  addEventListener('thought-restart', () => { gateOpen = false; curtainLock = false; tarotComplete = false; continueToShelf.hidden = true; schedule(); });
  addEventListener('thought-tarot-complete', () => {
    tarotComplete = true;
    continueToShelf.hidden = false;
    schedule();
  });
  continueToShelf.addEventListener('click', () => {
    if (!tarotComplete) return;
    scrollTo({ top: 7950 * scale, behavior: reduced.matches ? 'instant' : 'smooth' });
  });
  addEventListener('pointermove', event => {
    if (!finePointer.matches || reduced.matches || event.pointerType !== 'mouse') return;
    pointer.x = event.clientX; pointer.y = event.clientY; schedule();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
  reduced.addEventListener('change', () => {
    [seaPainting, seaTitle, seaCharacter, characterOne, characterTwo, ...foregroundFlowers].forEach(el => { el.style.translate = ''; });
    schedule();
  });
  sizeWorld();

  function burst(x, y) {
    if (reduced.matches) return;
    const ring = document.createElement('i'); ring.className = 'ripple'; ring.style.left = `${x}px`; ring.style.top = `${y}px`; document.body.append(ring); setTimeout(() => ring.remove(), 900);
    for (let i = 0; i < 15; i++) {
      const dot = document.createElement('i'); const a = i * Math.PI * 2 / 15; const d = 45 + Math.random() * 80;
      dot.className = 'pollen'; dot.style.left = `${x}px`; dot.style.top = `${y}px`; dot.style.setProperty('--dx', `${Math.cos(a) * d}px`); dot.style.setProperty('--dy', `${Math.sin(a) * d}px`);
      document.body.append(dot); setTimeout(() => dot.remove(), 900);
    }
  }
  const flowerLines = ['这朵花记下了。', '风也停了一下。', '你还在这条路上。'];
  function rememberFlower(flower) {
    const r = flower.getBoundingClientRect();
    flower.classList.remove('bloom');
    void flower.offsetWidth;
    flower.classList.add('bloom', 'remembered');
    burst(r.left + r.width / 2, r.top + r.height * .35);
    const label = flower.querySelector('span');
    if (!label) return;
    const next = Math.min(flowerLines.length, Number(flower.dataset.taps || 0) + 1);
    flower.dataset.taps = String(next);
    label.textContent = flowerLines[next - 1];
  }
  document.getElementById('sea-flower').addEventListener('click', () => rememberFlower(document.getElementById('sea-flower')));
  document.getElementById('flower').addEventListener('click', () => {
    const flower = document.getElementById('flower');
    rememberFlower(flower);
    openCurtain();
  });
  function openCurtain() {
    if (gateOpen || curtainLock) return;
    gateOpen = true;
    curtainLock = true;
    const dest = 6200 * scale;
    const finish = () => {
      curtainLock = false;
      paused = false;
      scrollTo(0, dest);
      targetY = dest;
      displayY = dest;
      holder.getAnimations().forEach(animation => animation.cancel());
      tarotScene.style.zIndex = '';
      schedule();
    };
    if (reduced.matches) { finish(); return; }
    paused = true;
    tarotScene.style.zIndex = '0';
    tarotScene.style.opacity = '1';
    tarotScene.classList.add('ready');
    const animation = holder.animate([
      { transform: holder.style.transform || 'translate3d(-50%,0,0)' },
      { transform: 'translate3d(-50%,110vh,0)' }
    ], { duration: 640, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' });
    animation.onfinish = finish;
  }

  const details = {
    tea: { eyebrow: 'FIELD WRITING / WANLI TEA ROAD', title: '万里茶道，\n我走过的万分之一。', description: '在宜昌，我从天然塔走进老厂、新车间、茶山与江岸，参与《遇见东方》的采访、编辑与写作。我的问题是：传统怎样继续发生在今天的生活里？', image: 'assets/tea-road-book.png', link: 'works/tea-road.html' },
    ai: { eyebrow: 'AI PRODUCT / AI-LOVER', title: '让陪伴，\n真的有回应。', description: '我参与 AI-Lover 陪伴智能体的用户研究和互动设计，让语音、动作与情绪体验连接，让比心、双人写字和烟花成为可以参与的回应。', image: 'assets/ai-lover/image3.png', link: 'works/ai-lover.html' },
    camera: { eyebrow: 'CONTENT / @啦啦蓝', title: '自媒体，\n是生活的回声。', description: '校园、旅行、vlog 和日常，我把正在长成的自己记下来。小红书 @啦啦蓝。', image: 'assets/thought-walk/charms/camera.png', link: 'https://www.xiaohongshu.com/user/profile/62fb319c000000001200fe1d', external: true },
    letter: { eyebrow: 'LITERARY / 笺读', title: '笺读，\n给原文留一个座位。', description: '原文、译文和注疏并置，像一座可以走进去的小剧场。', image: 'assets/literary-workbench-folio.png', link: 'works/literary-workbench/index.html' }
  };
  const detail = document.getElementById('detail-overlay');
  let previousFocus = null;
  let detailAnimation = null;
  function openDetail(button) {
    previousFocus = button;
    const data = details[button.dataset.detail];
    document.getElementById('detail-eyebrow').textContent = data.eyebrow;
    document.getElementById('detail-title').textContent = data.title;
    document.getElementById('detail-description').textContent = data.description;
    document.getElementById('detail-image').src = data.image;
    document.getElementById('detail-image').alt = data.title.replace('\n', '');
    document.getElementById('detail-link').href = data.link;
    document.getElementById('detail-link').target = data.external ? '_blank' : '_self';
    detail.hidden = false; document.body.style.overflow = 'hidden'; paused = true;
    detailAnimation?.cancel();
    if (!reduced.matches && !window.SceneMotion?.keyboard) {
      const trigger = button.getBoundingClientRect();
      const content = detail.querySelector('.detail-content');
      const bounds = content.getBoundingClientRect();
      detailAnimation = content.animate([
        { opacity: 0, transform: `translate(${(trigger.left+trigger.width/2-bounds.left-bounds.width/2)*.18}px,${(trigger.top+trigger.height/2-bounds.top-bounds.height/2)*.18}px) scale(.94)` },
        { opacity: 1, transform: 'none' }
      ], { duration: 280, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
    detail.querySelector('.detail-close').focus();
  }
  document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => openDetail(button)));
  document.getElementById('detail-link').addEventListener('click', event => {
    if (event.currentTarget.target === '_blank' || !previousFocus) return;
    sessionStorage.setItem('lanlan-case-origin', 'thought');
    sessionStorage.setItem('lanlan-thought-return', JSON.stringify({
      mode: 'detail', detail: previousFocus.dataset.detail, worldY: scrollY / scale
    }));
  });
  function closeDetail() {
    detailAnimation?.cancel();
    document.body.style.overflow = '';
    paused = false;
    render();
    detail.hidden = true;
    previousFocus?.focus();
  }
  detail.querySelector('.detail-close').addEventListener('click', closeDetail);
  detail.addEventListener('click', event => { if (event.target === detail) closeDetail(); });
  addEventListener('keydown', event => { if (event.key === 'Escape' && !detail.hidden) closeDetail(); });

  document.getElementById('literatureBook').addEventListener('click', () => {
    sessionStorage.setItem('lanlan-thought-return', JSON.stringify({ mode: 'shelf', worldY: SHELF_END }));
  });
  let returnState = null;
  try { returnState = JSON.parse(sessionStorage.getItem('lanlan-thought-return') || 'null'); } catch (error) {}
  if (returnState) {
    sessionStorage.removeItem('lanlan-thought-return');
    requestAnimationFrame(() => {
      const nextY = clamp(Number(returnState.worldY) || 0, 0, SHELF_END) * scale;
      if (returnState.mode === 'shelf') {
        gateOpen = true;
        tarotComplete = true;
        continueToShelf.hidden = false;
      }
      scrollTo(0, nextY);
      targetY = displayY = nextY;
      render();
      if (returnState.mode === 'detail') {
        const button = [...document.querySelectorAll('[data-detail]')].find(item => item.dataset.detail === returnState.detail);
        if (button) openDetail(button);
      }
      requestAnimationFrame(() => parent.postMessage({ type: 'lanlan-thought-restored', mode: returnState.mode }, location.origin));
    });
  }

  const readings = {
    empress: { title: '送你一束花。', copy: '愿你正在照料的事，在无人催促的日子里，慢慢开成自己的样子。', note: '我在宜昌茶山听见“茶发芽啰”时，也想到：生长值得被认真等待。', symbol: 'flower' },
    star: { title: '送你一颗火花。', copy: '下一次有想法亮起来，愿你有勇气把它做成一次真实的尝试。', note: '我做 AI-Lover 时，也在试着让抽象的“陪伴”变成可回应的动作。', symbol: '✦' },
    sun: { title: '送你一轮太阳。', copy: '愿你走到不熟悉的地方，也总能找到让自己重新出发的光。', note: '我从蓝色海面出发，把沿途的观察、写作和创造带回自己的作品。', symbol: '☀' }
  };
  const cards = [...document.querySelectorAll('.tarot-card')];
  const blessing = document.getElementById('blessing');
  if (blessing) cards.forEach(card => card.addEventListener('click', () => {
    const reading = readings[card.dataset.card];
    cards.forEach(other => { other.classList.toggle('flipped', other === card); other.classList.toggle('chosen', other === card); other.classList.toggle('dimmed', other !== card); });
    document.getElementById('blessing-title').textContent = reading.title;
    document.getElementById('blessing-copy').textContent = reading.copy;
    document.getElementById('blessing-note').textContent = reading.note;
    const symbol = document.getElementById('blessing-object');
    symbol.innerHTML = reading.symbol === 'flower' ? '<img src="assets/thought-walk/flower.png" alt="一束黄色的花"><img src="assets/thought-walk/flower.png" alt=""><img src="assets/thought-walk/flower.png" alt="">' : reading.symbol;
    symbol.classList.toggle('bouquet', reading.symbol === 'flower');
    setTimeout(() => { blessing.hidden = false; tarotScene.classList.add('has-blessing'); schedule(); }, reduced.matches ? 0 : 600);
  }));
  document.getElementById('restart')?.addEventListener('click', () => {
    blessing.hidden = true; tarotScene.classList.remove('has-blessing'); cards.forEach(card => card.classList.remove('flipped', 'chosen', 'dimmed'));
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
  });
})();
