# 面试记录与评分：待建库需求（2026-11-01）

状态：**2026-11-02 用户已授权建库，部署目标为 Vercel。已准备 Supabase 面试专用迁移；云端项目与首份迁移已由用户完成；2026-11-03 四表连接已验证，网页持久化代码已接入，第二份原子保存迁移和真实账户保存仍待验证。** 见 `supabase-setup.md`。其他业务表暂不创建。

## 1. 本次需要将来保存的内容

| 数据组 | 拟保存字段 | 说明 |
| --- | --- | --- |
| 身份与归属 | interview_id、user_id、owner_id | user_id 必须来自未来的真实登录身份，不能使用当前“角色预览”冒充身份；课程/练习外键暂缓 |
| 配置快照 | role、difficulty、spoken_language、ui_language、persona_id、persona_version、voice_id | 保存面试发生时的设置，而非只引用会变化的当前默认值 |
| 时间与状态 | started_at、ended_at、duration_seconds、ended_reason、status | 区分主动结束、正常收尾、时限、连接异常、权限拒绝；失败不自动算完成 |
| 背景与同意 | project_context、consent_version、consented_at | 背景可能敏感，仅本人可访问；不保存 API Key |
| 对话 | turn_id、sequence、role、text、started_at、ended_at、transcript_status | 顺序、说话方、时间、完整/部分转写；保留原转写与未来更正版本，不把未完成转写当完整回答 |
| 统计 | completed_answer_count、answer_units、question_count、coverage | 字数/词数按中英文分别规范；不简单把时间等同于能力 |
| 评分 | rubric_version、model_version、prompt_version、base_score、style_adjustment、evidence_cap、final_score、confidence | 记录 AI 原始维度与服务端校验结果，便于复核；未生成评分时为 null，不伪造0分 |
| 维度与依据 | relevance、depth、evidence、clarity；每项 points、max、answer_id、quote、reason | 所有评价引用真实候选人回答，不能引用 AI 自己说的话充作证据 |
| 复盘 | summary、strengths、improvements、rewrite_original、rewrite_improved、next_steps | 改写不得补造项目事实、成绩或数字；缺失证据用占位符 |
| 生成追踪 | source、generation_status、generated_at、last_covered_answer_id、error_code | 明确 AI 复盘 / 本地规则建议；能看出报告是否覆盖最后一个回答 |
| 生命周期 | schema_version、created_at、updated_at、deleted_at、retention_policy | 将来支持本人查看、下载、删除、保留期；保留期具体长度待用户确认 |

不默认保存原始录音或摄像头视频。若未来要保存，必须另行告知用途、获得同意并设置保留期。摄像头目前只在本机预览，不上传。

## 2. 练习评分规则 v1（可在正式建库前再调整）

- 基础分统一100分：切题程度30、专业深度/推理30、具体证据25、表达结构15。每项要有回答引用和理由。
- AI 先按同一基础标准评价。严格风格 −2，温和风格 +2，冷静专业 0；由服务端执行并公开展示，不让 AI 自行放大风格影响。男声、女声绝不影响分数。
- 一两分钟结束不必然低分：关键是有效回答及证据量，长时间闲聊也不能加分。
- 回答非常稀少：最多1个完整回答且不足40个内容单位，上限40分；最多2个完整回答且不足120个内容单位，上限60分。单位暂按一个汉字或一个英文词计数。界面标为“证据不足”，不是认定用户能力低。
- 最终分 = min(证据上限, clamp(基础分 + 风格校准, 0, 100))。同时保留基础分，跨风格比较优先看基础分。
- 没有有效回答、AI工具失败、引用核验失败或未返回维度分：不显示伪造分数。可显示明确标注的本地练习建议。
- 分数仅为本次练习表现，不是录用概率、人格评价或真实招聘决定。模型生成的判断仍有局限，不能声称绝对客观。

## 3. 建库前的边界

当前复盘与评分仅保留在面试室页面内存，用户可下载；刷新会丢失，尚没有跨设备记录、账户历史或可靠长期存储。**这份文件存的是需求，不是在数据库保存用户的面试记录。**

后续确定层级时再决定：登录/用户主表、面试记录是否关联课程或练习、历史入口、保存时机、保留期、数据库服务、行级权限及删除机制。未确认前不建立外键或预建其他业务表。

推荐未来将面试会话、对话轮次、评分版本和报告拆分存储，但这只是候选方案，不是已批准或已创建的表结构。
