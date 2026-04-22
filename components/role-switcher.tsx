'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Briefcase, Music2 } from 'lucide-react'

export function RoleSwitcher({ userId }: { userId: string }) {
  const router = useRouter()
  const [role, setRole] = useState<'organizer' | 'musician' | null>(null)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      const metaRole = data.session?.user.user_metadata?.role as 'musician' | 'organizer' | undefined
      if (metaRole) { setRole(metaRole); return }
      supabase.from('profiles').select('role').eq('id', userId).single()
        .then(({ data }) => setRole((data?.role as 'musician' | 'organizer') ?? 'organizer'))
    })
  }, [userId])

  const toggle = async () => {
    if (!role) return
    const next = role === 'musician' ? 'organizer' : 'musician'
    setSwitching(true)
    const supabase = createClient()

    const [profileRes] = await Promise.all([
      supabase.from('profiles').update({ role: next }).eq('id', userId),
      supabase.auth.updateUser({ data: { role: next } }),
    ])
    if (profileRes.error) {
      toast.error('Failed to switch role')
      setSwitching(false)
      return
    }

    if (next === 'musician') {
      const { data: existing } = await supabase.from('musicians').select('id').eq('id', userId).maybeSingle()
      if (!existing) {
        await supabase.from('musicians').insert({ id: userId })
      }
    }

    setRole(next)
    toast.success(next === 'musician' ? 'Switched to musician mode' : 'Switched to organizer mode')
    router.push(next === 'musician' ? '/dashboard' : '/')
    router.refresh()
    setSwitching(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={switching || !role}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
      title="Click to switch between Organizer and Musician"
    >
      {role === 'musician' ? (
        <>
          <Music2 className="h-3.5 w-3.5 text-primary" />
          <span>Musician</span>
        </>
      ) : (
        <>
          <Briefcase className="h-3.5 w-3.5 text-primary" />
          <span>{role === 'organizer' ? 'Organizer' : 'Loading…'}</span>
        </>
      )}
    </button>
  )
}
