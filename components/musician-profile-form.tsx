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
import { AvatarUpload } from '@/components/avatar-upload'
import { MediaUploader } from '@/components/media-uploader'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { GENRES, INSTRUMENTS } from '@/lib/constants'

export interface ProfileRow {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: 'musician' | 'organizer'
}

export interface MusicianRow {
  id: string
  bio: string | null
  city: string | null
  state: string | null
  rate_per_hour: number | null
  rate_per_event: number | null
  years_experience: number | null
  is_available: boolean
  genres: string[] | null
  instruments: string[] | null
  media_urls: string[] | null
  youtube_url: string | null
  soundcloud_url: string | null
}

interface Props {
  profile: ProfileRow
  musician: MusicianRow | null
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
  const [youtubeUrl, setYoutubeUrl] = useState(musician?.youtube_url ?? '')
  const [soundcloudUrl, setSoundcloudUrl] = useState(musician?.soundcloud_url ?? '')

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
        bio: bio || null,
        city: city || null,
        state: state || null,
        rate_per_hour: ratePerHour ? parseInt(ratePerHour) : null,
        rate_per_event: ratePerEvent ? parseInt(ratePerEvent) : null,
        years_experience: yearsExp ? parseInt(yearsExp) : 0,
        is_available: isAvailable,
        genres,
        instruments,
        youtube_url: youtubeUrl || null,
        soundcloud_url: soundcloudUrl || null,
        updated_at: new Date().toISOString(),
      }),
    ])

    if (profileRes.error || musicianRes.error) {
      toast.error(profileRes.error?.message ?? musicianRes.error?.message ?? 'Failed to save')
    } else {
      toast.success('Profile saved')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Profile photo</CardTitle></CardHeader>
        <CardContent>
          <AvatarUpload userId={profile.id} currentUrl={profile.avatar_url} name={fullName || profile.email} />
          <p className="mt-2 text-xs text-muted-foreground">Click to upload a new photo</p>
        </CardContent>
      </Card>

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
          {GENRES.map(g => (
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
          {INSTRUMENTS.map(i => (
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

      <Card>
        <CardHeader><CardTitle className="text-base">Portfolio photos</CardTitle></CardHeader>
        <CardContent>
          <MediaUploader userId={profile.id} urls={musician?.media_urls ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Audio & Video</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="yt">YouTube URL</Label>
            <Input id="yt" placeholder="https://youtube.com/watch?v=…" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sc">SoundCloud URL</Label>
            <Input id="sc" placeholder="https://soundcloud.com/…" value={soundcloudUrl} onChange={e => setSoundcloudUrl(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving…' : 'Save Profile'}
      </Button>
    </div>
  )
}
