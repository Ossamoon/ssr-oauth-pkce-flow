import { redirect, type ActionFunctionArgs } from 'react-router'
import { createSupabaseServerClientWithResponse } from '~/lib/supabase.server'

export async function action({ request, context }: ActionFunctionArgs) {
  const headers = new Headers()
  const supabase = createSupabaseServerClientWithResponse(request, context, headers)

  await supabase.auth.signOut()

  return redirect('/', {
    headers,
  })
}

export async function loader() {
  return redirect('/')
}