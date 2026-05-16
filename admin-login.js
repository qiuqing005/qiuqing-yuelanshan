const form = document.getElementById("loginForm");
const statusEl = document.getElementById("loginStatus");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "验证中...";
  const payload = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
  };

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "登录失败。");
    window.location.replace("/月兰山");
  } catch (error) {
    statusEl.textContent = error.message;
  }
});
