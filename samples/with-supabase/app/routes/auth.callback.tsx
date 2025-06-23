import { redirect, type LoaderFunctionArgs } from 'react-router'
import { createSupabaseServerClientWithResponse } from '~/lib/supabase.server'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const redirectTo = url.searchParams.get('redirectTo') || '/dashboard'
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  console.log('[PKCE Flow] OAuth callback received', {
    hasCode: !!code,
    hasError: !!error,
    error,
    errorDescription,
    timestamp: new Date().toISOString(),
  })

  // Handle OAuth errors
  if (error) {
    console.error('[PKCE Flow] OAuth callback error:', {
      error,
      errorDescription,
      timestamp: new Date().toISOString(),
    })
    return redirect(`/auth/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (!code) {
    console.error('[PKCE Flow] No authorization code received')
    return redirect('/auth/login?error=no_code')
  }

  const headers = new Headers()
  const supabase = createSupabaseServerClientWithResponse(request, context, headers)

  try {
    // Exchange the code for a session
    console.log('[PKCE Flow] Exchanging authorization code for session', {
      codeLength: code.length,
      timestamp: new Date().toISOString(),
      note: 'Supabaseがcookieから保存されたCode Verifierを取得し、認可コードと共にトークンエンドポイントに送信します'
    })

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('[PKCE Flow] Code exchange error:', exchangeError)
      return redirect(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    if (!data.session) {
      console.error('[PKCE Flow] No session returned after code exchange')
      return redirect('/auth/login?error=no_session')
    }

    console.log('[PKCE Flow] Code exchange successful', {
      timestamp: new Date().toISOString(),
    })

    // Redirect to the originally requested page
    return redirect(redirectTo, {
      headers,
    })
  } catch (error) {
    console.error('[PKCE Flow] Unexpected error during code exchange:', error)
    return redirect('/auth/login?error=exchange_failed')
  }
}

export default function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">認証処理中...</p>
      </div>
    </div>
  )
}