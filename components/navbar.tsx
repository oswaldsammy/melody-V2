'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Music2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

const navLinks = [
  { href: '/', label: 'Browse' },
  { href: '/bookings', label: 'My Bookings' },
  { href: '/dashboard', label: 'My Profile' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Music2 className="h-5 w-5 text-primary" />
          <span>Melody</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-foreground ${
                pathname === link.href ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
                Log in
              </Button>
              <Button size="sm" render={<Link href="/auth/signup" />}>
                Sign up
              </Button>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="mt-8 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm transition-colors hover:text-foreground ${
                    pathname === link.href ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign out
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" render={<Link href="/auth/login" onClick={() => setOpen(false)} />}>
                      Log in
                    </Button>
                    <Button size="sm" render={<Link href="/auth/signup" onClick={() => setOpen(false)} />}>
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
