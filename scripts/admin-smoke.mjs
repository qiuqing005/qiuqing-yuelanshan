import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const baseUrl = process.argv[2] || "http://127.0.0.1:4180";
const outDir = path.resolve("output/playwright");
await fs.mkdir(outDir, { recursive: true });
const username = process.env.ADMIN_TEST_USERNAME || "admin";
const password = process.env.ADMIN_TEST_PASSWORD;

function signLocalCookie(secret) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + 60 * 60 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret.trim()).update(payload).digest("base64url");
  return `qy_admin=${payload}.${sig}`;
}

async function getCookie() {
  if (password) {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ username, password }),
    });
    if (!loginResponse.ok) throw new Error(`Admin login failed: ${loginResponse.status}`);
    const loginCookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
    if (!loginCookie) throw new Error("Admin login did not return a session cookie.");
    return loginCookie;
  }
  if (/^https?:\/\/(127\.0\.0\.1|localhost)/.test(baseUrl)) {
    await fetch(`${baseUrl}/api/auth/session`).catch(() => {});
    return signLocalCookie(await fs.readFile("data/session-secret", "utf8"));
  }
  throw new Error("ADMIN_TEST_PASSWORD is required for remote admin smoke.");
}

const cookie = await getCookie();

async function api(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    cache: "no-store",
    ...options,
    headers: { "Content-Type": "application/json; charset=utf-8", Cookie: cookie, ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`${pathname} returned ${response.status}`);
  return response.json();
}

async function authedFetch(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    cache: "no-store",
    ...options,
    headers: { Cookie: cookie, ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`${pathname} returned ${response.status}`);
  return response;
}

async function exerciseStoryApi() {
  const suffix = `admin-smoke-${Date.now()}`;
  let createdId = "";
  try {
    const created = await api("/api/editor/stories", {
      method: "POST",
      body: JSON.stringify({
        title: `后台烟测 ${suffix}`,
        subtitle: "后台 smoke 临时故事。",
        intro: "用于验证多故事新建、发布、删除和自定义访问后缀。",
        entryLabel: "进入烟测",
        path: `/${suffix}`,
        cover: "./assets/images/bg-festival-road.png",
      }),
    });
    createdId = created.story?.id || "";
    if (!createdId || created.story.path !== `/${suffix}`) throw new Error("Created story did not keep its custom path.");

    const publicResponse = await fetch(`${baseUrl}/api/public/story?path=/${suffix}`, { cache: "no-store" });
    if (!publicResponse.ok) throw new Error("Created story custom path was not publicly readable.");
    const publicStory = await publicResponse.json();
    if (publicStory.id !== createdId) throw new Error("Public story route returned the wrong story.");

    const overrides = await api(`/api/editor/stories/${encodeURIComponent(createdId)}/overrides`);
    if (overrides.template !== "blank" || overrides.story?.template !== "blank") {
      throw new Error("Created story did not use the blank template.");
    }
    if (Object.keys(overrides.assets || {}).length || (overrides.trueRules || []).length) {
      throw new Error("Created blank story inherited base assets or rules.");
    }
    if (Object.keys(overrides.clues || {}).length || Object.keys(overrides.journals || {}).length || Object.keys(overrides.fragments || {}).length) {
      throw new Error("Created blank story inherited archive data.");
    }
    const sceneIds = Object.keys(overrides.scenes || {});
    if (sceneIds.length !== 1 || sceneIds[0] !== "intro" || overrides.scenes.intro?.bg) {
      throw new Error("Created blank story inherited base scenes or backgrounds.");
    }
    overrides.story = { ...(overrides.story || {}), path: `/${suffix}-renamed`, published: true };
    await api(`/api/editor/stories/${encodeURIComponent(createdId)}/overrides`, {
      method: "PUT",
      body: JSON.stringify(overrides),
    });
    const renamedResponse = await fetch(`${baseUrl}/api/public/story?path=/${suffix}-renamed`, { cache: "no-store" });
    if (!renamedResponse.ok) throw new Error("Renamed story custom path was not publicly readable.");
  } finally {
    if (createdId) {
      await api(`/api/editor/stories/${encodeURIComponent(createdId)}`, { method: "DELETE" }).catch(() => {});
    }
  }
}

