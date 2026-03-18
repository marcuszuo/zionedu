# ZionApply 发布步骤

目标域名：`https://www.zionedu.cn`

## 当前状态

- 项目已经包含 `render.yaml`
- 项目已经包含 `.env.example`
- 项目已适配 `PoloAPI`
- 项目目录已初始化为本地 Git 仓库
- 当前 `www.zionedu.cn` 还没有 DNS 记录，查询结果是 `NXDOMAIN`

## 第一步：推到 GitHub

在项目目录执行：

```bash
git add .
git commit -m "Launch ZionApply"
git branch -M main
```

然后创建 GitHub 仓库并关联：

```bash
git remote add origin <你的 GitHub 仓库地址>
git push -u origin main
```

## 第二步：Render 部署

1. 登录 Render
2. 选择 `New +`
3. 选择 `Blueprint`
4. 连接刚才的 GitHub 仓库
5. Render 会自动读取 `render.yaml`

在 Render 环境变量里确认这些值：

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL=gpt-5`
- `APP_BASE_URL=https://www.zionedu.cn`

## 第三步：拿到 Render 临时域名

部署完成后，你会拿到一个类似这样的地址：

```text
https://zionapply.onrender.com
```

先确认它可以正常打开并登录、建档、生成文稿。

## 第四步：绑定自定义域名

在 Render 的服务设置里：

1. 打开 `Settings`
2. 找到 `Custom Domains`
3. 添加：

```text
www.zionedu.cn
```

Render 会给你一个要填写到 DNS 的目标值。

## 第五步：配置 DNS

去你的域名服务商后台，为 `www` 添加：

- 记录类型：`CNAME`
- 主机记录：`www`
- 记录值：Render 提供的目标地址

如果你还想让裸域可访问：

- 可以把 `zionedu.cn` 做 URL 转发到 `https://www.zionedu.cn`

## 第六步：等待证书生效

DNS 生效后，Render 会自动申请 HTTPS 证书。

最终访问地址就是：

```text
https://www.zionedu.cn
```

## 上线后检查

至少检查这些页面：

- 首页是否正常加载
- 注册 / 登录是否可用
- 学生建档是否可用
- 文书生成是否可用
- 降 AI 痕迹是否可用
- 历史文稿是否保存

## 备注

如果你愿意把 GitHub 仓库地址或 Render 临时域名发给我，我下一轮可以继续帮你做域名接入后的检查清单和上线后优化。
