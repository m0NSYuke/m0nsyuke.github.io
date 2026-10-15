import {BookOpen, EnvelopeSimple, GithubLogo, Rss} from '@phosphor-icons/react';
import {RSS_URL, settings} from '../lib/site';

export default function Footer() {
  const links = [
    [RSS_URL, 'RSS', Rss],
    settings.xiaohongshu && [settings.xiaohongshu, '小红书', BookOpen],
    settings.github && [settings.github, 'GitHub', GithubLogo],
    settings.email ? [`mailto:${settings.email}`, '邮件', EnvelopeSimple] : ['#about', '联系', EnvelopeSimple],
  ].filter(Boolean);
  return <footer className="site-footer">
    <div className="container footer-inner">
      <p className="footer-line">保持好奇，继续构建。</p>
      <ul className="footer-links" role="list">
        {links.map(([href, label, Icon]) => <li key={label}><a href={href} {...(href.startsWith('http') || href.endsWith('.xml') ? {target: '_blank', rel: 'noreferrer'} : {})}><Icon size={18} aria-hidden="true"/>{label}</a></li>)}
      </ul>
      <p className="footer-copy">© {new Date().getFullYear()} m0NSYuke</p>
    </div>
  </footer>;
}
