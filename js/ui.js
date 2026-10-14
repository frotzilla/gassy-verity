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

  return { toast, flash };
})();
