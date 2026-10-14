// Skins: the body is an image file (assets/skins/, listed in assets/manifest.js). The animated
// face is drawn on top as a small SVG, tuned per skin by its `face` settings, in one of two
// styles: classic (dot eyes and a mouth) or emoticon (a text face like :3 in JetBrains Mono that
// changes with mood). A skin with face:false is just the image.
GV.skins = (() => {
  const img = document.getElementById("skinImg");
  const faceSvg = document.getElementById("face");
  const list = GV.data.skins;

  const DEFAULT_FACE = { eyeColor: "#222", eyeShape: "ellipse", eyesClosed: false, alwaysEmoticon: false, emoY: 0, emoSize: 30, eyeY: 44, eyeDX: 14, eyeRx: 5, eyeRy: 7, mouth: "smile", mouthColor: "#222", mouthWidth: 4, mouthDy: 0 };

  // Mouth shapes: p is inflation 0..1, so the mouth gets more worried as Verity swells.
  const MOUTHS = {
    smile:  p => `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`,
    w:      p => `M36 ${64 + p * 2} Q43 ${72 - p * 6} 50 ${64 + p * 2} Q57 ${72 - p * 6} 64 ${64 + p * 2}`,
    line:   p => `M${34 + p * 2} ${64 + p * 3} L${66 - p * 2} ${64 + p * 3}`,
    zigzag: p => `M30 ${66 + p * 2} l7 -6 l7 6 l7 -6 l7 6 l7 -6 l5 6`,
    frown:  p => `M${33 + p * 3} ${72 + p * 2} Q50 ${58 + p * 6} ${67 - p * 3} ${72 + p * 2}`,
    none:   () => "",
    o:      p => { const r = 6 + p * 3; return `M${50 - r} 66 a${r} ${r * 1.2} 0 1 0 ${2 * r} 0 a${r} ${r * 1.2} 0 1 0 ${-2 * r} 0`; }
  };

  const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Emoticon faces: plain ASCII, so they render in JetBrains Mono. idle is picked at random now
  // and then, charge steps through as Verity swells, relief shows after a fart.
  const DEFAULT_EMO = {
    idle:   [":3", ":)", "^_^", "owo", ":D", "UwU", "=w=", ":P", "^w^"],
    charge: [":o", "O_O", ">_<"],
    relief: ["^_^", "-w-", "UwU", "=D", ":3"]
  };

  const STYLE_KEY = "gassyVerity.faceStyle";
  let style = "classic";
  try { style = localStorage.getItem(STYLE_KEY) === "emoticon" ? "emoticon" : "classic"; } catch (e) {}

  // The text is the "eyes" group, so it swells with Verity. There is no separate mouth.
  function emoticonMarkup(f) {
    const y = (f.emoY || f.eyeY) + f.emoSize * 0.3;
    return `<g id="eyes"><text id="emoText" x="50" y="${y}" text-anchor="middle" font-family="'JetBrains Mono', ui-monospace, monospace" ` +
           `font-weight="700" font-size="${f.emoSize}" fill="${f.eyeColor}"></text></g>
      <g id="eyesHappy" style="display:none"></g>
      <path id="mouth" d="" fill="none"/>`;
  }

  function faceMarkup(f, emo) {
    if (emo) return emoticonMarkup(f);
    const cx1 = 50 - f.eyeDX, cx2 = 50 + f.eyeDX, y = f.eyeY;
    const eye = cx => f.eyeShape === "rect"
      ? `<rect x="${cx - f.eyeRx}" y="${y - f.eyeRy}" width="${f.eyeRx * 2}" height="${f.eyeRy * 2}" rx="1" fill="${f.eyeColor}"/>`
      : `<ellipse cx="${cx}" cy="${y}" rx="${f.eyeRx}" ry="${f.eyeRy}" fill="${f.eyeColor}"/>`;
    const shine = f.eyeShape === "rect" ? "" : `<circle cx="${cx1 - 1.5}" cy="${y - 3}" r="1.8" fill="#fff"/><circle cx="${cx2 - 1.5}" cy="${y - 3}" r="1.8" fill="#fff"/>`;
    const closed = c => `<path d="M${c - 6} ${y + 2} Q${c} ${y - 5} ${c + 6} ${y + 2}" fill="none" stroke="${f.eyeColor}" stroke-width="3.5" stroke-linecap="round"/>`;
    return `
      <g id="eyes">${f.eyesClosed ? closed(cx1) + closed(cx2) : eye(cx1) + eye(cx2) + shine}</g>
      <g id="eyesHappy" style="display:none" fill="none" stroke="${f.eyeColor}" stroke-width="3.5" stroke-linecap="round">
        <path d="M${cx1 - 6} ${y + 2} Q${cx1} ${y - 5} ${cx1 + 6} ${y + 2}"/><path d="M${cx2 - 6} ${y + 2} Q${cx2} ${y - 5} ${cx2 + 6} ${y + 2}"/>
      </g>
      <path id="mouth" d="${(MOUTHS[f.mouth] || MOUTHS.smile)(0)}" fill="none" stroke="${f.mouthColor}" stroke-width="${f.mouthWidth}"
            stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${f.mouthDy})"/>`;
  }

  let current = null;

  function set(id) {
    const sk = list.find(s => s.id === id) || list[0];
    current = sk.id;
    img.src = sk.file;
    img.alt = sk.name;
    if (sk.face === false) {
      faceSvg.innerHTML = "";
      if (GV.face) GV.face.rebind(null);
    } else {
      const f = { ...DEFAULT_FACE, ...(sk.face || {}) };
      const emo = f.alwaysEmoticon || style === "emoticon";
      faceSvg.innerHTML = faceMarkup(f, emo);
      if (GV.face) {
        const sets = emo ? { idle: f.emoIdle || DEFAULT_EMO.idle, charge: f.emoCharge || DEFAULT_EMO.charge, relief: f.emoRelief || DEFAULT_EMO.relief } : null;
        GV.face.rebind(emo ? MOUTHS.none : (MOUTHS[f.mouth] || MOUTHS.smile), emo ? (f.emoY || f.eyeY) : f.eyeY, sets);
      }
    }
  }

  set(GV.game.state.skin);
  GV.game.onChange(() => { if (GV.game.state.skin !== current) set(GV.game.state.skin); });

  function setFaceStyle(st) {
    style = st === "emoticon" ? "emoticon" : "classic";
    try { localStorage.setItem(STYLE_KEY, style); } catch (e) {}
    set(current);
  }

  return { set, setFaceStyle, get faceStyle() { return style; }, get current() { return current; } };
})();
