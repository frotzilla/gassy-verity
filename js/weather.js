// Weather over the scene: clouds, fog, rain, snow, storms. Opt-in: with the About toggle on, it
// asks open-meteo.com for the current weather at your approximate location (coordinates rounded
// to about 10 km). The admin panel can force any kind of weather.
GV.weather = (() => {
  const world = document.getElementById("world");
  const canvas = document.getElementById("weatherCanvas");
  const g = canvas.getContext("2d");
  const cloudBox = document.getElementById("clouds");
  const dimEl = document.getElementById("dim");
  const fogEl = document.getElementById("fog");
  const KEY = "gassyVerity.weather";

  // What each kind of weather looks like.
  const LOOKS = {
    clear:    { clouds: 0, dim: 0,    fog: 0,    rain: 0,   snow: 0 },
    cloudy:   { clouds: 4, dim: 0.08, fog: 0,    rain: 0,   snow: 0 },
    overcast: { clouds: 8, dim: 0.25, fog: 0,    rain: 0,   snow: 0 },
    fog:      { clouds: 2, dim: 0.12, fog: 0.5,  rain: 0,   snow: 0 },
    rain:     { clouds: 8, dim: 0.3,  fog: 0.1,  rain: 130, snow: 0 },
    storm:    { clouds: 9, dim: 0.42, fog: 0.1,  rain: 220, snow: 0 },
    snow:     { clouds: 8, dim: 0.2,  fog: 0.15, rain: 0,   snow: 110 }
  };

  let kind = "clear", forced = null, on = false, lastFetch = 0, drops = [], flakes = [], raf = 0, lightning = 0, nextBolt = 0;

  // WMO weather code -> one of the looks above.
  function fromCode(c, cloud) {
    if (c >= 95) return "storm";
    if (c >= 71 && c <= 77 || c === 85 || c === 86) return "snow";
    if (c >= 51 && c <= 67 || c >= 80 && c <= 82) return "rain";
    if (c === 45 || c === 48) return "fog";
    if (c === 3 || cloud > 80) return "overcast";
    if (c === 1 || c === 2 || cloud > 35) return "cloudy";
    return "clear";
  }

  const enabled = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
  function setEnabled(v) {
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch (e) {}
    on = v; lastFetch = 0;
    if (!v && !forced) apply("clear"); else refresh();
  }

  async function refresh(force) {
    if (forced) return apply(forced);
    if (!enabled()) return;
    const loc = GV.sky.loc;
    if (!loc || loc.approx) return;                    // only with a real looked-up location
    if (!force && Date.now() - lastFetch < 20 * 60e3) return;
    lastFetch = Date.now();
    const lat = loc.lat.toFixed(1), lon = loc.lon.toFixed(1);
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 5000);
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,cloud_cover`, { signal: ctl.signal });
      const j = await r.json();
      apply(fromCode(j.current.weather_code, j.current.cloud_cover));
    } catch (e) {} finally { clearTimeout(t); }
  }

  function apply(k) {
    kind = k;
    const L = LOOKS[k];
    dimEl.style.opacity = L.dim; fogEl.style.opacity = L.fog;
    cloudBox.innerHTML = "";
    for (let i = 0; i < L.clouds; i++) {
      const c = document.createElement("img");
      c.src = GV.assets.cloud; c.alt = ""; c.draggable = false; c.className = "cloud";
      const w = 90 + Math.random() * 120;
      c.style.cssText = `width:${w}px;top:${2 + Math.random() * 40}%;animation-duration:${70 + Math.random() * 80}s;animation-delay:${-Math.random() * 120}s;opacity:${0.55 + Math.random() * 0.4}`;
      cloudBox.appendChild(c);
    }
    drops = Array.from({ length: L.rain }, spawn); flakes = Array.from({ length: L.snow }, spawn);
    if (!raf && (L.rain || L.snow)) raf = requestAnimationFrame(frame);
    if (GV.sky) GV.sky.update();
  }

  function spawn() { return { x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.8, r: Math.random() * 6.28 }; }

  function frame(now) {
    const W = canvas.width = world.clientWidth, H = canvas.height = world.clientHeight;
    g.clearRect(0, 0, W, H);
    const dt = 1 / 60;
    if (kind === "storm") {                          // an occasional flash
      if (now > nextBolt && !GV.ui.reduced()) { lightning = 1; nextBolt = now + 4000 + Math.random() * 7000; }
      if (lightning > 0) { g.fillStyle = `rgba(255,255,255,${lightning * 0.5})`; g.fillRect(0, 0, W, H); lightning = Math.max(0, lightning - dt * 7); }
    }
    g.strokeStyle = "rgba(190,215,255,.55)"; g.lineWidth = 1.4; g.beginPath();
    for (const d of drops) {
      d.y += dt * (1.2 + d.s); d.x -= dt * 0.18;
      if (d.y > 1) { d.y = -0.05; d.x = Math.random() * 1.2; } if (d.x < 0) d.x += 1;
      const x = d.x * W, y = d.y * H;
      g.moveTo(x, y); g.lineTo(x - 4, y + 14 * d.s);
    }
    g.stroke();
    g.fillStyle = "rgba(255,255,255,.85)";
    for (const f of flakes) {
      f.y += dt * 0.12 * f.s; f.r += dt; f.x += Math.sin(f.r) * dt * 0.03;
      if (f.y > 1) { f.y = -0.02; f.x = Math.random(); }
      g.fillRect(f.x * W, f.y * H, 2.5 * f.s, 2.5 * f.s);
    }
    raf = (drops.length || flakes.length) ? requestAnimationFrame(frame) : 0;
  }

  // Admin: pin a kind of weather (any key of LOOKS), or null to go back to real/off.
  function force(k) {
    forced = k && LOOKS[k] ? k : null;
    if (forced) apply(forced); else if (enabled()) refresh(true); else apply("clear");
  }

  on = enabled();
  if (on) setTimeout(() => refresh(true), 1200);
  setInterval(() => refresh(), 5 * 60e3);

  return { setEnabled, enabled, refresh, force, kinds: Object.keys(LOOKS), get name() { return kind === "clear" ? "" : kind; }, get kind() { return kind; } };
})();
