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
