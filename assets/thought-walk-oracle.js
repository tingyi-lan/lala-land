(() => {
  const arc = document.getElementById('arc');
  const line = document.getElementById('oracle-line');
  const oracle = document.getElementById('oracle');
  const dealt = document.getElementById('dealt');
  const dealtCard = document.getElementById('dealt-card');
  const tilt = dealt?.querySelector('.dealt-tilt');
  const face = document.getElementById('dealt-face');
  const reading = document.getElementById('reading');
  if (!arc || !line || !oracle || !dealt || !dealtCard || !tilt || !face || !reading) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cards = [
    { id: '00', num: '0', name: '愚者', en: 'The Fool', keys: '开始 · 信任 · 迈步', picture: '一个年轻人站在悬崖边，手里一朵白玫瑰，肩上扛着小小的包袱，白狗在脚边叫，太阳在身后。', body: '这张牌说的是一段还没被定义的开始。他看见了悬崖，仍然把重量放在下一步上。此刻适合带着轻装出发，而不是把整条路先算完。' },
    { id: '01', num: 'I', name: '魔术师', en: 'The Magician', keys: '意志 · 资源 · 动手', picture: '他一手指天、一手指地，桌上摆着权杖、圣杯、宝剑和星币，头上是无穷符号。', body: '你要的四样东西已经在桌上。魔术师把念头收成一个具体动作：开口、写下、把那件事发出去。天上的符号要落到手里，才算开始。' },
    { id: '02', num: 'II', name: '女祭司', en: 'The High Priestess', keys: '直觉 · 沉默 · 内在', picture: '她坐在黑白两根柱之间，脚边是新月，膝上的卷轴还没有打开。', body: '有些答案不在外面的声音里。女祭司让你先安静下来，把还没说出口的直觉留住。卷轴可以晚一点再展开，不必急着解释。' },
    { id: '03', num: 'III', name: '皇后', en: 'The Empress', keys: '生长 · 照料 · 丰盛', picture: '她坐在麦田与流水之间，身后是森林，手里是金星的盾。', body: '这是被照料之后的生长。作品、关系、身体，哪一件你正在认真养着，它就会慢慢长出来。给它时间和土壤，比催它更快更有用。' },
    { id: '04', num: 'IV', name: '皇帝', en: 'The Emperor', keys: '边界 · 秩序 · 担当', picture: '他披着盔甲坐在石座上，公羊护着王座，面向远处的山河。', body: '皇帝给的是边界。今天适合把一件事定下来：谁负责、到哪一步、什么时候停。稳定不是冷淡，是让别人知道这里可以靠岸。' },
    { id: '05', num: 'V', name: '教皇', en: 'The Hierophant', keys: '传统 · 师承 · 规矩', picture: '他戴着三重冠，向面前的两名信徒举起祝福的手，钥匙放在脚边。', body: '教皇讲可以依靠的传统和老师。去找已经走过这条路的人，或回到你信任的那套方法。不是每一步都要自己发明。' },
    { id: '06', num: 'VI', name: '恋人', en: 'The Lovers', keys: '选择 · 价值 · 结合', picture: '天使在云上张开手，一对人站在两棵树下，中间是一座山。', body: '恋人首先是选择，然后才是感情。它问的是：哪一边更像你愿意长期站上去的价值。选完，就站在那边。' },
    { id: '07', num: 'VII', name: '战车', en: 'The Chariot', keys: '方向 · 意志 · 前进', picture: '披甲的人驾着一黑一白两只斯芬克斯，城市留在身后，车上是星空的顶篷。', body: '两股力气方向不同，车仍然可以往前。战车要你自己握住方向，把散开的念头收成同一个目的地。' },
    { id: '08', num: 'VIII', name: '力量', en: 'Strength', keys: '勇气 · 耐心 · 柔软', picture: '白衣女子轻轻合上狮子的嘴，头上是一个横放的无穷符号。', body: '这张牌里的力量不是压过去，是靠近。你可以用更慢、更稳的方式面对那件让你发紧的事。温柔地坚持，狮子也会安静下来。' },
    { id: '09', num: 'IX', name: '隐者', en: 'The Hermit', keys: '独处 · 寻找 · 内在的光', picture: '老人站在雪山顶上，提一盏只照亮脚下的灯，另一只手拄着杖。', body: '隐者把路照给自己看。适合少问别人要答案，自己走一段。灯不大，但够看清下一步。' },
    { id: '10', num: 'X', name: '命运之轮', en: 'Wheel of Fortune', keys: '周期 · 转折 · 起落', picture: '轮子在转，狮身人面上升，蛇往下沉，四个角落是福音书里的活物。', body: '轮子转到这里了。有的事升上来，有的事该下去。这是周期，不是判决。看清自己正站在哪一格，比抓紧上一格更有用。' },
    { id: '11', num: 'XI', name: '正义', en: 'Justice', keys: '真相 · 衡量 · 后果', picture: '她坐在两柱之间，左手天平，右手向上的剑，眼睛没有被蒙住。', body: '正义要你把事情称清楚：发生了什么、你的那一份是什么、下一步怎么补。先看明白，再下判断。' },
    { id: '12', num: 'XII', name: '倒吊人', en: 'The Hanged Man', keys: '暂停 · 换个角度看', picture: '他用一只脚倒挂在活木上，头上有一圈光，脸上是安静的。', body: '停在这里不是失败。换一个方向看，原先卡住的东西会松一点。先别挣，让这个暂停把视角倒过来。' },
    { id: '13', num: 'XIII', name: '死神', en: 'Death', keys: '结束 · 转化 · 放下', picture: '黑甲骑士走过田野，国王倒在马前，孩子和女人还站着，远处太阳从两座塔之间升起。', body: '死神收走的是已经结束的形态。一种做法、一段关系、一个旧身份，可以合上了。空出来的位置，才长得出下一件事。' },
    { id: '14', num: 'XIV', name: '节制', en: 'Temperance', keys: '调和 · 节奏 · 耐心', picture: '天使一脚在水里、一脚在地上，把水从一只杯缓缓倒进另一只杯。', body: '节制是把两边调匀。不必一次做完，也不必站死在某一端。把节奏放到你真的接得住的速度。' },
    { id: '15', num: 'XV', name: '恶魔', en: 'The Devil', keys: '束缚 · 欲望 · 看见链条', picture: '羊角的形象坐在石座上，一男一女被松松的链子拴着，链子可以从头上取下。', body: '链子是松的。这张牌指出你还舍不得放的习惯、关系或自我叙事。先看见它，才谈得上要不要继续戴着。' },
    { id: '16', num: 'XVI', name: '高塔', en: 'The Tower', keys: '突变 · 揭露 · 重建', picture: '闪电打中塔顶，王冠被震落，两个人从窗口掉下来，火焰从窗里涌出。', body: '塔上那一层已经撑不住了。突然的变化把不真实的结构掀开。晃的时候很难受，露出来的地面却是真的。' },
    { id: '17', num: 'XVII', name: '星星', en: 'The Star', keys: '希望 · 修复 · 灵感', picture: '女人跪在池边，一壶水倒回池里，一壶浇在地上，身后是一颗大星和七颗小星。', body: '星星是安静的希望。把水倒回去，是在修复。把愿望放在你每天看得见的地方，让它被照到。' },
    { id: '18', num: 'XVIII', name: '月亮', en: 'The Moon', keys: '不明 · 梦 · 潜意识', picture: '月亮照着一条通向远方的路，两边是塔，狗和狼在叫，一只虾从水里爬上来。', body: '看不清的时候，月亮不让你假装很亮。走你还能看见的那一段，把梦和不安分开记下。路还在，只是现在要靠得近一点。' },
    { id: '19', num: 'XIX', name: '太阳', en: 'The Sun', keys: '清晰 · 喜悦 · 成果', picture: '孩子骑在白马上，身后是一面墙的向日葵，太阳的脸没有遮挡。', body: '太阳把事情照清楚，也把成果晒出来。适合分享、庆祝、让别人看见你做成的部分。它简单，而且是真的。' },
    { id: '20', num: 'XX', name: '审判', en: 'Judgement', keys: '醒来 · 召唤 · 回应', picture: '天使在云上吹号，人们从棺中站起来，向那个声音张开手臂。', body: '审判是一次醒来。有个你一直听见、却还没回答的召唤。现在可以回应它：承认过去的自己，然后站起来。' },
    { id: '21', num: 'XXI', name: '世界', en: 'The World', keys: '完成 · 整合 · 抵达', picture: '舞者在花环中央，手里各有一条带子，四个角落是和命运之轮相同的活物。', body: '这一段是完整的。世界不是终点的奖杯，是你把走过的路收进身体里。可以在这里停一下，再决定下一圈从哪开始。' }
  ];

  const sparks = [[18, 22], [78, 16], [88, 38], [12, 48], [70, 58], [40, 12]];
  sparks.forEach((spot, index) => {
    const spark = document.createElement('i');
    spark.className = 'spark';
    spark.style.left = `${spot[0]}%`;
    spark.style.top = `${spot[1]}%`;
    spark.style.animationDelay = `${index * .35}s`;
    oracle.append(spark);
  });

  function bindTilt(el, node, amount) {
    if (reduced || !fine) return;
    el.addEventListener('pointermove', event => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty('--tx', `${(-py * amount).toFixed(2)}deg`);
      node.style.setProperty('--ty', `${(px * (amount + 2)).toFixed(2)}deg`);
      node.style.setProperty('--lift', amount > 8 ? '-8px' : '-6px');
      node.style.setProperty('--hx', `${(50 + px * 46).toFixed(1)}%`);
      node.style.setProperty('--hy', `${(30 + py * 42).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      node.style.setProperty('--tx', '0deg');
      node.style.setProperty('--ty', '0deg');
      node.style.setProperty('--lift', '0px');
    });
  }

  const order = cards.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let current = null;
  let shuffling = false;
  const ease = 'cubic-bezier(0.77, 0, 0.175, 1)';
  function layoutCard(button, index, count) {
    const columns = Math.ceil(count / 2);
    const row = index < columns ? 0 : 1;
    const slot = index % columns;
    const across = columns === 1 ? .5 : slot / (columns - 1);
    const edge = Math.abs(across - .5) * 2;
    const bow = Math.pow(edge, 1.35);
    const narrow = innerWidth <= 700;
    button.style.left = `${(narrow ? 4 : 7) + across * (narrow ? 92 : 86)}%`;
    button.style.top = `${(narrow ? (row ? 34 : 10) : (row ? 34 : 11)) + bow * (narrow ? (row ? 12 : 14) : (row ? 13 : 16))}%`;
    button.style.zIndex = String((row ? 8 : 7) + Math.round((1 - edge) * 2));
    button.dataset.rot = ((across - .5) * (narrow ? (row ? 18 : 24) : (row ? 20 : 26))).toFixed(2);
    button.dataset.scale = (0.96 + (1 - edge) * .04).toFixed(3);
    button.style.setProperty('--rot', `${button.dataset.rot}deg`);
    button.style.setProperty('--s', button.dataset.scale);
  }
  function fanPose(button) {
    return `translate(-50%, -50%) rotate(${button.dataset.rot}deg) scale(${button.dataset.scale})`;
  }
  function offsetPose(dx, dy, rot, scale) {
    return `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg) scale(${scale})`;
  }
  function cardCenter(button) {
    const rect = button.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, rot: parseFloat(button.dataset.rot), scale: parseFloat(button.dataset.scale) };
  }
  function visualOrder(list) {
    return list.slice().sort((a, b) => {
      const top = parseFloat(a.style.top) - parseFloat(b.style.top);
      if (Math.abs(top) > 6) return top;
      return parseFloat(a.style.left) - parseFloat(b.style.left);
    });
  }
  function riffle(list) {
    const drift = Math.random() < .5 ? 0 : (Math.random() < .5 ? -1 : 1);
    const mid = Math.min(list.length - 1, Math.max(1, Math.floor(list.length / 2) + drift));
    const left = list.slice(0, mid);
    const right = list.slice(mid);
    const out = [];
    while (left.length || right.length) {
      const packet = Math.random() < .75 ? 1 : 2;
      const side = !left.length ? right : !right.length ? left : (Math.random() < .5 ? left : right);
      out.push(...side.splice(0, Math.min(packet, side.length)));
    }
    return out;
  }
  function swapPairs(list) {
    const next = list.slice();
    const free = [...next.keys()];
    for (let round = 0; round < 6 && free.length > 1; round += 1) {
      const a = free.splice(Math.floor(Math.random() * free.length), 1)[0];
      const b = free.splice(Math.floor(Math.random() * free.length), 1)[0];
      [next[a], next[b]] = [next[b], next[a]];
    }
    return next;
  }
  order.forEach((cardIndex, index) => {
    const card = cards[cardIndex];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'arc-card tactile';
    button.dataset.id = card.id;
    button.dataset.card = cardIndex;
    layoutCard(button, index, order.length);
    button.style.setProperty('--d', reduced ? '0s' : `${index * 0.045}s`);
    button.setAttribute('aria-label', '翻开一张牌');
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span class="paper"><span class="card-inner"><span class="back"></span></span></span>';
    const paper = button.querySelector('.paper');
    bindTilt(button, paper, 9);
    button.addEventListener('pointerenter', () => {
      const preload = new Image();
      preload.src = `assets/thought-walk/tarot/rws-${card.id}.jpg`;
    }, { once: true });
    button.addEventListener('click', () => { if (!shuffling) showFace(card); });
    arc.append(button);
  });
  addEventListener('resize', () => {
    if (shuffling) return;
    [...arc.querySelectorAll('.arc-card')].forEach((button, index) => layoutCard(button, index, order.length));
  });
  bindTilt(dealtCard, tilt, 7);

  function markChosen(id) {
    arc.querySelectorAll('.arc-card').forEach(el => {
      const on = el.dataset.id === id;
      el.classList.toggle('chosen', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function showFace(card) {
    if (current && current.id === card.id && dealt.classList.contains('is-open')) {
      openReading(card);
      return;
    }
    current = card;
    reading.hidden = true;
    oracle.classList.remove('has-reading');
    markChosen(card.id);
    face.src = `assets/thought-walk/tarot/rws-${card.id}.jpg`;
    face.alt = `${card.name}，${card.en}`;
    dealt.hidden = false;
    dealtCard.setAttribute('aria-label', `再点一次，看${card.name}的解读`);
    oracle.classList.add('has-face');
    line.textContent = `${card.name}。再点这张牌面，看它在说什么。`;
    dealt.classList.remove('is-open');
    void dealt.offsetWidth;
    if (reduced) dealt.classList.add('is-open');
    else requestAnimationFrame(() => dealt.classList.add('is-open'));
  }

  function openReading(card) {
    document.getElementById('reading-num').textContent = `${card.num}   ${card.en}`;
    document.getElementById('reading-name').textContent = card.name;
    document.getElementById('reading-keys').textContent = card.keys;
    document.getElementById('reading-picture').textContent = card.picture;
    document.getElementById('reading-body').textContent = card.body;
    reading.hidden = false;
    oracle.classList.add('has-reading');
    line.textContent = '点另一张牌背，可以换一张。';
    dispatchEvent(new Event('thought-tarot-complete'));
  }

  function closeDraw() {
    current = null;
    dealt.classList.remove('is-open');
    dealt.hidden = true;
    reading.hidden = true;
    oracle.classList.remove('has-face', 'has-reading');
    markChosen('');
    face.removeAttribute('src');
    face.alt = '';
    line.textContent = '二十二张大阿尔卡那。点开一张，看真正的牌面。';
  }

  dealtCard.addEventListener('click', () => { if (current && !shuffling) showFace(current); });
  document.getElementById('return-tab')?.addEventListener('click', () => { if (!shuffling) closeDraw(); });
  document.getElementById('oracle-shuffle')?.addEventListener('click', () => { shuffleDeck(); });
  document.getElementById('oracle-restart')?.addEventListener('click', () => {
    shuffling = false;
    arc.querySelectorAll('.arc-card').forEach(button => button.getAnimations().forEach(animation => animation.cancel()));
    closeDraw();
    oracle.classList.remove('is-shuffling');
    dispatchEvent(new Event('thought-restart'));
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
  function releaseCards(list) {
    list.forEach(button => {
      button.getAnimations().forEach(animation => animation.cancel());
      button.style.transform = '';
    });
  }
  async function exchangeSlots(next) {
    const from = new Map(next.map(button => [button, cardCenter(button)]));
    next.forEach((button, index) => layoutCard(button, index, next.length));
    if (reduced) return;
    void arc.offsetWidth;
    await Promise.all(next.map((button, index) => {
      const start = from.get(button);
      const dest = button.getBoundingClientRect();
      const dx = start.x - (dest.left + dest.width / 2);
      const dy = start.y - (dest.top + dest.height / 2);
      if (Math.hypot(dx, dy) < 1.5) return Promise.resolve();
      const rot = parseFloat(button.dataset.rot);
      const scale = parseFloat(button.dataset.scale);
      const fromPose = offsetPose(dx, dy, start.rot, start.scale);
      button.style.transform = fromPose;
      button.style.zIndex = '24';
      return button.animate([
        { transform: fromPose },
        { transform: offsetPose(dx * .42, dy * .42 - 46, (start.rot + rot) / 2, scale), offset: .5 },
        { transform: fanPose(button) }
      ], { duration: 520, delay: index * 18, easing: ease, fill: 'forwards' }).finished;
    }));
    releaseCards(next);
    next.forEach((button, index) => layoutCard(button, index, next.length));
  }
  async function shuffleDeck() {
    if (shuffling) return;
    shuffling = true;
    closeDraw();
    oracle.classList.add('is-shuffling');
    line.textContent = '牌正在交换位置。';
    const buttons = [...arc.querySelectorAll('.arc-card')];
    releaseCards(buttons);
    try {
      let placed = visualOrder(buttons);
      placed = riffle(placed);
      await exchangeSlots(placed);
      if (!reduced) {
        placed = swapPairs(placed);
        await exchangeSlots(placed);
      }
    } finally {
      releaseCards(buttons);
      oracle.classList.remove('is-shuffling');
      line.textContent = '二十二张大阿尔卡那。点开一张，看真正的牌面。';
      shuffling = false;
    }
  }
  addEventListener('keydown', event => {
    if (event.key !== 'Escape' || dealt.hidden) return;
    const detail = document.getElementById('detail-overlay');
    const goose = document.getElementById('goose-game');
    const pen = document.getElementById('pen-game');
    if ((detail && !detail.hidden) || (goose && !goose.hidden) || (pen && !pen.hidden)) return;
    closeDraw();
  });
})();
