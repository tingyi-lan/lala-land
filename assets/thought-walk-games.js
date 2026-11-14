(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAMES = { cream: '奶油鹅', pink: '粉鹅', blue: '蓝鹅', gold: '金鹅' };
  const COLORS = {
    cream: ['#f4efe4', '#e7d7b0', '#f0a24a', '#fff'],
    pink: ['#f8d7e0', '#e7a8b8', '#e07a8a', '#fff'],
    blue: ['#d7e7f8', '#8fb4de', '#3d6f9a', '#fff'],
    gold: ['#ffe7a8', '#f0c14a', '#c9842a', '#fffaf0']
  };

  function gooseSVG(type) {
    const [body, wing, beak, face] = COLORS[type];
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="86" rx="18" ry="5" fill="rgba(30,50,20,.22)"/><circle cx="50" cy="46" r="34" fill="${face}" stroke="#ead9b0" stroke-width="2"/><ellipse cx="50" cy="58" rx="22" ry="18" fill="${body}"/><circle cx="36" cy="40" r="11" fill="#fff"/><circle cx="64" cy="40" r="11" fill="#fff"/><circle cx="38" cy="41" r="3.1" fill="#241c16"/><circle cx="66" cy="41" r="3.1" fill="#241c16"/><ellipse cx="50" cy="54" rx="8" ry="5.5" fill="${beak}"/><path d="M34 68c5 7 27 7 32 0" fill="none" stroke="${wing}" stroke-width="4" stroke-linecap="round"/></svg>`;
  }

  document.querySelectorAll('.geese-art').forEach(art => {
    art.innerHTML = ['cream', 'gold', 'pink'].map(type => `<i>${gooseSVG(type)}</i>`).join('');
  });

  const gooseLayer = document.getElementById('goose-game');
  const penLayer = document.getElementById('pen-game');
  const pileEl = document.getElementById('goose-pile');
  const slotsEl = document.getElementById('goose-slots');
  const gooseStatus = document.getElementById('goose-status');
  const gooseCount = document.getElementById('goose-count');
  const gooseCard = gooseLayer.querySelector('.game-card');
  let goose = null;
  let gooseBusy = false;

  function deal() {
    const types = [];
    Object.keys(NAMES).forEach(type => { for (let i = 0; i < 6; i += 1) types.push(type); });
    for (let i = types.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    return types.map((type, index) => ({
      id: `g${index}`,
      type,
      z: index,
      x: Math.min(86, Math.max(14, 50 + Math.cos(index * 0.9) * (10 + (index % 5) * 4) + (Math.random() * 8 - 4))),
      y: Math.min(82, Math.max(16, 50 + Math.sin(index * 1.15) * (8 + (index % 4) * 4) + (Math.random() * 8 - 4))),
      rot: Math.round(Math.random() * 36 - 18)
    }));
  }

  function resetGoose() {
    goose = { pile: deal(), slots: [], clearing: null, lost: false, won: false };
    gooseBusy = false;
    gooseCard.classList.remove('lost', 'won');
  }

  function gooseFree(item) {
    const box = pileEl.getBoundingClientRect();
    const x = box.left + item.x / 100 * box.width;
    const y = box.top + item.y / 100 * box.height;
    return !goose.pile.some(other => other.z > item.z && Math.hypot(box.left + other.x / 100 * box.width - x, box.top + other.y / 100 * box.height - y) < 56);
  }

  function renderGoose() {
    gooseCount.textContent = goose.won ? '溪边清静了' : `溪里还有 ${goose.pile.length} 只 · 槽 ${goose.slots.length}/7`;
    gooseCard.classList.toggle('lost', goose.lost);
    gooseCard.classList.toggle('won', goose.won);
    pileEl.innerHTML = '';
    goose.pile.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'goose';
      button.dataset.id = item.id;
      button.style.left = `${item.x}%`;
      button.style.top = `${item.y}%`;
      button.style.zIndex = String(item.z);
      button.style.transform = `translate(-50%,-50%) rotate(${item.rot}deg)`;
      button.innerHTML = gooseSVG(item.type);
      button.setAttribute('aria-label', NAMES[item.type]);
      const free = gooseFree(item) && !goose.lost && !goose.won;
      button.classList.toggle('locked', !free);
      button.setAttribute('aria-disabled', free ? 'false' : 'true');
      pileEl.append(button);
    });
    slotsEl.innerHTML = '';
    for (let i = 0; i < 7; i += 1) {
      const cell = document.createElement('div');
      cell.className = 'slot';
      if (goose.slots[i]) cell.innerHTML = gooseSVG(goose.slots[i]);
      if (goose.clearing && goose.clearing.includes(i)) cell.classList.add('clearing');
      slotsEl.append(cell);
    }
  }

  function finishMatch(type, nextSlots) {
    gooseStatus.textContent = `三只${NAMES[type]}走开了`;
    setTimeout(() => {
      goose.slots = nextSlots;
      goose.clearing = null;
      gooseBusy = false;
      if (!goose.pile.length && !goose.slots.length) {
        goose.won = true;
        gooseStatus.textContent = '溪边清静了。鹅都回家了。';
        document.querySelector('[data-open="goose"]').classList.add('cleared');
      }
      renderGoose();
    }, reduced ? 0 : 280);
  }

  function resolveGoose() {
    const counts = {};
    goose.slots.forEach(type => { counts[type] = (counts[type] || 0) + 1; });
    const matched = Object.keys(counts).find(type => counts[type] >= 3);
    if (matched) {
      let removed = 0;
      const clearing = [];
      const next = [];
      goose.slots.forEach((type, index) => {
        if (type === matched && removed < 3) {
          removed += 1;
          clearing.push(index);
        } else next.push(type);
      });
      goose.clearing = clearing;
      renderGoose();
      finishMatch(matched, next);
      return;
    }
    gooseBusy = false;
    if (goose.slots.length >= 7) {
      goose.lost = true;
      gooseStatus.textContent = '槽位满了，鹅跑乱了。再摆一次。';
      renderGoose();
      return;
    }
    renderGoose();
  }

  pileEl.addEventListener('click', event => {
    const button = event.target.closest('.goose');
    if (!button || !goose || gooseBusy || goose.lost || goose.won) return;
    const item = goose.pile.find(entry => entry.id === button.dataset.id);
    if (!item || !gooseFree(item)) {
      button.classList.remove('deny');
      void button.offsetWidth;
      button.classList.add('deny');
      gooseStatus.textContent = '这只被压住了，先捉上面的。';
      return;
    }
    gooseBusy = true;
    button.classList.add('caught');
    gooseStatus.textContent = `捉到一只${NAMES[item.type]}`;
    setTimeout(() => {
      goose.pile = goose.pile.filter(entry => entry.id !== item.id);
      goose.slots.push(item.type);
      resolveGoose();
    }, reduced ? 0 : 160);
  });

  const field = document.getElementById('pen-field');
  const canvas = document.getElementById('pen-canvas');
  const wispsEl = document.getElementById('pen-wisps');
  const penStatus = document.getElementById('pen-status');
  const ctx = canvas.getContext('2d');
  const pen = { wisps: [], fences: [], points: [], drawing: false, won: false, w: 1, h: 1, loop: 0, last: 0, ready: false };

  function sizePen() {
    const rect = field.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    pen.w = Math.max(1, rect.width);
    pen.h = Math.max(1, rect.height);
    canvas.width = Math.round(pen.w * dpr);
    canvas.height = Math.round(pen.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resetPen() {
    sizePen();
    cancelAnimationFrame(pen.loop);
    pen.loop = 0;
    pen.fences = [];
    pen.points = [];
    pen.drawing = false;
    pen.won = false;
    pen.last = 0;
    field.classList.remove('freed', 'broke');
    const starts = [[0.16, 0.2], [0.84, 0.22], [0.18, 0.8], [0.82, 0.78]];
    const speeds = [[70, 48], [-62, 84], [76, -70], [-88, -46]];
    const kinds = ['cream', 'pink', 'blue', 'gold'];
    wispsEl.innerHTML = '';
    pen.wisps = starts.map((spot, index) => {
      const el = document.createElement('div');
      el.className = 'wisp';
      el.innerHTML = gooseSVG(kinds[index]);
      wispsEl.append(el);
      return { x: spot[0] * pen.w, y: spot[1] * pen.h, vx: speeds[index][0], vy: speeds[index][1], el, gone: false };
    });
    pen.ready = true;
    penStatus.textContent = '按住画面，把线收回起点。还剩 4 只。';
    drawPen();
  }

  function inside(x, y, poly) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
      const a = poly[i];
      const b = poly[j];
      if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / ((b.y - a.y) || 0.00001) + a.x) hit = !hit;
    }
    return hit;
  }

  function segmentDistance(px, py, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = dx * dx + dy * dy || 1;
    let t = ((px - a.x) * dx + (py - a.y) * dy) / len;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
  }

  function strokeLength(points) {
    let total = 0;
    for (let i = 1; i < points.length; i += 1) total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    return total;
  }

  function drawPen() {
    ctx.clearRect(0, 0, pen.w, pen.h);
    pen.fences.forEach(poly => {
      ctx.beginPath();
      poly.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
      ctx.closePath();
      ctx.fillStyle = 'rgba(243,215,138,.3)';
      ctx.strokeStyle = '#e7c56a';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
    });
    if (pen.points.length) {
      ctx.beginPath();
      pen.points.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
      ctx.strokeStyle = '#fff6d4';
      ctx.lineWidth = 5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(226,184,74,.9)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      const start = pen.points[0];
      ctx.beginPath();
      ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#fff6d4';
      ctx.fill();
    }
  }

  function placeWisps() {
    pen.wisps.forEach(wisp => {
      wisp.el.style.left = `${wisp.x}px`;
      wisp.el.style.top = `${wisp.y}px`;
    });
  }

  function breakLine() {
    pen.drawing = false;
    pen.points = [];
    field.classList.add('broke');
    penStatus.textContent = '线被鹅踩断了。换个空隙再画。';
    setTimeout(() => field.classList.remove('broke'), 280);
    drawPen();
  }

  function closeLoop() {
    pen.drawing = false;
    const poly = pen.points.slice();
    pen.points = [];
    const lanlanInside = inside(pen.w / 2, pen.h / 2, poly);
    const caught = pen.wisps.filter(wisp => !wisp.gone && inside(wisp.x, wisp.y, poly));
    if (lanlanInside) {
      penStatus.textContent = '这圈把蓝蓝也关住了。围鹅，别围她。';
      drawPen();
      return;
    }
    if (!caught.length) {
      penStatus.textContent = '这圈是空的。等鹅走进去再收口。';
      drawPen();
      return;
    }
    pen.fences.push(poly);
    caught.forEach(wisp => {
      wisp.gone = true;
      wisp.el.classList.add('gone');
    });
    const left = pen.wisps.filter(wisp => !wisp.gone).length;
    if (!left) {
      pen.won = true;
      field.classList.add('freed');
      penStatus.textContent = '圈好了。蓝蓝出来了。';
      document.querySelector('[data-open="pen"]').classList.add('cleared');
    } else {
      penStatus.textContent = `关住了 ${caught.length} 只，还剩 ${left} 只。`;
    }
    drawPen();
  }

  function stepPen(now) {
    pen.loop = requestAnimationFrame(stepPen);
    const dt = Math.min(0.034, pen.last ? (now - pen.last) / 1000 : 0.016);
    pen.last = now;
    if (!pen.won) {
      pen.wisps.forEach(wisp => {
        if (wisp.gone) return;
        wisp.x += wisp.vx * dt;
        wisp.y += wisp.vy * dt;
        if (wisp.x < 26 || wisp.x > pen.w - 26) wisp.vx *= -1;
        if (wisp.y < 26 || wisp.y > pen.h - 26) wisp.vy *= -1;
        wisp.x = Math.min(pen.w - 26, Math.max(26, wisp.x));
        wisp.y = Math.min(pen.h - 26, Math.max(26, wisp.y));
        const dx = wisp.x - pen.w / 2;
        const dy = wisp.y - pen.h / 2;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 86) {
          wisp.x = pen.w / 2 + dx / dist * 86;
          wisp.y = pen.h / 2 + dy / dist * 86;
          wisp.vx += dx / dist * 30;
          wisp.vy += dy / dist * 30;
        }
        if (pen.drawing && pen.points.length > 1 && pen.points.some((point, index) => index && segmentDistance(wisp.x, wisp.y, point, pen.points[index - 1]) < 24)) breakLine();
      });
    }
    placeWisps();
    drawPen();
  }

  function localPoint(event) {
    const rect = field.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  field.addEventListener('pointerdown', event => {
    if (pen.won || event.button) return;
    field.setPointerCapture(event.pointerId);
    pen.drawing = true;
    pen.points = [localPoint(event)];
    penStatus.textContent = '继续画，最后回到亮点上。';
  });
  field.addEventListener('pointermove', event => {
    if (!pen.drawing) return;
    const point = localPoint(event);
    const last = pen.points[pen.points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < 7) return;
    if (pen.wisps.some(wisp => !wisp.gone && segmentDistance(wisp.x, wisp.y, last, point) < 24)) {
      breakLine();
      return;
    }
    pen.points.push(point);
    const start = pen.points[0];
    if (pen.points.length > 14 && strokeLength(pen.points) > 140 && Math.hypot(point.x - start.x, point.y - start.y) < 28) closeLoop();
  });
  field.addEventListener('pointerup', () => {
    if (!pen.drawing) return;
    const start = pen.points[0];
    const end = pen.points[pen.points.length - 1];
    pen.drawing = false;
    if (start && end && pen.points.length > 14 && strokeLength(pen.points) > 140 && Math.hypot(end.x - start.x, end.y - start.y) < 40) closeLoop();
    else {
      pen.points = [];
      penStatus.textContent = '还没圈上。把线收回起点。';
      drawPen();
    }
  });

  function lock(on) {
    document.documentElement.classList.toggle('game-lock', on);
  }
  function openGame(name) {
    const layer = name === 'goose' ? gooseLayer : penLayer;
    if (name === 'goose' && !goose) resetGoose();
    layer.hidden = false;
    lock(true);
    layer.querySelector('.game-x').focus();
    if (name === 'goose') renderGoose();
    else requestAnimationFrame(() => {
      if (!pen.ready) resetPen();
      else sizePen();
      if (!pen.loop) pen.loop = requestAnimationFrame(stepPen);
    });
  }
  function closeGame() {
    gooseLayer.hidden = true;
    penLayer.hidden = true;
    lock(false);
    cancelAnimationFrame(pen.loop);
    pen.loop = 0;
  }

  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openGame(button.dataset.open)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeGame));
  document.getElementById('goose-retry').addEventListener('click', () => { resetGoose(); renderGoose(); gooseStatus.textContent = '重新叠好了。从最上面开始捉。'; });
  document.getElementById('pen-retry').addEventListener('click', () => { resetPen(); if (!pen.loop) pen.loop = requestAnimationFrame(stepPen); });
  addEventListener('resize', () => {
    if (!penLayer.hidden && pen.ready) sizePen();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && (!gooseLayer.hidden || !penLayer.hidden)) closeGame();
  });
  gooseLayer.addEventListener('wheel', event => event.preventDefault(), { passive: false });
  penLayer.addEventListener('wheel', event => event.preventDefault(), { passive: false });
})();
