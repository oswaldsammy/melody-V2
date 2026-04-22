import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingActions } from '@/components/booking-actions'
import { CalendarDays, MapPin, Clock } from 'lucide-react'

const statusColor: Record<string, string> = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  accepted: 'text-green-400 border-green-400/30 bg-green-400/10',
  declined: 'text-red-400 border-red-400/30 bg-red-400/10',
  cancelled: 'text-muted-foreground border-border bg-muted',
}

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isMusician = profile?.role === 'musician'

  const { data: bookings } = isMusician
    ? await supabase
        .from('bookings')
        .select('*, organizer:profiles!bookings_organizer_id_fkey(full_name, email)')
        .eq('musician_id', user.id)
        .order('event_date', { ascending: true })
    : await supabase
        .from('bookings')
        .select('*, musician:musicians!bookings_musician_id_fkey(id, profiles(full_name))')
        .eq('organizer_id', user.id)
        .order('event_date', { ascending: true })

  const pending = bookings?.filter(b => b.status === 'pending') ?? []
  const active = bookings?.filter(b => b.status === 'accepted') ?? []
  const past = bookings?.filter(b => ['declined', 'cancelled'].includes(b.status)) ?? []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My Bookings</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending {pending.length > 0 && `(${pending.length})`}</TabsTrigger>
          <TabsTrigger value="active">Confirmed {active.length > 0 && `(${active.length})`}</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {['pending', 'active', 'past'].map((tab) => {
          const list = tab === 'pending' ? pending : tab === 'active' ? active : past
          return (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
              {list.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">No bookings here yet.</p>
              ) : list.map((booking: any) => {
                const otherName = isMusician
                  ? booking.organizer?.full_name
                  : booking.musician?.profiles?.full_name

                return (
                  <Card key={booking.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{booking.event_name}</CardTitle>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {isMusician ? 'From' : 'Musician'}: {otherName}
                          </p>
                        </div>
                        <Badge className={statusColor[booking.status] ?? ''} variant="outline">
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        {booking.event_time && ` at ${booking.event_time}`}
                      </p>
                      {booking.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />{booking.location}
                        </p>
                      )}
                      {booking.duration_hours && (
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />{booking.duration_hours} hours
                        </p>
                      )}
                      {booking.budget && (
                        <p className="font-medium text-foreground">Budget: ${booking.budget}</p>
                      )}
                      {booking.message && (
                        <p className="mt-2 border-l-2 border-border pl-3 italic">{booking.message}</p>
                      )}
                      {isMusician && booking.status === 'pending' && (
                        <BookingActions bookingId={booking.id} />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
