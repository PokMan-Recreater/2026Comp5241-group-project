# Forma Learning Lab

> **COMP5241 · Forma prototype**
>
> Author: [Cicicrr](https://github.com/Cicicrr) · Branch: `prototype/forma`
>
> [Live demo](https://forma-learning-lab.vercel.app/) · [Group repository](https://github.com/PokMan-Recreater/2026Comp5241-group-project)
>
> This branch contains Forma as a separate prototype for the group to review alongside the other proposals. The existing SkillForge prototype remains on `main`; this branch is not a merged final application.
>
> 此分支独立保存 Forma 原型，供小组比较方案。使用和部署时请选择 `prototype/forma` 分支。

面向软件工程课程项目的可操作原型。默认语言为英语，支持简体中文、繁体中文；界面与学习语言可以分别设置。

## 已实现

- 学习者、教师、管理员三个工作台和身份流程预览。
- 七门三语微课程、28 节：开发流程、需求访谈、网页架构、AI 编程、测试与上线、产品协作、技术面试。
- 按基础和目标匹配七门课程的学习顺序；进阶模式保留基础讲解，并增加分析。
- 分段讲解、课程说明、案例访谈、书面模拟面试、分步演示、权限与范围实验、上线模拟、两节隔离执行的 JavaScript 练习。
- 每节包含可保存的三部分作业、参考解答、自查依据；支持下载本课程作业。
- 部分课节提供逐项解释的理解检查；开放作业不制造自动掌握评分。
- “上线前 5 分钟”游戏：8 点预算、调查/开发/测试、确定性结果、复盘和重玩。
- 学习进度、笔记、代码、游戏记录保存；切换语言不重置进度。
- 教师手动新建、编辑三语课程、添加或删除课节、预览及发布。
- 教学班建立、CSV 学生名单导入与去重；参与记录展示及 CSV 导出。
- 管理员课程状态管理、用户和角色记录管理。
- 服务端 AI 适配接口：配置后支持课程生成、课程问答与角色对话。未配置时明确提示，不伪造 AI 回答。
- Vercel 部署配置、零依赖本地预览和构建。

## 原型边界

业务记录保存在当前浏览器的 localStorage。身份切换用于演示，不是生产账号权限。导入学生不会发送邀请，也不会自动产生学习记录。跨设备同步、真正的多账号授权、共享教学班与数据库尚未实现。浏览器旁白使用设备的文字转语音能力，并非生成式 AI 配音；完整动画及可上传媒体的课程编辑尚待实现。教师目前能修改活动说明；游戏场景参数和在线编程测试用例尚未开放为教师配置项。

因此本版本用于原型评审与用户反馈，不能作为所有课程要求均已完成的最终提交。详见 `docs/requirements.md`。

## 本地运行

需要 Node.js 22 或更新版本，无需安装依赖。

```sh
npm run dev
```

打开 http://127.0.0.1:4173 。

```sh
npm test
npm run build
```

可选浏览器检查需要本机安装 Playwright 和兼容浏览器，然后运行 `node scripts/browser-check.mjs`。也可以用 `PLAYWRIGHT_MODULE_PATH` 和 `CHROME_PATH` 指定已有安装。

## 部署到 Vercel

导入此目录作为独立项目。框架选择 Other，构建命令 `npm run build`，输出目录 `dist`；`vercel.json` 已声明这些设置。服务端接口为 `api/ai.js`，不依赖本地可写数据库。

AI 需要在 Vercel 项目环境变量中配置：

- `AI_API_KEY`：你的服务端 API 密钥。
- `AI_BASE_URL`：兼容 Chat Completions 的 HTTPS 服务地址，默认 `https://api.deepseek.com`。
- `AI_MODEL`：该服务支持的模型标识；请按实际账号的提供商文档设置。

配置后重新部署。密钥不应写入源代码、界面或公开仓库。项目从不要求在浏览器中输入密钥。

## 文件结构

- `public/`：界面、三语文本、课程和规则。
- `api/`：Vercel 服务端 AI 接口。
- `scripts/`：预览、构建和浏览器检查。
- `tests/`：游戏、推荐、CSV 的有效性检查。
- `docs/`：需求覆盖情况和三类使用说明。
- `dist/`：构建后的静态文件。

## 本轮课程重做

详见 `docs/course-design.md`。课程组织参考开放课程的案例、例题、练习与反馈方式，案例和讲稿重新编写，不冒称真人教师授课。AI 实时对话仍需密钥，旁白目前为设备朗读，非生成式配音。
