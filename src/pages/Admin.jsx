import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'
import {useData,Async} from '../lib/hooks'
import {todayIST,fmtDate,fmtTime} from '../lib/ist'
import {useI18n} from '../i18n'
export default function Admin(){
  const {t}=useI18n(),[user,setUser]=useState(undefined),[ok,setOk]=useState(null)
  useEffect(()=>{if(!supabase){setUser(null);return}
    supabase.auth.getSession().then(({data})=>setUser(data.session?.user??null))
    const {data:l}=supabase.auth.onAuthStateChange((_,s)=>setUser(s?.user??null));return()=>l.subscription.unsubscribe()},[])
  useEffect(()=>{if(!user){setOk(null);return}
    supabase.from('profiles').select('role').eq('id',user.id).single().then(({data})=>setOk(data?.role==='admin'))},[user])
  if(user===undefined)return <p className="skel">{t('loading')}</p>
  if(!supabase)return <p className="err">{t('noConfig')}</p>
  if(!user)return <Login/>
  if(ok===null)return <p className="skel">{t('loading')}</p>
  const out=<button onClick={()=>supabase.auth.signOut()}>{t('logout')}</button>
  if(!ok)return <section><p className="err" role="alert">{t('notAdmin')}</p>{out}</section>
  return <section><div className="bar"><h2>⚙️ {t('aartiAdmin')}</h2>{out}</div><Members/><Schedule/><Announcements/><Gallery/></section>
}
function Login(){
  const {t}=useI18n(),[e,setE]=useState(''),[p,setP]=useState(''),[err,setErr]=useState('')
  const go=async ev=>{ev.preventDefault();const {error}=await supabase.auth.signInWithPassword({email:e,password:p});setErr(error?.message||'')}
  return <section><h2>{t('login')}</h2><form onSubmit={go} className="form">
    <label className="field">{t('email')}<input type="email" required value={e} onChange={x=>setE(x.target.value)} autoComplete="username"/></label>
    <label className="field">{t('password')}<input type="password" required value={p} onChange={x=>setP(x.target.value)} autoComplete="current-password"/></label>
    {err&&<p className="err" role="alert">{err}</p>}<button className="pri">{t('login')}</button></form></section>
}
function Members(){
  const {t}=useI18n(),q=useData(()=>supabase.from('members').select('*').order('full_name'),'members'),[f,setF]=useState({full_name:'',family_name:'',mobile_number:''}),[msg,setMsg]=useState('')
  const add=async ev=>{ev.preventDefault();const {error}=await supabase.from('members').insert(f);setMsg(error?error.message:t('saved'));if(!error){setF({full_name:'',family_name:'',mobile_number:''});q.retry()}}
  const toggle=async m=>{await supabase.from('members').update({active:!m.active}).eq('id',m.id);q.retry()}
  return <div><h3>👥 {t('members')}</h3><form onSubmit={add} className="form row">
    <input required placeholder={t('fullName')} aria-label={t('fullName')} value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})}/>
    <input required placeholder={t('familyName')} aria-label={t('familyName')} value={f.family_name} onChange={e=>setF({...f,family_name:e.target.value})}/>
    <input placeholder={t('mobile')} aria-label={t('mobile')} inputMode="tel" value={f.mobile_number} onChange={e=>setF({...f,mobile_number:e.target.value})}/>
    <button className="pri">{t('add')}</button></form>{msg&&<p role="status">{msg}</p>}
    <Async q={q} empty="—">{d=><ul className="rows">{d.map(m=><li key={m.id}><b>{m.full_name} ({m.family_name})</b><span>{m.mobile_number}</span>
      <button onClick={()=>toggle(m)}>{m.active?t('active'):'✕'}</button></li>)}</ul>}</Async></div>
}
function Schedule(){
  const {t,lang}=useI18n(),mq=useData(()=>supabase.from('members').select('id,full_name,family_name').eq('active',true).order('full_name'),'members')
  const q=useData(()=>supabase.from('aarti_schedule').select('*,members(full_name,family_name)').gte('aarti_date',todayIST(-7)).order('aarti_date'),'aarti_schedule')
  const [f,setF]=useState({member_id:'',aarti_date:todayIST(),aarti_time:'19:00',notes:''}),[msg,setMsg]=useState('')
  const save=async ev=>{ev.preventDefault();const {error}=await supabase.from('aarti_schedule').insert({...f,notes:f.notes||null})
    setMsg(error?(error.code==='23505'?t('dup'):error.message):t('saved'));if(!error)q.retry()}
  const upd=async(id,p)=>{const {error}=await supabase.from('aarti_schedule').update({...p,updated_at:new Date().toISOString()}).eq('id',id);setMsg(error?(error.code==='23505'?t('dup'):error.message):t('saved'));q.retry()}
  const del=async id=>{if(!confirm(t('confirmDel')))return;const {error}=await supabase.from('aarti_schedule').delete().eq('id',id);setMsg(error?error.message:t('saved'));q.retry()}
  return <div><h3>🪔 {t('nav_aarti')}</h3><form onSubmit={save} className="form row">
    <select required aria-label={t('member')} value={f.member_id} onChange={e=>setF({...f,member_id:e.target.value})}><option value="">{t('member')}</option>{mq.data?.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}</select>
    <input type="date" required aria-label={t('date')} value={f.aarti_date} onChange={e=>setF({...f,aarti_date:e.target.value})}/>
    <input type="time" required aria-label={t('time')} value={f.aarti_time} onChange={e=>setF({...f,aarti_time:e.target.value})}/>
    <input placeholder={t('notes')} aria-label={t('notes')} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/>
    <button className="pri">{t('save')}</button></form>{msg&&<p role="status">{msg}</p>}
    <Async q={q} empty="—">{d=><ul className="rows">{d.map(a=><li key={a.id}><b>{a.members?.full_name} · {fmtDate(a.aarti_date,lang)} {fmtTime(a.aarti_time,lang)}</b><span>{a.status}</span>
      <div className="acts"><input type="date" aria-label={t('date')} value={a.aarti_date} onChange={e=>upd(a.id,{aarti_date:e.target.value})}/>
      <button onClick={()=>upd(a.id,{status:'completed'})}>{t('done')}</button><button onClick={()=>upd(a.id,{status:'cancelled'})}>{t('sCancel')}</button><button onClick={()=>del(a.id)}>{t('del')}</button></div></li>)}</ul>}</Async></div>
}
function Announcements(){
  const {t,lang}=useI18n()
  const q=useData(()=>supabase.from('announcements').select('*').order('pinned',{ascending:false}).order('created_at',{ascending:false}),'announcements')
  const blank={title_mr:'',title_en:'',description_mr:'',description_en:'',priority:'normal',pinned:false,published:true}
  const [f,setF]=useState(blank),[editing,setEditing]=useState(null),[msg,setMsg]=useState('')
  const save=async ev=>{ev.preventDefault();const payload={...f,title_en:f.title_en||null,description_mr:f.description_mr||null,description_en:f.description_en||null};const res=editing?await supabase.from('announcements').update(payload).eq('id',editing):await supabase.from('announcements').insert(payload);setMsg(res.error?res.error.message:t('saved'));if(!res.error){setF(blank);setEditing(null);q.retry()}}
  const edit=a=>{setEditing(a.id);setF({title_mr:a.title_mr||'',title_en:a.title_en||'',description_mr:a.description_mr||'',description_en:a.description_en||'',priority:a.priority||'normal',pinned:!!a.pinned,published:!!a.published});window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'})}
  const remove=async id=>{if(!confirm(t('confirmDel')))return;const {error}=await supabase.from('announcements').delete().eq('id',id);setMsg(error?error.message:t('saved'));if(!error)q.retry()}
  const toggle=async a=>{const {error}=await supabase.from('announcements').update({published:!a.published}).eq('id',a.id);setMsg(error?error.message:t('saved'));if(!error)q.retry()}
  return <div><h3>🔔 Announcements</h3><form onSubmit={save} className="form"><input required placeholder="Title (Marathi)" value={f.title_mr} onChange={e=>setF({...f,title_mr:e.target.value})}/><input placeholder="Title (English)" value={f.title_en} onChange={e=>setF({...f,title_en:e.target.value})}/><textarea placeholder="Description (Marathi)" value={f.description_mr} onChange={e=>setF({...f,description_mr:e.target.value})}/><textarea placeholder="Description (English)" value={f.description_en} onChange={e=>setF({...f,description_en:e.target.value})}/><div className="row"><select value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select><label><input type="checkbox" checked={f.pinned} onChange={e=>setF({...f,pinned:e.target.checked})}/> Pin / Important</label><label><input type="checkbox" checked={f.published} onChange={e=>setF({...f,published:e.target.checked})}/> Published</label></div><div className="row"><button className="pri">{editing?'Update Announcement':'Add Announcement'}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setF(blank)}}>Cancel</button>}</div></form>{msg&&<p role="status">{msg}</p>}<Async q={q} empty="No announcements yet.">{d=><ul className="rows">{d.map(a=><li key={a.id}><b>{a.pinned&&'📌 '}{a.title_mr}</b><span>{a.priority} · {a.published?'Published':'Hidden'} · {fmtDate(a.created_at.slice(0,10),lang)}</span><p>{a.description_mr||a.description_en||''}</p><div className="acts"><button onClick={()=>edit(a)}>Edit</button><button onClick={()=>toggle(a)}>{a.published?'Hide':'Publish'}</button><button onClick={()=>remove(a.id)}>{t('del')}</button></div></li>)}</ul>}</Async></div>
}
function Gallery(){
  const {t}=useI18n(),q=useData(()=>supabase.from('gallery').select('*').order('created_at',{ascending:false}),'gallery')
  const blank={title:'',caption:'',category:'General',published:true},[f,setF]=useState(blank),[file,setFile]=useState(null),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false)
  const save=async ev=>{ev.preventDefault();if(!file){setMsg('Please select a photo.');return}setBusy(true);setMsg('Uploading...')
    const ext=file.name.split('.').pop().toLowerCase(),safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-'),path=`${Date.now()}-${crypto.randomUUID()}.${ext}`
    const up=await supabase.storage.from('gallery').upload(path,file,{contentType:file.type,upsert:false})
    if(up.error){setMsg(up.error.message);setBusy(false);return}
    const {data:url}=supabase.storage.from('gallery').getPublicUrl(path)
    const ins=await supabase.from('gallery').insert({...f,image_path:path,image_url:url.publicUrl})
    if(ins.error){await supabase.storage.from('gallery').remove([path]);setMsg(ins.error.message)}else{setMsg('Photo uploaded successfully.');setF(blank);setFile(null);ev.target.reset();q.retry()}setBusy(false)
  }
  const remove=async g=>{if(!confirm('Delete this photo?'))return;setMsg('Deleting...');const a=await supabase.storage.from('gallery').remove([g.image_path]);if(a.error){setMsg(a.error.message);return}const {error}=await supabase.from('gallery').delete().eq('id',g.id);setMsg(error?error.message:'Photo deleted.');if(!error)q.retry()}
  return <div><h3>🖼️ Photo Gallery</h3><form onSubmit={save} className="form"><input required placeholder="Photo title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/><textarea placeholder="Caption" value={f.caption} onChange={e=>setF({...f,caption:e.target.value})}/><input placeholder="Category (e.g. Ganesh Utsav, Aarti, Temple)" value={f.category} onChange={e=>setF({...f,category:e.target.value})}/><input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setFile(e.target.files?.[0]||null)}/><label><input type="checkbox" checked={f.published} onChange={e=>setF({...f,published:e.target.checked})}/> Published</label><button className="pri" disabled={busy}>{busy?'Uploading...':'Upload Photo'}</button></form>{msg&&<p role="status">{msg}</p>}<Async q={q} empty="No photos yet.">{d=><ul className="rows">{d.map(g=><li key={g.id}><img src={g.image_url} alt={g.title} style={{width:100,height:70,objectFit:'cover',borderRadius:8}}/><b>{g.title}</b><span>{g.category} · {g.published?'Published':'Hidden'}</span>{g.caption&&<p>{g.caption}</p>}<div className="acts"><button onClick={()=>remove(g)}>Delete</button></div></li>)}</ul>}</Async></div>
}
