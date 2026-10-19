# 原型使用手册

## 通用

默认英语。在右上角选择 English、简体中文或繁體中文，选择会保存。右上角身份菜单可预览三个工作台。所有业务记录保存在当前浏览器；清除网站数据会移除记录。正式账号系统尚未接入。

## 学习者 Learner

1. 在 Learning profile 填写基础、目标和内容深度。学习语言可以跟随界面，也可以单独选择。
2. 在 Learning path 查看推荐顺序，使用上下按钮调整。
3. 在 My learning 或 Explore courses 点击课程名称，先查看课程说明、学习基础、课节与课程成果，再进入课节。
4. 在课节中阅读材料、切换演示阶段、按需播放设备旁白，阅读案例材料并完成实验。每节作业分三个问题，输入时保存；可以展开参考答案、勾选自查依据并下载本课程作业。旁白为设备朗读，不是 AI 生成音频。
5. “Five minutes to launch”中选择预算内的行动，开放报名后查看后果，再尝试其他策略。
6. Code lab 中编辑 uniqueBookings 函数，点击 Run checks；无限循环会被限时终止。测试与上线课从一个有缺陷的 Map 实现开始，可展开参考实现对照。
7. 点击 Complete & continue 保存完成状态。完成状态是学习者确认的进度，不是自动掌握评定。
8. 使用 Create a learning path 创建个人课程；可以手动创建或在 AI 已配置时生成，再编辑和发布。

## 教师 Instructor

1. 切换至 Instructor，进入 My courses。
2. 使用 Create course 输入主题与材料，手动建课或生成 AI 草稿。
3. 在 Course studio 中选择内容语言，编辑标题、简介及课节；每节可选择活动类型。
4. Save changes 保存，Preview 预览，Publish course 发布到本机原型目录。
5. 在 Classrooms 创建教学班，选择课程，导入 CSV。列名为 name,email，重复邮箱被跳过；不发送邀请。
6. 在 Engagement 查看当前浏览器实际记录的学习活动，导出 CSV。导入名单的学生没有真实跨账号活动数据。

## 管理员 Administrator

1. Overview 查看当前本机原型数据。
2. People & roles 添加用户记录并修改身份、状态。这些修改不会创建真实账号或正式授权。
3. Course management 将课程发布或转为草稿。

## AI

未配置时可以使用课程、预设提示和规则活动；AI 入口会说明需要的配置。由项目维护者在 Vercel 设置服务端环境变量后重新部署。教师应审核 AI 草稿，学习者应检查 AI 建议。
