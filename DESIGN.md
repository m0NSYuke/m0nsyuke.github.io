# m0NSYuke 设计规范

这份文档记录网站的设计 tokens、组件规范和动效规范。所有数值都在 `website/src/styles/tokens.css` 中定义，组件样式只能引用 tokens，不能直接写颜色值或字号。

网站的个性保持不变：深色背景、香槟金线框插画、巨型 `m0NSYuke` 字标、终端风格的 `> whoami`。这次升级的目标是让它更克制、更精确、更成体系。

## 1. 四家公司的原则在本站如何体现

| 来源 | 原则 | 在本站的落地 |
| --- | --- | --- |
| Apple | 节奏、留白、精度 | 一屏只有一个视觉焦点；Display 字号是正文的 4 倍以上；区块间距桌面 128px、移动端 80px，全部是 4 的倍数；吸顶导航滚动后变为毛玻璃加 1px 发丝线；按钮按下缩到 0.97，松开时带 4% 回弹。 |
| Google Material 3 | 系统化与可达性 | 颜色、字号、间距、圆角、层级、动效全部是语义 tokens；每个可交互元素都有 hover（8% 叠层）、focus-visible（2px 焦点环）、pressed（12% 叠层）、disabled 四种状态；动效分短 150ms、中 250ms、长 400ms 三档，进入用 emphasized-decelerate，离开用 emphasized-accelerate。 |
| OpenAI | 克制、内容优先 | 删去不传递信息的英文副标题和编号；金色只用于主按钮、当前状态、关键数据和插画；按钮文案直接说明结果（「阅读笔记」「关于我」）。 |
| Anthropic | 温度、编辑感、长文阅读 | 暖色近黑 `#121110` 和暖白纸张色 `#f6f4ef`；文章标题和引言用衬线体；文章页是核心产品：680px 正文栏、17px、行高 1.75、悬浮目录、公式、代码、脚注；只有 3 篇笔记时，诚实地展示「正在写的内容」路线图。 |

## 2. Design tokens

### 2.1 颜色

中性色换成 Anthropic 官网的暖灰色阶（`#141413`、`#faf9f5`、`#f0eee6` 等），金色 accent 保持不变。两套语义 tokens，默认跟随 `prefers-color-scheme`，用户可在导航栏切换浅色 / 深色 / 跟随系统，选择保存在 `localStorage`（键名 `theme`）。

| Token | 深色 | 浅色 | 用途 |
| --- | --- | --- | --- |
| `--color-bg` | `#141413` | `#faf9f5` | 页面背景 |
| `--color-surface` | `#1f1e1d` | `#f0eee6` | 卡片、代码块、引用 |
| `--color-surface-raised` | `#262624` | `#ffffff` | 弹窗、搜索面板、菜单 |
| `--color-text-primary` | `#faf9f5` | `#141413` | 标题、正文 |
| `--color-text-secondary` | `#c2c0b6` | `#4d4c48` | 摘要、说明 |
| `--color-text-tertiary` | `#9c9a92` | `#686761` | 日期、元信息 |
| `--color-border` | `#30302e` | `#dedcd1` | 分隔线（装饰性） |
| `--color-border-strong` | `#73726c` | `#87867f` | 输入框、按钮描边（≥ 3:1） |
| `--color-accent` | `#d9a95f` | `#875811` | 主按钮、当前状态 |
| `--color-accent-hover` | `#e6bd7c` | `#6c460c` | 主按钮悬停 |
| `--color-on-accent` | `#1a1206` | `#fffaf0` | 金色背景上的文字 |
| `--color-focus-ring` | `#ebc684` | `#875811` | 焦点环 |
| `--color-success` | `#9fc48c` | `#3b6a29` | 成功提示 |
| `--color-danger` | `#f0a08b` | `#a8391f` | 错误提示 |

代码高亮另有一组 tokens（`--code-keyword`、`--code-string`、`--code-number`、`--code-comment`、`--code-title`、`--code-attr`），两套主题各一份，在代码块背景上都满足 4.5:1。

浅色模式下，透明背景的金色线框插画（Hero 雕塑、logo）用 CSS `filter` 调成深古铜色；不透明背景的插画（研究方向横幅、笔记缩略图）作为「暗色画框」保留原样。

#### 对比度表（WCAG 2.1）

