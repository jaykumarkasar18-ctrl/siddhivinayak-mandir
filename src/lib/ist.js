// Temple schedule always follows India time, never the visitor's device clock.
const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'})
export const todayIST=(plus=0)=>{const d=new Date(f.format(new Date())+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+plus);return d.toISOString().slice(0,10)}
export const fmtDate=(s,lang)=>new Date(s+'T00:00:00Z').toLocaleDateString(lang==='mr'?'mr-IN':'en-IN',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'})
export const fmtTime=(t,lang)=>{if(!t)return'';const[h,m]=t.split(':');const d=new Date(Date.UTC(2000,0,1,+h,+m));return d.toLocaleTimeString(lang==='mr'?'mr-IN':'en-IN',{timeZone:'UTC',hour:'numeric',minute:'2-digit'})}
