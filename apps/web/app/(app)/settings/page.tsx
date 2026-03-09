import { getSession } from '@/lib/session'
import { getUser } from '@/lib/dal'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Please log in to access settings</p>
      </div>
    )
  }

  let user: { username: string; avatarUrl: string | null } | undefined
  try {
    const userData = await getUser()
    user = { username: userData.username, avatarUrl: userData.avatarUrl ?? null }
  } catch {
    // User fetch failed, proceed without avatar
  }

  return <SettingsClient userId={session.userId} user={user} />
}
