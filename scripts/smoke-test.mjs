import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const requestedUrl = process.argv[2] || "http://127.0.0.1:4180";
const url = new URL(requestedUrl);
if (url.pathname === "/" || url.pathname === "") url.pathname = "/yuelanshan";
const baseUrl = url.toString().replace(/\/$/, "");
const originUrl = `${url.origin}/`;
const outDir = path.resolve("output/playwright");
await fs.mkdir(outDir, { recursive: true });

const audit = spawnSync(process.execPath, ["scripts/text-audit.mjs"], { stdio: "inherit" });
if (audit.status !== 0) {
  throw new Error("Text audit failed.");
}

const browser = await chromium.launch({ headless: true });
const errors = [];

async function newPage(width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return { context, page };
}

async function click(page, label) {
  await page.getByRole("button", { name: label }).click();
  await page.waitForFunction(() =>
    !document.querySelector("#text.textExit") &&
    !document.querySelector("#choices.choicesExit"),
    null,
    { timeout: 5000 }
  ).catch(() => {});
  await page.waitForTimeout(80);
}

async function waitForImages(page) {
  await page.waitForFunction(() =>
    Array.from(document.images)
      .filter((image) => {
        const style = getComputedStyle(image);
        return image.offsetParent !== null && style.visibility !== "hidden" && style.opacity !== "0";
      })
      .every((image) => !image.currentSrc || (image.complete && image.naturalWidth > 0)),
    null,
    { timeout: 45000 }
  );
}

async function waitForTextSettled(page) {
  await page.waitForFunction(() => {
    const text = document.querySelector("#text");
    const choices = document.querySelector("#choices");
    if (text?.classList.contains("textExit") || choices?.classList.contains("choicesExit")) return false;
    const lines = Array.from(document.querySelectorAll(".streamLine"));
    if (!lines.length) return true;
    return lines.every((line) => {
      const style = getComputedStyle(line);
      return Number(style.opacity) >= 0.99;
    });
  }, null, { timeout: 5000 }).catch(() => {});
}

async function screenshot(page, fileName) {
  await waitForImages(page);
  await waitForTextSettled(page);
  await page.screenshot({ path: path.join(outDir, fileName), fullPage: true });
}

