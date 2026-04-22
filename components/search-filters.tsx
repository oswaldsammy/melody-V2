'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, Suspense } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'

function SearchFiltersInner({ genres }: { genres: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeGenre = searchParams.get('genre')
  const activeCity = searchParams.get('city')
  const activeQ = searchParams.get('q')
  const availableOnly = searchParams.get('available') === 'true'

  const update = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = () => router.push('/')

  const hasFilters = activeGenre || activeCity || activeQ || availableOnly

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            defaultValue={activeQ ?? ''}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value || null)
            }}
            onBlur={(e) => update('q', e.target.value || null)}
          />
        </div>
        <Input
          placeholder="City..."
          defaultValue={activeCity ?? ''}
          className="w-36"
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('city', (e.target as HTMLInputElement).value || null)
          }}
          onBlur={(e) => update('city', e.target.value || null)}
        />
        <Button
          variant={availableOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => update('available', availableOnly ? null : 'true')}
        >
          Available now
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <Badge
            key={genre}
            variant={activeGenre === genre ? 'default' : 'outline'}
            className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
            onClick={() => update('genre', activeGenre === genre ? null : genre)}
          >
            {genre}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function SearchFilters({ genres }: { genres: string[] }) {
  return (
    <Suspense>
      <SearchFiltersInner genres={genres} />
    </Suspense>
  )
}
