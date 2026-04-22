'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'accept' | 'decline' | null>(null)

  const update = async (status: 'accepted' | 'declined') => {
    setLoading(status === 'accepted' ? 'accept' : 'decline')
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId)
    if (error) {
      toast.error('Failed to update booking')
    } else {
      toast.success(status === 'accepted' ? 'Booking accepted!' : 'Booking declined')
      router.refresh()
    }
    setLoading(null)
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" onClick={() => update('accepted')} disabled={!!loading}>
        {loading === 'accept' ? 'Accepting…' : 'Accept'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => update('declined')} disabled={!!loading}>
        {loading === 'decline' ? 'Declining…' : 'Decline'}
      </Button>
    </div>
  )
}
