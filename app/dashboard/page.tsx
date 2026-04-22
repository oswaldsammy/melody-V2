import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MusicianProfileForm } from '@/components/musician-profile-form'
import { OrganizerDashboard } from '@/components/organizer-dashboard'
import { MusicianStats } from '@/components/musician-stats'
import { UpcomingGigs } from '@/components/upcoming-gigs'

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
    const [musicianRes, bookingsRes] = await Promise.all([
      supabase.from('musicians').select('*').eq('id', user.id).single(),
      supabase
        .from('bookings')
        .select('*, organizer:profiles!bookings_organizer_id_fkey(full_name)')
        .eq('musician_id', user.id)
        .order('event_date', { ascending: true }),
    ])

    const bookings = bookingsRes.data ?? []
    const today = new Date().toISOString().split('T')[0]

    const stats = {
      upcoming: bookings.filter(b => b.status === 'accepted' && b.event_date >= today).length,
      pending: bookings.filter(b => b.status === 'pending').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      totalEarnings: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.budget ?? 0), 0),
    }

    const upcomingAccepted = bookings.filter(b => b.status === 'accepted')

    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {profile?.full_name ?? 'musician'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your gigs and keep your profile up to date
          </p>
        </div>

        <MusicianStats stats={stats} />
        <UpcomingGigs gigs={upcomingAccepted} />

        <div>
          <h2 className="mb-4 text-lg font-semibold">My Profile</h2>
          <MusicianProfileForm profile={profile} musician={musicianRes.data} />
        </div>
      </div>
    )
  }

  return <OrganizerDashboard profile={profile} />
}
