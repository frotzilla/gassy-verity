// Admin panel: set the time, weather, location, gas and so on. Open it with ?admin on the URL.
//
// The password is checked against a salted SHA-256 hash, so it is not written in the source.
// This is a cheat menu gate, not real security: the game runs entirely in your browser, so
// anyone who opens the dev tools can change their own game state anyway. There is nothing
// server-side to protect.
GV.admin = (() => {
  const HASH = "8c5f122893694d7b61e7d78e58993a18477bcc9669b6d0af2681c6bee68906ec";
  const SALT = "gassyVerity.admin.v1:";
  const panel = document.getElementById("adminPanel");
  const G = GV.game;
  let unlocked = false, fails = 0, lockedUntil = 0;

  const sha = async s => {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
  };

  // "1e9", "5M", "2.5b", "12000" -> number
  function parseNum(text) {
    const m = /^\s*([\d.]+(?:e[+-]?\d+)?)\s*([kmbt]?)\s*$/i.exec(text || "");
    if (!m) return NaN;
    return parseFloat(m[1]) * ({ "": 1, k: 1e3, m: 1e6, b: 1e9, t: 1e12 })[m[2].toLowerCase()];
  }

  const PRESETS = {
    "Oslo": [59.91, 10.75], "Tokyo": [35.68, 139.69], "Sydney": [-33.87, 151.21],
    "Reykjavik": [64.15, -21.94], "Singapore": [1.35, 103.82], "Phoenix": [33.45, -112.07], "Sao Paulo": [-23.55, -46.63]
  };

  const pad = n => String(n).padStart(2, "0");
  const localInput = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  function lockView(msg = "") {
    panel.innerHTML =
      `<div class="shopHead"><b>Admin</b><button type="button" class="close">close</button></div>` +
      `<p class="small">Enter the password.</p>` +
      `<form id="adForm"><label for="adPw" class="small">Password</label> <input type="password" id="adPw" autocomplete="off"> <button type="submit">unlock</button></form>` +
      `<p class="small" id="adMsg" role="status" aria-live="polite">${msg}</p>`;
    panel.querySelector("#adForm").addEventListener("submit", async e => {
      e.preventDefault();
      const msgEl = panel.querySelector("#adMsg");
      if (Date.now() < lockedUntil) { msgEl.textContent = "Wait a moment."; return; }
      if (!(window.crypto && crypto.subtle)) { msgEl.textContent = "This needs a secure context (https, localhost or a local file)."; return; }
      const ok = (await sha(SALT + panel.querySelector("#adPw").value)) === HASH;
      if (ok) { unlocked = true; fails = 0; adminView(); }
      else { fails++; lockedUntil = Date.now() + Math.min(8000, 800 * fails); msgEl.textContent = "Wrong password."; panel.querySelector("#adPw").value = ""; }
    });
    setTimeout(() => { const i = panel.querySelector("#adPw"); if (i) i.focus(); }, 50);
  }

  function adminView() {
    const wk = ["real"].concat(GV.weather.kinds);
    panel.innerHTML =
      `<div class="shopHead"><b>Admin</b><button type="button" class="close">close</button></div>` +

      `<div class="shopSec">Time</div>` +
      `<div class="row"><input type="datetime-local" id="adTime" aria-label="date and time"><button type="button" data-a="setTime">set</button></div>` +
      `<div class="row"><label for="adSpeed">speed (sky min per sec)</label><input type="number" id="adSpeed" value="0" min="0" step="1"><button type="button" data-a="setSpeed">go</button></div>` +
      `<div class="row"><button type="button" data-a="realTime">use real time</button></div>` +

      `<div class="shopSec">Weather</div>` +
      `<div class="row"><select id="adWx" aria-label="weather">${wk.map(k => `<option>${k}</option>`).join("")}</select><button type="button" data-a="setWx">apply</button></div>` +

      `<div class="shopSec">Location</div>` +
      `<div class="row"><select id="adPreset" aria-label="location preset"><option value="">preset...</option>${Object.keys(PRESETS).map(k => `<option>${k}</option>`).join("")}</select></div>` +
      `<div class="row"><input id="adLat" placeholder="lat" aria-label="latitude" size="6"><input id="adLon" placeholder="lon" aria-label="longitude" size="6"><input id="adCity" placeholder="name" aria-label="place name" size="8"><button type="button" data-a="setLoc">set</button></div>` +
      `<div class="row"><button type="button" data-a="realLoc">use real location</button></div>` +

      `<div class="shopSec">Gas and progress</div>` +
      `<div class="row"><input id="adAmt" placeholder="amount, e.g. 5M or 1e9" aria-label="gas amount" size="16"><button type="button" data-a="give">give</button><button type="button" data-a="setGas">set</button></div>` +
      `<div class="row"><input id="adCr" placeholder="crystals" aria-label="crystals" size="8"><button type="button" data-a="crystals">give crystals</button></div>` +
      `<div class="row"><button type="button" data-a="unlockAll">unlock all skins and achievements</button></div>` +

      `<div class="shopSec">Spawn</div>` +
      `<div class="row wrap">` +
      `<button type="button" data-a="fill">fill with gas</button><button type="button" data-a="clear">clear gas</button></div>` +

      `<div class="shopSec">Danger</div>` +
      `<div class="row wrap"><button type="button" data-a="reset">reset all progress</button><button type="button" data-a="lock">lock</button></div>`;
    panel.querySelector("#adTime").value = localInput(GV.sky.now);
  }

  const val = id => panel.querySelector("#" + id).value;
  const say = t => GV.ui.toast(t, 1100);

  panel.addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"); if (!b || !unlocked) return;
    switch (b.dataset.a) {
      case "setTime": { const d = new Date(val("adTime")); if (!isNaN(d)) { GV.sky.setTime(d, parseFloat(val("adSpeed")) || 0); say("Time set"); } break; }
      case "setSpeed": { const sp = parseFloat(val("adSpeed")) || 0; const d = val("adTime") ? new Date(val("adTime")) : GV.sky.now; GV.sky.setTime(d, sp); say(sp ? "Time running x" + sp : "Time still"); break; }
      case "realTime": GV.sky.setTime(null, 0); panel.querySelector("#adTime").value = localInput(GV.sky.now); say("Real time"); break;
      case "setWx": { const k = val("adWx"); GV.weather.force(k === "real" ? null : k); say("Weather: " + k); break; }
      case "setLoc": { const lat = parseFloat(val("adLat")), lon = parseFloat(val("adLon")); if (isFinite(lat) && isFinite(lon)) { GV.sky.setLocation({ lat, lon, city: val("adCity") }); say("Location set"); } else say("Need lat and lon"); break; }
      case "realLoc": GV.sky.setLocation(null); say("Real location"); break;
      case "give": { const n = parseNum(val("adAmt")); if (n > 0) { G.earn(n); say("+" + GV.fmt(n)); } break; }
      case "setGas": { const n = parseNum(val("adAmt")); if (n >= 0) { G.admin.setGas(n); say("Gas set"); } break; }
      case "crystals": { const n = parseNum(val("adCr")); if (n > 0) { G.admin.giveCrystals(n); say("+" + n + " crystals"); } break; }
      case "unlockAll": G.admin.unlockAll(); say("Unlocked"); break;
      case "fill": for (let i = 0; i < 12; i++) GV.puffs.emit(GV.verity.stage, 1, 8); break;
      case "clear": GV.puffs.shock(GV.verity.stage, GV.config.blast.push, GV.config.blast.clearSec); break;
      case "reset": if (confirm("Delete all progress?")) { G.reset(); say("Reset"); } break;
      case "lock": unlocked = false; lockView(); break;
    }
  });
  panel.addEventListener("change", e => {
    if (e.target.id === "adPreset" && PRESETS[e.target.value]) {
      const [lat, lon] = PRESETS[e.target.value];
      panel.querySelector("#adLat").value = lat; panel.querySelector("#adLon").value = lon; panel.querySelector("#adCity").value = e.target.value;
      GV.sky.setLocation({ lat, lon, city: e.target.value }); say(e.target.value);
    }
  });

  const modal = GV.ui.modal(null, panel, () => { if (unlocked) adminView(); else lockView(); });
  if (new URLSearchParams(location.search).has("admin")) setTimeout(modal.open, 300);

  return { open: modal.open };
})();
