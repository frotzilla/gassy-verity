// Random voice clips. Drop audio files onto the page (or use the clips panel) and they play
// now and then on farts, blasts and poops.
//
// Dropped clips are stored in this browser only (IndexedDB), never uploaded anywhere.
// You can also ship clips with the page: put files in clips/ and list their names in
// clips/manifest.json, e.g. ["meow.mp3", "oh-no.wav"]. (That needs a web server, not file://.)
GV.clips = (() => {
  const cfg = GV.config.clips;
  const PREFS = "gassyVerity.clips.prefs.v1";
  const btn = document.getElementById("clipsBtn");
  const panel = document.getElementById("clipsPanel");
  const dropHint = document.getElementById("dropHint");

  let list = [];                         // { id, name, url, shipped }
  let prefs = { chance: cfg.chance, volume: cfg.volume };
  let lastPlay = 0, db = null;

  try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(PREFS) || "{}") }; } catch (e) {}
  const savePrefs = () => { try { localStorage.setItem(PREFS, JSON.stringify(prefs)); } catch (e) {} };

  // ---- storage ----
  function open() {
    return new Promise(res => {
      if (!window.indexedDB) return res(null);
      const rq = indexedDB.open("gassyVerity.clips", 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore("clips", { keyPath: "id", autoIncrement: true });
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => res(null);
    });
  }
  const tx = (mode, fn) => new Promise(res => {
    if (!db) return res(null);
    const t = db.transaction("clips", mode), store = t.objectStore("clips"), rq = fn(store);
    t.oncomplete = () => res(rq ? rq.result : true);
    t.onerror = t.onabort = () => res(null);
  });

  async function load() {
    db = await open();
    const rows = (await tx("readonly", s => s.getAll())) || [];
    list = rows.map(r => ({ id: r.id, name: r.name, url: URL.createObjectURL(r.blob), shipped: false }));
    try {                                // optional shipped clips
      const r = await fetch("clips/manifest.json");
      if (r.ok) for (const name of await r.json()) if (typeof name === "string") list.push({ id: "f:" + name, name, url: "clips/" + encodeURIComponent(name), shipped: true });
    } catch (e) {}
    render();
  }

  async function add(files) {
    let added = 0, skipped = 0;
    for (const f of files) {
      const ok = f.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(f.name);
      if (!ok || f.size > cfg.maxBytes || list.filter(c => !c.shipped).length >= cfg.maxCount) { skipped++; continue; }
      const id = await tx("readwrite", s => s.add({ name: f.name, blob: f, type: f.type, size: f.size }));
      if (id == null) { skipped++; continue; }
      list.push({ id, name: f.name, url: URL.createObjectURL(f), shipped: false }); added++;
    }
    render();
    GV.ui.toast(added ? "Added " + added + " clip" + (added > 1 ? "s" : "") : "No clips added", 1500);
    if (skipped) setTimeout(() => GV.ui.toast("Skipped " + skipped + " (audio files under " + Math.round(cfg.maxBytes / 1e6) + " MB, max " + cfg.maxCount + ")", 2500), 1700);
  }

  async function remove(id) {
    const c = list.find(x => x.id === id); if (!c || c.shipped) return;
    await tx("readwrite", s => s.delete(id));
    URL.revokeObjectURL(c.url);
    list = list.filter(x => x.id !== id);
    render();
  }

  // ---- playback ----
  function play(c) {
    const a = new Audio(c.url); a.volume = prefs.volume;
    a.play().catch(() => {});
  }

  // kind: "fart" (normal chance) or "big" (blast, finale, poop).
  function maybe(kind = "fart") {
    if (!list.length) return;
    const now = performance.now();
    if (now - lastPlay < cfg.minGapMs) return;
    if (Math.random() > (kind === "big" ? cfg.bigChance : prefs.chance)) return;
    lastPlay = now;
    play(list[Math.random() * list.length | 0]);
  }

  // ---- panel ----
  const esc = s => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  function render() {
    panel.innerHTML =
      `<div class="shopHead"><b>Voice clips</b></div>` +
      `<p class="small">Drop audio files anywhere on the page, or pick them here. They play at random on farts. Stored in this browser only.</p>` +
      `<label class="pick"><input type="file" id="clipFile" accept="audio/*" multiple hidden>add clips</label>` +
      `<div class="row"><span>chance</span><input type="range" id="clipChance" min="0" max="100" value="${Math.round(prefs.chance * 100)}"><b>${Math.round(prefs.chance * 100)}%</b></div>` +
      `<div class="row"><span>volume</span><input type="range" id="clipVol" min="0" max="100" value="${Math.round(prefs.volume * 100)}"><b>${Math.round(prefs.volume * 100)}%</b></div>` +
      (list.length ? "" : `<div class="none">No clips yet.</div>`) +
      list.map(c => `<div class="clip"><span title="${esc(c.name)}">${esc(c.name)}</span>` +
        `<button type="button" data-play="${c.id}">play</button>` +
        (c.shipped ? "" : `<button type="button" data-del="${c.id}">x</button>`) + `</div>`).join("");
  }

  panel.addEventListener("input", e => {
    if (e.target.id === "clipChance") { prefs.chance = e.target.value / 100; e.target.nextElementSibling.textContent = e.target.value + "%"; savePrefs(); }
    if (e.target.id === "clipVol") { prefs.volume = e.target.value / 100; e.target.nextElementSibling.textContent = e.target.value + "%"; savePrefs(); }
  });
  panel.addEventListener("change", e => { if (e.target.id === "clipFile") { add([...e.target.files]); e.target.value = ""; } });
  panel.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const key = b.dataset.play ?? b.dataset.del;
    const id = /^\d+$/.test(key) ? +key : key;
    if (b.dataset.play !== undefined) { const c = list.find(x => x.id === id); if (c) play(c); }
    else if (b.dataset.del !== undefined) remove(id);
  });
  GV.ui.bindPanel(btn, panel, "left");

  // ---- drag and drop anywhere ----
  let depth = 0;
  const hasFiles = e => e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
  addEventListener("dragenter", e => { if (hasFiles(e)) { depth++; dropHint.hidden = false; } });
  addEventListener("dragleave", e => { if (hasFiles(e) && --depth <= 0) { depth = 0; dropHint.hidden = true; } });
  addEventListener("dragover", e => { if (hasFiles(e)) e.preventDefault(); });
  addEventListener("drop", e => {
    if (!hasFiles(e)) return;
    e.preventDefault(); depth = 0; dropHint.hidden = true;
    add([...e.dataTransfer.files]);
  });

  render();
  load();
  return { maybe, add, play, get count() { return list.length; } };
})();
