# ZionApply by Zion

一个适合快速上线试用的 AI 文书静态站，当前聚焦两项核心能力：

- `PS` 生成
- `推荐信 RL` 生成

这版专门为了最快挂到 `GitHub Pages + 自定义域名` 而做，所以刻意做了这些取舍：

- 保留学生档案切换与手动编辑
- 保留 AI 生成初稿 / 大纲
- 保留自然化改写和导出
- 去掉登录、历史保存、后端接口依赖
- API key 不写进仓库，只保存在使用者自己的浏览器本地

## 当前上线方式

推荐直接对齐 `majornavi.cn`：

- 静态托管：`GitHub Pages`
- 自定义域名：`www.zionedu.cn`

## 本地预览

直接起一个静态服务即可：

```bash
python3 -m http.server 4174
```

然后打开：

```text
http://localhost:4174
```

## 试用时怎么连 AI

页面右上角会让你填三项：

- `API Base`
- `Model`
- `API Key`

默认推荐：

- `API Base`: `https://api.newapi.life/v1`
- `Model`: `gpt-5`

保存后只会写进当前浏览器的 `localStorage`，不会提交到 GitHub。

## 文件说明

- `index.html`：页面结构
- `styles.css`：界面样式
- `app.js`：静态前端逻辑与浏览器侧 AI 调用
- `CNAME`：GitHub Pages 自定义域名
- `DEPLOY.md`：上线步骤

## 注意事项

这是一版“试用站”，不是最终正式架构。

因为它是纯静态站，所以：

- 不保存用户账号
- 不保存学生档案到云端
- 不保存历史文稿
- 不做服务端文件解析

如果后面你要恢复这些能力，再切回 `Node/Render/服务器` 版本即可。
