'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Props {
  userId: string
  urls: string[]
}

export function MediaUploader({ userId, urls: initial }: Props) {
  const router = useRouter()
  const [urls, setUrls] = useState<string[]>(initial)
  const [uploading, setUploading] = useState(false)

  const save = async (next: string[]) => {
    const supabase = createClient()
    const { error } = await supabase.from('musicians').update({ media_urls: next }).eq('id', userId)
    if (error) toast.error(error.message)
  }

  const add = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    const added: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
      const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600' })
      if (error) { toast.error(error.message); continue }
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      added.push(data.publicUrl)
    }
    const next = [...urls, ...added]
    setUrls(next)
    await save(next)
    if (added.length) toast.success(`${added.length} photo${added.length > 1 ? 's' : ''} uploaded`)
    setUploading(false)
    router.refresh()
  }

  const remove = async (url: string) => {
    const next = urls.filter(u => u !== url)
    setUrls(next)
    await save(next)
    const path = url.split('/media/')[1]
    if (path) {
      const supabase = createClient()
      await supabase.storage.from('media').remove([path])
    }
    router.refresh()
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {urls.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/60">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <input type="file" accept="image/*" multiple className="hidden" onChange={add} disabled={uploading} />
        </label>
      </div>
      {uploading && <p className="mt-2 text-xs text-muted-foreground">Uploading…</p>}
    </div>
  )
}
