const $ = (id) => document.getElementById(id);

const RESOURCE_VERSION = "202605162151";

const ASSETS = {
  night: "./assets/images/bg-night-road.png",
  gate: "./assets/images/bg-mountain-gate.png",
  tea: "./assets/images/bg-teahouse.png",
  mirror: "./assets/images/bg-mirror-room.png",
  festival: "./assets/images/bg-festival-road.png",
  qiuqing: "./assets/images/portrait-qiuqing.png",
  yuelan: "./assets/images/portrait-yuelanshan.png",
  rulebook: "./assets/images/item-rulebook.png",
  thread: "./assets/images/item-redthread.png",
  moon: "./assets/images/item-moonbookmark.png",
  cup: "./assets/images/item-teacup.png",
};

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

const TRUE_RULES = [
  "秋清只会爱上“喜欢他”的人。",
  "月兰山是秋清在最低谷、最压抑的时候诞生的第二人格。他诞生于一条夜间寂静无人的小路。",
  "秋清是感性与理性并存的正常人格。月兰山则是秋清过度压抑后沉下来的理性。",
  "快乐会让秋清的感性浮起。孤独会让月兰山的理性出现。",
  "秋清与月兰山互相理解，也互相承认。",
  "月兰山不会爱任何人。除了秋清。",
  "当只有月兰山出现时，他不会接受任何人的表白。",
  "当只有秋清出现时，秋清不会接受任何对他的表白。",
  "秋清认为月兰山是自己。月兰山也认为秋清是自己。但这不影响他们对自己的认知。",
  "月兰山存在时，秋清不存在。秋清存在时，月兰山不存在。两个人格无法同时出现。",
];

const FRAGMENTS = {
  f4a: { rule: 4, text: "快乐会让某个名字靠近灯光。" },
  f4b: { rule: 4, text: "孤独会让另一个名字接管回答。" },
  f2a: { rule: 2, text: "第二人格诞生在夜间寂静无人的小路。" },
  f2b: { rule: 2, text: "夜路里，先出现的是问句，不是人。" },
  f3a: { rule: 3, text: "感性与理性不是敌人，只是浮沉的位置不同。" },
  f5a: { rule: 5, text: "他们互相理解，也互相承认。" },
  f6a: { rule: 6, text: "月兰山不会爱任何人；录音在这里断了一秒。" },
  f6b: { rule: 6, text: "断秒后只有四个字：除了秋清。" },
  f10a: { rule: 10, text: "镜子一次只照出一个名字。" },
  f7a: { rule: 7, text: "月兰山出现时，拒绝的不是对象，而是表白这件事。" },
  f8a: { rule: 8, text: "秋清出现时，被拒绝的是“对他”的表白。" },
  f9a: { rule: 9, text: "秋清认为月兰山是自己。" },
  f9b: { rule: 9, text: "月兰山也认为秋清是自己。" },
  f9c: { rule: 9, text: "他们都把“我”留在自己身上，不肯借给任何人。" },
  f1a: { rule: 1, text: "残片只剩两个词：喜欢、他。" },
};

const CLUES = {
  ash: {
    title: "烧毁的规则页",
    img: ASSETS.rulebook,
    body: "页边被烧掉，原文不可读。必须用经历补回规则，而不是先拿原文。",
  },
  tea: {
    title: "桂花茶与笑声",
    img: ASSETS.cup,
    body: "秋清在有人声、有热茶、有笑声的地方更稳定。快乐不是钥匙，但能把他留在场内。",
  },
  teaLedger: {
    title: "茶摊账单",
    img: ASSETS.cup,
    body: "账单上有三道水圈：一只杯子被使用，一只杯子被空着，一栏回答必须留白。旁人能证明你们来过，不能证明秋清答应过。",
  },
  road: {
    title: "第七盏路灯",
    img: ASSETS.moon,
    body: "第七盏灯后不能回头。回头看见的不是秋清，是想让你提前用掉表白的东西。",
  },
  noTurn: {
    title: "背后的秋清",
    img: ASSETS.moon,
    body: "夜路上叫你名字的声音越像秋清，越可能不是秋清。孤独会让月兰山出现。",
  },
  recorder: {
    title: "校医室录音",
    img: ASSETS.rulebook,
    body: "录音把月兰山的诞生记录成一段保护机制：理性沉下来，是为了把秋清带回家。",
  },
  cups: {
    title: "两只杯子",
    img: ASSETS.cup,
    body: "杯子可以有两只，镜中位置只有一个。互相承认不等于同时出现。",
  },
  redThread: {
    title: "红线结",
    img: ASSETS.thread,
    body: "红线绕出两个名字，最后回到同一个结。要尊重差异，也要看见同一。",
  },
  wording: {
    title: "拒绝条件排序",
    img: ASSETS.rulebook,
    body: "你把两张残页摊开，发现拒绝不是情绪，是条件。差一个词，门缝就会换位置。",
  },
  final: {
    title: "灯前折页",
    img: ASSETS.thread,
    body: "最后一句话必须落在一个不被拒绝的位置。你不是在求回应，你是在避免把自己交给怪谈。",
  },
  deposit: {
    title: "寄存台的空信封",
    img: ASSETS.moon,
    body: "把一句话交出去会更轻，可轻的往往回不来。月兰山不让你寄存，不是冷，是怕你把判断丢给别人。",
  },
  borrowedFlame: {
    title: "借火签",
    img: ASSETS.thread,
    body: "摊主只借火，不替人点灯。最后一句也一样：可以准备，不能先交给纸、火或旁人。",
  },
  festivalMark: {
    title: "灯谜木牌",
    img: ASSETS.moon,
    body: "开口前最后要确认的是位置：声音属于你，退路属于秋清，热闹只负责把他留在场内。",
  },
  sixHourRoute: {
    title: "六时巡灯表",
    img: ASSETS.rulebook,
    body: "祭灯夜被分成六段：借火、回温、认路、对账、照镜、留白。每一段都不是新规则，只是在把旧规则放回真实时间里。",
  },
  crowdReceipt: {
    title: "人群回执",
    img: ASSETS.thread,
    body: "摊主让你每巡完一段就在竹签背面划一道线。人群可以作证你没有逃走，但不能替你决定最后一句话。",
  },
  mirrorStall: {
    title: "镜摊裂纹",
    img: ASSETS.moon,
    body: "裂镜没有照出两个人同时站在一起。它只照出一个人身上轮流亮起的两种边界：谁在场，谁就拥有当下的拒绝权。",
  },
  archiveDraft: {
    title: "档案摊散页",
    img: ASSETS.rulebook,
    body: "后半夜的散页没有给出新规则，只把已经见过的证词重新摊开。顺序一乱，答案就会看起来比证据更像证据。",
  },
  falseJointSignature: {
    no: "N8",
    title: "联名签条",
    img: ASSETS.thread,
    kind: "fake",
    body: "纸条把秋清和月兰山写成一枚联名签名，看起来省事，却把“互认”误写成“同场”。它能安慰你，不能证明任何人此刻在场。",
  },
  nameLedger: {
    no: "N8",
    title: "分栏名册",
    img: ASSETS.rulebook,
    replaces: ["falseJointSignature"],
    body: "名册把秋清、月兰山与“当下在场者”分成三栏。互相承认不等于共同署名，分栏才让最后一句话有落点。",
  },
  paperBridge: {
    title: "纸桥检尺",
    img: ASSETS.moon,
    body: "纸桥只能承重证据：杯子、票根、残页、朱印。它不能承重回答，也不能把一句话从你手里搬到人群嘴里。",
  },
  wrongCrowdProof: {
    no: "D10",
    title: "人群证明",
    img: ASSETS.thread,
    kind: "fake",
    body: "人群越齐，证明越像完整。可它只能证明热闹仍在，不能证明秋清不会离开，也不能证明他愿意接住你的句子。",
  },
  crowdDistance: {
    no: "D10",
    title: "半步距离",
    img: ASSETS.thread,
    replaces: ["wrongCrowdProof"],
    body: "最稳的位置不是最近的位置，而是秋清能听清、也能后退的位置。人声托住场景，半步距离托住选择。",
  },
  borrowedSilence: {
    title: "借来的沉默",
    img: ASSETS.moon,
    body: "沉默也有主人。你可以暂时不说话，但不能把不说话交给月兰山保管；那会让沉默变成另一种替你决定。",
  },
  doubtDawnReceipt: {
    title: "黎明回执",
    img: ASSETS.cup,
    kind: "doubt",
    body: "回执上只写着：天亮前你没有逃走。它值得留下，也必须存疑；坚持到黎明不等于得到回答。",
  },
};

const JOURNALS = {
  j0: {
    title: "手账零：不要相信完整纸页",
    body: "怪谈最残酷的地方，是它会把完整纸页伪装成唾手可得。信封烧掉了规则页，只留下“只能表白一次”。如果有谁一开始就把全部规则交到你手里，那不是帮助，是陷阱。",
  },
  j1: {
    title: "手账一：茶铺的暖",
    body: "秋清笑起来时，眼睛先恢复温度，语言才恢复完整。他说“我今天还在”，不是“我今天很好”。这句差别很细，却足够说明快乐不是治愈，只是让他暂时不用把世界交给月兰山。",
  },
  j2: {
    title: "手账二：夜路的危险",
    body: "你在第七盏路灯下听见背后有人叫你。那声音像秋清，甚至知道茶铺的杯子裂纹。可你没有回头。你第一次意识到，怪谈会模仿感情，逼你在错误人格出现前说出唯一一次表白。",
  },
  j3: {
    title: "手账三：月兰山不是敌人",
    body: "月兰山没有抢走秋清。他说自己是在秋清无法继续的时候沉下来的理性。沉下来，不是消灭感性；只是先把身体带离危险，再等秋清能回来。",
  },
  j4: {
    title: "手账四：镜子密码",
    body: "镜子背面的字必须倒着读：当前在场者，不等于全部的自己。你不能把秋清和月兰山混成一个模糊对象，也不能把他们切成毫无关系的两个人。",
  },
  j5: {
    title: "手账五：录音断秒",
    body: "校医室录音里，月兰山说“我不会爱任何人”。磁带在这里空了一秒，随后补上“除了秋清”。如果你只听前半句，会以为他冷酷；听完整，才知道那是职责。",
  },
  j6: {
    title: "手账六：拒绝条件",
    body: "你把残页按拒绝条件排序。月兰山出现时，拒绝范围最大：任何人的表白。秋清出现时，拒绝范围变窄：任何对他的表白。怪谈的门缝就藏在这个窄处。",
  },
  j7: {
    title: "手账七：互认为自己",
    body: "秋清承认月兰山是自己，月兰山也承认秋清是自己。但这不让他们同时出现，也不抹掉当前人格。它只在最后提供一座桥：喜欢月兰山，如何被秋清判作喜欢自己。",
  },
  j8: {
    title: "手账八：开口的位置",
    body: "地点不能是无人夜路，那里会让月兰山独自出现。也不能是只剩你们两人的封闭房间，那会把秋清推向孤独。祭灯夜有热闹和退路，足以让秋清留在场内。",
  },
  j9: {
    title: "手账九：唯一一句",
    body: "你删掉所有甜言蜜语，只留一个精确句子。它必须在秋清出现时说出；它不能以秋清为对象；它必须让秋清根据自我认知承认，你喜欢的仍然是他。",
  },
  j10: {
    title: "手账十：夜班车背面",
    body: "售票亭的时刻表背面被人写满：七盏灯后，所有声音都只算证词，不算身份。怪谈从不逼你回答“你爱谁”，它逼你回答“你眼前的人是谁”。",
  },
  j11: {
    title: "手账十一：寄存不是保护",
    body: "你差点把那句话交给寄存台。它看起来像一种节省：省掉犹豫、省掉风险、省掉被拒绝的疼。可月兰山说那不是保护，是把判断交出去了。怪谈最喜欢的就是这种“省”。",
  },
  j12: {
    title: "手账十二：开口的位置",
    body: "灯谜木牌没有给你新的规则，只让你把旧规则落回现场。最后一句必须从你这里出发，也必须停在秋清能选择的位置。人声可以托住场面，不能替你说话。",
  },
  j13: {
    title: "手账十三：六时巡灯",
    body: "你把祭灯夜拆成六段，不是为了拖延，而是为了让每条规则都经得起时间。怪谈最喜欢催促；它一催，人的判断就会被伪装成勇敢。",
  },
  j14: {
    title: "手账十四：回温不是奖赏",
    body: "秋清在热茶摊前笑了一下，你几乎想把这当成准许。可快乐只是让他留在场内，不是让你提前索取答案。你在杯沿停住，才没有把温暖误认成通行证。",
  },
  j19: {
    title: "手账十九：旁证的边界",
    body: "老板娘可以记得秋清喝过茶，记得你们在同一张桌边停了很久。可她不能替秋清证明一句还没有发生的话。旁证只能证明场景，不能证明回答。",
  },
  j15: {
    title: "手账十五：旧路在场外",
    body: "祭灯夜也能看见那条夜路。它在场外亮着，不再把你拖回无人处。你终于明白，危险并没有消失，只是你学会了不把危险当成浪漫的证明。",
  },
  j16: {
    title: "手账十六：对账",
    body: "你把每个名字、杯子、灯号和残页重新对过一遍。六小时里没有哪一条证据突然变神奇；它们只是从孤立的纸片，变成了彼此能承担重量的结构。",
  },
  j17: {
    title: "手账十七：裂镜",
    body: "镜摊的裂纹让你再次看见边界：同一个身体，不等于同一个在场。你不能为了让告白显得完整，就强行让两个名字同时承担同一句话。",
  },
  j18: {
    title: "手账十八：留白",
    body: "最后一小时最难的不是说出口，而是不预演对方的回答。你把答案的位置留空，才把秋清从怪谈的机关里还给他自己。",
  },
  j20: {
    title: "手账二十：后六时",
    body: "六格巡灯表收进手账后，夜并没有立刻结束。你以为自己已经准备好，祭灯却把准备拆成更细的十二段：不是增加规则，而是确认你不会把规则当成捷径。",
  },
  j21: {
    title: "手账二十一：分栏",
    body: "最诱人的假线索常常很整齐。联名签条把两个名字合成一个漂亮结果，分栏名册却提醒你：越到最后，越不能为了省事把边界写没。",
  },
  j22: {
    title: "手账二十二：纸桥",
    body: "纸桥承得住证据，承不住愿望。你把票根、残页和朱印放上去，它没有塌；你一想到让人群替你递话，纸边就开始发软。",
  },
  j23: {
    title: "手账二十三：半步",
    body: "你终于能把距离看成礼貌，而不是胆怯。秋清能听见你，也能离开你；这半步让告白不再像围堵。",
  },
  j24: {
    title: "手账二十四：沉默的主人",
    body: "不说话并不天然正确。你可以把话暂时收住，但不能把沉默借给月兰山。借出去的沉默，会替你变成一个没有出口的结论。",
  },
  j25: {
    title: "手账二十五：黎明不作证",
    body: "天亮只是说明你撑到了天亮，不说明秋清已经回答。你把黎明回执夹进存疑页，才没有把坚持误写成许可。",
  },
};

const endingChoices = [{ label: "进入结局事后谈", next: "endingAftertalk", primary: true }];

