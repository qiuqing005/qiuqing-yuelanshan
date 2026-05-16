const $ = (id) => document.getElementById(id);

const PERSONA_LABELS = {
  none: "未定场景",
  qiuqing: "秋清出现",
  yuelan: "月兰山出现",
  unstable: "人格摇晃",
};

const CONDITION_TYPES = ["rule", "clue", "item", "journal", "fragment", "flag"];
const EFFECT_KEYS = [
  ["flags", "状态"],
  ["items", "道具"],
  ["clues", "线索"],
  ["journals", "手账"],
  ["rules", "规则"],
  ["fragments", "规则碎片"],
];
const EDITOR_STORY_KEY = "qiuqing-editor-current-story";

const state = {
  base: null,
  overrides: {},
  draft: null,
  stories: [],
  activeStoryId: "yuelanshan",
  selectedMediaName: "",
  replacingMediaName: "",
  media: [],
  selectedSceneId: "intro",
  activeArchive: "rules",
  dirty: false,
  linkMode: false,
  linkSource: "",
  deleted: {
    scenes: new Set(),
    sceneExpansions: new Set(),
    clues: new Set(),
    journals: new Set(),
    fragments: new Set(),
  },
};

function clonePlain(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isBlankStoryTemplate(overrides = {}) {
  return overrides.template === "blank" || overrides.blank === true || overrides.story?.template === "blank";
}

function blankDraft(story = {}) {
  return {
    template: "blank",
    story: clonePlain(story),
    assets: {},
    trueRules: [],
    fragments: {},
    clues: {},
    journals: {},
    scenes: {},
    sceneExpansions: {},
    audio: {},
    statusCatalog: [],
    itemCatalog: [],
    editorLayout: { positions: {} },
    finalGate: { enabled: false, choiceLabel: "", missingScene: "", conditions: [] },
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

function parseLines(value) {
  return String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseCsv(value) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRuleCsv(value) {
  return parseCsv(value).map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

function parseJsonField(value, fallback, label) {
  const text = String(value || "").trim();
  if (!text) return clonePlain(fallback);
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} 不是有效 JSON：${error.message}`);
  }
}

function cleanObject(value) {
  Object.keys(value).forEach((key) => {
    if (value[key] === undefined || value[key] === "" || (Array.isArray(value[key]) && value[key].length === 0)) delete value[key];
  });
  return value;
}

function mergeReplace(target, source) {
  if (!source || typeof source !== "object") return target;
  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value) || !value || typeof value !== "object") {
      target[key] = clonePlain(value);
      return;
    }
    if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
    mergeReplace(target[key], value);
  });
  return target;
}

function applyCollection(target, source, deletedSet) {
  if (!source || typeof source !== "object") return;
  Object.entries(source).forEach(([key, value]) => {
    if (value === null) {
      delete target[key];
      deletedSet?.add(key);
      return;
    }
    if (target[key] && typeof target[key] === "object" && !Array.isArray(target[key]) && typeof value === "object" && !Array.isArray(value)) {
      mergeReplace(target[key], value);
    } else {
      target[key] = clonePlain(value);
    }
  });
}

function composeDraft(base, overrides = {}) {
  const deleted = {
    scenes: new Set(),
    sceneExpansions: new Set(),
    clues: new Set(),
    journals: new Set(),
    fragments: new Set(),
  };
  const config = base.DEFAULT_EDITOR_CONFIG || {};
  const draft = isBlankStoryTemplate(overrides)
    ? blankDraft(overrides.story || {})
    : {
      story: clonePlain(config.story || {}),
      assets: clonePlain(base.ASSETS || {}),
      trueRules: clonePlain(base.TRUE_RULES || []),
      fragments: clonePlain(base.FRAGMENTS || {}),
      clues: clonePlain(base.CLUES || {}),
      journals: clonePlain(base.JOURNALS || {}),
      scenes: clonePlain(base.SCENES || {}),
      sceneExpansions: clonePlain(base.SCENE_EXPANSIONS || {}),
      audio: clonePlain(config.audio || {}),
      statusCatalog: clonePlain(config.statusCatalog || []),
      itemCatalog: clonePlain(config.itemCatalog || []),
      editorLayout: clonePlain(config.editorLayout || { positions: {} }),
      finalGate: clonePlain(config.finalGate || {}),
    };

  if (overrides.story) mergeReplace(draft.story, overrides.story);
  if (overrides.assets) mergeReplace(draft.assets, overrides.assets);
  if (Array.isArray(overrides.trueRules)) draft.trueRules = clonePlain(overrides.trueRules);
  applyCollection(draft.fragments, overrides.fragments, deleted.fragments);
  applyCollection(draft.clues, overrides.clues, deleted.clues);
  applyCollection(draft.journals, overrides.journals, deleted.journals);
  applyCollection(draft.scenes, overrides.scenes, deleted.scenes);
  applyCollection(draft.sceneExpansions, overrides.sceneExpansions, deleted.sceneExpansions);
  if (overrides.audio) mergeReplace(draft.audio, overrides.audio);
  if (Array.isArray(overrides.statusCatalog)) draft.statusCatalog = clonePlain(overrides.statusCatalog);
  if (Array.isArray(overrides.itemCatalog)) draft.itemCatalog = clonePlain(overrides.itemCatalog);
  if (overrides.editorLayout) mergeReplace(draft.editorLayout, overrides.editorLayout);
  if (overrides.finalGate) mergeReplace(draft.finalGate, overrides.finalGate);
  if (!draft.editorLayout.positions) draft.editorLayout.positions = {};
  state.deleted = deleted;
  return draft;
}

function withDeletions(collection, deletedSet) {
  const output = clonePlain(collection || {});
  deletedSet.forEach((id) => {
    if (!(id in output)) output[id] = null;
  });
  return output;
}

function draftUsesBaseTemplate() {
  return state.draft?.template !== "blank";
}

function makePayload() {
  const payload = {
    story: clonePlain(state.draft.story),
    assets: clonePlain(state.draft.assets),
    trueRules: clonePlain(state.draft.trueRules),
    fragments: withDeletions(state.draft.fragments, state.deleted.fragments),
    clues: withDeletions(state.draft.clues, state.deleted.clues),
    journals: withDeletions(state.draft.journals, state.deleted.journals),
    scenes: withDeletions(state.draft.scenes, state.deleted.scenes),
    sceneExpansions: withDeletions(state.draft.sceneExpansions, state.deleted.sceneExpansions),
    audio: clonePlain(state.draft.audio),
    statusCatalog: clonePlain(state.draft.statusCatalog),
    itemCatalog: clonePlain(state.draft.itemCatalog),
    editorLayout: clonePlain(state.draft.editorLayout),
    finalGate: clonePlain(state.draft.finalGate),
  };
  if (state.draft.template === "blank" || state.overrides.template === "blank") payload.template = "blank";
  if (payload.template === "blank") payload.story = { ...(payload.story || {}), template: "blank" };
  return payload;
}

function setStatus(message, tone = "") {
  $("statusText").textContent = message;
  $("statusText").dataset.tone = tone;
}

function markDirty(message = "有未保存修改") {
  state.dirty = true;
  setStatus(message, "dirty");
  updateRawJson();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "Content-Type": "application/json; charset=utf-8", ...(options.headers || {}) },
    ...options,
  });
  if (response.status === 401) {
    window.location.replace("/月兰山");
    throw new Error("需要登录后台。");
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${response.status} ${response.statusText}`);
  }
  return response.json();
}

function normalizeStoryPathInput(value, fallback = "/yuelanshan") {
  let text = String(value || "").trim();
  if (!text) text = fallback;
  if (!text.startsWith("/")) text = `/${text}`;
  text = text.replace(/\/+/g, "/");
  if (text.length > 1) text = text.replace(/\/+$/g, "");
  return text;
}

function storyApi(path = "overrides", storyId = state.activeStoryId) {
  return `/api/editor/stories/${encodeURIComponent(storyId)}/${path}`;
}

function currentStoryMeta() {
  return state.stories.find((story) => story.id === state.activeStoryId) || null;
}

async function loadAll() {
  setStatus("读取中...");
  const [base, storyIndex, media] = await Promise.all([
    fetchJson("/api/editor/base"),
    fetchJson("/api/editor/stories"),
    fetchJson("/api/media/list").catch(() => ({ files: [] })),
  ]);
  state.base = base;
  state.stories = storyIndex.stories || [];
  const savedId = localStorage.getItem(EDITOR_STORY_KEY);
  state.activeStoryId = state.stories.some((story) => story.id === savedId)
    ? savedId
    : storyIndex.activeId || state.stories[0]?.id || "yuelanshan";
  localStorage.setItem(EDITOR_STORY_KEY, state.activeStoryId);
  const overrides = await fetchJson(storyApi("overrides"));
  state.overrides = overrides || {};
  state.media = media.files || [];
  state.draft = composeDraft(base, state.overrides);
  state.draft.story = {
    ...(state.draft.story || {}),
    ...(currentStoryMeta() || {}),
    ...(state.overrides.story || {}),
    id: state.activeStoryId,
  };
  if (!state.draft.scenes[state.selectedSceneId]) state.selectedSceneId = Object.keys(state.draft.scenes)[0] || "";
  state.dirty = false;
  renderAll();
  setStatus("已读取后台配置", "ok");
}

function collectCurrentForms() {
  if (!state.draft) return;
  readStoryForm();
  readSceneForm({ silent: true });
  readArchiveForm({ silent: true });
  readMediaForm();
  readFinalForm();
}

async function saveAll() {
  try {
    collectCurrentForms();
    const payload = makePayload();
    const result = await fetchJson(storyApi("overrides"), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    state.overrides = payload;
    if (result.story) {
      state.stories = state.stories.filter((story) => story.id !== result.story.id).concat(result.story);
      state.draft.story = { ...(state.draft.story || {}), ...result.story };
      renderStoryManager();
    }
    state.dirty = false;
    setStatus(`已保存 ${new Date(result.updatedAt || Date.now()).toLocaleString()}`, "ok");
    updateRawJson();
  } catch (error) {
    setStatus(error.message, "bad");
  }
}

function sceneDisplayName(id, scene = state.draft?.scenes[id]) {
  if (!scene) return id;
  if (scene.name || scene.title) return scene.name || scene.title;
  const head = [scene.chapter, scene.code].filter(Boolean).join(" ");
  const preview = (scene.text || []).join(" ").replace(/[。！？].*$/, "").slice(0, 10);
  return [head, preview].filter(Boolean).join(" · ") || id;
}

function scenePreview(scene) {
  return (scene?.text || []).join(" ").slice(0, 72);
}

function allEffectValues(key) {
  const values = new Set();
  Object.values(state.draft.scenes || {}).forEach((scene) => {
    collectEffectValues(values, scene.effects, key);
    (scene.choices || []).forEach((choice) => collectEffectValues(values, choice.effects, key));
  });
  return Array.from(values).sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
}

function collectEffectValues(values, effects, key) {
  (effects?.[key] || []).forEach((item) => values.add(item));
  (effects?.remove?.[key] || []).forEach((item) => values.add(item));
}

function catalogForKey(key) {
  if (key === "flags") {
    return [
      ...(state.draft.statusCatalog || []).map((item) => [item.id, item.label || item.id]),
      ...allEffectValues("flags").map((id) => [id, id]),
    ];
  }
  if (key === "items") {
    return [
      ...(state.draft.itemCatalog || []).map((item) => [item.id, item.label || item.id]),
      ...allEffectValues("items").map((id) => [id, id]),
    ];
  }
  if (key === "clues") return Object.entries(state.draft.clues || {}).map(([id, item]) => [id, `${item.no || item.number ? `${item.no || item.number} · ` : ""}${item.title || id}`]);
  if (key === "journals") return Object.entries(state.draft.journals || {}).map(([id, item]) => [id, item.title || id]);
  if (key === "fragments") return Object.entries(state.draft.fragments || {}).map(([id, item]) => [id, item.text || id]);
  if (key === "rules") return state.draft.trueRules.map((rule, index) => [String(index + 1), `${index + 1}. ${rule.slice(0, 24)}`]);
  return [];
}

function uniquePairs(pairs) {
  const seen = new Set();
  return pairs.filter(([id]) => {
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderCheckGroup(key, label, selected = [], mode = "add") {
  const pairs = uniquePairs(catalogForKey(key));
  if (!pairs.length) return `<div class="effectGroup empty"><strong>${label}</strong><span>暂无可选项</span></div>`;
  return `
    <div class="effectGroup" data-key="${key}" data-mode="${mode}">
      <strong>${escapeHtml(label)}</strong>
      <div class="chipGrid">
        ${pairs.map(([id, text]) => `
          <label class="chip"><input class="effectCheck" type="checkbox" data-key="${key}" data-mode="${mode}" value="${escapeAttr(id)}" ${selected.map(String).includes(String(id)) ? "checked" : ""} /> ${escapeHtml(text)}</label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderEffectBuilder(container, effects = {}) {
  const remove = effects.remove || {};
  const mainKeys = EFFECT_KEYS.filter(([key]) => !["rules", "fragments"].includes(key));
  const archiveKeys = EFFECT_KEYS.filter(([key]) => ["rules", "fragments"].includes(key));
  container.innerHTML = `
    <div class="effectColumns">
      <section>
        <h4>获得</h4>
        ${mainKeys.map(([key, label]) => renderCheckGroup(key, label, (effects[key] || []).map(String), "add")).join("")}
        <details><summary>规则与碎片</summary>${archiveKeys.map(([key, label]) => renderCheckGroup(key, label, (effects[key] || []).map(String), "add")).join("")}</details>
      </section>
      <section>
        <h4>消失</h4>
        ${mainKeys.map(([key, label]) => renderCheckGroup(key, label, (remove[key] || []).map(String), "remove")).join("")}
        <details><summary>规则与碎片</summary>${archiveKeys.map(([key, label]) => renderCheckGroup(key, label, (remove[key] || []).map(String), "remove")).join("")}</details>
      </section>
    </div>
  `;
}

function readEffectBuilder(root, jsonText, label) {
  const effects = parseJsonField(jsonText, {}, label);
  EFFECT_KEYS.forEach(([key]) => {
    delete effects[key];
    if (effects.remove) delete effects.remove[key];
  });
  const add = {};
  const remove = {};
  root.querySelectorAll(".effectCheck:checked").forEach((input) => {
    const bucket = input.dataset.mode === "remove" ? remove : add;
    if (!bucket[input.dataset.key]) bucket[input.dataset.key] = [];
    const value = input.dataset.key === "rules" ? Number(input.value) : input.value;
    bucket[input.dataset.key].push(value);
  });
  Object.assign(effects, add);
  if (Object.keys(remove).length) effects.remove = { ...(effects.remove || {}), ...remove };
  if (effects.remove && !Object.keys(effects.remove).length) delete effects.remove;
  return cleanObject(effects);
}

function optionList(selected = "") {
  return Object.entries(state.draft.scenes || {}).map(([id, scene]) =>
    `<option value="${escapeAttr(id)}" ${selected === id ? "selected" : ""}>${escapeHtml(sceneDisplayName(id, scene))}（${escapeHtml(id)}）</option>`
  ).join("");
}

function renderAll() {
  renderStoryManager();
  renderStory();
  renderSceneList();
  renderFlow();
  renderSceneEditor();
  renderChoicesEditor();
  renderArchive();
  renderMedia();
  renderFinal();
  updateRawJson();
}

function renderStoryManager() {
  const select = $("storySelect");
  select.innerHTML = state.stories.map((story) =>
    `<option value="${escapeAttr(story.id)}" ${story.id === state.activeStoryId ? "selected" : ""}>${escapeHtml(story.title || story.id)}（${escapeHtml(story.path || `/${story.id}`)}）</option>`
  ).join("");
  const story = { ...(currentStoryMeta() || {}), ...(state.draft?.story || {}) };
  $("storyPublishedToggle").checked = story.published !== false;
  $("openStoryLink").href = story.path || state.draft?.story?.path || "/yuelanshan";
}

function renderStory() {
  const story = state.draft.story || {};
  $("storyId").value = story.id || state.activeStoryId;
  $("storyTitle").value = story.title || "";
  $("storySubtitle").value = story.subtitle || "";
  $("storyPath").value = story.path || "/yuelanshan";
  $("storyEntryLabel").value = story.entryLabel || "进入故事";
  $("storyCover").value = story.cover || "";
  $("storyIntro").value = story.intro || "";
  $("storyPublished").checked = story.published !== false;
  $("storyPublishedToggle").checked = story.published !== false;
  $("openStoryLink").href = story.path || "/yuelanshan";
}

function readStoryForm() {
  if (!state.draft) return;
  state.draft.story = cleanObject({
    id: state.activeStoryId,
    title: $("storyTitle").value.trim(),
    subtitle: $("storySubtitle").value.trim(),
    path: normalizeStoryPathInput($("storyPath").value, state.activeStoryId === "yuelanshan" ? "/yuelanshan" : `/${state.activeStoryId}`),
    entryLabel: $("storyEntryLabel").value.trim(),
    cover: $("storyCover").value.trim(),
    intro: $("storyIntro").value.trim(),
    published: $("storyPublished").checked && $("storyPublishedToggle").checked,
  });
  renderStoryManager();
}

function renderSceneList() {
  const list = $("sceneList");
  const search = $("sceneSearch").value.trim().toLowerCase();
  const entries = Object.entries(state.draft?.scenes || {}).filter(([id, scene]) => {
    const haystack = `${id} ${sceneDisplayName(id, scene)} ${scene?.chapter || ""} ${scene?.speaker || ""} ${scenePreview(scene)}`.toLowerCase();
    return !search || haystack.includes(search);
  });
  list.innerHTML = "";
  entries.forEach(([id, scene]) => {
    const item = document.createElement("button");
    item.type = "button";
    item.draggable = true;
    item.className = `sceneItem ${id === state.selectedSceneId ? "active" : ""}`;
    item.innerHTML = `
      <strong>${escapeHtml(sceneDisplayName(id, scene))}</strong>
      <span>${escapeHtml(id)} / ${escapeHtml(scene?.speaker || "无说话人")} / ${escapeHtml(PERSONA_LABELS[scene?.persona] || scene?.persona || "未定")}</span>
      <span>${escapeHtml(scenePreview(scene))}</span>
    `;
    item.addEventListener("click", () => selectScene(id));
    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", id);
      event.dataTransfer.effectAllowed = "copyMove";
    });
    list.appendChild(item);
  });
}

function reachableScenes() {
  const scenes = state.draft?.scenes || {};
  const start = scenes.intro ? "intro" : Object.keys(scenes)[0];
  const reachable = new Set();
  const depths = new Map();
  if (!start) return { reachable, depths };
  const queue = [start];
  depths.set(start, 0);
  reachable.add(start);
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index];
    const depth = depths.get(id) || 0;
    (scenes[id]?.choices || []).forEach((choice) => {
      const next = choice.next;
      if (!next || !scenes[next] || reachable.has(next)) return;
      reachable.add(next);
      depths.set(next, depth + 1);
      queue.push(next);
    });
  }
  return { reachable, depths };
}

function computeFlowPositions(ids, depths) {
  const positions = new Map();
  const levelCounts = new Map();
  const saved = state.draft.editorLayout.positions || {};
  const maxKnownDepth = Math.max(0, ...Array.from(depths.values()));
  let disconnected = 0;
  ids.forEach((id) => {
    if (saved[id]) {
      positions.set(id, saved[id]);
      return;
    }
    let depth = depths.get(id);
    if (depth === undefined) {
      depth = maxKnownDepth + 1 + Math.floor(disconnected / 3);
      disconnected += 1;
    }
    const row = levelCounts.get(depth) || 0;
    levelCounts.set(depth, row + 1);
    positions.set(id, { x: 60 + depth * 340, y: 60 + row * 168 });
  });
  return positions;
}

function renderFlow() {
  const nodes = $("flowNodes");
  const svg = $("flowSvg");
  const canvas = $("flowCanvas");
  const scenes = state.draft?.scenes || {};
  const { reachable, depths } = reachableScenes();
  const onlyReachable = $("showOnlyReachable").checked;
  const ids = Object.keys(scenes).filter((id) => !onlyReachable || reachable.has(id) || id === state.selectedSceneId);
  const positions = computeFlowPositions(ids, depths);
  const width = Math.max(1200, ...Array.from(positions.values()).map((pos) => pos.x + 300));
  const height = Math.max(820, ...Array.from(positions.values()).map((pos) => pos.y + 150));
  nodes.style.width = `${width}px`;
  nodes.style.height = `${height}px`;
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  canvas.dataset.linkMode = state.linkMode ? "true" : "false";

  const edgeParts = [
    `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="rgba(240,179,91,.58)"/></marker></defs>`,
  ];
  ids.forEach((id) => {
    const from = positions.get(id);
    (scenes[id]?.choices || []).forEach((choice) => {
      const to = positions.get(choice.next);
      if (!from || !to) return;
      const startX = from.x + 232;
      const startY = from.y + 48;
      const endX = to.x;
      const endY = to.y + 48;
      const mid = Math.max(70, (endX - startX) / 2);
      const dangerClass = choice.danger || choice.confession ? " dangerEdge" : "";
      edgeParts.push(`<path class="flowEdge${dangerClass}" d="M${startX} ${startY} C${startX + mid} ${startY}, ${endX - mid} ${endY}, ${endX} ${endY}" marker-end="url(#arrow)" />`);
    });
  });
  svg.innerHTML = edgeParts.join("");

  nodes.innerHTML = "";
  ids.forEach((id) => {
    const scene = scenes[id];
    const pos = positions.get(id);
    const node = document.createElement("button");
    node.type = "button";
    node.className = `flowNode ${id === state.selectedSceneId ? "active" : ""} ${id === state.linkSource ? "linkSource" : ""}`;
    node.style.left = `${pos.x}px`;
    node.style.top = `${pos.y}px`;
    node.innerHTML = `
      <small>${escapeHtml(sceneDisplayName(id, scene))}</small>
      <div>${escapeHtml(scene?.speaker || "旁白")}</div>
      <p>${escapeHtml(id)} · ${(scene.choices || []).length} 个选项</p>
    `;
    bindFlowNode(node, id);
    nodes.appendChild(node);
  });
}

function bindFlowNode(node, id) {
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  let moved = false;
  node.addEventListener("pointerdown", (event) => {
    if (state.linkMode) return;
    startX = event.clientX;
    startY = event.clientY;
    const pos = state.draft.editorLayout.positions[id] || { x: parseFloat(node.style.left), y: parseFloat(node.style.top) };
    baseX = pos.x;
    baseY = pos.y;
    moved = false;
    node.setPointerCapture(event.pointerId);
  });
  node.addEventListener("pointermove", (event) => {
    if (state.linkMode || !node.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) < 5 && !moved) return;
    moved = true;
    const next = { x: Math.max(0, baseX + dx), y: Math.max(0, baseY + dy) };
    state.draft.editorLayout.positions[id] = next;
    node.style.left = `${next.x}px`;
    node.style.top = `${next.y}px`;
  });
  node.addEventListener("pointerup", (event) => {
    if (!state.linkMode && node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
    if (moved) {
      markDirty("流程图位置已调整");
      renderFlow();
      return;
    }
    handleFlowNodeClick(id);
  });
}

function handleFlowNodeClick(id) {
  if (!state.linkMode) {
    selectScene(id);
    return;
  }
  if (!state.linkSource) {
    state.linkSource = id;
    selectScene(id);
    setStatus(`快速连线：已选择起点 ${sceneDisplayName(id)}`, "dirty");
    renderFlow();
    return;
  }
  if (state.linkSource === id) {
    state.linkSource = "";
    renderFlow();
    return;
  }
  const source = state.draft.scenes[state.linkSource];
  if (!source.choices) source.choices = [];
  source.choices.push({ label: `前往：${sceneDisplayName(id)}`, next: id });
  const sourceName = sceneDisplayName(state.linkSource);
  state.linkSource = "";
  state.linkMode = false;
  $("linkModeButton").classList.remove("active");
  markDirty(`已连线：${sourceName} → ${sceneDisplayName(id)}`);
  renderAll();
}

function bindFlowCanvas() {
  const canvas = $("flowCanvas");
  let panning = false;
  let startX = 0;
  let startY = 0;
  let left = 0;
  let top = 0;
  canvas.addEventListener("pointerdown", (event) => {
    if (!["flowCanvas", "flowNodes", "flowSvg"].includes(event.target.id)) return;
    panning = true;
    startX = event.clientX;
    startY = event.clientY;
    left = canvas.scrollLeft;
    top = canvas.scrollTop;
    canvas.classList.add("panning");
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!panning) return;
    canvas.scrollLeft = left - (event.clientX - startX);
    canvas.scrollTop = top - (event.clientY - startY);
  });
  canvas.addEventListener("pointerup", (event) => {
    panning = false;
    canvas.classList.remove("panning");
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  });
  canvas.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  canvas.addEventListener("drop", (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (!id || !state.draft.scenes[id]) return;
    const rect = canvas.getBoundingClientRect();
    state.draft.editorLayout.positions[id] = {
      x: Math.max(0, event.clientX - rect.left + canvas.scrollLeft - 110),
      y: Math.max(0, event.clientY - rect.top + canvas.scrollTop - 42),
    };
    state.selectedSceneId = id;
    markDirty("已把左侧场景拖入流程图");
    renderAll();
  });
}

function selectScene(id) {
  if (!state.draft?.scenes[id]) return;
  readSceneForm({ silent: true });
  state.selectedSceneId = id;
  renderSceneList();
  renderFlow();
  renderSceneEditor();
  renderChoicesEditor();
}

function renderSceneEditor() {
  const scene = state.draft?.scenes[state.selectedSceneId];
  if (!scene) return;
  $("sceneId").value = state.selectedSceneId;
  $("sceneName").value = scene.name || scene.title || "";
  $("sceneChapter").value = scene.chapter || "";
  $("sceneCode").value = scene.code || "";
  $("sceneSpeaker").value = scene.speaker || "";
  $("scenePersona").value = scene.persona || "none";
  $("sceneBg").value = scene.bg || "";
  $("scenePortrait").value = scene.portrait || "";
  $("sceneText").value = (scene.text || []).join("\n");
  $("sceneExpansion").value = (state.draft.sceneExpansions[state.selectedSceneId] || []).join("\n");
  renderEffectBuilder($("sceneEffectsBuilder"), scene.effects || {});
  $("sceneEffects").value = JSON.stringify(scene.effects || {}, null, 2);
}

function readSceneForm({ silent = false } = {}) {
  if (!state.draft || !$("sceneId")) return;
  const oldId = state.selectedSceneId;
  if (!state.draft.scenes[oldId]) return;
  const newId = $("sceneId").value.trim();
  if (!newId) {
    if (!silent) setStatus("场景 ID 不能为空", "bad");
    return;
  }
  let effects;
  try {
    effects = readEffectBuilder($("sceneEffectsBuilder"), $("sceneEffects").value, "场景高级配置");
  } catch (error) {
    if (!silent) setStatus(error.message, "bad");
    return;
  }
  const scene = cleanObject({
    name: $("sceneName").value.trim(),
    chapter: $("sceneChapter").value.trim(),
    code: $("sceneCode").value.trim(),
    speaker: $("sceneSpeaker").value.trim(),
    persona: $("scenePersona").value,
    bg: $("sceneBg").value.trim(),
    portrait: $("scenePortrait").value.trim(),
    text: parseLines($("sceneText").value),
    choices: readChoicesEditor(),
    effects: Object.keys(effects).length ? effects : undefined,
  });
  if (!scene.text?.length) scene.text = [""];
  const expansion = parseLines($("sceneExpansion").value);
  if (newId !== oldId) {
    state.draft.scenes[newId] = scene;
    delete state.draft.scenes[oldId];
    state.draft.sceneExpansions[newId] = expansion;
    delete state.draft.sceneExpansions[oldId];
    if (state.draft.editorLayout.positions[oldId]) {
      state.draft.editorLayout.positions[newId] = state.draft.editorLayout.positions[oldId];
      delete state.draft.editorLayout.positions[oldId];
    }
    state.deleted.scenes.delete(newId);
    state.deleted.sceneExpansions.delete(newId);
    if (draftUsesBaseTemplate() && state.base?.SCENES?.[oldId]) state.deleted.scenes.add(oldId);
    if (draftUsesBaseTemplate() && state.base?.SCENE_EXPANSIONS?.[oldId]) state.deleted.sceneExpansions.add(oldId);
    updateSceneReferences(oldId, newId);
    state.selectedSceneId = newId;
  } else {
    state.draft.scenes[oldId] = scene;
    if (expansion.length) state.draft.sceneExpansions[oldId] = expansion;
    else delete state.draft.sceneExpansions[oldId];
  }
  if (!silent) {
    markDirty();
    renderAll();
  }
}

function updateSceneReferences(oldId, newId) {
  Object.values(state.draft.scenes).forEach((scene) => {
    (scene.choices || []).forEach((choice) => {
      if (choice.next === oldId) choice.next = newId;
    });
  });
  if (state.draft.finalGate?.missingScene === oldId) state.draft.finalGate.missingScene = newId;
}

function selectedValues(choice, key, prefix = "requires") {
  return (choice[`${prefix}${key[0].toUpperCase()}${key.slice(1)}`] || []).map(String);
}

function renderRequirementGroup(choice, prefix) {
  return `
    <div class="requirementGrid" data-prefix="${prefix}">
      ${["items", "clues", "flags", "journals"].map((key) => renderCheckGroup(key, key === "items" ? "道具" : key === "clues" ? "线索" : key === "flags" ? "状态" : "手账", selectedValues(choice, key, prefix), prefix)).join("")}
    </div>
  `;
}

function readRequirementGroup(card, choice, prefix) {
  ["items", "clues", "flags", "journals"].forEach((key) => {
    const prop = `${prefix}${key[0].toUpperCase()}${key.slice(1)}`;
    const values = Array.from(card.querySelectorAll(`.effectCheck[data-mode="${prefix}"][data-key="${key}"]:checked`)).map((input) => input.value);
    if (values.length) choice[prop] = values;
  });
}

function renderChoicesEditor() {
  const container = $("choicesEditor");
  const scene = state.draft?.scenes[state.selectedSceneId];
  if (!scene) return;
  container.innerHTML = (scene.choices || []).map((choice, index) => `
    <div class="choiceCard" data-index="${index}">
      <div class="choiceTop">
        <strong>选项 ${index + 1}</strong>
        <button type="button" class="mini danger removeChoice">删除</button>
      </div>
      <label>选项文本<input class="input choiceLabel" value="${escapeAttr(choice.label || "")}" /></label>
      <label>跳转场景
        <select class="input choiceNext">
          <option value="">不跳转</option>
          ${optionList(choice.next || "")}
        </select>
      </label>
      <div class="checkGrid">
        <label><input class="choiceConfession" type="checkbox" ${choice.confession ? "checked" : ""} /> 表白</label>
        <label><input class="choiceBack" type="checkbox" ${choice.back ? "checked" : ""} /> 返回</label>
        <label><input class="choiceReset" type="checkbox" ${choice.reset ? "checked" : ""} /> 重开</label>
        <label><input class="choiceDanger" type="checkbox" ${choice.danger ? "checked" : ""} /> 危险</label>
        <label><input class="choicePrimary" type="checkbox" ${choice.primary ? "checked" : ""} /> 主线</label>
      </div>
      <details>
        <summary>满足后才出现</summary>
        ${renderRequirementGroup(choice, "show")}
      </details>
      <details>
        <summary>满足后才可点击</summary>
        ${renderRequirementGroup(choice, "requires")}
        <label>所需规则编号<input class="input choiceRequiresRules" value="${escapeAttr((choice.requiresRules || []).join(", "))}" /></label>
      </details>
      <details open>
        <summary>选择后获得 / 消失</summary>
        <div class="choiceEffectsBuilder effectBuilder"></div>
      </details>
      <label>高级配置 JSON<textarea class="textarea code choiceEffects" spellcheck="false">${escapeHtml(JSON.stringify(choice.effects || {}, null, 2))}</textarea></label>
    </div>
  `).join("");
  container.querySelectorAll(".choiceCard").forEach((card, index) => {
    renderEffectBuilder(card.querySelector(".choiceEffectsBuilder"), scene.choices[index]?.effects || {});
  });
  container.querySelectorAll(".removeChoice").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.closest(".choiceCard").dataset.index);
      scene.choices.splice(index, 1);
      markDirty();
      renderChoicesEditor();
      renderFlow();
    });
  });
}

