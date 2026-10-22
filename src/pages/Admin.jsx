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
  return <section><div className="bar"><h2>⚙️ {t('aartiAdmin')}</h2>{out}</div><Members/><Schedule/></section>
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
