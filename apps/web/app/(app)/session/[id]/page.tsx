import { notFound } from 'next/navigation'
import { verifySession, getUser } from '@/lib/dal'
import { fetchSessions, type ChatSession } from '@/lib/api'
import { DashboardClient } from '../../dashboard/dashboard-client'

interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params
  const session = await verifySession()
  const user = await getUser()

  let sessions: ChatSession[] = []
  try {
    sessions = await fetchSessions(session.userId)
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
  }

  const matchingSession = sessions.find((existingSession) => existingSession.id === id)
  if (!matchingSession) {
    notFound()
  }

  return (
    <DashboardClient
      sessions={sessions}
      userId={session.userId}
      user={user}
      initialSessionId={id}
    />
  )
}
