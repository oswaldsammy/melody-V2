import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingActions } from '@/components/booking-actions'
import { ReviewDialog } from '@/components/review-dialog'
import { CalendarDays, MapPin, Clock, MessageSquare } from 'lucide-react'
import { STATUS_STYLES, type BookingStatus } from '@/lib/constants'

type BookingRow = {
  id: string
  event_name: string
  event_date: string
  event_time: string | null
  duration_hours: number | null
  location: string | null
  message: string | null
  status: BookingStatus
  budget: number | null
  musician_id: string
  organizer_id: string
  organizer?: { full_name: string | null } | null
  musician?: { id: string; profiles: { full_name: string | null } | null } | null
  review?: { id: string } | null
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
  const role: 'musician' | 'organizer' = isMusician ? 'musician' : 'organizer'

  const { data: rawBookings } = isMusician
    ? await supabase
        .from('bookings')
        .select('*, organizer:profiles!bookings_organizer_id_fkey(full_name, email)')
        .eq('musician_id', user.id)
        .order('event_date', { ascending: true })
    : await supabase
        .from('bookings')
        .select('*, musician:musicians!bookings_musician_id_fkey(id, profiles(full_name)), review:reviews(id)')
        .eq('organizer_id', user.id)
        .order('event_date', { ascending: true })

  const bookings = (rawBookings ?? []) as BookingRow[]
  const today = new Date().toISOString().split('T')[0]

  const pending = bookings.filter(b => b.status === 'pending')
  const active = bookings.filter(b => b.status === 'accepted')
  const past = bookings.filter(b =>
    b.status === 'completed' || b.status === 'declined' || b.status === 'cancelled'
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        {isMusician ? 'Booking Requests' : 'My Bookings'}
      </h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending {pending.length > 0 && `(${pending.length})`}</TabsTrigger>
          <TabsTrigger value="active">Confirmed {active.length > 0 && `(${active.length})`}</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        {(['pending', 'active', 'past'] as const).map((tab) => {
          const list = tab === 'pending' ? pending : tab === 'active' ? active : past
          return (
            <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
              {list.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  {tab === 'pending' && 'No pending requests.'}
                  {tab === 'active' && 'No confirmed bookings yet.'}
                  {tab === 'past' && 'No past bookings.'}
                </p>
              ) : list.map((booking) => {
                const otherName = isMusician
                  ? booking.organizer?.full_name
                  : booking.musician?.profiles?.full_name
                const isPast = booking.event_date < today
                const canReview = !isMusician && booking.status === 'completed' && !booking.review

                return (
                  <Card key={booking.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{booking.event_name}</CardTitle>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {isMusician ? 'From' : 'Musician'}: {otherName ?? '—'}
                          </p>
                        </div>
                        <Badge className={STATUS_STYLES[booking.status] ?? ''} variant="outline">
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

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <BookingActions
                          bookingId={booking.id}
                          role={role}
                          status={booking.status}
                          isPast={isPast}
                        />
                        {(booking.status === 'accepted' || booking.status === 'completed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            nativeButton={false}
                            render={<Link href={`/bookings/${booking.id}`} />}
                          >
                            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                            Message
                          </Button>
                        )}
                        {canReview && (
                          <ReviewDialog
                            bookingId={booking.id}
                            musicianId={booking.musician?.id ?? ''}
                            musicianName={otherName ?? 'musician'}
                          />
                        )}
                      </div>
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