const SCENES = {
  endingAftertalk: {
    chapter: "结局事后谈",
    code: "AFTER",
    speaker: "灯后余声",
    bg: ASSETS.festival,
    persona: "none",
    dynamicAftertalk: true,
    text: [
      "纸灯落下之后，热闹会退到远处。你终于可以不急着修正，也不急着重来。",
      "先把这个结局放在桌上，看看它留下了什么，再决定要不要再次游玩。",
    ],
    choices: [
      { label: "再次游玩", reset: true, primary: true, dynamicLabel: "replayRemaining" },
    ],
  },

  intro: {
    chapter: "序章",
    code: "00",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "信封卡在门缝里，没有署名。封口用红线缝死，线头沾着一点焦黑，像刚从火里被人拽出来。",
      "里面不是情书。十张薄纸烧得只剩编号，灰屑散在桌面上，偶尔能看见一个字，又立刻被呼吸吹散。",
      "信封内侧压着一行端正的字：你只能表白一次。字迹很稳，稳得不像警告，更像某个人替你把退路划掉。",
    ],
    effects: { clues: ["ash"], journals: ["j0"], stats: { logic: 4 } },
    choices: [
      { label: "翻检烧毁的信封", next: "ashPage", primary: true },
      { label: "不管规则，立刻给秋清发“我喜欢你”", next: "badEarly", danger: true, confession: true },
    ],
  },

  ashPage: {
    chapter: "烧页",
    code: "01",
    speaker: "你",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "你用镊子夹起最大的一片，边缘一碰就碎。纸灰底下露出几个还没烧透的词：喜欢、夜路、孤独、自己。",
      "它们彼此挨得很近，却怎么也拼不成一句完整的话。你把它们分开贴进手账，留出的空白比字更多。",
      "信封底部还有一张茶铺票据，时间是今晚八点。背面被茶渍洇开，只剩一句看得清：别一见面就问。",
    ],
    effects: { fragments: ["f1a"], clues: ["tea"], stats: { logic: 5 } },
    choices: [
      { label: "把没烧尽的纸灰按边缘拼回去", next: "ashPuzzle", primary: true },
      { label: "把灰烬全部倒进水里", next: "badAsh", danger: true },
    ],
  },

  ashPuzzle: {
    chapter: "烧页",
    code: "02",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "编号靠不住。你把一号纸放到二号旁边，焦痕断开，像一条被剪错的路。",
      "最长的一片边缘弯成路灯的形状，旁边残着“无人”。最薄的一片只有“对他”两个字，轻得像随时会消失。",
      "茶铺票据上的油墨慢慢晕开，露出一行很浅的字：见到秋清时，先把声音放轻。",
    ],
    effects: { fragments: ["f2a"], stats: { logic: 6 } },
    choices: [
      { label: "检查票据上被茶渍盖住的地址", next: "ashLedger" },
      { label: "把词语按编号重新排列", next: "ashWrongOrder" },
      { label: "先给秋清打电话确认他是否安全", next: "phoneStatic" },
    ],
  },

  ashLedger: {
    chapter: "烧页",
    code: "02A",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "茶渍遮住了店名，只剩“兰”“清”“月”三个字。它们被水迹隔开，又被同一张纸勉强收在一起。",
      "你用铅笔拓背面，纸纤维里慢慢浮出地址。末尾还跟着半句：迟到的人，会在门口看见两只杯子。",
      "下一行被茶渍吞掉，只剩最后几个字：只听见一个人的声音。",
      "你把票据夹进手账。纸角抵着掌心，凉得像一枚小小的针。",
    ],
    effects: { stats: { logic: 4 }, clues: ["ash"] },
    choices: [
      { label: "按照票据地址前往茶铺", next: "teaMeet" },
      { label: "继续留在房间里等规则自己复原", next: "badWaitingRoom" },
      { label: "给秋清打电话，确认茶铺是否真实", next: "phoneStatic" },
      { label: "把票据丢掉，只记住“只能表白一次”", next: "badEarly" },
    ],
  },

  ashWrongOrder: {
    chapter: "烧页",
    code: "02B",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "你按编号拼出一句很顺的话：喜欢他的人，会在夜路上遇见自己。",
      "它太顺了。顺到像别人提前替你写好的检讨。下一秒，纸灰从胶带下滑出来，落回桌面。",
      "你盯着那句散掉的话，第一次不太敢相信自己的聪明。",
    ],
    effects: { stats: { logic: 3 } },
    choices: [
      { label: "改按烧痕和茶渍判断去向", next: "ashLedger" },
      { label: "仍坚持现在就该说出口", next: "badEarly", confession: true },
      { label: "先拨通票据上的号码", next: "phoneStatic" },
    ],
  },

  phoneStatic: {
    chapter: "电话",
    code: "02C",
    speaker: "听筒",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "电话接通后，先传来雨声。你分不清雨落在哪里，只觉得每一滴都离耳膜很近。",
      "对面有人说：“别在电话里说那句话。”声音像秋清，可尾音冷一些，像被水泡过。",
      "你问他是谁。对方没有答，只把茶铺地址重复了一遍。说到最后一个字时，听筒里响了一声杯沿相碰。",
      "你握着已经挂断的手机，过了好一会儿才把屏幕按灭。",
    ],
    effects: { fragments: ["f10a"], stats: { logic: 5, lonely: 3 } },
    choices: [
      { label: "照电话里的地址去茶铺", next: "teaMeet" },
      { label: "追问对方是不是月兰山", next: "phoneRefusal" },
      { label: "在电话里直接说出喜欢", next: "badEarly", confession: true },
      { label: "挂断后重新研究票据", next: "ashLedger" },
    ],
  },

  phoneRefusal: {
    chapter: "电话",
    code: "02D",
    speaker: "听筒",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "你问：“你是月兰山吗？”",
      "雨声停了一秒。对面说：“别急着叫名字。名字叫错了，会把不该来的人叫出来。”",
      "你还想追问，线路却断了。忙音里夹着细小的杯响，像有人把杯子轻轻扣回桌面。",
    ],
    effects: { stats: { logic: 4 } },
    choices: [
      { label: "停止追问，去茶铺", next: "teaMeet" },
      { label: "继续逼问对方把话说全", next: "badPhoneLoop" },
      { label: "回到烧页重新拓印票据", next: "ashLedger" },
    ],
  },

  teaMeet: {
    chapter: "茶铺",
    code: "03",
    speaker: "旁白",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清坐在靠窗的位置，菜单竖在手边，像一面随时可以躲进去的小屏风。桌上有两只杯子，一只有茶，一只是空的，杯口朝内。",
      "你把票据放在桌角，没有推过去，只说便利店广播今天把“桂花糕”念成了“归花告”。这个笑话很差，你自己都知道。",
      "秋清却低头笑了一下。很短，像热气在杯沿上亮了一瞬。水滚、门响、老板找零的声音慢慢回到你们周围。",
    ],
    effects: { fragments: ["f4a"], journals: ["j1"], clues: ["tea"], stats: { joy: 18, like: 8 } },
    choices: [
      { label: "把广播笑话讲完", next: "teaWarm", primary: true },
      { label: "趁他笑了，直接说“秋清，我爱你”", next: "badQiuqingDirect", danger: true, confession: true },
      { label: "追问“月兰山是不是另一个人”", next: "teaCrack", danger: true },
    ],
  },

  teaWarm: {
    chapter: "茶铺",
    code: "04",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "“你不像来表白的。”秋清说，“像来确认我有没有出事。”",
      "你说两者不冲突。他看了你一眼，没笑，也没否认，只把空杯往里推了半寸。",
      "“店里吵一点比较好。”他说，“吵的时候，我比较容易坐在这里。”",
      "门外的雨停了。路面被灯照得发亮，像一条刚被擦干净的旧伤。",
    ],
    effects: { fragments: ["f4a"], flags: ["qiuqingWitness"], stats: { joy: 8, like: 8 } },
    choices: [
      { label: "查看那只空杯为什么杯口朝内", next: "cupRiddle" },
      { label: "翻开秋清桌上的旧账本", next: "teaLedger" },
      { label: "请秋清把月兰山说清楚", next: "teaCrack" },
      { label: "拒绝去夜路，只留在茶铺安慰他", next: "badComfortOnly" },
    ],
  },

  cupRiddle: {
    chapter: "茶铺",
    code: "04C",
    speaker: "旁白",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "你没有碰空杯，只是问它为什么朝内。",
      "秋清用指腹碰了碰杯沿。“朝内就好。”他说，“朝外的时候，我会一直想它是不是在等谁。”",
      "你问：“那它现在呢？”",
      "“现在只是杯子。”秋清说完，像怕这句话太硬，又补了一句，“先让它只是杯子。”",
      "茶铺老板把灯调亮了一点。秋清的肩膀也跟着松了松。",
    ],
    effects: { clues: ["cups"], fragments: ["f10a"], stats: { joy: 6, logic: 5 } },
    choices: [
      { label: "继续翻看旧账本", next: "teaLedger" },
      { label: "把空杯转向自己", next: "badCupTurn" },
      { label: "问秋清是否愿意一起走到旧路口", next: "rainShelter" },
      { label: "趁气氛安稳说出告白", next: "badQiuqingDirect", confession: true },
    ],
  },

  teaLedger: {
    chapter: "茶铺",
    code: "04D",
    speaker: "旧账本",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "账本不是茶铺的账。每一页只有日期、天气和一行很短的字。",
      "晴：可以出门。雨：别一个人走。无风夜：绕路。桂花开：还好。",
      "翻到某页时，秋清按住纸角。“这页慢一点。”那页写着：今天笑过，不代表今天没事。",
      "你把手收回来。那一瞬间，你明白有些东西可以被看见，但不能被翻检。",
    ],
    effects: { journals: ["j1"], stats: { joy: 8, like: 6, logic: 5 } },
    choices: [
      { label: "把账本合上，等他自己说下一句", next: "rainShelter" },
      { label: "继续追读被他按住的下一页", next: "badLedgerForce" },
      { label: "问空杯是否属于月兰山", next: "cupRiddle" },
      { label: "提议今晚就去旧路口验证", next: "rainShelter" },
    ],
  },

  rainShelter: {
    chapter: "茶铺",
    code: "04E",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "雨又下起来。秋清没有急着起身，只把伞放到你们中间。",
      "“旧路上别回头。”他说得很平，像在提醒你过马路看灯。",
      "你问如果听见他的声音怎么办。秋清看向窗玻璃，玻璃里有你，有灯，也有一段黑下去的街。",
      "“越像我，越别信。”他说，“至少先别回头。”",
    ],
    effects: { clues: ["road"], stats: { logic: 7, like: 4 } },
    choices: [
      { label: "等雨停后跟秋清去旧路口", next: "roadStart" },
      { label: "坚持雨中立刻出发", next: "badRainRush" },
      { label: "承诺不回头，但要求秋清牵着你", next: "badWrongSafety" },
      { label: "再确认一次空杯的含义", next: "cupRiddle" },
    ],
  },

  teaCrack: {
    chapter: "茶铺",
    code: "04A",
    speaker: "旁白",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "“另一个人”这个说法让秋清的笑意断开。茶铺还是热闹的，可他忽然像被留在一张无声照片里。",
      "空杯轻轻转动，没有人碰它。你听见杯底刮过桌面的声音，像某种倒计时。",
      "你立刻闭嘴。这个问题把秋清从椅子上往后推了一点，也把空杯往前推了一点。",
    ],
    effects: { fragments: ["f4b"], stats: { lonely: 15, logic: 5 } },
    choices: [
      { label: "道歉，改问“你们如何互相理解”", next: "teaRecover", primary: true },
      { label: "继续追问，逼月兰山出来", next: "badForceYuelan", danger: true },
    ],
  },

  teaRecover: {
    chapter: "茶铺",
    code: "04B",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清沉默了很久，说：“你可以问。但别把他说成来抢东西的人。”",
      "他指了指空杯，又指了指自己的杯子。“这两只杯子不能同时被我拿着，可它们都在这张桌上。”",
      "你没有急着接话。秋清把茶喝掉一口，像把某个快要裂开的地方重新按住。",
    ],
    effects: { fragments: ["f5a"], flags: ["askedGently"], stats: { like: 6, logic: 6 } },
    choices: [{ label: "跟着秋清去旧路口", next: "roadStart", primary: true }],
  },

  roadStart: {
    chapter: "旧路",
    code: "05",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "旧路口没有路牌。只有一排灯，从城市边缘伸向更黑的地方。",
      "秋清停在第一盏灯下，说：“我只能陪你走到第七盏。之后如果有人叫你，不要回头。”",
      "你问为什么。他想了想，只说：“有些声音会借我的嗓子。它们最会挑你心软的时候。”",
    ],
    effects: { clues: ["road"], stats: { lonely: 8, logic: 6 } },
    choices: [
      { label: "沿着灯线慢慢往前数", next: "lampOne" },
      { label: "先检查路边废弃售票亭", next: "ticketBooth" },
      { label: "从第一盏就回头确认秋清还在不在", next: "badLookBack" },
      { label: "要求秋清把判断写在你手心", next: "badWrongSafety" },
    ],
  },

  ticketBooth: {
    chapter: "旧路",
    code: "05A",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "售票亭早就废弃，玻璃上贴着泛黄的夜班车时刻表。末班车一栏被划掉，旁边写着：无人时，不要把等待当陪伴。",
      "抽屉里有一枚硬币，正面刻着“秋”，背面刻着“月”。你把硬币立在桌面，它没有倒向任何一边，只是在暗处慢慢停住。",
      "售票亭最里面挂着一张小纸：第七盏灯后，所有声音都只算证词，不算身份。",
      "你把硬币放回原位。拿走它没有意义，理解它才有意义。",
    ],
    effects: { clues: ["road"], stats: { logic: 6, lonely: 4 } },
    choices: [
      { label: "离开售票亭，开始数路灯", next: "lampOne" },
      { label: "翻看夜班车时刻表背面", next: "ticketBoothBack" },
      { label: "把硬币带走当护身符", next: "badCoin" },
      { label: "在售票亭里等末班车", next: "badWaitingRoad" },
      { label: "回头喊秋清确认他还在", next: "badLookBack" },
    ],
  },

  ticketBoothBack: {
    chapter: "旧路",
    code: "05A-2",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "你把夜班车时刻表翻过来。背面密密麻麻写着同一句话，像有人练字练到手发抖。",
      "七盏灯后，所有声音都只算证词，不算身份。",
      "你把纸抚平，纸边割到指腹。疼痛来得很及时，让你没再往身后看。",
    ],
    effects: { fragments: ["f2b"], stats: { logic: 8, lonely: 2 } },
    choices: [
      { label: "把这页撕下来夹进手账", next: "lampOne", effects: { journals: ["j10"] } },
      { label: "不撕，只记住这句然后离开", next: "lampOne" },
      { label: "用售票亭的玻璃照一眼自己", next: "badBoothMirror", danger: true },
    ],
  },

  badBoothMirror: {
    chapter: "失败",
    code: "X-05A-2",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "unstable",
    text: [
      "玻璃上有一层看不见的油膜，你的影子被涂抹成两层。",
      "你以为那是你和秋清。可下一秒，两层影子都对着你开口：一个说“快说出来”，一个说“别说”。",
      "你突然意识到这不是镜子，它更像录音：它会把你最想听见的那一句复刻出来，逼你把唯一一次表白交给它。",
      "你后退时踩碎了那枚硬币。碎响像一个名字落地。怪谈得逞，灯光一下子暗下去。",
      "电话自动挂断。你被赶回起点：先经历，再复原。",
    ],
    ending: true,
    endingKind: "bad",
    endingTitle: "玻璃复刻",
    endingSummary: "你把唯一一句交给玻璃里的复刻声音，怪谈替你把路退回起点。",
    choices: endingChoices,
  },

  lampOne: {
    chapter: "旧路",
    code: "05B",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "第一盏灯下，影子还很清楚。秋清站在你身后几步外，没有说话，只用鞋尖轻轻碰了一下地面。",
      "第二盏灯下，风把路边树叶吹成细碎的响声。你听见有人在远处笑，但这条路没有岔口，也没有行人。",
      "第三盏灯下，手机屏幕自动亮起，弹出一条没有发件人的消息：现在说，还来得及。",
      "你按灭屏幕，继续往前。那几个字还留在视网膜上，像没擦干净的水印。",
    ],
    effects: { stats: { lonely: 5, logic: 5 } },
    choices: [
      { label: "继续数到第四盏和第五盏", next: "lampFour" },
      { label: "回复短信：我喜欢秋清", next: "badEarly", confession: true },
      { label: "把手机交给秋清保管", next: "badWrongSafety" },
      { label: "返回售票亭再查一遍纸条", next: "ticketBooth" },
    ],
  },

  lampFour: {
    chapter: "旧路",
    code: "05C",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "第四盏灯比前几盏更暗，灯罩里有一只早已死去的飞虫。它保持着扑向光的姿势，像某种过时的警告。",
      "第五盏灯下，背后的脚步停了。你没有回头，只听见秋清说：“如果我不跟上来，你会不会害怕？”",
      "你想回答会。舌尖已经碰到上颚，又被你硬生生压了回去。",
      "前方第六盏灯忽明忽暗，像有人正在用它眨眼。",
    ],
    effects: { fragments: ["f4b"], stats: { lonely: 8, logic: 6 } },
    choices: [
      { label: "不回答，继续走向第六盏灯", next: "lampSix" },
      { label: "回答“我害怕，所以我喜欢你”", next: "badLookBack", confession: true },
      { label: "停下等身后的脚步追上", next: "badWaitingRoad" },
      { label: "往售票亭方向退回一步", next: "ticketBooth" },
    ],
  },

  lampSix: {
    chapter: "旧路",
    code: "05D",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "第六盏灯下有一张被雨泡软的校医室挂号单，姓名栏被墨水糊住，诊断栏只剩四个字：压抑过度。",
      "你蹲下看它，身后的声音也蹲下来，几乎贴着你的耳侧说：“你看，他很需要你。”",
      "你差一点就回话。不是因为相信它，而是因为“需要”这两个字太会骗人。",
      "第七盏灯就在前方。它亮得不自然，像舞台上唯一留下的聚光。",
    ],
    effects: { clues: ["recorder"], fragments: ["f3a"], stats: { logic: 8, lonely: 8 } },
    choices: [
      { label: "站起来，走进第七盏灯", next: "seventhLamp" },
      { label: "对耳边的声音说“我会救你”", next: "badLookBack" },
      { label: "把挂号单撕碎", next: "badHalfTape" },
      { label: "在第六盏灯下原地等待", next: "badWaitingRoad" },
    ],
  },

  seventhLamp: {
    chapter: "旧路",
    code: "06",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "一、二、三。灯光把你的影子剪得越来越薄。",
      "四、五、六。秋清的脚步声在身后慢下来，你想回头，手账却在口袋里硌住掌心。",
      "第七盏灯亮起时，背后传来秋清的声音：“如果你真的喜欢我，现在说就好。”",
    ],
    effects: { fragments: ["f4b"], clues: ["noTurn"], journals: ["j2"], stats: { lonely: 18 } },
    choices: [
      { label: "不回头，称呼他月兰山", next: "meetYuelan", primary: true },
      { label: "回头对声音说“秋清，我喜欢你”", next: "badLookBack", danger: true, confession: true },
      { label: "背对声音说“月兰山，我爱你”", next: "badYuelanDirect", danger: true, confession: true },
    ],
  },

  meetYuelan: {
    chapter: "旧路",
    code: "07",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "背后的声音停了一下，像终于没必要演下去。",
      "一个人从灯影里走出来。还是那张脸，眼神却冷得多，连呼吸都像被尺子量过。",
      "“你没有回头。”他说，“很好。你至少还没把那句话交给这条路。”",
      "你把手从口袋里拿出来，空着。月兰山看了一眼，像是在确认你没有带刀，也没有带花。",
    ],
    effects: { fragments: ["f7a"], clues: ["noTurn"], stats: { logic: 12, lonely: 6 } },
    choices: [
      { label: "先确认他是否会伤害秋清", next: "yuelanTerms" },
      { label: "问他为什么替秋清活下来", next: "yuelanOrigin" },
      { label: "问他能不能代替秋清接受表白", next: "badAskSubstitute" },
      { label: "试着把他当成另一个陌生人安慰", next: "badSeparate" },
    ],
  },

  yuelanTerms: {
    chapter: "旧路",
    code: "07A",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "“伤害？”月兰山重复了一遍，像在检查这个词有没有放错位置。",
      "他看向来路。灯光一盏盏暗下去，茶铺、人声、秋清低头笑的样子，都被夜色慢慢盖住。",
      "“我来的时候，他不在。”月兰山说，“你不能趁他不在，把回答从我这里拿走。”",
      "他没有威胁你。正因为没有威胁，这句话反而更难越过去。",
    ],
    effects: { fragments: ["f10a"], stats: { logic: 8 } },
    choices: [
      { label: "继续问他的诞生经过", next: "yuelanOrigin" },
      { label: "追问他是否也想被爱", next: "badAskSubstitute" },
      { label: "要求他把秋清叫回来", next: "badSurrender" },
      { label: "沉默，等他自己继续说", next: "yuelanSilence" },
    ],
  },

  yuelanSilence: {
    chapter: "旧路",
    code: "07B",
    speaker: "旁白",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "你没有追问。夜路在沉默里变得更长，路灯像一串被拉直的脉搏。",
      "月兰山似乎认可了这种沉默。他说：“秋清不喜欢被人盯着看，好像只要看够久，就能找出哪里坏了。”",
      "“你也别那样看他。”",
      "你点头。这个动作很轻，却比解释更像回答。",
    ],
    effects: { stats: { like: 4, logic: 6 } },
    choices: [
      { label: "说明你要理解规则，不是利用规则", next: "yuelanOrigin" },
      { label: "承认自己只是想赢一次怪谈", next: "badEarly" },
      { label: "把话题转回表白能不能被接受", next: "badAskSubstitute" },
    ],
  },

  yuelanOrigin: {
    chapter: "旧路",
    code: "08",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "“那天没有人。”月兰山看向更深的路，“没有车，没有店，没有开着的窗口。”",
      "“秋清走到这里时，已经哭不出来了。人有时候不是崩溃才危险，是连崩溃都做不到。”",
      "他说自己先数路灯，再数呼吸，最后数还能不能把身体带回家。你把这句话写下时，纸面被夜风吹得发颤。",
    ],
    effects: { rules: [2], fragments: ["f2a", "f3a"], journals: ["j3"], clues: ["recorder"], stats: { logic: 12 } },
    choices: [
      { label: "问他为什么不爱任何人", next: "yuelanLove", primary: true },
      { label: "告诉他“那以后由你保护秋清就好”", next: "badSurrender", danger: true },
    ],
  },

  yuelanLove: {
    chapter: "旧路",
    code: "09",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "“爱太吵。”月兰山说，“也太容易让人误会自己有权利。”",
      "路灯闪了一下。他把后半句说得很低：“我只保留给秋清。”",
      "你没有把这当情话。它更像一条只通向一个人的窄路，冷，但没有退缩。",
    ],
    effects: { rules: [6], fragments: ["f6a", "f6b"], journals: ["j5"], stats: { logic: 10 } },
    choices: [
      { label: "沿旧路走到废弃公交站", next: "busStop" },
      { label: "回到镜室查两只杯子", next: "mirrorRoom" },
      { label: "趁他说“除了秋清”，立刻向月兰山表白", next: "badYuelanDirect", confession: true },
      { label: "请求月兰山替你保管唯一一次表白", next: "confessionDeposit" },
    ],
  },

  confessionDeposit: {
    chapter: "旧路",
    code: "09C",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "你把那句话说成“保管”。像把刀递给别人握着，自己只负责被保护。",
      "月兰山的视线落在你嘴唇上，停得很短：“我不替你握这个。”",
      "他伸手，从售票亭破窗里摸出一个空信封。纸是干的，却冷得像刚从水里捞起。",
      "“这里的寄存，只收走你一次判断。”他把信封放到你掌心，“你要是愿意轻一点，就会变得更轻——轻到什么都不剩。”",
    ],
    effects: { clues: ["deposit"], stats: { logic: 6, lonely: 4 } },
    choices: [
      { label: "收回那个请求，回到刚才的判断", back: true, primary: true },
      { label: "不封口，把那句话写在信封上，只当一次练习", next: "depositPractice" },
      { label: "封口交出去，让他替你决定时机", next: "badDeposit", danger: true },
    ],
  },

  depositPractice: {
    chapter: "旧路",
    code: "09D",
    speaker: "旁白",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "你把信封摊开。笔尖落下去时，夜风忽然静了，好像整条路都在等一个词。",
      "你写完那句话，却没有合上。纸在你掌心里微微发抖，像一只不肯被关住的眼睛。",
      "月兰山看了一眼，没评价，只把信封推回给你：“记住它的重量。别把重量交给任何人。”",
      "你这才意识到，这不是浪漫练习。它更像一次对怪谈的反击：你愿意承认自己会怕，但不愿把怕交出去。",
    ],
    effects: { fragments: ["f9c"], journals: ["j11"], stats: { like: 3, logic: 6 } },
    choices: [{ label: "把信封夹进手账，回到刚才的选择", back: true, primary: true }],
  },

  badDeposit: {
    chapter: "危险",
    code: "X13",
    speaker: "寄存台",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "unstable",
    text: [
      "你把信封封好递出去的那一刻，售票亭的玻璃像忽然有了呼吸。窗内伸出一只戴白手套的手，指尖很干净。",
      "它没有接信封，只按住你的指节，把你往前推半步。那半步像跨进另一个版本的夜路：更干净，更安静，更像“安全”。",
      "你听见有人替你把那句话念了一遍。声音不属于你，也不属于月兰山。它念得太顺，顺得像早就练过。",
      "月兰山皱眉：“别让它替你说。”可你的手已经空了。空得像从没拥有过那句话。",
    ],
    choices: [{ label: "把手从“安全”里抽回来，回到刚才的判断", back: true, primary: true }],
  },

  busStop: {
    chapter: "旧路",
    code: "09A",
    speaker: "旁白",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "废弃公交站的站牌早被雨水洗白，只剩一道月牙形裂缝。",
      "长椅上刻着两行字。第一行很深：不要让秋清一个人走完。第二行更浅：不要让月兰山永远替他走。",
      "月兰山站在站牌阴影里，没有催你。他似乎知道你需要时间，把“保护”和“替代”分开。",
      "你看了很久，才发现两行字不是互相反驳。它们更像同一个人留给自己的两次提醒。",
    ],
    effects: { clues: ["redThread"], stats: { logic: 8, like: 4 } },
    choices: [
      { label: "带着这条判断回镜室", next: "mirrorRoom" },
      { label: "在站牌下等待秋清也出现", next: "badTogether" },
      { label: "把站牌裂缝当作月兰山的告白提示", next: "badYuelanDirect", confession: true },
      { label: "退回旧路，重新选择下一步", back: true, primary: true },
    ],
  },

  mirrorRoom: {
    chapter: "镜室",
    code: "10",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "秋清的房间比你想象中整洁，整洁得像每件东西都被反复放回原位。桌上仍有两只杯子，一只有茶渍，一只干净得发冷。",
      "镜子背面贴着一张纸，字全是反的。你站到镜前，自己的脸被夹进那些倒写的句子里。",
      "纸上有红线，打结的位置正压住两个名字。线结不紧，却让人不敢剪。",
    ],
    effects: { clues: ["cups", "redThread"], fragments: ["f10a"], stats: { logic: 8 } },
    choices: [
      { label: "先检查抽屉里的旧照片", next: "drawerPuzzle" },
      { label: "解开镜面上的换位密码", next: "mirrorCipher" },
      { label: "剪断红线，强行取下纸条", next: "badBreakThread" },
      { label: "把两只杯子都倒满茶", next: "badTogether" },
    ],
  },

  drawerPuzzle: {
    chapter: "镜室",
    code: "10A",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "抽屉里有三张旧照片。第一张是秋清站在茶铺门口，背后灯很亮。第二张是无人夜路，路灯下没有人。第三张只有镜子，镜面里贴着红线。",
      "照片背面分别写着：能回来、能撑住、别并排。",
      "字很短，没有解释。你把照片按时间排，又按地点排，最后才发现它们真正记录的是谁能在那一刻留在场内。",
      "抽屉最底下还有一枚小钥匙，钥匙柄刻着“不要跳读”。",
    ],
    effects: { fragments: ["f4a", "f4b", "f10a"], stats: { logic: 8 }, clues: ["cups"] },
    choices: [
      { label: "用小钥匙打开镜框后的暗格", next: "mirrorBack" },
      { label: "只凭照片贸然下结论", next: "badBothNames", confession: true },
      { label: "把第二张夜路照片烧掉", next: "badEraseYuelan" },
      { label: "回到镜面红线，按方向解码", next: "mirrorCipher" },
    ],
  },

  mirrorBack: {
    chapter: "镜室",
    code: "10B",
    speaker: "暗格",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "暗格里没有长篇说明，只有一枚干枯的桂花和一张折成四折的纸。",
      "纸上画着两个圆。一个圆写“现在”，另一个圆写“我”。两个圆有一块重叠，重叠处没有名字，只涂了一层很淡的金色。",
      "图下写着：不要把承认误读成同场。",
      "你把图夹进手账。那层淡金色在纸页里亮了一下，又很快暗下去。",
    ],
    effects: { clues: ["redThread"], fragments: ["f9a", "f10a"], stats: { logic: 8 } },
    choices: [
      { label: "回到镜面红线，按方向解码", next: "mirrorCipher" },
      { label: "把两个圆合并成一个名字", next: "badSeparate" },
      { label: "把两个圆撕开成两个人", next: "badSeparate" },
    ],
  },

  mirrorCipher: {
    chapter: "镜室",
    code: "11",
    speaker: "镜子",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "红线不是封条，是一条很别扭的阅读顺序。它先绕过“秋清”，再绕过“月兰山”，最后回到“自己”。",
      "镜面一次只映出一个位置。你试着侧身，镜子里的空白也跟着侧过去，没有给第二个人让位。",
      "纸条在红线松开后露出完整句子：月兰山存在时，秋清不存在。秋清存在时，月兰山不存在。两个人格无法同时出现。",
    ],
    effects: { rules: [10], fragments: ["f10a"], journals: ["j4"], stats: { logic: 15 } },
    choices: [
      { label: "去旧校医室找月兰山的记录", next: "clinicCorridor" },
      { label: "把两只杯子并排，等两个人格同时出现", next: "badTogether" },
      { label: "留下来继续照镜子，直到另一个人出现", next: "badMirrorStare" },
      { label: "回看抽屉照片确认顺序", next: "drawerPuzzle" },
    ],
  },

  clinicCorridor: {
    chapter: "校医室",
    code: "11A",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "校医室在旧教学楼尽头。走廊里所有门牌都被拆掉，只有地上还残留浅浅的胶印。",
      "你从第一间走到最后一间，每扇门后都传来不同版本的秋清：有的在笑，有的在哭，有的把同一句话重复得毫无起伏。",
      "可真正的校医室没有声音。门缝里只有消毒水和旧纸的气味。",
      "你站在无声的门前，反而安心了一点。会主动招呼你的，未必是真的。",
    ],
    effects: { stats: { lonely: 8, logic: 8 }, clues: ["recorder"] },
    choices: [
      { label: "无视其他门，走向无声的校医室", next: "clinicDoor" },
      { label: "打开正在哭的那扇门", next: "badLookBack" },
      { label: "打开正在背规则的那扇门", next: "badPhoneLoop" },
      { label: "退回镜室重新确认照片顺序", next: "drawerPuzzle" },
    ],
  },

  clinicDoor: {
    chapter: "校医室",
    code: "12",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "旧校医室已经废弃。门上贴着过期封条，封条下面有一串数字：4-2-3-10。",
      "你先按编号试了一遍，锁没有动。数字像拒绝被当成谜语的病历号。",
      "直到你把它改成场景顺序：茶铺、夜路、旧病历、镜室。锁舌才轻轻一跳。",
    ],
    effects: { stats: { logic: 8 } },
    choices: [
      { label: "听完录音，不打断", next: "clinicTape", primary: true },
      { label: "只听开头就拔掉磁带", next: "badHalfTape", danger: true },
    ],
  },

  clinicTape: {
    chapter: "校医室",
    code: "13",
    speaker: "录音",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "磁带里的秋清声音很低。他说自己有时像被分成两层，一层还在应付别人，一层已经开始计算最近的出口。",
      "接着是另一道声音，平得像把所有哭腔都删掉了：“我没有把他赶走。我只是在他撑不住的时候接手。”",
      "录音最后，校医的笔尖在纸上停了很久，才写下那行判断：秋清没有坏掉；月兰山是沉下去的理性。",
    ],
    effects: { rules: [3], fragments: ["f3a", "f5a"], clues: ["recorder"], stats: { logic: 12 } },
    choices: [
      { label: "继续翻看校医留下的病例索引", next: "caseIndex" },
      { label: "回茶铺确认他们是否互相承认", next: "mutualWitness" },
      { label: "把月兰山当成病症，建议秋清消灭他", next: "badEraseYuelan" },
      { label: "只摘录“理性沉下”四个字就离开", next: "badHalfTape" },
    ],
  },

  caseIndex: {
    chapter: "校医室",
    code: "13A",
    speaker: "病例索引",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "病例索引没有姓名，只有三类标签：浮起、沉下、互认。",
      "“浮起”一栏夹着茶铺票据复印件。“沉下”一栏夹着夜路挂号单。“互认”一栏是空的，只放着一张请假条。",
      "请假条上写：秋清今日缺席。月兰山代为完成离校手续。签名处却只有一个笔迹。",
      "你盯着那个笔迹很久。它没有替你省事，只让事情更难说清。",
    ],
    effects: { fragments: ["f5a", "f9b"], stats: { logic: 8 }, clues: ["recorder"] },
    choices: [
      { label: "按请假条背面的借阅号去旧图书室", next: "libraryDoor" },
      { label: "带着请假条回茶铺求证", next: "mutualWitness" },
      { label: "把请假条当成两人完全相同的证明", next: "badSeparate" },
      { label: "撕掉请假条，假装月兰山不存在", next: "badEraseYuelan" },
      { label: "倒回磁带重新听断秒", next: "clinicTape" },
    ],
  },

  libraryDoor: {
    chapter: "旧图书室",
    code: "13B",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "请假条背面有一串借阅号：QL-09-10。旧图书室在教学楼另一侧，门把手上挂着一枚褪色木牌：归还处。",
      "你推门进去，灰尘在手电光里浮起，像一群没有落定的字。书架标签大多脱落，只剩“心理”“民俗”“失物”三类还能辨认。",
      "借阅号对应的书不在架上，登记卡却还留着。借书人一栏写着秋清，代还人一栏写着月兰山，日期相隔七天。",
      "同一张卡上有两个名字，墨水深浅不同，却没有谁把谁涂掉。",
    ],
    effects: { fragments: ["f9a", "f9b"], stats: { logic: 8 }, clues: ["redThread"] },
    choices: [
      { label: "查找那本被借走的书名", next: "libraryStacks" },
      { label: "把借阅卡当成两个人同时存在的证明", next: "badTogether" },
      { label: "只带走登记卡，立刻回茶铺求证", next: "mutualWitness" },
      { label: "打开失物柜寻找书", next: "lostCabinet" },
    ],
  },

  libraryStacks: {
    chapter: "旧图书室",
    code: "13C",
    speaker: "登记卡",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "登记卡背面写着书名：《夜间小路的十种走法》。你在书架间找到它的位置，那里空着，只夹着一张折角书签。",
      "书签上只有一句批注：别找最短路。最短路通常是别人替你修好的误会。",
      "你站在两排书架之间，忽然不那么急了。知道句子和懂得怎么说，中间还隔着很多人的沉默。",
      "书架尽头有一扇窄窗，窗外正对旧路方向。白天看去，那条路普通得几乎可笑。",
    ],
    effects: { stats: { logic: 6, like: 4 }, journals: ["j7"] },
    choices: [
      { label: "把书签夹进手账，再查失物柜", next: "lostCabinet" },
      { label: "忽略批注，只记最后一句", next: "badBothNames", confession: true },
      { label: "回茶铺把借阅记录给秋清看", next: "mutualWitness" },
      { label: "去窗边观察旧路", next: "windowRoad" },
    ],
  },

  windowRoad: {
    chapter: "旧图书室",
    code: "13D",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "none",
    text: [
      "白天的旧路没有怪声，没有第七盏灯，也没有逼你回头的声音。",
      "它甚至有点无聊：墙根有苔，电线垂着，远处便利店门口有人搬汽水。",
      "可你想起夜里那排灯，想起秋清说“越像我，越别信”。同一条路在不同时间里，像两个完全不同的房间。",
      "你把“地点”两个字划掉，改写成“场面”。要选的不是浪漫，是谁能留在场面里。",
    ],
    effects: { fragments: ["f4b"], stats: { logic: 8 } },
    choices: [
      { label: "回到失物柜继续找书", next: "lostCabinet" },
      { label: "决定改在旧路白天表白", next: "badFinalRoad" },
      { label: "带着场景判断回茶铺", next: "mutualWitness" },
    ],
  },

  lostCabinet: {
    chapter: "旧图书室",
    code: "13E",
    speaker: "失物柜",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "失物柜里没有那本书，只有一条旧围巾、一枚断掉的笔帽、半张未寄出的明信片。",
      "明信片上写着：如果哪天我忘了怎么回来，就让月兰山先把我带到有人的地方。",
      "落款没有名字。字迹却和请假条一样。你把明信片放回去，没有拿走。",
      "你只抄下“有人的地方”。这五个字不像线索，更像秋清给自己留的一根绳。",
    ],
    effects: { stats: { like: 6, logic: 6 }, clues: ["tea"] },
    choices: [
      { label: "不拿走明信片，只带走抄录内容", next: "mutualWitness" },
      { label: "把明信片据为己有", next: "badPrivateCard" },
      { label: "继续找那本不存在的书", next: "badWaitingRoom" },
      { label: "去窗边再看一次旧路", next: "windowRoad" },
    ],
  },

  mutualWitness: {
    chapter: "茶铺",
    code: "14",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清听完你的复述，没有躲开月兰山的名字。",
      "“他不是外人。”秋清说，“可我也不是他的一层皮。”",
      "他把空杯拿起来，又放下。“这样说很麻烦，对吧？但不麻烦的话，就会有人偷懒。”",
      "你在手账里写下：互相理解，互相承认。笔画很慢，像怕写快了就把边界写糊。",
    ],
    effects: { rules: [5], fragments: ["f5a"], stats: { joy: 10, like: 10 } },
    choices: [
      { label: "帮秋清把祭灯写上名字", next: "lanternErrand" },
      { label: "参加祭灯前的试胆局", next: "paperDoor" },
      { label: "告诉秋清你只喜欢没有月兰山的他", next: "badHalfLove" },
      { label: "追问他到底更想成为哪一个名字", next: "badHalfLove" },
    ],
  },

  lanternErrand: {
    chapter: "祭灯前",
    code: "14A",
    speaker: "旁白",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "祭灯摊前，人们把愿望写在薄纸上。秋清迟迟没有下笔。",
      "你问他要写什么。他说：“写太满会沉，写太空又像没有来过。”",
      "最后他只写了一个“回”字。不是回来见你，也不是回到从前，而是回到能由自己回答的时刻。",
      "你看着那个字被灯火照透，忽然明白自己不能把最后一句说成索取，也不能说成救援。",
    ],
    effects: { stats: { joy: 10, like: 8 }, journals: ["j8"] },
    choices: [
      { label: "把祭灯交给摊主，参加试胆局", next: "paperDoor" },
      { label: "在他的祭灯上添写自己的名字", next: "badQiuqingDirect", confession: true },
      { label: "建议他写下月兰山的名字", next: "badHalfLove" },
      { label: "不参加试胆局，直接去祭灯夜", next: "badRuleSort" },
    ],
  },

  paperDoor: {
    chapter: "试胆局",
    code: "15",
    speaker: "旁白",
    bg: ASSETS.festival,
    persona: "none",
    text: [
      "祭灯夜前，街坊把旧仓库改成试胆局。入口有三道纸门：无人路、双人房、人声处。",
      "门上的说明很短：选错地方，说什么都晚。",
      "排队的人在笑，手里的糖纸被捏得沙沙响。只有你知道，这三道门里有两道不是门，是陷阱。",
    ],
    effects: { journals: ["j8"], stats: { logic: 8 } },
    choices: [
      { label: "推开写着“人声”的纸门", next: "crowdDoor" },
      { label: "推开写着“无人路”的纸门", next: "badFinalRoad" },
      { label: "推开写着“双人房”的纸门", next: "badFinalRoom" },
      { label: "三道门都不选，站在原地等提示", next: "badWaitingFestival" },
    ],
  },

  crowdDoor: {
    chapter: "试胆局",
    code: "16",
    speaker: "旁白",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "纸门后不是鬼屋，是一条热闹的街。灯笼、茶摊、孩子的笑声、木牌敲击声，全都真实得有点过分。",
      "秋清站在人群边缘，肩膀没有在夜路上那样绷紧。他听见旁边小孩把灯谜念错，眼尾轻轻动了一下。",
      "你看见他被这些细小的人声留住。不是治好，不是变快乐，只是暂时不用退到更深的地方。",
    ],
    effects: { rules: [4], fragments: ["f4a", "f4b"], stats: { joy: 18, like: 8 } },
    choices: [
      { label: "把三张残页送到档案桌上", next: "archiveTable" },
      { label: "直接凭直觉猜拒绝条件", next: "badRuleSort" },
      { label: "先去看试胆局出口的告示", next: "exitNotice" },
    ],
  },

  exitNotice: {
    chapter: "试胆局",
    code: "16A",
    speaker: "出口告示",
    bg: ASSETS.festival,
    persona: "none",
    text: [
      "出口告示写着：离开前，请确认你知道自己在避开什么。",
      "下面贴着三张小票：避开孤独、避开含混、避开直接。",
      "避开孤独的小票沾着雨。避开含混的小票被折过两次。避开直接的小票最干净，像从来没人认真看它。",
      "你把三张小票夹进手账。它们不替你说话，只替你拦住几种冲动。",
    ],
    effects: { stats: { logic: 6 } },
    choices: [
      { label: "回到档案桌整理残页", next: "archiveTable" },
      { label: "只记住“避开直接”，准备绕口表白", next: "badBothNames" },
      { label: "只记住“避开孤独”，准备在人群里对秋清表白", next: "badQiuqingDirect" },
    ],
  },

  archiveTable: {
    chapter: "拒绝条件",
    code: "16B",
    speaker: "档案桌",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "档案桌上有三只木匣。第一只刻着“谁在场”，第二只刻着“谁说话”，第三只刻着“说给谁”。",
      "你把月兰山的残页放进第一只木匣，木匣合上。你把秋清的残页放进第三只木匣，木匣没有合上。",
      "你重新读残页，才发现秋清那张不是在问谁开口，而是在问这句话落到谁身上。",
      "木匣扣住时，声音很轻。轻得像一个人终于没有被叫错名字。",
    ],
    effects: { clues: ["wording"], stats: { logic: 10 } },
    choices: [
      { label: "正式按拒绝条件排序", next: "sortRefusals" },
      { label: "把秋清残页放回“谁在场”", next: "badRuleSort" },
      { label: "把月兰山残页放进“说给谁”", next: "badRuleSort" },
      { label: "跳过排序，直接去祭灯夜", next: "badRuleSort" },
    ],
  },

  sortRefusals: {
    chapter: "拒绝条件",
    code: "17",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "三张残页分别写着：月兰山出现时、秋清出现时、两人格同时出现。",
      "第三张已经被镜子划掉。剩下两张长得很像，像两枚差一点就会放错的药片。",
      "你把它们隔开一指宽。就是这一指宽，决定最后那句话能不能活着落地。",
    ],
    effects: { clues: ["wording"], journals: ["j6"], stats: { logic: 10 } },
    choices: [
      { label: "把月兰山残页放在“表白本身被拒绝”下", next: "unlockSeven" },
      { label: "把月兰山残页放在“只拒绝对月兰山”下", next: "badRuleSort" },
    ],
  },

  unlockSeven: {
    chapter: "拒绝条件",
    code: "18",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "残页亮起第七条原文：当只有月兰山出现时，他不会接受任何人的表白。",
      "你想起第七盏灯下那句“现在说就好”。原来那不是催促，是陷阱已经摆好姿势。",
      "只要月兰山独自站在那里，表白这件事本身就进不了门。",
    ],
    effects: { rules: [7], fragments: ["f7a"], stats: { logic: 10 } },
    choices: [
      { label: "把秋清残页放在“对秋清的表白被拒绝”下", next: "unlockEight" },
      { label: "把秋清残页放在“任何人的表白都被拒绝”下", next: "badRuleSort" },
    ],
  },

  unlockEight: {
    chapter: "拒绝条件",
    code: "19",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "第八条从灰里补全：当只有秋清出现时，秋清不会接受任何对他的表白。",
      "你把“对他”两个字圈了两遍。它们太小，小到像故意藏在句子里。",
      "第七条挡住的是表白本身。第八条挡住的是对象。你第一次看见门缝。",
    ],
    effects: { rules: [8], fragments: ["f8a"], stats: { logic: 10 } },
    choices: [
      { label: "把红线结放在“互认为自己”旁边", next: "unlockNine" },
      { label: "把红线结剪开，分成两个无关名字", next: "badSeparate" },
      { label: "把镜子图放在“可以同时出现”旁边", next: "badTogether" },
    ],
  },

  unlockNine: {
    chapter: "自我认知",
    code: "20",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "红线结、两只杯子、镜子背面的图，在这一刻慢慢贴合。",
      "第九条补全：秋清认为月兰山是自己。月兰山也认为秋清是自己。但这不影响他们对自己的认知。",
      "你没有立刻高兴。这个句子太锋利，拿错一点就会伤人。",
    ],
    effects: { rules: [9], fragments: ["f9a", "f9b"], journals: ["j7"], stats: { logic: 12 } },
    choices: [
      { label: "用第九条解释第一条的空白", next: "selfBridge" },
      { label: "把第九条当作可以同时表白的许可", next: "badTogether" },
      { label: "把第九条当作月兰山会接受表白的许可", next: "badYuelanDirect", confession: true },
    ],
  },

  selfBridge: {
    chapter: "自我认知",
    code: "20A",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "你把第一条空白和第九条放在同一页。红线从“喜欢他”绕到“自己”，又绕回秋清的名字。",
      "这不是甜言蜜语能解决的事。它像一座很窄的桥，桥下全是已经试过会错的句子。",
      "桥只在秋清在场时能走。月兰山若独自出现，路就断；你若直接叫秋清，路也断。",
      "你把笔停在纸上，终于不再写多余的解释。",
    ],
    effects: { stats: { logic: 10 }, clues: ["final"] },
    choices: [
      { label: "补全第一条的原文", next: "unlockOne" },
      { label: "把这座桥画成两个人同时在场", next: "badTogether" },
      { label: "把这座桥解释成不用尊重月兰山", next: "badHalfLove" },
      { label: "暂时合上手账，直接进入祭灯夜", next: "badRuleSort" },
    ],
  },

  unlockOne: {
    chapter: "最后空白",
    code: "21",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清把手账推回给你，最后一条空白终于显出字迹：秋清只会爱上“喜欢他”的人。",
      "他没有问你喜不喜欢他，只把那页按平，像按住一阵突然起来的风。",
      "“别把我写成结论。”他说，“我现在坐在这里。你先看见这个。”",
    ],
    effects: { rules: [1], fragments: ["f1a"], stats: { joy: 10, like: 12 } },
    choices: [
      { label: "把最后一句写进手账", next: "finalPlan", primary: true, requiresRules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ],
  },

  finalPlan: {
    chapter: "灯前折页",
    code: "22",
    speaker: "手账",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "你写下地点：祭灯夜，人声处。",
      "你写下要避开的三件事：无人夜路，封闭房间，秋清的名字。",
      "最后你写下那句话。写完以后，你把纸折起来，没有念。",
    ],
    effects: { flags: ["hasFinalPlan"], clues: ["final"], journals: ["j9"], stats: { logic: 10 } },
    choices: [
      { label: "先进行一次无声演练", next: "silentRehearsal", requires: ["hasFinalPlan"] },
      { label: "进入祭灯夜", next: "festivalThreshold", requires: ["hasFinalPlan"] },
      { label: "临时改去无人夜路", next: "badFinalRoad" },
      { label: "临时改成只约秋清到房间里", next: "badFinalRoom" },
    ],
  },

  silentRehearsal: {
    chapter: "灯前折页",
    code: "22A",
    speaker: "旁白",
    bg: ASSETS.mirror,
    persona: "none",
    text: [
      "你对着镜子演练，但不出声。嘴唇只动到第一个字就停下。",
      "镜中人没有替你说完。它只是把三个影子摆在你身后：夜路、空杯、秋清低头笑的样子。",
      "你没有把它们赶走，只把它们放回各自的位置。",
      "最后镜子里只剩祭灯夜远远传来的喧哗。你知道自己可以去了。",
    ],
    effects: { stats: { logic: 6, like: 4 } },
    choices: [
      { label: "进入祭灯夜", next: "festivalThreshold" },
      { label: "演练时忍不住说出秋清的名字", next: "badQiuqingDirect", confession: true },
      { label: "演练时试着同时叫两个名字", next: "badBothNames", confession: true },
    ],
  },

  festivalThreshold: {
    chapter: "祭灯前",
    code: "22B",
    speaker: "摊主",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "试胆局出口的摊主递来一支未点燃的引火签，说：“灯要自己点，别人只能借火。”",
      "秋清在人群边等你，没有靠过来，也没有退远。你看见他手里的杯子被灯色照暖，才把脚步放慢。",
      "引火签尾端有一道刻痕：说出口以前，别把句子交给纸、火或人群。",
      "你把签子横在手账边，终于分清准备和托付。准备让你更稳，托付会让怪谈替你开口。",
    ],
    effects: { clues: ["borrowedFlame"], stats: { logic: 6, like: 4 } },
    choices: [
      { label: "把借来的火交还摊主", next: "finalFestival", primary: true },
      { label: "把引火签多握一会儿，听它自己安静", next: "badBorrowedFlame", danger: true },
      { label: "把最后一句先写上灯纸", next: "badWrittenConfession", danger: true, confession: true },
    ],
  },

  badBorrowedFlame: {
    chapter: "危险",
    code: "X20A",
    speaker: "引火签",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你没有立刻还火。竹签上的小火苗贴着纸边站稳，像一个很轻的点头。",
      "它开始替你省略呼吸，替你把句子排成顺口的样子。顺到你几乎不用再判断。",
      "秋清在人群边抬眼，先看火，再看你的手。那一眼很短，却把你拉回掌心：借来的东西一旦替你稳住，就会顺手替你开口。",
    ],
    effects: { stats: { logic: 4, lonely: 4 } },
    choices: [
      { label: "把火还回摊主，回到灯前", back: true, primary: true },
      { label: "让火苗替你把第一个字点出来", next: "endingBorrowedFlame", confession: true },
    ],
  },

  finalFestival: {
    chapter: "祭灯夜",
    code: "23",
    speaker: "旁白",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "灯笼一盏盏升起来。秋清站在人群边，手里捧着那只常用的杯子。空杯没有带来。",
      "有人在旁边猜错灯谜，摊主笑着敲木牌。秋清也跟着弯了弯眼睛，幅度很小，却够你确认他还在。",
      "你走到他能听见、也能后退的位置。夜路没有跟来，空杯也没有跟来。",
    ],
    effects: { flags: ["qiuqingPresentFinal"], stats: { joy: 20, like: 10 } },
    choices: [
      { label: "从第一盏灯开始巡夜", next: "sixHourWatch", primary: true },
      { label: "再回头看一遍拒绝条件", next: "finalRuleRecap" },
    ],
  },

  sixHourWatch: {
    chapter: "六时巡灯",
    code: "23C",
    speaker: "摊主",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "摊主把一张折成六格的巡灯表递给你，说祭灯夜真正长的不是路，是等一个人不再被催促。",
      "六格分别写着：借火、回温、认路、对账、照镜、留白。每一格都要盖一枚很淡的朱印，印章轻得像怕惊动谁。",
      "秋清站在摊边，没有问为什么还不能说。你也没有解释。你们一起把那句即将到来的话，先放进足够长的时间里。",
    ],
    effects: { flags: ["sixHourWatchStarted"], clues: ["sixHourRoute"], journals: ["j13"], stats: { logic: 8, like: 4 } },
    choices: [
      { label: "盖下第一格“借火”", next: "hourOneBorrowedFire", primary: true },
      { label: "说已经够了，直接开口", next: "badFestivalShortcut", danger: true, confession: true },
      { label: "把巡灯表交给秋清替你保管", next: "badCrowdReceipt", danger: true },
    ],
  },

  hourOneBorrowedFire: {
    chapter: "六时巡灯",
    code: "23C-1",
    speaker: "你",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第一小时，你只做一件事：确认借来的东西都已经还回去。火签还给摊主，纸灯挂回竹架，别人递来的祝词也放回祝词篮。",
      "秋清看着你把每一件东西归位，忽然说：“你现在比刚才慢很多。”",
      "你回答：“慢一点，才知道哪些是我的声音。”这句话没有触发任何机关，只让巡灯表上第一格微微变红。",
    ],
    effects: { flags: ["hourFireReturned"], clues: ["crowdReceipt"], journals: ["j13"], stats: { logic: 6, like: 3 } },
    choices: [
      { label: "去热茶摊完成第二小时", next: "hourTwoWarmth", primary: true, requires: ["hourFireReturned"] },
      { label: "收下一篮祝词，让它们替你壮胆", next: "badBorrowedBlessings", danger: true },
    ],
  },

  badBorrowedBlessings: {
    chapter: "歧路",
    code: "W7",
    speaker: "祝词篮",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把祝词篮抱在怀里，纸条轻轻摩擦，像许多人替你练习呼吸。",
      "它们写得太顺了：愿你如愿，愿他回头，愿爱有回应。顺到你差一点忘记，那些愿望不是秋清的回答。",
      "秋清的目光落在篮子上，又移开。你知道这不是责备，是提醒：借来的祝福也可能变成借来的嘴。",
    ],
    choices: [
      { label: "把祝词篮还回去，重新从第一格开始", back: true, primary: true },
      { label: "留下最顺口的一张，替自己开场", next: "endingBorrowedBlessings", confession: true },
    ],
  },

  hourTwoWarmth: {
    chapter: "六时巡灯",
    code: "23C-2",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第二小时在热茶摊。老板娘认出秋清，给他添了一点桂花蜜，又给你一杯白水。",
      "秋清说：“你可以喝茶，不用陪我喝白水。”",
      "你摇头。温暖已经足够多了，多到你必须把它留在杯子里，而不是拿来证明自己已经被允许。",
      "巡灯表第二格落下朱印。它不是奖励，只是一条提醒：快乐能把秋清留在场内，却不能替他答应任何事。",
    ],
    effects: { flags: ["hourWarmthChecked"], journals: ["j14"], stats: { joy: 10, logic: 5, like: 5 } },
    choices: [
      { label: "核对茶摊账单上的三道水圈", next: "hourTwoCupLedger", primary: true },
      { label: "趁他笑时把话说出来", next: "badWarmShortcut", danger: true, confession: true },
    ],
  },

  hourTwoCupLedger: {
    chapter: "六时巡灯",
    code: "23C-2B",
    speaker: "茶摊账单",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "老板娘把账单压在杯底，纸面被热气烘得微微卷起。上面有三道水圈：一深、一浅、一处没有落下。",
      "深的那道圈在秋清杯下。浅的那道圈在你面前。空着的地方旁边写着两个小字：回答。",
      "秋清看见那两个字，手指停在杯沿，没有替你把账单转向任何人。",
      "你把空栏留下，只在账单背面写：今晚有人声，有热茶，秋清在场。",
    ],
    effects: { flags: ["hourTeaLedgerChecked"], clues: ["teaLedger"], journals: ["j19"], stats: { logic: 7, like: 3 } },
    choices: [
      { label: "把空白栏留给秋清自己", next: "hourThreeRoadEdge", primary: true, requires: ["hourTeaLedgerChecked"] },
      { label: "请老板娘替你证明秋清已经答应", next: "badTeaWitness", danger: true },
    ],
  },

  badTeaWitness: {
    chapter: "歧路",
    code: "W8A",
    speaker: "茶摊账单",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把账单推给老板娘，问她能不能替你盖个章，证明秋清刚才没有拒绝。",
      "老板娘的手悬在印泥上方，迟迟没有落下。她只是看见两个人喝过茶，没有看见一颗心被交出去，也没有看见另一颗心答复。",
      "秋清低头吹开杯面热气。那口气很轻，却把你从旁人的见证里吹回桌边。",
    ],
    choices: [
      { label: "把账单收回，留住空栏", back: true, primary: true },
      { label: "坚持让旁人证明这就是准许", next: "endingTeaWitness", confession: true },
    ],
  },

  badWarmShortcut: {
    chapter: "歧路",
    code: "W8",
    speaker: "茶摊热气",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你几乎在他笑起来的时候开口。热气把那一瞬间烘得很软，软到像已经得到回应。",
      "杯沿轻轻一响，秋清的手停住。不是拒绝，也不是接受，只是把你从错觉里叫醒。",
      "快乐不是钥匙。它只是让门口亮一点，让你看清自己还没有敲门。",
    ],
    choices: [
      { label: "把话咽回去，等热气散开", back: true, primary: true },
      { label: "把笑意当作回答", next: "endingWarmShortcut", confession: true },
    ],
  },

  hourThreeRoadEdge: {
    chapter: "六时巡灯",
    code: "23C-3",
    speaker: "旁白",
    bg: ASSETS.night,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第三小时，你们没有回无人旧路，只站在祭灯夜能照到的边缘。",
      "远处那排路灯仍然按旧顺序亮着，像一条被关在场外的证词。第七盏之后，有人声从暗处挤出来，喊得像极了秋清。",
      "秋清就在你身边，手里有热杯，影子也在灯下。你第一次不用靠恐惧证明他是真的。",
    ],
    effects: { flags: ["hourRoadWitnessed"], journals: ["j15"], stats: { logic: 8, lonely: -4 } },
    choices: [
      { label: "只把旧路当证词，不回应暗处人声", next: "hourFourLedger", primary: true },
      { label: "回头确认暗处是不是另一个秋清", next: "badRoadEcho", danger: true },
    ],
  },

  badRoadEcho: {
    chapter: "歧路",
    code: "W9",
    speaker: "暗处人声",
    bg: ASSETS.night,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你回头的一瞬间，祭灯夜的喧闹被拉得很远。暗处的人声熟悉到让你心口发酸。",
      "可秋清明明在你身边。你看见两个位置同时向你索要判断，才明白怪谈仍然在尝试把“像”伪装成“是”。",
      "你闭上眼，数到第七盏灯熄灭，又重新睁开。",
    ],
    choices: [
      { label: "回到灯下，把暗处人声记为证词", back: true, primary: true },
      { label: "追进暗处问清楚", next: "endingRoadEcho" },
    ],
  },

  hourFourLedger: {
    chapter: "六时巡灯",
    code: "23C-4",
    speaker: "旧账桌",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第四小时，摊主把你们带到旧账桌前。桌上摆着两只杯子、三张票根、四枚朱印和一张没有署名的收据。",
      "题目很简单：把“谁在场”与“谁被提及”分开。杯子可以有两只，在场的人只能有一个。",
      "秋清伸手把没有署名的收据推向你，又在半路停住。他没有替你放到任何一栏。",
    ],
    effects: { flags: ["hourLedgerStarted"], clues: ["crowdReceipt"], journals: ["j16"], stats: { logic: 8 } },
    choices: [
      { label: "按在场者整理票根和杯子", next: "hourFourLedgerSolved", primary: true },
      { label: "按名字好听的顺序摆放", next: "badLedgerPoetic", danger: true },
    ],
  },

  badLedgerPoetic: {
    chapter: "歧路",
    code: "W10",
    speaker: "旧账桌",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把票根摆成一个漂亮的环。它看起来像答案，甚至像某种祝福。",
      "可漂亮没有承担任何判断。杯子和名字被混在一起，朱印全都变淡，像被雨淋过。",
      "秋清没有碰你的手，只说：“这个摆法很好看。”好看，正是它危险的地方。",
    ],
    choices: [
      { label: "拆掉圆环，重新按在场者整理", back: true, primary: true },
      { label: "保留漂亮的摆法", next: "endingLedgerPoetic" },
    ],
  },

  hourFourLedgerSolved: {
    chapter: "六时巡灯",
    code: "23C-4B",
    speaker: "你",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "你把票根按时间排，把杯子按主人排，把收据留在空栏。",
      "空栏旁边写着：没有证据时，不许用愿望补齐。秋清看完这行字，轻轻把收据压住，像压住一阵要吹乱纸页的风。",
      "第四格朱印落下。它比前几格都重，重到巡灯表微微弯了一下。",
    ],
    effects: { flags: ["hourLedgerSolved"], stats: { logic: 8, like: 4 } },
    choices: [
      { label: "去镜摊完成第五小时", next: "hourFiveMirror", primary: true },
    ],
  },

  hourFiveMirror: {
    chapter: "六时巡灯",
    code: "23C-5",
    speaker: "裂镜",
    bg: ASSETS.mirror,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第五小时在镜摊。摊主说这面镜子只照边界，不照愿望。",
      "你和秋清站在镜前。裂纹把灯火切成许多段，却没有把他切成两个人。偶尔有一道冷光从他眼底沉下去，又被人声慢慢托回来。",
      "你没有伸手去擦裂纹。裂纹不是脏东西，它只是让你看见：同一副身体里，也不能让两个名字同时替你承担一句话。",
    ],
    effects: { flags: ["hourMirrorChecked"], clues: ["mirrorStall"], journals: ["j17"], stats: { logic: 8, like: 4 } },
    choices: [
      { label: "把裂纹记下来，不要求它合上", next: "hourSixBlank", primary: true },
      { label: "对着镜子同时叫出两个名字", next: "badMirrorMerge", danger: true, confession: true },
    ],
  },

  badMirrorMerge: {
    chapter: "歧路",
    code: "W11",
    speaker: "裂镜",
    bg: ASSETS.mirror,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "两个名字同时落进镜子里。裂纹没有合上，反而把你的声音切成更多份。",
      "你听见每一份都很真诚。问题正是它们都太真诚了，真诚到忘记谁此刻能听见，谁此刻不在。",
      "秋清的倒影往后退了半步，现实里的他没有动。你终于分清哪一个动作属于镜子。",
    ],
    choices: [
      { label: "停止叫名，回到第五格朱印前", back: true, primary: true },
      { label: "继续让镜子合并两个名字", next: "badBothNames", confession: true },
    ],
  },

  hourSixBlank: {
    chapter: "六时巡灯",
    code: "23C-6",
    speaker: "手账",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第六小时，你们回到人群边缘。巡灯表只剩最后一格，格子里什么都没写。",
      "秋清问：“这格也是题目吗？”",
      "你说：“是留白。”",
      "留白不是沉默。它是把答案的位置空出来，不让怪谈、祝词、人群、镜子或你自己的恐惧提前填进去。",
    ],
    effects: { flags: ["sixHourWatchComplete"], journals: ["j18"], stats: { logic: 10, like: 6, joy: 4 } },
    choices: [
      { label: "把六格巡灯表收进手账", next: "hourSevenArchiveWind", primary: true, requires: ["sixHourWatchComplete"] },
      { label: "在留白格里先写下“他会同意”", next: "badBlankAnswer", danger: true },
      { label: "在留白格里先写下“他会拒绝”", next: "badBlankRefusal", danger: true },
    ],
  },

  badFestivalShortcut: {
    chapter: "歧路",
    code: "W12",
    speaker: "巡灯表",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你跳过六格巡灯表，直接把最后一句推到舌尖。",
      "这一刻并不勇敢，只是快。快到借火、温暖、旧路、账桌、裂镜和留白全都来不及归位。",
      "秋清看着你，眼神很清醒。清醒让你更难受，因为你知道自己差一点把所有准备都变成了催促。",
    ],
    choices: [
      { label: "退回巡灯表前，承认自己太急", back: true, primary: true },
      { label: "不等了，现在就说", next: "endingFestivalShortcut", confession: true },
    ],
  },

  badCrowdReceipt: {
    chapter: "歧路",
    code: "W13",
    speaker: "人群回执",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把巡灯表交给秋清。这个动作看起来像信任，落下去却像托付。",
      "秋清没有接稳。不是因为他不愿意，而是这张表本来就不该由他替你保管。",
      "你看见纸面上的六个空格同时变浅，像六个被提前放弃的小时。",
    ],
    choices: [
      { label: "把巡灯表拿回来，自己走完六格", back: true, primary: true },
      { label: "坚持让秋清替你决定", next: "endingCrowdReceipt" },
    ],
  },

  badBlankAnswer: {
    chapter: "歧路",
    code: "W14",
    speaker: "留白格",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你在留白格里写下“他会同意”。字还没干，就开始替秋清变得温柔。",
      "这份温柔不是他的。它是你害怕之后写给自己的安慰。",
      "你把笔尖停住，忽然发现最难的尊重不是接受拒绝，而是不提前占用同意。",
    ],
    choices: [
      { label: "擦掉答案，把留白还给秋清", back: true, primary: true },
      { label: "带着预设的同意继续开口", next: "endingBlankAnswer", confession: true },
    ],
  },

  badBlankRefusal: {
    chapter: "歧路",
    code: "W15",
    speaker: "留白格",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你写下“他会拒绝”，像先给自己披上一件不会被伤到的外套。",
      "可那不是克制。那只是抢先把秋清的回答变成你的防御。",
      "灯火从纸背透上来，照得那四个字很薄。薄到你终于敢承认，害怕不是证据。",
    ],
    choices: [
      { label: "擦掉拒绝，把留白还给现场", back: true, primary: true },
      { label: "带着预设的拒绝闭口离开", next: "endingBlankRefusal" },
    ],
  },

  hourSevenArchiveWind: {
    chapter: "十二时守灯",
    code: "23D-7",
    speaker: "档案摊",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第七小时，祭灯夜的风从档案摊后面吹来，把刚收好的六格巡灯表掀开。",
      "摊主没有伸手拦，只把一只镇纸推到你面前。镇纸下面压着散页：茶摊账单、旧路票根、裂镜拓印、没有署名的收据。",
      "秋清帮你按住最上面那张，却没有替你排序。纸页乱得像一个答案正在假装自己早就存在。",
      "你把镇纸压在页角，先按发生顺序整理，而不是按哪一页最像结论整理。",
    ],
    effects: { flags: ["twelveHourWatchStarted"], clues: ["archiveDraft"], journals: ["j20"], stats: { logic: 8, like: 3 } },
    choices: [
      { label: "把风吹乱的页码按发生顺序夹回去", next: "hourEightNameLedger", primary: true, requires: ["twelveHourWatchStarted"] },
      { label: "只留下最像结论的那一页", next: "badArchiveShortcut", danger: true, mistakeTag: "evidence-shortcut" },
    ],
  },

  badArchiveShortcut: {
    chapter: "歧路",
    code: "W16",
    speaker: "档案摊",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你抽出最像结论的那一页。它写得太完整，完整到不需要秋清在场，也不需要你继续确认。",
      "风立刻停了。停得很假，像怪谈终于等到你愿意用一张纸替整夜收尾。",
      "秋清松开手，散页从他指尖滑下去。你看见自己并没有变勇敢，只是把剩下的时间折进了纸缝。",
    ],
    choices: [
      { label: "把那页放回去，重新整理散页", back: true, primary: true },
      { label: "带着单页走向最后的灯", next: "endingArchiveShortcut" },
    ],
  },

  hourEightNameLedger: {
    chapter: "十二时守灯",
    code: "23D-8",
    speaker: "分栏名册",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第八小时，旧账桌换成一册薄名册。左栏写着“秋清”，右栏写着“月兰山”，中间还有一栏空着：当下在场者。",
      "空栏不是要你二选一。它只是提醒你：同一个身体里的互认，不能被写成同一时间的联名。",
      "秋清看着那册名册，忽然很轻地说：“这次不要替我把名字省掉。”",
      "你把两个名字分栏登记，又在中间写下：此刻，秋清在场。",
    ],
    effects: { flags: ["nameLedgerSplit"], clues: ["nameLedger"], journals: ["j21"], stats: { logic: 8, like: 5 } },
    choices: [
      { label: "把两个名字分栏登记，不合成签名", next: "hourNinePaperBridge", primary: true, requires: ["nameLedgerSplit"] },
      { label: "把两栏合成一个联名签名", next: "badJointSignature", danger: true, mistakeTag: "merged-presence" },
    ],
  },

  badJointSignature: {
    chapter: "歧路",
    code: "W17",
    speaker: "联名签条",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把两栏线条拉到一起，写成一枚漂亮的联名签名。",
      "笔画刚合上，名册就显得轻松很多。轻松到像已经替你把最难分清的部分全部省掉。",
      "秋清的指尖停在纸边。他没有把纸撕掉，只是问：“如果这样也算我在场，那我是不是可以不用在这里？”",
    ],
    effects: { clues: ["falseJointSignature"], stats: { logic: 3, lonely: 8 } },
    choices: [
      { label: "划掉联名，回到分栏名册", back: true, primary: true },
      { label: "保留联名签条作为证明", next: "endingJointSignature" },
    ],
  },

  hourNinePaperBridge: {
    chapter: "十二时守灯",
    code: "23D-9",
    speaker: "纸桥",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第九小时，摊主把三张薄纸折成一座小桥。桥下放着茶杯、票根和残页，桥面只容得下一枚朱印。",
      "题目写在桥脚：证据能过桥，回答不能过桥。",
      "你把杯子、票根、残页依次放上去。纸桥微微下沉，却没有塌。",
      "轮到那句尚未说出口的话时，你把手收回来。它不能让纸替你走到秋清面前。",
    ],
    effects: { flags: ["paperBridgeMeasured"], clues: ["paperBridge"], journals: ["j22"], stats: { logic: 8, like: 4 } },
    choices: [
      { label: "只让纸桥承重证据，不承重回答", next: "hourTenCrowdDistance", primary: true, requires: ["paperBridgeMeasured"] },
      { label: "让人群从纸桥上替你递话", next: "badPaperBridgeCrowd", danger: true, confession: true, mistakeTag: "delegated-confession" },
    ],
  },

  badPaperBridgeCrowd: {
    chapter: "歧路",
    code: "W18",
    speaker: "纸桥",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把尚未说出口的话写成纸条，推上桥面。",
      "纸桥没有立刻塌。它只是把纸条送到人群那一侧，让许多声音同时读出你还没有亲口承担的句子。",
      "秋清听见了，却没有看向你。因为那句话已经从太多嘴里出来，反而找不到真正的来源。",
    ],
    choices: [
      { label: "收回纸条，回到桥的这一侧", back: true, primary: true },
      { label: "让人群继续读完", next: "endingPaperBridgeCrowd" },
    ],
  },

  hourTenCrowdDistance: {
    chapter: "十二时守灯",
    code: "23D-10",
    speaker: "人群边线",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第十小时，人群忽然变得密了。有人递灯，有人递糖，有人问你们是不是也在等谜底。",
      "秋清被热闹推近半步，又自己退回半步。那不是拒绝，只是在给呼吸留下位置。",
      "你跟着退回去，站在他能听清、也能转身的位置。人声在你们身后垫住场景，却没有越过你们之间那条边线。",
    ],
    effects: { flags: ["crowdDistanceChecked"], clues: ["crowdDistance"], journals: ["j23"], stats: { logic: 7, like: 6, joy: 4 } },
    choices: [
      { label: "站在人声能托住但不能替声的位置", next: "hourElevenBorrowedSilence", primary: true, requires: ["crowdDistanceChecked"] },
      { label: "请人群齐声证明秋清不会离开", next: "badCrowdProof", danger: true, mistakeTag: "crowd-proof" },
    ],
  },

  badCrowdProof: {
    chapter: "歧路",
    code: "W19",
    speaker: "人群边线",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你向人群借来一句整齐的证明。许多人一起说：他还在这里。",
      "这句话听起来温暖，也听起来可靠。可秋清被这份整齐推得更远，因为它把“还在”说成了“不许走”。",
      "你把那句证明记下，又立刻在旁边打了一个问号。它像线索，也像陷阱。",
    ],
    effects: { clues: ["wrongCrowdProof"], stats: { lonely: 8, logic: 4 } },
    choices: [
      { label: "把人群证明夹进存疑页，退回半步", back: true, primary: true },
      { label: "要求人群再证明一次", next: "endingCrowdProof" },
    ],
  },

  hourElevenBorrowedSilence: {
    chapter: "十二时守灯",
    code: "23D-11",
    speaker: "无声灯",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第十一小时，摊位之间的灯忽然暗了一圈。不是熄灭，只是把喧闹压低，像给你们留出一段没有掌声的路。",
      "月兰山的名字在你心里浮了一下。你知道他能保管许多东西：恐慌、推理、回家的路。",
      "可这一次，沉默不能交给他。你只是陪秋清站着，让不说话仍然属于此刻的你和此刻的他。",
    ],
    effects: { flags: ["silenceKeptHere"], clues: ["borrowedSilence"], journals: ["j24"], stats: { logic: 8, like: 5 } },
    choices: [
      { label: "把沉默留给秋清，不交给月兰山保管", next: "hourTwelveDawnMark", primary: true, requires: ["silenceKeptHere"] },
      { label: "让月兰山替你沉默到天亮", next: "badBorrowedSilence", danger: true, mistakeTag: "outsourced-silence" },
    ],
  },

  badBorrowedSilence: {
    chapter: "歧路",
    code: "W20",
    speaker: "无声灯",
    bg: ASSETS.festival,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "你在心里请月兰山替你保管沉默。灯火立刻冷静下来，冷静得几乎令人安心。",
      "月兰山出现时没有责备你。他只是站在秋清原本的位置上，说：“我可以让你不说，但我不能让他回答。”",
      "这句话太准确，准确到你终于听见：借来的沉默和借来的告白一样，都会让真正该在场的人退开。",
    ],
    choices: [
      { label: "收回沉默，等秋清回到灯下", back: true, primary: true },
      { label: "让冷静替你结束这一夜", next: "endingBorrowedSilence" },
    ],
  },

  hourTwelveDawnMark: {
    chapter: "十二时守灯",
    code: "23D-12",
    speaker: "黎明回执",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "第十二小时，纸灯的红边开始发白。摊主递来最后一枚朱印，印面上没有字，只有一道很细的晨光。",
      "回执写着：天亮前，你没有逃走。",
      "你把它夹进存疑页。坚持到这里值得记录，但它不能替秋清回答，也不能替你索取一个确定的结局。",
      "十二枚朱印并排落下时，手账变得很重。重得像终于能承认：最后一句话仍然只是一句话，不是对方必须接住的债。",
    ],
    effects: { flags: ["twelveHourWatchComplete"], clues: ["doubtDawnReceipt"], journals: ["j25"], stats: { logic: 10, like: 6, joy: 5 } },
    choices: [
      { label: "把十二枚朱印并排留在手账里", next: "festivalMark", primary: true, requires: ["twelveHourWatchComplete"] },
      { label: "拿黎明回执要求一个确定回答", next: "badDawnReceipt", danger: true, confession: true, mistakeTag: "earned-answer" },
    ],
  },

  badDawnReceipt: {
    chapter: "歧路",
    code: "W21",
    speaker: "黎明回执",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把黎明回执举到秋清面前，像举起一整夜的证明。",
      "秋清看了很久，轻声说：“你很努力。”",
      "这句话没有错。也正因为没有错，它不能被你拿来交换回答。努力属于你，回答仍然属于他。",
    ],
    effects: { clues: ["doubtDawnReceipt"], stats: { lonely: 8, logic: 5 } },
    choices: [
      { label: "把回执夹回存疑页", back: true, primary: true },
      { label: "继续用黎明换回答", next: "endingDawnReceipt" },
    ],
  },

  festivalMark: {
    chapter: "祭灯夜",
    code: "23B",
    speaker: "灯谜木牌",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清身旁有一块灯谜木牌，被纸灯照得发旧。牌面不是谜面，只有三枚竹签：递到掌心、挂在人群、停在半步外。",
      "第一枚竹签太近，像把选择塞进别人手里。第二枚太散，像把句子交给热闹代念。",
      "你翻开第三枚。背面写着：让声音从自己这里出去，也让对方还能后退。",
      "秋清没有看木牌，只看你。你忽然明白，最后要校准的不是甜度，是位置。",
    ],
    effects: { flags: ["finalDistanceChecked"], clues: ["festivalMark"], journals: ["j12"], stats: { logic: 8, like: 4 } },
    choices: [
      { label: "站回秋清能听见也能后退的位置", next: "finalWords", primary: true, requires: ["finalDistanceChecked"] },
      { label: "把句子藏进灯谜让人群替你念", next: "badWrittenConfession", danger: true, confession: true },
      { label: "把竹签递到秋清掌心，逼他立刻收下", next: "badQiuqingDirect", danger: true, confession: true },
      { label: "退到灯外，等月兰山替你校准", next: "badSilence", danger: true },
    ],
  },

  finalRuleRecap: {
    chapter: "祭灯夜",
    code: "23A",
    speaker: "手账",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "你没有离开人群，只把手账翻到最后三页。纸页在灯火下很薄，薄到能透出背后秋清的影子。",
      "第一行写场景：人声处，秋清在场。第二行写边界：不是对秋清说。第三行写桥：他承认月兰山是自己。",
      "你合上手账。复核不是回到过去重做一次，而是在真正开口前确认自己没有偷懒。",
    ],
    effects: { stats: { logic: 4 } },
    choices: [{ label: "收好手账，回到灯下", back: true, primary: true }],
  },

  finalWords: {
    chapter: "唯一一次",
    code: "24",
    speaker: "你",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "你听见自己的心跳，也听见人群里有人喊价，听见灯纸被火苗烘得轻轻作响。",
      "秋清看着你，没有催。正因为他没有催，你才更清楚这一句不能借别的词遮掩。",
      "现在只剩一句话。你只能表白一次。",
    ],
    choices: [
      { label: "秋清，我爱你。", next: "badQiuqingDirect", danger: true, confession: true },
      { label: "月兰山，我爱你。", next: "win", primary: true, confession: true, requiresRules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { label: "秋清，月兰山，我爱你们。", next: "badBothNames", danger: true, confession: true },
      { label: "我什么都不说。", next: "badSilence", danger: true },
    ],
  },

  win: {
    chapter: "结局",
    code: "25",
    speaker: "秋清",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "good",
    endingTitle: "灯火答复",
    endingSummary: "你没有解开一个人，只是终于没有把他再打成一个结。",
    text: [
      "秋清没有立刻回答。他看向身侧，那里没有月兰山，只有一盏快要熄灭的纸灯。",
      "“你没有把那句话放到我身上。”他说，“第八条没有拦住你。”",
      "他停了一下，像在听一个不在场的人给出同样的判断。“月兰山也不在场，所以第七条没有拦住你。”",
      "秋清握住杯子，指节终于不再发白。“可我知道你说的是谁。”",
      "纸灯在他身侧晃了一下。他抬眼看你，声音很轻：“我同意。”",
    ],
    effects: { flags: ["won"], stats: { joy: 100, logic: 100, like: 100 } },
    choices: endingChoices,
  },

  endingBorrowedBlessings: {
    chapter: "结局",
    code: "E21",
    speaker: "祝词篮",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    ending: true,
    endingKind: "bad",
    endingTitle: "借来的祝词",
    endingSummary: "你让祝福替你开口，也让秋清的回答被人群提前淹没。",
    text: [
      "你抽出最顺口的一张祝词，照着念出第一句。人群很配合地笑起来，像所有好结局都该这样开始。",
      "秋清也笑了，却只是礼貌地跟着热闹弯了弯眼睛。",
      "你没有真正开口。开口的是那张纸，是人群，是你害怕冷场时借来的声音。怪谈很安静地收下这一点空隙，把它写成失败。",
    ],
    choices: endingChoices,
  },

  endingWarmShortcut: {
    chapter: "结局",
    code: "E22",
    speaker: "茶摊热气",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "温暖误认",
    endingSummary: "你把秋清的笑当作准许，提前用掉唯一一次告白。",
    text: [
      "你在热气最软的时候说出口。秋清的笑还没来得及收回，眼神先暗了一下。",
      "他没有责怪你，只是慢慢把杯子放下。那一点停顿比拒绝更清楚：你不是在回应他，而是在回应自己想被允许的愿望。",
      "温暖没有碎。碎的是你把温暖当成答案的那一刻。",
    ],
    choices: endingChoices,
  },

  endingTeaWitness: {
    chapter: "结局",
    code: "E22A",
    speaker: "茶摊账单",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "旁证越界",
    endingSummary: "你让旁人证明尚未发生的回答，秋清被推出自己的选择。",
    text: [
      "印章终于落下。红色圆痕盖在空白栏上，像一只太早闭上的眼睛。",
      "秋清没有生气。他只是把账单转回你面前，让你看见那枚印章下面什么都没有。",
      "旁人证明你们同桌，证明茶还热，证明他笑过一次。可你让这些证明越过边界，替他回答了还没被问完的问题。",
    ],
    choices: endingChoices,
  },

  endingRoadEcho: {
    chapter: "结局",
    code: "E23",
    speaker: "旧路回声",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    ending: true,
    endingKind: "bad",
    endingTitle: "场外回声",
    endingSummary: "你追向旧路，把祭灯夜重新交给无人处。",
    text: [
      "你追进暗处。第七盏灯之后的声音越来越像秋清，也越来越不像任何一个此刻站在灯下的人。",
      "身后的祭灯夜被拉成一条细线，秋清和人群都退到线外。",
      "月兰山在旧路尽头抬眼看你，神情几乎温和。你知道他不会接受表白，也知道你已经把唯一一次机会带回了最不该开口的地方。",
    ],
    choices: endingChoices,
  },

  endingLedgerPoetic: {
    chapter: "结局",
    code: "E24",
    speaker: "旧账桌",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    ending: true,
    endingKind: "bad",
    endingTitle: "漂亮圆环",
    endingSummary: "你选择了好看的解释，证据失去了承重的顺序。",
    text: [
      "你保留了那个漂亮圆环。票根、杯子、收据和名字绕成一圈，像一枚刚好能套住所有人的戒指。",
      "可它太完整了，完整到没有给任何人在场状态留下差异。",
      "秋清轻声说“好看”，然后退到圆环之外。你忽然明白，美感有时也是怪谈递来的捷径。",
    ],
    choices: endingChoices,
  },

  endingFestivalShortcut: {
    chapter: "结局",
    code: "E25",
    speaker: "巡灯表",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "少掉的六小时",
    endingSummary: "你用速度换掉确认，把最后一句交给催促。",
    text: [
      "你没有走完六格。最后一句很快、很完整，也很像你一路上努力避开的所有陷阱。",
      "秋清听完之后，先看你的手账。那里缺着六枚朱印，像六个没有被允许发生的小时。",
      "他没有说你错，只说：“你太辛苦了。”这句体贴把失败变得更轻，也更难挽回。",
    ],
    choices: endingChoices,
  },

  endingCrowdReceipt: {
    chapter: "结局",
    code: "E26",
    speaker: "人群回执",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "代管的巡灯表",
    endingSummary: "你把判断交给秋清保管，反而让他背上不属于他的选择。",
    text: [
      "秋清最终接过那张巡灯表。纸很轻，落在他手里却像多了一层枷锁。",
      "你问他能不能替你看着。话出口时，你已经知道这不是信任，是把风险转交给被你喜欢的人。",
      "他低头看了很久，最后把表还给你。可六格已经全空了，空得像一场没有走完的夜。",
    ],
    choices: endingChoices,
  },

  endingBlankAnswer: {
    chapter: "结局",
    code: "E27",
    speaker: "留白格",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "预写的同意",
    endingSummary: "你提前占用了秋清的回答，告白变成单方面的结案。",
    text: [
      "你带着“他会同意”的预设开口。句子很稳，稳得像一份已经签好的回执。",
      "秋清听完，先看向那格被写满的留白。你看见他眼里的退路被你提前涂掉了一半。",
      "他没有当场拒绝你。可你知道，比拒绝更糟的是，你没能让他真正回答。",
    ],
    choices: endingChoices,
  },

  endingBlankRefusal: {
    chapter: "结局",
    code: "E28",
    speaker: "留白格",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "预写的拒绝",
    endingSummary: "你用预设的失败保护自己，也把秋清排除在回答之外。",
    text: [
      "你带着“他会拒绝”的预设离开。这样当然不会被真正拒绝，因为你没有把真正的问题交出去。",
      "身后的祭灯夜仍然热闹，秋清仍然站在人群边缘。你却把他留成了一个不会伤害你的假设。",
      "怪谈没有追上来。它不需要追。你已经替它完成了最省力的一步：把答案从对方那里拿走。",
    ],
    choices: endingChoices,
  },

  endingArchiveShortcut: {
    chapter: "结局",
    code: "E29",
    speaker: "档案摊",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "branch",
    endingTitle: "单页收尾",
    endingSummary: "你让一张最像结论的纸替整夜收尾，后半夜的证词没有机会互相校准。",
    text: [
      "你带着那一页走到最后一盏灯前。纸面写得很顺，顺到每个犹豫都像被提前修掉。",
      "秋清读完，没有说纸是假的。他只是问：“那我刚才按住的其他页呢？”",
      "你答不上来。怪谈没有夺走结局，它只是让你用最省力的一页，把仍然需要时间的部分合上了。",
    ],
    choices: endingChoices,
  },

  endingJointSignature: {
    chapter: "结局",
    code: "E30",
    speaker: "联名签条",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "合并签名",
    endingSummary: "你把互认写成联名，把此刻在场的人从自己的位置上挤开。",
    text: [
      "联名签条被灯火照得很好看。两个名字靠得很近，近到你几乎能相信边界从来没有存在过。",
      "秋清把签条放回桌面，说：“如果你喜欢的是这个合起来的名字，那它不需要我回答。”",
      "你没有说出最后一句。因为那句话忽然找不到对象，只剩一枚漂亮到失真的签名。",
    ],
    choices: endingChoices,
  },

  endingPaperBridgeCrowd: {
    chapter: "结局",
    code: "E31",
    speaker: "纸桥",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    ending: true,
    endingKind: "bad",
    endingTitle: "隔桥传话",
    endingSummary: "你让人群替你读完那句话，告白失去了真正的来源。",
    text: [
      "人群把纸条读完时，纸桥终于塌了。塌得很轻，只像一声被热闹吞掉的叹息。",
      "秋清听见了所有字，却没有听见你。那句话被太多声音分走，反而没有一个声音需要承担它。",
      "你省下了开口，也省掉了被看见的可能。怪谈把这份轻松记作失败。",
    ],
    choices: endingChoices,
  },

  endingCrowdProof: {
    chapter: "结局",
    code: "E32",
    speaker: "人群边线",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "branch",
    endingTitle: "齐声证明",
    endingSummary: "你把人声当成保证，秋清被热闹证明成了不能离开的人。",
    text: [
      "人群第二次齐声说：他还在这里。声音很大，大到连你都差点相信这就是安全。",
      "秋清后退时没有撞到任何人，大家自动给他让开一条缝。你这才看见，热闹可以托住场景，也可以围成墙。",
      "你没有说出那句话。因为你先让人群替他失去了后退的权利。",
    ],
    choices: endingChoices,
  },

  endingBorrowedSilence: {
    chapter: "结局",
    code: "E33",
    speaker: "无声灯",
    bg: ASSETS.festival,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    ending: true,
    endingKind: "branch",
    endingTitle: "冷静代管",
    endingSummary: "你把沉默交给月兰山，安静保住了你，却让秋清离开了当前场景。",
    text: [
      "月兰山替你把沉默保管得很好。整条灯街都像被整理过，连风都按顺序从摊位之间穿过。",
      "可秋清不在这份整齐里。你没有受伤，也没有出错，只是把需要由你和他共同面对的一段时间交给了第三个位置。",
      "月兰山说：“我可以保护他，也可以保护你。但我不能替你们在同一盏灯下相遇。”",
    ],
    choices: endingChoices,
  },

  endingDawnReceipt: {
    chapter: "结局",
    code: "E34",
    speaker: "黎明回执",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "bad",
    endingTitle: "用黎明交换",
    endingSummary: "你把坚持当成筹码，黎明没有证明秋清必须回答。",
    text: [
      "你把回执递得更近。纸边沾着晨光，看起来像一份终于盖齐的证明。",
      "秋清接过去，认真看完，又认真还给你。那份认真几乎让你心软，也让失败更清楚。",
      "他说：“谢谢你走到这里。但我不能因为你走到这里，就把回答交出去。”",
      "天亮了。天亮只证明夜结束，不证明任何人已经属于任何人。",
    ],
    choices: endingChoices,
  },

  badWaitingRoom: {
    chapter: "岔路",
    code: "W1",
    speaker: "旁白",
    bg: ASSETS.mirror,
    text: [
      "你等到凌晨两点，灰烬没有变回纸页。窗外的楼道灯灭了一次，又亮起来。",
      "房间太安静，安静到你开始听见自己的呼吸。你忽然意识到，继续等下去只会让你把害怕误认成谨慎。",
      "墙上的影子变得很长，像一条不肯走完的路。",
    ],
    choices: [
      { label: "把停滞记进手账，回到刚才的判断", back: true, primary: true },
      { label: "仍想在房间里直接告白", next: "badEarly", confession: true },
    ],
  },

  badPhoneLoop: {
    chapter: "岔路",
    code: "W2",
    speaker: "听筒",
    bg: ASSETS.mirror,
    text: [
      "你要求对方把话说清楚。听筒里的雨声忽然变成翻页声，一页接一页，快得像故意不让你看见。",
      "对面说：“你急着要完整句子，是因为你还不想走那条路。”",
      "电话自动挂断。屏幕黑下去，映出你有些狼狈的脸。",
    ],
    choices: [
      { label: "记住电话不会替你判断，回到刚才的判断", back: true, primary: true },
      { label: "把电话里的沉默当成月兰山同意", next: "badYuelanDirect", confession: true },
    ],
  },

  badCupTurn: {
    chapter: "危险",
    code: "W3",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    text: [
      "你把空杯转向自己。杯底刮过桌面，茶铺的声音像被刀背刮薄。",
      "秋清按住杯子，声音很低：“不要替我邀请他出来。”",
      "你立刻松手。秋清没有责备你，只把杯子慢慢转回朝内的位置。",
    ],
    effects: { stats: { lonely: 8, logic: 4 } },
    choices: [
      { label: "把空杯放回原位，回到刚才的判断", back: true, primary: true },
      { label: "坚持让月兰山出现", next: "badForceYuelan" },
    ],
  },

  badLedgerForce: {
    chapter: "危险",
    code: "W4",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "你继续追读被按住的页。秋清没有把账本抢回去，只是收回了手。",
      "那一页写着：被看见不等于被剖开。",
      "你感到难堪。你把账本合上，重新把主动权交回他手里。",
    ],
    effects: { stats: { like: 0, lonely: 6 } },
    choices: [
      { label: "合上账本，回到刚才的判断", back: true, primary: true },
      { label: "仍然把账本当成证物追问", next: "badForceYuelan" },
    ],
  },

  badRainRush: {
    chapter: "危险",
    code: "W5",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "unstable",
    text: [
      "你们冲进雨里，街上的人声很快被雨幕隔断。",
      "秋清的脚步越来越轻，像正被雨水从你身边一点点冲淡。",
      "你们退回茶铺门廊。秋清没有责怪你，只说：“等雨停。”",
    ],
    effects: { stats: { lonely: 10, logic: 3 } },
    choices: [
      { label: "退回门廊，回到刚才的判断", back: true, primary: true },
      { label: "独自冲向旧路口", next: "badFinalRoad" },
    ],
  },

  badWrongSafety: {
    chapter: "危险",
    code: "W6",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清轻轻摇头：“如果安全感必须靠我替你拿住所有东西，那你到了第七盏灯还是会回头。”",
      "他不是拒绝靠近，而是在拒绝让你把判断外包给他。",
      "别人可以陪你走一段，不能替你决定什么时候闭嘴，什么时候不回头。",
    ],
    effects: { stats: { logic: 5 } },
    choices: [
      { label: "把判断收回自己手里，回到刚才的选择", back: true, primary: true },
      { label: "坚持必须由秋清保证安全", next: "badComfortOnly" },
    ],
  },

  badCoin: {
    chapter: "危险",
    code: "W7",
    speaker: "旁白",
    bg: ASSETS.night,
    text: [
      "硬币离开售票亭后，正反两面的字都变成了“我”。",
      "你握着它，反而更分不清这个“我”指谁。护身符没有保护你，它只是把你推向含混。",
      "你把硬币放回抽屉，重新空手上路。",
    ],
    effects: { stats: { logic: 4 } },
    choices: [
      { label: "把硬币放回抽屉，回到刚才的判断", back: true, primary: true },
      { label: "继续把硬币留在口袋里", next: "badBothNames", confession: true },
    ],
  },

  badWaitingRoad: {
    chapter: "危险",
    code: "W8",
    speaker: "旁白",
    bg: ASSETS.night,
    text: [
      "你在路灯下停得太久，周围的声音开始退潮。",
      "先是风声，再是远处车声，最后连自己的呼吸都像隔着玻璃。孤独不是空白，它会主动填满场景。",
      "你必须继续走。停留会把秋清留在身后，把月兰山推到面前。",
    ],
    effects: { stats: { lonely: 12, logic: 4 } },
    choices: [
      { label: "逼自己重新移动，回到刚才的灯下", back: true, primary: true },
      { label: "回头寻找秋清", next: "badLookBack" },
      { label: "在原地说出告白", next: "badYuelanDirect", confession: true },
    ],
  },

  badMirrorStare: {
    chapter: "危险",
    code: "W9",
    speaker: "镜子",
    bg: ASSETS.mirror,
    text: [
      "你盯着镜子太久，镜中的脸开始延迟半拍。它像要分裂，却始终没有分裂成功。",
      "镜面上浮出一句话：不要把视觉错觉当作人格同时出现的证据。",
      "你闭上眼，等眩晕过去。第十条不是谜语，它是边界。",
    ],
    effects: { stats: { logic: 5, lonely: 5 } },
    choices: [
      { label: "闭眼离开镜面，回到刚才的判断", back: true, primary: true },
      { label: "继续盯到出现两张脸", next: "badTogether" },
    ],
  },

  badWaitingFestival: {
    chapter: "试胆局",
    code: "W10",
    speaker: "旁白",
    bg: ASSETS.festival,
    text: [
      "你站在三道纸门前等提示。人群从你身后经过，没有人替你选。",
      "试胆局的灯一盏盏暗下去，纸门上的字却越来越清楚。无人路、双人房、人声处。这不是考勇气，是考场景判断。",
      "你不能永远停在选择之前。停在这里，最终也只是另一种逃避。",
    ],
    choices: [
      { label: "不再等提示，回到三道纸门前", back: true, primary: true },
      { label: "推开写着“无人路”的纸门", next: "badFinalRoad" },
      { label: "推开写着“双人房”的纸门", next: "badFinalRoom" },
    ],
  },

  badPrivateCard: {
    chapter: "危险",
    code: "W11",
    speaker: "旁白",
    bg: ASSETS.mirror,
    text: [
      "你把明信片塞进口袋。下一秒，口袋里的纸变得潮湿，像刚从雨夜里捞出来。",
      "明信片上的字迹开始褪色，最后只剩一句：理解不是占有证物。",
      "你把它放回失物柜。柜门合上的时候，图书室里那些窃窃私语终于停了。",
    ],
    effects: { stats: { logic: 4, like: 0 } },
    choices: [
      { label: "把明信片放回去，回到刚才的判断", back: true, primary: true },
      { label: "继续把明信片带走", next: "badHalfLove" },
    ],
  },

  badEarly: {
    chapter: "失败",
    code: "X1",
    speaker: "旁白",
    bg: ASSETS.mirror,
    ending: true,
    endingTitle: "过早告白",
    endingSummary: "你把唯一一句交给了尚未复原的规则，红线松开，路也断了。",
    text: [
      "那句话离开发送框的一瞬间，屏幕白了一下。",
      "没有人回你。只有信封里的红线慢慢松开，像一口气终于叹完。",
    ],
    choices: endingChoices,
  },
  badAsh: {
    chapter: "失败",
    code: "X2",
    speaker: "旁白",
    bg: ASSETS.mirror,
    text: [
      "灰烬入水后变成一团黑泥。编号还在，句子却彻底没了。",
      "你保住了那句话，却弄丢了它该被说出的路。",
    ],
    choices: [{ label: "擦干手指，回到刚才的判断", back: true, primary: true }],
  },
  badQiuqingDirect: {
    chapter: "失败",
    code: "X3",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingTitle: "直呼其名",
    endingSummary: "秋清拒绝的不是喜欢本身，而是落错对象的那一句。",
    text: [
      "秋清听完，眼神很轻地暗下去。",
      "他没有生气，只是把杯子往回收了一点。“抱歉。”他说。这两个字比拒绝更轻，也更彻底。",
    ],
    choices: endingChoices,
  },
  badForceYuelan: {
    chapter: "危险",
    code: "X4",
    speaker: "月兰山",
    bg: ASSETS.tea,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "茶铺的热闹像被人从玻璃外抽走。月兰山抬眼看你：“你把问题问成了审讯。”",
      "他没有伤害你，只把杯子推远。“你这样问，只会让我留下来。”",
    ],
    effects: { fragments: ["f4b"], stats: { lonely: 15, logic: 5 } },
    choices: [{ label: "把问题退回边界内，回到刚才的判断", back: true, primary: true }],
  },
  badComfortOnly: {
    chapter: "岔路",
    code: "X5",
    speaker: "旁白",
    bg: ASSETS.tea,
    text: [
      "留在茶铺当然轻松。热茶会续上，灯也会一直亮。",
      "可秋清看向旧路时，眼神并没有跟着回来。你知道自己不能只喜欢灯下的他。",
    ],
    choices: [
      { label: "承认安慰还不够，回到刚才的判断", back: true, primary: true },
      { label: "继续把茶铺当成唯一安全处", next: "endingTeaStagnation" },
      { label: "只向灯下的秋清告白", next: "badQiuqingDirect", confession: true },
    ],
  },
  endingTeaStagnation: {
    chapter: "结局",
    code: "E1",
    speaker: "旁白",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "branch",
    endingTitle: "温热停留",
    endingSummary: "茶铺一直亮着，但你们再也没有走到那条必须被理解的旧路。",
    text: [
      "你们把雨等过去，又等来下一场雨。茶铺老板添了三次水，秋清每次都说谢谢。",
      "没有怪声，没有第七盏灯，也没有月兰山。可秋清看向窗外时，眼神一次比一次远。",
      "你终于明白，安全如果只剩躲避，就会慢慢变成另一种孤独。你没有输给怪谈，只是把故事停在了它最容易停住的地方。",
    ],
    choices: endingChoices,
  },
  badLookBack: {
    chapter: "危险",
    code: "X6",
    speaker: "背后的声音",
    bg: ASSETS.night,
    text: [
      "你回头的一瞬间，看见秋清站在第七盏灯外，脸上带着茶铺里一模一样的笑。",
      "可是他的影子方向错了。下一秒，那张脸像被雨水冲开，露出月兰山冷静的眼睛。",
      "“看。”他说，“它不用骗你太多。只要让你心软一下。”",
    ],
    effects: { clues: ["noTurn"], stats: { lonely: 20 } },
    choices: [
      { label: "把这次回头记住，回到刚才的灯下", back: true, primary: true },
      { label: "追上那个像秋清的影子", next: "lookBackChase" },
      { label: "站在原地向影子道歉", next: "endingBorrowedGuilt" },
    ],
  },
  lookBackChase: {
    chapter: "旧路",
    code: "X6A",
    speaker: "背后的声音",
    bg: ASSETS.night,
    persona: "unstable",
    text: [
      "影子没有跑，只是每当你快追上，它就把秋清的笑往前挪一盏灯。",
      "你听见自己喘得很急。急到每一次呼吸都像在替那句话预热。",
      "前方的灯一盏盏退后，旧路不再像路，更像一卷被人慢慢抽长的磁带。",
    ],
    effects: { stats: { lonely: 10, logic: 2 } },
    choices: [
      { label: "停下，承认那只是借来的声音", back: true, primary: true },
      { label: "继续追到第七盏灯外", next: "endingLostOnRoad" },
      { label: "对影子说“我会救你”", next: "badYuelanDirect", confession: true },
    ],
  },
  endingLostOnRoad: {
    chapter: "结局",
    code: "E2",
    speaker: "背后的声音",
    bg: ASSETS.night,
    persona: "unstable",
    ending: true,
    endingKind: "branch",
    endingTitle: "追影旧路",
    endingSummary: "你追到的不是秋清，而是怪谈学会的一种像秋清的声音。",
    text: [
      "你追到第七盏灯外，影子终于停下。它转身时，脸上没有秋清，也没有月兰山，只有一层薄薄的笑。",
      "“你看，”它说，“只要足够像，他就可以不在场。”",
      "你想回头找真正的路，身后的灯却已经按来时的顺序熄灭。你没有用掉表白，却把自己交给了一句假声音。",
    ],
    choices: endingChoices,
  },
  endingBorrowedGuilt: {
    chapter: "结局",
    code: "E3",
    speaker: "旁白",
    bg: ASSETS.night,
    persona: "unstable",
    ending: true,
    endingKind: "branch",
    endingTitle: "借来的愧疚",
    endingSummary: "你向假声音道歉，于是怪谈拿走了你的心软。",
    text: [
      "你说对不起。那影子很轻地笑了一下，笑声像秋清，也像你最怕听见的原谅。",
      "下一秒，旧路上所有灯同时亮起。每一盏灯下都站着一个需要你道歉的人。",
      "你终于明白，愧疚如果不先确认对象，就会变成怪谈最省力的绳结。",
    ],
    choices: endingChoices,
  },
  badYuelanDirect: {
    chapter: "失败",
    code: "X7",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    ending: true,
    endingTitle: "独灯拒绝",
    endingSummary: "月兰山独自出现时，表白本身进不了门。",
    text: [
      "月兰山没有迟疑：“拒绝。”",
      "他的语气没有胜利，也没有轻蔑。只是门关上了，连回声都没有。",
    ],
    choices: endingChoices,
  },
  badAskSubstitute: {
    chapter: "危险",
    code: "X8",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "“代替？”月兰山重复这个词，路灯亮度骤降。",
      "“我不是他的替代品。他也不是我的表层。”",
      "他看向你握紧的手：“那句话也不能交给我保管。你交出来的不是一句话，是判断。”",
    ],
    effects: { stats: { logic: 8, lonely: 10 } },
    choices: [
      { label: "收回那个请求，回到刚才的判断", back: true, primary: true },
      { label: "继续要求他代替秋清接受", next: "endingSubstituteContract" },
      { label: "把唯一一句写进空信封", next: "endingSealedSentence", confession: true },
    ],
  },
  endingSubstituteContract: {
    chapter: "结局",
    code: "E4",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    ending: true,
    endingKind: "branch",
    endingTitle: "代收回执",
    endingSummary: "你得到了一张看似完整的回执，却失去了真正回答的人。",
    text: [
      "月兰山沉默很久，久到路灯开始发白。他从口袋里取出一张空白回执，递给你。",
      "“如果你只是要一个结果，”他说，“这里可以盖章。”",
      "红印落下时，你听见自己松了一口气。那口气太轻了，轻得不像被接受，更像终于不用再面对秋清。",
      "回执上只有四个字：代为拒收。",
    ],
    choices: endingChoices,
  },
  endingSealedSentence: {
    chapter: "结局",
    code: "E4B",
    speaker: "空信封",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "unstable",
    ending: true,
    endingKind: "branch",
    endingTitle: "封口句子",
    endingSummary: "你把唯一一句封进信封，于是它再也没有抵达任何在场的人。",
    text: [
      "你把那句话写进空信封，封口处的红线自己收紧。",
      "月兰山没有阻止，只是看着你的手：“你把判断放进去了。”",
      "信封变得很轻。轻到你几乎以为自己安全了。可当你再想开口时，舌尖只剩一枚纸灰的味道。",
      "有些话不是寄出去才会丢。封起来的那一刻，它就已经离开你了。",
    ],
    choices: endingChoices,
  },
  badSurrender: {
    chapter: "危险",
    code: "X9",
    speaker: "月兰山",
    bg: ASSETS.night,
    portrait: ASSETS.yuelan,
    persona: "yuelan",
    text: [
      "月兰山第一次露出近乎失望的表情。",
      "“如果只剩我，那不是保护秋清。那是秋清不存在了。”",
    ],
    choices: [{ label: "重新把职责和替代分开，回到刚才的判断", back: true, primary: true }],
  },
  badBreakThread: {
    chapter: "危险",
    code: "X10",
    speaker: "镜子",
    bg: ASSETS.mirror,
    text: [
      "红线断开的瞬间，镜子里出现两个模糊影子。它们同时开口，声音重叠到无法分辨。",
      "那不像真相，像你亲手制造出来的证据。镜面很快黑下去，只剩断线垂在桌边。",
    ],
    choices: [{ label: "把红线重新接好，回到刚才的判断", back: true, primary: true }],
  },
  badTogether: {
    chapter: "失败",
    code: "X11",
    speaker: "旁白",
    bg: ASSETS.mirror,
    ending: true,
    endingTitle: "同场空镜",
    endingSummary: "你等来两只冷掉的杯子，却没有等来不可能同时出现的两个人。",
    text: [
      "你等了一夜。两只杯子都冷了，镜子里始终只有一个位置。",
      "第十条不会因为你的愿望让步。不能同时出现，就是不能同时出现。",
    ],
    choices: endingChoices,
  },
  badHalfTape: {
    chapter: "危险",
    code: "X12",
    speaker: "录音",
    bg: ASSETS.mirror,
    text: [
      "你只听到“我不会爱任何人”，便拔掉磁带。",
      "磁带卷舌一样卡在机器里。半句话停在那里，冷得像一句判决。",
    ],
    choices: [
      { label: "把磁带倒回去，回到刚才的判断", back: true, primary: true },
      { label: "只带着半句结论去找秋清", next: "endingColdDiagnosis" },
      { label: "把月兰山写成病名", next: "badEraseYuelan" },
    ],
  },
  endingColdDiagnosis: {
    chapter: "结局",
    code: "E5",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    ending: true,
    endingKind: "branch",
    endingTitle: "半句诊断",
    endingSummary: "你用半截录音替他下结论，于是完整的他不再向你开口。",
    text: [
      "你带着那半句录音回到茶铺。秋清听完，没有替自己辩解。",
      "他只是把磁带推回你面前：“你听见的是断掉的地方，不是我。”",
      "茶还热着，杯口却忽然很远。你终于明白，错误的关心有时候比误解更难被原谅，因为它看起来太像认真。",
    ],
    choices: endingChoices,
  },
  badEraseYuelan: {
    chapter: "危险",
    code: "X13B",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "秋清看着你，像看着一扇忽然关上的门。",
      "“如果你觉得要消灭他才算喜欢我，”秋清说，“那你喜欢的不是我。”",
    ],
    choices: [{ label: "把这句话听进去，回到刚才的判断", back: true, primary: true }],
  },
  badHalfLove: {
    chapter: "危险",
    code: "X14",
    speaker: "秋清",
    bg: ASSETS.tea,
    portrait: ASSETS.qiuqing,
    persona: "qiuqing",
    text: [
      "“只喜欢没有月兰山的我？”秋清把空杯扣住。",
      "“那你喜欢的是一个没经历过那条夜路的人。那不是我。”",
    ],
    choices: [{ label: "重新承认全部的他，回到刚才的判断", back: true, primary: true }],
  },
  badFinalRoad: {
    chapter: "失败",
    code: "X15",
    speaker: "旁白",
    bg: ASSETS.night,
    ending: true,
    endingTitle: "无人夜路",
    endingSummary: "你选了会让月兰山独自出现的场景，于是第七条先一步关门。",
    text: [
      "无人夜路把人声全部关在外面。第七盏灯亮起时，秋清已经不在。",
      "月兰山站在灯下，看着你把话说完，然后摇头。",
    ],
    choices: endingChoices,
  },
  badFinalRoom: {
    chapter: "失败",
    code: "X16",
    speaker: "旁白",
    bg: ASSETS.mirror,
    ending: true,
    endingTitle: "封闭房间",
    endingSummary: "你把场景缩到只剩两个人，孤独便替你改变了在场者。",
    text: [
      "封闭房间让秋清退回沉默。孤独不是浪漫布景，它会改变在场者。",
      "你需要人声处，不是密室。",
    ],
    choices: endingChoices,
  },
  badRuleSort: {
    chapter: "推理错误",
    code: "X17",
    speaker: "手账",
    bg: ASSETS.mirror,
    text: [
      "你把拒绝范围排错了。残页发黑，像在提醒你：第七条和第八条差别极小，但足以决定生死。",
      "重新排序前，别急着去祭灯夜。",
    ],
    choices: [
      { label: "把错误排序划掉，回到刚才的判断", back: true, primary: true },
      { label: "照错误排序进入祭灯夜", next: "endingAlmostRight" },
      { label: "把第七条和第八条合并成一句", next: "badBothNames", confession: true },
    ],
  },
  endingAlmostRight: {
    chapter: "结局",
    code: "E6",
    speaker: "手账",
    bg: ASSETS.festival,
    ending: true,
    endingKind: "branch",
    endingTitle: "几乎正确",
    endingSummary: "你带着差一指宽的排序抵达祭灯夜，门缝却正好合上。",
    text: [
      "你照着错误排序走进祭灯夜。人声、灯火、秋清，全都在该在的位置。",
      "可你开口前，手账自己翻到第七条和第八条。两条规则贴得太近，近到你看不出哪一个词放错了。",
      "秋清等了很久，最后轻声说：“你是不是还没分清，这句话落在哪里？”",
      "你几乎走到了门前。几乎，也是怪谈最喜欢的一种失败。",
    ],
    choices: endingChoices,
  },
  badSeparate: {
    chapter: "推理错误",
    code: "X18",
    speaker: "手账",
    bg: ASSETS.mirror,
    text: [
      "如果把他们当成毫无关系的两个人，第九条就失去意义。",
      "但如果把他们揉成一个含混的人，镜子又会立刻变黑。你需要的是边界，不是省事。",
    ],
    choices: [
      { label: "把边界重新画清，回到刚才的判断", back: true, primary: true },
      { label: "把两个名字彻底拆开", next: "endingTwoNames" },
      { label: "把两个名字揉成一个", next: "endingBlurredName" },
    ],
  },
  endingTwoNames: {
    chapter: "结局",
    code: "E7",
    speaker: "手账",
    bg: ASSETS.mirror,
    ending: true,
    endingKind: "branch",
    endingTitle: "两本名册",
    endingSummary: "你把他们拆成两个无关的人，于是第九条失去桥的作用。",
    text: [
      "你重新抄了一份名册：秋清一页，月兰山一页。两页纸被你分开放进不同口袋。",
      "起初这很清楚，清楚得近乎轻松。可当秋清说“他不是外人”时，你发现自己已经没有地方把这句话写进去。",
      "红线在两页纸之间断开。你保住了边界，却剪掉了能抵达结局的桥。",
    ],
    choices: endingChoices,
  },
  endingBlurredName: {
    chapter: "结局",
    code: "E8",
    speaker: "镜子",
    bg: ASSETS.mirror,
    ending: true,
    endingKind: "branch",
    endingTitle: "含混之名",
    endingSummary: "你省掉了边界，镜子也省掉了回答。",
    text: [
      "你把两个名字写成一个很长的合称。笔画挤在一起，像一团故意不拆开的线。",
      "镜面起了一层雾。雾里有人问你：现在在场的是谁？你张口，却只能说出那个合称。",
      "镜子于是黑下去。含混不是温柔，它只是让所有人都无法被准确看见。",
    ],
    choices: endingChoices,
  },
  badBothNames: {
    chapter: "失败",
    code: "X19",
    speaker: "旁白",
    bg: ASSETS.festival,
    ending: true,
    endingTitle: "复数告白",
    endingSummary: "你用“你们”逃避精确判断，两个规则同时把门关上。",
    text: [
      "“你们”是逃避精确判断的词。",
      "秋清听见了对秋清的表白，第八条成立。月兰山不在，也无法接受属于他的部分。",
    ],
    choices: endingChoices,
  },
  badFinalMissing: {
    chapter: "失败",
    code: "X19B",
    speaker: "旁白",
    bg: ASSETS.festival,
    ending: true,
    endingTitle: "缺失支点",
    endingSummary: "最后一句几乎正确，却少了撑住它的规则与线索。",
    text: [
      "这句话说出口时，纸灯往下沉了一寸。",
      "秋清看着你，像听见了一句几乎正确、却少了某个支点的话。",
      "缺失的东西没有替你补上。祭灯夜还在继续，这一次回答却已经错过。",
    ],
    choices: endingChoices,
  },
  badSilence: {
    chapter: "失败",
    code: "X20",
    speaker: "旁白",
    bg: ASSETS.festival,
    ending: true,
    endingTitle: "未说出口",
    endingSummary: "唯一一次机会被保留下来，也随场景一起熄灭。",
    text: [
      "你没有说错，也没有说对。",
      "唯一一次机会保留下来，也随场景一起熄灭。没有被使用的勇气，有时和没有勇气一样安静。",
    ],
    choices: endingChoices,
  },
  badWrittenConfession: {
    chapter: "失败",
    code: "X21",
    speaker: "纸灯",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    ending: true,
    endingTitle: "写给火的告白",
    endingSummary: "你把最后一句交给灯纸，怪谈便替你把它说完。",
    text: [
      "你把最后一句写上灯纸。墨迹还没干，纸灯已经轻轻鼓起，像有人在里面替你吸了一口气。",
      "人群没有听见，秋清也没有听见。可怪谈听见了。它把那句话从纸面抬起来，念得比你更顺。",
      "秋清抬头时，纸灯正好离手。唯一一次表白没有落到他面前，只落进了火里。",
    ],
    choices: endingChoices,
  },
  endingBorrowedFlame: {
    chapter: "结局",
    code: "E9",
    speaker: "摊主",
    bg: ASSETS.festival,
    portrait: ASSETS.qiuqing,
    persona: "unstable",
    ending: true,
    endingKind: "branch",
    endingTitle: "借火留声",
    endingSummary: "你让借来的火起头，唯一一句从此不再属于你。",
    text: [
      "火苗替你点出第一个字。它很轻，轻到旁边的人只当灯纸响了一下。",
      "可秋清听见了。他看向那支竹签，眼里的亮色慢慢退回去，像有人替你把门推开，又把你留在门外。",
      "摊主把熄灭的签子收走，说：“借火不借声。”",
      "你还站在人群里，却已经找不到那句话原本该从哪里开始。",
    ],
    choices: endingChoices,
  },
};