async function exerciseMediaApi() {
  const tinyPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  );
  const stem = `admin-smoke-${Date.now()}`;
  let currentName = "";
  try {
    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([tinyPng], { type: "image/png" }), `${stem}.png`);
    const upload = await authedFetch("/api/media/upload", { method: "POST", body: uploadForm });
    const uploaded = await upload.json();
    currentName = uploaded.file?.name || "";
    if (!currentName.endsWith(".png")) throw new Error("Media upload did not return a PNG filename.");

    const renamed = await api(`/api/media/file/${encodeURIComponent(currentName)}`, {
      method: "PATCH",
      body: JSON.stringify({ name: `${stem}-renamed.png` }),
    });
    currentName = renamed.file?.name || "";
    if (!currentName.includes("renamed")) throw new Error("Media rename did not return the renamed file.");

    const replaceForm = new FormData();
    replaceForm.append("file", new Blob([tinyPng], { type: "image/png" }), "replacement.png");
    await authedFetch(`/api/media/file/${encodeURIComponent(currentName)}`, { method: "PUT", body: replaceForm });

    const listed = await api("/api/media/list");
    if (!listed.files?.some((file) => file.name === currentName && file.kind === "image")) {
      throw new Error("Media list did not include the replaced image.");
    }
  } finally {
    if (currentName) {
      await authedFetch(`/api/media/file/${encodeURIComponent(currentName)}`, { method: "DELETE" }).catch(() => {});
    }
  }
}

const base = await api("/api/editor/base");
if (!base.SCENES?.intro || !base.DEFAULT_EDITOR_CONFIG?.finalGate) {
  throw new Error("Editor base data is missing scenes or finalGate.");
}

await exerciseStoryApi();
await exerciseMediaApi();

const browser = await chromium.launch({ headless: true });
const errors = [];

async function pageWithViewport(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return { context, page };
}

const desktop = await pageWithViewport(1440, 960);
await desktop.context.addCookies([{ name: "qy_admin", value: cookie.replace(/^qy_admin=/, ""), domain: new URL(baseUrl).hostname, path: "/" }]);
await desktop.page.goto(`${baseUrl}/月兰山`, { waitUntil: "load" });
await desktop.page.locator(".flowNode").first().waitFor({ state: "visible", timeout: 60000 });
if ((await desktop.page.locator(".flowNode").count()) < 12) {
  throw new Error("Flow graph rendered too few nodes.");
}
await desktop.page.screenshot({ path: path.join(outDir, "admin-desktop.png"), fullPage: true });

const panStart = await desktop.page.locator("#flowCanvas").evaluate((canvas) => {
  canvas.scrollLeft = Math.min(360, Math.max(0, canvas.scrollWidth - canvas.clientWidth));
  return { left: canvas.scrollLeft, scrollWidth: canvas.scrollWidth, clientWidth: canvas.clientWidth };
});
if (panStart.scrollWidth <= panStart.clientWidth || panStart.left < 40) {
  throw new Error("Flow graph did not expose enough horizontal space to verify panning.");
}
const canvasBox = await desktop.page.locator("#flowCanvas").boundingBox();
if (!canvasBox) throw new Error("Flow canvas was not measurable.");
await desktop.page.mouse.move(canvasBox.x + 32, canvasBox.y + 32);
await desktop.page.mouse.down();
await desktop.page.mouse.move(canvasBox.x + 260, canvasBox.y + 32, { steps: 8 });
await desktop.page.mouse.up();
const panEnd = await desktop.page.locator("#flowCanvas").evaluate((canvas) => canvas.scrollLeft);
if (panEnd >= panStart.left - 40) {
  throw new Error(`Flow graph panning did not move enough: ${panStart.left} -> ${panEnd}`);
}

await desktop.page.locator("#linkModeButton").click();
await desktop.page.locator("#linkModeButton.active").waitFor({ state: "visible", timeout: 5000 });
await desktop.page.locator("#linkModeButton").click();

await desktop.page.locator('[data-tab="archive"]').click();
await desktop.page.locator("#editCluesButton").click();
await desktop.page.locator(".clueArchiveRow").first().waitFor({ state: "visible", timeout: 10000 });
await desktop.page.screenshot({ path: path.join(outDir, "admin-clues.png"), fullPage: true });

await desktop.page.locator('[data-tab="final"]').click();
await desktop.page.locator(".conditionRow").first().waitFor({ state: "visible", timeout: 10000 });
await desktop.page.screenshot({ path: path.join(outDir, "admin-final.png"), fullPage: true });
await desktop.context.close();

const mobile = await pageWithViewport(390, 844);
await mobile.context.addCookies([{ name: "qy_admin", value: cookie.replace(/^qy_admin=/, ""), domain: new URL(baseUrl).hostname, path: "/" }]);
await mobile.page.goto(`${baseUrl}/月兰山`, { waitUntil: "load" });
await mobile.page.locator(".topbar").waitFor({ state: "visible", timeout: 10000 });
await mobile.page.locator(".flowNode").first().waitFor({ state: "visible", timeout: 15000 });
await mobile.page.screenshot({ path: path.join(outDir, "admin-mobile.png"), fullPage: true });
await mobile.context.close();

await browser.close();

if (errors.length) {
  throw new Error(`Browser errors:\n${errors.join("\n")}`);
}

console.log("admin-smoke ok");
