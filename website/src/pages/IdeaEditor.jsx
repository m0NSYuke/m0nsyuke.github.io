import {useCallback, useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowUpRight, CheckCircle, CloudArrowUp, Trash, X} from '@phosphor-icons/react';
import {Crepe} from '@milkdown/crepe';
import {editorViewCtx, remarkPluginsCtx} from '@milkdown/kit/core';
import {TextSelection} from '@milkdown/kit/prose/state';
import {uploadConfig} from '@milkdown/kit/plugin/upload';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import '../styles/ideas.css';
import '../styles/idea-editor.css';
import {REPOSITORY} from '../lib/site';
import {
  MEDIA_PREFIX, compressImage, connect, deleteDraft, deleteMedia, forgetToken, getDraft, getMedia, hasToken,
  ideaFile, loadIdea, mediaIn, mediaPath, publish, putDraft, putMedia,
} from '../lib/idea-store';

const STATUSES = ['萌芽', '推进中', '已验证', '搁置'];
const today = () => new Date().toLocaleDateString('sv-SE', {timeZone: 'Asia/Shanghai'});
const newId = () => `${today()}-${Date.now().toString(36).slice(-5)}`;
const clock = time => new Date(time).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
// Milkdown 7.22 drops an image without a caption when reading Markdown back in (its
// caption attribute must be a string but arrives as null); give every image an empty one.
const captionFix = {plugin: () => tree => {
  const visit = node => {
    if ((node.type === 'image' || node.type === 'image-block' || node.type === 'image-inline') && node.title == null) node.title = '';
    node.children?.forEach(visit);
  };
  visit(tree);
}, options: {}};

const TOKEN_URL =`https://github.com/settings/personal-access-tokens/new?name=${encodeURIComponent('m0NSYuke 随记')}&description=${encodeURIComponent('在网站上写随记')}&target_name=${REPOSITORY.split('/')[0]}&expires_in=365&contents=write`;

