import { createAuth, logPKCE } from "../lib/auth";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

// PKCEフロー関連のリクエストをログ出力
function logAuthRequest(request: Request, action: string) {
  const url = new URL(request.url);
  
  console.log(`\n🔒 [Auth Request - ${action}]`);
  console.log(`📍 Path: ${url.pathname}`);
  console.log(`🔍 Method: ${request.method}`);
  
  // Google OAuth開始時
  if (url.pathname.includes("/signin/google")) {
    logPKCE("🚀 OAuth Authorization Start", {
      provider: "Google",
      flow: "Authorization Code with PKCE",
      pkceMethod: "S256 (SHA-256)",
      description: "Initiating OAuth flow - Better Auth will generate code verifier and challenge",
      nextSteps: [
        "1. Generate cryptographically secure code verifier",
        "2. Calculate code challenge using SHA-256",
        "3. Store verifier in database",
        "4. Redirect to Google with code challenge"
      ]
    });
  }
  
  // OAuthコールバックの場合、パラメータをログ出力
  if (url.pathname.includes("/callback/google")) {
    const params: Record<string, string> = {};
    ["code", "state", "error", "error_description"].forEach(param => {
      if (url.searchParams.has(param)) {
        params[param] = param === "code" 
          ? url.searchParams.get(param)!.substring(0, 20) + "..." 
          : url.searchParams.get(param)!;
      }
    });
    
    logPKCE("🔄 OAuth Callback Received", {
      hasAuthorizationCode: !!params.code,
      hasState: !!params.state,
      hasError: !!params.error,
      params: params,
      nextStep: params.code ? "Exchange code for tokens with PKCE verifier" : "Handle error",
      pkceValidation: params.code ? [
        "1. Retrieve stored code verifier using state parameter",
        "2. Send authorization code + code verifier to token endpoint",
        "3. Google validates code verifier against original challenge",
        "4. Receive access token if validation succeeds"
      ] : null
    });
  }
  
  // セッション作成時
  if (url.pathname.includes("/session") && action === "POST") {
    logPKCE("🎉 Session Creation", {
      action: "Creating new session after successful authentication",
      storage: "HTTPOnly Cookie",
      duration: "7 days",
      description: "Token exchange was successful - PKCE validation passed"
    });
  }
  
  // トークン交換プロセスの完了を検知
  if (url.pathname.includes("/callback/google") && url.searchParams.get("code")) {
    console.log("\n📌 [Token Exchange Process]");
    console.log("Better Auth will now:");
    console.log("1. Retrieve the stored code verifier (logged above)");
    console.log("2. Send POST request to Google's token endpoint");
    console.log("3. Include: authorization_code, code_verifier, client_id, client_secret");
    console.log("4. Google validates: SHA256(code_verifier) === code_challenge");
    console.log("5. If valid, Google returns access_token and refresh_token");
    console.log("─".repeat(50));
  }
  
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log("─".repeat(50));
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  logAuthRequest(request, "GET");
  const auth = createAuth(context.cloudflare.env);
  return auth.handler(request);
}

export async function action({ request, context }: ActionFunctionArgs) {
  logAuthRequest(request, "POST");
  const auth = createAuth(context.cloudflare.env);
  return auth.handler(request);
}