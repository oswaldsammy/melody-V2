'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { BookingStatus } from '@/lib/constants'

interface Props {
  bookingId: string
  role: 'musician' | 'organizer'
  status: BookingStatus
  isPast: boolean
}

export function BookingActions({ bookingId, role, status, isPast }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const update = async (next: BookingStatus, label: string) => {
    setLoading(label)
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status: next }).eq('id', bookingId)
    if (error) toast.error(error.message || 'Failed to update booking')
    else {
      toast.success(`Booking ${next}`)
      router.refresh()
    }
    setLoading(null)
  }

  if (role === 'musician' && status === 'pending') {
    return (
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => update('accepted', 'accept')} disabled={!!loading}>
          {loading === 'accept' ? 'Accepting…' : 'Accept'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => update('declined', 'decline')} disabled={!!loading}>
          {loading === 'decline' ? 'Declining…' : 'Decline'}
        </Button>
      </div>
    )
  }

  if (role === 'musician' && status === 'accepted' && isPast) {
    return (
      <div className="mt-3">
        <Button size="sm" onClick={() => update('completed', 'complete')} disabled={!!loading}>
          {loading === 'complete' ? 'Marking…' : 'Mark as completed'}
        </Button>
      </div>
    )
  }

  if (role === 'organizer' && status === 'pending') {
    return (
      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={() => update('cancelled', 'cancel')} disabled={!!loading}>
          {loading === 'cancel' ? 'Cancelling…' : 'Cancel request'}
        </Button>
      </div>
    )
  }

  return null
}
