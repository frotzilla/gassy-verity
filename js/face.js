// Verity's face: expression reacts to how inflated it is, how gassy the room is, and relief.
GV.face = (() => {
  const blush = document.getElementById("blush");
  const eyes = document.getElementById("eyes");
  const happy = document.getElementById("eyesHappy");
  const tears = document.getElementById("tears");
  const mouth = document.getElementById("mouth");
  let reliefTimer = 0;

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // p: 0..1 inflation (driven every frame by motion.js).
  function update(p) {
    blush.setAttribute("opacity", (p * 0.5).toFixed(3));
    eyes.setAttribute("transform", `translate(50 44) scale(${(1 + p * 0.35).toFixed(3)}) translate(-50 -44)`);
    mouth.setAttribute("d", `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`);
  }

  // Eyes water as the room fills with gas.
  function updateTears() {
    tears.setAttribute("opacity", clamp((GV.puffs.level() - 0.3) / 0.5, 0, 1).toFixed(2));
  }
  setInterval(updateTears, 250);

  // Happy closed eyes for a moment after letting it out.
  function relief(ms = 900) {
    eyes.style.display = "none"; happy.style.display = "";
    clearTimeout(reliefTimer);
    reliefTimer = setTimeout(() => { eyes.style.display = ""; happy.style.display = "none"; }, ms);
  }

  return { update, relief };
})();
