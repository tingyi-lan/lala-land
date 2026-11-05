(function () {
  "use strict";
  var entries = window.LANLAN_READING_STARS;
  if (!Array.isArray(entries) || !entries.length) return;
  var storeKey = "lanlan-reading-stars-v1";
  var byId = new Map(entries.map(function (entry) { return [entry.id, entry]; }));
  var state = { drawn: [], saved: [], last: entries[0].id };
  var storageAvailable = true;
  try {
    var stored = JSON.parse(localStorage.getItem(storeKey) || "null");
    if (stored && typeof stored === "object") {
      ["drawn", "saved"].forEach(function (key) {
        state[key] = Array.isArray(stored[key]) ? Array.from(new Set(stored[key].filter(function (id) { return byId.has(id); }))) : [];
      });
      if (byId.has(stored.last)) state.last = stored.last;
    }
  } catch (error) { storageAvailable = false; }

  var activeId = state.last;
  var activeFilter = "all";
  var spinning = false;
  var drawButton = document.getElementById("drawStar");
  var machine = document.getElementById("starMachine");
  var status = document.getElementById("drawStatus");
  var catalogue = document.getElementById("starCatalogue");
  var card = document.getElementById("starReading");
  var saveButton = document.getElementById("saveStar");

  function persist() {
    try { localStorage.setItem(storeKey, JSON.stringify(state)); }
    catch (error) { storageAvailable = false; }
  }
  function douban(entry) {
    return "https://search.douban.com/book/subject_search?search_text=" + encodeURIComponent(entry.book) + "&cat=1001";
  }
  function showEntry(id, shouldScroll) {
    var entry = byId.get(id);
    if (!entry) return;
    activeId = id;
    state.last = id;
    document.getElementById("starCategory").textContent = entry.category;
    document.getElementById("starNumber").textContent = String(entries.indexOf(entry) + 1).padStart(2, "0") + " / " + entries.length;
    document.getElementById("starTitle").textContent = entry.title;
    document.getElementById("starBook").textContent = "《" + entry.book + "》 · " + entry.author;
    var body = document.getElementById("starBody");
    body.replaceChildren();
    entry.paragraphs.forEach(function (paragraph) {
      var p = document.createElement("p");
      p.textContent = paragraph;
      body.appendChild(p);
    });
    document.getElementById("starSource").textContent = "内容来源：" + entry.source;
    document.getElementById("doubanLink").href = douban(entry);
    var starLink = document.getElementById("starExternal");
    starLink.href = douban(entry);
    starLink.setAttribute("aria-label", "在豆瓣检索《" + entry.book + "》");
    updateSaved();
    renderCatalogue();
    persist();
    if (shouldScroll) card.scrollIntoView({ behavior: reducedMotion() ? "instant" : "smooth", block: "start" });
  }
  function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function updateSaved() {
    var saved = state.saved.indexOf(activeId) !== -1;
    saveButton.setAttribute("aria-pressed", String(saved));
    saveButton.textContent = saved ? "已收藏 · 取消" : "收藏这颗星";
  }
  function renderCatalogue() {
    catalogue.replaceChildren();
    var visible = entries.filter(function (entry) {
      return activeFilter === "all" || state[activeFilter].indexOf(entry.id) !== -1;
    });
    document.getElementById("catalogueEmpty").hidden = visible.length > 0;
    visible.forEach(function (entry) {
      var button = document.createElement("button");
      var drawn = state.drawn.indexOf(entry.id) !== -1;
      var saved = state.saved.indexOf(entry.id) !== -1;
      button.type = "button";
      button.className = "catalogue-star" + (drawn ? " drawn" : "") + (saved ? " saved" : "");
      button.dataset.entry = entry.id;
      button.setAttribute("aria-pressed", String(entry.id === activeId));
      button.setAttribute("aria-label", "阅读《" + entry.book + "》：" + entry.title);
      var shape = document.createElement("span");
      shape.className = "star-shape";
      shape.setAttribute("aria-hidden", "true");
      var title = document.createElement("span");
      title.textContent = entry.book;
      var tag = document.createElement("small");
      tag.textContent = saved ? "已收藏" : drawn ? "已抽到" : entry.category;
      button.append(shape, title, tag);
      catalogue.appendChild(button);
    });
    document.getElementById("collectionCount").textContent = state.drawn.length + " / " + entries.length;
    var progress = document.getElementById("collectionProgress");
    progress.max = entries.length;
    progress.value = state.drawn.length;
  }
  function randomIndex(length) {
    if (window.crypto && window.crypto.getRandomValues) {
      var value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return Math.floor(value[0] / 4294967296 * length);
    }
    return Math.floor(Math.random() * length);
  }
  drawButton.addEventListener("click", function () {
    if (spinning) return;
    spinning = true;
    drawButton.disabled = true;
    machine.classList.add("spinning");
    var outlet = document.getElementById("outletStar");
    outlet.classList.remove("delivered");
    status.textContent = "一颗阅读星星，正在路上…";
    var candidates = entries.filter(function (entry) { return state.drawn.indexOf(entry.id) === -1; });
    var completed = candidates.length === 0;
    if (completed) candidates = entries.filter(function (entry) { return entry.id !== activeId; });
    var chosen = candidates[randomIndex(candidates.length)] || entries[0];
    window.setTimeout(function () {
      if (state.drawn.indexOf(chosen.id) === -1) state.drawn.push(chosen.id);
      showEntry(chosen.id, false);
      spinning = false;
      drawButton.disabled = false;
      machine.classList.remove("spinning");
      outlet.classList.add("delivered");
      status.textContent = (completed ? "重逢" : "抽到了") + "《" + chosen.book + "》" +
        (storageAvailable ? (state.drawn.length === entries.length ? " · 全部星星已集齐。" : "。") : "。当前浏览器无法保存进度，本次阅读仍可继续。");
    }, reducedMotion() ? 0 : 760);
  });
  saveButton.addEventListener("click", function () {
    var index = state.saved.indexOf(activeId);
    if (index === -1) state.saved.push(activeId); else state.saved.splice(index, 1);
    persist();
    updateSaved();
    renderCatalogue();
    if (!storageAvailable) status.textContent = "本次收藏已更新；当前浏览器无法保存到下次访问。";
  });
  catalogue.addEventListener("click", function (event) {
    var button = event.target.closest("[data-entry]");
    if (button) showEntry(button.dataset.entry, true);
  });
  document.querySelectorAll("[data-star-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.dataset.starFilter;
      document.querySelectorAll("[data-star-filter]").forEach(function (item) {
        var active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderCatalogue();
    });
  });
  document.querySelectorAll("[data-open-reading]").forEach(function (link) {
    link.addEventListener("click", function () { showEntry(link.dataset.openReading, false); });
  });
  var capsuleColors = ["#efd355", "#71a4cf", "#72ae99", "#f6e8a9"];
  entries.forEach(function (entry, index) {
    var star = document.createElement("span");
    star.className = "star-shape";
    star.style.setProperty("--left", (12 + index % 5 * 17) + "%");
    star.style.setProperty("--top", (20 + Math.floor(index / 5) * 17) + "%");
    star.style.setProperty("--rotate", (index * 31 % 70 - 35) + "deg");
    star.style.setProperty("--color", capsuleColors[index % capsuleColors.length]);
    document.getElementById("capsuleStars").appendChild(star);
  });

  var topics = {
    desire: { label: "欲望与摹仿", text: "从基拉尔的三角欲望，到王国维的“欲之我”：愿望来自哪里，艺术又能让我们离开它多远？", point: [110, 52.5] },
    tragedy: { label: "悲剧与认识", text: "俄狄浦斯的追问与《红楼梦》的关系网络：当人物不能掌握全部处境，理解与责任如何同时成立？", point: [330, 52.5] },
    language: { label: "语言与翻译", text: "严复、钱钟书与本雅明，让翻译从“传达什么”转向“怎样表达”，也让母语重新遇见自身的边界。", point: [387.2, 175] },
    witness: { label: "诗歌与见证", text: "《献辞》中的记录责任，与鲁迅作品不断被重读的历史相连：文字如何抵抗被抹平的经验？", point: [330, 297.5] },
    self: { label: "人物与伦理", text: "从西拉斯的归来，到拉斯柯尔尼科夫的挣扎：一个人是否必须先证明有用，才能被另一个人接纳？", point: [110, 297.5] },
    field: { label: "田野与写作", text: "《遇见东方》的老机器、钥匙声与江水，让理论回到可感的现场。细节怎样承担比口号更长久的记忆？", point: [52.8, 175] }
  };
  var selected = [];
  var clear = document.getElementById("clearConstellation");
  function updateConstellation() {
    var group = document.getElementById("starLines");
    group.replaceChildren();
    function path(a, b, linked) {
      var node = document.createElementNS("http://www.w3.org/2000/svg", "path");
      node.setAttribute("d", "M" + a.join(",") + " L" + b.join(","));
      if (linked) node.setAttribute("class", "linked");
      group.appendChild(node);
    }
    selected.forEach(function (id, index) {
      path([220, 175], topics[id].point, false);
      if (index) path(topics[selected[index - 1]].point, topics[id].point, true);
    });
    document.querySelectorAll("[data-star-topic]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(selected.indexOf(button.dataset.starTopic) !== -1));
    });
    clear.hidden = selected.length === 0;
    document.getElementById("constellationLabel").textContent = selected.length ? selected.map(function (id) { return topics[id].label; }).join(" · ") : "READING CONNECTIONS";
    document.getElementById("constellationText").textContent = selected.length ? topics[selected[selected.length - 1]].text : "从一个人物的欲望，到一种语言的可能。我的阅读在这些问题之间往返。";
  }
  document.querySelectorAll("[data-star-topic]").forEach(function (button) {
    button.addEventListener("click", function () {
      var id = button.dataset.starTopic;
      if (selected.indexOf(id) !== -1) selected = selected.filter(function (item) { return item !== id; });
      else selected.push(id);
      updateConstellation();
    });
  });
  clear.addEventListener("click", function () { selected = []; updateConstellation(); });

  // Extend the existing one-book-per-row list with the documented course readings.
  entries.slice(0, 7).forEach(function (entry, index) {
    var row = document.createElement("article");
    row.className = "book-card";
    row.dataset.topics = "course " + (entry.topic === "desire" ? "desire" : "form");
    var no = document.createElement("span");
    no.className = "book-no";
    no.textContent = String(17 + index) + " / course";
    var bookCover = document.createElement("div");
    bookCover.className = "mini-cover";
    bookCover.style.setProperty("--cover", ["#dceafb", "#e6eddf", "#f3e6b0"][index % 3]);
    var coverTitle = document.createElement("span");
    coverTitle.textContent = entry.book;
    var coverAuthor = document.createElement("small");
    coverAuthor.textContent = entry.author;
    bookCover.append(coverTitle, coverAuthor);
    var title = document.createElement("div");
    title.className = "book-title";
    var heading = document.createElement("h3");
    heading.textContent = "《" + entry.book + "》";
    var author = document.createElement("span");
    author.className = "book-author";
    author.textContent = entry.author;
    title.append(heading, author);
    var description = document.createElement("p");
    description.textContent = entry.title + "。" + entry.paragraphs[0].split("。")[0] + "。";
    var link = document.createElement("a");
    link.className = "book-link";
    link.href = douban(entry);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "豆瓣搜索 ↗";
    row.append(no, bookCover, title, description, link);
    document.getElementById("bookGrid").appendChild(row);
  });
  showEntry(activeId, false);
  if (location.hash === "#chat") location.hash = "stars";
})();
