import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile("app.js", "utf8");
const cut = source.indexOf("let EDITOR_CONFIG");
if (cut < 0) throw new Error("Unable to locate editor config boundary in app.js.");

const context = vm.createContext({ console });
vm.runInContext(`${source.slice(0, cut)}
globalThis.__storyAudit = { CLUES, JOURNALS, SCENES, SCENE_EXPANSIONS };`, context, { timeout: 1000 });

const { CLUES, JOURNALS, SCENES, SCENE_EXPANSIONS } = context.__storyAudit;
const errors = [];

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function sceneText(scene) {
  return [...(scene?.text || []), ...(SCENE_EXPANSIONS[scene?.id] || [])].join("");
}

function internalMistakeTag(choice, target) {
  if (choice.primary || choice.back || choice.reset) return "";
  if (choice.mistakeTag || choice.errorTag || choice.auditTag) return choice.mistakeTag || choice.errorTag || choice.auditTag;
  if (choice.danger) return "danger-branch";
  if (choice.confession && choice.next !== "win") return "confession-branch";
  if (/^(bad|ending)/.test(String(choice.next || ""))) return target?.ending ? "ending-branch" : "mistake-branch";
  if (target?.ending && target.endingKind !== "good") return "ending-branch";
  return "";
}

for (const [sceneId, scene] of Object.entries(SCENES)) {
  scene.id = sceneId;
  if (!Array.isArray(scene.text) || !scene.text.length) errors.push(`${sceneId} has no text.`);
  for (const [index, choice] of (scene.choices || []).entries()) {
    const label = choice.label || `choice ${index + 1}`;
    const target = choice.next ? SCENES[choice.next] : null;
    if (choice.next && !target) errors.push(`${sceneId} -> ${choice.next} is missing (${label}).`);
    const tag = internalMistakeTag(choice, target);
    if (!tag) continue;
    if (!choice.next) errors.push(`${sceneId} "${label}" is tagged internally but has no target.`);
    if (target && sceneText(target).length < 18 && !target.endingSummary) {
      errors.push(`${sceneId} "${label}" points to ${choice.next}, but target text is too thin.`);
    }
  }
}

const twelveHourRoute = [
  "sixHourWatch",
  "hourOneBorrowedFire",
  "hourTwoWarmth",
  "hourTwoCupLedger",
  "hourThreeRoadEdge",
  "hourFourLedger",
  "hourFourLedgerSolved",
  "hourFiveMirror",
  "hourSixBlank",
  "hourSevenArchiveWind",
  "hourEightNameLedger",
  "hourNinePaperBridge",
  "hourTenCrowdDistance",
  "hourElevenBorrowedSilence",
  "hourTwelveDawnMark",
  "festivalMark",
  "finalWords",
  "win",
];

for (let index = 0; index < twelveHourRoute.length; index += 1) {
  const sceneId = twelveHourRoute[index];
  const scene = SCENES[sceneId];
  if (!scene) {
    errors.push(`Twelve-hour route scene is missing: ${sceneId}.`);
    continue;
  }
  const next = twelveHourRoute[index + 1];
  if (!next) continue;
  const hasPrimaryEdge = (scene.choices || []).some((choice) => choice.primary && choice.next === next);
  if (!hasPrimaryEdge) errors.push(`${sceneId} does not have a primary route edge to ${next}.`);
}

for (const sceneId of twelveHourRoute.slice(9, 15)) {
  const scene = SCENES[sceneId];
  for (const choice of (scene?.choices || []).filter((item) => !item.primary && !item.back && !item.reset)) {
    const target = SCENES[choice.next];
    if (!target) continue;
    const followups = (target.choices || []).filter((item) => !item.back && !item.primary);
    if (!target.ending && followups.length < 1) {
      errors.push(`${sceneId} branch ${choice.next} only returns without follow-up.`);
    }
  }
}

const fakeClues = Object.values(CLUES).filter((clue) => clue.fake || clue.kind === "fake" || clue.status === "fake");
const doubtClues = Object.values(CLUES).filter((clue) => clue.kind === "doubt" || clue.status === "doubt");
const replacementClues = Object.entries(CLUES).filter(([, clue]) => asArray(clue.replaces).length);
if (fakeClues.length < 2) errors.push("Expected at least two fake clues for branch expansion.");
if (doubtClues.length < 1) errors.push("Expected at least one doubt clue.");
if (!replacementClues.length) errors.push("Expected at least one clue replacement relationship.");

for (const [id, clue] of Object.entries(CLUES)) {
  for (const replaced of asArray(clue.replaces)) {
    if (!CLUES[replaced]) errors.push(`${id} replaces missing clue ${replaced}.`);
  }
}

for (const journalId of ["j20", "j21", "j22", "j23", "j24", "j25"]) {
  if (!JOURNALS[journalId]) errors.push(`Missing extended journal ${journalId}.`);
}

const renderChoices = source.slice(source.indexOf("function renderChoices"), source.indexOf("function renderRules"));
const leakedRenderFields = ["riskLabel", "risk", "errorTag", "mistakeTag", "danger"].filter((field) => renderChoices.includes(field));
if (leakedRenderFields.length) {
  errors.push(`Choice renderer exposes or reads internal mistake metadata: ${leakedRenderFields.join(", ")}.`);
}

if (errors.length) {
  throw new Error(`story-audit failed:\n${errors.join("\n")}`);
}

console.log(`story-audit ok: ${Object.keys(SCENES).length} scenes, ${fakeClues.length} fake clues, ${doubtClues.length} doubt clues`);
