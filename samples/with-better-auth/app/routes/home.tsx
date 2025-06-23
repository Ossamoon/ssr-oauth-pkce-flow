import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { getSession } from "../lib/session.server";
import { authClient } from "../lib/auth-client";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Better Auth Sample App" },
    { name: "description", content: "OAuth 2.0 PKCE Flow with Better Auth" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const session = await getSession(args);
  return { session };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { session } = loaderData;
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate(0); // Refresh the page
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              OAuth 2.0 PKCE Flow
              <span className="block text-3xl md:text-4xl text-indigo-600 mt-2">
                デモアプリケーション
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Better Auth と Cloudflare D1
              を使用した、安全な認証フローの実装例です
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                PKCE対応
              </h3>
              <p className="text-gray-600">
                認可コードフローにPKCE拡張を実装し、より安全な認証を実現
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                エッジ対応
              </h3>
              <p className="text-gray-600">
                Cloudflare Workersで動作し、世界中から高速アクセス可能
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                SSR対応
              </h3>
              <p className="text-gray-600">
                React Router v7によるサーバーサイドレンダリングで高速表示
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {session ? (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    ログイン済み
                  </div>
                  <p className="text-gray-600 mb-2">
                    ようこそ、
                    <span className="font-semibold text-gray-900">
                      {session.user.name || session.user.email}
                    </span>{" "}
                    さん
                  </p>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    ダッシュボードへ
                    <svg
                      className="ml-2 -mr-1 w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        ログアウト中...
                      </>
                    ) : (
                      <>
                        <svg
                          className="mr-2 -ml-1 w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        ログアウト
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  デモを試してみましょう
                </h2>
                <p className="text-gray-600 mb-6">
                  Googleアカウントでログインして、認証フローを体験できます
                </p>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  ログインページへ
                </Link>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          <div className="mt-16 text-center">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              使用技術
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Better Auth
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                React Router v7
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Cloudflare Workers
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Drizzle ORM
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Cloudflare D1
              </span>
              <span className="px-3 py-1 bg-gray-100 rounded-full">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