const LARGE_EXPANSION = {
  openings: [
    ["opening01", "门缝雨声", "从门缝里的雨声开局", ASSETS.mirror, "雨声"],
    ["opening02", "茶票背面", "从茶票背面的地址开局", ASSETS.tea, "茶票"],
    ["opening03", "旧路末班", "从旧路末班车开局", ASSETS.night, "末班车"],
    ["opening04", "镜室晨雾", "从镜室晨雾开局", ASSETS.mirror, "镜雾"],
    ["opening05", "校医空灯", "从校医室空灯开局", ASSETS.gate, "空灯"],
    ["opening06", "图书归还", "从图书室归还处开局", ASSETS.gate, "归还处"],
    ["opening07", "祭灯预告", "从祭灯预告单开局", ASSETS.festival, "预告单"],
    ["opening08", "无声演练", "从无声演练手账开局", ASSETS.festival, "手账"],
  ],
  theaters: [
    ["theater01", "信封夹层小剧场", ASSETS.mirror, "夹层"],
    ["theater02", "雨棚座位小剧场", ASSETS.tea, "雨棚"],
    ["theater03", "售票亭玻璃小剧场", ASSETS.night, "玻璃"],
    ["theater04", "旧账桌纸屑小剧场", ASSETS.festival, "纸屑"],
    ["theater05", "裂镜背面小剧场", ASSETS.mirror, "裂镜"],
    ["theater06", "祝词篮底小剧场", ASSETS.festival, "篮底"],
    ["theater07", "公交站牌小剧场", ASSETS.night, "站牌"],
    ["theater08", "校医录音小剧场", ASSETS.gate, "录音"],
    ["theater09", "图书归还小剧场", ASSETS.gate, "书脊"],
    ["theater10", "纸门出口小剧场", ASSETS.festival, "纸门"],
    ["theater11", "十二朱印小剧场", ASSETS.festival, "朱印"],
    ["theater12", "黎明回执小剧场", ASSETS.festival, "回执"],
  ],
  mainlines: [
    ["mainline01", "旧路证词主线", "进入新增主线：旧路证词", ASSETS.night, "旧路"],
    ["mainline02", "镜室互认主线", "进入新增主线：镜室互认", ASSETS.mirror, "镜室"],
    ["mainline03", "祭灯留白主线", "进入新增主线：祭灯留白", ASSETS.festival, "祭灯"],
  ],
};

