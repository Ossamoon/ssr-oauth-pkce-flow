import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { createSupabaseServerClient, createSupabaseServerClientWithResponse } from "~/lib/supabase.server";
import { Form, useLoaderData } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const supabase = createSupabaseServerClient(request, context);
  const url = new URL(request.url);
  
  // Check if we're returning from OAuth provider
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const error_description = url.searchParams.get("error_description");
  
  // Get all cookies
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = parseCookieHeader(cookieHeader);
  
  // Find code verifier cookie
  let codeVerifierInfo = null;
  const codeVerifierKey = Object.keys(cookies).find(key => key.includes("code-verifier"));
  if (codeVerifierKey) {
    codeVerifierInfo = {
      key: codeVerifierKey,
      value: cookies[codeVerifierKey],
      length: cookies[codeVerifierKey].length,
    };
  }
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  return json({
    hasSession: !!session,
    oauthCallback: {
      code: code ? `${code.substring(0, 20)}...` : null,
      error,
      error_description,
    },
    codeVerifier: codeVerifierInfo,
    currentStep: code ? "callback" : (session ? "authenticated" : "initial"),
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const headers = new Headers();
  const supabase = createSupabaseServerClientWithResponse(request, context, headers);
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "start-oauth") {
    // Start OAuth flow with GitHub
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${new URL(request.url).origin}/pkce-flow-demo`,
      },
    });
    
    if (error) {
      return json({ error: error.message }, { headers });
    }
    
    // The signInWithOAuth method returns a URL that we need to redirect to
    if (data?.url) {
      return redirect(data.url, { headers });
    }
  }
  
  if (action === "exchange-code") {
    const code = formData.get("code") as string;
    if (code) {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        return json({ error: error.message }, { headers });
      }
      
      // Redirect to clear the URL parameters
      return redirect("/pkce-flow-demo", { headers });
    }
  }
  
  if (action === "sign-out") {
    await supabase.auth.signOut();
    return redirect("/pkce-flow-demo", { headers });
  }
  
  return json({ error: "Invalid action" }, { headers });
}

export default function PKCEFlowDemo() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">PKCE Flow Demonstration</h1>
      
      <div className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Current State</h2>
        <div className="space-y-2">
          <p><strong>Step:</strong> {data.currentStep}</p>
          <p><strong>Authenticated:</strong> {data.hasSession ? "Yes" : "No"}</p>
          {data.codeVerifier && (
            <div className="mt-3 p-3 bg-white rounded">
              <p className="font-semibold">Code Verifier Cookie Detected:</p>
              <p className="text-sm"><strong>Key:</strong> {data.codeVerifier.key}</p>
              <p className="text-sm"><strong>Length:</strong> {data.codeVerifier.length} characters</p>
              <p className="text-xs text-gray-600 mt-1">The actual value is stored securely in the cookie</p>
            </div>
          )}
        </div>
      </div>
      
      {data.oauthCallback.code && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">OAuth Callback Received</h2>
          <p className="mb-3">Authorization code received from provider!</p>
          <p className="text-sm mb-4"><strong>Code:</strong> {data.oauthCallback.code}</p>
          <Form method="post">
            <input type="hidden" name="action" value="exchange-code" />
            <input type="hidden" name="code" value={data.oauthCallback.code} />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Exchange Code for Session
            </button>
          </Form>
        </div>
      )}
      
      {data.oauthCallback.error && (
        <div className="mb-8 p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">OAuth Error</h2>
          <p><strong>Error:</strong> {data.oauthCallback.error}</p>
          {data.oauthCallback.error_description && (
            <p><strong>Description:</strong> {data.oauthCallback.error_description}</p>
          )}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">PKCE Flow Steps</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li className={data.currentStep === "initial" ? "font-bold" : ""}>
            <strong>Generate PKCE Challenge:</strong> When you click "Start OAuth Flow", Supabase generates a random code verifier and calculates its SHA256 hash (code challenge)
          </li>
          <li className={data.currentStep === "initial" ? "font-bold" : ""}>
            <strong>Store Code Verifier:</strong> The code verifier is stored in a cookie with key format: <code>&lt;storageKey&gt;-code-verifier</code>
          </li>
          <li>
            <strong>Send to Provider:</strong> User is redirected to GitHub with the code challenge
          </li>
          <li className={data.currentStep === "callback" ? "font-bold" : ""}>
            <strong>Receive Authorization Code:</strong> GitHub redirects back with an authorization code
          </li>
          <li className={data.currentStep === "callback" ? "font-bold" : ""}>
            <strong>Exchange Code:</strong> The code + stored verifier are sent to Supabase to get tokens
          </li>
          <li className={data.currentStep === "authenticated" ? "font-bold" : ""}>
            <strong>Session Established:</strong> Tokens are received and session is created
          </li>
        </ol>
      </div>
      
      <div className="space-y-4">
        {!data.hasSession && !data.oauthCallback.code && (
          <Form method="post">
            <input type="hidden" name="action" value="start-oauth" />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Start OAuth Flow with GitHub
            </button>
          </Form>
        )}
        
        {data.hasSession && (
          <div>
            <p className="mb-4 text-green-600 font-semibold">✓ Successfully authenticated!</p>
            <Form method="post">
              <input type="hidden" name="action" value="sign-out" />
              <button
                type="submit"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Sign Out
              </button>
            </Form>
          </div>
        )}
      </div>
      
      <div className="mt-12 p-6 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Developer Notes</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Check the Application tab in DevTools to see cookies being set/removed</li>
          <li>The code verifier is a cryptographically random string (43-128 characters)</li>
          <li>The code challenge is the base64url-encoded SHA256 hash of the verifier</li>
          <li>Supabase handles all PKCE generation and validation automatically</li>
          <li>Visit <a href="/debug-pkce" className="text-blue-600 underline">/debug-pkce</a> for raw debug information</li>
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