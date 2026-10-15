#!/usr/bin/env node
// Checks assets/manifest.js: run `node tools/check-assets.js` after adding or editing a skin.
// Catches missing files, duplicate ids, typos in face settings, and bad pronouns.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { window: {} }; ctx.window.GV = ctx.GV = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "assets/manifest.js"), "utf8"), ctx);
const A = ctx.GV.assets, errors = [], warns = [];

const MOUTHS = ["smile", "frown", "w", "line", "zigzag", "o", "none"];
const FACE_KEYS = ["eyeColor", "eyeShape", "eyesClosed", "alwaysEmoticon", "emoY", "emoSize", "emoIdle", "emoCharge", "emoRelief",
  "faceScale", "faceDy", "eyeY", "eyeDX", "eyeRx", "eyeRy", "mouth", "mouthColor", "mouthWidth", "mouthDy"];
const PRONOUNS = ["he", "she", "it", "they"];

for (const k of ["sun", "moon", "cloud", "poop"]) {
  if (!A[k]) errors.push(`assets.${k} is missing`);
  else if (!fs.existsSync(path.join(root, A[k]))) errors.push(`assets.${k}: file not found: ${A[k]}`);
}

const seen = new Set();
(A.skins || []).forEach((s, i) => {
  const at = `skin #${i + 1} (${s.id || "no id"})`;
  if (!s.id || !/^[a-z0-9]+$/.test(s.id)) errors.push(`${at}: id must be lowercase letters and digits`);
  if (seen.has(s.id)) errors.push(`${at}: duplicate id`); seen.add(s.id);
  if (!s.name) errors.push(`${at}: missing name`);
  if (typeof s.cost !== "number" || s.cost < 0) errors.push(`${at}: cost must be a number, 0 or more`);
  if (!s.file) errors.push(`${at}: missing file`);
  else if (!fs.existsSync(path.join(root, s.file))) errors.push(`${at}: file not found: ${s.file}`);
  if (s.pronoun !== undefined && !PRONOUNS.includes(s.pronoun)) errors.push(`${at}: pronoun must be one of ${PRONOUNS.join(", ")}`);
  if (s.pronoun === undefined) warns.push(`${at}: no pronoun set (messages will use the default, "they")`);
  if (s.wiki !== undefined && !/^https?:\/\//.test(s.wiki)) errors.push(`${at}: wiki must be a full URL`);
  if (s.face !== false) {
    const f = s.face || {};
    for (const k of Object.keys(f)) if (!FACE_KEYS.includes(k)) warns.push(`${at}: unknown face setting "${k}" (typo?)`);
    if (f.mouth !== undefined && !MOUTHS.includes(f.mouth)) errors.push(`${at}: mouth must be one of ${MOUTHS.join(", ")}`);
  }
});
if (!(A.skins || []).some(s => s.cost === 0)) warns.push("no free skin: players start on the first skin in the list");

console.log(`${(A.skins || []).length} skins checked.`);
warns.forEach(w => console.log("  warning:", w));
errors.forEach(e => console.log("  ERROR:", e));
console.log(errors.length ? `${errors.length} error(s).` : "OK");
process.exit(errors.length ? 1 : 0);
