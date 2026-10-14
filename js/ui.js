// Tiny shared UI helpers: the centered toast and the full-screen flash.
GV.ui = (() => {
  const toastEl = document.getElementById("toast");
  const flashEl = document.getElementById("flash");
  let timer = 0;

  function toast(text, ms = 1600) {
    toastEl.textContent = text;
    toastEl.classList.remove("show"); void toastEl.offsetWidth; toastEl.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  function flash(ms = 700) {
    flashEl.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: ms, easing: "ease-out" });
  }

  // "+12.3" that rises off Verity and fades. Rate-limited so spamming doesn't pile up nodes.
  let lastFloat = 0;
  function floatText(text, rect) {
    const now = performance.now();
    if (now - lastFloat < 70) return;
    lastFloat = now;
    const el = document.createElement("div");
    el.className = "float"; el.textContent = text;
    el.style.left = rect.left + rect.width * (0.3 + Math.random() * 0.4) + "px";
    el.style.top = rect.top + "px";
    document.body.appendChild(el);
    el.animate([{ transform: "translate(-50%,0)", opacity: 1 }, { transform: "translate(-50%,-70px)", opacity: 0 }],
               { duration: 900, easing: "ease-out" }).onfinish = () => el.remove();
  }

  return { toast, flash, floatText };
})();
