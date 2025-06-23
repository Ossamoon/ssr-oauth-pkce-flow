import { Link, Form, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { getSession } from "~/lib/session.server";

export function meta() {
  return [
    { title: "OAuth 2.0 PKCE Flow Demo - Supabase" },
    {
      name: "description",
      content: "Demonstration of OAuth 2.0 with PKCE using Supabase",
    },
  ];
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request, context);
  return data({ isAuthenticated: !!session });
}

export default function Home() {
  const { isAuthenticated } = useLoaderData<typeof loader>();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              OAuth 2.0 PKCE フロー デモ
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Supabase と PKCE (Proof Key for Code Exchange)
              を使用したセキュアな認証
            </p>
            <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              {isAuthenticated ? (
                <>
                  <div className="rounded-md shadow">
                    <Link
                      to="/dashboard"
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg"
                    >
                      ダッシュボード
                    </Link>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
                    <Form method="post" action="/auth/logout">
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:px-10 md:py-4 md:text-lg"
                      >
                        ログアウト
                      </button>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="rounded-md shadow">
                  <Link
                    to="/auth/login"
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg"
                  >
                    ログイン
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">
                  セキュアな設計
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  PKCE により認可コード傍受攻撃を防ぐ追加のセキュリティ層を提供
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">
                  サーバーサイドレンダリング
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  React Router v7 による最適なパフォーマンスと SEO を実現する
                  SSR
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900">
                  エッジデプロイメント
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Cloudflare Workers による低遅延とグローバル配信
                </p>
              </div>
            </div>
          </div>

          <div className="mt-20 rounded-lg bg-white p-8 shadow">
            <h2 className="text-2xl font-bold text-gray-900">PKCE の仕組み</h2>
            <div className="mt-4 space-y-4 text-gray-600">
              <p>
                Proof Key for Code Exchange (PKCE)
                フローは、動的に生成されるシークレットを追加することで、
                標準的な OAuth 2.0 認可コードフローのセキュリティを強化します：
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  クライアントがランダムな{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
                    code_verifier
                  </code>{" "}
                  を生成
                </li>
                <li>
                  verifier を SHA-256 でハッシュ化して{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
                    code_challenge
                  </code>{" "}
                  を作成
                </li>
                <li>認可リクエストと共に challenge を送信</li>
                <li>認可サーバーが challenge を保存し、認可コードを返す</li>
                <li>クライアントが元の verifier と共にコードを交換</li>
                <li>
                  サーバーが{" "}
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">
                    SHA256(verifier) === challenge
                  </code>{" "}
                  を検証
                </li>
              </ol>
              <p className="mt-4">
                これにより、フローを開始したクライアントのみが認可コードを交換できることが保証され、
                悪意のあるアプリによるコードの傍受を防ぎます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
