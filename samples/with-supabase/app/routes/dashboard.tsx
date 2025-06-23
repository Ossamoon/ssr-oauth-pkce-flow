import { data, type LoaderFunctionArgs } from 'react-router'
import { Form, useLoaderData, Link } from 'react-router'
import { requireAuth } from '~/middleware/auth'

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await requireAuth(request, context)
  
  return data({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
      avatar: session.user.user_metadata?.avatar_url,
      provider: session.user.app_metadata.provider,
    }
  })
}

export default function Dashboard() {
  const loaderData = useLoaderData<typeof loader>()
  const user = loaderData?.user
  
  if (!user) {
    return <div>読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                ← ホーム
              </Link>
              <h1 className="text-xl font-semibold">ダッシュボード</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                <span className="font-medium">{user.email}</span> でログイン中
              </span>
              <Form method="post" action="/auth/logout">
                <button
                  type="submit"
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  ログアウト
                </button>
              </Form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              ユーザー情報
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              OAuth プロバイダーからの詳細情報
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">ユーザー ID</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.id}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">フルネーム</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.name}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.email}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">OAuth プロバイダー</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.provider}
                </dd>
              </div>
              {user.avatar && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">アバター</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              OAuth 2.0 PKCE フロー
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              この認証は PKCE (Proof Key for Code Exchange) フローを使用して実行されました
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose max-w-none text-sm text-gray-700">
              <p>
                PKCE フローは OAuth 2.0 認可コードフローに以下の方法で追加のセキュリティ層を追加します：
              </p>
              <ul>
                <li>暗号学的にランダムな code verifier を生成</li>
                <li>verifier の SHA-256 ハッシュを使用して code challenge を作成</li>
                <li>認可リクエストと共に challenge を送信</li>
                <li>コードをトークンと交換する際に verifier を送信</li>
              </ul>
              <p>
                これにより、特に SPA やモバイルアプリのようなパブリッククライアントにとって重要な、
                認可コード傍受攻撃を防ぎます。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}