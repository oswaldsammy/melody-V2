import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MusicianCard, type MusicianListing } from '@/components/musician-card'
import { SearchFilters } from '@/components/search-filters'

const ALL_GENRES = [
  'Jazz', 'Classical', 'Rock', 'Pop', 'Blues', 'Country', 'R&B', 'Hip Hop',
  'Folk', 'Electronic', 'Latin', 'Gospel', 'Reggae', 'Funk', 'Soul', 'Metal',
  'Acoustic', 'Wedding', 'Corporate', 'DJ',
]

interface PageProps {
  searchParams: Promise<{ genre?: string; city?: string; available?: string; q?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role === 'musician') redirect('/dashboard')
  }

  let query = supabase
    .from('musician_listings')
    .select('*')
    .order('avg_rating', { ascending: false })
    .order('created_at', { ascending: false })

  if (params.q) query = query.ilike('full_name', `%${params.q}%`)
  if (params.genre) query = query.contains('genres', [params.genre])
  if (params.city) query = query.ilike('city', `%${params.city}%`)
  if (params.available === 'true') query = query.eq('is_available', true)

  const { data: musicians } = await query

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Find Musicians</h1>
        <p className="mt-1 text-muted-foreground">
          Browse and book talented local musicians for your events and gigs
        </p>
      </div>

      <SearchFilters genres={ALL_GENRES} />

      {!musicians || musicians.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium">No musicians found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or be the first to create a musician profile
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {musicians.map((musician) => (
            <MusicianCard key={musician.id} musician={musician as MusicianListing} />
          ))}
        </div>
      )}
    </div>
  )
}