| 前景 / 背景 | 深色 bg | 深色 surface | 深色 raised | 浅色 bg | 浅色 surface | 浅色 raised |
| --- | --- | --- | --- | --- | --- | --- |
| text-primary | 15.4 | 14.4 | 13.0 | 15.8 | 14.5 | 16.6 |
| text-secondary | 9.0 | 8.3 | 7.5 | 8.3 | 7.6 | 8.7 |
| text-tertiary | 5.8 | 5.4 | 4.9 | 5.4 | 5.0 | 5.7 |
| accent | 8.8 | 8.2 | 7.4 | 5.6 | 5.1 | 5.9 |
| accent-hover | 10.7 | 10.0 | 9.0 | 7.6 | 7.0 | 8.0 |
| success | 9.7 | 9.0 | 8.1 | 5.8 | 5.3 | 6.1 |
| danger | 9.1 | 8.5 | 7.6 | 5.8 | 5.4 | 6.2 |
| focus-ring | 11.6 | 10.8 | 9.8 | 5.6 | 5.1 | 5.9 |
| border-strong（非文字，需 ≥ 3） | 3.9 | 3.6 | 3.3 | 3.3 | 3.1 | 3.5 |
| on-accent / accent | 8.6 |  |  | 5.9 |  |  |

所有文字组合都 ≥ 4.5:1，满足 AA 正文要求。第二轮换成暖灰色阶后重新核对过，结论不变；`border-strong` 最低 3.14:1。

### 2.2 字号

全站只有下面 10 个字号 token，组件里的 `font-size` 只能引用它们。最小字号 12px；等宽字体标签最小 11px，并配 `letter-spacing: 0.08em`。

| Token | 字号 / 行高 | 用途 |
| --- | --- | --- |
| `--text-mono-xs` | 11 / 16 | 等宽小标签（日期、坐标注释） |
| `--text-caption` | 12 / 16 | 版权、辅助信息 |
| `--text-label` | 13 / 18 | 按钮、导航、标签 |
| `--text-body-sm` | 15 / 24 | 摘要、卡片说明 |
| `--text-body` | 17 / 30 | 正文（中文行高约 1.75） |
| `--text-title-sm` | 20 / 28 | 列表标题、卡片标题 |
| `--text-title` | 28 / 36 | 区块标题（移动端 24） |
| `--text-headline` | 40 / 48 | 页面标题、文章标题（移动端 32） |
| `--text-display` | clamp(56px, 8vw, 112px) | 「从理解到行动」等大标语 |
| `--text-wordmark` | clamp(96px, 22vw, 320px) | 首页字标 |

第二轮参照 claude.com 增加了一组流式编辑字号，标题全部用衬线体：

| Token | 字号 / 行高 | 用途 |
| --- | --- | --- |
| `--text-display-1` | clamp(40px → 72px) / 1.1 | 关于页大标题 |
| `--text-headline-1` | clamp(34px → 52px) / 1.15 | 页面标题、文章标题、Hero 标语、联系卡片 |
| `--text-headline-2` | clamp(28px → 44px) / 1.2 | 区块标题 |
| `--text-headline-3` | clamp(24px → 32px) / 1.25 | 卡片标题、时间轴标题、页脚标语 |
| `--text-body-lg` | clamp(18px → 21px) / 1.65 | 区块导语、页面导语 |

标题字距统一 `--tracking-display: -0.01em`。中文标签（eyebrow、页脚栏目名、时间轴标签）至少 12px，11px 只留给纯数字和英文的等宽标签。

### 2.3 字体

| 角色 | 字体栈 | 说明 |
| --- | --- | --- |
| 界面 / 正文 | `Inter, "PingFang SC", "HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif` | Inter 自托管（latin 子集，400/500/600），中文交给系统字体，雅黑不再排第一 |
| 衬线（所有标题） | `"m0 Serif", "Noto Serif SC", "Source Han Serif SC", "Songti SC", Georgia, serif` | Anthropic 的 anthropicSerif 是专有字体，不能用。改用最接近的开源字体：思源宋体 Medium（Noto Serif SC，西文字形就是 Source Serif）。`scripts/build-fonts.mjs` 在每次构建时收集界面文案、笔记标题、摘要和正文小标题里用到的字，子集化成约 100KB 的 `public/fonts/m0-serif.woff2`，新文章会自动带上新字。只在项目专栏文案（`src/lib/showcase.js`）里出现的字另外打包成 `m0-serif-extra.woff2`，靠 `unicode-range` 只在用到时下载（规则写在构建时生成的 `src/styles/generated-serif-extra.css`）。不用 Google Fonts，因为国内访问不稳定 |
| 字标 | `"Barlow Condensed"` 700 | 保留 |
| 终端 / 元信息 | `"IBM Plex Mono"` 400 | 保留 |

