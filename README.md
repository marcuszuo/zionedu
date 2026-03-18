# ZionApply by Zion

一个可发布的 AI 文书网站，覆盖三条真实工作流：

- 智能建档：上传 PDF / DOC / DOCX / TXT / 图片后，自动抽取学生画像
- 文书生成：按 `PS / RL / PE / CV / FW` 模式生成初稿或大纲
- 降 AI 痕迹：对生成结果做自然化重写，降低模板味
- 账号与数据持久化：本地注册登录、学生档案保存、历史文稿保存

## 技术栈

- 前端：原生 `HTML / CSS / JS`
- 后端：`Node.js + Express`
- 上传处理：`multer`
- AI：`OpenAI Responses API`

## 本地运行

1. 复制环境变量文件

```bash
cp .env.example .env
```

2. 填入你的 `OPENAI_API_KEY`

3. 启动项目

```bash
npm run dev
```

4. 打开

```text
http://localhost:3210
```

## 环境变量

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`
- `APP_BASE_URL`
- `PORT`

如果没有配置 `OPENAI_API_KEY`，项目也能启动，但会以 Demo 模式运行。

## 项目结构

- `index.html`：页面结构
- `styles.css`：界面样式
- `app.js`：前端状态管理与 API 调用
- `server.js`：后端服务和 OpenAI 接口
- `db.js`：本地文件数据库与会话管理
- `docs/edupro-reference.md`：对 EduPro 的参考拆解

## 发布建议

可以直接部署到以下平台：

- Render
- Railway
- Fly.io
- 云服务器 / Docker

部署时保证设置好：

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL=gpt-5`
- `APP_BASE_URL=https://www.zionedu.cn`

### Render 部署

仓库里已经包含 [render.yaml](/Users/yifan/工作盘/AI文书工具/render.yaml)，可以直接导入 Render。

推荐步骤：

1. 把项目推到 GitHub
2. 在 Render 里选择 `New +` -> `Blueprint`
3. 连接这个仓库
4. 在 Render 后台补上：
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
5. 首次部署成功后，Render 会给你一个临时域名，如：
   - `https://zionapply.onrender.com`
6. 然后在 Render 的 `Custom Domains` 里添加：
   - `www.zionedu.cn`

### zionedu.cn 域名配置

我刚查过，`www.zionedu.cn` 当前还是 `NXDOMAIN`，说明 DNS 记录还没加。

你在域名管理后台需要至少加这一条：

- 记录类型：`CNAME`
- 主机记录：`www`
- 记录值：Render 分配给你的临时域名

如果你还希望裸域也可访问，再额外做一条：

- 主机记录：`@`
- 按你域名服务商支持情况，做 URL 转发到 `https://www.zionedu.cn`

如果你的 DNS 服务商不支持根域 URL 转发，也可以先只启用：

- `https://www.zionedu.cn`

### Docker 部署

```bash
docker build -t edupro-ai-writer .
docker run -p 3210:3210 --env-file .env edupro-ai-writer
```

## OpenAI 参考

- 文件输入能力文档：<https://developers.openai.com/api/docs/guides/file-inputs>
- 图片/视觉能力文档：<https://developers.openai.com/api/docs/guides/images-vision>
- GPT-5 模型文档：<https://developers.openai.com/api/docs/models/gpt-5>