function readChoicesEditor() {
  return Array.from(document.querySelectorAll(".choiceCard")).map((card, index) => {
    const choice = { label: card.querySelector(".choiceLabel").value.trim() || `未命名选项 ${index + 1}` };
    const next = card.querySelector(".choiceNext").value;
    if (next) choice.next = next;
    if (card.querySelector(".choiceConfession").checked) choice.confession = true;
    if (card.querySelector(".choiceBack").checked) choice.back = true;
    if (card.querySelector(".choiceReset").checked) choice.reset = true;
    if (card.querySelector(".choiceDanger").checked) choice.danger = true;
    if (card.querySelector(".choicePrimary").checked) choice.primary = true;
    const requiresRules = parseRuleCsv(card.querySelector(".choiceRequiresRules")?.value || "");
    if (requiresRules.length) choice.requiresRules = requiresRules;
    readRequirementGroup(card, choice, "show");
    readRequirementGroup(card, choice, "requires");
    const effects = readEffectBuilder(card.querySelector(".choiceEffectsBuilder"), card.querySelector(".choiceEffects").value, `第 ${index + 1} 个选项高级配置`);
    if (Object.keys(effects).length) choice.effects = effects;
    return choice;
  });
}

function deleteSelectedScene() {
  const id = state.selectedSceneId;
  if (!id || !state.draft.scenes[id]) return;
  if (!window.confirm(`删除场景 ${sceneDisplayName(id)} 的后台覆盖？保存后游戏中将不再出现该节点。`)) return;
  delete state.draft.scenes[id];
  delete state.draft.sceneExpansions[id];
  delete state.draft.editorLayout.positions[id];
  if (draftUsesBaseTemplate() && state.base?.SCENES?.[id]) state.deleted.scenes.add(id);
  if (draftUsesBaseTemplate() && state.base?.SCENE_EXPANSIONS?.[id]) state.deleted.sceneExpansions.add(id);
  state.selectedSceneId = Object.keys(state.draft.scenes)[0] || "";
  markDirty();
  renderAll();
}