所有 webfont 使用 `font-display: swap`。衬线字体不 preload：实测 preload 会和首屏脚本抢带宽，LCP 反而变慢。

### 2.4 间距

4px 基础单位：

`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 24 · `--space-6` 32 · `--space-7` 48 · `--space-8` 64 · `--space-9` 96 · `--space-10` 128 · `--space-11` 160

区块之间的垂直间距用 `--section-gap`：桌面 128px，移动端 80px。

### 2.5 圆角

保持锐利的编辑风格，但有明确规则：

| Token | 值 | 用在哪里 |
| --- | --- | --- |
| `--radius-none` | 0 | 字标分隔线等纯线条 |
| `--radius-sm` | 8px | 按钮、输入框、小标签 |
| `--radius-md` | 12px | 笔记卡片图片、上一篇 / 下一篇、弹窗、搜索面板 |
| `--radius-lg` | 20px | 演变动画、方向卡片、研究地图、联系卡片 |
| `--radius-pill` | 999px | 方向胶囊标签、分段控件 |

### 2.6 层级

深色模式不用阴影，用 surface 的明度区分层级：`bg` < `surface` < `surface-raised`。浅色模式使用两层柔和阴影：

- `--shadow-1`：`0 1px 2px rgb(28 26 23 / 6%), 0 1px 1px rgb(28 26 23 / 4%)`
- `--shadow-2`：`0 12px 32px rgb(28 26 23 / 10%), 0 2px 6px rgb(28 26 23 / 6%)`

### 2.7 布局

- 最大内容宽度 1200px，字标可以出血。
- 12 栏栅格，栏间距 24px。
- 左右安全边距：移动端 20px，平板（≥ 768px）32px，桌面（≥ 1200px）48px。
- 文章正文栏 680px。

## 3. 动效规范

### 3.1 Tokens

| Token | 值 |
| --- | --- |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-emphasized-decel` | `cubic-bezier(0.05, 0.7, 0.1, 1)` |
| `--ease-emphasized-accel` | `cubic-bezier(0.3, 0, 0.8, 0.15)` |
| `--ease-spring` | 阻尼 0.72 的弹簧曲线，用 `linear()` 采样 25 个点，最大回弹 3.8% |
| `--dur-short` | 150ms |
| `--dur-medium` | 250ms |
| `--dur-long` | 400ms |
| `--dur-reveal` | 900ms（滚动浮现；减少动态时 150ms） |

### 3.2 原则

1. 每个动效都要回答「它帮访客理解了什么」：空间关系、状态变化或因果关系。
2. 只对 `transform` 和 `opacity` 做动画。
3. 内容永远先出现，动画只是增强。脚本没加载、动画帧不渲染时，页面也是完整的。
4. `prefers-reduced-motion: reduce` 时：关闭视差、打字机、位移和 canvas 动画，只保留 ≤ 150ms 的不透明度变化。

### 3.3 具体动效

