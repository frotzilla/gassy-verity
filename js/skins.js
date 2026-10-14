// Skins: each one is SVG markup for #verity. Every skin must contain these ids so the face
// code works: #blush (overlay), #eyes, #eyesHappy, #tears, #mouth. Eyes sit at (36,44) and
// (64,44). Prices and descriptions are in data.js.
GV.skins = (() => {
  const svg = document.getElementById("verity");

  // Shared face parts, parameterized by eye color.
  const eyes = (fill = "#222") => `
    <g id="eyes">
      <ellipse cx="36" cy="44" rx="5" ry="7" fill="${fill}"/>
      <ellipse cx="64" cy="44" rx="5" ry="7" fill="${fill}"/>
      <circle cx="34.5" cy="41" r="1.8" fill="#fff"/>
      <circle cx="62.5" cy="41" r="1.8" fill="#fff"/>
    </g>`;
  const happyEyes = `
    <g id="eyesHappy" style="display:none" fill="none" stroke="#222" stroke-width="3.5" stroke-linecap="round">
      <path d="M30 46 Q36 39 42 46"/><path d="M58 46 Q64 39 70 46"/>
    </g>`;
  const tears = `
    <g id="tears" opacity="0">
      <path d="M33 52 q-3 6 0 8 q3 -2 0 -8z" fill="#7cc4ff"/>
      <path d="M67 52 q-3 6 0 8 q3 -2 0 -8z" fill="#7cc4ff"/>
    </g>`;
  const smile = (p = 0) => `M${33 + p * 3} ${62 + p * 4} Q50 ${78 - p * 14} ${67 - p * 3} ${62 + p * 4}`;
  const mouth = (d = smile()) => `<path id="mouth" d="${d}" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>`;

  const ball = (a, b, c) => `
    <defs><radialGradient id="g" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
    </radialGradient></defs>
    <circle cx="50" cy="50" r="46" fill="url(#g)"/>
    <circle id="blush" cx="50" cy="50" r="46" fill="#ff4b3a" opacity="0"/>`;

  const art = {
    verity: { mouth: smile, svg: ball("#fff59a", "#ffd92e", "#d9a900") + eyes() + happyEyes + tears + mouth() },
    mint:   { mouth: smile, svg: ball("#e6fff4", "#7be6b6", "#35a87c") + eyes() + happyEyes + tears + mouth() },

    // Cat Boy: orange tabby, ears, whiskers, little "w" mouth. Pooping is configured below.
    catboy: {
      mouth: p => `M36 ${64 + p * 2} Q43 ${72 - p * 6} 50 ${64 + p * 2} Q57 ${72 - p * 6} 64 ${64 + p * 2}`,
      poop: { count: 14, windowSec: 6 },
      svg: `
        <defs><radialGradient id="g" cx="35%" cy="30%" r="75%">
          <stop offset="0" stop-color="#ffcf8a"/><stop offset="0.55" stop-color="#f4a24a"/><stop offset="1" stop-color="#d1782a"/>
        </radialGradient></defs>
        <polygon points="10,36 16,3 42,17" fill="#e8923a"/><polygon points="90,36 84,3 58,17" fill="#e8923a"/>
        <polygon points="17,30 19,12 33,20" fill="#f7a8b0"/><polygon points="83,30 81,12 67,20" fill="#f7a8b0"/>
        <circle cx="50" cy="52" r="44" fill="url(#g)"/>
        <circle id="blush" cx="50" cy="52" r="44" fill="#ff4b3a" opacity="0"/>
        <path d="M44 14 v9 M50 12 v11 M56 14 v9" stroke="#b9661f" stroke-width="3" stroke-linecap="round"/>
        <ellipse cx="30" cy="60" rx="9" ry="6" fill="#ffe7c4" opacity=".7"/><ellipse cx="70" cy="60" rx="9" ry="6" fill="#ffe7c4" opacity=".7"/>
        <path d="M47 53 h6 l-3 4z" fill="#e8798a"/>
        <path d="M24 58 L5 54 M24 62 L5 64 M76 58 L95 54 M76 62 L95 64" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>` +
        eyes("#3a2a10") + happyEyes + tears +
        `<path id="mouth" d="M36 64 Q43 72 50 64 Q57 72 64 64" fill="none" stroke="#222" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`
    },

    // Robo Verity: a rounded metal box with an antenna and a screen face.
    robot: {
      mouth: p => `M${34 + p * 2} ${64 + p * 3} L${66 - p * 2} ${64 + p * 3}`,
      svg: `
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e3e8ef"/><stop offset="1" stop-color="#8f9bab"/>
        </linearGradient></defs>
        <line x1="50" y1="4" x2="50" y2="14" stroke="#6b7686" stroke-width="3"/><circle cx="50" cy="4" r="4" fill="#ff6b6b"/>
        <rect x="6" y="14" width="88" height="80" rx="20" fill="url(#g)"/>
        <rect id="blush" x="6" y="14" width="88" height="80" rx="20" fill="#ff4b3a" opacity="0"/>
        <rect x="16" y="28" width="68" height="46" rx="10" fill="#15202e"/>` +
        eyes("#6df0ff") + happyEyes.replace(/#222/g, "#6df0ff") + tears +
        `<path id="mouth" d="M34 64 L66 64" fill="none" stroke="#6df0ff" stroke-width="4" stroke-linecap="round"/>`
    }
  };

  let current = null;

  function set(id) {
    const a = art[id] || art.verity;
    current = art[id] ? id : "verity";
    svg.innerHTML = a.svg;
    if (GV.face) GV.face.rebind(a.mouth);
  }

  const rule = () => (art[current] || {}).poop || null;      // poop rule of the equipped skin, if any

  set(GV.game.state.skin);
  GV.game.onChange(() => { if (GV.game.state.skin !== current) set(GV.game.state.skin); });

  return { set, rule, get current() { return current; } };
})();