function addScene() {
  const baseId = "newScene";
  let index = 1;
  let id = baseId;
  while (state.draft.scenes[id]) id = `${baseId}${++index}`;
  state.draft.scenes[id] = {
    name: "新事件",
    chapter: "新章",
    code: String(Object.keys(state.draft.scenes).length).padStart(2, "0"),
    speaker: "旁白",
    persona: "none",
    bg: state.draft.assets?.night || "",
    text: ["在这里写下新的事件。"],
    choices: [],
  };
  state.selectedSceneId = id;
  markDirty();
  renderAll();
}

function renderArchive() {
  if (state.activeArchive === "rules") renderRulesArchive();
  if (state.activeArchive === "clues") renderCluesArchive();
  if (state.activeArchive === "journals") renderJournalsArchive();
}

function archiveHead(title, actionLabel) {
  $("archiveList").innerHTML = `<div class="archiveSummary">${escapeHtml(title)}</div>`;
  return `<div class="archiveToolbar"><button id="addArchiveItem" type="button">${escapeHtml(actionLabel)}</button><button id="applyArchiveButton" type="button">应用档案修改</button></div>`;
}

function renderRulesArchive() {
  $("archiveEditor").innerHTML = archiveHead(`规则档案 ${state.draft.trueRules.length} 条`, "新增规则") + state.draft.trueRules.map((rule, index) => `
    <div class="archiveRow" data-rule-index="${index}">
      <div class="choiceTop"><strong>规则 ${index + 1}</strong><button type="button" class="mini danger removeRule">删除</button></div>
      <textarea class="textarea ruleText">${escapeHtml(rule)}</textarea>
    </div>
  `).join("");
  $("addArchiveItem").addEventListener("click", () => {
    state.draft.trueRules.push("新规则内容");
    markDirty();
    renderRulesArchive();
  });
  $("applyArchiveButton").addEventListener("click", () => readArchiveForm());
  document.querySelectorAll(".removeRule").forEach((button) => {
    button.addEventListener("click", () => {
      state.draft.trueRules.splice(Number(button.closest(".archiveRow").dataset.ruleIndex), 1);
      markDirty();
      renderRulesArchive();
    });
  });
}

