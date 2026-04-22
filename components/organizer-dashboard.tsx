import Link from 'next/link'
import { Music2, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Profile { full_name: string | null }

export function OrganizerDashboard({ profile }: { profile: Profile | null }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        Welcome, {profile?.full_name ?? 'there'}
      </h1>
      <p className="mb-8 text-muted-foreground">
        You&apos;re signed in as an event organizer.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Search className="h-8 w-8 text-primary" />
            <p className="font-medium">Find musicians</p>
            <p className="text-sm text-muted-foreground">Browse profiles and send booking requests</p>
            <Button className="w-full" nativeButton={false} render={<Link href="/" />}>
              Browse
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Music2 className="h-8 w-8 text-primary" />
            <p className="font-medium">My bookings</p>
            <p className="text-sm text-muted-foreground">Track the status of your booking requests</p>
            <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/bookings" />}>
              View bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
