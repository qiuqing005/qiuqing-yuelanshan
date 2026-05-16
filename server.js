const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const zlib = require("node:zlib");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const UPLOADS_DIR = path.join(ROOT, "uploads");
const OVERRIDES_FILE = path.join(DATA_DIR, "overrides.json");
const STORIES_DIR = path.join(DATA_DIR, "stories");
const STORIES_INDEX_FILE = path.join(DATA_DIR, "stories.json");
const SECRET_FILE = path.join(DATA_DIR, "session-secret");
const PORT = Number(process.env.PORT || 80);
const DEFAULT_STORY_ID = "yuelanshan";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || "";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const SESSION_COOKIE = "qy_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".svg": "image/svg+xml",
};

const ALLOWED_UPLOAD_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp3", ".ogg", ".wav", ".m4a", ".aac", ".flac"]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendMaybeGzip(req, res, status, body, headers = {}) {
  const acceptsGzip = /\bgzip\b/i.test(req.headers["accept-encoding"] || "");
  if (!acceptsGzip || Buffer.byteLength(body) < 1024) {
    send(res, status, body, headers);
    return;
  }
  const compressed = zlib.gzipSync(body);
  send(res, status, compressed, {
    ...headers,
    "Content-Encoding": "gzip",
    "Content-Length": compressed.length,
    Vary: "Accept-Encoding",
  });
}