function clueSceneTiming(id) {
  return Object.entries(state.draft.scenes)
    .filter(([, scene]) => (scene.effects?.clues || []).includes(id))
    .map(([sceneId]) => sceneId)
    .join(", ");
}

function clueChoiceTiming(id) {
  const refs = [];
  Object.entries(state.draft.scenes).forEach(([sceneId, scene]) => {
    (scene.choices || []).forEach((choice, index) => {
      if ((choice.effects?.clues || []).includes(id)) refs.push(`${sceneId}#${index + 1}`);
    });
  });
  return refs.join(", ");
}

function clueReplaceScenes(id) {
  return Object.entries(state.draft.scenes)
    .filter(([, scene]) => (scene.effects?.clues || []).includes(id))
    .map(([sceneId]) => sceneId)
    .join(", ");
}

function renderCluesArchive() {
  const entries = Object.entries(state.draft.clues);
  $("archiveEditor").innerHTML = archiveHead(`线索 ${entries.length} 条，可设置真/伪/存疑与替换`, "新增线索") + entries.map(([id, clue]) => `
    <div class="archiveRow clueArchiveRow" data-old-id="${escapeAttr(id)}">
      <div class="choiceTop"><strong>${escapeHtml(id)}</strong><button type="button" class="mini danger removeClue">删除</button></div>
      <div class="grid2">
        <label>线索 ID<input class="input clueId" value="${escapeAttr(id)}" /></label>
        <label>线索序号<input class="input clueNo" value="${escapeAttr(clue.no || clue.number || "")}" /></label>
      </div>
      <div class="grid2">
        <label>标题<input class="input clueTitle" value="${escapeAttr(clue.title || "")}" /></label>
        <label>状态
          <select class="input clueKind">
            <option value="true" ${!clue.fake && clue.kind !== "fake" && clue.kind !== "doubt" ? "selected" : ""}>真线索</option>
            <option value="fake" ${clue.fake || clue.kind === "fake" ? "selected" : ""}>伪线索</option>
            <option value="doubt" ${clue.kind === "doubt" ? "selected" : ""}>存疑线索</option>
          </select>
        </label>
      </div>
      <label>图片 URL / 资源路径<input class="input clueImg" value="${escapeAttr(clue.img || "")}" /></label>
      <label>线索正文<textarea class="textarea clueBody">${escapeHtml(clue.body || "")}</textarea></label>
      <div class="grid2">
        <label>进入这些场景时获得<input class="input clueAcquireScenes" value="${escapeAttr(clueSceneTiming(id))}" placeholder="intro, teaWarm" /></label>
        <label>点击这些选项后获得<input class="input clueAcquireChoices" value="${escapeAttr(clueChoiceTiming(id))}" placeholder="sceneId#1, sceneId#3" /></label>
      </div>
      <div class="grid2">
        <label>获得本线索时替换掉<input class="input clueReplaces" value="${escapeAttr(Array.isArray(clue.replaces) ? clue.replaces.join(", ") : clue.replaces || "")}" placeholder="fakeClueId" /></label>
        <label>本伪线索在这些场景替换为真线索<input class="input clueReplacedBy" value="${escapeAttr(clue.replacedBy || "")}" placeholder="trueClueId" /></label>
      </div>
      <label>触发替换的场景<input class="input clueReplaceScenes" value="${escapeAttr(clue.replacedBy ? clueReplaceScenes(clue.replacedBy) : "")}" placeholder="sceneId, sceneId2" /></label>
    </div>
  `).join("");
  $("addArchiveItem").addEventListener("click", () => {
    let id = "newClue";
    let index = 1;
    while (state.draft.clues[id]) id = `newClue${++index}`;
    state.draft.clues[id] = { title: "新线索", img: state.draft.assets?.moon || "", body: "在这里写下线索内容。", kind: "true" };
    markDirty();
    renderCluesArchive();
  });
  $("applyArchiveButton").addEventListener("click", () => readArchiveForm());
  document.querySelectorAll(".removeClue").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.closest(".archiveRow").dataset.oldId;
      delete state.draft.clues[id];
      removeArchiveRefs("clues", id);
      if (state.base?.CLUES?.[id]) state.deleted.clues.add(id);
      markDirty();
      renderCluesArchive();
    });
  });
}

