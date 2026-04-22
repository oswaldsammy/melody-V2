'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { X } from 'lucide-react'

const GENRE_OPTIONS = [
  'Jazz', 'Classical', 'Rock', 'Pop', 'Blues', 'Country', 'R&B', 'Hip Hop',
  'Folk', 'Electronic', 'Latin', 'Gospel', 'Reggae', 'Funk', 'Soul', 'Metal',
  'Acoustic', 'Wedding', 'Corporate', 'DJ',
]

const INSTRUMENT_OPTIONS = [
  'Guitar', 'Piano', 'Violin', 'Drums', 'Bass', 'Vocals', 'Saxophone',
  'Trumpet', 'Flute', 'Cello', 'Keyboard', 'Ukulele', 'Harp', 'DJ Decks',
]

interface Props {
  profile: any
  musician: any
}

export function MusicianProfileForm({ profile, musician }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [bio, setBio] = useState(musician?.bio ?? '')
  const [city, setCity] = useState(musician?.city ?? '')
  const [state, setState] = useState(musician?.state ?? '')
  const [ratePerHour, setRatePerHour] = useState(musician?.rate_per_hour?.toString() ?? '')
  const [ratePerEvent, setRatePerEvent] = useState(musician?.rate_per_event?.toString() ?? '')
  const [yearsExp, setYearsExp] = useState(musician?.years_experience?.toString() ?? '')
  const [isAvailable, setIsAvailable] = useState(musician?.is_available ?? true)
  const [genres, setGenres] = useState<string[]>(musician?.genres ?? [])
  const [instruments, setInstruments] = useState<string[]>(musician?.instruments ?? [])

  const toggleGenre = (g: string) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const toggleInstrument = (i: string) =>
    setInstruments(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  const handleSave = async () => {
    setLoading(true)
    const supabase = createClient()

    const [profileRes, musicianRes] = await Promise.all([
      supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id),
      supabase.from('musicians').upsert({
        id: profile.id,
        bio,
        city,
        state,
        rate_per_hour: ratePerHour ? parseInt(ratePerHour) : null,
        rate_per_event: ratePerEvent ? parseInt(ratePerEvent) : null,
        years_experience: yearsExp ? parseInt(yearsExp) : 0,
        is_available: isAvailable,
        genres,
        instruments,
        updated_at: new Date().toISOString(),
      }),
    ])

    if (profileRes.error || musicianRes.error) {
      toast.error('Failed to save profile')
    } else {
      toast.success('Profile saved!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State / Region</Label>
              <Input id="state" placeholder="NY" value={state} onChange={e => setState(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="Tell event organizers about yourself…" rows={4} value={bio} onChange={e => setBio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsExp">Years of experience</Label>
            <Input id="yearsExp" type="number" min="0" value={yearsExp} onChange={e => setYearsExp(e.target.value)} className="w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="available" checked={isAvailable} onCheckedChange={setIsAvailable} />
            <Label htmlFor="available">Available for bookings</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Rates</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rph">Per hour ($)</Label>
            <Input id="rph" type="number" min="0" placeholder="0" value={ratePerHour} onChange={e => setRatePerHour(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rpe">Per event ($)</Label>
            <Input id="rpe" type="number" min="0" placeholder="0" value={ratePerEvent} onChange={e => setRatePerEvent(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Genres</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {GENRE_OPTIONS.map(g => (
            <Badge
              key={g}
              variant={genres.includes(g) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleGenre(g)}
            >
              {genres.includes(g) && <X className="mr-1 h-3 w-3" />}
              {g}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Instruments</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {INSTRUMENT_OPTIONS.map(i => (
            <Badge
              key={i}
              variant={instruments.includes(i) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleInstrument(i)}
            >
              {instruments.includes(i) && <X className="mr-1 h-3 w-3" />}
              {i}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving…' : 'Save Profile'}
      </Button>
    </div>
  )
}
