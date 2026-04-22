'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface Props {
  userId: string
  currentUrl: string | null
  name: string
}

export function AvatarUpload({ userId, currentUrl, name }: Props) {
  const router = useRouter()
  const [url, setUrl] = useState(currentUrl)
  const [uploading, setUploading] = useState(false)
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })

    if (upErr) {
      toast.error(upErr.message)
      setUploading(false)
      return
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = pub.publicUrl

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    if (updErr) toast.error(updErr.message)
    else {
      setUrl(publicUrl)
      toast.success('Photo updated')
      router.refresh()
    }
    setUploading(false)
  }

  return (
    <label className="group relative inline-block cursor-pointer">
      <Avatar className="h-20 w-20">
        <AvatarImage src={url ?? undefined} alt={name} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <Camera className="h-5 w-5 text-white" />
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={upload}
        disabled={uploading}
      />
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-xs text-white">
          …
        </span>
      )}
    </label>
  )
}
