import {BookOpen, EnvelopeSimple, GithubLogo, Rss} from '@phosphor-icons/react';
import Logo from './Logo';
import {RSS_URL, settings} from '../lib/site';
import {useT} from '../lib/i18n';

export default function Footer() {
  const t = useT();
  const explore = [['#notes', t('nav.notes')], ['#ideas', t('nav.ideas')], ['#projects', t('nav.projects')], ['#lab', t('nav.lab')], ['#about', t('nav.about')]];
  const follow = [
    settings.github && [settings.github, 'GitHub', GithubLogo],
    settings.xiaohongshu && [settings.xiaohongshu, t('about.xhs'), BookOpen],
    [RSS_URL, 'RSS', Rss],
    settings.email && [`mailto:${settings.email}`, t('footer.mail'), EnvelopeSimple],
  ].filter(Boolean);
  const external = href => (href.startsWith('http') || href.endsWith('.xml') ? {target: '_blank', rel: 'noreferrer'} : {});
  return <footer className="site-footer">
    <div className="container footer-inner">
      <div className="footer-brand">
        <Logo size={32}/>
        <p className="footer-line">{t('footer.line')}</p>
      </div>
      <nav className="footer-col" aria-labelledby="footer-explore">
        <p id="footer-explore" className="footer-heading">{t('footer.explore')}</p>
        <ul role="list">{explore.map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
      </nav>
      <nav className="footer-col" aria-labelledby="footer-follow">
        <p id="footer-follow" className="footer-heading">{t('footer.follow')}</p>
        <ul role="list">{follow.map(([href, label, Icon]) => <li key={label}><a href={href} {...external(href)}><Icon size={18} aria-hidden="true"/>{label}</a></li>)}</ul>
      </nav>
      <p className="footer-copy">© {new Date().getFullYear()} m0NSYuke</p>
    </div>
  </footer>;
}
