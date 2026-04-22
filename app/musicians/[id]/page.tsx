import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MapPin, Star, Clock, Music, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookingDialog } from '@/components/booking-dialog'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MusicianProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: musician } = await supabase
    .from('musician_listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!musician) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('musician_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const location = [musician.city, musician.state].filter(Boolean).join(', ')
  const initials = musician.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ?? '?'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar className="h-24 w-24 shrink-0">
          <AvatarImage src={musician.avatar_url ?? undefined} alt={musician.full_name} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{musician.full_name}</h1>
            {musician.is_available ? (
              <Badge className="text-green-400 border-green-400/30 bg-green-400/10">Available</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Currently busy</Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />{location}
              </span>
            )}
            {Number(musician.avg_rating) > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {Number(musician.avg_rating).toFixed(1)} ({musician.review_count} reviews)
              </span>
            )}
            {musician.years_experience > 0 && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {musician.years_experience} yrs experience
              </span>
            )}
          </div>

          {(musician.rate_per_hour || musician.rate_per_event) && (
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {musician.rate_per_hour && (
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  ${musician.rate_per_hour}/hr
                </span>
              )}
              {musician.rate_per_event && (
                <span className="flex items-center gap-1 font-medium">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  ${musician.rate_per_event}/event
                </span>
              )}
            </div>
          )}
        </div>

        {user && user.id !== musician.id && (
          <BookingDialog musicianId={musician.id} musicianName={musician.full_name} userId={user.id} />
        )}
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {musician.bio && (
            <Card>
              <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{musician.bio}</p>
              </CardContent>
            </Card>
          )}

          {musician.media_urls?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Portfolio</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {musician.media_urls.map((url: string) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(musician.youtube_url || musician.soundcloud_url) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Listen & watch</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {musician.youtube_url && (
                  <a href={musician.youtube_url} target="_blank" rel="noreferrer"
                    className="block rounded-lg border border-border p-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                    ▶ Watch on YouTube
                  </a>
                )}
                {musician.soundcloud_url && (
                  <a href={musician.soundcloud_url} target="_blank" rel="noreferrer"
                    className="block rounded-lg border border-border p-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                    ♪ Listen on SoundCloud
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {reviews && reviews.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Reviews</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={review.profiles?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {review.profiles?.full_name?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{review.profiles?.full_name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-muted-foreground pl-9">{review.comment}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {musician.genres?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Genres</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {musician.genres.map((g: string) => (
                  <Badge key={g} variant="outline">{g}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
          {musician.instruments?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Instruments</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {musician.instruments.map((inst: string) => (
                  <Badge key={inst} variant="secondary">{inst}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