function Connect({onDone}) {
  const [token, setToken] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    try { await connect(token); onDone(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <form className="idea-connect" onSubmit={submit}>
    <h1 className="page-title" tabIndex={-1}>连接 GitHub 后在这里写随记</h1>
    <p className="page-lede">随记直接提交到网站仓库，提交后约 2 分钟上线。每台设备只需连接一次。</p>
    <ol className="idea-connect-steps">
      <li><a className="text-link" href={TOKEN_URL} target="_blank" rel="noreferrer">在 GitHub 创建一个令牌<ArrowUpRight size={16} aria-hidden="true"/></a>：Repository access 选 <b>Only select repositories</b> → <code>{REPOSITORY.split('/')[1]}</code>；Permissions 里把 <b>Contents</b> 设为 <b>Read and write</b>，其余不用动。</li>
      <li>生成后复制令牌（<code>github_pat_</code> 开头），粘贴到下面。</li>
    </ol>
    <label className="idea-connect-field">
      <span>令牌</span>
      <input type="password" value={token} onChange={event => setToken(event.target.value)} autoComplete="off" spellCheck="false" placeholder="github_pat_…" required/>
    </label>
    {error && <p className="idea-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={busy || !token.trim()}>{busy ? '正在验证…' : '连接'}</button>
    <p className="idea-hint">令牌只保存在这个浏览器里，只发给 GitHub，并且只能改这一个仓库。不用时可以在 GitHub 的 Settings → Developer settings 里撤销。</p>
  </form>;
}

function Tags({tags, onChange}) {
  const [text, setText] = useState('');
  const add = value => {
    const tag = value.replace(/[,，#]/g, '').trim().slice(0, 24);
    if (tag && !tags.includes(tag) && tags.length < 6) onChange([...tags, tag]);
    setText('');
  };
  return <div className="idea-tags-input">
    {tags.map(tag => <span key={tag} className="idea-tag-chip">#{tag}<button type="button" aria-label={`删除标签 ${tag}`} onClick={() => onChange(tags.filter(item => item !== tag))}><X size={12} aria-hidden="true"/></button></span>)}
    {tags.length < 6 && <input value={text} aria-label="添加标签" placeholder={tags.length ? '' : '标签，回车添加'} onChange={event => /[,，]/.test(event.target.value) ? add(event.target.value) : setText(event.target.value)}
      onKeyDown={event => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); add(text); }
        else if (event.key === 'Backspace' && !text && tags.length) onChange(tags.slice(0, -1));
      }} onBlur={() => text && add(text)}/>}
  </div>;
}

export default function IdeaEditor({editId}) {
  const draftKey = editId ? `edit:${editId}` : 'new';
  const [phase, setPhase] = useState(hasToken() ? 'loading' : 'connect');
  const [meta, setMeta] = useState(null);
  const [notice, setNotice] = useState(''), [error, setError] = useState(''), [savedAt, setSavedAt] = useState(0), [busy, setBusy] = useState('');
  const [published, setPublished] = useState(null);
  const host = useRef(null), crepe = useRef(null), doc = useRef(null), media = useRef(new Map()), timer = useRef(0);
  // doc: {id, original (media already in the repository), body}

  // Load: an unpublished draft wins; otherwise a new note or the file from the repository.
  const load = useCallback(async () => {
    setPhase('loading'); setError('');
    try {
      const draft = await getDraft(draftKey);
      let start;
      if (draft) {
        start = draft;
        setNotice(editId ? '已恢复上次没有发布的修改。' : '已恢复上次没写完的草稿。');
      } else if (editId) {
        const idea = await loadIdea(editId);
        if (!idea) throw new Error('仓库里没有找到这条随记，可能已被删除。');
        start = {id: editId, meta: {title: idea.title, date: idea.date, tags: idea.tags, status: idea.status}, body: idea.body, original: mediaIn(idea.body), sample: idea.sample};
      } else {
        start = {id: newId(), meta: {title: '', date: today(), tags: [], status: '萌芽'}, body: '', original: []};
      }
      for (const path of mediaIn(start.body)) {
        const blob = await getMedia(path);
        if (blob) media.current.set(path, URL.createObjectURL(blob));
      }
      doc.current = start;
      setMeta(start.meta);
      setPhase('ready');
    } catch (e) {
      if (e.status === 401) { forgetToken(); setPhase('connect'); }
      else { setError(e.message); setPhase('error'); }
    }
  }, [draftKey, editId]);
  useEffect(() => { if (phase === 'loading') load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = 0;
    const current = doc.current;
    if (!current || !crepe.current) return;
    current.body = crepe.current.getMarkdown();
    await putDraft(draftKey, {...current, updated: Date.now()});
    setSavedAt(Date.now());
  }, [draftKey]);
  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save().catch(e => setError(`草稿没能保存：${e.message}`)), 600);
  }, [save]);

  // Pasted, dropped or picked images: compressed, kept as a local draft blob, shown at once.
  const addImage = useCallback(async file => {
    if (!file?.type?.startsWith('image/')) throw new Error('只能插入图片');
    const {blob, ext} = await compressImage(file);
    if (blob.size > 8 * 1024 * 1024) { setError('图片压缩后仍超过 8 MB，请先裁剪。'); throw new Error('too large'); }
    const path = mediaPath(doc.current.id, ext);
    await putMedia(path, blob);
    media.current.set(path, URL.createObjectURL(blob));
    return path;
  }, []);
  // Images already in the repository show from it directly, before the site redeploys.
  const display = useCallback(url => media.current.get(url) || (url.startsWith(MEDIA_PREFIX) ? `https://raw.githubusercontent.com/${REPOSITORY}/main/website/public${url}` : url), []);

  useEffect(() => {
    if (phase !== 'ready' || !host.current) return;
    const editor = new Crepe({
      root: host.current,
      defaultValue: doc.current.body,
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {text: '写下这个想法…  图片可以直接粘贴或拖进来，输入 / 插入其他内容', mode: 'doc'},
        [Crepe.Feature.ImageBlock]: {
          onUpload: addImage, blockOnUpload: addImage, inlineOnUpload: addImage, proxyDomURL: display,
          blockUploadButton: '选择图片', blockUploadPlaceholderText: '或粘贴图片链接', blockCaptionPlaceholderText: '图片说明（可选）', blockConfirmButton: '确定',
          inlineUploadButton: '选择图片', inlineUploadPlaceholderText: '或粘贴图片链接', inlineConfirmButton: '确定',
        },
        [Crepe.Feature.BlockEdit]: {
          textGroup: {label: '文本', text: {label: '正文'}, h1: {label: '标题 1'}, h2: {label: '标题 2'}, h3: {label: '标题 3'}, h4: null, h5: null, h6: null, quote: {label: '引用'}, divider: {label: '分割线'}},
          listGroup: {label: '列表', bulletList: {label: '无序列表'}, orderedList: {label: '有序列表'}, taskList: {label: '待办'}},
          advancedGroup: {label: '插入', image: {label: '图片'}, codeBlock: {label: '代码块'}, table: {label: '表格'}, math: {label: '公式'}},
        },
      },
    });
    // Crepe turns pasted files into temporary blob: links; keep them as real, saved images.
    editor.editor.config(ctx => ctx.update(remarkPluginsCtx, plugins => [...plugins, captionFix]));
    editor.editor.config(ctx => ctx.update(uploadConfig.key, prev => ({...prev, uploader: async (files, schema) => {
      const nodes = [];
      for (const file of Array.from(files)) {
        try { nodes.push(schema.nodes['image-block'].createAndFill({src: await addImage(file)})); } catch { /* reported by addImage */ }
      }
      return nodes.filter(Boolean);
    }})));
    editor.on(listener => listener.markdownUpdated(() => schedule()));
    // Pasted screenshots: the image replaces an empty line (or goes below the current
    // paragraph) and the cursor lands on a fresh line under it, ready to keep typing.
    const paste = async event => {
      const files = [...(event.clipboardData?.files || [])].filter(file => file.type.startsWith('image/'));
      if (!files.length || event.clipboardData.getData('text/plain').trim()) return;
      event.preventDefault();
      event.stopPropagation();
      for (const file of files) {
        let src;
        try { src = await addImage(file); } catch { continue; }
        editor.editor.action(ctx => {
          const view = ctx.get(editorViewCtx), {state} = view, {$from} = state.selection;
          const image = state.schema.nodes['image-block'].create({src});
          const line = state.schema.nodes.paragraph.create();
          let tr = state.tr, at;
          if ($from.depth >= 1 && $from.parent.isTextblock && !$from.parent.content.size && $from.depth === 1) {
            at = $from.before(1);
            tr = tr.replaceWith(at, $from.after(1), [image, line]);
          } else {
            at = $from.depth >= 1 ? $from.after(1) : state.selection.from;
            tr = tr.insert(at, [image, line]);
          }
          view.dispatch(tr.setSelection(TextSelection.create(tr.doc, at + image.nodeSize + 1)).scrollIntoView());
          view.focus();
        });
      }
    };
    host.current.addEventListener('paste', paste, true);
    const surface = host.current;
    let live = true;
    editor.create().then(() => { if (live) crepe.current = editor; });
    return () => {
      live = false;
      surface.removeEventListener('paste', paste, true);
      // Typing just before leaving: write it now rather than after the debounce.
      if (timer.current && crepe.current === editor) {
        clearTimeout(timer.current);
        timer.current = 0;
        doc.current.body = editor.getMarkdown();
        putDraft(draftKey, {...doc.current, updated: Date.now()}).catch(() => {});
      }
      crepe.current = null;
      editor.destroy();
    };
  }, [phase, addImage, display, schedule, draftKey]);

  // Ctrl/⌘ S saves the draft right away instead of opening the browser's save dialog.
  useEffect(() => {
    const keydown = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save().catch(() => {}); }
    };
    addEventListener('keydown', keydown);
    return () => removeEventListener('keydown', keydown);
  }, [save]);
  // Closing the tab flushes the pending save; a publish in flight asks first.
  useEffect(() => {
    const leave = event => {
      if (timer.current) save().catch(() => {});
      if (busy) { event.preventDefault(); event.returnValue = ''; }
    };
    addEventListener('beforeunload', leave);
    return () => removeEventListener('beforeunload', leave);
  }, [busy, save]);
  useEffect(() => () => media.current.forEach(url => URL.revokeObjectURL(url)), []);

  const update = changes => {
    setMeta(prev => {
      const next = {...prev, ...changes};
      doc.current.meta = next;
      return next;
    });
    schedule();
  };

  const submit = async (remove = false) => {
    setError('');
    const body = crepe.current?.getMarkdown().trim() || '';
    const current = doc.current;
    if (!remove) {
      if (!meta.title.trim()) return setError('先写一个标题。');
      if (meta.title.length > 120) return setError('标题最多 120 个字。');
      if (!body) return setError('正文还是空的。');
      if (body.length > 20000) return setError('正文太长了（上限 2 万字）；可以拆成几条随记。');
    } else if (!confirm(`删除「${meta.title || '这条随记'}」？网站约 2 分钟后更新；Git 历史里仍可找回。`)) return;
    setBusy(remove ? 'remove' : 'publish');
    try {
      await save();
      const used = remove ? [] : mediaIn(body);
      const images = [];
      for (const path of used.filter(path => !current.original.includes(path))) {
        const blob = await getMedia(path);
        if (!blob) throw new Error(`图片丢失：${path}。请删掉它重新粘贴。`);
        images.push({path, blob});
      }
      const removed = current.original.filter(path => !used.includes(path));
      const file = ideaFile(meta, body);
      await publish({
        id: current.id, remove, images, removed,
        file: current.sample ? file.replace('\n---\n', '\nsample: true\n---\n') : file,
        message: `${remove ? '删除' : editId ? '更新' : '新增'}随记：${meta.title.trim() || current.id}`,
      });
      await deleteDraft(draftKey);
      await deleteMedia(mediaIn(current.body).concat(used));
      setPublished({id: current.id, removed: remove});
    } catch (e) {
      if (e.status === 401) { forgetToken(); setPhase('connect'); }
      setError(`没能提交：${e.message}。草稿还在本机，可以稍后再试。`);
    } finally {
      setBusy('');
    }
  };

  const discard = async () => {
    if (!confirm(editId ? '放弃本机上未发布的修改，回到网站上的版本？' : '清空这篇草稿？')) return;
    clearTimeout(timer.current);
    timer.current = 0;
    await deleteDraft(draftKey);
    await deleteMedia(mediaIn(doc.current?.body || '').filter(path => !doc.current.original.includes(path)));
    setNotice('');
    location.reload();
  };

  if (phase === 'connect') return <div className="container page idea-editor-page"><Connect onDone={() => { setPhase('loading'); load(); }}/></div>;
  if (published) return <div className="container page idea-editor-page idea-done">
    <CheckCircle size={40} weight="light" aria-hidden="true"/>
    <h1 className="page-title" tabIndex={-1}>{published.removed ? '已删除' : '已发布'}</h1>
    <p className="page-lede">已经提交到网站仓库，GitHub 正在重新部署，约 2 分钟后{published.removed ? '从随记页消失' : '出现在随记页'}。</p>
    <div className="button-row">
      <a className="button button-primary" href="#ideas/new" onClick={() => setTimeout(() => location.reload(), 0)}>再写一条</a>
      <a className="button button-secondary" href={published.removed ? '#ideas' : `#ideas/${published.id}`}>回到随记</a>
      <a className="text-link" href={`https://github.com/${REPOSITORY}/actions`} target="_blank" rel="noreferrer">查看部署进度<ArrowUpRight size={16} aria-hidden="true"/></a>
    </div>
  </div>;
  return <div className="container page idea-editor-page">
    <div className="idea-editor-bar">
      <a className="text-link idea-back" href={editId ? `#ideas/${editId}` : '#ideas'}><ArrowLeft size={16} aria-hidden="true"/>随记</a>
      <span className="idea-save-state" aria-live="polite">{busy === 'publish' ? '正在提交…' : busy === 'remove' ? '正在删除…' : savedAt ? `草稿已保存在本机 · ${clock(savedAt)}` : '自动保存在本机'}</span>
      {editId && <button type="button" className="icon-button" aria-label="删除这条随记" title="删除这条随记" disabled={!!busy || phase !== 'ready'} onClick={() => submit(true)}><Trash size={18} aria-hidden="true"/></button>}
      <button type="button" className="button button-primary idea-publish" disabled={!!busy || phase !== 'ready'} onClick={() => submit(false)}>
        <CloudArrowUp size={18} aria-hidden="true"/>{editId ? '更新' : '发布'}
      </button>
    </div>
    {notice && <p className="idea-notice">{notice}<button type="button" className="text-link" onClick={discard}>{editId ? '放弃修改' : '清空草稿'}</button></p>}
    {error && <p className="idea-error" role="alert">{error}</p>}
    {phase === 'loading' && <div className="prose-skeleton" aria-label="正在载入"><i/><i/><i/></div>}
    {phase === 'error' && <button type="button" className="button button-secondary" onClick={load}>重试</button>}
    {phase === 'ready' && meta && <>
      <input className="idea-title-input" value={meta.title} onChange={event => update({title: event.target.value.replace(/[\r\n]/g, '')})} placeholder="标题" aria-label="标题" maxLength={120} autoFocus={!editId}/>
      <div className="idea-meta-row">
        <div className="segmented idea-status-picker" role="radiogroup" aria-label="状态">
          {STATUSES.map((status, index) => <button key={status} type="button" role="radio" aria-checked={meta.status === status} data-status={['seed', 'active', 'validated', 'parked'][index]} onClick={() => update({status})}>
            <span className="idea-swatch" aria-hidden="true"/>{status}
          </button>)}
        </div>
        <input className="idea-date-input" type="date" value={meta.date} aria-label="日期" onChange={event => event.target.value && update({date: event.target.value})}/>
        <Tags tags={meta.tags} onChange={tags => update({tags})}/>
      </div>
      <div className="idea-editor-surface" ref={host}/>
      <p className="idea-hint">图片直接粘贴或拖进来；输入 <kbd>/</kbd> 插入标题、列表、公式、代码块；<kbd>Ctrl</kbd> <kbd>S</kbd> 立即保存草稿。草稿只在这台设备上，点「{editId ? '更新' : '发布'}」才会公开。</p>
    </>}
  </div>;
}
