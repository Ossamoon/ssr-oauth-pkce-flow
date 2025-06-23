import type { AppLoadContext } from 'react-router'
import { createSupabaseServerClient } from './supabase.server'

export async function getSession(request: Request, context: AppLoadContext) {
  const supabase = createSupabaseServerClient(request, context)
  
  try {
    // まずセッションの存在を確認（クッキーから）
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return null
    }

    // セッションが存在する場合、サーバーで認証を検証
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }

    // 検証されたユーザー情報をセッションに含めて返す
    return { ...session, user }
  } catch (error) {
    return null
  }
}

export async function getUser(request: Request, context: AppLoadContext) {
  const session = await getSession(request, context)
  return session?.user ?? null
}