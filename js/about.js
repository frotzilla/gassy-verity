// About panel (credits and privacy) plus a one-time notice about the IP location lookup.
GV.about = (() => {
  const btn = document.getElementById("aboutBtn");
  const panel = document.getElementById("aboutPanel");
  const notice = document.getElementById("notice");
  const SEEN = "gassyVerity.noticeSeen";

  panel.innerHTML =
    `<div class="shopHead"><b>About</b></div>` +
    `<div class="shopSec">Privacy</div>` +
    `<p>To match the sky to your real sunrise and sunset, this page looks up your approximate location from your IP address ` +
    `using <b>ipwho.is</b> (or <b>ipapi.co</b> if that fails). Those services see your IP, which is shared with every site you visit anyway, ` +
    `but they are a third party. The result is cached in your browser for a day. Nothing else leaves your device: ` +
    `your game save, stats and any voice clips stay in this browser and are never uploaded.</p>` +
    `<label class="check"><input type="checkbox" id="geoToggle"> Use my IP location for the sky</label>` +
    `<div class="shopSec">Credits</div>` +
    `<p>Made by <a href="https://github.com/frotzilla/gassy-verity" target="_blank" rel="noopener">frotzilla</a>. Free software under the ` +
    `<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GPL-3.0</a>.</p>` +
    `<p>Verity is a character from ThatMob's videos. This is an unofficial fan project, not affiliated with or endorsed by ThatMob or PnTMC.</p>` +
    `<p>Font: JetBrains Mono (SIL Open Font License). Sun position: low-precision NOAA solar formulas. ` +
    `Everything else, including the sounds, is generated in your browser.</p>`;

  const toggle = panel.querySelector("#geoToggle");
  toggle.checked = GV.sky.geoOn();
  toggle.addEventListener("change", () => { GV.sky.setGeo(toggle.checked); });

  GV.ui.bindPanel(btn, panel, "left", () => { toggle.checked = GV.sky.geoOn(); });

  // First visit: a short heads-up with a way out, instead of burying it in the panel.
  function seen() { try { return localStorage.getItem(SEEN) === "1"; } catch (e) { return true; } }
  function dismiss() { notice.hidden = true; try { localStorage.setItem(SEEN, "1"); } catch (e) {} }
  if (!seen() && GV.sky.geoOn()) {
    notice.innerHTML = `<span>The sky uses your IP location (looked up via ipwho.is). </span>` +
      `<button type="button" data-a="ok">ok</button><button type="button" data-a="off">turn off</button>`;
    notice.hidden = false;
    notice.addEventListener("pointerdown", e => e.stopPropagation());
    notice.addEventListener("click", e => {
      const a = e.target.dataset && e.target.dataset.a;
      if (a === "off") GV.sky.setGeo(false);
      if (a) dismiss();
    });
  }

  return {};
})();
