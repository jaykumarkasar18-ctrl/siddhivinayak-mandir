import {Link} from 'react-router-dom'
import {supabase} from '../lib/supabase'
import {useData,Async} from '../lib/hooks'
import {todayIST,fmtDate,fmtTime} from '../lib/ist'
import {useI18n,pick} from '../i18n'
export default function Home(){
  const {t,lang}=useI18n(),today=todayIST()
  const aq=useData(()=>supabase.from('public_aarti').select('*').gte('aarti_date',today).neq('status','cancelled').order('aarti_date').limit(6),'aarti_schedule')
  const nq=useData(()=>supabase.from('announcements').select('*').eq('published',true).order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(3),'announcements')
  const eq=useData(()=>supabase.from('events').select('*').eq('published',true).gte('event_date',today).order('event_date').limit(3),'events')
  const todays=aq.data?.find(a=>a.aarti_date===today),next=aq.data?.filter(a=>a.aarti_date>today).slice(0,4)
  return <>
    <section className="hero"><p className="om">॥ श्री गणेशाय नमः ॥</p><h1>{t('temple')}</h1><p>{t('place')}</p>
      <div className="cta"><Link to="/aarti">🙏 {t('today')}</Link><Link to="/events">📅 {t('events')}</Link></div></section>
    <section aria-labelledby="h-today" className="today"><h2 id="h-today">🪔 {t('today')}</h2>
      <Async q={{...aq,data:aq.data&&(todays?[todays]:[])}} empty={t('noToday')}>{([a])=><div>
        <p className="big">{a.full_name} {t('family')}</p><p>{fmtDate(a.aarti_date,lang)} · {fmtTime(a.aarti_time,lang)}</p>
        <p className="remind">{t('remind')}</p></div>}</Async></section>
    <section><h2>📅 {t('next')}</h2><Async q={{...aq,data:aq.data&&next}} empty={t('noToday')}>{d=><ul className="rows">{d.map(a=><li key={a.id}><b>{a.full_name} {t('family')}</b><span>{fmtDate(a.aarti_date,lang)} · {fmtTime(a.aarti_time,lang)}</span></li>)}</ul>}</Async></section>
    <section><h2>🔔 {t('news')}</h2><Async q={nq} empty={t('noNews')}>{d=><ul className="rows">{d.map(n=><li key={n.id}><b>{n.pinned&&'📌 '}{pick(n,'title',lang)}</b><span>{pick(n,'description',lang)}</span></li>)}</ul>}</Async></section>
    <section><h2>🎉 {t('events')}</h2><Async q={eq} empty={t('noEvents')}>{d=><ul className="rows">{d.map(e=><li key={e.id}><b>{pick(e,'title',lang)}</b><span>{fmtDate(e.event_date,lang)} {fmtTime(e.start_time,lang)}</span></li>)}</ul>}</Async></section>
  </>
}