function noStoreHeaders(contentType) {
  return {
    "Content-Type": contentType,
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

function sendJson(res, status, data, extraHeaders = {}) {
  send(res, status, JSON.stringify(data, null, 2), {
    ...noStoreHeaders("application/json; charset=utf-8"),
    ...extraHeaders,
  });
}

async function readJsonFile(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJsonFile(file, data) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fsp.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await fsp.rename(tmp, file);
}

function cleanStoryId(value, fallback = DEFAULT_STORY_ID) {
  const text = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return text || fallback;
}

function normalizeStoryPath(value, fallback = `/${DEFAULT_STORY_ID}`) {
  let text = String(value || "").trim();
  try {
    text = decodeURIComponent(text);
  } catch {
    // Keep the original text if it is not URI encoded.
  }
  text = text.split(/[?#]/)[0].trim();
  if (!text) text = fallback;
  if (!text.startsWith("/")) text = `/${text}`;
  text = text.replace(/\/+/g, "/");
  if (text.length > 1) text = text.replace(/\/+$/g, "");
  return text || fallback;
}

function assertStoryPath(pathname) {
  const pathValue = normalizeStoryPath(pathname);
  const forbidden = new Set(["/", "/月兰山", "/admin.html", "/admin-login.html", "/index.html", "/landing.html"]);
  if (forbidden.has(pathValue) || pathValue.startsWith("/api/") || pathValue.startsWith("/assets/") || pathValue.startsWith("/uploads/")) {
    throw new Error("这个访问后缀会和系统路径冲突，请换一个。");
  }
  return pathValue;
}

function storyFilePath(storyId) {
  return path.join(STORIES_DIR, `${cleanStoryId(storyId)}.json`);
}

function isBlankStoryTemplate(value = {}) {
  return value.template === "blank" || value.blank === true || value.story?.template === "blank";
}

function blankStoryPayload({ id, title, path: pathname, subtitle, intro, entryLabel, cover, published, now }) {
  return {
    template: "blank",
    createdAt: now,
    updatedAt: now,
    story: {
      id,
      title,
      subtitle: subtitle || "\u65b0\u7684\u544a\u767d\u602a\u8c08\u6545\u4e8b\u3002",
      intro: intro || "\u5728\u8fd9\u91cc\u5199\u4e0b\u6545\u4e8b\u7b80\u4ecb\u3002",
      entryLabel: entryLabel || "\u8fdb\u5165\u6545\u4e8b",
      cover: cover || "",
      path: pathname,
      published: published !== false,
      template: "blank",
    },
    assets: {},
    trueRules: [],
    fragments: {},
    clues: {},
    journals: {},
    scenes: {
      intro: {
        name: "\u65b0\u7684\u5f00\u573a",
        chapter: "\u65b0\u7ae0",
        code: "00",
        speaker: "\u65c1\u767d",
        persona: "none",
        bg: "",
        portrait: "",
        text: ["\u5728\u8fd9\u91cc\u5199\u4e0b\u65b0\u6545\u4e8b\u7684\u7b2c\u4e00\u6bb5\u3002"],
        choices: [],
      },
    },
    sceneExpansions: {},
    audio: {},
    statusCatalog: [],
    itemCatalog: [],
    editorLayout: { positions: { intro: { x: 60, y: 60 } } },
    finalGate: { enabled: false, choiceLabel: "", missingScene: "", conditions: [] },
  };
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readRequestBuffer(req, maxBytes = 16 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Request body too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function readBody(req) {
  return (await readRequestBuffer(req, 8 * 1024 * 1024)).toString("utf8");
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function hmac(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

async function getSessionSecret() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    return (await fsp.readFile(SECRET_FILE, "utf8")).trim();
  } catch {
    const secret = crypto.randomBytes(48).toString("base64url");
    await fsp.writeFile(SECRET_FILE, secret, { encoding: "utf8", mode: 0o600 });
    return secret;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return Object.fromEntries(header.split(";").map((part) => {
    const index = part.indexOf("=");
    if (index < 0) return ["", ""];
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

async function createSessionCookie(username) {
  const secret = await getSessionSecret();
  const payload = base64url(JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_MS }));
  const sig = hmac(payload, secret);
  return `${SESSION_COOKIE}=${encodeURIComponent(`${payload}.${sig}`)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

async function isAuthenticated(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const secret = await getSessionSecret();
  const expected = hmac(payload, secret);
  const actualBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.u === ADMIN_USERNAME && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function verifyPassword(username, password) {
  if (username !== ADMIN_USERNAME || typeof password !== "string") return false;
  if (!ADMIN_PASSWORD_HASH) return password === ADMIN_PASSWORD;
  const actual = crypto.scryptSync(password, ADMIN_PASSWORD_SALT, 64);
  const expected = Buffer.from(ADMIN_PASSWORD_HASH, "base64url");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

let baseGameDataCache = null;
let baseGameDataJsonCache = "";

function getBaseGameData() {
  if (baseGameDataCache) return baseGameDataCache;
  const source = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const cut = source.indexOf("let EDITOR_CONFIG");
  if (cut < 0) throw new Error("Unable to locate editor config boundary in app.js.");
  const partial = source.slice(0, cut);
  const script = `${partial}
globalThis.__QY_BASE__ = {
  ASSETS,
  TRUE_RULES,
  FRAGMENTS,
  CLUES,
  JOURNALS,
  SCENES,
  SCENE_EXPANSIONS,
  DEFAULT_EDITOR_CONFIG
};`;
  const context = vm.createContext({ console });
  vm.runInContext(script, context, { timeout: 1000 });
  baseGameDataCache = context.__QY_BASE__;
  return baseGameDataCache;
}

function getBaseGameDataJson() {
  if (!baseGameDataJsonCache) baseGameDataJsonCache = JSON.stringify(getBaseGameData(), null, 2);
  return baseGameDataJsonCache;
}

function storySummaryFromOverrides(storyId, overrides = {}, base = getBaseGameData(), fallback = {}) {
  const blankTemplate = isBlankStoryTemplate(overrides) || isBlankStoryTemplate(fallback);
  const baseStory = blankTemplate ? {} : base.DEFAULT_EDITOR_CONFIG?.story || {};
  const story = {
    ...baseStory,
    ...fallback,
    ...(overrides.story || {}),
  };
  const id = cleanStoryId(story.id || storyId);
  const cover = story.cover !== undefined
    ? story.cover
    : fallback.cover !== undefined
      ? fallback.cover
      : blankTemplate
        ? ""
        : baseStory.cover || "./assets/images/bg-festival-road.png";
  return {
    id,
    title: story.title || fallback.title || "未命名故事",
    subtitle: story.subtitle || fallback.subtitle || "",
    intro: story.intro || fallback.intro || "",
    entryLabel: story.entryLabel || fallback.entryLabel || "进入故事",
    path: normalizeStoryPath(story.path || fallback.path || `/${id}`),
    cover,
    published: story.published !== false,
    template: blankTemplate ? "blank" : undefined,
    createdAt: fallback.createdAt || overrides.createdAt || new Date().toISOString(),
    updatedAt: overrides.updatedAt || fallback.updatedAt || new Date().toISOString(),
  };
}

async function readStoryOverrides(storyId = DEFAULT_STORY_ID) {
  const id = cleanStoryId(storyId);
  const file = storyFilePath(id);
  const storyData = await readJsonFile(file, null);
  if (storyData) return storyData;
  if (id === DEFAULT_STORY_ID) return readJsonFile(OVERRIDES_FILE, {});
  return {};
}

async function readStoryIndex() {
  const base = getBaseGameData();
  const index = await readJsonFile(STORIES_INDEX_FILE, null);
  if (index && Array.isArray(index.stories)) {
    const seen = new Set();
    const stories = index.stories
      .map((story) => storySummaryFromOverrides(story.id, { story }, base, story))
      .filter((story) => {
        if (seen.has(story.id)) return false;
        seen.add(story.id);
        return true;
      });
    if (!stories.some((story) => story.id === DEFAULT_STORY_ID)) {
      stories.unshift(storySummaryFromOverrides(DEFAULT_STORY_ID, await readStoryOverrides(DEFAULT_STORY_ID), base));
    }
    return { activeId: cleanStoryId(index.activeId || DEFAULT_STORY_ID), stories };
  }

  const legacyOverrides = await readStoryOverrides(DEFAULT_STORY_ID);
  return {
    activeId: DEFAULT_STORY_ID,
    stories: [storySummaryFromOverrides(DEFAULT_STORY_ID, legacyOverrides, base, { id: DEFAULT_STORY_ID, path: "/yuelanshan" })],
  };
}

async function writeStoryIndex(index) {
  const paths = new Set();
  const stories = index.stories.map((story) => {
    const id = cleanStoryId(story.id);
    const pathname = assertStoryPath(story.path || `/${id}`);
    if (paths.has(pathname)) throw new Error(`访问后缀重复：${pathname}`);
    paths.add(pathname);
    return { ...story, id, path: pathname };
  });
  await writeJsonFile(STORIES_INDEX_FILE, { activeId: cleanStoryId(index.activeId || stories[0]?.id || DEFAULT_STORY_ID), stories });
}

async function upsertStorySummary(storyId, overrides) {
  const base = getBaseGameData();
  const index = await readStoryIndex();
  const id = cleanStoryId(storyId);
  const previous = index.stories.find((story) => story.id === id) || {};
  const summary = storySummaryFromOverrides(id, overrides, base, previous);
  const nextStories = index.stories.filter((story) => story.id !== id);
  nextStories.push(summary);
  await writeStoryIndex({ ...index, activeId: index.activeId || id, stories: nextStories });
  return summary;
}

async function writeStoryOverrides(storyId, data) {
  const id = cleanStoryId(storyId);
  const payload = { ...data, updatedAt: new Date().toISOString() };
  payload.story = {
    ...(payload.story || {}),
    id,
    path: assertStoryPath(payload.story?.path || `/${id}`),
  };
  await fsp.mkdir(STORIES_DIR, { recursive: true });
  await writeJsonFile(storyFilePath(id), payload);
  if (id === DEFAULT_STORY_ID) await writeJsonFile(OVERRIDES_FILE, payload);
  const story = await upsertStorySummary(id, payload);
  return { payload, story };
}

async function storyByPath(pathname) {
  const normalized = normalizeStoryPath(pathname);
  const index = await readStoryIndex();
  return index.stories.find((story) => story.published !== false && normalizeStoryPath(story.path) === normalized);
}

async function storyFromRequest(url) {
  const id = url.searchParams.get("id");
  if (id) {
    const index = await readStoryIndex();
    return index.stories.find((story) => story.id === cleanStoryId(id));
  }
  const requestedPath = url.searchParams.get("path") || url.pathname;
  return storyByPath(requestedPath);
}

function staticHeaders(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const noCache = new Set([
    ".html",
    ".js",
    ".css",
    ".json",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".mp3",
    ".ogg",
    ".wav",
    ".m4a",
    ".aac",
    ".flac",
  ]).has(ext);
  return {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": noCache ? "no-store, no-cache, must-revalidate, proxy-revalidate" : "public, max-age=604800",
    Pragma: noCache ? "no-cache" : undefined,
    Expires: noCache ? "0" : undefined,
  };
}

function streamFile(res, filePath) {
  const headers = Object.fromEntries(Object.entries(staticHeaders(filePath)).filter(([, value]) => value !== undefined));
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

async function serveStatic(req, res, pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/月兰山" || decoded === "/月兰山/") {
    streamFile(res, path.join(ROOT, await isAuthenticated(req) ? "admin.html" : "admin-login.html"));
    return;
  }

  let relative = decoded === "/" ? "landing.html" : decoded.slice(1);
  if (decoded === "/yuelanshan" || decoded === "/yuelanshan/") relative = "index.html";
  if (decoded.startsWith("/uploads/")) {
    const uploadPath = path.resolve(UPLOADS_DIR, decoded.slice("/uploads/".length));
    if (!isInside(UPLOADS_DIR, uploadPath) || !fs.existsSync(uploadPath) || fs.statSync(uploadPath).isDirectory()) {
      send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    streamFile(res, uploadPath);
    return;
  }

  const filePath = path.resolve(ROOT, relative);
  if (!isInside(ROOT, filePath) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const story = await storyByPath(decoded);
    if (story) {
      streamFile(res, path.join(ROOT, "index.html"));
      return;
    }
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  streamFile(res, filePath);
}

async function publicStory(url) {
  const index = await readStoryIndex();
  const requested = await storyFromRequest(url);
  const story = requested || index.stories.find((item) => item.id === index.activeId) || index.stories[0];
  return story;
}

async function handleAuth(req, res, pathname) {
  if (pathname === "/api/auth/session" && req.method === "GET") {
    sendJson(res, 200, { authenticated: await isAuthenticated(req) });
    return true;
  }

  if (pathname === "/api/auth/login" && req.method === "POST") {
    const body = await readBody(req);
    const data = body.trim() ? JSON.parse(body) : {};
    if (!verifyPassword(String(data.username || ""), String(data.password || ""))) {
      sendJson(res, 401, { error: "用户名或密码不正确。" });
      return true;
    }
    sendJson(res, 200, { ok: true }, { "Set-Cookie": await createSessionCookie(data.username) });
    return true;
  }

  if (pathname === "/api/auth/logout" && req.method === "POST") {
    sendJson(res, 200, { ok: true }, { "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0` });
    return true;
  }

  return false;
}

async function handlePublic(req, res, url) {
  const pathname = url.pathname;
  if (pathname === "/api/public/story" && req.method === "GET") {
    sendJson(res, 200, await publicStory(url));
    return true;
  }
  if (pathname === "/api/public/stories" && req.method === "GET") {
    const index = await readStoryIndex();
    sendJson(res, 200, { activeId: index.activeId, stories: index.stories.filter((story) => story.published !== false) });
    return true;
  }
  if (pathname === "/api/public/overrides" && req.method === "GET") {
    const story = await storyFromRequest(url);
    const id = story?.id || DEFAULT_STORY_ID;
    sendJson(res, 200, await readStoryOverrides(id));
    return true;
  }
  return false;
}

function storyEndpointParts(pathname, prefix) {
  const rest = pathname.slice(prefix.length).replace(/^\/+/, "");
  return rest.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
}

async function createStory(data) {
  const index = await readStoryIndex();
  const title = String(data.title || "新故事").trim() || "新故事";
  let id = cleanStoryId(data.id || title.replace(/[^\w-]+/g, "-") || `story-${Date.now()}`, `story-${Date.now()}`);
  let suffix = 1;
  while (index.stories.some((story) => story.id === id)) id = `${id}-${++suffix}`;
  const pathname = assertStoryPath(data.path || `/${id}`);
  if (index.stories.some((story) => normalizeStoryPath(story.path) === pathname)) throw new Error(`访问后缀重复：${pathname}`);

  const now = new Date().toISOString();
  const sourceId = typeof data.copyFrom === "string" && data.copyFrom.trim()
    ? cleanStoryId(data.copyFrom)
    : "";
  const sourceOverrides = sourceId ? await readStoryOverrides(sourceId) : null;
  const overrides = sourceOverrides
    ? cloneForJson(sourceOverrides)
    : blankStoryPayload({
      id,
      title,
      path: pathname,
      subtitle: data.subtitle,
      intro: data.intro,
      entryLabel: data.entryLabel,
      cover: data.cover,
      published: data.published,
      now,
    });
  overrides.createdAt = now;
  overrides.updatedAt = now;
  overrides.story = {
    ...(overrides.story || {}),
    id,
    title,
    subtitle: data.subtitle || overrides.story?.subtitle || "新的告白怪谈故事。",
    intro: data.intro || overrides.story?.intro || "在这里写下故事简介。",
    entryLabel: data.entryLabel || overrides.story?.entryLabel || "进入故事",
    cover: data.cover !== undefined ? data.cover : overrides.story?.cover || "",
    path: pathname,
    published: data.published !== false,
    template: overrides.template === "blank" ? "blank" : overrides.story?.template,
  };
  await fsp.mkdir(STORIES_DIR, { recursive: true });
  await writeJsonFile(storyFilePath(id), overrides);
  const story = storySummaryFromOverrides(id, overrides, getBaseGameData());
  await writeStoryIndex({ ...index, stories: [...index.stories, story] });
  return story;
}

function cloneForJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

async function deleteStory(storyId) {
  const id = cleanStoryId(storyId);
  if (id === DEFAULT_STORY_ID) throw new Error("默认故事不能删除。");
  const index = await readStoryIndex();
  const nextStories = index.stories.filter((story) => story.id !== id);
  if (nextStories.length === index.stories.length) throw new Error("故事不存在。");
  await fsp.rm(storyFilePath(id), { force: true });
  await writeStoryIndex({ activeId: index.activeId === id ? DEFAULT_STORY_ID : index.activeId, stories: nextStories });
}

async function handleEditorApi(req, res, pathname) {
  if (!(await isAuthenticated(req))) {
    sendJson(res, 401, { error: "需要登录后台。" });
    return;
  }

  if (pathname === "/api/editor/base" && req.method === "GET") {
    sendMaybeGzip(req, res, 200, getBaseGameDataJson(), noStoreHeaders("application/json; charset=utf-8"));
    return;
  }

  if (pathname === "/api/editor/stories" && req.method === "GET") {
    sendJson(res, 200, await readStoryIndex());
    return;
  }

  if (pathname === "/api/editor/stories" && req.method === "POST") {
    const body = await readBody(req);
    const story = await createStory(body.trim() ? JSON.parse(body) : {});
    sendJson(res, 200, { ok: true, story });
    return;
  }

  if (pathname.startsWith("/api/editor/stories/")) {
    const [storyId, action] = storyEndpointParts(pathname, "/api/editor/stories/");
    if (!storyId) {
      sendJson(res, 404, { error: "故事不存在。" });
      return;
    }
    if (!action && req.method === "DELETE") {
      await deleteStory(storyId);
      sendJson(res, 200, { ok: true });
      return;
    }
    if (action === "overrides" && req.method === "GET") {
      sendJson(res, 200, await readStoryOverrides(storyId));
      return;
    }
    if (action === "overrides" && req.method === "PUT") {
      const body = await readBody(req);
      const data = body.trim() ? JSON.parse(body) : {};
      const result = await writeStoryOverrides(storyId, data);
      sendJson(res, 200, { ok: true, updatedAt: result.payload.updatedAt, story: result.story });
      return;
    }
    if (action === "overrides" && req.method === "DELETE") {
      const current = await readStoryOverrides(storyId);
      const id = cleanStoryId(storyId);
      const currentStory = current.story || {};
      const empty = isBlankStoryTemplate(current)
        ? blankStoryPayload({
          id,
          title: currentStory.title || "新故事",
          path: currentStory.path || `/${id}`,
          subtitle: currentStory.subtitle,
          intro: currentStory.intro,
          entryLabel: currentStory.entryLabel,
          cover: currentStory.cover,
          published: currentStory.published,
          now: current.createdAt || new Date().toISOString(),
        })
        : { story: { id, path: `/${id}`, published: true } };
      const result = await writeStoryOverrides(storyId, empty);
      sendJson(res, 200, { ok: true, story: result.story });
      return;
    }
  }

  if (pathname === "/api/editor/overrides" && req.method === "GET") {
    sendJson(res, 200, await readStoryOverrides(DEFAULT_STORY_ID));
    return;
  }

  if (pathname === "/api/editor/overrides" && req.method === "PUT") {
    const body = await readBody(req);
    const data = body.trim() ? JSON.parse(body) : {};
    const result = await writeStoryOverrides(DEFAULT_STORY_ID, data);
    sendJson(res, 200, { ok: true, updatedAt: result.payload.updatedAt, story: result.story });
    return;
  }

  if (pathname === "/api/editor/overrides" && req.method === "DELETE") {
    await writeStoryOverrides(DEFAULT_STORY_ID, { story: { id: DEFAULT_STORY_ID, path: "/yuelanshan", published: true } });
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: "API not found" });
}

function safeFileName(name) {
  const ext = path.extname(name).toLowerCase();
  const stem = path.basename(name, ext).replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "media";
  return `${stem}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
}

function managedFileName(name, fallbackExt = "") {
  const ext = path.extname(name).toLowerCase() || fallbackExt;
  if (!ALLOWED_UPLOAD_EXT.has(ext)) throw new Error("只允许管理图片和音频文件。");
  const stem = path.basename(name, path.extname(name)).replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72) || "media";
  return `${stem}${ext}`;
}

function mediaFilePath(name) {
  const filePath = path.resolve(UPLOADS_DIR, name);
  if (!isInside(UPLOADS_DIR, filePath)) throw new Error("文件路径不合法。");
  return filePath;
}

function parseMultipart(buffer, boundary) {
  const marker = `--${boundary}`;
  const raw = buffer.toString("binary");
  return raw.split(marker).slice(1, -1).map((part) => {
    const clean = part.replace(/^\r\n/, "").replace(/\r\n$/, "");
    const splitAt = clean.indexOf("\r\n\r\n");
    if (splitAt < 0) return null;
    const headerText = clean.slice(0, splitAt);
    const bodyText = clean.slice(splitAt + 4);
    const disposition = /content-disposition:\s*form-data;([^\r\n]+)/i.exec(headerText)?.[1] || "";
    const name = /name="([^"]+)"/i.exec(disposition)?.[1] || "";
    const filename = /filename="([^"]*)"/i.exec(disposition)?.[1] || "";
    const contentType = /content-type:\s*([^\r\n]+)/i.exec(headerText)?.[1]?.trim() || "application/octet-stream";
    return { name, filename, contentType, data: Buffer.from(bodyText, "binary") };
  }).filter(Boolean);
}

async function listMedia() {
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
  const entries = await fsp.readdir(UPLOADS_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = path.join(UPLOADS_DIR, entry.name);
    const stat = await fsp.stat(filePath);
    files.push({
      name: entry.name,
      url: `/uploads/${entry.name}`,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
      type: MIME[path.extname(entry.name).toLowerCase()] || "application/octet-stream",
      kind: (MIME[path.extname(entry.name).toLowerCase()] || "").startsWith("audio/") ? "audio" : "image",
    });
  }
  return files.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function mediaInfo(name) {
  const filePath = mediaFilePath(name);
  const stat = await fsp.stat(filePath);
  const type = MIME[path.extname(name).toLowerCase()] || "application/octet-stream";
  return {
    name,
    url: `/uploads/${name}`,
    size: stat.size,
    updatedAt: stat.mtime.toISOString(),
    type,
    kind: type.startsWith("audio/") ? "audio" : "image",
  };
}

async function handleMediaApi(req, res, pathname) {
  if (!(await isAuthenticated(req))) {
    sendJson(res, 401, { error: "需要登录后台。" });
    return;
  }

  if (pathname === "/api/media/list" && req.method === "GET") {
    sendJson(res, 200, { files: await listMedia() });
    return;
  }

  if (pathname === "/api/media/upload" && req.method === "POST") {
    const match = /boundary=([^;]+)/i.exec(req.headers["content-type"] || "");
    if (!match) {
      sendJson(res, 400, { error: "上传请求缺少 boundary。" });
      return;
    }
    const parts = parseMultipart(await readRequestBuffer(req, 64 * 1024 * 1024), match[1]);
    const file = parts.find((part) => part.name === "file" && part.filename);
    if (!file) {
      sendJson(res, 400, { error: "没有找到上传文件。" });
      return;
    }
    const ext = path.extname(file.filename).toLowerCase();
    if (!ALLOWED_UPLOAD_EXT.has(ext)) {
      sendJson(res, 400, { error: "只允许上传图片和音频文件。" });
      return;
    }
    await fsp.mkdir(UPLOADS_DIR, { recursive: true });
    const name = safeFileName(file.filename);
    const filePath = path.join(UPLOADS_DIR, name);
    await fsp.writeFile(filePath, file.data);
    sendJson(res, 200, { ok: true, file: { name, url: `/uploads/${name}`, size: file.data.length, type: file.contentType } });
    return;
  }

  if (pathname.startsWith("/api/media/file/") && req.method === "DELETE") {
    const name = decodeURIComponent(pathname.slice("/api/media/file/".length));
    const filePath = mediaFilePath(name);
    await fsp.rm(filePath, { force: true });
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname.startsWith("/api/media/file/") && req.method === "PATCH") {
    const oldName = decodeURIComponent(pathname.slice("/api/media/file/".length));
    const oldPath = mediaFilePath(oldName);
    const body = await readBody(req);
    const data = body.trim() ? JSON.parse(body) : {};
    const newName = managedFileName(data.name || oldName, path.extname(oldName).toLowerCase());
    const newPath = mediaFilePath(newName);
    if (!fs.existsSync(oldPath)) {
      sendJson(res, 404, { error: "文件不存在。" });
      return;
    }
    if (oldName !== newName && fs.existsSync(newPath)) {
      sendJson(res, 409, { error: "同名文件已经存在。" });
      return;
    }
    await fsp.rename(oldPath, newPath);
    sendJson(res, 200, { ok: true, file: await mediaInfo(newName) });
    return;
  }

  if (pathname.startsWith("/api/media/file/") && req.method === "PUT") {
    const name = decodeURIComponent(pathname.slice("/api/media/file/".length));
    const filePath = mediaFilePath(name);
    if (!fs.existsSync(filePath)) {
      sendJson(res, 404, { error: "文件不存在。" });
      return;
    }
    const match = /boundary=([^;]+)/i.exec(req.headers["content-type"] || "");
    if (!match) {
      sendJson(res, 400, { error: "替换请求缺少 boundary。" });
      return;
    }
    const parts = parseMultipart(await readRequestBuffer(req, 64 * 1024 * 1024), match[1]);
    const file = parts.find((part) => part.name === "file" && part.filename);
    if (!file) {
      sendJson(res, 400, { error: "没有找到替换文件。" });
      return;
    }
    const oldExt = path.extname(name).toLowerCase();
    const newExt = path.extname(file.filename).toLowerCase();
    if (!ALLOWED_UPLOAD_EXT.has(newExt) || oldExt !== newExt) {
      sendJson(res, 400, { error: "替换文件必须保持相同扩展名。" });
      return;
    }
    await fsp.writeFile(filePath, file.data);
    sendJson(res, 200, { ok: true, file: await mediaInfo(name) });
    return;
  }

  sendJson(res, 404, { error: "Media API not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (await handleAuth(req, res, url.pathname)) return;
    if (await handlePublic(req, res, url)) return;
    if (url.pathname.startsWith("/api/editor/")) {
      await handleEditorApi(req, res, url.pathname);
      return;
    }
    if (url.pathname.startsWith("/api/media/")) {
      await handleMediaApi(req, res, url.pathname);
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`qiuqing-yuelanshan server listening on ${PORT}`);
});
