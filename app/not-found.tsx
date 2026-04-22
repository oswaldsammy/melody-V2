import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Music2 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Music2 className="h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
        Go home
      </Button>
    </div>
  )
}
