import Link from 'next/link'
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Gig {
  id: string
  event_name: string
  event_date: string
  event_time: string | null
  location: string | null
  duration_hours: number | null
  budget: number | null
  organizer?: { full_name: string } | null
}

export function UpcomingGigs({ gigs }: { gigs: Gig[] }) {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = gigs.filter(g => g.event_date >= today).slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Upcoming gigs</CardTitle>
        <Link href="/bookings" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No upcoming gigs. Confirmed bookings will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((gig) => {
              const date = new Date(gig.event_date)
              const daysUntil = Math.ceil((date.getTime() - Date.now()) / 86400000)
              return (
                <li key={gig.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-[10px] uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{gig.event_name}</p>
                      {daysUntil >= 0 && daysUntil <= 7 && (
                        <Badge variant="secondary" className="text-xs">
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`}
                        </Badge>
                      )}
                    </div>
                    {gig.organizer?.full_name && (
                      <p className="text-xs text-muted-foreground">for {gig.organizer.full_name}</p>
                    )}
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {gig.event_time && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{gig.event_time}</span>
                      )}
                      {gig.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{gig.location}</span>
                      )}
                      {gig.budget && <span className="font-medium text-foreground">${gig.budget}</span>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
