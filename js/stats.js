// Lifetime stats kept in localStorage (best combo, longest hold, totals), plus the stats panel.
GV.stats = (() => {
  const KEY = "gassyVerity.stats.v1";
  const blank = { toots: 0, bestCombo: 0, longestHold: 0, blasts: 0 };
  const btn = document.getElementById("statsBtn");
  const panel = document.getElementById("statsPanel");
  let data = { ...blank };

  try { data = { ...blank, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }

  function render() {
    panel.innerHTML =
      `<div><span>Toots</span><b>${data.toots}</b></div>` +
      `<div><span>Best combo</span><b>x${data.bestCombo}</b></div>` +
      `<div><span>Longest hold</span><b>${data.longestHold.toFixed(1)}s</b></div>` +
      `<div><span>Gas blasts</span><b>${data.blasts}</b></div>` +
      `<button type="button" id="statsReset">reset</button>`;
    panel.querySelector("#statsReset").onclick = () => {
      if (confirm("Reset all stats?")) { data = { ...blank }; save(); render(); }
    };
  }

  // Call once per release. Returns which records were broken (not on the very first fart).
  function record(holdSec, combo) {
    const broke = [];
    if (combo > data.bestCombo) { if (combo === data.bestCombo + 1 && data.bestCombo >= 2) broke.push("combo"); data.bestCombo = combo; }
    if (holdSec > data.longestHold) { if (data.longestHold > 0 && holdSec > 1.5) broke.push("hold"); data.longestHold = holdSec; }
    data.toots++;
    save(); render();
    return broke;
  }

  function blast() { data.blasts++; save(); render(); }

  btn.addEventListener("click", () => { panel.hidden = !panel.hidden; });
  btn.addEventListener("pointerdown", e => e.stopPropagation());
  panel.addEventListener("pointerdown", e => e.stopPropagation());
  render();

  return { record, blast, get: () => data };
})();
