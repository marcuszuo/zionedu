# EduPro 参考拆解与我方落地方向

## 信息来源

- 官网首页：<https://edupro.work/>
- 登录页：<https://edupro.work/auth/login>
- 目标路径：<https://edupro.work/dashboard/writer/rl>
- 我已在 2026-03-18 通过可用测试账号验证后台页面可访问，并确认了部分真实实现细节；其余未直接暴露的数据流仍属于推断。

## 已确认的后台实现细节

### 1. 登录方式

- 登录页存在普通账号密码登录
- 前端登录接口为：`POST /auth/api/login`
- 请求体除 `username`、`password` 外，还会携带 `deviceInfo`
- Gmail 注册账号支持 Google 登录

### 2. Writer 页面是动态路由

已确认页面路径为：

- `/dashboard/writer/ps`
- `/dashboard/writer/rl`
- `/dashboard/writer/pe`
- `/dashboard/writer/cv`
- `/dashboard/writer/fw`

说明它不是一堆分散页面，而是统一的 `writer/[mode]` 工作台。

### 3. 前端技术形态

- Next.js App Router
- dashboard 下有共享 layout
- writer 页通过动态 chunk 按 `mode` 加载对应模块

### 4. 当前页面文案可确认的信息

登录态页面可命中这些文案：

- 推荐信
- 写推荐信
- 学生档案
- 生成
- AI

## 从公开页面可确认的核心能力

### 1. 文书生成引擎

官网明确写到支持：

- PS
- CV / Resume
- 推荐信
- 命题 Essay
- 自定义写作指引
- 官网专业命题匹配
- 润色编辑器

### 2. 智能建档引擎

官网明确写到支持：

- 拖拽上传
- Word / PDF / 图片等多格式
- AI 识别归类提取
- 一次建档后复用于整套文书

### 3. 降 AI 率引擎

官网明确写到支持：

- 一键查重
- 一键降重 / 降 AI 痕迹
- 自动循环降至安全线
- 检测器接入

## 我对其 dashboard/writer/rl 业务逻辑的推断

这部分是推断，但和留学文书产品的一般实现高度一致：

1. 先从学生档案中拉取结构化画像
2. 再根据文书类型切换不同 prompt 模板
3. 如果是推荐信，会额外要求推荐人身份、关系、观察场景、可验证例子
4. 先生成结构化 outline
5. 再生成首稿
6. 最后跑一轮 AI 痕迹检测与重写
7. 支持复制、导出、继续润色

## 对我们当前项目的产品映射

我已经把上面这套思路先做成了前端原型：

- 学生档案列表
- 智能建档弹窗
- AI 提取亮点 / 可用素材证据 / 申请策略建议
- 推荐信专属字段
- 多模板切换
- 生成初稿 / 生成大纲
- 降低 AI 痕迹按钮
- AI率结果标签

## 后续真正实现时建议的技术链路

### A. 建档层

- 文档解析：PDF、DOCX、图片 OCR
- 信息抽取：姓名、学校、成绩、活动、奖项、项目、目标专业、推荐人信息
- 数据存储：学生档案表 + 素材片段表 + 文书任务表

### B. 生成层

- 先做学生画像摘要
- 再做模板化 prompt 拼接
- 不同文书类型使用不同 system prompt / few-shot
- 推荐信单独引入“推荐人视角约束”

### C. 优化层

- 输出后按段落做 AI 风险评分
- 对高风险段落定向重写
- 保留原意、加入更自然句长变化和细节锚点

## 建议的数据结构

### student_profile

- basic_info
- academics
- language_scores
- activities
- awards
- internships
- target_programs
- writing_voice

### writing_task

- student_id
- template_type
- target_program
- tone
- focus_points
- recommender_meta
- draft
- outline
- ai_score

## 建议的下一阶段开发顺序

1. 接文件上传和学生档案存储
2. 接 OCR / 文档解析
3. 接大模型生成接口
4. 接推荐信专属 prompt
5. 接 AI 痕迹重写链路
6. 接导出 Word / 历史版本
