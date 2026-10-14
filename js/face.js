// Verity's face: expression reacts to how inflated it is, and to relief after a fart.
GV.face = (() => {
  const img = document.getElementById("skinImg");
  let eyes, happy, mouth, eyeY = 44;
  let mouthPath = p => `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`;
  let reliefTimer = 0, lastP = 0;

  // Called by skins.js after it swaps the SVG, since the elements are new.
  function rebind(mouthFn, y = 44) {
    eyeY = y;
    eyes = document.getElementById("eyes");
    happy = document.getElementById("eyesHappy");
    mouth = document.getElementById("mouth");
    if (mouthFn) mouthPath = mouthFn;
    update(lastP);
  }

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  // p: 0..1 inflation (driven every frame by motion.js).
  function update(p) {
    lastP = p;
    // Flushed as it swells: push the image toward red. Works on any image.
    img.style.filter = p > 0.01 ? `hue-rotate(${(-28 * p).toFixed(1)}deg) saturate(${(1 + 0.9 * p).toFixed(2)})` : "";
    if (!eyes) return;
    eyes.setAttribute("transform", `translate(50 ${eyeY}) scale(${(1 + p * 0.35).toFixed(3)}) translate(-50 -${eyeY})`);
    mouth.setAttribute("d", mouthPath(p));
  }

  // Happy closed eyes for a moment after letting it out.
  function relief(ms = 900) {
    if (!eyes) return;
    eyes.style.display = "none"; happy.style.display = "";
    clearTimeout(reliefTimer);
    reliefTimer = setTimeout(() => { if (eyes) { eyes.style.display = ""; happy.style.display = "none"; } }, ms);
  }

  return { update, relief, rebind };
})();
