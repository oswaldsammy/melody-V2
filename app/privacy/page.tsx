export const metadata = { title: 'Privacy Policy — Melody' }

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose-sm text-sm leading-relaxed text-muted-foreground">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Privacy Policy</h1>
      <p>We store the minimum data needed to run the Service.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">What we collect</h2>
      <p>Name, email, profile photo, and profile content you submit (bio, genres, rates, photos). Booking messages between you and other users.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">How we use it</h2>
      <p>To operate the Service: authentication, showing your profile, delivering bookings and messages, and sending transactional emails.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">Third parties</h2>
      <p>Auth and data are provided by Supabase. Analytics and payments (if enabled) may share data with the respective vendors.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">Your rights</h2>
      <p>You can request deletion of your account at any time by contacting us.</p>
      <p className="mt-8 text-xs">Last updated: today.</p>
    </div>
  )
}
