// Verity's face: expression reacts to how inflated it is, and to relief after a fart.
GV.face = (() => {
  const img = document.getElementById("skinImg");
  let eyes, happy, mouth, eyeY = 44;
  let emo = null, emoEl = null, idleFace = "", lastText = "", reliefOn = false;
  const pick = list => list[Math.random() * list.length | 0];
  const setText = t => { if (emoEl && t !== lastText) { emoEl.textContent = t; lastText = t; } };
  let mouthPath = p => `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`;
  let reliefTimer = 0, lastP = 0;

  // Called by skins.js after it swaps the SVG, since the elements are new.
  function rebind(mouthFn, y = 44, emoSets = null) {
    eyeY = y;
    emo = emoSets; emoEl = document.getElementById("emoText"); lastText = ""; reliefOn = false;
    if (emo) { idleFace = pick(emo.idle); setText(idleFace); }
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
    if (emo && !reliefOn) {                           // text face: idle, then steps up as it swells
      const n = emo.charge.length;
      setText(p < 0.15 ? idleFace : emo.charge[Math.min(n - 1, Math.floor((p - 0.15) / 0.85 * n))]);
    }
  }

  // Happy closed eyes for a moment after letting it out.
  function relief(ms = 900) {
    if (!eyes) return;
    if (emo) {
      reliefOn = true; setText(pick(emo.relief));
      clearTimeout(reliefTimer);
      reliefTimer = setTimeout(() => { reliefOn = false; idleFace = pick(emo.idle); setText(lastP < 0.15 ? idleFace : lastText); }, ms);
      return;
    }
    eyes.style.display = "none"; happy.style.display = "";
    clearTimeout(reliefTimer);
    reliefTimer = setTimeout(() => { if (eyes) { eyes.style.display = ""; happy.style.display = "none"; } }, ms);
  }

  // A new idle face every few seconds while resting.
  setInterval(() => { if (emo && !reliefOn && lastP < 0.15) { idleFace = pick(emo.idle); setText(idleFace); } }, 5000);

  return { update, relief, rebind };
})();
