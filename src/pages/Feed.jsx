import {supabase} from '../lib/supabase'
import {useData,Async} from '../lib/hooks'
import {todayIST,fmtDate,fmtTime} from '../lib/ist'
import {useI18n,pick} from '../i18n'
// One page for both /events and /announcements.
export default function Feed({kind}){
  const {t,lang}=useI18n(),ev=kind==='events',today=todayIST()
  const q=useData(()=>{let r=supabase.from(kind).select('*').eq('published',true)
    return ev?r.gte('event_date',today).order('event_date'):r.order('pinned',{ascending:false}).order('created_at',{ascending:false})},kind)
  return <section><h2>{ev?'🎉 '+t('events'):'🔔 '+t('news')}</h2>
    <Async q={q} empty={ev?t('noEvents'):t('noNews')}>{d=><ul className="rows">{d.map(r=><li key={r.id}>
      <b>{r.pinned&&'📌 '}{pick(r,'title',lang)}</b>
      <span>{ev?`${fmtDate(r.event_date,lang)} ${fmtTime(r.start_time,lang)} ${r.location||''}`:fmtDate(r.created_at.slice(0,10),lang)}</span>
      <p>{pick(r,'description',lang)}</p></li>)}</ul>}</Async></section>
}
