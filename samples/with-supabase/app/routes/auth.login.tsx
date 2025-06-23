import { useSearchParams, Form, useActionData, useNavigation } from "react-router";
import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, data } from "react-router";
import { createSupabaseServerClientWithResponse } from "~/lib/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  
  return data({
    error: error ? (errorDescription || error) : null,
    publicUrl: context.cloudflare.env.PUBLIC_URL || "http://localhost:5173"
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const redirectTo = formData.get("redirectTo") as string || "/dashboard";
  
  const headers = new Headers();
  const supabase = createSupabaseServerClientWithResponse(request, context, headers);
  
  console.log("[PKCE Flow] Initiating Google OAuth with PKCE", {
    redirectTo,
    timestamp: new Date().toISOString(),
    note: "Supabaseが内部的にCode VerifierとCode Challengeを生成します",
    process: [
      "1. ランダムな43-128文字のCode Verifierを生成",
      "2. Code VerifierのSHA-256ハッシュを計算してCode Challengeを作成",
      "3. Code Verifierをcookieに保存（sb-<project-ref>-auth-token-code-verifier）",
      "4. Code ChallengeをOAuth URLに含めて送信"
    ]
  });
  
  const publicUrl = context.cloudflare.env.PUBLIC_URL || "http://localhost:5173";
  const callbackUrl = `${publicUrl}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
  
  console.log("[PKCE Flow] OAuth callback URL configured:", {
    callbackUrl,
    publicUrl,
    envPublicUrl: context.cloudflare.env.PUBLIC_URL,
    note: "この URL を Supabase ダッシュボードの Redirect URLs に追加する必要があります"
  });
  
  const { data: authData, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  
  if (error) {
    console.error("[PKCE Flow] OAuth initiation error:", error);
    return data({ error: error.message }, { status: 400 });
  }
  
  if (authData.url) {
    // 実際のOAuth URLからcode_challengeパラメータを抽出
    const authUrl = new URL(authData.url);
    const actualCodeChallenge = authUrl.searchParams.get('code_challenge');
    const actualChallengeMethod = authUrl.searchParams.get('code_challenge_method');
    
    console.log("[PKCE Flow] OAuth initiated successfully", {
      provider: "google",
      timestamp: new Date().toISOString(),
      authUrl: authData.url,
      actualPKCE: {
        codeChallenge: actualCodeChallenge,
        challengeMethod: actualChallengeMethod,
        note: "これはSupabaseが生成した実際のcode_challengeです"
      }
    });
    return redirect(authData.url, { headers });
  }
  
  return data({ error: "Failed to generate OAuth URL" }, { status: 500 });
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const loaderData = useActionData<typeof action>();
  const navigation = useNavigation();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  
  const isLoading = navigation.state === "submitting";
  const error = loaderData?.error || searchParams.get("error") || searchParams.get("error_description");

  useEffect(() => {
    if (error) {
      console.error("[PKCE Flow] OAuth error:", { error });
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            アカウントにログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            OAuth 2.0 PKCE フローを使用
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  認証エラー
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Form method="post">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                ログイン中...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google でログイン
              </>
            )}
          </button>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">
                OAuth 2.0 PKCE フローで保護されています
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}