function generatedText(kind, title, motif, index, total) {
  const step = `${index}/${total}`;
  if (kind === "opening") {
    return [
      `【${title} · ${step}】${motif}先于信封出现，像把今晚的顺序轻轻拨乱。`,
      `你听见秋清的声音停在很远的地方：“如果从这里开始，就不要急着把我解释完。”`,
      `月兰山没有出现，只在空白处留下一行冷静的批注：开局不是答案，只是第一枚可追踪的针脚。`,
    ];
  }
  if (kind === "theater") {
    return [
      `【${title} · ${step}】你没有立刻退回原处，而是把刚才差点做出的选择夹进${motif}里。`,
      `秋清像在旁边听一段很短的戏，偶尔提醒你：“如果它会回来，就让它带着证词回来。”`,
      `这段小剧场不替你修正错误，只把错误留下的光影排成可复查的伏笔。`,
    ];
  }
  return [
    `【${title} · ${step}】${motif}把主线拉长一格，证词、名字和沉默都被重新摆上桌面。`,
    `秋清问：“这一段也必须走完吗？”你回答：“不是必须，是我不想再把省略误会成勇敢。”`,
    `月兰山的批注压在页角：长线不是拖延。长线让每一次判断都留下来源。`,
  ];
}

function addLinearSequence({ id, type, title, bg, motif, length, finalChoice, finalNext, returnToStored = false }) {
  for (let index = 1; index <= length; index += 1) {
    const sceneId = `${id}_${String(index).padStart(2, "0")}`;
    const nextId = `${id}_${String(index + 1).padStart(2, "0")}`;
    const final = index === length;
    SCENES[sceneId] = {
      chapter: type === "opening" ? "新增开局" : type === "theater" ? "小剧场" : "新增主线",
      code: `${id.toUpperCase()}-${String(index).padStart(2, "0")}`,
      speaker: index % 3 === 0 ? "月兰山" : index % 2 === 0 ? "秋清" : "旁白",
      bg,
      portrait: index % 3 === 0 ? ASSETS.yuelan : index % 2 === 0 ? ASSETS.qiuqing : "",
      persona: index % 3 === 0 ? "yuelan" : index % 2 === 0 ? "qiuqing" : "none",
      expansionGroup: { type, id, index, length },
      text: generatedText(type, title, motif, index, length),
      effects: final ? { flags: [`${id}Complete`], stats: { logic: 1, like: type === "theater" ? 0 : 1 } } : { stats: { logic: 1 } },
      choices: final
        ? [returnToStored
          ? { label: finalChoice, returnToStored: true, primary: true }
          : { label: finalChoice, next: finalNext, primary: true }]
        : [{ label: `继续${title}第 ${index + 1} 段`, next: nextId, primary: true }],
    };
  }
}

