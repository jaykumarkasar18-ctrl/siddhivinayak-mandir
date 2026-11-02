import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { enableNotifications } from '../lib/pushNotifications'

export default function Notifications() {
  const [members, setMembers] = useState([])
  const [memberId, setMemberId] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('members').select('id,full_name,family_name').eq('active', true).order('full_name')
      .then(({ data, error }) => {
        if (error) setStatus(error.message)
        else setMembers(data || [])
      })
  }, [])

  async function handleEnable() {
    if (!memberId) {
      setStatus('कृपया तुमचे नाव निवडा.')
      return
    }
    try {
      setLoading(true)
      setStatus('')
      await enableNotifications(memberId)
      setStatus('✅ Notifications successfully enabled!')
    } catch (error) {
      setStatus(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="today">
      <h1>🔔 आरती Notifications</h1>
      <p>तुमच्या आरतीच्या दिवशी reminder मिळवण्यासाठी तुमचे नाव select करा.</p>
      <label htmlFor="member">तुमचे नाव</label>
      <select id="member" value={memberId} onChange={e => setMemberId(e.target.value)}>
        <option value="">-- नाव निवडा --</option>
        {members.map(member => <option key={member.id} value={member.id}>{member.full_name}</option>)}
      </select>
      <button className="cta-button" onClick={handleEnable} disabled={loading}>
        {loading ? 'Enabling...' : '🔔 Enable Notifications'}
      </button>
      {status && <p className="remind">{status}</p>}
    </section>
  )
}
