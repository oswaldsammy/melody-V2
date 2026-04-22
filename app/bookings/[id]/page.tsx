import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageThread } from '@/components/message-thread'
import { STATUS_STYLES, type BookingStatus } from '@/lib/constants'
import { CalendarDays, MapPin, Clock } from 'lucide-react'

interface PageProps { params: Promise<{ id: string }> }

export default async function BookingThreadPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, organizer:profiles!bookings_organizer_id_fkey(id, full_name), musician:musicians!bookings_musician_id_fkey(id, profiles(full_name))')
    .eq('id', id)
    .single()

  if (!booking) notFound()
  if (booking.musician_id !== user.id && booking.organizer_id !== user.id) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles(full_name, avatar_url)')
    .eq('booking_id', id)
    .order('created_at', { ascending: true })

  const status = booking.status as BookingStatus
  const otherName =
    booking.musician_id === user.id
      ? booking.organizer?.full_name
      : booking.musician?.profiles?.full_name

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{booking.event_name}</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">With {otherName ?? '—'}</p>
            </div>
            <Badge className={STATUS_STYLES[status] ?? ''} variant="outline">
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      <MessageThread
        bookingId={id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  )
}
