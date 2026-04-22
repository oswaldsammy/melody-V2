import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MusicianProfileForm } from '@/components/musician-profile-form'
import { OrganizerDashboard } from '@/components/organizer-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'musician') {
    const { data: musician } = await supabase
      .from('musicians')
      .select('*')
      .eq('id', user.id)
      .single()

    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">My Musician Profile</h1>
        <MusicianProfileForm profile={profile} musician={musician} />
      </div>
    )
  }

  return <OrganizerDashboard profile={profile} />
}
