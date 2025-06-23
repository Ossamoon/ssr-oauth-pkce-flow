import { Link, useNavigate } from "react-router";
import { authClient } from "../lib/auth-client";
import { requireAuth } from "../middleware/auth";
import type { LoaderFunctionArgs } from "react-router";
import { useState } from "react";

export async function loader(args: LoaderFunctionArgs) {
  const session = await requireAuth(args);
  return { session };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/");
        },
      },
    });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">OAuth Demo</span>
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                ホーム
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? "ログアウト中..." : "ログアウト"}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">プロフィール</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {session.user.name?.[0] || session.user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {session.user.name || "名前未設定"}
                    </p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ユーザーID</span>
                    <span className="text-sm font-mono text-gray-900">{session.user.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">認証プロバイダー</span>
                    <span className="text-sm text-gray-900">Google</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Info Card */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">セッション情報</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">セッションID</h3>
                  <p className="text-xs font-mono text-gray-600 break-all">{session.session?.id || "N/A"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">作成日時</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(session.user.createdAt || Date.now()).toLocaleString("ja-JP")}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      このセッションは安全なHTTPOnlyクッキーで管理されています。
                      セッションは7日間有効です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OAuth Flow Info */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold text-gray-900">OAuth 2.0 PKCE フロー</h2>
                <div className="text-sm text-gray-500">
                  PKCEフローの詳細はサーバーログで確認できます
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  このアプリケーションでは、以下のセキュアな認証フローが実装されています：
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-indigo-600">1</span>
                      </div>
                      <h3 className="font-medium text-gray-900">認可リクエスト</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      PKCEチャレンジを生成し、Googleの認可エンドポイントへリダイレクト
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-purple-600">2</span>
                      </div>
                      <h3 className="font-medium text-gray-900">認可コード交換</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      認可コードとPKCEベリファイアーを使用してアクセストークンを取得
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-bold text-green-600">3</span>
                      </div>
                      <h3 className="font-medium text-gray-900">セッション確立</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      ユーザー情報を取得し、安全なセッションを確立
                    </p>
                  </div>
                </div>
                
                {/* Server Log Info */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">📝 PKCEフローのログ確認方法</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• <strong>ローカル開発時:</strong> ターミナルの <code className="bg-gray-200 px-1 rounded">pnpm dev</code> 出力</li>
                    <li>• <strong>本番環境:</strong> <code className="bg-gray-200 px-1 rounded">pnpm wrangler tail</code> でリアルタイムログを確認</li>
                    <li>• ログインフロー実行時に以下の情報が出力されます：</li>
                    <li className="ml-4">- OAuth認可リクエスト開始</li>
                    <li className="ml-4">- 認可コード受信</li>
                    <li className="ml-4">- PKCEベリファイアーでのトークン交換</li>
                    <li className="ml-4">- セッション作成</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}