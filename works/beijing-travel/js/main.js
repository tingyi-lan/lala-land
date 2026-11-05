(function () {
  const trip = window.TRIP_DATA;
  if (!trip) return;

  const storageKey = trip.app && trip.app.storageKey ? trip.app.storageKey : `travelPlanApp:${trip.tripId}:v1`;
  const collections = ["budgetItems", "reservations", "packingItems", "todos"];
  let storageAvailable = true;
  let state = loadState();

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);
  }

  function money(value, currency = "CNY") {
    if (value === null || value === undefined || value === "") return "待核验";
    return `${currency} ${Number(value).toLocaleString("zh-CN")}`;
  }

  function loadState() {
    const base = { version: 1, updatedAt: "", budgetItems: {}, reservations: {}, packingItems: {}, todos: {} };
    try {
      localStorage.setItem(`${storageKey}:test`, "1");
      localStorage.removeItem(`${storageKey}:test`);
      const raw = localStorage.getItem(storageKey);
      return raw ? { ...base, ...JSON.parse(raw) } : base;
    } catch (error) {
      storageAvailable = false;
      return base;
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    if (!storageAvailable) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function baseItems(type) {
    return Array.isArray(trip[type]) ? trip[type] : [];
  }

  function items(type) {
    const map = new Map(baseItems(type).map((item) => [item.id, { ...item }]));
    Object.entries(state[type] || {}).forEach(([id, patch]) => {
      if (patch && patch._deleted) {
        map.delete(id);
      } else {
        map.set(id, { ...(map.get(id) || { id }), ...patch });
      }
    });
    return Array.from(map.values());
  }

  function updateItem(type, id, patch) {
    state[type][id] = { ...(state[type][id] || {}), ...patch };
    saveState();
    renderDashboard();
    if (document.body.dataset.page === "day") renderDayPage();
  }

  function deleteItem(type, id) {
    state[type][id] = { ...(state[type][id] || {}), _deleted: true };
    saveState();
    renderDashboard();
    if (document.body.dataset.page === "day") renderDayPage();
  }

  function addItem(type, item) {
    state[type][item.id] = item;
    saveState();
    renderDashboard();
    if (document.body.dataset.page === "day") renderDayPage();
  }

  function nodeById(id) {
    return (trip.routeMap.nodes || []).find((node) => node.id === id);
  }

  function imageForDay(day) {
    return (trip.images || []).filter((image) => image.day === day);
  }

  function statusLabel(status) {
    return {
      to_book: "待预订",
      to_confirm: "待确认",
      confirmed: "已确认",
      cancelled: "已取消",
      needs_verification: "出发前需核验",
      planned: "计划中",
      optional: "可选"
    }[status] || status || "计划中";
  }

  function phaseLabel(phase) {
    return {
      sevenDaysBefore: "7 天前",
      threeDaysBefore: "3 天前",
      oneDayBefore: "1 天前",
      eachMorning: "每天早晨",
      eachNight: "每天晚上",
      beforeReturn: "返程前"
    }[phase] || phase;
  }

  function initHome() {
    renderSummary();
    renderDayCards();
    renderPhotoOverview();
    renderPlanB();
    renderDashboard();
    initMap("real-map");
    initReveal();
    bindHomeControls();
  }

  function renderSummary() {
    const root = $("#trip-summary");
    if (!root) return;
    const budgetTotal = items("budgetItems").reduce((sum, item) => sum + Number(item.actualAmount ?? item.plannedAmount ?? 0), 0);
    root.innerHTML = [
      ["日期", `${trip.startDate} 至 ${trip.endDate}`],
      ["路线", trip.recommendedRoute],
      ["天气策略", trip.weatherOverview.map((w) => `${w.date} ${w.summary}`).join(" / ")],
      ["预算占位", money(budgetTotal)]
    ].map(([title, body]) => `<article class="card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("");
  }

  function renderDayCards() {
    const root = $("#day-cards");
    if (!root) return;
    root.innerHTML = trip.days.map((day) => `
      <article class="day-card">
        <h3>DAY${day.day}｜${esc(day.theme)}</h3>
        <p class="muted">${esc(day.date)} · ${esc(day.city)} · ${esc(day.weather.condition)}</p>
        <p>${esc(day.route.join(" -> "))}</p>
        <p><strong>步数：</strong>${esc(day.walking.steps)}｜<strong>强度：</strong>${esc(day.walking.intensity)}</p>
        <a href="./days/day${String(day.day).padStart(2, "0")}.html">查看 DAY${day.day}</a>
      </article>
    `).join("");
  }

  function renderPhotoOverview() {
    const root = $("#photo-overview");
    if (!root) return;
    root.innerHTML = trip.days.flatMap((day) => (day.photoPlan || []).slice(0, 1).map((photo) => `
      <article class="card">
        <h3>DAY${day.day}｜${esc(photo.shotName)}</h3>
        <p><strong>机位：</strong>${esc(photo.spot)}</p>
        <p><strong>时间：</strong>${esc(photo.bestTime)}</p>
        <p class="muted">${esc(photo.composition)}；${esc(photo.devicePlan)}</p>
      </article>
    `)).join("");
  }

  function renderPlanB() {
    const root = $("#plan-b");
    if (!root) return;
    root.innerHTML = (trip.planB || []).map((item) => `
      <article class="card"><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></article>
    `).join("");
  }

  function initReveal() {
    const slider = $("#reveal-slider");
    const cover = $("#paper-cover");
    if (!slider || !cover) return;
    slider.addEventListener("input", () => {
      if (Number(slider.value) > 82) {
        cover.classList.add("open");
        setTimeout(() => $(".map-section")?.scrollIntoView({ behavior: "smooth" }), 380);
      }
    });
  }

  function initMap(id, day) {
    const root = document.getElementById(id);
    if (!root) return;
    const fallback = $("#map-fallback");
    const nodes = (trip.routeMap.nodes || []).filter((node) => node.lat && node.lng && (!day || node.day === day || node.type === "hotel"));
    if (!window.L || !nodes.length) {
      if (fallback) {
        fallback.style.display = "block";
        fallback.innerHTML = nodes.map((node) => `<p><strong>${esc(node.name)}</strong>：${esc(node.role)} (${node.lat}, ${node.lng})</p>`).join("");
      }
      return;
    }
    const map = L.map(root, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    const latlngs = [];
    nodes.forEach((node) => {
      const latlng = [node.lat, node.lng];
      latlngs.push(latlng);
      L.marker(latlng).addTo(map).bindPopup(`
        <strong>${esc(node.name)}</strong><br>
        DAY${esc(node.day)} ${esc(node.time)}<br>
        ${esc(node.role)}<br>
        <small>${esc(node.riskNote)}</small>
      `);
    });
    (trip.routeMap.lines || []).filter((line) => !day || line.day === day).forEach((line) => {
      const lineLatLngs = line.nodeIds.map(nodeById).filter(Boolean).filter((node) => node.lat && node.lng).map((node) => [node.lat, node.lng]);
      if (lineLatLngs.length > 1) L.polyline(lineLatLngs, { color: "#b43d2a", weight: 3, opacity: 0.78 }).addTo(map);
    });
    map.fitBounds(latlngs, { padding: [28, 28] });
  }

  function renderDashboard() {
    renderBudget();
    renderReservations();
    renderPacking();
    renderTodos();
  }

  function renderBudget() {
    const root = $("#panel-budget");
    if (!root) return;
    const data = items("budgetItems");
    const planned = data.reduce((sum, item) => sum + Number(item.plannedAmount || 0), 0);
    const actual = data.reduce((sum, item) => sum + Number(item.actualAmount ?? item.plannedAmount ?? 0), 0);
    const byCategory = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.actualAmount ?? item.plannedAmount ?? 0);
      return acc;
    }, {});
    root.innerHTML = `
      <div class="module-summary">
        <article class="module-card"><h3>计划总额</h3><p>${money(planned)}</p></article>
        <article class="module-card"><h3>当前总额</h3><p>${money(actual)}</p></article>
        <article class="module-card"><h3>待核验</h3><p>${data.filter((i) => i.status === "needs_verification").length} 项</p></article>
      </div>
      <div class="card"><h3>分类</h3><p>${Object.entries(byCategory).map(([k, v]) => `<span class="tag">${esc(k)} ${money(v)}</span>`).join(" ")}</p></div>
      <div class="toolbar"><button type="button" data-add="budgetItems">新增预算</button></div>
      <div class="table-wrap"><table><thead><tr><th>项目</th><th>金额</th><th>状态</th><th>备注</th><th>操作</th></tr></thead><tbody>
        ${data.map((item) => `<tr>
          <td>${esc(item.title)}<br><span class="muted">${esc(item.category)}</span></td>
          <td>${money(item.actualAmount ?? item.plannedAmount, item.currency)}</td>
          <td><span class="status-chip status-${esc(item.status)}">${esc(statusLabel(item.status))}</span></td>
          <td>${esc(item.note || item.verificationNote || "")}</td>
          <td class="row-actions">
            <button type="button" data-paid="${esc(item.id)}">${item.paid ? "取消已付" : "标记已付"}</button>
            <button type="button" data-edit-budget="${esc(item.id)}">编辑</button>
            <button type="button" data-delete-budget="${esc(item.id)}">删除</button>
          </td>
        </tr>`).join("")}
      </tbody></table></div>
    `;
    root.onclick = (event) => handleBudgetClick(event);
  }

  function handleBudgetClick(event) {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.add) {
      const title = prompt("预算项目名称");
      if (!title) return;
      const amount = Number(prompt("计划金额", "100") || 0);
      addItem("budgetItems", { id: `budget-local-${Date.now()}`, category: "other", title, plannedAmount: amount, actualAmount: null, currency: "CNY", paid: false, status: "planned", note: "本地新增" });
    }
    if (target.dataset.paid) {
      const item = items("budgetItems").find((row) => row.id === target.dataset.paid);
      updateItem("budgetItems", item.id, { paid: !item.paid });
    }
    if (target.dataset.editBudget) {
      const item = items("budgetItems").find((row) => row.id === target.dataset.editBudget);
      const amount = Number(prompt("实际/当前金额", item.actualAmount ?? item.plannedAmount) || item.plannedAmount);
      updateItem("budgetItems", item.id, { actualAmount: amount });
    }
    if (target.dataset.deleteBudget) deleteItem("budgetItems", target.dataset.deleteBudget);
  }

  function renderReservations() {
    const root = $("#panel-reservations");
    if (!root) return;
    const data = items("reservations");
    root.innerHTML = `
      <div class="module-summary">
        <article class="module-card"><h3>总预订</h3><p>${data.length} 项</p></article>
        <article class="module-card"><h3>待处理</h3><p>${data.filter((i) => i.status !== "confirmed" && i.status !== "cancelled").length} 项</p></article>
        <article class="module-card"><h3>高风险</h3><p>${data.filter((i) => i.status === "needs_verification" || i.status === "to_book").length} 项</p></article>
      </div>
      <div class="toolbar"><button type="button" data-add="reservations">新增预订</button></div>
      <div class="table-wrap"><table><thead><tr><th>项目</th><th>日期</th><th>状态</th><th>核验</th><th>操作</th></tr></thead><tbody>
        ${data.map((item) => `<tr>
          <td>${esc(item.title)}<br><span class="muted">${esc(item.type)} ${item.bookingUrl ? `｜<a href="${esc(item.bookingUrl)}" target="_blank" rel="noreferrer">官方/预约</a>` : ""}</span></td>
          <td>${esc(item.date || "")} ${esc(item.time || "")}</td>
          <td><select data-reservation-status="${esc(item.id)}">
            ${["to_book","to_confirm","confirmed","cancelled","needs_verification"].map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${statusLabel(status)}</option>`).join("")}
          </select></td>
          <td>${esc(item.verificationNote || item.documentNote || "")}</td>
          <td class="row-actions"><button type="button" data-delete-reservation="${esc(item.id)}">删除</button></td>
        </tr>`).join("")}
      </tbody></table></div>
    `;
    root.onchange = (event) => {
      if (event.target.dataset.reservationStatus) updateItem("reservations", event.target.dataset.reservationStatus, { status: event.target.value });
    };
    root.onclick = (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.add) {
        const title = prompt("预订项目名称");
        if (!title) return;
        addItem("reservations", { id: `reservation-local-${Date.now()}`, type: "other", title, status: "to_book", date: "", time: "", verificationNote: "本地新增" });
      }
      if (target.dataset.deleteReservation) deleteItem("reservations", target.dataset.deleteReservation);
    };
  }

  function renderPacking() {
    const root = $("#panel-packing");
    if (!root) return;
    const data = items("packingItems");
    const done = data.filter((item) => item.packed).length;
    const categories = groupBy(data, "category");
    root.innerHTML = `
      <div class="module-summary">
        <article class="module-card"><h3>打包进度</h3><p>${done}/${data.length}</p><div class="progress"><span style="width:${data.length ? Math.round(done / data.length * 100) : 0}%"></span></div></article>
        <article class="module-card"><h3>必带</h3><p>${data.filter((i) => i.required && !i.packed).length} 项未完成</p></article>
        <article class="module-card"><h3>分类</h3><p>${Object.keys(categories).length} 类</p></article>
      </div>
      <div class="toolbar"><button type="button" data-add="packingItems">新增打包项</button></div>
      ${Object.entries(categories).map(([category, rows]) => `<div class="packing-group card">
        <h3>${esc(category)}</h3>
        ${rows.map((item) => `<label class="check-row ${item.packed ? "done" : ""}">
          <input type="checkbox" data-pack="${esc(item.id)}" ${item.packed ? "checked" : ""}>
          <span><strong>${esc(item.name)}</strong><br><span class="muted">数量 ${esc(item.quantity || 1)}｜${esc(item.note || "")}</span></span>
          <span class="row-actions"><button type="button" data-delete-pack="${esc(item.id)}">删除</button></span>
        </label>`).join("")}
      </div>`).join("")}
    `;
    root.onchange = (event) => {
      if (event.target.dataset.pack) updateItem("packingItems", event.target.dataset.pack, { packed: event.target.checked });
    };
    root.onclick = (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.add) {
        const name = prompt("打包项名称");
        if (!name) return;
        addItem("packingItems", { id: `packing-local-${Date.now()}`, category: "other", name, quantity: 1, required: false, packed: false, note: "本地新增" });
      }
      if (target.dataset.deletePack) deleteItem("packingItems", target.dataset.deletePack);
    };
  }

  function renderTodos() {
    const root = $("#panel-todos");
    if (!root) return;
    const data = items("todos");
    const done = data.filter((item) => item.status === "done").length;
    const groups = groupBy(data, "phase");
    root.innerHTML = `
      <div class="module-summary">
        <article class="module-card"><h3>Todo 进度</h3><p>${done}/${data.length}</p><div class="progress"><span style="width:${data.length ? Math.round(done / data.length * 100) : 0}%"></span></div></article>
        <article class="module-card"><h3>高优先级</h3><p>${data.filter((i) => i.priority === "high" && i.status !== "done").length} 项未完成</p></article>
        <article class="module-card"><h3>阶段</h3><p>${Object.keys(groups).length} 组</p></article>
      </div>
      <div class="toolbar"><button type="button" data-add="todos">新增 Todo</button></div>
      ${Object.entries(groups).map(([phase, rows]) => `<div class="todo-group card">
        <h3>${esc(phaseLabel(phase))}</h3>
        ${rows.map((item) => `<label class="check-row ${item.status === "done" ? "done" : ""}">
          <input type="checkbox" data-todo="${esc(item.id)}" ${item.status === "done" ? "checked" : ""}>
          <span><strong>${esc(item.title)}</strong><br><span class="muted">${esc(item.priority)}｜${esc(item.verificationNote || "")}</span></span>
          <span class="row-actions"><button type="button" data-delete-todo="${esc(item.id)}">删除</button></span>
        </label>`).join("")}
      </div>`).join("")}
    `;
    root.onchange = (event) => {
      if (event.target.dataset.todo) updateItem("todos", event.target.dataset.todo, { status: event.target.checked ? "done" : "open" });
    };
    root.onclick = (event) => {
      const target = event.target.closest("button");
      if (!target) return;
      if (target.dataset.add) {
        const title = prompt("Todo 名称");
        if (!title) return;
        addItem("todos", { id: `todo-local-${Date.now()}`, phase: "oneDayBefore", title, priority: "medium", status: "open", verificationNote: "本地新增" });
      }
      if (target.dataset.deleteTodo) deleteItem("todos", target.dataset.deleteTodo);
    };
  }

  function groupBy(rows, key) {
    return rows.reduce((acc, row) => {
      const name = row[key] || "other";
      acc[name] = acc[name] || [];
      acc[name].push(row);
      return acc;
    }, {});
  }

  function bindHomeControls() {
    $all(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $all(".tab").forEach((t) => t.classList.toggle("is-active", t === tab));
        $all(".panel").forEach((panel) => panel.classList.toggle("is-active", panel.id === `panel-${tab.dataset.tab}`));
      });
    });
    $("#export-progress")?.addEventListener("click", exportProgress);
    $("#import-progress")?.addEventListener("change", importProgress);
    $("#reset-progress")?.addEventListener("click", resetProgress);
    $("#export-poster")?.addEventListener("click", exportPoster);
    if (!storageAvailable) {
      const warning = $("#storage-warning");
      if (warning) {
        warning.hidden = false;
        warning.textContent = "当前浏览器不允许 localStorage，本地勾选和修改不会保存。基础行程仍可阅读。";
      }
    }
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${trip.tripId}-local-progress.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importProgress(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = { ...state, ...JSON.parse(reader.result) };
        saveState();
        renderDashboard();
      } catch (error) {
        alert("导入失败：JSON 格式不正确。");
      }
    };
    reader.readAsText(file);
  }

  function resetProgress() {
    if (!confirm("确定清空本地进度？基础行程不会删除。")) return;
    state = { version: 1, updatedAt: "", budgetItems: {}, reservations: {}, packingItems: {}, todos: {} };
    if (storageAvailable) localStorage.removeItem(storageKey);
    renderDashboard();
  }

  function exportPoster() {
    const target = $("#poster");
    if (!target || !window.html2canvas) {
      alert("长图工具未加载，可使用浏览器截图或打印导出。");
      return;
    }
    html2canvas(target, { useCORS: true, backgroundColor: "#fff8ef" }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${trip.tripId}-poster.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch(() => alert("地图或跨域图片可能阻止长图导出，请使用浏览器截图或打印。"));
  }

  function renderDayPage() {
    const dayNum = Number(document.body.dataset.day);
    const day = trip.days.find((row) => row.day === dayNum);
    const root = $("#day-root");
    if (!day || !root) return;
    const imgs = imageForDay(day.day);
    root.innerHTML = `
      <header class="day-hero">
        <div class="day-topbar">
          <a href="../index.html">返回首页</a>
          <span class="status-chip">${esc(trip.app.mode)}｜本地保存</span>
        </div>
        <div class="day-title">
          <div class="day-badge">D${day.day}</div>
          <h1>${esc(day.theme)}</h1>
          <p class="muted">${esc(day.date)} · ${esc(day.city)} · ${esc(day.route.join(" -> "))}</p>
        </div>
        <div class="meta-grid">
          <div><strong>天气</strong><br>${esc(day.weather.condition)} ${esc(day.weather.high)}/${esc(day.weather.low)}</div>
          <div><strong>衣着</strong><br>${esc(day.weather.clothingAdvice)}</div>
          <div><strong>住宿</strong><br>${esc(day.hotel)}</div>
          <div><strong>步数</strong><br>${esc(day.walking.steps)} · ${esc(day.walking.intensity)}</div>
        </div>
      </header>
      <section class="section">
        <div class="section-heading"><p>每日路线概览</p><h2>DAY${day.day} 行程</h2></div>
        <div class="day-route-layout">
          <div>${day.timeSlots.map((slot) => `<article class="time-card">
            <h3>${esc(slot.time)}｜${esc(slot.title)}</h3>
            <p><strong>地点：</strong>${esc(slot.place)}</p>
            <p><strong>交通：</strong>${esc(slot.transport)}｜<strong>费用：</strong>${esc(slot.cost)}｜<strong>步行：</strong>${esc(slot.walking)}</p>
            <p>${esc(slot.handbook)}</p>
            <p class="muted"><strong>延误取舍：</strong>${esc(slot.cutIfDelayed)}</p>
          </article>`).join("")}</div>
          <aside><div id="daily-map" class="daily-map" aria-label="DAY${day.day} 路线地图"></div></aside>
        </div>
      </section>
      <section class="section">
        <div class="section-heading"><p>图片与机位</p><h2>核心现场图</h2></div>
        <div class="spot-grid">${imgs.map((image) => `<article class="spot-card">
          <img class="spot-image" src="${esc(image.url)}" alt="${esc(image.alt)}">
          <h3>${esc(image.title)}</h3>
          <p class="caption">来源：<a href="${esc(image.sourceUrl)}" target="_blank" rel="noreferrer">${esc(image.source)}</a>。${esc(image.biasWarning)}</p>
        </article>`).join("")}</div>
      </section>
      <section class="section">
        <div class="section-heading"><p>经典出片打卡指南</p><h2>手机优先拍法</h2></div>
        <div class="grid photo-grid">${(day.photoPlan || []).map((photo) => `<article class="card">
          <h3>${esc(photo.shotName)}</h3>
          <p><strong>机位：</strong>${esc(photo.spot)}｜<strong>时间：</strong>${esc(photo.bestTime)}</p>
          <p><strong>姿势：</strong>${esc(photo.pose)}</p>
          <p><strong>构图：</strong>${esc(photo.composition)}</p>
          <p><strong>穿搭/道具：</strong>${esc(photo.outfit)}；${esc(photo.props)}</p>
          <p class="muted">${esc(photo.devicePlan)}｜${esc(photo.weatherAndCrowdFallback)}</p>
        </article>`).join("")}</div>
      </section>
      <section class="section">
        <div class="section-heading"><p>今日准备</p><h2>预算、预订、打包和 Todo</h2></div>
        <div class="grid day-grid">
          ${renderDayModule("预算", items("budgetItems").filter((i) => i.day === day.day || i.day === null).map((i) => `${i.title}：${money(i.actualAmount ?? i.plannedAmount, i.currency)}`))}
          ${renderDayModule("预订", items("reservations").filter((i) => i.day === day.day || i.day === null).map((i) => `${i.title}：${statusLabel(i.status)}`))}
          ${renderDayModule("打包提醒", items("packingItems").filter((i) => i.required).map((i) => `${i.packed ? "已打包" : "未打包"}：${i.name}`))}
          ${renderDayModule("Todo", items("todos").filter((i) => i.day === day.day || i.day === null).map((i) => `${i.status === "done" ? "已完成" : "待处理"}：${i.title}`))}
        </div>
      </section>
      <section class="section">
        <div class="section-heading"><p>Plan B</p><h2>天气与体力调整</h2></div>
        <div class="grid plan-grid">${Object.entries(day.backupPlan || {}).map(([key, vals]) => `<article class="card"><h3>${esc(key)}</h3><p>${esc((vals || []).join("；"))}</p></article>`).join("")}</div>
      </section>
      <footer class="footer"><a href="../index.html">返回首页</a><span>${prevNextLinks(day.day)}</span></footer>
    `;
    initMap("daily-map", day.day);
  }

  function renderDayModule(title, rows) {
    return `<article class="card"><h3>${esc(title)}</h3>${rows.length ? rows.map((row) => `<p>${esc(row)}</p>`).join("") : "<p class='muted'>今日无单独项目。</p>"}</article>`;
  }

  function prevNextLinks(day) {
    const prev = day > 1 ? `<a href="./day${String(day - 1).padStart(2, "0")}.html">上一天</a>` : "";
    const next = day < trip.days.length ? `<a href="./day${String(day + 1).padStart(2, "0")}.html">下一天</a>` : "";
    return [prev, next].filter(Boolean).join(" · ");
  }

  if (document.body.dataset.page === "home") initHome();
  if (document.body.dataset.page === "day") renderDayPage();
})();