function renderJournalsArchive() {
  const entries = Object.entries(state.draft.journals);
  $("archiveEditor").innerHTML = archiveHead(`手账 ${entries.length} 篇`, "新增手账") + entries.map(([id, journal]) => `
    <div class="archiveRow journalArchiveRow" data-old-id="${escapeAttr(id)}">
      <div class="choiceTop"><strong>${escapeHtml(id)}</strong><button type="button" class="mini danger removeJournal">删除</button></div>
      <div class="grid2">
        <label>手账 ID<input class="input journalId" value="${escapeAttr(id)}" /></label>
        <label>标题<input class="input journalTitle" value="${escapeAttr(journal.title || "")}" /></label>
      </div>
      <label>正文<textarea class="textarea journalBody">${escapeHtml(journal.body || "")}</textarea></label>
    </div>
  `).join("");
  $("addArchiveItem").addEventListener("click", () => {
    let id = "newJournal";
    let index = 1;
    while (state.draft.journals[id]) id = `newJournal${++index}`;
    state.draft.journals[id] = { title: "新手账", body: "在这里写下手账内容。" };
    markDirty();
    renderJournalsArchive();
  });
  $("applyArchiveButton").addEventListener("click", () => readArchiveForm());
  document.querySelectorAll(".removeJournal").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.closest(".archiveRow").dataset.oldId;
      delete state.draft.journals[id];
      removeArchiveRefs("journals", id);
      if (state.base?.JOURNALS?.[id]) state.deleted.journals.add(id);
      markDirty();
      renderJournalsArchive();
    });
  });
}

