import { CalendarDays, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Stats {
  upcoming: number
  pending: number
  totalEarnings: number
  completed: number
}

export function MusicianStats({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Upcoming gigs', value: stats.upcoming, icon: CalendarDays, color: 'text-green-400' },
    { label: 'Pending requests', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-primary' },
    { label: 'Total earnings', value: `$${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label}>
            <CardContent className="p-4">
              <Icon className={`h-4 w-4 ${item.color}`} />
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
