export const GENRES = [
  'Jazz', 'Classical', 'Rock', 'Pop', 'Blues', 'Country', 'R&B', 'Hip Hop',
  'Folk', 'Electronic', 'Latin', 'Gospel', 'Reggae', 'Funk', 'Soul', 'Metal',
  'Acoustic', 'Wedding', 'Corporate', 'DJ',
] as const

export const INSTRUMENTS = [
  'Guitar', 'Piano', 'Violin', 'Drums', 'Bass', 'Vocals', 'Saxophone',
  'Trumpet', 'Flute', 'Cello', 'Keyboard', 'Ukulele', 'Harp', 'DJ Decks',
] as const

export type Role = 'musician' | 'organizer'
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed'

export const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  accepted: 'text-green-400 border-green-400/30 bg-green-400/10',
  completed: 'text-primary border-primary/30 bg-primary/10',
  declined: 'text-red-400 border-red-400/30 bg-red-400/10',
  cancelled: 'text-muted-foreground border-border bg-muted',
}
