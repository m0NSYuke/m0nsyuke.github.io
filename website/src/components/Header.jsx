import {useEffect, useRef, useState} from 'react';
import {List, MagnifyingGlass, X, Sun, Moon, Desktop} from '@phosphor-icons/react';
import Logo from './Logo';
import {isMac} from '../lib/site';
import {getPreference, onThemeChange, setPreference} from '../lib/theme';
import {setLang, useLang, useT} from '../lib/i18n';

export const NAV = ['notes', 'lab', 'about'];
const THEMES = [['system', Desktop], ['light', Sun], ['dark', Moon]];

function LangSwitch({full = false}) {
  const lang = useLang(), t = useT();
  return <button type="button" className={`lang-switch ${full ? 'button button-secondary' : ''}`} lang={lang === 'zh' ? 'en' : 'zh-CN'} aria-label={t('lang.switch')} title={t('lang.switch')} onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
    {full ? t('lang.name') : t('lang.short')}
  </button>;
}

function useThemePreference() {
  const [preference, setState] = useState(getPreference);
  useEffect(() => onThemeChange(() => setState(getPreference())), []);
  return preference;
}

function ThemeSwitch({compact = false}) {
  const preference = useThemePreference(), t = useT();
  const keydown = event => {
    const step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[event.key];
    if (!step) return;
    event.preventDefault();
    const index = (THEMES.findIndex(([value]) => value === preference) + step + THEMES.length) % THEMES.length;
    const button = event.currentTarget.children[index];
    setPreference(THEMES[index][0], button);
    button.focus();
  };
  return <div className={`theme-switch ${compact ? 'compact' : ''}`} role="radiogroup" aria-label={t('theme.group')} onKeyDown={keydown}>
    {THEMES.map(([value, Icon]) => [value, t(`theme.${value}`), Icon]).map(([value, label, Icon]) => <button key={value} type="button" role="radio" aria-checked={preference === value} tabIndex={preference === value ? 0 : -1} aria-label={label} title={label} onClick={event => setPreference(value, event.currentTarget)}>
      <Icon size={18} weight={preference === value ? 'fill' : 'regular'} aria-hidden="true"/>
      {!compact && <span>{label}</span>}
    </button>)}
  </div>;
}

function useFocusTrap(open, container, onClose, returnTo) {
  useEffect(() => {
    if (!open) return;
    const node = container.current;
    const focusables = () => [...node.querySelectorAll('a[href],button:not([disabled])')];
    focusables()[0]?.focus();
    const scrollY = window.scrollY;
    document.documentElement.classList.add('scroll-locked');
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.key !== 'Tab') return;
      const list = focusables(), first = list[0], last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.documentElement.classList.remove('scroll-locked');
      window.scrollTo({top: scrollY, behavior: 'instant'});
      returnTo.current?.focus({preventScroll: true});
    };
  }, [open]);
}

export default function Header({route, onSearch, searchRef}) {
  const t = useT();
  const [menu, setMenu] = useState(false), [scrolled, setScrolled] = useState(false), [shortcut, setShortcut] = useState('Ctrl K');
  const menuRef = useRef(null), menuButton = useRef(null);
  const section = route.split('/')[0];
  const current = path => section === path || (path === 'notes' && section === 'article');
  useEffect(() => setShortcut(isMac() ? '⌘K' : 'Ctrl K'), []);
  useEffect(() => setMenu(false), [route]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  useFocusTrap(menu, menuRef, () => setMenu(false), menuButton);
  return <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
    <div className="container header-inner">
      <a href="#" className="brand"><Logo size={28}/><span>m0NSYuke</span></a>
      <nav className="desktop-nav" aria-label={t('nav.main')}>
        {NAV.map(path => <a key={path} href={`#${path}`} aria-current={current(path) ? 'page' : undefined}>{t(`nav.${path}`)}</a>)}
      </nav>
      <div className="header-actions">
        <button ref={searchRef} type="button" className="search-trigger" onClick={onSearch} aria-label={t('search.aria', shortcut)} aria-keyshortcuts={shortcut === '⌘K' ? 'Meta+K' : 'Control+K'}>
          <MagnifyingGlass size={18} aria-hidden="true"/><span className="search-label">{t('search.button')}</span><kbd aria-hidden="true">{shortcut}</kbd>
        </button>
 <ThemeSwitch compact/>
        <LangSwitch/>
        <button ref={menuButton} type="button" className="icon-button menu-trigger" aria-label={t('nav.openMenu')} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu(true)}><List size={24} aria-hidden="true"/></button>
      </div>
    </div>
    {menu && <div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label={t('nav.menu')} ref={menuRef}>
      <div className="mobile-menu-scrim" onClick={() => setMenu(false)}/>
      <div className="mobile-menu-panel">
        <div className="mobile-menu-top">
          <a href="#" className="brand"><Logo size={28}/><span>m0NSYuke</span></a>
          <button type="button" className="icon-button" aria-label={t('nav.closeMenu')} onClick={() => setMenu(false)}><X size={24} aria-hidden="true"/></button>
        </div>
        <nav aria-label={t('nav.main')}>
          {['', ...NAV].map((path, index) => <a key={path || 'home'} href={`#${path}`} style={{'--i': index}} aria-current={(path ? current(path) : section === 'home') ? 'page' : undefined}>{t(`nav.${path || 'home'}`)}</a>)}
        </nav>
        <div className="mobile-menu-foot" style={{'--i': NAV.length + 1}}>
          <button type="button" className="button button-secondary" onClick={() => { setMenu(false); onSearch(); }}><MagnifyingGlass size={18} aria-hidden="true"/> {t('search.button')}</button>
          <ThemeSwitch/>
          <LangSwitch full/>
        </div>
      </div>
    </div>}
  </header>;
}
