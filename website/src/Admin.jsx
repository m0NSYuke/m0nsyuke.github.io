import { useEffect, useState } from 'react';
import { Plus, SignOut, Eye, FloppyDisk, PaperPlaneTilt, ArrowLeft } from '@phosphor-icons/react';
import { request } from './api';
import { RichText } from './Content';

const kinds={article:'技术笔记',project:'作品',log:'工作日志'};
const blank = kind => ({id:`${kind}-${Date.now().toString(36)}`,kind,section:'blog',title:'',summary:'',body:'',tag:'VLA',date:new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'}),image:kind==='article'?'note-wave.png':kind==='project'?'featured-morph.png':'',status:'draft',sample:false});
export default function Admin({onUpdated}) {
  const [session,setSession]=useState(null),[items,setItems]=useState([]),[settings,setSettings]=useState(null),[editor,setEditor]=useState(null),[isNew,setNew]=useState(false),[view,setView]=useState('content'),[filter,setFilter]=useState('all'),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[preview,setPreview]=useState(false);
  const load=async()=>{const auth=await request('/api/admin/session');setSession(auth);if(auth.authenticated){const data=await request('/api/admin/content');setItems(data.items);setSettings(data.settings);}};
  useEffect(()=>{load().catch(e=>setError(e.message));},[]);
  async function login(e) {e.preventDefault();if(!session){setError('内容服务尚未连接，请刷新后再试。');return;}setError('');if(session.needsSetup&&password!==confirmation){setError('两次输入的密码不一致。');return;}setBusy(true);try{await request(session.needsSetup?'/api/admin/setup':'/api/admin/login',{method:'POST',body:JSON.stringify({password})});setPassword('');setConfirmation('');await load();}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function save(status) {setError('');setMessage('');setBusy(true);try{const data=await request('/api/admin/content',{method:'PUT',body:JSON.stringify({...editor,status})});setEditor(data.item);setNew(false);await load();onUpdated();setMessage(status==='published'?'已发布，前台内容已更新。':'草稿已保存，仅你可在后台查看。');}catch(e){setError(e.message);}finally{setBusy(false);}}
  async function saveSettings(e){e.preventDefault();setError('');setMessage('');setBusy(true);try{await request('/api/admin/settings',{method:'PUT',body:JSON.stringify(settings)});onUpdated();setMessage('个人资料已保存。');}catch(e){setError(e.message);}finally{setBusy(false);}}
  const edit=(item,newItem=false)=>{setEditor({...item});setNew(newItem);setMessage('');setError('');setPreview(false);};
  const field=(key,value)=>setEditor(prev=>({...prev,[key]:value}));
  return <div className="admin-page page-content">
    <a href="#" className="back-link"><ArrowLeft size={18}/> 返回网站</a>
    <div className="page-heading"><div><span className="eyebrow">YOUR PERSONAL WORKBENCH</span><h1>内容工作台</h1><p>写下想法，保存过程，发布值得分享的内容。</p></div>{session?.authenticated&&<button className="text-button" onClick={async()=>{await request('/api/admin/logout',{method:'POST'});setEditor(null);setSession({...session,authenticated:false});}}><SignOut size={18}/> 退出</button>}</div>
    {error&&<p className="notice error" role="alert">{error}</p>}{message&&<p className="notice success" role="status">{message}</p>}
    {!session&&!error?<div className="loading-state">正在连接工作台…</div>:!session?.authenticated?<form className="auth-form" onSubmit={login}>
      <h2>{session?.needsSetup?'创建你的管理密码':'欢迎回来。'}</h2><p>{session?.needsSetup?'首次使用时，在本机设置管理密码。之后只有登录的人可以修改内容。':'输入管理密码，继续更新你的网站。'}</p>
      {session?.needsSetup&&!session.local?<p className="notice">请在网站所在的电脑上完成首次初始化。</p>:<>
      <label>管理密码<input type="password" autoComplete={session?.needsSetup?'new-password':'current-password'} minLength={12} maxLength={256} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="至少 12 个字符"/></label>
      {session?.needsSetup&&<label>再次输入<input type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label>}
      <button className="outline-button" type="submit" disabled={busy}>{busy?'正在连接…':session?.needsSetup?'创建密码并进入':'进入工作台'}</button></>}
    </form>:<>
      <div className="tabs"><button aria-pressed={view==='content'} className={view==='content'?'active':''} onClick={()=>setView('content')}>内容</button><button aria-pressed={view==='settings'} className={view==='settings'?'active':''} onClick={()=>setView('settings')}>个人资料</button></div>
      {view==='settings'?<form className="settings-form editor-form" onSubmit={saveSettings}>
        <label>品牌名称<input readOnly value={settings.name}/></label>
        <label>首页标题<input required value={settings.tagline} onChange={e=>setSettings({...settings,tagline:e.target.value})}/></label>
        <label>一句介绍<input required value={settings.description} onChange={e=>setSettings({...settings,description:e.target.value})}/></label>
        <label>关于我<textarea value={settings.bio} onChange={e=>setSettings({...settings,bio:e.target.value})}/></label>
        <label>GitHub 个人主页<input type="url" placeholder="https://github.com/你的用户名" value={settings.github} onChange={e=>setSettings({...settings,github:e.target.value})}/></label>
        <label>联系邮箱<input type="email" value={settings.email} placeholder="可选" onChange={e=>setSettings({...settings,email:e.target.value})}/></label>
        <label>小红书个人主页<input type="url" value={settings.xiaohongshu} onChange={e=>setSettings({...settings,xiaohongshu:e.target.value})}/></label>
        <div className="form-row"><label>大学<input value={settings.university} onChange={e=>setSettings({...settings,university:e.target.value})}/></label><label>专业<input value={settings.major} onChange={e=>setSettings({...settings,major:e.target.value})}/></label></div>
        <label>就读年份 · 可选<input value={settings.educationPeriod} placeholder="未填写时不展示" onChange={e=>setSettings({...settings,educationPeriod:e.target.value})}/></label>
        <button disabled={busy} className="outline-button"><FloppyDisk size={16}/> {busy?'保存中…':'保存资料'}</button>
      </form>:<div className="admin-grid">
        <aside className="admin-list"><div className="admin-new">{Object.entries(kinds).map(([kind,label])=><button key={kind} className="text-button" onClick={()=>edit(blank(kind),true)}><Plus size={14}/> {label}</button>)}</div>
          <label className="visually-hidden" htmlFor="content-filter">筛选内容</label><select id="content-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">全部内容</option>{Object.entries(kinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}<option value="draft">所有草稿</option></select>
          {items.filter(item=>filter==='all'||item.kind===filter||(filter==='draft'&&item.status==='draft')).map(item=><button className={`admin-item ${editor?.id===item.id?'selected':''}`} key={item.id} onClick={()=>edit(item)}><span className="mono subtle">{kinds[item.kind]} / {item.status==='published'?'已发布':'草稿'}</span><strong>{item.title}</strong><small>{item.date}</small></button>)}
        </aside>
        <section className="editor-pane">{!editor?<div className="empty-state"><span className="eyebrow">A PLACE FOR YOUR IDEAS</span><h2>下一篇，写点什么？</h2><p>选择已有内容，或创建一篇新的记录。</p><p className="subtle">示例作品与笔记带有标记，替换为真实内容后可取消。</p></div>:<>
          <div className="editor-heading"><span className="eyebrow">{kinds[editor.kind]} / {editor.status==='draft'?'DRAFT':'PUBLISHED'}</span><button className="text-button" onClick={()=>setPreview(!preview)}><Eye size={16}/> {preview?'继续编辑':'阅读预览'}</button></div>
          {preview?<article className="prose editor-preview"><h1>{editor.title||'未命名内容'}</h1><p className="subtle">{editor.summary}</p><RichText content={editor.body}/></article>:<form className="editor-form" onSubmit={e=>{e.preventDefault();save('draft');}}>
            <label>标题<input required maxLength={120} value={editor.title} onChange={e=>field('title',e.target.value)}/></label>
            {editor.kind==='article'&&<label>阅读分区<select value={editor.section||'blog'} onChange={e=>field('section',e.target.value)}><option value="foundation">基础知识</option><option value="blog">技术博客</option></select></label>}
            <div className="form-row"><label>日期<input type="date" required value={editor.date} onChange={e=>field('date',e.target.value)}/></label><label>标签<input maxLength={40} value={editor.tag} onChange={e=>field('tag',e.target.value)}/></label></div>
            <label>摘要<textarea maxLength={400} rows={2} value={editor.summary} onChange={e=>field('summary',e.target.value)}/></label>
            <label>正文 · Markdown<textarea className="markdown-input" rows={15} value={editor.body} onChange={e=>field('body',e.target.value)} placeholder={'# 标题\n\n写下你的想法…'}/></label>
            <div className="form-row"><label>链接标识<input readOnly={!isNew} pattern="[a-z0-9][a-z0-9-]*" maxLength={80} required value={editor.id} onChange={e=>field('id',e.target.value)}/></label><label>封面<select value={editor.image} onChange={e=>field('image',e.target.value)}><option value="">无封面</option><option value="featured-morph.png">形态演化</option><option value="hero-sculpture.png">金色雕塑</option><option value="note-architecture.png">建筑空间</option><option value="note-wave.png">有机波纹</option><option value="note-spiral.png">螺旋网格</option></select></label></div>
            <label className="checkbox-label"><input type="checkbox" checked={editor.sample} onChange={e=>field('sample',e.target.checked)}/> 标记为示例内容</label>
          </form>}
          <div className="editor-actions"><button className="text-button" disabled={busy} onClick={()=>save('draft')}><FloppyDisk size={16}/> {editor.status==='published'?'撤回为草稿':'保存草稿'}</button><button className="outline-button" disabled={busy} onClick={()=>save('published')}><PaperPlaneTilt size={16}/> {busy?'保存中…':'发布内容'}</button></div>
        </>}</section>
      </div>}
    </>}
  </div>;
}
