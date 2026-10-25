# m0NSYuke · Personal Workbench

个人网站：**https://m0nsyuke.github.io/**

React、Motion 和 Three.js 实现黑金界面、搜索、筛选、滚动时间轴与可交互形态实验。GitHub Pages 托管网站；公开内容在构建时生成，无需云服务器、Node 后台或云数据库。GitHub Actions 在每次提交到 `main` 后自动更新网站。

## 更新现有文章

1. 打开 `website/content/published`，找到文章的 `.md` 文件。
2. 点击铅笔编辑正文，使用 Markdown 标题、段落、列表和代码块。
3. 点击 **Commit changes** 保存到 `main`。
4. 在 **Actions** 查看发布工作流；成功后刷新网站。

文章的标题、摘要、标签、日期等信息在同名 `.json` 文件中，正文在 `.md` 中。

## 新增技术博客

在 `website/content/published` 创建同名的两个文件，例如 `vla-reading-01.json` 和 `vla-reading-01.md`。先提交 Markdown，再提交 JSON，第二次提交会触发完整发布。也可以通过 GitHub 网页编辑器（仓库页面按 `.`）在一次提交中创建两个文件。

JSON 示例：

```json
{
  "id": "vla-reading-01",
  "kind": "article",
  "section": "blog",
  "title": "我的第一篇 VLA 阅读笔记",
  "summary": "本次阅读的问题、理解与记录。",
  "tag": "VLA",
  "date": "2026-10-08",
  "image": "note-architecture.png",
  "status": "published",
  "sample": false
}
```

Markdown 示例：

```markdown
# 我的第一篇 VLA 阅读笔记

## 阅读的问题

写下这次想理解的内容。

## 方法与理解

记录论文的方法，并区分原文结论和自己的理解。
```

`id` 必须与文件名一致，只能包含小写字母、数字和短横线。`section` 选择 `foundation`（基础知识）或 `blog`（技术博客）；`tag` 可使用 `VLA`、`WAM` 或 `视频生成`。日期使用 `YYYY-MM-DD`。封面可选 `note-architecture.png`、`note-spiral.png`、`note-wave.png`，或留空。

公开项目可使用 `kind: "project"`，封面 `featured-morph.png`；仅填写希望公开的真实经历。

## 更新个人介绍

编辑 `website/content/profile.json`，修改 `bio`、`university`、`major`、`educationPeriod`、`email` 或 `xiaohongshu`。品牌名保持 `m0NSYuke`。

## 草稿和撤下文章

这个仓库是公开的，GitHub 修改历史也公开。不要把未公开草稿、密码、数据库或私人信息提交进仓库。草稿保存在本机仓库之外。要从网站撤下条目，可以删除其 `.json` 与 `.md` 文件；以前提交的内容仍保存在 Git 历史中。

初始三篇文章是标明的学习框架示例，并非已完成的研究成果。未提供的就读年份、学位或项目经历不作虚构。

## 本地预览

需要 Node.js 22：

```sh
cd website
npm ci
npm run dev:pages
```

本地打开 `http://127.0.0.1:4174`。修改 Markdown/JSON 后重新启动此预览命令，以重新生成内容。

```sh
npm run build:pages
npm run test:pages
```

构建结果在 `website/dist/client`，包含首页、公开内容 JSON、RSS、字体和插画。页面采用 hash 路由，文章链接刷新无需服务器重写规则。

## 自动发布

仓库 **Settings → Pages → Build and deployment → Source** 设为 **GitHub Actions**。发布流程在 `.github/workflows/deploy-pages.yml`。网站工作台链接到 GitHub 的文章目录、资料编辑页和发布记录；浏览器中没有配置 GitHub 写入令牌。

公开仓库的 Pages 和 Actions 在 GitHub Free 下可免费使用，受 GitHub 的服务配额限制。本站保留客户端动态交互，但不是可运行 Node/SQLite 后台的服务端动态网站。

WYCX 字标和金色插画为本项目生成的原创视觉资产。字体为 Barlow Condensed 和 IBM Plex Mono，使用本地字体文件。项目代码为自主实现，学习参考没有复制其他个人网站的仓库。
