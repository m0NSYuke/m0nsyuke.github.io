import {Marked} from 'marked';
import markedFootnote from 'marked-footnote';
import DOMPurify from 'dompurify';

const escape = text => String(text).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const plain = html => html.replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, ' ');
import {slugify} from './site';
import {t} from './i18n';
export {slugify};

// KaTeX and highlight.js are only fetched for articles that use them.
async function extensions(source) {
  const list = [];
  if (/\$[^$\n]+\$|\$\$/.test(source)) {
    const [{default: markedKatex}] = await Promise.all([import('marked-katex-extension'), import('katex/dist/katex.min.css')]);
    list.push(markedKatex({throwOnError: false, nonStandard: true, output: 'htmlAndMathml'}));
  }
  return list;
}

let highlighter;
async function loadHighlighter() {
  highlighter ||= Promise.all([
    import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/typescript'),
    import('highlight.js/lib/languages/bash'),
    import('highlight.js/lib/languages/json'),
    import('highlight.js/lib/languages/cpp'),
    import('highlight.js/lib/languages/yaml'),
    import('highlight.js/lib/languages/xml'),
  ]).then(([core, python, javascript, typescript, bash, json, cpp, yaml, xml]) => {
    const hljs = core.default;
    Object.entries({python, javascript, typescript, bash, json, cpp, yaml, xml}).forEach(([name, module]) => hljs.registerLanguage(name, module.default));
    hljs.registerAliases(['py'], {languageName: 'python'});
    hljs.registerAliases(['js', 'jsx'], {languageName: 'javascript'});
    hljs.registerAliases(['ts', 'tsx'], {languageName: 'typescript'});
    hljs.registerAliases(['sh', 'shell', 'zsh'], {languageName: 'bash'});
    hljs.registerAliases(['c', 'c++', 'cc'], {languageName: 'cpp'});
    hljs.registerAliases(['html', 'svg'], {languageName: 'xml'});
    return hljs;
  });
  return highlighter;
}

export async function renderArticle(item) {
  const source = item.body || '';
  const hasCode = /```/.test(source);
  const [extra, hljs] = await Promise.all([extensions(source), hasCode ? loadHighlighter() : null]);
  const used = new Map();
  const headings = [];
  const parser = new Marked();
  parser.use(markedFootnote({description: t('article.footnotes'), backRefLabel: t('article.backref')}));
  extra.forEach(extension => parser.use(extension));
  parser.use({renderer: {
    heading({tokens, depth}) {
      const html = this.parser.parseInline(tokens);
      const text = plain(html).trim();
      // The Markdown file repeats the title as an H1; the page already shows it.
      if (depth === 1 && text === item.title.trim()) return '';
      const level = Math.min(depth + (depth === 1 ? 1 : 0), 4);
      let id = slugify(text) || 'section';
      const count = used.get(id) || 0;
      used.set(id, count + 1);
      if (count) id = `${id}-${count}`;
      if (level <= 3) headings.push({id, text, level});
      return `<h${level} id="${id}" class="prose-heading">${html}<a class="heading-anchor" href="#${item.kind}/${item.id}/${id}" data-anchor="${id}" aria-label="${escape(t('article.anchor', text))}">#</a></h${level}>`;
    },
    code({text, lang}) {
      const language = (lang || '').split(/\s/)[0].toLowerCase();
      const known = hljs && language && hljs.getLanguage(language);
      const body = known ? hljs.highlight(text, {language}).value : escape(text);
      return `<div class="code-block"><div class="code-bar"><span>${escape(language || 'text')}</span><button type="button" class="copy-code">${escape(t('article.copy'))}</button></div><pre><code class="hljs${language ? ` language-${escape(language)}` : ''}">${body}</code></pre></div>`;
    },
    image({href, title, text}) {
      // The idea editor stores an image's display ratio ("1.00") as its alt text and the caption as its title.
      const alt = /^\d+(\.\d+)?$/.test(text) ? title || '' : text;
      const caption = title || alt;
      return `<figure><img src="${escape(href)}" alt="${escape(alt)}" loading="lazy" decoding="async">${caption ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`;
    },
    table(token) {
      return `<div class="table-scroll" tabindex="0" role="region" aria-label="${escape(t('article.table'))}">${defaultTable.call(this, token)}</div>`;
    },
  }});
  const html = DOMPurify.sanitize(parser.parse(source), {USE_PROFILES: {html: true, mathMl: true, svg: true}, ADD_ATTR: ['data-anchor', 'tabindex', 'aria-label', 'role', 'target']});
  return {html, headings};
}

// marked's built-in table renderer, reused inside the scroll wrapper.
function defaultTable(token) {
  let header = '', body = '';
  header += '<tr>' + token.header.map(cell => this.tablecell(cell)).join('') + '</tr>';
  for (const row of token.rows) body += '<tr>' + row.map(cell => this.tablecell(cell)).join('') + '</tr>';
  return `<table><thead>${header}</thead>${body ? `<tbody>${body}</tbody>` : ''}</table>`;
}
