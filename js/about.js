// About (credits and privacy), in its own corner button and dialog, separate from the game UI.
GV.about = (() => {
  const btn = document.getElementById("aboutBtn");
  const panel = document.getElementById("aboutPanel");

  panel.innerHTML =
    `<div class="shopHead"><b>About</b><button type="button" class="close">close</button></div>` +
    `<div class="shopSec">Privacy</div>` +
    `<p>To match the sky to your real sunrise and sunset, this page looks up your approximate location from your IP address ` +
    `using <b>ipwho.is</b> (or <b>ipapi.co</b> if that fails). Those services see your IP, which is shared with every site you visit anyway, ` +
    `but they are a third party. The result is cached in your browser for a day. Nothing else leaves your device: ` +
    `your game save and stats stay in this browser and are never uploaded.</p>` +
    `<label class="check"><input type="checkbox" id="geoToggle"> Use my IP location for the sky</label>` +
    `<label class="check"><input type="checkbox" id="wxToggle"> Show my real weather (sends your location, rounded to about 10 km, to open-meteo.com; off by default)</label>` +
    `<div class="shopSec">Credits</div>` +
    `<p>Made by <a href="https://github.com/frotzilla/gassy-verity" target="_blank" rel="noopener">frotzilla</a>. Free software under the ` +
    `<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener">GPL-3.0</a>.</p>` +
    `<p>Verity is a character from ThatMob's videos. This is an unofficial fan project, not affiliated with or endorsed by ThatMob or PnTMC.</p>` +
    `<p>The variant skins are my own drawings based on descriptions from the <a href="https://verityminecraft.fandom.com/" target="_blank" rel="noopener">Veritypedia</a> ` +
    `(text CC-BY-SA). Clawd is a fan-drawn nod to the Claude Code mascot.</p>` +
    `<p>Font: JetBrains Mono (SIL Open Font License). Sun position: low-precision NOAA solar formulas. ` +
    `The art is in the assets folder; the sounds are generated in your browser. Weather data: open-meteo.com.</p>` +
    `<div class="shopSec">For tinkerers</div>` +
    `<p>There is an admin panel for setting the time, weather and location, giving gas, and spawning things. It needs a password. ` +
    `<button type="button" id="openAdmin" class="linkBtn">Open admin</button></p>`;

  const geo = panel.querySelector("#geoToggle"), wx = panel.querySelector("#wxToggle");
  geo.addEventListener("change", () => GV.sky.setGeo(geo.checked));
  wx.addEventListener("change", () => GV.weather.setEnabled(wx.checked));

  panel.querySelector("#openAdmin").addEventListener("click", () => GV.admin.open());
  GV.ui.modal(btn, panel, () => { geo.checked = GV.sky.geoOn(); wx.checked = GV.weather.enabled(); });
  return {};
})();
