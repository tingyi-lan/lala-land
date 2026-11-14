/* 从 Anne Carson《An Oresteia》EPUB 的 part0003.html 抽出《阿伽门农》。
   浏览器和翻译脚本共用这一份，好让英文段落和中文对得上。 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CarsonParse = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const KEEP = new Set([
    "p", "p-indent", "p-blocktext", "illustypefullpageimage",
    "title-chapter", "title-section", "title-toc", "author", "verse", "source",
  ]);
  const SPK = /^([A-Z][A-Z ]{1,}[A-Z]) :\s*(.*)$/;
  function isPersonLine(text) {
    const t = bare(text);
    if (/^[A-Z][A-Z]+(?:\s+[A-Z][A-Z]+)*(?:\s+[A-Z])?$/.test(t)) return true;
    return /^[A-Z][A-Z]+(?:\s+[A-Z][A-Z]+)*(?:\s+[A-Z])?\s+\S/.test(t) && /[a-z]/.test(t);
  }

  function bare(s) {
    return String(s).replace(/\*/g, "").trim();
  }
  function isStage(text) {
    const t = bare(text);
    return (t.startsWith("[") && t.endsWith("]")) || t.startsWith("SETTING:");
  }

  function djb2(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  }

  function normalize(s) {
    const lines = String(s).replace(/\u00a0/g, " ").split("\n")
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    return lines.join("\n");
  }

  function extractItems(html) {
    const items = [];
    let i = 0;
    const stack = [];
    let cap = null;
    while (i < html.length) {
      if (html.charAt(i) !== "<") {
        const end = html.indexOf("<", i);
        const data = html.slice(i, end === -1 ? html.length : end);
        if (cap) cap.parts.push(data);
        i = end === -1 ? html.length : end;
        continue;
      }
      const end = html.indexOf(">", i);
      if (end < 0) break;
      let raw = html.slice(i + 1, end).trim();
      i = end + 1;
      if (raw.startsWith("!") || raw.startsWith("?")) continue;
      const closing = raw.startsWith("/");
      if (closing) raw = raw.slice(1).trim();
      const selfClosing = /\/$/.test(raw);
      raw = raw.replace(/\/$/, "").trim();
      const tag = (raw.match(/^[\w:-]+/) || [""])[0].toLowerCase();
      const cls = (raw.match(/class="([^"]*)"/) || ["", ""])[1];
      const italic = cls.split(/\s+/).includes("i");
      if (!closing) {
        if (tag === "div" && KEEP.has(cls) && !cap) cap = { cls, parts: [] };
        else if (tag === "br" && cap) cap.parts.push("\n");
        else if (tag === "span" && italic && cap) cap.parts.push("*");
        else if (tag === "sup" && cap) cap.parts.push("※");
        if (!selfClosing && tag) stack.push({ tag, cls });
        continue;
      }
      const top = stack.pop();
      if (tag === "span" && top && String(top.cls).split(/\s+/).includes("i") && cap) cap.parts.push("*");
      if (tag === "div" && cap && top && top.tag === "div" && top.cls === cap.cls) {
        const text = normalize(cap.parts.join(""));
        if (text) items.push({ cls: cap.cls, text });
        cap = null;
      }
    }
    return items;
  }

  function blockText(b) {
    if (b.lines) return b.lines.join("\n");
    return b.text || "";
  }

  function group(items) {
    const blocks = [];
    let section = "FRONT";
    let cur = null;
    let speaker = null;
    const flush = () => { if (cur) { blocks.push(cur); cur = null; } };
    for (const { cls, text } of items) {
      if (cls === "title-chapter" || cls === "title-section") {
        flush(); speaker = null; section = text;
        blocks.push({ kind: "head", section, text });
        continue;
      }
      if (cls === "author") {
        flush(); speaker = null;
        blocks.push({ kind: "author", section, text });
        continue;
      }
      if (cls === "p-blocktext" && isPersonLine(text)) {
        flush(); speaker = null;
        blocks.push({ kind: "person", section, text });
        continue;
      }
      if (isStage(text)) {
        flush();
        blocks.push({ kind: "stage", section, text });
        continue;
      }
      const m = text.match(SPK);
      if (m) {
        flush();
        speaker = m[1].trim();
        cur = { kind: "speech", section, speaker, lines: m[2] ? [m[2]] : [] };
        continue;
      }
      if (!cur && speaker && (cls === "p" || cls === "p-indent" || cls === "illustypefullpageimage" || cls === "p-blocktext")) {
        cur = { kind: "speech", section, speaker, lines: [text] };
        continue;
      }
      if (!cur) blocks.push({ kind: cls === "p-blocktext" ? "quote" : "prose", section, text });
      else cur.lines.push(text);
    }
    flush();
    blocks.forEach((b, i) => {
      b.id = "c-" + String(i + 1).padStart(4, "0");
      b.en = blockText(b);
      b.hash = djb2(b.en);
    });
    return blocks;
  }

  function parsePlay(html) {
    return group(extractItems(html));
  }

  return { parseAgamemnon: parsePlay, parsePlay, djb2, extractItems };
});
