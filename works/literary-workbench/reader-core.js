/* 笺读 · 阅读工作台
   书的正文在 js/books/*.js，批注存在这台浏览器里，互不覆盖。
   换书或以后补译，只要 block 的 id 不变，圈点、眉批和笔迹还会落在原处。 */
(function () {
  const UI_KEY = "jiandu.preview.ui.v1";
  const BOOKS_KEY = "jiandu.userbooks.v1";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const S = {
    books: [],
    book: null,
    mode: "bi",
    font: 18.5,
    tool: "select",
    pen: "zhu",
    tab: "notes",
    q: "",
    findAt: 0,
    activeNote: null,
    sectionId: "prologue",
    ann: emptyAnn(),
    undo: [],
  };

  function emptyAnn() {
    return { highlights: [], marginalia: [], drawings: {} };
  }
  function annKey(id) { return "jiandu.ann.v1." + id; }
  function posKey(id) { return "jiandu.pos.v1." + id; }

  function loadUI() {
    try { return JSON.parse(localStorage.getItem(UI_KEY) || "{}"); }
    catch { return {}; }
  }
  function saveUI() {
    const ui = {
      bookId: S.book && S.book.id,
      mode: S.mode,
      font: S.font,
      tool: S.tool,
      pen: S.pen,
      tab: S.tab,
      sectionId: S.sectionId,
    };
    localStorage.setItem(UI_KEY, JSON.stringify(ui));
  }
  function loadAnn(id) {
    try { return Object.assign(emptyAnn(), JSON.parse(localStorage.getItem(annKey(id)) || "{}")); }
    catch { return emptyAnn(); }
  }
  function saveAnn() {
    if (!S.book) return;
    try {
      localStorage.setItem(annKey(S.book.id), JSON.stringify(S.ann));
    } catch (err) {
      toast("批注写不进浏览器了，请先导出一份。");
    }
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2400);
  }

  function collectBooks() {
    const builtin = (window.JIANDU_BOOKS || []).map((b) => ({ ...b, _origin: "内置" }));
    let user = [];
    try { user = JSON.parse(localStorage.getItem(BOOKS_KEY) || "[]"); }
    catch { user = []; }
    user = user.map((b) => ({ ...b, _origin: "导入" }));
    const ids = new Set(builtin.map((b) => b.id));
    user = user.filter((b) => {
      if (ids.has(b.id)) return false;
      return b && b.id && b.title && Array.isArray(b.sections);
    });
    return builtin.concat(user);
  }

  function noteIndex(book) {
    const map = {};
    let n = 0;
    for (const sec of book.sections || []) {
      for (const block of sec.blocks || []) {
        for (const note of block.notes || []) {
          if (!map[note.id]) {
            n += 1;
            map[note.id] = Object.assign({ _num: n, _sec: sec.id, _loc: block.loc || sec.loc || "" }, note);
          }
        }
      }
    }
    return map;
  }

  async function openBook(id, opts = {}) {
    const book = S.books.find((b) => b.id === id) || S.books[0];
    if (!book) {
      $("#paper").innerHTML = "<p class='empty'>书架是空的。用左下角“导入书籍”放进一本。</p>";
      return;
    }
    S.book = book;
    if (!book.sections.some(s => s.id === S.sectionId)) S.sectionId = (book.sections.find(s => s.kind === "drama") || book.sections[0]).id;
    S.notes = noteIndex(book);
    S.ann = loadAnn(book.id);
    S.activeNote = null;
    document.title = "笺读 · " + book.title;
    try { await ensureEnglish(book); }
    catch { toast("这本 EPUB 打不开"); }
    renderChrome();
    renderArticle();
    applyAllMarks();
    bindInk();
    requestAnimationFrame(() => drawAllInk());
    renderDock();
    if (!opts.keepScroll) {
      const y = Number(localStorage.getItem(posKey(book.id)) || 0);
      $("#scroll").scrollTop = y;
    }
    saveUI();
    spy();
    document.dispatchEvent(new CustomEvent("jiandu:ready"));
  }

  function renderChrome() {
    const b = S.book;
    $("#bookhead").innerHTML = b ? `
      <p class="book-kicker">${esc(b.series || "书架")}</p>
      <h1 class="book-title">${esc(b.title)}</h1>
      <p class="book-orig">${esc(b.titleOriginal || "")}</p>
      <p class="book-by">${esc(b.author || "")}${b.authorOriginal ? " · " + esc(b.authorOriginal) : ""}</p>
      <div class="shelf">${S.books.map((bk) => `
        <button type="button" data-book="${esc(bk.id)}" class="${bk.id === b.id ? "on" : ""}">
          ${esc(bk.title)}
          <span class="mini">${esc(bk._origin)} · ${esc(bk.author || "")}</span>
        </button>`).join("")}</div>` : "";
    const toc = $("#toc");
    toc.innerHTML = (b.sections || []).map((sec) => `
      <button type="button" data-sec="${esc(sec.id)}">
        ${esc(sec.title)}
        <small>${esc(sec.loc || (sec.kind === "prose" ? "散文" : ""))}</small>
      </button>`).join("");
    document.documentElement.style.setProperty("--read", S.font + "px");
    document.body.dataset.mode = S.mode;
    document.body.dataset.tool = S.tool === "pen" || S.tool === "mark" || S.tool === "erase" ? S.tool : "select";
    $$("#toolbar [data-mode]").forEach((btn) => {
      const on = btn.dataset.mode === S.mode;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$("button[data-tool]").forEach((btn) => {
      const on = btn.dataset.tool === S.tool && (btn.dataset.tool !== "pen" || btn.dataset.color === S.pen);
      btn.classList.toggle("on", on);
    });
    $$(".dock-tabs button").forEach((btn) => btn.classList.toggle("on", btn.dataset.tab === S.tab));
    document.dispatchEvent(new CustomEvent("jiandu:chrome"));
  }

  function blockPlain(block, field) {
    if (field === "source") {
      if (block.lines && block.lines.length) {
        return block.lines.map((ln) => ln.text || "").join("\n");
      }
      return String(block.source || "").replace(/\*/g, "").replace(/※\d+/g, "");
    }
    return String(block.trans || "").replace(/\{\{[\w-]+\}\}/g, "");
  }

  function renderArticle() {
    const b = S.book;
    const paper = $("#paper");
    const parts = [];
    parts.push(`<header class="titleblock">
      <p class="eyebrow">${esc(b.series || "笺读")}</p>
      <h1>${esc(b.title)}</h1>
      ${b.titleOriginal ? `<p class="grktitle">${esc(b.titleOriginal)}</p>` : ""}
      <p class="byline">${esc(b.author || "")}${b.authorOriginal ? "　" + esc(b.authorOriginal) : ""}<br>${esc(b.edition || "")}</p>
    </header>`);
    for (const sec of b.sections.filter(s => s.id === S.sectionId)) {
      parts.push(`<section class="section ${sec.kind === "prose" ? "prose" : "drama"}" id="sec-${esc(sec.id)}" data-sec="${esc(sec.id)}">`);
      parts.push(`<h2>${esc(sec.title)}</h2>`);
      if (sec.loc) parts.push(`<p class="secloc">${esc(sec.loc)}</p>`);
      if (sec.head) parts.push(`<p class="headnote">${esc(sec.head)}</p>`);
      for (const block of sec.blocks || []) {
        if (block.stage && !block.trans) {
          parts.push(`<p class="stage ${block.infer ? "infer" : ""}" id="blk-${esc(block.id)}">${esc(block.stage)}${block.infer ? "　（演出推断，抄本无此提示）" : ""}</p>`);
          continue;
        }
        parts.push(`<div class="block ${esc(block.kind || "")}" id="blk-${esc(block.id)}" data-block="${esc(block.id)}">`);
        if (block.speaker || block.speakerOriginal || block.loc) {
          parts.push(`<div class="bh">
            <span class="spk">${esc(block.speaker || "")}</span>
            <span class="spkg">${esc(block.speakerOriginal || "")}</span>
            <span class="loc">${esc(block.loc || "")}</span>
          </div>`);
        }
        if (block.lines && block.lines.length) {
          parts.push(`<div class="source" data-field="source">${block.lines.map((ln) =>
            `<div class="gl ${ln.text ? "" : "gap"}"><span class="ln">${esc(ln.n)}</span><span class="gt">${esc(ln.text || "〔此本删作衍文〕")}</span></div>`
          ).join("")}</div>`);
        } else if (block.source) {
          parts.push(`<div class="source" data-field="source"><div class="prose-body"></div></div>`);
        } else if (block.hash) {
          parts.push(`<div class="source pending" data-field="source"><div class="prose-body">英文从你的 EPUB 读入。左下角「打开 EPUB」可以选择那本书。</div></div>`);
        }
        if (block.trans) parts.push(`<div class="trans" data-field="trans"><div class="prose-body"></div></div>`);
        parts.push(`</div>`);
      }
      parts.push(`<svg class="ink" data-ink="${esc(sec.id)}"></svg>`);
      parts.push(`</section>`);
    }
    paper.innerHTML = parts.join("");
    for (const sec of b.sections) {
      for (const block of sec.blocks || []) {
        const host = document.getElementById("blk-" + block.id);
        if (!host) continue;
        if (block.source) {
          const src = host.querySelector(".source .prose-body");
          if (src) fillEnglish(src, block.source);
        }
        if (block.trans) {
          const body = host.querySelector(".trans .prose-body");
          if (body) fillBody(body, block.trans);
        }
      }
    }
  }

  function fillEnglish(el, raw) {
    el.textContent = "";
    const re = /\*([^*]+)\*|※(\d+)/g;
    let last = 0;
    let m;
    const frag = document.createDocumentFragment();
    while ((m = re.exec(raw))) {
      frag.append(document.createTextNode(raw.slice(last, m.index)));
      if (m[1] != null) {
        const em = document.createElement("em");
        em.textContent = m[1];
        frag.append(em);
      } else {
        const sup = document.createElement("sup");
        sup.className = "fn";
        sup.dataset.note = "n-fn-" + m[2];
        const note = S.notes["n-fn-" + m[2]];
        sup.textContent = note ? String(note._num) : m[2];
        sup.title = note ? (note.lemma || "疏证") : "";
        frag.append(sup);
      }
      last = m.index + m[0].length;
    }
    frag.append(document.createTextNode(raw.slice(last)));
    el.append(frag);
  }

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("jiandu.epub.v1", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("files");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbGet(key) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const req = db.transaction("files").objectStore("files").get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbSet(key, value) {
    const db = await idbOpen();
    return new Promise((resolve, reject) => {
      const req = db.transaction("files", "readwrite").objectStore("files").put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function epubText(buf, name) {
    const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let eocd = -1;
    for (let i = u8.length - 22; i >= Math.max(0, u8.length - 22 - 65536); i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("epub");
    const cdOff = view.getUint32(eocd + 16, true);
    const cdSize = view.getUint32(eocd + 12, true);
    let p = cdOff;
    const end = cdOff + cdSize;
    while (p < end) {
      if (view.getUint32(p, true) !== 0x02014b50) break;
      const method = view.getUint16(p + 10, true);
      const compSize = view.getUint32(p + 20, true);
      const nameLen = view.getUint16(p + 28, true);
      const extraLen = view.getUint16(p + 30, true);
      const commentLen = view.getUint16(p + 32, true);
      const localOff = view.getUint32(p + 42, true);
      const fileName = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nameLen));
      if (fileName === name) {
        const ln = view.getUint16(localOff + 26, true);
        const le = view.getUint16(localOff + 28, true);
        const dataOff = localOff + 30 + ln + le;
        const data = u8.subarray(dataOff, dataOff + compSize);
        if (method === 0) return new TextDecoder().decode(data);
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
        const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
        return new TextDecoder().decode(inflated);
      }
      p += 46 + nameLen + extraLen + commentLen;
    }
    throw new Error("missing " + name);
  }

  async function ensureEnglish(book) {
    if (!book || !book.epub || !window.CarsonParse) return;
    const slots = [];
    for (const sec of book.sections || []) {
      for (const b of sec.blocks || []) if (b.hash) slots.push(b);
    }
    if (!slots.length || slots.every((b) => b.source)) return;
    let buf = null;
    try { buf = await idbGet(book.id); } catch { buf = null; }
    if (!buf) {
      try {
        const res = await fetch("source/oresteia.epub");
        if (res.ok) {
          buf = await res.arrayBuffer();
          try { await idbSet(book.id, buf); } catch { /* 缓存失败仍可读这一次 */ }
        }
      } catch { buf = null; }
    }
    if (!buf) return;
    const html = await epubText(buf, (book.epub && book.epub.file) || "text/part0003.html");
    const parsed = window.CarsonParse.parseAgamemnon(html);
    if (parsed.length !== slots.length) {
      toast("EPUB 的段落数和译本对不上");
      return;
    }
    let bad = 0;
    slots.forEach((b, i) => { if (b.hash !== parsed[i].hash) bad += 1; });
    if (bad) { toast("有 " + bad + " 段原文未能匹配，请核对 EPUB 版本"); return; }
    slots.forEach((b, i) => { b.source = parsed[i].en; });
  }

  function fillBody(el, raw) {
    el.textContent = "";
    const re = /\{\{([\w-]+)\}\}/g;
    let last = 0;
    let m;
    const frag = document.createDocumentFragment();
    while ((m = re.exec(raw))) {
      frag.append(document.createTextNode(raw.slice(last, m.index)));
      const sup = document.createElement("sup");
      sup.className = "fn";
      sup.dataset.note = m[1];
      const note = S.notes[m[1]];
      sup.textContent = note ? String(note._num) : "*";
      sup.title = note ? (note.lemma || "疏证") : "";
      frag.append(sup);
      last = m.index + m[0].length;
    }
    frag.append(document.createTextNode(raw.slice(last)));
    el.append(frag);
  }

  function eachText(root, fn) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        if (node.parentElement.closest(".fn, .ln")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (w.nextNode()) fn(w.currentNode);
  }

  function fieldUnits(fieldEl) {
    const units = [];
    if (fieldEl.classList.contains("source") && fieldEl.querySelector(".gt")) {
      const rows = $$(".gt", fieldEl);
      rows.forEach((gt, i) => {
        eachText(gt, (node) => units.push({ node, nl: false }));
        if (i < rows.length - 1) units.push({ node: null, nl: true });
      });
      return units;
    }
    const body = fieldEl.querySelector(".prose-body") || fieldEl;
    eachText(body, (node) => units.push({ node, nl: false }));
    return units;
  }

  function fieldString(fieldEl) {
    let s = "";
    for (const u of fieldUnits(fieldEl)) s += u.nl ? "\n" : u.node.nodeValue;
    return s;
  }

  function unwrapMarks(scope) {
    $$("mark.hl", scope).forEach((m) => {
      const p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
      p.normalize();
    });
  }

  function locate(fieldEl, index) {
    let left = index;
    let last = null;
    for (const u of fieldUnits(fieldEl)) {
      if (u.nl) {
        if (left <= 0) return last ? { node: last, offset: last.nodeValue.length } : null;
        left -= 1;
        continue;
      }
      last = u.node;
      if (left <= u.node.nodeValue.length) return { node: u.node, offset: left };
      left -= u.node.nodeValue.length;
    }
    if (!last) return null;
    return { node: last, offset: last.nodeValue.length };
  }

  function wrapRange(fieldEl, start, end, id, color) {
    if (end <= start) return;
    const slices = [];
    let seen = 0;
    for (const u of fieldUnits(fieldEl)) {
      if (u.nl) { seen += 1; continue; }
      const len = u.node.nodeValue.length;
      const from = Math.max(0, start - seen);
      const to = Math.min(len, end - seen);
      if (from < to) slices.push({ node: u.node, from, to });
      seen += len;
    }
    for (let i = slices.length - 1; i >= 0; i--) {
      const { node, from, to } = slices[i];
      const r = document.createRange();
      r.setStart(node, from);
      r.setEnd(node, to);
      const mark = document.createElement("mark");
      mark.className = "hl hl-" + (color || "zhu") + (color === "find" ? " find" : "");
      mark.dataset.hid = id;
      try { r.surroundContents(mark); } catch (err) { /* 跨节点失败时跳过这一小段 */ }
    }
  }

  function applyAllMarks() {
    unwrapMarks($("#paper"));
    const byBlock = {};
    for (const h of S.ann.highlights) {
      (byBlock[h.blockId] ||= []).push(h);
    }
    for (const [blockId, list] of Object.entries(byBlock)) {
      const blockEl = document.getElementById("blk-" + blockId);
      if (!blockEl) continue;
      list.sort((a, b) => b.start - a.start);
      for (const h of list) {
        const field = $(`.${h.field === "source" ? "source" : "trans"}`, blockEl);
        if (!field) continue;
        const plain = fieldString(field);
        let start = h.start;
        let end = h.end;
        if (plain.slice(start, end) !== h.quote) {
          const at = plain.indexOf(h.quote);
          if (at < 0) continue;
          start = at;
          end = at + h.quote.length;
          h.start = start;
          h.end = end;
        }
        wrapRange(field, start, end, h.id, h.color);
      }
    }
  }

  function rangeInField(fieldEl, range) {
    if (!fieldEl || !range || range.collapsed) return null;
    const contains = (node) => node && (fieldEl === node || fieldEl.contains(node));
    if (!contains(range.startContainer) || !contains(range.endContainer)) return null;
    let count = 0;
    let start = null;
    let end = null;
    for (const u of fieldUnits(fieldEl)) {
      if (u.nl) { count += 1; continue; }
      if (u.node === range.startContainer) start = count + range.startOffset;
      if (u.node === range.endContainer) end = count + range.endOffset;
      count += u.node.nodeValue.length;
    }
    if (start == null || end == null || end <= start) return null;
    return { start, end, quote: fieldString(fieldEl).slice(start, end) };
  }

  function drawAllInk() {
    $$("svg.ink").forEach((svg) => {
      const id = svg.dataset.ink;
      const strokes = (S.ann.drawings[id] || []);
      paint(svg, strokes);
    });
  }

  function paint(svg, strokes) {
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    if (w < 2 || h < 2) return;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = strokes.map((st) => {
      const d = st.pts.map((p, i) => `${i ? "L" : "M"}${p[0] * w},${p[1] * h}`).join(" ");
      const color = st.color === "mo" ? "#1c1916" : st.color === "qing" ? "#2d5f86" : "#9c342c";
      const width = st.kind === "mark" ? 16 : (st.width || 1.8);
      const opacity = st.kind === "mark" ? 0.35 : 0.92;
      return `<path data-sid="${st.id}" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
    }).join("");
  }

  function renderDock() {
    const body = $("#dock-body");
    if (S.tab === "how") {
      body.innerHTML = howHtml();
      return;
    }
    if (S.tab === "mine") {
      body.innerHTML = mineHtml();
      return;
    }
    const notes = Object.values(S.notes);
    if (!notes.length) {
      body.innerHTML = "<p class='empty'>这本书还没有疏证。</p>";
      return;
    }
    body.innerHTML = notes.map((n) => `
      <article class="note ${n.id === S.activeNote ? "on" : ""}" id="note-${esc(n.id)}">
        <span class="lemma">${n._num}. ${esc(n.lemma || "注")}<span class="where">　${esc(n._loc || "")}</span></span>
        ${String(n.body || "").split(/\n\n+/).map((p) => `<p>${esc(p)}</p>`).join("")}
      </article>`).join("");
    const on = $("#note-" + (S.activeNote || ""));
    if (on) on.scrollIntoView({ block: "nearest" });
  }

  function mineHtml() {
    const hs = S.ann.highlights;
    const ds = Object.entries(S.ann.drawings).filter(([, v]) => v && v.length);
    if (!hs.length && !ds.length) {
      return "<p class='empty'>还没有批注。选中文字可以圈点或写眉批；朱笔、墨笔和涂抹画在纸上。这些都只存在这台浏览器里，导出后可以带走。</p>";
    }
    const blocks = {};
    for (const sec of S.book.sections) for (const b of sec.blocks || []) blocks[b.id] = { sec, b };
    let html = hs.map((h) => {
      const meta = blocks[h.blockId];
      const where = meta ? `${meta.sec.title} ${meta.b.loc || ""}` : "";
      return `<div class="mine-item" data-hid="${esc(h.id)}">
        <div class="where">${esc(where)}</div>
        <div class="quote">「${esc(h.quote)}」</div>
        <textarea data-hid="${esc(h.id)}" placeholder="眉批">${esc(h.note || "")}</textarea>
        <div class="row-actions">
          <button type="button" data-jump="${esc(h.blockId)}">回到正文</button>
          <button type="button" data-del="${esc(h.id)}">删除圈点</button>
        </div>
      </div>`;
    }).join("");
    if (ds.length) {
      html += `<p class="where">笔迹 ${ds.reduce((n, [, v]) => n + v.length, 0)} 笔</p>`;
      html += `<div class="row-actions"><button type="button" id="clear-ink">清除全部笔迹</button></div>`;
    }
    return html;
  }

  function howHtml() {
    const b = S.book;
    return `<div class="how">
      <h3>这本在读什么</h3>
      <p>${esc(b.basis || "")}</p>
      <h3>你的笔迹</h3>
      <p>圈点、眉批和画上去的笔迹存在本机浏览器，不写进书的文件，也不在预览服务里。关掉服务不会把批注清掉。以后补译只要不改每一段的 id，批注还会对上。换浏览器或清缓存之前，用左下角导出批注。</p>
      <p>这个地址在浏览器里打开过一次之后，预览服务可以关掉，再用同一个地址看。英文一旦读入，也留在这个浏览器里。</p>
      <p>选择文字后可以复制译文、原文、对照或带行号的引文。笔模式时滚轮仍可翻页，Esc 回到选择。</p>
      <h3>再放一本书</h3>
      <p>左下角“导入书籍”，JSON 即可。内置的书不要用同一个 id。以后若把新译本做成 js/books 里的文件，并在 index.html 里加一行 script，它会出现在书架上。</p>
      <p><button type="button" class="linkish" id="dl-template">下载一份空白书的格式</button></p>
      <pre><code>{
  "id": "my-book",
  "title": "书名",
  "titleOriginal": "",
  "author": "作者",
  "authorOriginal": "",
  "translator": "",
  "series": "笺读",
  "edition": "版本说明",
  "basis": "底本与凡例",
  "sections": [
    {
      "id": "ch1",
      "title": "第一章",
      "loc": "",
      "kind": "prose",
      "head": "",
      "blocks": [
        {
          "id": "ch1-1",
          "speaker": "",
          "speakerOriginal": "",
          "loc": "",
          "source": "原文整段。诗行则改用 lines。",
          "lines": [{ "n": 1, "text": "可选" }],
          "trans": "译文。含混处用 {{note-id}} 标在词后。",
          "notes": [{ "id": "note-id", "lemma": "词", "body": "疏证。" }]
        }
      ]
    }
  ]
}</code></pre>
      <h3>快捷键</h3>
      <p>Esc 退出笔。 [ 与 ] 上一节、下一节。 ⌘/Ctrl + F 搜索。 A 旁边的按钮改字号。</p>
    </div>`;
  }

  function spy() {
    const scroll = $("#scroll");
    const secs = $$(".section");
    if (!secs.length) return;
    const top = scroll.getBoundingClientRect().top + 8;
    let current = secs[0].dataset.sec;
    for (const sec of secs) {
      if (sec.getBoundingClientRect().top <= top + 40) current = sec.dataset.sec;
    }
    $$("#toc button").forEach((btn) => btn.classList.toggle("on", btn.dataset.sec === current));
    const max = scroll.scrollHeight - scroll.clientHeight;
    const ratio = max > 0 ? scroll.scrollTop / max : 0;
    $("#progress-bar").style.width = (ratio * 100).toFixed(1) + "%";
    const sec = (S.book.sections || []).find((s) => s.id === current);
    $("#progress-label").textContent = sec ? `${sec.title}　${Math.round(ratio * 100)}%` : "";
    localStorage.setItem(posKey(S.book.id), String(scroll.scrollTop));
  }

  function findHits() {
    const q = S.q.trim();
    if (!q) return [];
    const hits = [];
    const needle = q.toLowerCase();
    for (const sec of S.book.sections) {
      for (const block of sec.blocks || []) {
        const fields = [
          ["trans", blockPlain(block, "trans")],
          ["source", blockPlain(block, "source")],
        ];
        for (const note of block.notes || []) fields.push(["note", (note.lemma || "") + " " + (note.body || "")]);
        for (const [field, text] of fields) {
          const hay = text.toLowerCase();
          let at = 0;
          while ((at = hay.indexOf(needle, at)) >= 0) {
            hits.push({ blockId: block.id, secId: sec.id, field, at, quote: text.slice(Math.max(0, at - 12), at + q.length + 18) });
            at += needle.length;
            if (hits.length > 80) return hits;
          }
        }
      }
    }
    return hits;
  }

  function jumpHit(hit) {
    const el = document.getElementById("blk-" + hit.blockId) || document.getElementById("sec-" + hit.secId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    $$("mark.find").forEach((m) => {
      const p = m.parentNode;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
      p.normalize();
    });
    if (hit.field === "note") {
      S.tab = "notes";
      const note = (S.book.sections.find((s) => s.id === hit.secId).blocks.find((b) => b.id === hit.blockId).notes || [])
        .find((n) => ((n.lemma || "") + " " + n.body).toLowerCase().includes(S.q.trim().toLowerCase()));
      if (note) {
        S.activeNote = note.id;
        renderDock();
      }
      return;
    }
    const field = $(hit.field === "source" ? ".source" : ".trans", el);
    if (!field) return;
    wrapRange(field, hit.at, hit.at + S.q.trim().length, "find", "find");
    const mark = $("mark.hl-find, mark.find", field);
    if (mark) mark.classList.add("find");
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(
      () => toast("已复制"),
      () => toast("复制失败")
    );
  }

  function citation(block, excerpt) {
    const b = S.book;
    const loc = block.loc ? block.loc + "行" : "";
    return `${b.author}《${b.title}》${loc}（${b.cite || "笺读台译本"}）：\n「${excerpt}」`;
  }

  function showPopover(x, y, blockEl, range) {
    const pop = $("#popover");
    const trans = $(".trans", blockEl);
    const source = $(".source", blockEl);
    const hitT = rangeInField(trans, range);
    const hitS = source && source.classList.contains("source") ? rangeInField(source, range) : null;
    const blockId = blockEl.dataset.block;
    const block = findBlock(blockId);
    pop.innerHTML = "";
    const add = (label, fn) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", () => { fn(); pop.hidden = true; window.getSelection().removeAllRanges(); });
      pop.append(btn);
    };
    if (hitT) {
      add("朱", () => addHighlight(blockId, "trans", hitT, "zhu"));
      add("黄", () => addHighlight(blockId, "trans", hitT, "huang"));
      add("青", () => addHighlight(blockId, "trans", hitT, "qing"));
      add("眉批", () => addHighlight(blockId, "trans", hitT, "zhu", true));
    }
    if (hitS) add("圈原文", () => addHighlight(blockId, "source", hitS, "qing"));
    add("译文", () => copyText(hitT ? hitT.quote : blockPlain(block, "trans")));
    add("原文", () => copyText(hitS ? hitS.quote : blockPlain(block, "source")));
    add("对照", () => copyText(blockPlain(block, "source") + "\n\n" + blockPlain(block, "trans")));
    add("引文", () => copyText(citation(block, hitT ? hitT.quote : blockPlain(block, "trans"))));
    pop.hidden = false;
    const rect = pop.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - pop.offsetWidth - 8);
    const top = Math.max(8, y - pop.offsetHeight - 8);
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function findBlock(id) {
    for (const sec of S.book.sections) {
      for (const b of sec.blocks || []) if (b.id === id) return b;
    }
    return null;
  }

  function addHighlight(blockId, field, hit, color, edit) {
    const id = "h" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    S.ann.highlights.push({
      id, blockId, field, start: hit.start, end: hit.end, quote: hit.quote, color, note: "", created: Date.now(),
    });
    saveAnn();
    applyAllMarks();
    if (edit) {
      S.tab = "mine";
      renderDock();
      const ta = $(`textarea[data-hid="${id}"]`);
      if (ta) ta.focus();
    } else toast("已圈点");
  }

  let drawing = null;

  function pointerDown(e) {
    if (!["pen", "mark", "erase"].includes(S.tool)) return;
    const svg = e.currentTarget;
    const secId = svg.dataset.ink;
    const pt = norm(e, svg);
    if (S.tool === "erase") {
      eraseAt(secId, pt);
      return;
    }
    const stroke = {
      id: "s" + Date.now().toString(36),
      color: S.pen,
      kind: S.tool === "mark" ? "mark" : "pen",
      width: S.tool === "mark" ? 16 : 1.8,
      pts: [pt],
    };
    (S.ann.drawings[secId] ||= []).push(stroke);
    drawing = { svg, secId, stroke };
    try { svg.setPointerCapture(e.pointerId); } catch (err) { /* 合成事件或未按下的指针 */ }
    paint(svg, S.ann.drawings[secId]);
  }
  function pointerMove(e) {
    if (!drawing || drawing.svg !== e.currentTarget) return;
    const pt = norm(e, drawing.svg);
    const last = drawing.stroke.pts[drawing.stroke.pts.length - 1];
    const dx = pt[0] - last[0];
    const dy = pt[1] - last[1];
    if (dx * dx + dy * dy < 0.000004) return;
    drawing.stroke.pts.push(pt);
    paint(drawing.svg, S.ann.drawings[drawing.secId]);
  }
  function pointerUp(e) {
    if (!drawing || drawing.svg !== e.currentTarget) return;
    S.undo.push({ secId: drawing.secId, stroke: drawing.stroke });
    drawing = null;
    saveAnn();
  }
  function norm(e, svg) {
    const r = svg.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    ];
  }
  function eraseAt(secId, pt) {
    const svg = $(`svg.ink[data-ink="${CSS.escape(secId)}"]`);
    const list = S.ann.drawings[secId] || [];
    const w = svg.clientWidth || 1;
    const h = svg.clientHeight || 1;
    const px = pt[0] * w;
    const py = pt[1] * h;
    const left = list.filter((st) => !st.pts.some((p) => {
      const dx = p[0] * w - px;
      const dy = p[1] * h - py;
      return dx * dx + dy * dy < 144;
    }));
    if (left.length === list.length) return;
    S.ann.drawings[secId] = left;
    saveAnn();
    paint(svg, left);
  }

  function bindInk() {
    $$("svg.ink").forEach((svg) => {
      svg.addEventListener("pointerdown", pointerDown);
      svg.addEventListener("pointermove", pointerMove);
      svg.addEventListener("pointerup", pointerUp);
      svg.addEventListener("pointercancel", pointerUp);
    });
  }

  function onScroll() { spy(); }

  function initEvents() {
    $("#scroll").addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("click", (e) => {
      const bookBtn = e.target.closest("[data-book]");
      if (bookBtn) { openBook(bookBtn.dataset.book); return; }
      const secBtn = e.target.closest("#toc [data-sec]");
      if (secBtn) {
        goSection(secBtn.dataset.sec);
        document.body.classList.remove("side-on");
        return;
      }
      const mode = e.target.closest("button[data-mode]");
      if (mode) { S.mode = mode.dataset.mode; renderChrome(); saveUI(); return; }
      const tool = e.target.closest("button[data-tool]");
      if (tool) {
        S.tool = tool.dataset.tool;
        if (tool.dataset.color) S.pen = tool.dataset.color;
        renderChrome();
        saveUI();
        return;
      }
      if (e.target.id === "font-dec") { S.font = Math.max(15, S.font - 1); renderChrome(); drawAllInk(); saveUI(); return; }
      if (e.target.id === "font-inc") { S.font = Math.min(26, S.font + 1); renderChrome(); drawAllInk(); saveUI(); return; }
      if (e.target.id === "undo-ink") {
        const last = S.undo.pop();
        if (!last) return;
        S.ann.drawings[last.secId] = (S.ann.drawings[last.secId] || []).filter((s) => s.id !== last.stroke.id);
        saveAnn();
        drawAllInk();
        return;
      }
      if (e.target.id === "dock-toggle") {
        if (window.matchMedia("(max-width: 1100px)").matches) {
          document.body.classList.toggle("dock-on");
        } else {
          document.body.classList.toggle("dock-off");
          e.target.classList.toggle("on", !document.body.classList.contains("dock-off"));
          setTimeout(drawAllInk, 50);
        }
        return;
      }
      if (e.target.id === "nav-toggle") {
        document.body.classList.toggle("side-on");
        return;
      }
      const tab = e.target.closest(".dock-tabs button");
      if (tab) { S.tab = tab.dataset.tab; renderChrome(); renderDock(); saveUI(); return; }
      const fn = e.target.closest(".fn");
      if (fn) {
        S.activeNote = fn.dataset.note;
        S.tab = "notes";
        if (window.matchMedia("(max-width: 1100px)").matches) document.body.classList.add("dock-on");
        document.body.classList.remove("dock-off");
        renderChrome();
        renderDock();
        return;
      }
      const jump = e.target.closest("[data-jump]");
      if (jump) {
        const sec = S.book.sections.find(s => s.blocks.some(b => b.id === jump.dataset.jump));
        if (sec && sec.id !== S.sectionId) goSection(sec.id, jump.dataset.jump);
        const el = document.getElementById("blk-" + jump.dataset.jump);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const del = e.target.closest("[data-del]");
      if (del) {
        S.ann.highlights = S.ann.highlights.filter((h) => h.id !== del.dataset.del);
        saveAnn();
        applyAllMarks();
        renderDock();
        return;
      }
      if (e.target.id === "clear-ink") {
        S.ann.drawings = {};
        S.undo = [];
        saveAnn();
        drawAllInk();
        renderDock();
        return;
      }
      if (e.target.id === "dl-template") downloadTemplate();
      if (e.target.id === "brand-btn") $("#toc").querySelector("button")?.focus();
    });

    $("#dock-body").addEventListener("input", (e) => {
      const ta = e.target.closest("textarea[data-hid]");
      if (!ta) return;
      const h = S.ann.highlights.find((x) => x.id === ta.dataset.hid);
      if (!h) return;
      h.note = ta.value;
      saveAnn();
    });

    document.addEventListener("mouseup", (e) => {
      if (S.tool !== "select") return;
      if (e.target.closest("#popover")) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        $("#popover").hidden = true;
        return;
      }
      const range = sel.getRangeAt(0);
      const blockEl = (range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement
      ).closest(".block");
      if (!blockEl) { $("#popover").hidden = true; return; }
      const rect = range.getBoundingClientRect();
      showPopover(rect.left, rect.top, blockEl, range);
    });
    document.addEventListener("mousedown", (e) => {
      if (!e.target.closest("#popover")) $("#popover").hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        S.tool = "select";
        $("#popover").hidden = true;
        renderChrome();
        saveUI();
      }
      const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      if (typing) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        $("#q").focus();
        $("#q").select();
      }
      if (e.key === "[") moveSec(-1);
      if (e.key === "]") moveSec(1);
    });
    $("#q").addEventListener("input", () => { S.q = $("#q").value; S.findAt = 0; });
    $("#q").addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const hits = findHits();
      if (!hits.length) { toast("没有找到"); return; }
      if (e.shiftKey) S.findAt = (S.findAt - 1 + hits.length) % hits.length;
      else S.findAt = S.findAt % hits.length;
      jumpHit(hits[S.findAt]);
      toast(`${S.findAt + 1} / ${hits.length}`);
      if (!e.shiftKey) S.findAt += 1;
    });
    $("#export-ann").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({
        bookId: S.book.id, exported: new Date().toISOString(), ...S.ann,
      }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = S.book.id + "-批注.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $("#import-ann").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.bookId && data.bookId !== S.book.id) {
          toast("这是另一本书的批注");
          return;
        }
        S.ann.highlights = [...new Map((S.ann.highlights || []).concat(data.highlights || []).map(h => [h.id, h])).values()];
        const drawings = data.drawings || {};
        for (const [k, v] of Object.entries(drawings)) {
          S.ann.drawings[k] = [...new Map((S.ann.drawings[k] || []).concat(v || []).map(s => [s.id, s])).values()];
        }
        saveAnn();
        applyAllMarks();
        drawAllInk();
        renderDock();
        toast("批注已并入");
      } catch (err) {
        toast("这个文件读不了");
      }
    });
    $("#import-book").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data.id || !data.title || !Array.isArray(data.sections)) {
          toast("需要 id、title、sections");
          return;
        }
        if ((window.JIANDU_BOOKS || []).some((b) => b.id === data.id)) {
          toast("这个 id 是内置书，请换一个");
          return;
        }
        const user = JSON.parse(localStorage.getItem(BOOKS_KEY) || "[]").filter((b) => b.id !== data.id);
        user.push(data);
        localStorage.setItem(BOOKS_KEY, JSON.stringify(user));
        S.books = collectBooks();
        openBook(data.id);
        toast("已放上书架");
      } catch (err) {
        toast("这个文件读不了");
      }
    });
    const epubInput = $("#open-epub");
    if (epubInput) {
      epubInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        e.target.value = "";
        if (!file || !S.book) return;
        try {
          const buf = await file.arrayBuffer();
          await idbSet(S.book.id, buf);
          for (const sec of S.book.sections || []) {
            for (const b of sec.blocks || []) if (b.hash) delete b.source;
          }
          await ensureEnglish(S.book);
          renderArticle();
          applyAllMarks();
          bindInk();
          drawAllInk();
          toast("已读入这本 EPUB 的英文");
        } catch (err) {
          toast("这本 EPUB 打不开");
        }
      });
    }
    window.addEventListener("resize", () => drawAllInk());
  }

  function moveSec(dir) {
    const idx = S.book.sections.findIndex(s => s.id === S.sectionId);
    const next = S.book.sections[Math.max(0, Math.min(S.book.sections.length - 1, idx + dir))];
    if (next) goSection(next.id);
  }

  function goSection(id, blockId) {
    if (!S.book.sections.some(s => s.id === id)) return;
    S.sectionId = id;
    renderChrome(); renderArticle(); applyAllMarks(); bindInk(); renderDock();
    $("#scroll").scrollTop = 0;
    requestAnimationFrame(drawAllInk);
    saveUI();
    document.dispatchEvent(new CustomEvent("jiandu:ready", {detail:{blockId}}));
    if (blockId) document.getElementById("blk-" + blockId)?.scrollIntoView({block:"center"});
  }

  window.Jiandu = {get state() { return S; }, goSection, openBook, moveSec, toast, renderDock, saveAnn, applyAllMarks, drawAllInk, copyText, blockPlain, citation};

  function downloadTemplate() {
    const sample = {
      id: "sample-book",
      title: "书名",
      titleOriginal: "",
      author: "作者",
      authorOriginal: "",
      translator: "",
      series: "笺读",
      edition: "版本说明一行",
      basis: "底本、版权与凡例。",
      cite: "译者名",
      sections: [{
        id: "ch1",
        title: "第一章",
        loc: "",
        kind: "prose",
        head: "可以写一段题解。",
        blocks: [{
          id: "ch1-1",
          loc: "",
          source: "原文。",
          trans: "译文。需要注释的词后面写 {{n1}}。",
          notes: [{ id: "n1", lemma: "词", body: "疏证正文。" }],
        }],
      }],
    };
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "笺读书籍格式.json";
    a.click();
  }

  function boot() {
    S.books = collectBooks();
    const ui = loadUI();
    if (ui.mode) S.mode = ui.mode;
    if (ui.font) S.font = ui.font;
    if (ui.tool) S.tool = ui.tool;
    if (ui.pen) S.pen = ui.pen;
    if (ui.tab) S.tab = ui.tab;
    if (ui.sectionId) S.sectionId = ui.sectionId;
    initEvents();
    openBook(ui.bookId);
    $("#dock-toggle").classList.add("on");
  }

  boot();
})();
