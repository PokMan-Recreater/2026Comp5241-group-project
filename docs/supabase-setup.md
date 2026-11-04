# Vercel + Supabase：面试记录数据库

当前配置支持用户名登录、HttpOnly 会话、教师与个人课程、班级参与记录及面试记录。新环境按文件名顺序执行 `supabase/migrations/`，并记录已执行的迁移；不要在已有数据库中盲目重复执行。下面保留各阶段配置说明，当前使用步骤以 [用户指南](user-guide.md) 为准。

## 创建项目

1. 打开 https://supabase.com/dashboard ，注册或登录。
2. 创建组织，选择 Free（若界面提供），再点击 New project。
3. 项目名称填写 `forma`，生成数据库密码并自行保管，地区选择靠近实际用户的地区。
4. 创建完成后进入 SQL Editor，创建查询，将 `supabase/migrations/202611020001_interview_records.sql` 的完整内容粘贴运行一次。
5. 再运行 `supabase/migrations/202611030002_save_interview.sql`。然后在 Table Editor 中确认 interview_sessions、interview_turns、interview_reports、interview_review_jobs 四张表。
6. 在项目 Connect 面板或 Settings → API Keys 获取 Project URL、Publishable key、Secret key。Secret key 只用于服务端。
7. 在本项目 `.env.local` 与 Vercel 项目 Settings → Environment Variables 中填写：

```
SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_PUBLISHABLE_KEY=你的publishable_key
SUPABASE_SECRET_KEY=你的secret_key
CRON_SECRET=本地已生成的随机后台口令
```

不要把 Secret key、数据库密码放入聊天、Git、public/ 或任何前端构建变量。

## 已设计的数据

- interview_sessions：真实用户归属、方向、难度、中英文、风格/音色快照、项目背景、同意、起止时间和结束原因。
- interview_turns：顺序、说话方、完整/部分转写、时间。不保存音视频。
- interview_reports：报告版本、评分维度及回答引用、基础分、风格校准、证据上限、最终分与生成信息。没有分数时保留 null。
- interview_review_jobs：待处理、处理中、完成、失败，重试和持久租约。保存后由 Vercel 官方 waitUntil 启动 worker；vercel.json 每天 00:00 UTC 有恢复任务，需配置 CRON_SECRET。失败重试最多三次；待重试任务也可在本人记录页触发。免费 Vercel 定时任务不是每分钟运行，恢复可能延迟。

全部表启用 RLS，认证用户只能读取自己记录。匿名访客无法读取。报告/后台任务只允许服务端写入，前端不能自报 AI 分数。用户删除面试会级联删除对应转写、报告和任务。暂不创建课程、练习或游戏业务表。

## 上线验收（配置后执行）

用两个真实登录账号测试隔离；保存、刷新、再次登录仍能读取；重复保存不能新增同一会话；不能修改他人归属；前端不能写报告；后台关闭页面后仍可完成并保存；失败可重试且不伪造分数；删除会话清理关联记录。

实时语音通过 `api/realtime.js` 导出的 HTTP server 使用 Vercel WebSocket 支持，需要启用 Fluid compute。状态接口 `/api/realtime-status` 重写到同一函数；生产连接校验 HTTPS 同源和登录会话。当前线上最多4分钟，本地最多10分钟，详见 [实时语音配置](doubao-realtime.md)。

## 登录和面试保存

入口 `/#interview-records`。当前网页使用用户名和密码；内部身份自动确认，不要求用户邮箱或邮件验证。用户登录后开始新面试，结束后先等待“面试已保存”再关闭页面；不需要等 AI 复盘完成。未登录或保存失败会明确提示，可下载或登录后重试，不能宣称已经入库。

报告由服务端重新生成并核验引用，网页提交的自评分数不会入库。未配置文字模型时仅保存标注为 local 的练习清单，无 AI 分数；配置豆包实时密钥时，后台优先使用豆包语音会话生成复盘；无该密钥时才使用已配置的文字模型。Vercel 环境需要同步配置 `.env.example` 的数据库、复盘模型与 CRON_SECRET，并重新部署。本机 .env.local 不会自动上传到 Vercel。

## 用户名账号（2026-11-03）

网页使用账号和密码登录，不要求邮箱或邮件验证。账号不区分大小写，为 3–32 位英文字母、数字或 `._-`，以字母开头。密码至少 8 字符且最多 72 UTF-8 字节，避免 bcrypt 截断。

继续使用 Supabase Auth 保存 bcrypt 密码哈希。后台将用户名映射到 `用户名@accounts.forma.invalid` 作为内部身份，并自动确认；它不是用户邮箱，不发送邮件。不得另建明文密码表。用户角色保存在服务端管理的 `app_metadata.role`；公开注册固定为学生，忽略客户端角色参数。现有邮箱账号和历史记录不删除；新登录界面仅接收用户名。

预置账号：teacher01–teacher03、student01–student40、admin。`scripts/seed-accounts.mjs` 只创建缺失账号，不重设已有密码。随机初始密码导出到项目外的本地 CSV，权限 0600，不进入 Git 或部署。角色数据已经区分；教师、管理员的管理功能需在对应业务功能中单独做服务端鉴权，不能依赖界面的身份切换器。

网页入口现先检查真实登录会话；未登录显示独立登录/注册页。注册或登录成功进入个人主页，主页提供切换账号和退出。身份下拉预览已移除，身份来自已验证会话。登录页支持简体、繁体和英语，界面语言独立保存；本机学习状态按用户 ID 分开存储。课程内容本身仍为公开静态资源，管理功能的 API 需分别验证权限。

