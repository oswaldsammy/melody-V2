'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Props {
  musicianId: string
  musicianName: string
  userId: string
}

export function BookingDialog({ musicianId, musicianName, userId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    event_name: '',
    event_date: '',
    event_time: '',
    duration_hours: '',
    location: '',
    budget: '',
    message: '',
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('bookings').insert({
      musician_id: musicianId,
      organizer_id: userId,
      event_name: form.event_name,
      event_date: form.event_date,
      event_time: form.event_time || null,
      duration_hours: form.duration_hours ? parseInt(form.duration_hours) : null,
      location: form.location || null,
      budget: form.budget ? parseInt(form.budget) : null,
      message: form.message || null,
    })

    if (error) {
      toast.error('Failed to send booking request')
    } else {
      toast.success('Booking request sent!')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shrink-0" />}>
        <CalendarDays className="mr-2 h-4 w-4" />
        Request Booking
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {musicianName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="event_name">Event name *</Label>
            <Input id="event_name" placeholder="e.g. Wedding Reception" value={form.event_name} onChange={e => set('event_name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date *</Label>
              <Input id="event_date" type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_time">Time</Label>
              <Input id="event_time" type="time" value={form.event_time} onChange={e => set('event_time', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hrs)</Label>
              <Input id="duration" type="number" min="1" placeholder="3" value={form.duration_hours} onChange={e => set('duration_hours', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" type="number" min="0" placeholder="500" value={form.budget} onChange={e => set('budget', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Venue / Location</Label>
            <Input id="location" placeholder="e.g. The Grand Hall, NYC" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Tell them about your event…" rows={3} value={form.message} onChange={e => set('message', e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send Request'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
