import {StrictMode,lazy,Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter,Routes,Route,NavLink} from 'react-router-dom'
import {I18n,useI18n} from './i18n'
import Home from './pages/Home'
import Aarti from './pages/Aarti'
import Feed from './pages/Feed'
import './index.css'
const Admin=lazy(()=>import('./pages/Admin'))
function Shell(){
  const {t,lang,setLang}=useI18n()
  const nav=[['/','nav_home','🏠'],['/aarti','nav_aarti','🪔'],['/events','nav_events','📅'],['/announcements','nav_news','🔔'],['/admin','nav_admin','⚙️']]
  return <>
    <header className="top"><NavLink to="/" className="brand">🛕 <span>{t('temple')}</span></NavLink>
      <nav className="links" aria-label="Main">{nav.map(([p,k])=><NavLink key={p} to={p} end={p==='/'}>{t(k)}</NavLink>)}</nav>
      <div className="lang" role="group" aria-label="Language">{['mr','en'].map(l=><button key={l} aria-pressed={lang===l} onClick={()=>setLang(l)}>{l==='mr'?'मराठी':'English'}</button>)}</div></header>
    <main><Suspense fallback={<p className="skel">{t('loading')}</p>}><Routes>
      <Route path="/" element={<Home/>}/><Route path="/aarti" element={<Aarti/>}/>
      <Route path="/events" element={<Feed kind="events"/>}/><Route path="/announcements" element={<Feed kind="announcements"/>}/>
      <Route path="/admin" element={<Admin/>}/><Route path="*" element={<Home/>}/></Routes></Suspense></main>
    <nav className="tabbar" aria-label="Main">{nav.map(([p,k,i])=><NavLink key={p} to={p} end={p==='/'}><span aria-hidden>{i}</span>{t(k)}</NavLink>)}</nav>
  </>
}
createRoot(document.getElementById('root')).render(<StrictMode><I18n><BrowserRouter><Shell/></BrowserRouter></I18n></StrictMode>)
