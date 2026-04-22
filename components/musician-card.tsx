import Link from 'next/link'
import { MapPin, Star, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface MusicianListing {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  genres: string[]
  city: string | null
  state: string | null
  rate_per_hour: number | null
  rate_per_event: number | null
  avg_rating: number
  review_count: number
  is_available: boolean
  instruments: string[]
}

export function MusicianCard({ musician }: { musician: MusicianListing }) {
  const location = [musician.city, musician.state].filter(Boolean).join(', ')
  const initials = musician.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() ?? '?'

  return (
    <Link href={`/musicians/${musician.id}`}>
      <Card className="group h-full transition-colors hover:bg-card/80 hover:border-primary/40">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarImage src={musician.avatar_url ?? undefined} alt={musician.full_name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate font-semibold leading-tight">{musician.full_name}</h3>
                {musician.is_available ? (
                  <Badge variant="secondary" className="shrink-0 text-xs text-green-400 border-green-400/30 bg-green-400/10">
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0 text-xs text-muted-foreground">
                    Busy
                  </Badge>
                )}
              </div>

              {location && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {location}
                </p>
              )}

              {musician.avg_rating > 0 && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {Number(musician.avg_rating).toFixed(1)}
                  <span>({musician.review_count})</span>
                </p>
              )}
            </div>
          </div>

          {musician.bio && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{musician.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {musician.genres.slice(0, 3).map((g) => (
              <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
            ))}
            {musician.genres.length > 3 && (
              <Badge variant="outline" className="text-xs">+{musician.genres.length - 3}</Badge>
            )}
          </div>

          {(musician.rate_per_hour || musician.rate_per_event) && (
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {musician.rate_per_hour && <span>${musician.rate_per_hour}/hr</span>}
              {musician.rate_per_hour && musician.rate_per_event && <span>·</span>}
              {musician.rate_per_event && <span>${musician.rate_per_event}/event</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
