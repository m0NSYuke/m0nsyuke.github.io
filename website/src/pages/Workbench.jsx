import {ArrowUpRight, GithubLogo} from '@phosphor-icons/react';
import {REPOSITORY} from '../lib/site';

// A new idea file on GitHub, pre-filled with today's date and the header lines.
function newIdeaUrl(repo) {
  const today = new Date().toLocaleDateString('sv-SE', {timeZone: 'Asia/Shanghai'});
  const value = `---\ntitle: \ndate: ${today}\ntags: \nstatus: 萌芽\n---\n**为什么会想到它**：\n\n**想法本身**：\n\n**怎么验证**：\n`;
  return `${repo}/new/main/website/content/ideas?filename=${today}-idea.md&value=${encodeURIComponent(value)}`;
}

// Maintainer page. Not linked anywhere for visitors; open it at #admin or with the g then a shortcut.
export default function Workbench() {
  const repo = `https://github.com/${REPOSITORY}`;
  const steps = [
    ['写随记', '一个想法一个文件：改文件名里的英文短语，填标题、标签和状态（萌芽 / 推进中 / 已验证 / 搁置），提交即发布。', newIdeaUrl(repo), '新建一条随记'],
    ['写文章', '正文使用 Markdown，文章信息保存在同名 JSON 文件。', `${repo}/tree/main/website/content/published`, '打开文章目录'],
    ['改资料', '更新个人介绍、大学、专业和联系方式。', `${repo}/edit/main/website/content/profile.json`, '编辑个人资料'],
    ['看发布', '提交修改后检查发布进度，完成后刷新网站。', `${repo}/actions`, '查看发布进度'],
  ];
  return <div className="container page">
    <header className="page-head">
      <h1 className="page-title" tabIndex={-1}>内容管理</h1>
      <p className="page-lede">在 GitHub 更新文章与个人资料，提交后网站会自动发布。</p>
    </header>
    <ol className="workbench-steps" role="list">
      {steps.map(([title, text, href, label]) => <li key={title}>
        <h2 className="workbench-title">{title}</h2>
        <p>{text}</p>
        <a className="text-link" href={href} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={16} aria-hidden="true"/></a>
      </li>)}
    </ol>
    <a className="button button-secondary" href={`${repo}/blob/main/README.md`} target="_blank" rel="noreferrer"><GithubLogo size={18} aria-hidden="true"/>阅读更新指南</a>
  </div>;
}
