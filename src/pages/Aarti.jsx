import {useState} from 'react'
import {supabase} from '../lib/supabase'
import {useData,Async} from '../lib/hooks'
import {todayIST,fmtDate,fmtTime} from '../lib/ist'
import {useI18n} from '../i18n'
export default function Aarti(){
  const {t,lang}=useI18n(),today=todayIST(),[month,setMonth]=useState(today.slice(0,7))
  const [y,m]=month.split('-').map(Number),end=new Date(Date.UTC(y,m,0)).getUTCDate()
  const q=useData(()=>supabase.from('public_aarti').select('*').gte('aarti_date',`${month}-01`).lte('aarti_date',`${month}-${end}`).order('aarti_date'),'aarti_schedule')
  const st=a=>a.status==='cancelled'?['x',t('sCancel')]:a.status==='completed'||a.aarti_date<today?['done','⚪ '+t('sDone')]:a.aarti_date===today?['now','🟢 '+t('sToday')]:['up','🔵 '+t('sUp')]
  return <section><h2>🪔 {t('nav_aarti')}</h2>
    <label className="field">{t('month')}<input type="month" value={month} onChange={e=>e.target.value&&setMonth(e.target.value)}/></label>
    <Async q={q} empty={t('noAarti')}>{d=><table><thead><tr><th>{t('date')}</th><th>{t('family')}</th><th>{t('time')}</th><th></th></tr></thead>
      <tbody>{d.map(a=>{const[c,l]=st(a);return <tr key={a.id} className={c}><td>{fmtDate(a.aarti_date,lang)}</td><td>{a.full_name} {t('family')}{a.notes&&<small><br/>{a.notes}</small>}</td><td>{fmtTime(a.aarti_time,lang)}</td><td>{l}</td></tr>})}</tbody></table>}</Async></section>
}
