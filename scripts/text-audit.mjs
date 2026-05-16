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
  "标准答案",
  "隐藏路线",
  "好感度",
  "数值不够",
  "通关",
  "玩家",
  "风险提示",
  "危险选项",
  "错误选项",
  "失败选项",
  "坏结局提示",
  'speaker: "系统"',
];

const hits = banned.filter((phrase) => source.includes(phrase));

if (hits.length) {
  throw new Error(`Awkward meta/script phrases found:\n${hits.join("\n")}`);
}

console.log("text-audit ok");