function readArchiveForm({ silent = false } = {}) {
  try {
    if (state.activeArchive === "rules") {
      state.draft.trueRules = Array.from(document.querySelectorAll(".ruleText")).map((textarea) => textarea.value.trim());
    }
    if (state.activeArchive === "clues") readCluesForm();
    if (state.activeArchive === "journals") readJournalsForm();
    if (!silent) {
      markDirty();
      renderArchive();
      renderChoicesEditor();
    }
  } catch (error) {
    if (!silent) setStatus(error.message, "bad");
  }
}

function readCluesForm() {
  const rows = Array.from(document.querySelectorAll(".clueArchiveRow"));
  if (!rows.length && state.activeArchive !== "clues") return;
  const oldIds = rows.map((row) => row.dataset.oldId);
  const newIds = rows.map((row) => row.querySelector(".clueId").value.trim()).filter(Boolean);
  if (new Set(newIds).size !== newIds.length) throw new Error("线索 ID 不能重复。");
  removeClueAcquisition(new Set([...oldIds, ...Object.keys(state.draft.clues)]));
  const nextClues = {};
  rows.forEach((row) => {
    const oldId = row.dataset.oldId;
    const id = row.querySelector(".clueId").value.trim();
    if (!id) throw new Error("线索 ID 不能为空。");
    const kind = row.querySelector(".clueKind").value;
    const clue = cleanObject({
      no: row.querySelector(".clueNo").value.trim(),
      title: row.querySelector(".clueTitle").value.trim(),
      img: row.querySelector(".clueImg").value.trim(),
      body: row.querySelector(".clueBody").value.trim(),
      kind,
      fake: kind === "fake" ? true : undefined,
      replaces: parseCsv(row.querySelector(".clueReplaces").value),
      replacedBy: row.querySelector(".clueReplacedBy").value.trim(),
    });
    nextClues[id] = clue;
    if (oldId !== id) {
      updateArchiveRefs("clues", oldId, id);
      if (state.base?.CLUES?.[oldId]) state.deleted.clues.add(oldId);
      state.deleted.clues.delete(id);
    }
    applyClueTiming(id, row.querySelector(".clueAcquireScenes").value, row.querySelector(".clueAcquireChoices").value);
    const replacedBy = row.querySelector(".clueReplacedBy").value.trim();
    if (replacedBy) applyClueTiming(replacedBy, row.querySelector(".clueReplaceScenes").value, "");
  });
  state.draft.clues = nextClues;
}

function readJournalsForm() {
  const rows = Array.from(document.querySelectorAll(".journalArchiveRow"));
  if (!rows.length && state.activeArchive !== "journals") return;
  const ids = rows.map((row) => row.querySelector(".journalId").value.trim()).filter(Boolean);
  if (new Set(ids).size !== ids.length) throw new Error("手账 ID 不能重复。");
  const nextJournals = {};
  rows.forEach((row) => {
    const oldId = row.dataset.oldId;
    const id = row.querySelector(".journalId").value.trim();
    if (!id) throw new Error("手账 ID 不能为空。");
    nextJournals[id] = {
      title: row.querySelector(".journalTitle").value.trim(),
      body: row.querySelector(".journalBody").value.trim(),
    };
    if (oldId !== id) {
      updateArchiveRefs("journals", oldId, id);
      if (state.base?.JOURNALS?.[oldId]) state.deleted.journals.add(oldId);
      state.deleted.journals.delete(id);
    }
  });
  state.draft.journals = nextJournals;
}

function ensureEffects(target) {
  if (!target.effects) target.effects = {};
  return target.effects;
}

function addEffectValue(target, key, value) {
  if (!value) return;
  const effects = ensureEffects(target);
  if (!Array.isArray(effects[key])) effects[key] = [];
  if (!effects[key].includes(value)) effects[key].push(value);
}

function removeClueAcquisition(ids) {
  Object.values(state.draft.scenes).forEach((scene) => {
    removeEffectValues(scene.effects, "clues", ids);
    (scene.choices || []).forEach((choice) => removeEffectValues(choice.effects, "clues", ids));
  });
}

function removeEffectValues(effects, key, ids) {
  if (!effects?.[key]) return;
  effects[key] = effects[key].filter((value) => !ids.has(String(value)) && !ids.has(value));
  if (!effects[key].length) delete effects[key];
}

function applyClueTiming(id, sceneTiming, choiceTiming) {
  parseCsv(sceneTiming).forEach((sceneId) => {
    const scene = state.draft.scenes[sceneId];
    if (scene) addEffectValue(scene, "clues", id);
  });
  parseCsv(choiceTiming).forEach((ref) => {
    const [sceneId, rawIndex] = ref.split("#");
    const index = Number(rawIndex) - 1;
    const choice = state.draft.scenes[sceneId]?.choices?.[index];
    if (choice) addEffectValue(choice, "clues", id);
  });
}

function updateArchiveRefs(key, oldId, newId) {
  Object.values(state.draft.scenes).forEach((scene) => {
    replaceEffectValue(scene.effects, key, oldId, newId);
    (scene.choices || []).forEach((choice) => replaceEffectValue(choice.effects, key, oldId, newId));
  });
  (state.draft.finalGate.conditions || []).forEach((condition) => {
    if (condition.type === key.slice(0, -1) && String(condition.id) === oldId) condition.id = newId;
  });
}

function removeArchiveRefs(key, id) {
  Object.values(state.draft.scenes).forEach((scene) => {
    removeEffectValues(scene.effects, key, new Set([id]));
    (scene.choices || []).forEach((choice) => removeEffectValues(choice.effects, key, new Set([id])));
  });
  state.draft.finalGate.conditions = (state.draft.finalGate.conditions || []).filter((condition) => !(condition.type === key.slice(0, -1) && String(condition.id) === id));
}

