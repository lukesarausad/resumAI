import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import SessionProvider from "@/components/providers/session-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { FileText, LogOut, Home } from "lucide-react"

async function DashboardNav() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              resumAI
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </nav>
  )
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server"
        const { signOut } = await import("next-auth/react")
        // This won't work in server component, we need client component
      }}
    >
      <Link href="/api/auth/signout">
        <Button variant="ghost" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </Link>
    </form>
  )
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </SessionProvider>
  )
}
