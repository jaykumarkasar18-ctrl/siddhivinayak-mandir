import {useEffect,useRef,useState} from 'react'
import {supabase} from './supabase'
import {useI18n} from '../i18n'
// Loads data, re-loads on realtime changes to `table`, exposes loading/error/retry.
export function useData(fn,table){
  const [s,set]=useState({data:null,error:null,loading:true}),[n,setN]=useState(0),id=useRef(Math.random())
  useEffect(()=>{
    if(!supabase){set({data:null,error:'config',loading:false});return}
    let off=false
    fn().then(({data,error})=>!off&&set({data,error:error?.message||null,loading:false}))
    const ch=table&&supabase.channel(`rt-${table}-${id.current}`).on('postgres_changes',{event:'*',schema:'public',table},()=>setN(v=>v+1)).subscribe()
    return()=>{off=true;ch&&supabase.removeChannel(ch)}
  },[n])
  return {...s,retry:()=>setN(v=>v+1)}
}
export function Async({q,empty,children}){
  const {t}=useI18n()
  if(q.loading)return <div className="skel" aria-busy="true">{t('loading')}</div>
  if(q.error)return <div className="err" role="alert">{q.error==='config'?t('noConfig'):t('error')}<button onClick={q.retry}>{t('retry')}</button></div>
  if(!q.data?.length)return <p className="empty">{empty}</p>
  return children(q.data)
}