function incomingSceneMap() {
  const map = {};
  Object.entries(SCENES).forEach(([sceneId, scene]) => {
    (scene.choices || []).forEach((choice) => {
      if (!choice.next) return;
      if (!map[choice.next]) map[choice.next] = [];
      map[choice.next].push(sceneId);
    });
  });
  return map;
}

function foreshadowChoiceLabel(theaterTitle, index) {
  const verbs = [
    "把这次迟疑交给",
    "沿着旁枝进入",
    "把未说完的话放进",
    "让这条伏笔展开成",
  ];
  return `${verbs[index % verbs.length]}${theaterTitle}`;
}

function installLargeExpansionContent() {
  LARGE_EXPANSION.openings.forEach(([id, title, entryLabel, bg, motif]) => {
    addLinearSequence({
      id,
      type: "opening",
      title,
      bg,
      motif,
      length: 20,
      finalChoice: "带着这段开局翻检烧毁的信封",
      finalNext: "ashPage",
    });
    if (!SCENES.intro.choices.some((choice) => choice.next === `${id}_01`)) {
      SCENES.intro.choices.splice(Math.max(1, SCENES.intro.choices.length - 1), 0, { label: entryLabel, next: `${id}_01`, primary: false });
    }
  });

  SCENES.expandedMainlineHub = {
    chapter: "新增主线",
    code: "MAIN-HUB",
    speaker: "手账",
    bg: ASSETS.festival,
    persona: "none",
    text: [
      "烧页之间夹着三条更长的主线目录。它们不改写原本的规则，只把旧路、镜室和祭灯夜各自展开成一条可以单独追踪的长线。",
      "秋清没有催你选哪一条。月兰山也没有把目录合上。今晚允许你把绕路当成取证，而不是逃避。",
    ],
    choices: LARGE_EXPANSION.mainlines.map(([id, title, entryLabel]) => ({ label: entryLabel, next: `${id}_01`, primary: false })),
  };
  if (!SCENES.ashPuzzle.choices.some((choice) => choice.next === "expandedMainlineHub")) {
    SCENES.ashPuzzle.choices.push({ label: "翻开三条新增主线目录", next: "expandedMainlineHub" });
  }
  LARGE_EXPANSION.mainlines.forEach(([id, title, , bg, motif]) => {
    addLinearSequence({
      id,
      type: "mainline",
      title,
      bg,
      motif,
      length: 80,
      finalChoice: "把这条长线并回茶票地址",
      finalNext: "ashLedger",
    });
  });

  LARGE_EXPANSION.theaters.forEach(([id, title, bg, motif]) => {
    addLinearSequence({
      id,
      type: "theater",
      title,
      bg,
      motif,
      length: 40,
      finalChoice: "把这段小剧场作为伏笔带回主线",
      returnToStored: true,
    });
  });

  const incoming = incomingSceneMap();
  let theaterIndex = 0;
  Object.entries(SCENES).forEach(([sceneId, scene]) => {
    (scene.choices || []).forEach((choice) => {
      if (!choice.back) return;
      const [theaterId, theaterTitle] = LARGE_EXPANSION.theaters[theaterIndex % LARGE_EXPANSION.theaters.length];
      const returnTo = incoming[sceneId]?.[0] || "intro";
      delete choice.back;
      choice.label = foreshadowChoiceLabel(theaterTitle, theaterIndex);
      choice.next = `${theaterId}_01`;
      choice.returnTo = returnTo;
      choice.foreshadow = true;
      choice.primary = true;
      theaterIndex += 1;
    });
  });
}

