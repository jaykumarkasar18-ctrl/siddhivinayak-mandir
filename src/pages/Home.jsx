import {Link} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {useData,Async} from '../lib/hooks'
import {todayIST,fmtDate,fmtTime} from '../lib/ist'
import {useI18n,pick} from '../i18n'
import {useState} from 'react'

export default function Home(){
  const {t,lang}=useI18n(),today=todayIST()
  const [photo,setPhoto]=useState(null)
  const aq=useData(()=>supabase.from('public_aarti').select('*').gte('aarti_date',today).neq('status','cancelled').order('aarti_date').limit(6),'aarti_schedule')
  const nq=useData(()=>supabase.from('announcements').select('*').eq('published',true).order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(3),'announcements')
  const eq=useData(()=>supabase.from('events').select('*').eq('published',true).gte('event_date',today).order('event_date').limit(3),'events')
  const gq=useData(()=>supabase.from('gallery').select('*').eq('published',true).order('created_at',{ascending:false}).limit(6),'home-gallery')
  const todays=aq.data?.find(a=>a.aarti_date===today),next=aq.data?.filter(a=>a.aarti_date>today).slice(0,4)
  return <>
    <section className="hero"><p className="om">॥ श्री गणेशाय नमः ॥</p><h1>{t('temple')}</h1><p>{t('place')}</p><div className="cta"><Link to="/aarti">🙏 {t('today')}</Link><Link to="/events">📅 {t('events')}</Link></div></section>
    <section aria-labelledby="h-today" className="today"><h2 id="h-today">🪔 {t('today')}</h2><Async q={{...aq,data:aq.data&&(todays?[todays]:[])}} empty={t('noToday')}>{([a])=><div><p className="big">{a.full_name} {t('family')}</p><p>{fmtDate(a.aarti_date,lang)} · {fmtTime(a.aarti_time,lang)}</p><p className="remind">{t('remind')}</p></div>}</Async></section>
    <section><h2>📅 {t('next')}</h2><Async q={{...aq,data:aq.data&&next}} empty={t('noToday')}>{d=><ul className="rows">{d.map(a=><li key={a.id}><b>{a.full_name} {t('family')}</b><span>{fmtDate(a.aarti_date,lang)} · {fmtTime(a.aarti_time,lang)}</span></li>)}</ul>}</Async></section>
    <section><h2>🔔 {t('news')}</h2><Async q={nq} empty={t('noNews')}>{d=><ul className="rows">{d.map(n=><li key={n.id}><b>{n.pinned&&'📌 '}{pick(n,'title',lang)}</b><span>{pick(n,'description',lang)}</span></li>)}</ul>}</Async></section>
    <section><h2>🎉 {t('events')}</h2><Async q={eq} empty={t('noEvents')}>{d=><ul className="rows">{d.map(e=><li key={e.id}><b>{pick(e,'title',lang)}</b><span>{fmtDate(e.event_date,lang)} {fmtTime(e.start_time,lang)}</span></li>)}</ul>}</Async></section>
    <section><div className="bar"><h2>🖼️ Latest Photos</h2><Link to="/gallery">View all →</Link></div><Async q={gq} empty="No photos available yet.">{d=><div className="home-gallery">{d.map(g=><button className="home-photo" key={g.id} onClick={()=>setPhoto(g)} aria-label={`Open ${g.title}`}><img src={g.image_url} alt={g.title} loading="lazy"/></button>)}</div>}</Async></section>
    {photo&&<div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.title} onClick={()=>setPhoto(null)}><button className="lightbox-close" onClick={()=>setPhoto(null)} aria-label="Close">×</button><img src={photo.image_url} alt={photo.title} onClick={e=>e.stopPropagation()}/><div className="lightbox-caption" onClick={e=>e.stopPropagation()}><b>{photo.title}</b>{photo.caption&&<span>{photo.caption}</span>}</div></div>}
  </>
}