function replaceEffectValue(effects, key, oldId, newId) {
  if (!effects?.[key]) return;
  effects[key] = effects[key].map((value) => (String(value) === oldId ? newId : value));
}

function renderMedia() {
  $("audioAmbience").value = state.draft.audio?.ambience || "";
  $("audioPage").value = state.draft.audio?.page || "";
  $("audioChime").value = state.draft.audio?.chime || "";
  const query = $("mediaSearch")?.value.trim().toLowerCase() || "";
  const filter = $("mediaTypeFilter")?.value || "all";
  const files = state.media.filter((file) => {
    const haystack = `${file.name} ${file.url} ${file.type}`.toLowerCase();
    return (!query || haystack.includes(query)) && (filter === "all" || file.kind === filter);
  });
  const selected = state.media.find((file) => file.name === state.selectedMediaName) || files[0];
  state.selectedMediaName = selected?.name || "";
  renderMediaPreview(selected);
  $("mediaLibrary").innerHTML = files.length ? files.map((file) => {
    const thumb = file.kind === "audio"
      ? `<span class="mediaAudioIcon">♪</span>`
      : `<img class="mediaThumb" src="${escapeAttr(file.url)}" alt="" loading="lazy" />`;
    return `
      <div class="mediaRow ${file.name === state.selectedMediaName ? "active" : ""}">
        ${thumb}
        <div>
          <strong>${escapeHtml(file.name)}</strong>
          <div class="mediaMeta">${escapeHtml(formatBytes(file.size))} · ${escapeHtml(file.kind === "audio" ? "音频" : "图片")}</div>
        </div>
        <code>${escapeHtml(file.url)}</code>
        <div class="mediaActions">
          <button type="button" class="mini previewMedia" data-name="${escapeAttr(file.name)}">预览</button>
          <button type="button" class="mini copyMedia" data-url="${escapeAttr(file.url)}">复制路径</button>
          <button type="button" class="mini renameMedia" data-name="${escapeAttr(file.name)}">重命名</button>
          <button type="button" class="mini replaceMedia" data-name="${escapeAttr(file.name)}">替换</button>
          <button type="button" class="mini danger deleteMedia" data-name="${escapeAttr(file.name)}">删除</button>
        </div>
      </div>
    `;
  }).join("") : `<div class="archiveSummary">没有匹配的服务器媒体</div>`;
  $("assetEditor").innerHTML = Object.entries(state.draft.assets || {}).map(([key, value]) => `
    <div class="assetRow">
      <input class="input assetKey" value="${escapeAttr(key)}" />
      <input class="input assetValue" value="${escapeAttr(value)}" />
      <button type="button" class="mini danger removeAsset">删除</button>
    </div>
  `).join("");
  document.querySelectorAll(".removeAsset").forEach((button) => button.addEventListener("click", () => {
    button.closest(".assetRow").remove();
    readMediaForm();
    markDirty();
  }));
  document.querySelectorAll(".previewMedia").forEach((button) => button.addEventListener("click", () => {
    state.selectedMediaName = button.dataset.name;
    renderMedia();
  }));
  document.querySelectorAll(".copyMedia").forEach((button) => button.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(button.dataset.url).catch(() => {});
    setStatus(`已复制 ${button.dataset.url}`, "ok");
  }));
  document.querySelectorAll(".renameMedia").forEach((button) => button.addEventListener("click", () => renameMedia(button.dataset.name).catch((error) => setStatus(error.message, "bad"))));
  document.querySelectorAll(".replaceMedia").forEach((button) => button.addEventListener("click", () => {
    state.replacingMediaName = button.dataset.name;
    $("replaceMediaFile").value = "";
    $("replaceMediaFile").click();
  }));
  document.querySelectorAll(".deleteMedia").forEach((button) => button.addEventListener("click", () => deleteMedia(button.dataset.name)));
}

function renderMediaPreview(file) {
  if (!file) {
    $("mediaPreview").innerHTML = `<div class="archiveSummary">暂无可预览媒体</div>`;
    return;
  }
  const preview = file.kind === "audio"
    ? `<audio src="${escapeAttr(file.url)}" controls preload="metadata"></audio>`
    : `<img src="${escapeAttr(file.url)}" alt="" />`;
  $("mediaPreview").innerHTML = `
    <div class="mediaPreviewCard">
      ${preview}
      <div>
        <strong>${escapeHtml(file.name)}</strong>
        <p class="mediaMeta">${escapeHtml(file.url)}<br>${escapeHtml(file.type)} · ${escapeHtml(formatBytes(file.size))} · ${escapeHtml(new Date(file.updatedAt).toLocaleString())}</p>
      </div>
    </div>
  `;
}

function formatBytes(size = 0) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function readMediaForm() {
  if (!state.draft) return;
  state.draft.audio = {
    ambience: $("audioAmbience").value.trim(),
    page: $("audioPage").value.trim(),
    chime: $("audioChime").value.trim(),
  };
  const assets = {};
  document.querySelectorAll(".assetRow").forEach((row) => {
    const key = row.querySelector(".assetKey").value.trim();
    const value = row.querySelector(".assetValue").value.trim();
    if (key) assets[key] = value;
  });
  state.draft.assets = assets;
}

function addAsset() {
  readMediaForm();
  let key = "newAsset";
  let index = 1;
  while (state.draft.assets[key]) key = `newAsset${++index}`;
  state.draft.assets[key] = "";
  markDirty();
  renderMedia();
}

async function uploadMedia() {
  const input = $("mediaFile");
  if (!input.files?.[0]) {
    setStatus("请先选择文件", "bad");
    return;
  }
  const form = new FormData();
  form.append("file", input.files[0]);
  const response = await fetch("/api/media/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error((await response.json()).error || "上传失败");
  const data = await response.json();
  state.media = (await fetchJson("/api/media/list")).files || [];
  input.value = "";
  setStatus(`已上传 ${data.file.url}`, "ok");
  renderMedia();
}

async function refreshMedia() {
  state.media = (await fetchJson("/api/media/list")).files || [];
  renderMedia();
  setStatus("已刷新服务器媒体库", "ok");
}

async function renameMedia(name) {
  const nextName = window.prompt("新的文件名，可以保留或修改扩展名", name);
  if (!nextName || nextName === name) return;
  const result = await fetchJson(`/api/media/file/${encodeURIComponent(name)}`, {
    method: "PATCH",
    body: JSON.stringify({ name: nextName }),
  });
  state.media = (await fetchJson("/api/media/list")).files || [];
  state.selectedMediaName = result.file?.name || "";
  renderMedia();
  setStatus(`已重命名为 ${result.file?.name || nextName}`, "ok");
}

async function replaceMedia() {
  const input = $("replaceMediaFile");
  const file = input.files?.[0];
  const name = state.replacingMediaName;
  if (!file || !name) return;
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`/api/media/file/${encodeURIComponent(name)}`, { method: "PUT", body: form });
  if (!response.ok) throw new Error((await response.json()).error || "替换失败");
  state.media = (await fetchJson("/api/media/list")).files || [];
  state.selectedMediaName = name;
  state.replacingMediaName = "";
  input.value = "";
  renderMedia();
  setStatus(`已替换 ${name}`, "ok");
}

async function deleteMedia(name) {
  if (!window.confirm(`删除媒体 ${name}？`)) return;
  await fetchJson(`/api/media/file/${encodeURIComponent(name)}`, { method: "DELETE" });
  state.media = (await fetchJson("/api/media/list")).files || [];
  if (state.selectedMediaName === name) state.selectedMediaName = "";
  renderMedia();
}