| 场景 | 规范 |
| --- | --- |
| 页面切换 | 新内容立即挂载，淡入并上移 8px（250ms，emphasized-decel）；滚动到顶部，焦点移到新页面的 `<h1>`，`aria-live` 播报页面标题 |
| 滚动浮现 | 内容默认可见。只有加载时位于首屏以下的元素才会先隐藏为 `opacity: 0; translateY(24px)`，进入视口 8% 后在 900ms 内浮现；列表和卡片组用 `reveal-stagger` 让子项间隔 90ms 依次出现（最多 8 级）。首屏内容不参与，避免闪烁 |
| 全站背景 | 固定在所有内容后面的 WebGL 等高线场（一个片元着色器），随时间缓慢流动，随滚动平移，鼠标附近轻微隆起。30fps，标签页隐藏时暂停；软件渲染或减少动态时只画一帧静止画面。首屏绘制完成后的空闲时间才启动。文章页降到 40% 不透明度，实验室和后台页隐藏并停止 |
| 形态演变 | 研究方向区块的 Canvas 2D 线框：立方体 → 扭转 → 扰动 → 曲面，四个阶段用同一张 (s, y) 网格，所以能连续变形，最后「展开」成起伏的曲面。每阶段停 1.5 秒、过渡 1.7 秒，下方四个按钮可直接跳到某一阶段，带暂停按钮；离开视口时停止绘制，减少动态时不自动播放 |
| 研究地图 | 每个方向一条线，站点是待写章节。进入视口时线条从左到右画出、站点依次弹出，一个光点沿线循环流动；移动端改为竖向 |
| 时间轴 | 竖向轴线从上往下画出，最后一个「下一步」节点有呼吸光圈 |
| 章节流 | 笔记页底部两行章节链接反向缓慢漂移，悬停或聚焦时暂停；减少动态时改为静态换行列表 |
| 联系卡片 | 一道光沿卡片边缘缓慢绕行（`@property` 角度动画） |
| 吸顶导航 | 滚动超过 24px 后切换为毛玻璃（`blur(20px) saturate(180%)`）加 1px 发丝线，250ms |
| 按钮 | 按下 `scale(0.97)`（150ms），松开用 `--ease-spring` 恢复（400ms） |
| 卡片 | 悬停时边框过渡到 accent（250ms），右上角箭头沿 45° 位移 4px |
| 移动菜单 | 全屏展开，菜单项依次淡入并上移 8px，间隔 40ms |
| 搜索面板 | 遮罩淡入 150ms；面板从 `scale(0.98)` 加透明到正常，250ms，emphasized-decel |
| 笔记筛选 | 列表项用 FLIP 做布局动画，离开项淡出 150ms |
| 主题切换 | View Transitions API 从切换按钮处圆形扩散；不支持时直接切换 |
| Hero 雕塑 | 鼠标视差最大 ±6px；随滚动旋转最多 8°、位移最多 40px |
| 终端 | 打字机只在首次访问时播放一次（`sessionStorage`），光标闪烁周期 1.06s |

## 4. 组件规范

### 按钮

- **主按钮**：金色实心，`--color-on-accent` 文字，`--radius-sm`，最小高度 44px，左右内边距 24px，`--text-label` 字号、500 字重。
- **次按钮**：1px `--color-border-strong` 描边，文字 `--color-text-primary`，其他同主按钮。
- **文字按钮**：无边框，最小点击区域 44×44。
- 状态：hover 叠加 8% 的当前文字色，pressed 叠加 12% 并缩放 0.97，focus-visible 显示 2px 焦点环（偏移 2px），disabled 透明度 0.38 且不响应。

### 导航

吸顶，初始透明。当前页的导航项文字变为 `--color-text-primary`，下方 2px 金色下划线，带 `aria-current="page"`。移动端汉堡按钮 44×44，展开全屏菜单（菜单项 28px），锁定页面滚动，Esc 和点击遮罩都能关闭，焦点限制在菜单内，关闭后焦点回到按钮。搜索按钮根据平台显示 `⌘K` 或 `Ctrl K`。

### 方向卡片

三张等高、20px 圆角，整张可点击：编号（等宽）→ 方向名（衬线 headline-3）→ 一句话 → 说明 → 笔记数量。悬停时上浮 4px、箭头右移。

### 笔记卡片

首页、笔记页、文章页「相关笔记」共用：16:10 图片（悬停放大 1.04）→ 方向胶囊和分类 → 衬线标题 → 两行摘要 → 日期、阅读时长和「阅读」。桌面三栏、平板两栏、手机一栏。

### 关于页

大号衬线问候语，右侧 logo 外有两圈反向缓慢旋转的轨道。研究兴趣是编辑式整行列表，悬停时底色从左向右铺开、方向名右移变金色。经历用竖向时间轴，联系方式放在一张居中的大卡片里。

### 项目专栏（Vibe Coding）

`#projects` 展示和 AI 一起做出来的项目，内容在 `src/lib/showcase.js`（中英文各一份），不走 `content.json`；`content.json` 里的作品会列在页面末尾「更多项目」。`#works` 仍可打开同一页，`#projects/<id>` 直接滚到对应项目。

