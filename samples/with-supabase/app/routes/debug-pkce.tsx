import { json, type LoaderFunctionArgs } from "react-router";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const supabase = createSupabaseServerClient(request, context);
  
  // Get all cookies from the request
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookieHeader(cookieHeader);
  
  // Look for auth-related cookies
  const authCookies: Record<string, any> = {};
  const codeVerifierCookies: Record<string, any> = {};
  
  for (const [name, value] of Object.entries(cookies)) {
    if (name.includes("auth-token") || name.includes("supabase")) {
      authCookies[name] = value;
      
      // Try to decode if it's base64url encoded
      if (name.includes("code-verifier")) {
        codeVerifierCookies[name] = value;
        try {
          // Attempt to decode base64url
          const decoded = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
          codeVerifierCookies[`${name}_decoded`] = decoded;
        } catch (e) {
          // Not base64url encoded
        }
      }
    }
  }
  
  // Get current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Try to access storage directly (for debugging)
  let storageDebug = {};
  try {
    // The storage key format is usually "sb-<project-id>-auth-token"
    const storageKeys = Object.keys(cookies).filter(key => 
      key.includes("sb-") && (key.includes("auth-token") || key.includes("code-verifier"))
    );
    
    storageDebug = {
      foundKeys: storageKeys,
      values: storageKeys.reduce((acc, key) => {
        acc[key] = cookies[key];
        return acc;
      }, {} as Record<string, string>)
    };
  } catch (e) {
    storageDebug = { error: e instanceof Error ? e.message : String(e) };
  }
  
  return json({
    timestamp: new Date().toISOString(),
    session: session ? {
      access_token: session.access_token ? `${session.access_token.substring(0, 20)}...` : null,
      refresh_token: session.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : null,
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: session.user
    } : null,
    sessionError: sessionError?.message,
    user,
    userError: userError?.message,
    cookies: {
      all: Object.keys(cookies),
      authRelated: authCookies,
      codeVerifier: codeVerifierCookies,
    },
    storageDebug,
    pkceInfo: {
      explanation: "PKCE Code Verifier is stored in cookies with the key format: <storageKey>-code-verifier",
      storageKeyFormat: "Usually: sb-<project-ref>-auth-token",
      lifecycle: [
        "1. Generated when signInWithOAuth is called",
        "2. Stored in cookie as: <storageKey>-code-verifier",
        "3. Retrieved and used during exchangeCodeForSession",
        "4. Deleted after successful exchange"
      ]
    }
  });
}

export default function DebugPKCE() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">PKCE Debug Information</h1>
      <p className="mb-4">
        This page shows the current state of PKCE-related cookies and storage.
        View the page source or network tab to see the JSON response from the loader.
      </p>
      <div className="bg-gray-100 p-4 rounded">
        <p>Check the browser's developer tools:</p>
        <ul className="list-disc ml-5 mt-2">
          <li>Network tab → This request → Response</li>
          <li>Application tab → Cookies</li>
          <li>Console → Run: <code>await fetch('/debug-pkce').then(r => r.json())</code></li>
        </ul>
      </div>
    </div>
  );
}

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  const items = cookieHeader.split(";").map((item) => item.trim());
  for (const item of items) {
    const [name, ...rest] = item.split("=");
    if (name && rest.length > 0) {
      cookies[name] = decodeURIComponent(rest.join("="));
    }
  }
  return cookies;
}