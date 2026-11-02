import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map(char => char.charCodeAt(0)))
}

export async function enableNotifications(memberId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('हा browser web notifications support करत नाही.')
  }
  if (!supabase) throw new Error('Supabase configuration उपलब्ध नाही.')
  if (!VAPID_PUBLIC_KEY) throw new Error('VAPID public key उपलब्ध नाही.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Notifications साठी browser permission आवश्यक आहे.')

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })
  }

  const json = subscription.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert({
    member_id: memberId,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    updated_at: new Date().toISOString()
  }, { onConflict: 'endpoint' })

  if (error) throw error
  return true
}
