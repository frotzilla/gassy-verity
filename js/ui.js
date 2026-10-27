// Tiny shared UI helpers: the centered toast, the full-screen flash, panels, dialogs, and the
// reduce-motion preference.
GV.ui = (() => {
  const toastEl = document.getElementById("toast");
  const flashEl = document.getElementById("flash");
  let timer = 0;

  // Reduce motion: follows the operating system setting unless the About dialog overrides it.
  // When on: no screen shake, no flashes or lightning, clouds hold still, gain text just fades.
  const RM_KEY = "gassyVerity.reduceMotion";
  const mq = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const pref = () => { try { return localStorage.getItem(RM_KEY); } catch (e) { return null; } };   // "1", "0" or null (follow the OS)
  const reduced = () => (pref() === "1" ? true : pref() === "0" ? false : mq.matches);
  const applyRM = () => document.documentElement.classList.toggle("reduce-motion", reduced());
  function setReduced(v) {          // true, false, or null to go back to following the OS
    try { v === null ? localStorage.removeItem(RM_KEY) : localStorage.setItem(RM_KEY, v ? "1" : "0"); } catch (e) {}
    applyRM();
  }
  if (mq.addEventListener) mq.addEventListener("change", applyRM);
  applyRM();

  function toast(text, ms = 1600) {
    toastEl.textContent = text;
    toastEl.classList.remove("show"); void toastEl.offsetWidth; toastEl.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  function flash(ms = 700) {
    if (reduced()) return;
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
    const rise = reduced() ? "translate(-50%,0)" : "translate(-50%,-70px)";       // reduced: fade in place
    el.animate([{ transform: "translate(-50%,0)", opacity: 1 }, { transform: rise, opacity: 0 }],
               { duration: 900, easing: "ease-out" }).onfinish = () => el.remove();
  }

  // Toggle button/panel pairs. Panels in the same group close each other.
  const groups = {};
  function bindPanel(btn, panel, group, onOpen) {
    (groups[group] = groups[group] || []).push(panel);
    btn.addEventListener("click", () => {
      const open = panel.hidden;
      for (const p of groups[group]) p.hidden = true;
      panel.hidden = !open;
      if (open && onOpen) onOpen();
    });
    for (const el of [btn, panel]) el.addEventListener("pointerdown", e => e.stopPropagation());
  }

  // Centered dialogs with a shared backdrop. Esc, the backdrop and any .close button dismiss.
  const modals = [];
  let backdrop = null;
  let opener = null;
  function closeModals() {
    const wasOpen = modals.some(m => !m.hidden);
    for (const m of modals) m.hidden = true;
    if (backdrop) backdrop.hidden = true;
    if (wasOpen && opener && document.contains(opener)) { opener.focus(); opener = null; }
  }
  function modal(btn, panel, onOpen) {
    if (!backdrop) {
      backdrop = document.createElement("div"); backdrop.id = "modalBackdrop"; backdrop.hidden = true;
      backdrop.addEventListener("pointerdown", e => e.stopPropagation());
      backdrop.addEventListener("click", closeModals);
      document.body.appendChild(backdrop);
      addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });
    }
    modals.push(panel);
    // Dialog semantics for screen readers, and focus moves in on open and back out on close.
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", panel.dataset.label || panel.id.replace("Panel", ""));
    const open = () => {
      opener = document.activeElement;
      closeModals(); panel.hidden = false; backdrop.hidden = false; if (onOpen) onOpen();
      setTimeout(() => { const f = panel.querySelector("input, select, button:not(.close), a[href], .close"); if (f) f.focus(); }, 30);
    };
    if (btn) { btn.addEventListener("click", open); btn.addEventListener("pointerdown", e => e.stopPropagation()); }
    panel.addEventListener("pointerdown", e => e.stopPropagation());
    panel.addEventListener("click", e => { if (e.target.closest(".close")) closeModals(); });
    return { open, close: closeModals };
  }

  return { toast, flash, floatText, bindPanel, modal, reduced, setReduced, reducedSetting: pref };
})();
