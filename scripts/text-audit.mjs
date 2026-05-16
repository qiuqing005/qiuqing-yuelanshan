import fs from "node:fs/promises";

const source = await fs.readFile("app.js", "utf8");

const banned = [
  "小网页上的选择题",
  "所谓攻略",
  "漂亮地赢过规则",
  "规则缝隙",
  "怪谈最常用",
  "最终答案",
  "完整答案",
  "正确答案",
  "交出答案",
  "最终方案",
  "最终场景",
  "最终句",
  'speaker: "系统"',
];

const hits = banned.filter((phrase) => source.includes(phrase));

if (hits.length) {
  throw new Error(`Awkward meta/script phrases found:\n${hits.join("\n")}`);
}

console.log("text-audit ok");
