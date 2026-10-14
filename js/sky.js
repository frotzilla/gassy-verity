// Day/night cycle from the real time and the viewer's rough location.
//
// Location comes from an IP lookup (ipwho.is, falling back to ipapi.co), cached in
// localStorage. That request shows your IP to that service. If it fails or is blocked, the
// sky falls back to the device clock and a longitude guessed from the time zone.
// The sun's position is computed locally (no further requests).
//
// Test overrides in the URL:  ?time=21:30   ?lat=59.9&lon=10.7&city=Oslo   ?loc=off
//                             ?speed=30  (sky minutes per real second, for a time-lapse)
GV.sky = (() => {
  const cfg = GV.config.sky;
  const world = document.getElementById("world");
  const sunEl = document.getElementById("sun");
  const moonEl = document.getElementById("moon");
  const shadeEl = document.getElementById("moonShade");
  const starsEl = document.getElementById("stars");
  const hintEl = document.getElementById("hint");
  const q = new URLSearchParams(location.search);
  const rad = Math.PI / 180;
  const KEY = "gassyVerity.loc.v1";

  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ---- location ----
  const speed = parseFloat(q.get("speed")) || 0;
  let loc = fallbackLoc();

  function fallbackLoc() {
    // Longitude from the time zone (15 degrees per hour); latitude is a mid-latitude guess.
    return { lat: 35, lon: -new Date().getTimezoneOffset() / 4, city: "", approx: true };
  }

  async function lookup(url, pick) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), cfg.ipTimeoutMs);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      const found = pick(await r.json());
      if (found && isFinite(found.lat) && isFinite(found.lon)) return found;
    } catch (e) {} finally { clearTimeout(timer); }
    return null;
  }

  // The IP lookup can be switched off from the About panel.
  const GEO_KEY = "gassyVerity.noGeo";
  function geoOff() { try { return localStorage.getItem(GEO_KEY) === "1"; } catch (e) { return false; } }
  function setGeo(on) {
    try { localStorage.setItem(GEO_KEY, on ? "0" : "1"); } catch (e) {}
    loc = fallbackLoc();
    locate().then(found => { if (found) loc = found; update(); });
    update();
  }

  async function locate() {
    const lat = parseFloat(q.get("lat")), lon = parseFloat(q.get("lon"));
    if (isFinite(lat) && isFinite(lon)) return { lat, lon, city: q.get("city") || "" };
    if (q.get("loc") === "off" || geoOff()) return null;
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || "null");
      if (c && Date.now() - c.t < cfg.cacheHours * 3600e3) return c;
    } catch (e) {}
    const found =
      await lookup("https://ipwho.is/", j => j.success === false ? null : { lat: +j.latitude, lon: +j.longitude, city: j.city || "" }) ||
      await lookup("https://ipapi.co/json/", j => ({ lat: +j.latitude, lon: +j.longitude, city: j.city || "" }));
    if (found) { try { localStorage.setItem(KEY, JSON.stringify({ ...found, t: Date.now() })); } catch (e) {} }
    return found;
  }

  // ---- astronomy (NOAA-style low-precision solar position; good to a fraction of a degree) ----
  function position(date, lat, lon) {
    const jd = date.getTime() / 86400000 + 2440587.5, n = jd - 2451545.0;
    const L = mod(280.460 + 0.9856474 * n, 360), g = mod(357.528 + 0.9856003 * n, 360) * rad;
    const lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
    const eps = (23.439 - 0.0000004 * n) * rad;
    const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam));
    const dec = Math.asin(Math.sin(eps) * Math.sin(lam));
    const gmst = mod(280.46061837 + 360.98564736629 * n, 360);
    let ha = (gmst + lon) * rad - ra;
    ha = Math.atan2(Math.sin(ha), Math.cos(ha));              // -pi..pi, 0 = solar noon
    const alt = Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(ha));
    const age = mod(jd - 2451550.1, 29.530588853) / 29.530588853; // 0 new, 0.5 full
    return { alt: alt / rad, ha, moonAge: age };
  }

  // ---- looks ----
  // [sun altitude in degrees, sky top, sky horizon]
  const SKY = [
    [-18, "#070b1f", "#0e1736"], [-10, "#10173a", "#2a2552"], [-4, "#2b2d63", "#c4576b"],
    [2, "#4a74c9", "#ff9a5c"], [10, "#5f9be0", "#ffc27d"], [25, "#7dbdf8", "#cdeaff"], [50, "#8ecbff", "#dff3ff"]
  ];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const css = c => `rgb(${c.map(v => Math.round(v)).join(",")})`;

  function skyColors(alt) {
    const a = clamp(alt, SKY[0][0], SKY[SKY.length - 1][0]);
    let i = 0; while (i < SKY.length - 2 && a > SKY[i + 1][0]) i++;
    const t = (a - SKY[i][0]) / (SKY[i + 1][0] - SKY[i][0]);
    return [mix(hex(SKY[i][1]), hex(SKY[i + 1][1]), t), mix(hex(SKY[i][2]), hex(SKY[i + 1][2]), t)];
  }

  function ground(base, light) {            // darker and bluer at night
    const [r, g, b] = hex(base);
    return [r * light * 0.9, g * light * 0.95, b * light + (1 - light) * 45];
  }

  // Morning and evening are the stretches around sunrise and sunset; "day" is the middle.
  function phaseName(alt, ha) {
    if (alt >= 25) return "day";
    if (alt >= 6) return ha < 0 ? "morning" : "evening";
    if (alt >= -4) return ha < 0 ? "sunrise" : "sunset";
    if (alt >= -12) return ha < 0 ? "dawn" : "dusk";
    return "night";
  }

  // Stars are made once; the layer just fades in and out.
  for (let i = 0; i < 60; i++) {
    const s = document.createElement("i");
    s.className = "star";
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 92}%`;
    starsEl.appendChild(s);
  }

  function apply(date) {
    const p = position(date, loc.lat, loc.lon), alt = p.alt;
    const [top, bot] = skyColors(alt);
    const light = 0.28 + 0.72 * smooth(-8, 6, alt);
    world.style.setProperty("--sky-top", css(top));
    world.style.setProperty("--sky-bot", css(bot));
    world.style.setProperty("--grass", css(ground("#5d9b3a", light)));
    world.style.setProperty("--dirt", css(ground("#8a5a35", light)));
    starsEl.style.opacity = smooth(-4, -14, alt).toFixed(3);

    // Sun and moon ride an arc: x from the hour angle, height from altitude. The sky box
    // clips them at the horizon. The moon is (roughly) opposite the sun.
    const sx = 50 + 44 * Math.sin(p.ha), sy = 100 - Math.sin(alt * rad) * 88;
    const mx = 50 - 44 * Math.sin(p.ha), my = 100 - Math.sin(-alt * rad) * 88;
    sunEl.style.left = sx + "%"; sunEl.style.top = sy + "%";
    moonEl.style.left = mx + "%"; moonEl.style.top = my + "%";
    const u = p.moonAge < 0.5 ? p.moonAge * 2 : (1 - p.moonAge) * 2; // 0 new -> 1 full
    shadeEl.style.transform = `translateX(${(p.moonAge < 0.5 ? -1 : 1) * u * 100}%)`;

    const place = loc.city ? loc.city + " - " : "";
    hintEl.textContent = place + phaseName(alt, p.ha) + (loc.approx ? " (approx)" : "");
    return p;
  }

  // ---- clock ----
  const t0 = Date.now();
  function now() {
    const m = /^(\d{1,2}):(\d{2})$/.exec(q.get("time") || "");
    const d = new Date(speed ? t0 + (Date.now() - t0) * speed * 60 : Date.now());
    if (m) { d.setHours(+m[1], +m[2], 0, 0); }
    return d;
  }
  function update() { return apply(now()); }

  update();
  locate().then(found => { if (found) { loc = found; } update(); });
  setInterval(update, speed ? 100 : cfg.refreshSec * 1000);

  return { update, apply, position, setGeo, geoOn: () => !geoOff(), get loc() { return loc; } };
})();