async function assertVersionedFrontendAssets(page) {
  const offenders = await page.evaluate(() => {
    const values = [
      getComputedStyle(document.querySelector("#stage") || document.querySelector("#landing")).backgroundImage,
      ...Array.from(document.querySelectorAll("img, audio")).map((node) => node.currentSrc || node.src || ""),
    ];
    return values
      .filter((value) => /\/(?:assets|uploads)\//.test(value))
      .filter((value) => !/[?&]v=/.test(value));
  });
  if (offenders.length) {
    throw new Error(`Unversioned frontend assets found:\n${offenders.join("\n")}`);
  }
}

async function assertNoLargeBackwardEdges() {
  const src = await fs.readFile("app.js", "utf8");
  const start = src.indexOf("const SCENES = {");
  const end = src.indexOf("const SCENE_EXPANSIONS");
  const body = src.slice(start, end);
  const sceneRegex = /^  ([A-Za-z0-9_]+): \{/gm;
  const scenes = [];
  let match;
  while ((match = sceneRegex.exec(body))) scenes.push({ key: match[1], offset: match.index });
  const order = new Map(scenes.map((scene, index) => [scene.key, index]));
  const badEdges = [];

  scenes.forEach((scene, index) => {
    const block = body.slice(scene.offset, index + 1 < scenes.length ? scenes[index + 1].offset : body.length);
    const choiceRegex = /\{\s*label:\s*"([^"]+)"[^{}]*?next:\s*"([^"]+)"/g;
    let choice;
    while ((choice = choiceRegex.exec(block))) {
      const target = choice[2];
      if (!order.has(target)) return;
      const delta = order.get(target) - index;
      if (delta < -8) badEdges.push(`${scene.key} -> ${target}: ${choice[1]}`);
    }
  });

  if (badEdges.length) {
    throw new Error(`Large backward story jumps found:\n${badEdges.join("\n")}`);
  }
}

await assertNoLargeBackwardEdges();

const landingDesktop = await newPage(1366, 900);
await landingDesktop.page.goto(originUrl, { waitUntil: "networkidle" });
await landingDesktop.page.locator("#storyEntry").waitFor({ state: "visible", timeout: 10000 });
await assertVersionedFrontendAssets(landingDesktop.page);
const entryHref = await landingDesktop.page.locator("#storyEntry").getAttribute("href");
if (!entryHref || !entryHref.includes("/yuelanshan")) {
  throw new Error(`Landing entry link did not point to /yuelanshan: ${entryHref}`);
}
await screenshot(landingDesktop.page, "landing-desktop.png");
await landingDesktop.context.close();

const landingMobile = await newPage(390, 844);
await landingMobile.page.goto(originUrl, { waitUntil: "networkidle" });
await landingMobile.page.locator("#storyEntry").waitFor({ state: "visible", timeout: 10000 });
await assertVersionedFrontendAssets(landingMobile.page);
await screenshot(landingMobile.page, "landing-mobile.png");
await landingMobile.context.close();

const earlyEnding = await newPage(1366, 900);
await earlyEnding.page.goto(baseUrl, { waitUntil: "networkidle" });
await earlyEnding.page.evaluate(() => localStorage.clear());
await earlyEnding.page.reload({ waitUntil: "networkidle" });
await click(earlyEnding.page, "不管规则，立刻给秋清发“我喜欢你”");
await earlyEnding.page.getByRole("button", { name: "重新开始" }).waitFor({ state: "visible", timeout: 5000 });
await click(earlyEnding.page, "重新开始");
await earlyEnding.page.getByRole("tab", { name: "结局/历史" }).click();
const endingArchiveText = await earlyEnding.page.locator("#historyPane").innerText();
if (!endingArchiveText.includes("过早告白")) {
  throw new Error("Ending archive did not persist a collected bad ending after reset.");
}
await screenshot(earlyEnding.page, "desktop-ending-archive.png");
await earlyEnding.context.close();

const desktop = await newPage(1366, 900);
await desktop.page.goto(baseUrl, { waitUntil: "networkidle" });
await assertVersionedFrontendAssets(desktop.page);
await desktop.page.getByRole("button", { name: "启用或关闭声音" }).click();
await desktop.page.waitForTimeout(200);
await screenshot(desktop.page, "desktop-start.png");
await click(desktop.page, "翻检烧毁的信封");
await desktop.page.getByRole("button", { name: "返回上一步" }).click();
await desktop.page.waitForTimeout(120);
await desktop.page.getByRole("button", { name: "翻检烧毁的信封" }).waitFor();

const route = [
  "翻检烧毁的信封",
  "把没烧尽的纸灰按边缘拼回去",
  "检查票据上被茶渍盖住的地址",
  "给秋清打电话，确认茶铺是否真实",
  "照电话里的地址去茶铺",
  "把广播笑话讲完",
  "查看那只空杯为什么杯口朝内",
  "继续翻看旧账本",
  "把账本合上，等他自己说下一句",
  "等雨停后跟秋清去旧路口",
  "先检查路边废弃售票亭",
  "离开售票亭，开始数路灯",
  "继续数到第四盏和第五盏",
  "不回答，继续走向第六盏灯",
  "站起来，走进第七盏灯",
  "不回头，称呼他月兰山",
  "先确认他是否会伤害秋清",
  "沉默，等他自己继续说",
  "说明你要理解规则，不是利用规则",
  "问他为什么不爱任何人",
  "请求月兰山替你保管唯一一次表白",
  "收回那个请求，回到刚才的判断",
  "沿旧路走到废弃公交站",
  "带着这条判断回镜室",
  "先检查抽屉里的旧照片",
  "用小钥匙打开镜框后的暗格",
  "回到镜面红线，按方向解码",
  "去旧校医室找月兰山的记录",
  "无视其他门，走向无声的校医室",
  "听完录音，不打断",
  "继续翻看校医留下的病例索引",
  "按请假条背面的借阅号去旧图书室",
  "查找那本被借走的书名",
  "把书签夹进手账，再查失物柜",
  "不拿走明信片，只带走抄录内容",
  "帮秋清把祭灯写上名字",
  "把祭灯交给摊主，参加试胆局",
  "推开写着“人声”的纸门",
  "先去看试胆局出口的告示",
  "回到档案桌整理残页",
  "正式按拒绝条件排序",
  "把月兰山残页放在“表白本身被拒绝”下",
  "把秋清残页放在“对秋清的表白被拒绝”下",
  "把红线结放在“互认为自己”旁边",
  "用第九条解释第一条的空白",
  "补全第一条的原文",
  "把最后一句写进手账",
  "先进行一次无声演练",
  "进入祭灯夜",
  "把借来的火交还摊主",
  "从第一盏灯开始巡夜",
  "盖下第一格“借火”",
  "去热茶摊完成第二小时",
  "沿着人群边缘去看旧路灯影",
  "只把旧路当证词，不回应暗处人声",
  "按在场者整理票根和杯子",
  "去镜摊完成第五小时",
  "把裂纹记下来，不要求它合上",
  "把六格巡灯表收进手账",
  "站回秋清能听见也能后退的位置",
  "月兰山，我爱你。",
];

for (const label of route) {
  await click(desktop.page, label);
  if (label === "请求月兰山替你保管唯一一次表白") {
    await screenshot(desktop.page, "desktop-bad-substitute.png");
  }
  if (label === "收回那个请求，回到刚才的判断") {
    await desktop.page.getByRole("button", { name: "沿旧路走到废弃公交站" }).waitFor();
    await screenshot(desktop.page, "desktop-return-yuelan.png");
  }
}

await screenshot(desktop.page, "desktop-ending.png");
await desktop.page.getByRole("tab", { name: "结局/历史" }).click();
await screenshot(desktop.page, "desktop-history.png");
const endingText = await desktop.page.locator("#text").innerText();
if (!endingText.includes("我同意") || !endingText.includes("第八条")) {
  throw new Error("Ending text did not include the expected rule resolution.");
}

const brokenImages = await desktop.page.evaluate(() =>
  Array.from(document.images)
    .filter((image) => {
      const style = getComputedStyle(image);
      return image.offsetParent !== null && style.visibility !== "hidden" && style.opacity !== "0";
    })
    .filter((image) => !image.complete || image.naturalWidth === 0)
    .map((image) => image.getAttribute("src"))
);
if (brokenImages.length) {
  throw new Error(`Broken images: ${brokenImages.join(", ")}`);
}

await desktop.context.close();

const mobile = await newPage(390, 844);
await mobile.page.goto(baseUrl, { waitUntil: "networkidle" });
await mobile.page.evaluate(() => localStorage.clear());
await mobile.page.reload({ waitUntil: "networkidle" });
await screenshot(mobile.page, "mobile-start.png");
const choicesVisible = await mobile.page.locator(".choice").count();
if (choicesVisible < 2) {
  throw new Error("Mobile start screen did not render expected choices.");
}
for (const label of ["翻检烧毁的信封", "把没烧尽的纸灰按边缘拼回去", "检查票据上被茶渍盖住的地址", "按照票据地址前往茶铺"]) {
  await click(mobile.page, label);
}
await screenshot(mobile.page, "mobile-character.png");
await mobile.context.close();

await browser.close();

if (errors.length) {
  throw new Error(`Browser errors:\n${errors.join("\n")}`);
}

console.log("smoke-test ok");
