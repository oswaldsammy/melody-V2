export const metadata = { title: 'Terms of Service — Melody' }

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose-sm text-sm leading-relaxed text-muted-foreground">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Terms of Service</h1>
      <p>By using Melody (the &ldquo;Service&rdquo;) you agree to these terms.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">1. Accounts</h2>
      <p>You are responsible for the security of your account and for all activity under it.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">2. Bookings</h2>
      <p>Melody is a marketplace that connects event organizers and musicians. Melody is not a party to any booking agreement and does not guarantee performance.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">3. Content</h2>
      <p>You retain ownership of content you upload, but grant Melody a license to display it for the purpose of operating the Service.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">4. Prohibited uses</h2>
      <p>No illegal, harmful, misleading, or infringing content. No spam, harassment, or circumventing the platform.</p>
      <h2 className="mt-6 mb-2 text-base font-semibold text-foreground">5. Liability</h2>
      <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind.</p>
      <p className="mt-8 text-xs">Last updated: today. Contact: hello@melody.app</p>
    </div>
  )
}
