// Screenshot: composites the scene onto a canvas and saves a PNG (or opens the share sheet on
// phones). It draws from the page's own images, so it needs the page served over http(s).
// Opened straight from a file:// URL the browser blocks reading the pixels back; the button
// then says so instead of failing silently.
GV.shot = (() => {
  const btn = document.getElementById("snapBtn");
  const M = GV.config.worldMargin;
  const q = id => document.getElementById(id);

  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const rectOf = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };

  async function draw() {
    const W = innerWidth, H = innerHeight, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d"), cs = getComputedStyle(q("world"));
    const col = n => cs.getPropertyValue(n).trim();
    const hRatio = (H + 2 * M) * 0.62 - M;          // horizon in viewport coordinates

    // Sky, ground
    const sky = g.createLinearGradient(0, 0, 0, hRatio);
    sky.addColorStop(0, col("--sky-top") || "#8ecbff"); sky.addColorStop(1, col("--sky-bot") || "#cfeeff");
    g.fillStyle = sky; g.fillRect(0, 0, W, hRatio);
    g.fillStyle = col("--grass") || "#5d9b3a"; g.fillRect(0, hRatio, W, (H + 2 * M) * 0.04);
    g.fillStyle = col("--dirt") || "#8a5a35"; g.fillRect(0, hRatio + (H + 2 * M) * 0.04, W, H);

    // Stars, sun, moon (clipped to the sky like on screen)
    g.save(); g.beginPath(); g.rect(0, 0, W, hRatio); g.clip();
    g.fillStyle = "#fff"; g.globalAlpha = +q("stars").style.opacity || 0;
    for (const s of q("stars").children) { const r = rectOf(s); g.fillRect(r.x, r.y, 2, 2); }
    g.globalAlpha = 1;
    for (const id of ["sun", "moon"]) {
      const el = q(id), r = rectOf(el), im = el.querySelector("img");
      if (im && im.complete) g.drawImage(im, r.x, r.y, r.w, r.h);
      if (id === "moon") {                            // phase shade, clipped to the disc
        g.save(); g.beginPath(); g.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, 0, 6.283); g.clip();
        const sr = rectOf(q("moonShade")); g.fillStyle = getComputedStyle(q("moonShade")).backgroundColor;
        g.beginPath(); g.arc(sr.x + sr.w / 2, sr.y + sr.h / 2, sr.w / 2, 0, 6.283); g.fill(); g.restore();
      }
    }
    g.restore();

    // Clouds, poops
    for (const im of document.querySelectorAll("#clouds img, .poop img")) { if (!im.complete) continue; const r = rectOf(im); g.globalAlpha = +getComputedStyle(im).opacity || 1; g.drawImage(im, r.x, r.y, r.w, r.h); g.globalAlpha = 1; }

    // Verity: body image (with its current red tint) and the face SVG
    const body = q("skinImg"), br = rectOf(body);
    g.filter = getComputedStyle(body).filter === "none" ? "none" : getComputedStyle(body).filter;
    g.drawImage(body, br.x, br.y, br.w, br.h); g.filter = "none";
    const face = q("face");
    if (face.firstChild) {
      const xml = new XMLSerializer().serializeToString(face);      // already carries its xmlns
      const fi = await load("data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml));
      const fr = rectOf(face); g.drawImage(fi, fr.x, fr.y, fr.w, fr.h);
    }

    // Weather, gas
    const wc = q("weatherCanvas"); g.drawImage(wc, -M, -M);
    g.drawImage(q("gasCanvas"), -M, -M);

    // Caption
    g.font = "700 22px 'JetBrains Mono', monospace"; g.textAlign = "center";
    g.fillStyle = "#0008"; g.fillText("Gassy Verity", W / 2 + 2, 34 + 2);
    g.fillStyle = "#fff"; g.fillText("Gassy Verity", W / 2, 34);
    g.font = "700 16px 'JetBrains Mono', monospace";
    const txt = q("bankNum").textContent; g.fillStyle = "#0008"; g.fillText(txt, W / 2 + 1, 60 + 1); g.fillStyle = "#fff"; g.fillText(txt, W / 2, 60);
    return c;
  }

  async function snap() {
    try {
      const c = await draw();
      const blob = await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("empty")), "image/png"));
      const file = new File([blob], "gassy-verity.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: "Gassy Verity" }); return; } catch (e) { if (e.name === "AbortError") return; } }
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "gassy-verity.png";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      GV.ui.toast("Saved screenshot", 1300);
    } catch (e) {
      GV.ui.toast(location.protocol === "file:" ? "Screenshots need the page served over http" : "Screenshot failed", 2600);
    }
  }

  btn.addEventListener("click", snap);
  btn.addEventListener("pointerdown", e => e.stopPropagation());
  return { snap, draw };
})();