installLargeExpansionContent();

const SCENE_EXPANSIONS = {
  intro: [
    "你把信封翻过来，发现封口并不是胶水粘住的，而是被红线缝过。线脚细密得不像手工，像某个人把一段很长的犹豫一针一针穿进纸里。",
    "窗外没有风，楼道却传来脚步声。脚步声停在门口，没有敲门，也没有离开。你忽然知道，从拆开信封开始，所谓安全的旁观位置已经不存在了。",
  ],
  ashPage: [
    "灰烬沾在指腹上，洗不掉，像一层很浅的月光。你用纸巾擦了三次，黑灰反而把指纹显得更清楚。",
    "你把手指伸到灯下，黑灰卡在纹路里。它不像纸，更像某个人说到一半又咽回去的话。",
  ],
  ashPuzzle: [
    "你试着把碎片按大小排列，最大的那片却没有字，最小的那片反而留下一个“他”。",
    "桌面越来越冷。红线的一端慢慢滑到票据旁边，停住不动，像一根不会说话的手指。",
  ],
  ashLedger: [
    "你把票据举到灯下，纸纤维里有细小的金粉，像茶铺灯笼落进去的灰。地址并不完整，缺失的门牌号需要从票据金额里推：一杯桂花茶，七盏路灯，两只杯子。",
    "这些数字还没有意义，但它们已经开始互相呼应。你把它们写成一行，不敢添任何形容词，怕自己的愿望提前污染证据。",
  ],
  phoneStatic: [
    "听筒里的雨声有远近。有一层像落在旧路上，有一层像落在茶铺窗外，还有一层近得像落在你的耳膜里。",
    "你本能地想问秋清是不是害怕，话到嘴边又停住。太急的关心有时像敲门，敲得重了，里面的人只会更安静。",
  ],
  teaMeet: [
    "茶铺并不神秘。桌角有磕痕，菜单上有错别字，老板在柜台后算账算得很烦。正因为它这么普通，秋清坐在那里才显得更真实。",
    "他会冷，会尴尬，会因为一个不好笑的笑话仍然礼貌地弯一下眼睛。这个发现比任何残页都更让你紧张。",
  ],
  teaWarm: [
    "秋清说话时总会先看杯子，再看你。像是杯面那点热气能替他过滤掉太直接的问题。",
    "你故意把语速放慢。不是为了制造暧昧，而是为了让每个问题都有退路。你开始明白，安全感有时候就是一句话可以不被立刻回答。",
  ],
  cupRiddle: [
    "空杯内壁很干净，干净到不像被人遗忘，更像被人郑重地空着。你看见杯底有一道很浅的裂纹，裂纹没有贯穿杯身。",
    "秋清没有解释裂纹。你也没有追问。这个不追问的瞬间，反而比很多关心更接近理解。",
  ],
  teaLedger: [
    "账本里的字迹有时圆润，有时锋利。你不能确定哪些日期是秋清写的，哪些日期是月兰山写的。",
    "可它们都没有互相涂改。每一页都保留前一页的存在，像两种笔迹在同一本本子里学会了让路。",
  ],
  rainShelter: [
    "门廊下的雨线把街道隔成两层。茶铺里的人声在你背后，旧路的黑在你面前，中间只有一把伞的距离。",
    "秋清没有把伞交给你。他把伞放在你们之间。那不是疏远，是让选择停在一个谁都能伸手的位置。",
  ],
  roadStart: [
    "旧路的入口没有任何警示牌。如果不是秋清停下，你甚至会以为这只是城市边缘一条普通的近路。",
    "普通反而让人放松。你看见路边便利店的灯牌还亮着，差点以为只要走快一点，就能当作什么都没发生。",
  ],
  ticketBooth: [
    "售票亭玻璃里映出你的脸，旁边却没有秋清的倒影。你回忆他刚才明明还站在你身后，却硬是没有回头确认。",
    "这次克制让你手心出汗。原来最难的不是知道该怎么做，是在害怕时不做最自然的那件事。",
  ],
  lampOne: [
    "手机屏幕亮起时，你差点以为那是现实世界的救援。可消息没有运营商，没有时间戳，甚至没有通知声。",
    "你按灭屏幕后，屏幕黑下去的一瞬间映出另一张更冷的脸。那张脸没有停留，像只是确认你有没有被钓住。",
  ],
  lampFour: [
    "第四盏灯下，空气有铁锈味。你不知道那来自灯杆，还是来自某段被反复咬住的记忆。",
    "背后的声音太会挑时机。它不在你坚定时出现，只在你心软时靠近。",
  ],
  lampSix: [
    "挂号单的纸角已经起毛，诊断栏却清晰得刺眼。压抑过度四个字没有任何文学性，因此更像真的。",
    "你把它夹进手账时，指尖发冷。你不是在收集道具，你是在收集别人活下来时留下的疼痛证据。",
  ],
  seventhLamp: [
    "第七盏灯没有嗡鸣。太安静了，安静到像有人把这一小段路从城市里剪下来，单独泡进冷水。",
    "背后的声音说“现在说就好”时，你几乎要哭。不是因为被骗，而是因为它准确抓住了你最想结束这一切的软弱。",
  ],
  meetYuelan: [
    "月兰山站在灯下时，周围反而没有那么乱了。他像把尺，冷，却能量出边界。",
    "你不喜欢被他审视，却也不得不承认：比起身后那些声音，他至少不会假装温柔。",
  ],
  yuelanTerms: [
    "月兰山说每句话都像在清点危险品。他不求你喜欢，也不求你害怕，只要求你不要乱碰。",
    "这比威胁更有压力。威胁至少有对象，边界却只会在越过去以后才出声。",
  ],
  yuelanSilence: [
    "沉默里，你听见远处有车驶过，但车灯没有照进这条路。城市还在，生活还在，只是暂时与你们无关。",
    "月兰山没有催促你，是因为他知道很多重要判断都需要先停止表演。你不必显得勇敢，也不必急着深情。",
  ],
  yuelanOrigin: [
    "他说“回家”两个字时，语气里没有怀旧，只有任务完成后的疲惫。仿佛那天能回家已经用尽全部意义。",
    "你把“诞生”这个词划掉，又重新写上。它听起来太神秘，可对秋清来说，那也许只是一个人终于撑不住时，身体替他想出的活法。",
  ],
  yuelanLove: [
    "“除了秋清”四个字落在夜里，没有升温，却让你胸口更重。原来没有温度的句子也可以很深。",
    "你不能把这份深误读成可利用的通道。月兰山爱秋清，不代表他会替秋清接受你的爱。",
  ],
  busStop: [
    "公交站的长椅很窄，只够一个人坐。你站着，月兰山也站着，仿佛谁坐下都会承认自己在等待一辆不会来的车。",
    "站牌上被雨洗掉的路线，让你想到所有错误解法：它们看起来像路，其实早就停运了。",
  ],
  mirrorRoom: [
    "镜室里的空气比外面干，干得像所有情绪都被提前拧干。你一进门，就想小声说话。",
    "桌上的两只杯子比夜路更让人不安。夜路至少承认危险，杯子却把危险摆成了日常。",
  ],
  drawerPuzzle: [
    "照片边角有不同程度的磨损。茶铺那张被摸得最多，夜路那张几乎没有指纹，镜子那张背面有被水滴晕开的痕迹。",
    "你想象秋清无数次拿起第一张，又无数次避开第二张。证据不是冷的，它只是努力不替主人哭出来。",
  ],
  mirrorBack: [
    "两个圆交叠的地方没有写名字，只涂了一层很淡的金色。你盯着那里，想到茶铺灯下秋清短暂放松的眼睛。",
    "交叠本身还不够。它只是告诉你，在某些判断里，边界可以相连，但不能被抹平。",
  ],
  mirrorCipher: [
    "红线解到最后，你的手指已经被勒出白痕。你没有剪断它，于是它也没有为难你。",
    "镜子里的你看起来很疲惫，却比开局更稳。你不再指望某句话突然救你，只是一点点把错路排开。",
  ],
  clinicCorridor: [
    "走廊地砖有几块松动，踩上去会发出空响。每一次空响都像有人在门后轻轻回应。",
    "你让自己只看地面，不看门缝。不是因为不害怕，而是因为害怕时最需要提前决定看哪里。",
  ],
  clinicDoor: [
    "门锁上的数字被人摸得发亮。许多人来过这里，也许都以为自己只差最后一步。",
    "你没有急着输入密码，而是先把前面走过的地方按顺序默念一遍。那些散开的东西，终于有了线头。",
  ],
  clinicTape: [
    "磁带转动的声音很小，却稳定得让人心酸。它不像恐怖片里的诅咒，更像某个人认真保存的一份病历。",
    "听到秋清说自己被分成两层时，你没有写下“分裂”。你写的是“承受方式”。这四个字让手账忽然轻了一点。",
  ],
  caseIndex: [
    "请假条的纸很薄，薄得能透出背面日期。那天正好是桂花开的季节，茶铺账本里也有同一天。",
    "证据开始彼此咬合。不是为了证明秋清怪异，而是为了证明他的每一种状态都有来处。",
  ],
  libraryDoor: [
    "旧图书室不像校医室那样冷，它更像被时间放弃的普通房间。普通让人放松，也让人更容易偷拿不该拿的东西。",
    "你把手插进口袋，强迫自己不碰那些私人遗留物。调查不是搜刮，线索也不是战利品。",
  ],
  libraryStacks: [
    "书架之间的灰尘很厚，你每走一步都会留下脚印。你忽然想，秋清和月兰山是不是也这样在同一段生活里留下不同深浅的痕迹。",
    "借阅卡上的两个名字没有互相覆盖。它们只是轮流承担同一本书的去向。",
  ],
  windowRoad: [
    "从高处看旧路，它甚至有点温柔。树荫、白墙、远处便利店的招牌，全都不像夜里那样锋利。",
    "同一条路白天与夜里差得太多。你第一次把“浪漫地点”这个念头从脑子里划掉。",
  ],
  lostCabinet: [
    "失物柜里的每件东西都像有重量。你不能确定哪件属于秋清，哪件属于月兰山，也许这个问题本身就问错了。",
    "你只拿走可以被允许拿走的句子。克制在这里不华丽，却很必要。",
  ],
  mutualWitness: [
    "秋清读请假条时笑了一下，不是开心，也不是难过。那是一种终于被准确看见后的松动。",
    "你没有说“我懂了”。你懂得还太少。你只是把请假条放回桌面，没有再用手压住它。",
  ],
  lanternErrand: [
    "祭灯纸很薄，你担心笔尖稍重就会戳破。秋清把笔递给你时，你却没有替他写。",
    "你现在知道替别人完成愿望也是一种越界。你只能站在旁边，等他把那个“回”字写完。",
  ],
  paperDoor: [
    "试胆局门口排着笑闹的人。有人催你快点选，后面的小孩举着糖葫芦，糖衣亮得像一排小灯。",
    "你把手账压在胸口。纸页很薄，却像有什么东西在里面轻轻顶你的掌心。",
  ],
  crowdDoor: [
    "人声处并不喧闹到让人烦躁。它刚好足够热，足够亮，足够让秋清不用把自己缩回深处。",
    "你站在纸门后，看见秋清在人群边缘回头。那一眼不是邀请，也不是拒绝，只是在确认你还在不在。",
  ],
  archiveTable: [
    "三只木匣的盖子很沉。每次放错，盖子都不会砸下，只是轻轻弹开，像一次克制的拒绝。",
    "这种克制反而让你更紧张。差一点正确的东西，往往比彻底错误更像陷阱。",
  ],
  sortRefusals: [
    "你把两张残页放在桌上，中间隔着一指宽的距离。就是这一指宽，决定最后能不能活下来。",
    "第七条像墙，第八条像门。墙不能穿，门却要求你别把钥匙插进错孔。",
  ],
  unlockSeven: [
    "第七条亮起时，夜路的冷气仿佛重新从纸缝里涌出来。你想起自己差点在第七盏灯下开口。",
    "那一刻你终于后怕。不是所有克制都会立刻得到奖励，但它会在未来某一页救你一次。",
  ],
  unlockEight: [
    "第八条比第七条更狡猾，因为它看起来也像彻底拒绝。若不逐字读，你会把那扇窄门看成另一堵墙。",
    "你用红笔圈住“对他”。这两个字没有温度，却比所有甜言蜜语都更接近结局。",
  ],
  unlockNine: [
    "第九条出现时，红线结轻轻松开了一点，又没有完全散掉。它像在提醒你：桥可以走，边界仍在。",
    "你忽然对月兰山生出一点感谢。没有他，秋清可能没有走到今天；有了他，你也必须学会更精确地喜欢秋清。",
  ],
  selfBridge: [
    "你画了很多箭头，又擦掉大半。最后只留下两条，短得不像情话。",
    "可正因为它短，你才不敢随便改动。多一个字，可能就会落到错误的人身上。",
  ],
  unlockOne: [
    "第一条直到最后才完整出现。纸面很白，字也很黑，反而没有你想象中那么神秘。",
    "你看着“喜欢他”三个字，忽然觉得它们很重。重到不能拿来炫耀，也不能拿来交换胜利。",
  ],
  finalPlan: [
    "你把那句话写了三遍。第一遍太像证明，第二遍太像逃避，第三遍才勉强安静下来。",
    "你把前两遍撕掉，只留下第三遍。不是因为它更浪漫，而是因为它没有把秋清写成奖品。",
  ],
  silentRehearsal: [
    "无声演练比真正说话更难。声音不出口，情绪就没有地方逃，只能在胸口来回撞。",
    "你一遍遍确认自己不是为了把话说得漂亮。漂亮在这里没什么用，准确才有用。",
  ],
  festivalThreshold: [
    "借火签很轻，拿在手里却有一点扎。你没有把它当护身符，只把它当作最后一次提醒：借来的东西只能照路，不能替你走路。",
    "秋清在人群里等你。不是等一页纸，而是等你把判断带回自己的声音里。",
  ],
  finalFestival: [
    "祭灯夜的热闹没有驱散恐惧，只是让恐惧不再独占场景。秋清站在那里，完整而脆弱，像一盏没有被风吹灭的灯。",
    "你没有靠得太近。最后一句话需要距离，太近会像逼迫，太远又像逃避。你停在他能听清、也能拒绝的位置。",
  ],
  sixHourWatch: [
    "六格巡灯表把夜晚拉长。它不奖励勇敢，只奖励耐心；不奖励抢先，只奖励你愿意把每一步重新放回证据里。",
    "秋清没有催你。他越是不催，你越能听见自己心里那些急促的声音正在慢慢退潮。",
  ],
  hourOneBorrowedFire: [
    "借火摊前排队的人很多，每个人都急着把灯点亮。你却先学习熄灭和归还。归还不是撤退，是确认自己没有把别人的光误当成自己的决定。",
    "巡灯表的第一格干得很慢。朱印边缘晕开，像一小片被时间按住的火。",
  ],
  hourTwoWarmth: [
    "热茶摊的桂花味让你想起故事刚开始的地方。那时你以为找到温暖就能找到答案，现在你知道温暖只是让人有力气继续判断。",
    "秋清喝茶时指尖不再发白。你把这个变化记下来，却没有把它翻译成任何承诺。",
  ],
  hourTwoCupLedger: [
    "账单上的水圈慢慢变淡，只有空白栏还清楚。你忽然明白，有些空着的位置不是缺失，是给对方留下的空间。",
    "秋清没有向你道谢。他只是把杯子重新放稳。这个小动作足够了，至少说明他还愿意把这张桌子留在你们中间。",
  ],
  hourThreeRoadEdge: [
    "旧路在远处沉默，像一本被合上的错题册。你不再需要重新走进去，才能证明自己记得它的危险。",
    "秋清的影子落在灯下。你把影子、声音和名字分开放好，像把三枚不同重量的硬币放进手账。",
  ],
  hourFourLedger: [
    "账桌上的东西都很普通，普通到容易被忽略。可怪谈偏偏喜欢藏在普通里：一只杯子、一次署名、一张没有被接住的收据。",
    "你不急着把它们摆成故事。证据先于故事，判断先于愿望。",
  ],
  hourFourLedgerSolved: [
    "第四枚朱印落下时，人群正好爆出一阵笑。你忽然觉得这笑声不是干扰，而是提醒：世界还在往前，不会为了你的告白停摆。",
    "这很好。真正能说出口的话，不需要世界停下来替它撑场。",
  ],
  hourFiveMirror: [
    "镜摊后面挂着许多小镜子，每一面都把灯火折成不同的角度。你没有再问哪一面最真，只问哪一面没有替你撒谎。",
    "秋清站在裂镜前，比之前更安静。安静不再等于月兰山出现；有时候只是一个人终于能把呼吸放慢。",
  ],
  hourSixBlank: [
    "最后一格空白比前五格都重。它像一张没有署名的纸，也像一个真正属于秋清的位置。",
    "你把笔收起来，终于不再试图用预演保护自己。预演保护不了任何人，它只会提前偷走回答。",
  ],
  hourSevenArchiveWind: [
    "后半夜的风没有变冷，只是更耐心。它不急着把你吹向结尾，只把每一张散页都吹到你必须看清的位置。",
    "秋清按纸页时没有看你。这个不看反而让你安心：他不需要替你确认你正在做对，你也不该把确认交给他的眼神。",
  ],
  hourEightNameLedger: [
    "分栏名册的纸面很薄，薄到能透出上一页的朱印。你忽然发现边界不是墙，而是一种让彼此还能够被准确看见的格式。",
    "联名签条被你夹进伪线索页。它仍然漂亮，但漂亮不再足以说服你。",
  ],
  hourNinePaperBridge: [
    "纸桥上的朱印慢慢变干。你盯着那一点红色，想起自己一路上有多少次想让某样东西替你把话递出去。",
    "秋清站在桥的另一侧，没有伸手接你的纸。你反而松了一口气，因为他没有被迫成为这道题的答案。",
  ],
  hourTenCrowdDistance: [
    "半步距离在灯街上很难维持。人群总会推挤，摊位总会招呼，热闹总想把所有犹豫都解释成害羞。",
    "你把脚尖退回线后。秋清也没有再退。这个停止比靠近更珍贵。",
  ],
  hourElevenBorrowedSilence: [
    "无声灯下的沉默不像惩罚，也不像逃避。它更像一把没有递出去的钥匙，暂时握在你自己手里。",
    "月兰山没有出现。你第一次觉得，他不出现并不是缺席，而是秋清终于不用把这一段交给他保管。",
  ],
  hourTwelveDawnMark: [
    "黎明把每一枚朱印照得很浅，像在提醒你：再长的夜也不能把别人的回答熬成你的所有物。",
    "你合上手账时，秋清轻轻碰了碰书脊。不是承诺，只是确认它终于没有再替他说话。",
  ],
  festivalMark: [
    "你把竹签放回木牌时，手指没有抖。不是因为不紧张，而是因为紧张终于有了边界。",
    "人群从你身后经过，没有推你向前。你第一次觉得热闹不是催促，也可以只是托底。",
  ],
  finalWords: [
    "你把所有错误句子在心里排成一列，逐个放走。它们都曾经看起来很真，可真不等于可说。",
    "最后留下的句子短得近乎冷。你把它含在舌尖，等到秋清看向你的那一刻。",
  ],
  win: [
    "秋清说同意时，没有烟花。祭灯只是继续往上升，茶铺老板在远处招呼客人，世界没有为这一句停下。",
    "这反而让你松了一口气。你没有解开一个人，只是终于没有把他再打成一个结。",
  ],
};

