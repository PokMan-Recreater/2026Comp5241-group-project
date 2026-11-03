# Vercel + Supabase：面试记录数据库

当前进度（2026-11-03）：已确认本地配置和云端四表连通；已实现真实邮箱密码登录、HttpOnly 会话、面试保存接口、个人记录列表/详情/下载/删除、持久复盘任务及后台 worker。需执行第二份迁移 `202611030002_save_interview.sql` 后验证真实用户端到端保存。

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

已有实时语音使用长连接，本项目当前的 Node WebSocket relay 不能仅凭部署这些 SQL 就在 Vercel Functions 上运行，需要单独的常驻 relay 或官方实时连接方案。数据库和后台复盘与语音传输是独立配置。

## 登录和面试保存

入口 `/#interview-records`。首次注册后，若 Supabase 开启邮箱确认，请在邮件中确认后再登录。Supabase Authentication 的 Site URL/redirect allowlist 应包含正式站点地址，开发时使用本机地址。用户登录后开始新面试，结束后先等待“面试已保存”再关闭页面；不需要等 AI 复盘完成。未登录或保存失败会明确提示，可下载或登录后重试，不能宣称已经入库。

报告由服务端重新生成并核验引用，网页提交的自评分数不会入库。未配置文字模型时仅保存标注为 local 的练习清单，无 AI 分数；实时语音的密钥不自动等于文字复盘模型密钥。Vercel 环境需要同步配置 `.env.example` 的数据库、复盘模型与 CRON_SECRET，并重新部署。本机 .env.local 不会自动上传到 Vercel。

## 用户名账号（2026-11-03）

网页使用账号和密码登录，不要求邮箱或邮件验证。账号不区分大小写，为 3–32 位英文字母、数字或 `._-`，以字母开头。密码至少 8 字符且最多 72 UTF-8 字节，避免 bcrypt 截断。

继续使用 Supabase Auth 保存 bcrypt 密码哈希。后台将用户名映射到 `用户名@accounts.forma.invalid` 作为内部身份，并自动确认；它不是用户邮箱，不发送邮件。不得另建明文密码表。用户角色保存在服务端管理的 `app_metadata.role`；公开注册固定为学生，忽略客户端角色参数。现有邮箱账号和历史记录不删除；新登录界面仅接收用户名。

预置账号：teacher01–teacher03、student01–student40、admin。`scripts/seed-accounts.mjs` 只创建缺失账号，不重设已有密码。随机初始密码导出到项目外的本地 CSV，权限 0600，不进入 Git 或部署。角色数据已经区分；教师、管理员的管理功能需在对应业务功能中单独做服务端鉴权，不能依赖界面的身份切换器。

网页入口现先检查真实登录会话；未登录显示独立登录/注册页。注册或登录成功进入个人主页，主页提供切换账号和退出。身份下拉预览已移除，身份来自已验证会话。登录页支持简体、繁体和英语，界面语言独立保存；本机学习状态按用户 ID 分开存储。课程内容本身仍为公开静态资源，管理功能的 API 需分别验证权限。

## 教师课程与班级（2026-11-03）

新增迁移 `supabase/migrations/202611030003_teacher_courses.sql` 已在当前 forma 项目安装成功。新环境按序执行前三个迁移；不要重复执行已安装的第三个迁移。它创建课程、班级、成员、课程分配与学习事件五张表，使用实际用户 JWT 和行级权限；教师 API 不使用 service-role 绕过权限。

教师账号登录后：我的课程 → 创建迷你课程 / 改编现有课程 → 手动编辑或 AI 辅助 → 保存草稿 → 发布版本；教学班中导入学生账号并分配已发布课程。学生在“老师布置的课程”中学习、答题；教师在“学习情况”中查看参与记录并导出 CSV。

智谱课程 API 通过 `AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4`、`AI_MODEL=glm-4.7-flash`、`AI_API_KEY` 配置。密钥只在 `.env.local` 和正式环境变量中保存。免费主模型 glm-4.7-flash 返回 429 时，课程生成只会切换到同平台免费模型 glm-4-flash-250414；两者均不可用则保留草稿并提示重试。不会切换收费模型。`/api/course-ai` 只允许教师使用；旧 `/api/ai` 也要求真实登录后才能调用模型。

当前活动编辑和自动判题支持选择题。已有官方课程改编为教学文本与可编辑场景副本，不覆盖原来的专用动画、音轨。新课场景支持流程、对比、时间线；没有偷偷使用设备语音。新增课配音、专用交互模拟和编程题编辑器尚未包含在此阶段。

真实验证包括：智谱通过教师接口生成中文课文和两道选择题；教师01保存、发布、导入学生01并分配课程；学生01获得无答案课程快照并作答；教师统计正确反映一次尝试和一个完成课节；教师02和未入班学生02被拒绝；重复提交不会重复统计。临时验证班级、课程和事件已清理，已有44个账号不变。

### 本机连接与限流修复

本机开发后台需独立持续运行；停止后台会让已打开的静态网页无法发送请求。连接失败、AI 超时、AI 拥堵和生成格式错误现已分别提示，课节按钮附近显示请求状态。主模型返回 HTTP429 时仅对智谱免费模型使用固定免费备用模型，不扩大到其他供应商或付费模型；返回值标记实际模型与 fallbackUsed，教师仍需预览采纳。
