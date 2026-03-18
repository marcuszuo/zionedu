# ZionApply 静态试用版上线步骤

目标域名：`https://www.zionedu.cn`

## 架构说明

这次上线走的是和 `majornavi.cn` 一样的思路：

- 页面托管在 `GitHub Pages`
- 域名 DNS 放在阿里云解析
- AI 请求由浏览器直接调用 `PoloAPI`
- API key 由你在页面里手动填一次，保存在浏览器本地

## 第一步：确认仓库

仓库已经推到：

```text
git@github.com:marcuszuo/zionedu.git
```

## 第二步：启用 GitHub Pages

1. 打开 GitHub 仓库 `marcuszuo/zionedu`
2. 进入 `Settings`
3. 左侧找到 `Pages`
4. `Build and deployment` 选择：
   - `Source: Deploy from a branch`
   - `Branch: main`
   - `Folder: / (root)`
5. 保存

几分钟后，GitHub 会给你一个 Pages 地址。

## 第三步：配置自定义域名

在 GitHub Pages 页面里填：

```text
www.zionedu.cn
```

仓库根目录已经包含 `CNAME` 文件，所以 Pages 会按这个域名发布。

## 第四步：阿里云 DNS 配置

参考你现在的 `majornavi.cn`，给 `zionedu.cn` 加下面 5 条解析：

### 根域 `@`

- `A` -> `185.199.108.153`
- `A` -> `185.199.109.153`
- `A` -> `185.199.110.153`
- `A` -> `185.199.111.153`

### `www`

- `CNAME` -> `marcuszuo.github.io`

这就是 GitHub Pages 的标准解析方式。

## 第五步：等待生效

通常需要几分钟到几十分钟，少数情况下 DNS 可能要更久。

最终访问地址应为：

```text
https://www.zionedu.cn
```

## 第六步：上线后首次试用

打开网站后，在右上角填：

- `API Base`: `https://api.newapi.life/v1`
- `Model`: `gpt-5`
- `API Key`: 你的 PoloAPI key

点 `保存 API` 后，就可以直接试用：

- `PS`
- `推荐信 RL`

## 风险提醒

这是最快上线方案，但属于试用架构：

- 适合你自己或内部小范围试用
- 不适合公开给大量用户长期使用
- 浏览器直连 API 依赖目标接口允许跨域
- 每个浏览器都要单独填写一次 key

如果后面你要正式商用，再把后端和数据库版本接回来。
