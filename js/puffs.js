// Green gas clouds that fly out of Verity.
GV.puffs = (() => {
  const cfg = GV.config.puffs;

  function emit(stage, power, combo = 1) {
    const w = stage.offsetWidth, h = stage.offsetHeight;
    const n = Math.round((cfg.base + power * cfg.extra) * (1 + GV.config.combo.puffsPerCombo * (combo - 1)));
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div"), s = 14 + Math.random() * (24 + power * 40);
      const [lo, hi] = cfg.colors;
      const col = lo.map((v, k) => v + Math.random() * (hi[k] - v) | 0);
      el.className = "puff";
      el.style.cssText = `--s:${s}px;--d:${2.2 + power * 1.8}s;--k:${2 + Math.random() * 2};` +
        `--x:${-(80 + Math.random() * (260 + power * 700))}px;--y:${-120 + Math.random() * 200}px;` +
        `left:${w * 0.1 - s / 2}px;top:${h * 0.65 + Math.random() * 30}px;` +
        `background:rgba(${col[0]},${col[1]},${col[2]},.7)`;
      stage.appendChild(el);
      setTimeout(() => el.remove(), 4200);
    }
  }

  return { emit };
})();
