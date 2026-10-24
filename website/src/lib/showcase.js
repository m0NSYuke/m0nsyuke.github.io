// The vibe coding column: projects built together with AI, in both languages.
// Media lives in public/assets/projects (screenshots captured from each project's own build).

export const ATLAS_URL = '/atlas/';
export const SOCLOOK_URL = 'https://m0nsyuke.github.io/SOCLOOK/';

export const showcase = [
  {
    id: 'model-atlas',
    name: 'Model Atlas',
    repo: 'https://github.com/m0NSYuke/model-atlas',
    live: ATLAS_URL,
    image: lang => `atlas-${lang}`,
    card: lang => `atlas-3d-${lang}`,
    video: 'atlas-demo.mp4',
    tags: ['React', 'Three.js', 'TypeScript', 'Python interpreter', 'MediaPipe'],
    zh: {
      kind: '3D 模型架构实验室',
      tagline: '写下 PyTorch，立刻看见 3D 架构。',
      summary: '改一行代码，层数、通道、注意力头数，3D 结构、张量形状和参数量当场重建；写错了，会指出是哪一行。',
      body: '整个过程都在浏览器里完成：页面自带一个只推算张量形状的小型 Python 解释器，不联网、不用装 PyTorch，代码也不会上传。',
      liveLabel: '在线体验',
      liveNote: '建议在电脑上打开',
      stats: [[20, '+', '个可运行的代码模型'], [38, '', '种 PyTorch 写法，与真实 PyTorch 逐一对照'], [0, '', '次网络请求，完全在本机运行']],
      features: [
        ['实时 3D 架构', '层的大小由输出张量决定；残差从上方绕过，跳连从下方穿过，粒子沿连线流动。'],
        ['张量旅程', '底部列出主路径上每一次形状变化，点一下就定位到那一层。'],
        ['从 GPT 到 π0', 'GPT、ViT、U-Net、DiT、Flow Matching、π0、视频生成，打开就能改。'],
        ['导入自己的项目', '选 model.py 画网络，选 train.py 画出完整的训练步。'],
        ['手势控制', '用 MediaPipe 识别手势转动视角，摄像头画面不离开浏览器。'],
      ],
      pipeline: ['model.py', '词法分析', '语法分析', '只算形状的解释器', '追踪', 'Model IR', '3D 场景'],
    },
    en: {
      kind: '3D model architecture lab',
      tagline: 'Write PyTorch, see its 3D architecture.',
      summary: 'Change one line, the number of layers, channels or attention heads, and the 3D structure, tensor shapes and parameter counts rebuild on the spot. If the code is wrong, it points to the line.',
      body: 'It all runs in the browser: the page ships a small Python interpreter that only infers tensor shapes, so there is no network access, no PyTorch to install, and your code never leaves your machine.',
      liveLabel: 'Try it live',
      liveNote: 'Best on a computer',
      stats: [[20, '+', 'runnable code models'], [38, '', 'PyTorch idioms checked against real PyTorch'], [0, '', 'network requests; it runs on your machine']],
      features: [
        ['Live 3D architecture', 'Blocks are sized by the tensors they output; residuals arc over the top, skips pass underneath, and particles show the data flow.'],
        ['Tensor journey', 'Every shape change along the main path, one click from the layer that made it.'],
        ['From GPT to π0', 'GPT, ViT, U-Net, DiT, Flow Matching, π0 and video generation, ready to edit.'],
        ['Import your own project', 'Pick model.py to draw the network, or train.py to draw a full training step.'],
        ['Gesture control', 'MediaPipe hand tracking turns the view; the camera feed never leaves the browser.'],
      ],
      pipeline: ['model.py', 'Lexer', 'Parser', 'Shape-only interpreter', 'Trace', 'Model IR', '3D scene'],
    },
  },
  {
    id: 'soclook',
    name: 'SOCLOOK',
    repo: 'https://github.com/m0NSYuke/SOCLOOK',
    live: SOCLOOK_URL,
    image: () => 'soclook',
    card: () => 'soclook-hero',
    tags: ['GitHub Actions', 'Python', 'React', 'Zod', 'RSS / Atom'],
    zh: {
      kind: '每周研究工作流',
      tagline: '自动采集，人工核验，每周一期的全球观察。',
      summary: '把每周的研究固定成一条流水线：机器负责收集和整理，判断留给读原文之后的人。',
      body: '采集到的只是待核验的线索，不等于结论。每条正式记录都写清事实、标明推论，附上验证指标、反面证据和原始链接；来源没覆盖到的地方，页面上会明说。',
      liveLabel: '打开观察站',
      liveNote: '每周六更新',
      stats: [['08:35', '', '每周六（北京时间）自动开始采集'], [5, '', '个官方信息源，缺口在页面上列出'], [0, '', '次伪装成功：全部来源失败就保留旧站']],
      steps: [
        ['采集', '每周六早上，GitHub Actions 抓取官方 RSS / Atom。'],
        ['筛选', '按北京时间窗口筛选、去重，拒绝没有日期和不安全的链接。'],
        ['核验', '阅读原文、交叉核对，把事实和推论分开。'],
        ['成刊', '写成周报：事实、推论、验证指标、反面证据、原始链接。'],
        ['发布', '校验编号、日期和前后期引用，通过后自动构建上线。'],
      ],
    },
    en: {
      kind: 'Weekly research workflow',
      tagline: 'Collected automatically, checked by hand, published every week.',
      summary: 'Weekly research as a fixed pipeline: the machine gathers and sorts, and the judgment waits until someone has read the source.',
      body: 'What gets collected is a lead to verify, not a conclusion. Every published entry separates facts from labelled inferences and comes with what to watch, the evidence against, and the original links; gaps in coverage are listed on the page.',
      liveLabel: 'Open the observatory',
      liveNote: 'Updated every Saturday',
      stats: [['08:35', '', 'every Saturday, Beijing time, collection starts on its own'], [5, '', 'official sources, with coverage gaps listed'], [0, '', 'fake successes: if every source fails, the old site stays']],
      steps: [
        ['Collect', 'Every Saturday morning, GitHub Actions fetches official RSS and Atom feeds.'],
        ['Filter', 'Items are windowed by Beijing time and deduplicated; undated or unsafe links are rejected.'],
        ['Verify', 'Read the source, cross-check, and keep facts apart from inferences.'],
        ['Write', 'The issue: facts, inferences, what to watch, the evidence against, the original links.'],
        ['Publish', 'Numbering, dates and links to earlier issues are validated, then the site rebuilds itself.'],
      ],
    },
  },
];

export const projectText = (project, lang) => project[lang] || project.zh;
