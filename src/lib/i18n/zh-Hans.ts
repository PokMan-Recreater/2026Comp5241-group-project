import type { TranslationKey } from "./en";

/** Simplified Chinese (简体中文). */
export const zhHans: Record<TranslationKey, string> = {
  // Language switcher
  "a11y.language": "语言",

  // Header
  "nav.courses": "课程",
  "nav.paths": "我的路径",
  "nav.labs": "实验",
  "nav.interviews": "模拟面试",
  "nav.customTopic": "自定义主题",
  "nav.dashboard": "学习看板",
  "header.startFree": "免费开始",
  "header.toggleNav": "切换导航",
  "header.xp": "{xp} 经验值",
  "header.level": "等级{level} · {title}",
  "header.streak": "{days}天",

  // Level titles
  "level.explorer": "探索者",
  "level.builder": "构建者",
  "level.engineer": "工程师",
  "level.specialist": "专家",
  "level.architect": "架构师",
  "level.mentor": "导师",

  // Home
  "home.eyebrow": "迷你课程 · 软件工程与 AI 工具",
  "home.titleLead": "学习业界真正在用的工具 ——",
  "home.titleAccent": "用你真正有的节奏。",
  "home.intro":
    "SkillForge 会为你生成一份按周安排的学习路径，并用交互式模拟、浏览器内编程挑战、模拟面试和语音讲解课程来教学。既为计算机专业的学生设计，也适合完全跨行的人。",
  "home.cta.path": "生成我的学习路径",
  "home.cta.browse": "浏览 {count} 门课程",
  "home.cta.lab": "先试一个实验 →",
  "home.stat.courses": "精选课程",
  "home.stat.lessons": "节课",
  "home.stat.hours": "小时的学习材料",
  "home.stat.labs": "交互式实验",
  "home.stat.interviews": "模拟面试",
  "home.stat.challenges": "编程挑战",
  "home.how.title": "使用流程",
  "home.step1.title": "介绍你自己",
  "home.step1.body": "计算机或非计算机背景、你的水平、你的目标，以及你每周能学习多少分钟。",
  "home.step2.title": "说出你的主题",
  "home.step2.body":
    "从课程目录中挑选，或直接输入任何内容：『设计师的 Git』『向量数据库』『面向市场的 AI』。",
  "home.step3.title": "获得排期好的路径",
  "home.step3.body": "课程会被排序、组合成模块，并按你可用时间的周数分摊安排。",
  "home.step4.title": "边做边学",
  "home.step4.body":
    "实验、测验、编程挑战和模拟面试，并用经验值、连续天数和徽章帮你保持动力。",
  "home.features.title": "真正帮你学完所需的一切",
  "home.feature.paths.title": "个性化学习路径",
  "home.feature.paths.body":
    "告诉我们你的背景、目标和每周学习时间。路径生成器会把课程排成按周的计划，并说明这样安排的理由。",
  "home.feature.custom.title": "任何主题，包括我们没收录的",
  "home.feature.custom.body":
    "输入我们没有覆盖的主题，系统会为它生成一套完整迷你课程 —— 基础、词汇、动手流程、质量检查和结课项目。",
  "home.feature.sims.title": "交互式模拟",
  "home.feature.sims.body":
    "合并分支并解决冲突。弄坏 CI 流水线并读懂日志。拟合模型并看着损失发散。是练习，不只是阅读。",
  "home.feature.interviews.title": "角色扮演模拟面试",
  "home.feature.interviews.body":
    "五个真实场景，按结构、具体证据、领域词汇、主导程度和表达清晰度用评分量表打分 —— 需要时还可以请 AI 教练指导。",
  "home.feature.code.title": "浏览器内编程挑战",
  "home.feature.code.body":
    "真实测试，在沙盒 iframe 中运行。你的代码不会离开页面，死循环也不会让应用卡住。",
  "home.feature.narration.title": "AI 语音讲解",
  "home.feature.narration.body":
    "每节课都可以朗读，并逐句高亮，方便你在通勤或闭眼休息时复习。",
  "home.startWith": "从一门精选课程开始",
  "home.seeAll": "查看全部 {count} 门 →",
  "home.modules.one": "{count} 个模块",
  "home.modules.other": "{count} 个模块",
  "home.custom.title": "这里没有符合你目标的？用一句话描述它。",
  "home.custom.body":
    "自定义主题引擎会为任何学科生成一套完整迷你课程 —— 包括非技术类 —— 再排进你可用的学习时间，并以面试演练收尾。",
  "home.custom.cta": "生成自定义主题",
  "home.custom.interview": "练习模拟面试",

  // Footer
  "footer.tagline": "软件工程与 AI 工具的迷你课程，路径会随你已有的知识而调整。",
  "footer.stats": "{courses} 门精选课程 · {lessons} 节课 · {time} 学习材料",
  "footer.learn": "学习",
  "footer.project": "项目",
  "footer.catalog": "课程目录",
  "footer.labs": "交互式实验",
  "footer.interviews": "模拟面试",
  "footer.create": "创建自定义主题",
  "footer.onboarding": "个性化你的路径",
  "footer.dashboard": "你的进度",
  "footer.credit": "COMP5241 小组项目 · 可部署到 Vercel",
  "footer.privacy": "进度保存在你的浏览器中。无需账号，不做追踪，数据不会离开本机。",
};
