'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface Message {
  id: string
  booking_id: string
  sender_id: string
  body: string
  created_at: string
  sender?: { full_name: string | null; avatar_url: string | null } | null
}

interface Props {
  bookingId: string
  currentUserId: string
  initialMessages: Message[]
}

export function MessageThread({ bookingId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `booking_id=eq.${bookingId}` },
        async (payload) => {
          const m = payload.new as Message
          const { data: sender } = await supabase
            .from('profiles').select('full_name, avatar_url').eq('id', m.sender_id).single()
          setMessages(prev =>
            prev.some(x => x.id === m.id) ? prev : [...prev, { ...m, sender: sender ?? null }]
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ booking_id: bookingId, sender_id: currentUserId, body: body.trim() })
      .select('*, sender:profiles(full_name, avatar_url)')
      .single()
    if (error) toast.error(error.message)
    else if (data) {
      setMessages(prev => prev.some(x => x.id === data.id) ? prev : [...prev, data as Message])
      setBody('')
    }
    setSending(false)
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div ref={scrollRef} className="max-h-[50vh] min-h-64 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No messages yet. Say hi!
            </p>
          ) : messages.map((m) => {
            const mine = m.sender_id === currentUserId
            const initials = m.sender?.full_name?.[0] ?? '?'
            return (
              <div key={m.id} className={`flex gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                {!mine && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={m.sender?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                    mine
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            )
          })}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !body.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
