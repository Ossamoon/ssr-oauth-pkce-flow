import { redirect } from 'react-router'
import type { AppLoadContext } from 'react-router'
import { getSession } from '~/lib/session.server'

export async function requireAuth(request: Request, context: AppLoadContext) {
  const session = await getSession(request, context)
  
  if (!session) {
    const url = new URL(request.url)
    const redirectTo = encodeURIComponent(url.pathname + url.search)
    throw redirect(`/auth/login?redirectTo=${redirectTo}`)
  }
  
  return session
}