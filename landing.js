function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const RESOURCE_VERSION = "202605161700";

function versionedAssetUrl(value) {
  const text = String(value || "");
  if (!text || /^(data:|blob:|#)/i.test(text)) return text;
  try {
    const url = new URL(text, window.location.href);
    if (url.origin !== window.location.origin) return text;
    if (!url.pathname.startsWith("/assets/") && !url.pathname.startsWith("/uploads/")) return text;
    url.searchParams.set("v", RESOURCE_VERSION);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return text;
  }
}

function renderStoryList(stories = [], activePath = "") {
  const list = document.getElementById("storyList");
  const others = stories.filter((story) => story.path && story.path !== activePath);
  if (!others.length) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = others.map((story) => `
    <a class="storyCard" href="${escapeHtml(story.path)}">
      <strong>${escapeHtml((story.title || story.id || "未命名故事").replace(/^告白怪谈：/, ""))}</strong>
      <span>${escapeHtml(story.path)}</span>
      <p>${escapeHtml(story.subtitle || story.intro || "进入这个故事。")}</p>
    </a>
  `).join("");
}

async function loadStory() {
  try {
    const [storyResponse, storiesResponse] = await Promise.all([
      fetch("/api/public/story", { cache: "no-store" }),
      fetch("/api/public/stories", { cache: "no-store" }).catch(() => null),
    ]);
    if (!storyResponse.ok) return;
    const story = await storyResponse.json();
    document.title = story.title || document.title;
    document.getElementById("storyTitle").textContent = (story.title || "秋清与月兰山").replace(/^告白怪谈：/, "");
    document.getElementById("storySubtitle").textContent = story.subtitle || "在一次只能说出口的表白之前，先学会分清谁在场。";
    document.getElementById("storyIntro").textContent = story.intro || document.getElementById("storyIntro").textContent;
    document.getElementById("storyEntry").textContent = story.entryLabel || "进入故事";
    document.getElementById("storyEntry").href = story.path || "/yuelanshan";
    if (story.cover) document.getElementById("landing").style.setProperty("--cover", `url("${versionedAssetUrl(story.cover)}")`);
    if (storiesResponse?.ok) {
      const data = await storiesResponse.json();
      renderStoryList(data.stories || [], story.path);
    }
  } catch {
    // Static preview can still render the default story page.
  }
}

loadStory();
