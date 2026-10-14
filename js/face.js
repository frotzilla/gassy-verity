// Verity's face: expression reacts to how inflated it is, how gassy the room is, and relief.
GV.face = (() => {
  let blush, eyes, happy, tears, mouth;
  let mouthPath = p => `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`;
  let reliefTimer = 0, lastP = 0;

  // Called by skins.js after it swaps the SVG, since the elements are new.
  function rebind(mouthFn) {
    blush = document.getElementById("blush"); eyes = document.getElementById("eyes");
    happy = document.getElementById("eyesHappy"); tears = document.getElementById("tears");
    mouth = document.getElementById("mouth");
    if (mouthFn) mouthPath = mouthFn;
    update(lastP);
  }

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // p: 0..1 inflation (driven every frame by motion.js).
  function update(p) {
    lastP = p;
    if (!blush) return;
    blush.setAttribute("opacity", (p * 0.5).toFixed(3));
    eyes.setAttribute("transform", `translate(50 44) scale(${(1 + p * 0.35).toFixed(3)}) translate(-50 -44)`);
    mouth.setAttribute("d", mouthPath(p));
  }

  // Eyes water as the room fills with gas.
  function updateTears() {
    if (tears) tears.setAttribute("opacity", clamp((GV.puffs.level() - 0.3) / 0.5, 0, 1).toFixed(2));
  }
  setInterval(updateTears, 250);

  // Happy closed eyes for a moment after letting it out.
  function relief(ms = 900) {
    if (!eyes) return;
    eyes.style.display = "none"; happy.style.display = "";
    clearTimeout(reliefTimer);
    reliefTimer = setTimeout(() => { if (eyes) { eyes.style.display = ""; happy.style.display = "none"; } }, ms);
  }

  return { update, relief, rebind };
})();