## 教师课程与班级（2026-11-03）

新增迁移 `supabase/migrations/202611030003_teacher_courses.sql` 已在当前 forma 项目安装成功。新环境按序执行前三个迁移；不要重复执行已安装的第三个迁移。它创建课程、班级、成员、课程分配与学习事件五张表，使用实际用户 JWT 和行级权限；教师 API 不使用 service-role 绕过权限。

教师账号登录后：我的课程 → 创建迷你课程 / 改编现有课程 → 手动编辑或 AI 辅助 → 保存草稿 → 发布版本；教学班中导入学生账号并分配已发布课程。学生在“老师布置的课程”中学习、答题；教师在“学习情况”中查看参与记录并导出 CSV。

智谱课程 API 通过 `AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4`、`AI_MODEL=glm-4.7-flash`、`AI_API_KEY` 配置。密钥只在 `.env.local` 和正式环境变量中保存。免费主模型 glm-4.7-flash 返回 429 时，课程生成只会切换到同平台免费模型 glm-4-flash-250414；两者均不可用则保留草稿并提示重试。不会切换收费模型。`/api/course-ai` 允许教师、学生和管理员使用；请求带 `courseId` 时服务端会用用户 JWT 校验该课程属于本人，旧 `/api/ai` 也要求真实登录后才能调用模型。

当前活动编辑和自动判题支持选择题。已有官方课程改编为教学文本与可编辑场景副本，不覆盖原来的专用动画、音轨。课节和幻灯片可手动或使用 AI 编辑，并可生成配音；专用交互模拟、游戏和编程任务规则还不能在课程工作台修改。

真实验证包括：智谱通过教师接口生成中文课文和两道选择题；教师01保存、发布、导入学生01并分配课程；学生01获得无答案课程快照并作答；教师统计正确反映一次尝试和一个完成课节；教师02和未入班学生02被拒绝；重复提交不会重复统计。临时验证班级、课程和事件已清理，已有44个账号不变。

### 手动幻灯片与发布门槛（2026-11-04）

课程工作台新增逐页幻灯片编辑：可手动添加、删除、上下排序，并编辑标题、概念标签、要点、可选配音讲稿和插画标签。发布门槛调整为每节课至少一页幻灯片；AI 辅助流程保持不变，采纳后仍可继续手动修改。未填写讲稿的幻灯片在配音时朗读要点。只使用幻灯片、课节正文留空的课程，需要先在 SQL Editor 执行 `supabase/migrations/202611030013_manual_slide_publish.sql`。

### 学生个人课程（2026-11-04）

学生端复用教师课程工作台的编辑、幻灯片、AI 辅助与预览能力，但隐藏发布、教学班、导入学生和统计等教师功能。入口为学习者导航“我的课程”和路径页的“创建课程”。学生可创建、编辑、学习（只读预览草稿）和删除自己的课程；草稿自动保存到浏览器本地并同步云端。

云端存储在独立表 `personal_courses`，需先在 SQL Editor 执行一次 `supabase/migrations/202611050001_personal_courses.sql`。该迁移启用行级权限，策略仅允许 `owner_id = auth.uid()` 的读写；写入由触发器校验 revision 递增并从草稿同步标题、描述、语言，删除和列表接口在服务端也显式按 `owner_id` 过滤。学生不能发布，也不能访问教师课程表或统计。AI 生成请求带课程 ID 时，服务端会同时查询教师课程表与个人课程表，确认该课程属于当前用户后才允许消耗 AI 额度。

个人课程也支持配音。`/api/course-narration` 在教师课程之外，按 `owner_id = auth.uid()` 允许学生读取和生成自己个人课程的配音；缓存仍写入私有表 `teaching_narration`，列表和音频下载都会重新校验归属和讲稿匹配。该功能需要再执行一次 `supabase/migrations/202611050002_personal_narration.sql`，它把配音缓存表扩展为可按教师课程或 `personal_courses` 归属，并保留级联删除。

### 更多课件插画模板（2026-11-04）

幻灯片插画模板由 15 个扩展到 27 个：新增交集关系、四象限、成长阶梯、筛选漏斗、层级金字塔、分类树、目标靶心、安全防护、数据图表、部件拼合、冰山模型和连接过渡。自动选图规则、每套模板的标签容量和 AI 提示词同步更新，并要求同一课件中尽量换用不同模板，减少每页都是流程图的重复感。

云端草稿与发布校验使用数据库函数白名单，必须在 SQL Editor 执行一次 `supabase/migrations/202611050003_more_scene_templates.sql`，否则包含新模板的课程保存时会被拒绝。几何检查脚本 `npm run test:geometry` 会用无头 Chrome 验证全部 27 个模板的标签不越界、不被截断。

### 本机连接与限流修复

本机开发后台需独立持续运行；停止后台会让已打开的静态网页无法发送请求。连接失败、AI 超时、AI 拥堵和生成格式错误现已分别提示，课节按钮附近显示请求状态。主模型返回 HTTP429 时仅对智谱免费模型使用固定免费备用模型，不扩大到其他供应商或付费模型；返回值标记实际模型与 fallbackUsed，教师仍需预览采纳。

分镜生成试验新增可选迁移 `202611050004_storyboard_courseware.sql`，用于保存 `slides[].art.story`。它兼容旧课件并保留 objectives、misconceptions、sourceNotes、script、notes 及扩展插画模板；实验状态和实测限制见 [分镜生成试验](course-generation-trial.md)。