function renderFinal() {
  const gate = state.draft.finalGate || {};
  $("finalGateEnabled").checked = Boolean(gate.enabled);
  $("finalChoiceLabel").value = gate.choiceLabel || "";
  $("finalMissingScene").value = gate.missingScene || "";
  $("finalConditions").innerHTML = (gate.conditions || []).map((condition) => `
    <div class="conditionRow">
      <div class="grid3">
        <label>类型<select class="input conditionType">${CONDITION_TYPES.map((type) => `<option value="${type}" ${condition.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
        <label>ID<input class="input conditionId" value="${escapeAttr(condition.id ?? "")}" /></label>
        <label>失败提示<input class="input conditionLabel" value="${escapeAttr(condition.label || "")}" /></label>
      </div>
      <button type="button" class="mini danger removeCondition">删除条件</button>
    </div>
  `).join("");
  document.querySelectorAll(".removeCondition").forEach((button) => button.addEventListener("click", () => {
    button.closest(".conditionRow").remove();
    readFinalForm();
    markDirty();
  }));
}

function readFinalForm() {
  if (!state.draft) return;
  state.draft.finalGate = {
    enabled: $("finalGateEnabled").checked,
    choiceLabel: $("finalChoiceLabel").value.trim(),
    missingScene: $("finalMissingScene").value.trim(),
    conditions: Array.from(document.querySelectorAll(".conditionRow")).map((row) => ({
      type: row.querySelector(".conditionType").value,
      id: row.querySelector(".conditionId").value.trim(),
      label: row.querySelector(".conditionLabel").value.trim(),
    })).filter((condition) => condition.type && condition.id),
  };
}

function addCondition() {
  readFinalForm();
  state.draft.finalGate.conditions.push({ type: "clue", id: "final", label: "最终方案线索" });
  markDirty();
  renderFinal();
}

function updateRawJson() {
  if (!state.draft) return;
  $("rawJson").value = JSON.stringify(makePayload(), null, 2);
}

function applyRawJson() {
  try {
    const parsed = parseJsonField($("rawJson").value, {}, "JSON");
    state.overrides = parsed;
    state.draft = composeDraft(state.base, parsed);
    if (!state.draft.scenes[state.selectedSceneId]) state.selectedSceneId = Object.keys(state.draft.scenes)[0] || "";
    markDirty();
    renderAll();
  } catch (error) {
    setStatus(error.message, "bad");
  }
}

async function resetOverrides() {
  if (!window.confirm("清空当前故事的后台覆盖后，它会回到代码内置底稿。确定继续？")) return;
  await fetchJson(storyApi("overrides"), { method: "DELETE" });
  await loadAll();
  setStatus("已清空后台覆盖", "ok");
}

async function switchStory(storyId) {
  if (storyId === state.activeStoryId) return;
  if (state.dirty && !window.confirm("当前故事有未保存修改，切换后会丢失这些修改。继续切换？")) {
    renderStoryManager();
    return;
  }
  state.activeStoryId = storyId;
  state.selectedSceneId = "intro";
  localStorage.setItem(EDITOR_STORY_KEY, storyId);
  await loadAll();
}

async function createNewStory() {
  const title = window.prompt("新故事标题", "新的告白怪谈");
  if (!title) return;
  const defaultPath = `/${title.trim().replace(/\s+/g, "-").slice(0, 24) || `story-${Date.now()}`}`;
  const pathValue = window.prompt("访问后缀，例如 /new-story 或 /月下旧街", defaultPath);
  if (!pathValue) return;
  collectCurrentForms();
  const response = await fetchJson("/api/editor/stories", {
    method: "POST",
    body: JSON.stringify({
      title: title.trim(),
      path: normalizeStoryPathInput(pathValue, defaultPath),
      published: true,
    }),
  });
  state.activeStoryId = response.story.id;
  localStorage.setItem(EDITOR_STORY_KEY, state.activeStoryId);
  state.dirty = false;
  await loadAll();
  setStatus(`已新建故事：${response.story.title}`, "ok");
}

async function deleteCurrentStory() {
  if (state.activeStoryId === "yuelanshan") {
    setStatus("默认故事不能删除。", "bad");
    return;
  }
  const story = currentStoryMeta();
  if (!window.confirm(`删除故事「${story?.title || state.activeStoryId}」及它的后台配置？媒体文件不会被删除。`)) return;
  await fetchJson(`/api/editor/stories/${encodeURIComponent(state.activeStoryId)}`, { method: "DELETE" });
  localStorage.removeItem(EDITOR_STORY_KEY);
  state.activeStoryId = "yuelanshan";
  state.dirty = false;
  await loadAll();
  setStatus("已删除故事", "ok");
}

async function logout() {
  await fetchJson("/api/auth/logout", { method: "POST" });
  window.location.replace("/月兰山");
}

function bindEvents() {
  $("storySelect").addEventListener("change", (event) => switchStory(event.target.value).catch((error) => setStatus(error.message, "bad")));
  $("storyPublishedToggle").addEventListener("change", () => {
    $("storyPublished").checked = $("storyPublishedToggle").checked;
    readStoryForm();
    markDirty("发布状态已修改");
  });
  $("newStoryButton").addEventListener("click", () => createNewStory().catch((error) => setStatus(error.message, "bad")));
  $("deleteStoryButton").addEventListener("click", () => deleteCurrentStory().catch((error) => setStatus(error.message, "bad")));
  $("reloadButton").addEventListener("click", loadAll);
  $("saveButton").addEventListener("click", saveAll);
  $("logoutButton").addEventListener("click", logout);
  $("applyStoryButton").addEventListener("click", () => {
    readStoryForm();
    markDirty();
  });
  $("addSceneButton").addEventListener("click", addScene);
  $("applySceneButton").addEventListener("click", () => readSceneForm());
  $("deleteSceneButton").addEventListener("click", deleteSelectedScene);
  $("addChoiceButton").addEventListener("click", () => {
    readSceneForm({ silent: true });
    state.draft.scenes[state.selectedSceneId].choices.push({ label: "新选项", next: state.selectedSceneId });
    markDirty();
    renderChoicesEditor();
    renderFlow();
  });
  $("sceneSearch").addEventListener("input", renderSceneList);
  $("showOnlyReachable").addEventListener("change", renderFlow);
  $("fitFlowButton").addEventListener("click", () => {
    $("flowCanvas").scrollTo({ left: 0, top: 0, behavior: "smooth" });
  });
  $("linkModeButton").addEventListener("click", () => {
    state.linkMode = !state.linkMode;
    state.linkSource = "";
    $("linkModeButton").classList.toggle("active", state.linkMode);
    setStatus(state.linkMode ? "快速连线：先点起点，再点终点" : "已退出快速连线", state.linkMode ? "dirty" : "ok");
    renderFlow();
  });
  $("addAssetButton").addEventListener("click", addAsset);
  $("uploadMediaButton").addEventListener("click", () => uploadMedia().catch((error) => setStatus(error.message, "bad")));
  $("refreshMediaButton").addEventListener("click", () => refreshMedia().catch((error) => setStatus(error.message, "bad")));
  $("mediaSearch").addEventListener("input", renderMedia);
  $("mediaTypeFilter").addEventListener("change", renderMedia);
  $("replaceMediaFile").addEventListener("change", () => replaceMedia().catch((error) => setStatus(error.message, "bad")));
  $("addConditionButton").addEventListener("click", addCondition);
  $("applyRawButton").addEventListener("click", applyRawJson);
  $("resetOverridesButton").addEventListener("click", () => resetOverrides().catch((error) => setStatus(error.message, "bad")));
  ["audioAmbience", "audioPage", "audioChime", "storyPublished", "finalGateEnabled", "finalChoiceLabel", "finalMissingScene"].forEach((id) => {
    $(id).addEventListener("change", () => {
      if (id === "storyPublished") $("storyPublishedToggle").checked = $("storyPublished").checked;
      readStoryForm();
      readMediaForm();
      readFinalForm();
      markDirty();
    });
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      collectCurrentForms();
      document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === tab));
      document.querySelectorAll(".tabPane").forEach((pane) => pane.classList.toggle("active", pane.id === `tab-${tab.dataset.tab}`));
      if (tab.dataset.tab === "raw") updateRawJson();
    });
  });
  $("editRulesButton").addEventListener("click", () => {
    readArchiveForm({ silent: true });
    state.activeArchive = "rules";
    renderArchive();
  });
  $("editCluesButton").addEventListener("click", () => {
    readArchiveForm({ silent: true });
    state.activeArchive = "clues";
    renderArchive();
  });
  $("editJournalsButton").addEventListener("click", () => {
    readArchiveForm({ silent: true });
    state.activeArchive = "journals";
    renderArchive();
  });
  bindFlowCanvas();
}

bindEvents();
loadAll().catch((error) => setStatus(error.message, "bad"));
