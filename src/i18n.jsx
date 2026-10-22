import {createContext,useContext,useState} from 'react'
const D={
mr:{temple:'श्री सिद्धिविनायक गणेश मंदिर',place:'चिमठाणे, ता. शिंदखेडा, जि. धुळे',nav_home:'मुख्य',nav_aarti:'आरती',nav_events:'कार्यक्रम',nav_news:'सूचना',nav_admin:'प्रशासक',
today:'आजची आरती',next:'पुढील आरती',news:'मंदिरातील सूचना',events:'आगामी कार्यक्रम',family:'परिवार',remind:'🔔 आज तुमच्या कुटुंबाची आरती आहे.',
noToday:'आजची आरती अद्याप निश्चित केलेली नाही.',noEvents:'सध्या कोणतेही आगामी कार्यक्रम नाहीत.',noNews:'सध्या कोणतीही नवीन सूचना नाही.',noAarti:'या महिन्यात आरती निश्चित नाही.',
loading:'लोड होत आहे…',error:'माहिती मिळाली नाही. कृपया पुन्हा प्रयत्न करा.',retry:'पुन्हा प्रयत्न करा',noConfig:'Supabase अजून जोडलेले नाही (README पहा).',
sToday:'आज',sUp:'आगामी',sDone:'पूर्ण',sCancel:'रद्द',date:'तारीख',time:'वेळ',month:'महिना',pinned:'महत्त्वाचे',
login:'प्रवेश करा',logout:'बाहेर पडा',email:'ईमेल',password:'पासवर्ड',notAdmin:'या खात्याला प्रशासक परवानगी नाही.',
aartiAdmin:'आरती व्यवस्थापन',members:'सदस्य',member:'सदस्य निवडा',notes:'टीप',save:'जतन करा',del:'हटवा',done:'पूर्ण केली',confirmDel:'खरोखर हटवायचे का?',saved:'जतन झाले.',dup:'या तारखेला आधीच आरती निश्चित आहे.',
fullName:'पूर्ण नाव',familyName:'आडनाव/परिवार',mobile:'मोबाईल (खाजगी)',add:'जोडा',active:'सक्रिय'},
en:{temple:'Shree Siddhivinayak Ganesh Mandir',place:'Chimthane, Tal. Shindkheda, Dist. Dhule',nav_home:'Home',nav_aarti:'Aarti',nav_events:'Events',nav_news:'Notices',nav_admin:'Admin',
today:"Today's Aarti",next:'Upcoming Aarti',news:'Temple Notices',events:'Upcoming Events',family:'Family',remind:'🔔 Today is your family’s Aarti.',
noToday:"Today's Aarti has not been assigned yet.",noEvents:'There are no upcoming events right now.',noNews:'There are no new notices right now.',noAarti:'No Aarti scheduled this month.',
loading:'Loading…',error:'Could not load data. Please try again.',retry:'Retry',noConfig:'Supabase is not connected yet (see README).',
sToday:'Today',sUp:'Upcoming',sDone:'Completed',sCancel:'Cancelled',date:'Date',time:'Time',month:'Month',pinned:'Important',
login:'Sign in',logout:'Sign out',email:'Email',password:'Password',notAdmin:'This account does not have admin access.',
aartiAdmin:'Aarti management',members:'Members',member:'Select member',notes:'Notes',save:'Save',del:'Delete',done:'Mark completed',confirmDel:'Delete this permanently?',saved:'Saved.',dup:'An Aarti is already assigned for this date.',
fullName:'Full name',familyName:'Family name',mobile:'Mobile (private)',add:'Add',active:'Active'}}
const C=createContext()
export const I18n=({children})=>{const [lang,s]=useState(localStorage.getItem('lang')||'mr')
  const setLang=l=>{localStorage.setItem('lang',l);document.documentElement.lang=l;s(l)}
  return <C.Provider value={{lang,setLang,t:k=>D[lang][k]||k}}>{children}</C.Provider>}
export const useI18n=()=>useContext(C)
// Picks title_mr / title_en etc., falling back to Marathi.
export const pick=(row,f,lang)=>row[`${f}_${lang}`]||row[`${f}_mr`]||''