- 页首：提示词打字动画（减少动效时直接显示整句），下面是各项目的锚点。
- 每个项目：超大衬线名称和一句话，浏览器外框里放演示视频或截图（滚动进入时从倾斜缩小状态展开，用 `animation-timeline: view()`，不支持的浏览器直接显示）；正文、在线体验和源码按钮、技术标签；右侧三个数字进入视口时计数。
- Model Atlas 额外有「代码 → 3D」流水线（芯片依次亮起）和功能卡片；SOCLOOK 有五步每周流程，进度线从左到右（手机上从上到下）走过各步骤。
- 演示视频静音循环、`preload="none"`，只在可见时播放，有暂停按钮；系统设置减少动效时不自动播放。
- 首页「Vibe Coding 项目」区块是两张大卡片，链接到对应项目。
- Model Atlas 在线体验：部署工作流在站点构建后克隆 `m0NSYuke/model-atlas`，以 `--base=/atlas/` 构建到 `dist/client/atlas`，所以地址是 `/atlas/`，每次部署都取它的最新代码。这一步失败不会阻止站点发布，只是在线体验暂时打不开。
- 素材在 `public/assets/projects/`：Atlas 截图分中英文（`atlas-zh|en-800|1600`）、卡片裁图（`atlas-3d-zh|en`、`soclook-hero`）、演示视频 `atlas-demo.mp4`（1280×720，约 1.3MB）。截图来自各项目自己的构建，重拍时用 Playwright 在 1600×960 视口截图，再用 sharp 转成 avif 和 webp。

### 中英文

导航栏右侧的「EN / 中」按钮切换语言，选择保存在 `localStorage`（键名 `lang`），默认跟随浏览器语言。界面文案、页面标题和描述、笔记标题和摘要、方向名、章节名都有英文版本（`src/lib/i18n.js`）；笔记正文仍是中文，英文模式下文章页会注明。`content.json` 不变。

### 文章页

正文栏 680px，17px，行高 1.75，段落间距 1.2em。标题用衬线体加 headline 字号；元信息行显示方向、日期、阅读时长和更新时间。≥ 1200px 时右侧悬浮目录，IntersectionObserver 高亮当前小节；移动端目录收起为顶部的「目录」下拉。顶部 2px 金色阅读进度条。支持代码高亮与复制、KaTeX 公式、图片说明、引用、脚注、可横向滚动的表格；标题锚点悬停出现，点击复制链接。文末是上一篇 / 下一篇和同方向的相关笔记。

### 搜索

`role="dialog"`、`aria-modal="true"`，焦点限制在面板内。实时出结果并高亮匹配文字；↑↓ 选择，Enter 打开，Esc 关闭；无结果时列出三个研究方向。

### 页脚

三栏：logo 和衬线标语、「浏览」、「关注」，底部版权。所有链接至少 44×44。没有后台入口；后台页 `#admin` 仍可直接访问，也可以按 `g` 再按 `a` 进入。

## 5. 不改动的部分

- `content.json` 的数据结构和 GitHub 写入流程不变；构建脚本只额外生成派生文件（文章分享页、sitemap、robots.txt）。
- 部署方式仍是 GitHub Pages，构建命令仍是 `npm run build:pages`。
- 不引入大型 UI 框架。升级后移除 `motion` 动画库，全部改用 CSS 和 Web API（IntersectionObserver、Web Animations、View Transitions）。
- 继续使用 hash 路由；为每篇文章在构建时生成带 Open Graph 信息的静态分享页。

## 6. 遗留与已知取舍

- `scripts/prepare-sites-build.mjs`、`worker/`、`.openai/hosting.json` 是另一个托管平台的遗留，GitHub Pages 不使用，暂时保留以免影响现有测试。
- 页面切换没有做 150ms 的退出淡出：旧页面立即卸载，新页面只做进入动画。这样内容不会因为等待动画而晚出现，返回、前进和刷新的行为也更简单。
- 文章分享页：构建时在 `/notes/<id>/` 生成带标题、摘要和 Open Graph 信息的静态页，正文也在里面，供搜索引擎和社交平台抓取；访客打开后立即跳到 `/#article/<id>`。
- 实验室：three.js 在页面文字渲染后的空闲时间加载。如果设备没有 GPU（软件渲染）或帧时间持续超过 40ms，曲面停在静止画面，按「继续」再动起来，避免占满 CPU。
- Lighthouse 的 LCP 是模拟慢速 4G 和 4 倍 CPU 降速下的估算值。这是客户端渲染的单页应用，第二轮加入背景、演变动画和英文后首页约 2.8s、文章页约 3.1s，性能分 89 到 94，没有达到 2.0s；本地不限速时实测约 0.2s。要在模拟条件下低于 2.0s，需要构建时预渲染首页 HTML，可以作为下一步。