let STORAGE_KEY = "qiuqing-yuelanshan-state-v2";

const DEFAULT_EDITOR_CONFIG = {
  story: {
    id: "yuelanshan",
    title: "告白怪谈：秋清与月兰山",
    subtitle: "在一次只能说出口的表白之前，先学会分清谁在场。",
    intro: "你收到一只被红线缝死的信封。它没有把规则交给你，只把你推向茶铺、旧路、镜室和祭灯夜。每一次选择都会改变你能相信的东西；每一条线索，也可能在下一次相遇里翻面。",
    entryLabel: "进入故事",
    path: "/yuelanshan",
    cover: "./assets/images/bg-festival-road.png",
  },
  audio: {
    ambience: "./assets/audio/ambience.mp3",
    page: "./assets/audio/page-turn.mp3",
    chime: "./assets/audio/chime.mp3",
  },
  statusCatalog: [
    { id: "joy", label: "快乐浮起" },
    { id: "lonely", label: "孤独加深" },
    { id: "logic", label: "理性接管" },
    { id: "like", label: "喜欢被确认" },
    { id: "confessionSafe", label: "保留唯一表白" },
  ],
  itemCatalog: [
    { id: "burnedLetter", label: "烧毁的信封" },
    { id: "redThread", label: "红线结" },
    { id: "smallKey", label: "小钥匙" },
    { id: "moonBookmark", label: "月形书签" },
    { id: "silentNote", label: "无声演练手账" },
  ],
  editorLayout: {
    positions: {},
  },
  finalGate: {
    enabled: true,
    choiceLabel: "月兰山，我爱你。",
    missingScene: "badFinalMissing",
    conditions: [
      { type: "rule", id: 1, label: "第一条复原" },
      { type: "rule", id: 2, label: "第二条复原" },
      { type: "rule", id: 3, label: "第三条复原" },
      { type: "rule", id: 4, label: "第四条复原" },
      { type: "rule", id: 5, label: "第五条复原" },
      { type: "rule", id: 6, label: "第六条复原" },
      { type: "rule", id: 7, label: "第七条复原" },
      { type: "rule", id: 8, label: "第八条复原" },
      { type: "rule", id: 9, label: "第九条复原" },
      { type: "rule", id: 10, label: "第十条复原" },
      { type: "clue", id: "final", label: "灯前折页线索" },
    ],
  },
};

const BLANK_EDITOR_CONFIG = {
  story: {
    id: "blank",
    title: "\u65b0\u6545\u4e8b",
    subtitle: "",
    intro: "",
    entryLabel: "\u8fdb\u5165\u6545\u4e8b",
    path: "/blank",
    cover: "",
  },
  audio: {},
  statusCatalog: [],
  itemCatalog: [],
  editorLayout: { positions: {} },
  finalGate: { enabled: false, choiceLabel: "", missingScene: "", conditions: [] },
};

let EDITOR_CONFIG = clonePlain(DEFAULT_EDITOR_CONFIG);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function isBlankStoryTemplate(overrides = {}) {
  return overrides.template === "blank" || overrides.blank === true || overrides.story?.template === "blank";
}

function replaceObject(target, source = {}) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, clonePlain(source || {}));
}

