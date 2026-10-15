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

两套语义 tokens，默认跟随 `prefers-color-scheme`，用户可在导航栏切换浅色 / 深色 / 跟随系统，选择保存在 `localStorage`（键名 `theme`）。

| Token | 深色 | 浅色 | 用途 |
| --- | --- | --- | --- |
| `--color-bg` | `#121110` | `#f6f4ef` | 页面背景 |
| `--color-surface` | `#1a1917` | `#eeeae2` | 卡片、代码块、引用 |
| `--color-surface-raised` | `#242220` | `#fbfaf7` | 弹窗、搜索面板、菜单 |
| `--color-text-primary` | `#ece8df` | `#1c1a17` | 标题、正文 |
| `--color-text-secondary` | `#b8b2a7` | `#4d4840` | 摘要、说明 |
| `--color-text-tertiary` | `#948e84` | `#69635a` | 日期、元信息 |
| `--color-border` | `#2f2c28` | `#ddd7cb` | 分隔线（装饰性） |
| `--color-border-strong` | `#77716a` | `#8c8578` | 输入框、按钮描边（≥ 3:1） |
| `--color-accent` | `#d9a95f` | `#875811` | 主按钮、当前状态 |
| `--color-accent-hover` | `#e6bd7c` | `#6c460c` | 主按钮悬停 |
| `--color-on-accent` | `#1a1206` | `#fffaf0` | 金色背景上的文字 |
| `--color-focus-ring` | `#ebc684` | `#875811` | 焦点环 |
| `--color-success` | `#9fc48c` | `#3b6a29` | 成功提示 |
| `--color-danger` | `#f0a08b` | `#a8391f` | 错误提示 |

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

所有文字组合都 ≥ 4.5:1，满足 AA 正文要求。

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

### 2.3 字体

| 角色 | 字体栈 | 说明 |
| --- | --- | --- |
| 界面 / 正文 | `Inter, "PingFang SC", "HarmonyOS Sans SC", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif` | Inter 自托管（latin 子集，400/500/600），中文交给系统字体，雅黑不再排第一 |
| 衬线（文章标题、引言） | `Newsreader, "Songti SC", "Noto Serif SC", "Source Han Serif SC", serif` | Newsreader 负责西文，中文用系统宋体或思源宋体。完整的中文衬线 webfont 超过 10MB，按文章动态子集化需要在 CI 里加 Python 依赖，所以不自托管 |
| 字标 | `"Barlow Condensed"` 700 | 保留 |
| 终端 / 元信息 | `"IBM Plex Mono"` 400 | 保留 |

所有 webfont 使用 `font-display: swap`，首屏用到的 Inter 400 与 Barlow Condensed 700 在 `<head>` 中 preload。

### 2.4 间距

4px 基础单位：

`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 · `--space-5` 24 · `--space-6` 32 · `--space-7` 48 · `--space-8` 64 · `--space-9` 96 · `--space-10` 128 · `--space-11` 160

区块之间的垂直间距用 `--section-gap`：桌面 128px，移动端 80px。

### 2.5 圆角

保持锐利的编辑风格，但有明确规则：

| Token | 值 | 用在哪里 |
| --- | --- | --- |
| `--radius-none` | 0 | 大卡片、图片、区块 |
| `--radius-sm` | 6px | 按钮、输入框、小标签 |
| `--radius-md` | 12px | 弹窗、搜索面板、移动菜单 |
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

### 3.2 原则

1. 每个动效都要回答「它帮访客理解了什么」：空间关系、状态变化或因果关系。
2. 只对 `transform` 和 `opacity` 做动画。
3. 内容永远先出现，动画只是增强。脚本没加载、动画帧不渲染时，页面也是完整的。
4. `prefers-reduced-motion: reduce` 时：关闭视差、打字机、位移和 canvas 动画，只保留 ≤ 150ms 的不透明度变化。

### 3.3 具体动效

| 场景 | 规范 |
| --- | --- |
| 页面切换 | 新内容立即挂载，淡入并上移 8px（250ms，emphasized-decel）；滚动到顶部，焦点移到新页面的 `<h1>`，`aria-live` 播报页面标题 |
| 滚动显现 | 内容默认可见。脚本可用时，进入视口前的元素从 `opacity: 0; translateY(24px)` 开始，提前 10% 视口高度触发，400ms 内完成，任何时刻都不会整屏空白 |
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

三张等高，整张可点击，悬停时边框变金色、箭头沿 45° 位移。笔记数量用「1 篇笔记」表示。

### 笔记列表项

方向胶囊标签 → 标题（title-sm）→ 摘要（body-sm，最多两行）→ 日期（等宽 12px）和预计阅读时长。缩略图显示 80px，输出 160px 的 2x 版本，每张不超过 15KB。

### 文章页

正文栏 680px，17px，行高 1.75，段落间距 1.2em。标题用衬线体加 headline 字号；元信息行显示方向、日期、阅读时长和更新时间。≥ 1200px 时右侧悬浮目录，IntersectionObserver 高亮当前小节；移动端目录收起为顶部的「目录」下拉。顶部 2px 金色阅读进度条。支持代码高亮与复制、KaTeX 公式、图片说明、引用、脚注、可横向滚动的表格；标题锚点悬停出现，点击复制链接。文末是上一篇 / 下一篇和同方向的相关笔记。

### 搜索

`role="dialog"`、`aria-modal="true"`，焦点限制在面板内。实时出结果并高亮匹配文字；↑↓ 选择，Enter 打开，Esc 关闭；无结果时列出三个研究方向。

### 页脚

所有链接至少 44px 高。没有后台入口；后台页 `#admin` 仍可直接访问，也可以按 `g` 再按 `a` 进入。

## 5. 不改动的部分

- `content.json` 的数据结构和 GitHub 写入流程不变；构建脚本只额外生成派生文件（文章分享页、sitemap、robots.txt）。
- 部署方式仍是 GitHub Pages，构建命令仍是 `npm run build:pages`。
- 不引入大型 UI 框架。升级后移除 `motion` 动画库，全部改用 CSS 和 Web API（IntersectionObserver、Web Animations、View Transitions）。
- 继续使用 hash 路由；为每篇文章在构建时生成带 Open Graph 信息的静态分享页。

## 6. 遗留与已知取舍

- `scripts/prepare-sites-build.mjs`、`worker/`、`.openai/hosting.json` 是另一个托管平台的遗留，GitHub Pages 不使用，暂时保留以免影响现有测试。
- 中文衬线体依赖访客系统字体；Windows 上没有思源宋体时会回退到宋体。
