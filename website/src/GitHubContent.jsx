import {ArrowLeft,ArrowUpRight,GithubLogo} from '@phosphor-icons/react';
import {REPOSITORY} from './api';
import Reveal from './Reveal';
export default function GitHubContent() {
  const repo=`https://github.com/${REPOSITORY}`;
  return <div className="page-content">
    <a href="#" className="back-link"><ArrowLeft size={18}/> 返回工作台</a>
    <Reveal className="page-heading"><div><span className="eyebrow">WRITE / COMMIT / PUBLISH</span><h1>继续写下去。</h1><p>在 GitHub 更新文章与个人资料，提交后网站会自动发布。</p></div></Reveal>
    <div className="about-values">{[
      ['01','写文章','正文使用 Markdown，文章信息保存在同名 JSON 文件。',`${repo}/tree/main/website/content/published`,'打开文章目录'],
      ['02','改资料','更新个人介绍、大学、专业和联系方式。',`${repo}/edit/main/website/content/profile.json`,'编辑个人资料'],
      ['03','看发布','提交修改后，检查发布进度；完成后刷新网站。',`${repo}/actions`,'查看发布进度']
    ].map(([number,title,text,href,label],index)=><Reveal key={number} delay={index*.1}><span className="mono gold">{number}</span><h2>{title}</h2><p>{text}</p><a className="gold-link" href={href} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={18}/></a></Reveal>)}</div>
    <Reveal className="about-contact"><div><span className="eyebrow">KEEP A RECORD</span><h2>每次更新，都有迹可循。</h2><p>GitHub 保存修改历史。新文章的格式和发布步骤见仓库说明。</p></div><a className="outline-button" href={`${repo}/blob/main/README.md`} target="_blank" rel="noreferrer"><GithubLogo size={20}/> 阅读更新指南</a></Reveal>
  </div>;
}
