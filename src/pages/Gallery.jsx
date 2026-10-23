import {supabase} from '../lib/supabase'
import {useData,Async} from '../lib/hooks'

export default function Gallery(){
  const q=useData(()=>supabase.from('gallery').select('*').eq('published',true).order('created_at',{ascending:false}),'gallery-public')
  return <section><h2>🖼️ Photo Gallery</h2><Async q={q} empty="No photos available yet.">{data=><div className="gallery-grid">{data.map(g=><article className="gallery-card" key={g.id}><img src={g.image_url} alt={g.title} loading="lazy"/><div><h3>{g.title}</h3>{g.caption&&<p>{g.caption}</p>}<small>{g.category}</small></div></article>)}</div>}</Async></section>
}
