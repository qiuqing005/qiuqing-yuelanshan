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

function groupedScenes(type) {
  const groups = new Map();
  for (const [sceneId, scene] of Object.entries(SCENES)) {
    const group = scene.expansionGroup;
    if (!group || group.type !== type) continue;
    if (!groups.has(group.id)) groups.set(group.id, []);
    groups.get(group.id).push({ sceneId, scene });
  }
  for (const items of groups.values()) {
    items.sort((a, b) => a.scene.expansionGroup.index - b.scene.expansionGroup.index);
  }
  return groups;
}

function assertGeneratedGroups(type, expectedGroups, minLength) {
  const groups = groupedScenes(type);
  if (groups.size < expectedGroups) {
    errors.push(`Expected ${expectedGroups} ${type} groups, found ${groups.size}.`);
  }
  for (const [groupId, items] of groups.entries()) {
    if (items.length < minLength) errors.push(`${type} ${groupId} has ${items.length} flows, expected at least ${minLength}.`);
    items.forEach(({ scene }, index) => {
      const expected = index + 1;
      if (scene.expansionGroup.index !== expected) errors.push(`${type} ${groupId} has non-sequential flow index at ${scene.expansionGroup.index}.`);
      if (scene.expansionGroup.length < minLength) errors.push(`${type} ${groupId} declares length ${scene.expansionGroup.length}, expected at least ${minLength}.`);
    });
  }
  return groups;
}

const openingGroups = assertGeneratedGroups("opening", 8, 20);
const theaterGroups = assertGeneratedGroups("theater", 12, 40);
const mainlineGroups = assertGeneratedGroups("mainline", 3, 80);

let openingEchoChoiceCount = 0;
for (const groupId of openingGroups.keys()) {
  const entry = `${groupId}_01`;
  if (!(SCENES.intro.choices || []).some((choice) => choice.next === entry)) {
    errors.push(`Opening ${groupId} is not reachable from intro.`);
  }
  const items = openingGroups.get(groupId) || [];
  const first = items.find((item) => item.sceneId === entry)?.scene;
  if ((first?.choices || []).length < 2) errors.push(`Opening ${groupId} starts as a line instead of a branching opening.`);
  const branchScenes = items.filter(({ scene }) => (scene.choices || []).length >= 2);
  if (branchScenes.length < 6) errors.push(`Opening ${groupId} has only ${branchScenes.length} branching nodes.`);
  const linearLabels = items.flatMap(({ sceneId, scene }) =>
    (scene.choices || [])
      .filter((choice) => /^继续.+第 \d+ 段$/.test(choice.label || ""))
      .map((choice) => `${sceneId}: ${choice.label}`)
  );
  if (linearLabels.length) errors.push(`Opening ${groupId} still has linear filler choices:\n${linearLabels.join("\n")}`);
  const exits = new Set(items.flatMap(({ scene }) =>
    (scene.choices || [])
      .map((choice) => choice.next || "")
      .filter((target) => target && !target.startsWith(`${groupId}_`))
  ));
  if (exits.size < 4) errors.push(`Opening ${groupId} has only ${exits.size} distinct downstream exits.`);
}

for (const [, scene] of Object.entries(SCENES)) {
  for (const choice of scene.choices || []) {
    if ((choice.showFlags || []).some((flag) => /^opening\d+/.test(flag))) openingEchoChoiceCount += 1;
  }
}
if (openingEchoChoiceCount < 8) errors.push(`Expected at least 8 downstream opening echo choices, found ${openingEchoChoiceCount}.`);


if (!SCENES.expandedMainlineHub) errors.push("Missing expandedMainlineHub.");
for (const groupId of mainlineGroups.keys()) {
  const entry = `${groupId}_01`;
  if (!(SCENES.expandedMainlineHub?.choices || []).some((choice) => choice.next === entry)) {
    errors.push(`Mainline ${groupId} is not reachable from expandedMainlineHub.`);
  }
}

let returnToStoredCount = 0;
let foreshadowCount = 0;
for (const [sceneId, scene] of Object.entries(SCENES)) {
  for (const choice of scene.choices || []) {
    if (choice.back) errors.push(`${sceneId} still uses back:true instead of a foreshadow/theater route.`);
    if (choice.returnToStored) returnToStoredCount += 1;
    if (choice.foreshadow) {
      foreshadowCount += 1;
      if (!/^theater\d+_01$/.test(choice.next || "")) errors.push(`${sceneId} foreshadow choice does not enter a theater route.`);
      if (!choice.returnTo || !SCENES[choice.returnTo]) errors.push(`${sceneId} foreshadow choice does not store a valid return scene.`);
      if (/回到|退回|重新|倒回/.test(choice.label || "")) {
        errors.push(`${sceneId} foreshadow choice still reads like a direct step-back option: ${choice.label}`);
      }
    }
  }
}
if (returnToStoredCount < 12) errors.push(`Expected at least 12 theater return choices, found ${returnToStoredCount}.`);
if (foreshadowCount < 12) errors.push(`Expected old back routes to become foreshadow theater entries, found ${foreshadowCount}.`);

const endingScenes = Object.entries(SCENES).filter(([, scene]) => scene.ending);
for (const [sceneId, scene] of endingScenes) {
  const choices = scene.choices || [];
  if (!choices.some((choice) => choice.next === "endingAftertalk")) {
    errors.push(`${sceneId} ending does not route to endingAftertalk.`);
  }
  if (choices.some((choice) => choice.reset || /重新开始/.test(choice.label || ""))) {
    errors.push(`${sceneId} ending still exposes direct restart copy.`);
  }
}
if (!SCENES.endingAftertalk?.dynamicAftertalk) errors.push("Missing dynamic ending aftertalk scene.");
if (!(SCENES.endingAftertalk?.choices || []).some((choice) => choice.reset && choice.dynamicLabel === "replayRemaining")) {
  errors.push("Ending aftertalk does not offer replay with remaining-ending count.");
}
if (source.includes("重新开始")) errors.push("Source still contains forbidden ending restart copy: 重新开始.");

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