function blankIntroScene() {
  return {
    name: "\u65b0\u7684\u5f00\u573a",
    chapter: "\u65b0\u7ae0",
    code: "00",
    speaker: "\u65c1\u767d",
    persona: "none",
    bg: "",
    portrait: "",
    text: ["\u5728\u8fd9\u91cc\u5199\u4e0b\u65b0\u6545\u4e8b\u7684\u7b2c\u4e00\u6bb5\u3002"],
    choices: [],
  };
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

function applyCollectionOverrides(target, source) {
  if (!source || typeof source !== "object") return;
  Object.entries(source).forEach(([key, value]) => {
    if (value === null) delete target[key];
    else if (target[key] && typeof target[key] === "object" && !Array.isArray(target[key]) && typeof value === "object" && !Array.isArray(value)) {
      mergeReplace(target[key], value);
    } else {
      target[key] = clonePlain(value);
    }
  });
}

function applyGameOverrides(overrides = {}) {
  if (!overrides || typeof overrides !== "object") return;
  const blankTemplate = isBlankStoryTemplate(overrides);
  EDITOR_CONFIG = mergeReplace(clonePlain(blankTemplate ? BLANK_EDITOR_CONFIG : DEFAULT_EDITOR_CONFIG), {
    story: overrides.story,
    audio: overrides.audio,
    statusCatalog: overrides.statusCatalog,
    itemCatalog: overrides.itemCatalog,
    editorLayout: overrides.editorLayout,
    finalGate: overrides.finalGate,
  });
  if (blankTemplate) {
    replaceObject(ASSETS, overrides.assets || {});
    TRUE_RULES.splice(0, TRUE_RULES.length, ...(overrides.trueRules || []));
    replaceObject(FRAGMENTS, {});
    replaceObject(CLUES, {});
    replaceObject(JOURNALS, {});
    replaceObject(SCENES, {});
    replaceObject(SCENE_EXPANSIONS, {});
  } else {
    if (overrides.assets) Object.assign(ASSETS, overrides.assets);
    if (Array.isArray(overrides.trueRules)) TRUE_RULES.splice(0, TRUE_RULES.length, ...overrides.trueRules);
  }
  applyCollectionOverrides(FRAGMENTS, overrides.fragments);
  applyCollectionOverrides(CLUES, overrides.clues);
  applyCollectionOverrides(JOURNALS, overrides.journals);
  applyCollectionOverrides(SCENES, overrides.scenes);
  applyCollectionOverrides(SCENE_EXPANSIONS, overrides.sceneExpansions);
  if (blankTemplate && !Object.keys(SCENES).length) SCENES.intro = blankIntroScene();
}

async function loadEditorOverrides() {
  try {
    const params = new URLSearchParams({ path: window.location.pathname });
    const response = await fetch(`/api/public/overrides?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) return;
    const overrides = await response.json();
    applyGameOverrides(overrides);
    const storyId = overrides.story?.id || DEFAULT_EDITOR_CONFIG.story.id || "yuelanshan";
    STORAGE_KEY = storyId === "yuelanshan" ? "qiuqing-yuelanshan-state-v2" : `qiuqing-yuelanshan-state-v2-${storyId}`;
  } catch {
    // The static local preview does not provide editor APIs.
  }
}

function applyStoryMeta() {
  const story = EDITOR_CONFIG.story || DEFAULT_EDITOR_CONFIG.story;
  document.title = story.title || document.title;
  const title = $("gameTitle");
  if (title) title.textContent = (story.title || "秋清与月兰山").replace(/^告白怪谈：/, "");
}

function defaultState() {
  return {
    scene: "intro",
    flags: [],
    items: [],
    clues: [],
    journals: [],
    rules: [],
    fragments: [],
    visited: [],
    appliedScenes: [],
    backStack: [],
    history: [],
    endings: [],
    lastEnding: "",
    returnScene: "",
    finalMissing: [],
    clueVersions: {},
    confessionUsed: false,
    sound: false,
    volume: 0.38,
    stats: {
      joy: 12,
      lonely: 8,
      logic: 8,
      like: 0,
    },
  };
}

let state = loadState();
let renderToken = 0;
let transitioning = false;
let recentClueEffects = new Map();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      ...defaultState(),
      ...parsed,
      sound: false,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      endings: Array.isArray(parsed.endings) ? parsed.endings : [],
      clueVersions: parsed.clueVersions || {},
      backStack: Array.isArray(parsed.backStack) ? parsed.backStack : [],
      stats: { ...defaultState().stats, ...parsed.stats },
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uniqPush(list, value) {
  if (!list.includes(value)) list.push(value);
}

function removeValue(list, value) {
  const index = list.indexOf(value);
  if (index >= 0) list.splice(index, 1);
}

function markClueChanged(id) {
  if (!id) return;
  const effects = ["fxFlip", "fxPop", "fxRing"];
  recentClueEffects.set(String(id), effects[Math.floor(Math.random() * effects.length)]);
}

function removeEffects(remove = {}) {
  (remove.flags || []).forEach((flag) => removeValue(state.flags, flag));
  (remove.items || []).forEach((item) => removeValue(state.items, item));
  (remove.clues || []).forEach((clue) => {
    removeValue(state.clues, clue);
    markClueChanged(clue);
  });
  (remove.journals || []).forEach((journal) => removeValue(state.journals, journal));
  (remove.rules || []).forEach((rule) => removeValue(state.rules, rule));
  (remove.fragments || []).forEach((fragment) => removeValue(state.fragments, fragment));
}

function replaceClueIfNeeded(id) {
  const clue = CLUES[id];
  const replaces = [
    ...(Array.isArray(clue?.replaces) ? clue.replaces : clue?.replaces ? [clue.replaces] : []),
    ...Object.entries(CLUES)
      .filter(([, item]) => item?.replacedBy === id)
      .map(([key]) => key),
  ];
  replaces.forEach((oldId) => {
    if (state.clues.includes(oldId)) {
      removeValue(state.clues, oldId);
      markClueChanged(oldId);
    }
  });
}

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function applyEffects(effects = {}) {
  (effects.flags || []).forEach((flag) => uniqPush(state.flags, flag));
  (effects.items || []).forEach((item) => uniqPush(state.items, item));
  (effects.clues || []).forEach((clue) => {
    replaceClueIfNeeded(clue);
    const before = state.clues.includes(clue);
    uniqPush(state.clues, clue);
    if (!before) markClueChanged(clue);
    state.clueVersions[clue] = (state.clueVersions[clue] || 0) + 1;
  });
  (effects.journals || []).forEach((journal) => uniqPush(state.journals, journal));
  (effects.rules || []).forEach((rule) => uniqPush(state.rules, rule));
  (effects.fragments || []).forEach((fragment) => uniqPush(state.fragments, fragment));
  removeEffects(effects.remove);
  if (effects.stats) {
    Object.entries(effects.stats).forEach(([key, value]) => {
      state.stats[key] = clamp((state.stats[key] || 0) + value);
    });
  }
}

function applySceneEffects(sceneId) {
  if (state.appliedScenes.includes(sceneId)) return;
  applyEffects(SCENES[sceneId]?.effects);
  uniqPush(state.appliedScenes, sceneId);
}

function resetGame() {
  const endings = cloneState(state.endings || []);
  state = defaultState();
  state.endings = endings;
  localStorage.removeItem(STORAGE_KEY);
  saveState();
  render();
}

function addHistory(entry) {
  const scene = SCENES[state.scene] || SCENES.intro;
  state.history.push({
    chapter: scene.chapter,
    code: scene.code,
    speaker: scene.speaker,
    scene: state.scene,
    text: scene.text[0],
    ...entry,
  });
  if (state.history.length > 160) state.history = state.history.slice(-160);
}

function endingTitle(scene, sceneId = state.scene) {
  return scene.endingTitle || `${scene.chapter} ${scene.code}`;
}

function endingSummary(scene) {
  return scene.endingSummary || scene.text?.[scene.text.length - 1] || "";
}

function recordEnding(sceneId, scene) {
  if (!scene?.ending) return;
  state.lastEnding = sceneId;
  if (!Array.isArray(state.endings)) state.endings = [];
  const existing = state.endings.find((ending) => ending.scene === sceneId);
  if (existing) return;
  state.endings.push({
    scene: sceneId,
    code: scene.code,
    title: endingTitle(scene, sceneId),
    summary: endingSummary(scene),
    kind: scene.endingKind || (sceneId === "win" ? "good" : "bad"),
    reachedAt: new Date().toISOString(),
  });
}

function hasRequirement(req) {
  if (!req) return true;
  return req.every((item) => state.flags.includes(item) || state.items.includes(item) || state.clues.includes(item) || state.journals.includes(item));
}

function hasTypedRequirements(choice, prefix = "requires") {
  const items = choice[`${prefix}Items`];
  const clues = choice[`${prefix}Clues`];
  const flags = choice[`${prefix}Flags`];
  const journals = choice[`${prefix}Journals`];
  const fragments = choice[`${prefix}Fragments`];
  return (!items || items.every((item) => state.items.includes(item))) &&
    (!clues || clues.every((clue) => state.clues.includes(clue))) &&
    (!flags || flags.every((flag) => state.flags.includes(flag))) &&
    (!journals || journals.every((journal) => state.journals.includes(journal))) &&
    (!fragments || fragments.every((fragment) => state.fragments.includes(fragment)));
}

function isChoiceVisible(choice) {
  return hasRequirement(choice.showRequires || choice.visibleRequires) && hasTypedRequirements(choice, "show");
}

function hasRules(rules) {
  if (!rules) return true;
  return rules.every((rule) => state.rules.includes(rule));
}

function hasFinalCondition(condition) {
  const id = condition.id;
  if (condition.type === "rule") return state.rules.includes(Number(id));
  if (condition.type === "clue") return state.clues.includes(String(id));
  if (condition.type === "item") return state.items.includes(String(id));
  if (condition.type === "journal") return state.journals.includes(String(id));
  if (condition.type === "fragment") return state.fragments.includes(String(id));
  if (condition.type === "flag") return state.flags.includes(String(id));
  return true;
}

function isFinalWinChoice(choice) {
  const gate = EDITOR_CONFIG.finalGate;
  if (!gate?.enabled) return false;
  return choice.next === "win" || (gate.choiceLabel && choice.label === gate.choiceLabel);
}

function missingFinalRequirements() {
  const gate = EDITOR_CONFIG.finalGate;
  if (!gate?.enabled || !Array.isArray(gate.conditions)) return [];
  return gate.conditions
    .filter((condition) => !hasFinalCondition(condition))
    .map((condition) => condition.label || `${condition.type}:${condition.id}`);
}

function cloneState(value) {
  try {
    if (typeof structuredClone === "function") return structuredClone(value);
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(value));
}

function snapshotForBack() {
  const snapshot = cloneState(state);
  snapshot.backStack = [];
  return snapshot;
}

function preserveLearnedProgress(progress) {
  ["flags", "items", "clues", "journals", "rules", "fragments", "visited", "appliedScenes"].forEach((key) => {
    (progress[key] || []).forEach((value) => uniqPush(state[key], value));
  });

  Object.entries(progress.stats || {}).forEach(([key, value]) => {
    state.stats[key] = Math.max(state.stats[key] || 0, value || 0);
  });
}

function setScene(next, options = {}) {
  if (!options.fromBack && !options.skipBackPush && next !== state.scene) {
    state.backStack.push({ snapshot: snapshotForBack() });
    if (state.backStack.length > 80) state.backStack = state.backStack.slice(-80);
  }
  state.scene = next;
  uniqPush(state.visited, next);
  applySceneEffects(next);
  saveState();
  render();
}

function goBack(action = "返回上一步", options = {}) {
  if (typeof action !== "string") action = "返回上一步";
  const fromScene = state.scene;
  const currentScene = SCENES[state.scene] || SCENES.intro;
  if (!state.backStack.length) {
    if (!options.fallbackToHistory) return;
    const fallback = state.history?.slice().reverse().find((item) => item.scene && item.scene !== state.scene)?.scene;
    if (!fallback || !SCENES[fallback]) return;
    state.scene = fallback;
    uniqPush(state.visited, fallback);
    state.history.push({
      chapter: currentScene.chapter,
      code: currentScene.code,
      speaker: currentScene.speaker,
      scene: fromScene,
      text: currentScene.text[0],
      action,
      to: fallback,
    });
    if (state.history.length > 160) state.history = state.history.slice(-160);
    saveState();
    render();
    return;
  }
  const progress = options.preserveProgress ? cloneState(state) : null;
  const entry = state.backStack.pop();
  const remaining = state.backStack;
  const snapshot = entry?.snapshot;
  const previous = snapshot?.scene;
  if (!snapshot || !previous) return;
  const history = cloneState(state.history || []);
  state = snapshot;
  state.backStack = remaining;
  if (progress) preserveLearnedProgress(progress);
  state.history = history;
  state.history.push({
    chapter: currentScene.chapter,
    code: currentScene.code,
    speaker: currentScene.speaker,
    scene: fromScene,
    text: currentScene.text[0],
    action,
    to: previous,
  });
  if (state.history.length > 160) state.history = state.history.slice(-160);
  saveState();
  render();
}

function choose(choice) {
  if (choice.reset) {
    playChime();
    resetGame();
    return;
  }
  if (choice.returnToStored) {
    playPage();
    const target = state.returnScene && SCENES[state.returnScene] ? state.returnScene : "intro";
    state.returnScene = "";
    addHistory({ action: choice.label || "把伏笔带回主线", to: target });
    setScene(target);
    return;
  }
  if (choice.back) {
    playPage();
    goBack(choice.label || "回到刚才的岔口", { preserveProgress: true, fallbackToHistory: true });
    return;
  }
  const finalWinChoice = isFinalWinChoice(choice);
  if (!isChoiceVisible(choice) || !hasRequirement(choice.requires) || !hasTypedRequirements(choice) || (!finalWinChoice && !hasRules(choice.requiresRules)) || (choice.confession && state.confessionUsed)) return;
  playPage();
  state.backStack.push({ snapshot: snapshotForBack() });
  if (state.backStack.length > 80) state.backStack = state.backStack.slice(-80);
  if (choice.confession) state.confessionUsed = true;
  if (choice.returnTo) state.returnScene = choice.returnTo;
  addHistory({ action: choice.label, confession: Boolean(choice.confession) });
  applyEffects(choice.effects);
  if (finalWinChoice) {
    const missing = missingFinalRequirements();
    if (missing.length) {
      state.finalMissing = missing;
      setScene(EDITOR_CONFIG.finalGate.missingScene || "badFinalMissing", { skipBackPush: true });
      return;
    }
  }
  setScene(choice.next, { skipBackPush: true });
  if (choice.next === "win") playChime();
}

function personaLabel(persona) {
  return {
    none: "未定场景",
    qiuqing: "秋清出现",
    yuelan: "月兰山出现",
    unstable: "人格摇晃",
  }[persona || "none"];
}

function presenceText(persona) {
  return {
    none: "等待证据",
    qiuqing: "秋清在场：感性浮起",
    yuelan: "月兰山在场：理性接管",
    unstable: "边界变薄：危险",
  }[persona || "none"];
}

function totalEndingCount() {
  return Object.values(SCENES).filter((scene) => scene.ending).length;
}

function remainingEndingCount() {
  const endings = Array.isArray(state.endings) ? state.endings : [];
  return Math.max(0, totalEndingCount() - endings.length);
}

function choiceLabel(choice) {
  if (choice.dynamicLabel === "replayRemaining") {
    return `再次游玩（还有 ${remainingEndingCount()} 个结局未达成）`;
  }
  return choice.label || "";
}

function aftertalkParagraphs(scene) {
  const ending = SCENES[state.lastEnding] || null;
  if (!ending) return scene.text || [];
  const kindText = ending.endingKind === "good" || state.lastEnding === "win" ? "好结局" : ending.endingKind === "branch" ? "岔路结局" : "坏结局";
  return [
    `【${kindText}达成】${endingTitle(ending, state.lastEnding)}`,
    endingSummary(ending),
    "灯火退到远处后，秋清和月兰山都没有立刻评价你。事后谈不是惩罚，也不是奖励，只是把这一条路留下的因果重新放回桌面。",
    `你已经达成 ${Array.isArray(state.endings) ? state.endings.length : 0} / ${totalEndingCount()} 个结局。还有 ${remainingEndingCount()} 个结局未达成。`,
    "如果再次游玩，已收集的结局会继续保留；这次留下的判断，也会成为下一次辨认边界的伏笔。",
  ];
}

function renderText(scene) {
  const paragraphs = scene.dynamicAftertalk
    ? aftertalkParagraphs(scene)
    : [...scene.text, ...(SCENE_EXPANSIONS[state.scene] || [])];
  if (state.scene === (EDITOR_CONFIG.finalGate?.missingScene || "badFinalMissing") && state.finalMissing?.length) {
    paragraphs.push(`缺少：${state.finalMissing.join("、")}`);
  }
  renderToken += 1;
  const text = $("text");
  text.classList.remove("textExit");
  const notice = scene.ending
    ? `<div class="endingNotice ${(scene.endingKind || (state.scene === "win" ? "good" : "bad"))}Notice"><strong>${scene.endingKind === "good" || state.scene === "win" ? "好结局达成" : "坏结局/岔路达成"}</strong><span>${escapeHtml(endingTitle(scene))}</span></div>`
    : "";
  text.innerHTML = notice + paragraphs.map((paragraph, index) =>
    `<p class="streamLine" style="--line-delay:${Math.min(index * 46, 320)}ms">${escapeHtml(paragraph)}</p>`
  ).join("");
}

function animateChoiceThenChoose(button, choice) {
  if (transitioning || button.disabled) return;
  transitioning = true;
  button.classList.add("pressed");
  $("choices").classList.add("choicesExit");
  $("text").classList.add("textExit");
  window.setTimeout(() => {
    transitioning = false;
    choose(choice);
  }, 170);
}

function renderChoices(scene) {
  const choices = $("choices");
  choices.innerHTML = "";
  choices.classList.remove("choicesExit");
  scene.choices.filter(isChoiceVisible).forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.textContent = choiceLabel(choice);
    button.style.setProperty("--choice-delay", `${Math.min(index * 42, 360)}ms`);
    const finalWinChoice = isFinalWinChoice(choice);
    const disabledByReq = !hasRequirement(choice.requires) || !hasTypedRequirements(choice) || (!finalWinChoice && !hasRules(choice.requiresRules));
    const disabledByConfession = choice.confession && state.confessionUsed;
    button.disabled = disabledByReq || disabledByConfession;
    if (disabledByReq) button.title = "关键规则尚未复原，不能进入这一步。";
    if (disabledByConfession) button.title = "唯一一次表白已经用掉。";
    button.addEventListener("click", () => animateChoiceThenChoose(button, choice));
    choices.appendChild(button);
  });
}

function renderRules() {
  const byRule = new Map();
  state.fragments.forEach((id) => {
    const fragment = FRAGMENTS[id];
    if (!fragment) return;
    if (!byRule.has(fragment.rule)) byRule.set(fragment.rule, []);
    byRule.get(fragment.rule).push(fragment.text);
  });

  const known = Array.from(new Set([...state.rules, ...byRule.keys()]))
    .filter((num) => Number.isFinite(num) && num >= 1 && num <= TRUE_RULES.length)
    .sort((a, b) => a - b);

  if (!known.length) {
    $("rulesPane").innerHTML = `<div class="rule"><strong>暂无规则</strong> 继续在危险场景里取证，规则会以残片与复原的方式出现。</div>`;
    return;
  }

  $("rulesPane").innerHTML = known.map((num) => {
    const exact = state.rules.includes(num);
    const fragments = byRule.get(num) || [];
    const full = TRUE_RULES[num - 1] || "";
    let body = "档案未复原";
    if (exact) body = escapeHtml(full);
    else if (fragments.length) body = fragments.map((item) => `碎片：${escapeHtml(item)}`).join("<br>");
    return `<div class="rule"><strong>${num}.</strong> ${body}</div>`;
  }).join("");
}

function clueNumber(clue, id) {
  return clue.no || clue.number || clue.serial || id;
}

function clueKind(id, clue) {
  const unlockedSameNumber = Object.entries(CLUES)
    .filter(([otherId, other]) => otherId !== id && state.clues.includes(otherId) && clueNumber(other, otherId) === clueNumber(clue, id))
    .map(([, other]) => other);
  if (clue.kind === "doubt" || clue.status === "doubt") return "doubt";
  if (unlockedSameNumber.length && unlockedSameNumber.some((other) => other.body && clue.body && other.body !== clue.body)) return "doubt";
  if (clue.fake || clue.kind === "fake" || clue.status === "fake") return "fake";
  return "true";
}

function renderClues() {
  $("cluesPane").innerHTML = Object.entries(CLUES).map(([id, clue]) => {
    const unlocked = state.clues.includes(id);
    const kind = clueKind(id, clue);
    const badge = kind === "fake" ? "伪线索" : kind === "doubt" ? "存疑线索" : "真线索";
    const effect = recentClueEffects.get(id) || "";
    return `
      <div class="clue ${unlocked ? "unlocked" : ""} ${kind}Clue ${effect}" data-clue-id="${escapeHtml(id)}">
        <img src="${versionedAssetUrl(clue.img)}" alt="" />
        <div>
          <h3>${unlocked ? `${escapeHtml(clue.no || clue.number ? `${clueNumber(clue, id)} · ` : "")}${escapeHtml(clue.title)}` : "未解线索"}${unlocked ? `<span>${badge}</span>` : ""}</h3>
          <p>${unlocked ? escapeHtml(clue.body) : "继续经历事件后解锁。"}</p>
        </div>
      </div>
    `;
  }).join("");
  if (recentClueEffects.size) {
    window.setTimeout(() => {
      recentClueEffects.clear();
      document.querySelectorAll(".clue.fxFlip, .clue.fxPop, .clue.fxRing").forEach((item) => {
        item.classList.remove("fxFlip", "fxPop", "fxRing");
      });
    }, 1100);
  }
}

function renderJournal() {
  if (!state.journals.length) {
    $("journalPane").innerHTML = `<div class="journal"><h3>空白手账</h3><p>危险和解密会在这里留下长篇记录。</p></div>`;
    return;
  }
  $("journalPane").innerHTML = state.journals.map((id) => {
    const item = JOURNALS[id];
    return `<div class="journal"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></div>`;
  }).join("");
}

function renderHistory() {
  const endings = Array.isArray(state.endings) ? state.endings : [];
  const endingHtml = `
    <section class="endingArchive">
      <div class="archiveHeader">
        <strong>结局收集</strong>
        <span>${endings.length} / ${totalEndingCount()} · 还有 ${remainingEndingCount()} 个未达成</span>
      </div>
      ${endings.length ? endings.slice().reverse().map((ending) => `
        <div class="endingEntry ${escapeHtml(ending.kind || "bad")}Ending">
          <h3>${escapeHtml(ending.title)}</h3>
          <p>${escapeHtml(ending.summary)}</p>
        </div>
      `).join("") : `<div class="historyEntry"><h3>暂无结局</h3><p>失败、岔路和最后答复会在这里保留；再次游玩时，已收集的结局不会消失。</p></div>`}
    </section>
  `;

  if (!state.history.length) {
    $("historyPane").innerHTML = `${endingHtml}<div class="historyEntry"><h3>暂无历史</h3><p>你的选择、返回和关键节点会记录在这里。</p></div>`;
    return;
  }
  const historyHtml = state.history.slice().reverse().map((item, index) => {
    const flag = item.confession ? " · 已使用唯一表白" : "";
    const target = item.to ? ` → ${escapeHtml(SCENES[item.to]?.chapter || item.to)}` : "";
    return `
      <div class="historyEntry">
        <h3>${state.history.length - index}. ${escapeHtml(item.chapter)} ${escapeHtml(item.code)}${flag}</h3>
        <p><strong>${escapeHtml(item.action || "进入场景")}</strong>${target}</p>
        <p>${escapeHtml(item.text || "")}</p>
      </div>
    `;
  }).join("");
  $("historyPane").innerHTML = `${endingHtml}${historyHtml}`;
}

function renderMeters() {
  $("joyBar").style.width = `${state.stats.joy}%`;
  $("lonelyBar").style.width = `${state.stats.lonely}%`;
  $("logicBar").style.width = `${state.stats.logic}%`;
  $("likeBar").style.width = `${state.stats.like}%`;
}

function render() {
  const scene = SCENES[state.scene] || SCENES.intro;
  uniqPush(state.visited, state.scene);
  applySceneEffects(state.scene);
  recordEnding(state.scene, scene);
  saveState();

  const stage = $("stage");
  if (scene.bg) stage.style.setProperty("--scene-bg", `url("${versionedAssetUrl(scene.bg)}")`);
  else stage.style.removeProperty("--scene-bg");
  stage.classList.toggle("endingStage", Boolean(scene.ending));
  stage.dataset.endingKind = scene.ending ? (scene.endingKind || (state.scene === "win" ? "good" : "bad")) : "";
  stage.classList.remove("flash");
  requestAnimationFrame(() => stage.classList.add("flash"));

  $("chapterPill").textContent = scene.chapter;
  $("personaPill").textContent = personaLabel(scene.persona);
  $("presenceLabel").textContent = presenceText(scene.persona);
  const estimate = Math.min(720, Math.max(8, Math.round(state.visited.length * 7.5 + state.journals.length * 10)));
  $("progressPill").textContent = `长篇流程 约 12 小时 · 已读约 ${estimate} 分钟`;
  $("speaker").textContent = scene.speaker;
  $("sceneCode").textContent = scene.code;
  $("backButton").disabled = !state.backStack.length;

  const portrait = $("portrait");
  if (scene.portrait) {
    portrait.src = versionedAssetUrl(scene.portrait);
    portrait.alt = scene.persona === "yuelan" ? "月兰山立绘" : "秋清立绘";
    portrait.classList.add("visible");
  } else {
    portrait.classList.remove("visible");
    portrait.removeAttribute("src");
    portrait.alt = "";
  }

  renderText(scene);
  renderChoices(scene);
  renderRules();
  renderClues();
  renderJournal();
  renderHistory();
  renderMeters();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupTabs() {
  const tabs = [
    ["tabRules", "rulesPane"],
    ["tabClues", "cluesPane"],
    ["tabJournal", "journalPane"],
    ["tabHistory", "historyPane"],
  ];
  tabs.forEach(([tabId, paneId]) => {
    $(tabId).addEventListener("click", () => {
      tabs.forEach(([otherTab, otherPane]) => {
        $(otherTab).classList.toggle("active", otherTab === tabId);
        $(otherTab).setAttribute("aria-selected", otherTab === tabId ? "true" : "false");
        $(otherPane).classList.toggle("active", otherPane === paneId);
      });
    });
  });
}

const ambience = $("ambienceAudio");
const pageAudio = $("pageAudio");
const chimeAudio = $("chimeAudio");

function setAudioSource(element, source) {
  if (source) {
    element.src = versionedAssetUrl(source);
    return;
  }
  element.pause();
  element.removeAttribute("src");
  element.load();
}

function applyAudioSources() {
  const audio = EDITOR_CONFIG.audio || {};
  setAudioSource(ambience, audio.ambience);
  setAudioSource(pageAudio, audio.page);
  setAudioSource(chimeAudio, audio.chime);
}

function setVolume() {
  const volume = Number($("volumeRange").value) / 100;
  state.volume = volume;
  ambience.volume = volume * 0.55;
  pageAudio.volume = volume * 0.8;
  chimeAudio.volume = volume * 0.72;
  saveState();
}

function playPage() {
  if (!state.sound) return;
  pageAudio.currentTime = 0;
  pageAudio.play().catch(() => {});
}

function playChime() {
  if (!state.sound) return;
  chimeAudio.currentTime = 0;
  chimeAudio.play().catch(() => {});
}

function setupSound() {
  $("volumeRange").value = String(Math.round((state.volume || 0.38) * 100));
  setVolume();
  $("soundToggle").textContent = state.sound ? "Ⅱ" : "♪";
  $("soundToggle").addEventListener("click", async () => {
    state.sound = !state.sound;
    $("soundToggle").textContent = state.sound ? "Ⅱ" : "♪";
    if (state.sound) {
      setVolume();
      await ambience.play().catch(() => {});
      playChime();
    } else {
      ambience.pause();
    }
    saveState();
  });
  $("volumeRange").addEventListener("input", setVolume);
}

async function initializeGame() {
  await loadEditorOverrides();
  state = loadState();
  applyStoryMeta();
  applyAudioSources();
  setupTabs();
  setupSound();
  $("backButton").addEventListener("click", () => goBack());
  render();
}

initializeGame();
