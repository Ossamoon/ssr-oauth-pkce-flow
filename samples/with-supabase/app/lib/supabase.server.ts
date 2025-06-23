import { createServerClient } from "@supabase/ssr";
import type { AppLoadContext } from "react-router";

export function createSupabaseServerClient(
  request: Request,
  context: AppLoadContext
) {
  const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");

  return createServerClient(
    context.cloudflare.env.SUPABASE_URL,
    context.cloudflare.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookiesList = Object.entries(cookies).map(([name, value]) => ({
            name,
            value,
          }));
          
          // PKCEのCode Verifierをログに出力（教育目的）
          const codeVerifierCookie = cookiesList.find(c => 
            c.name.includes('auth-token-code-verifier')
          );
          if (codeVerifierCookie && codeVerifierCookie.value) {
            console.log('[PKCE Flow] Code Verifier found in cookie:', {
              cookieName: codeVerifierCookie.name,
              codeVerifierLength: codeVerifierCookie.value.length,
              timestamp: new Date().toISOString(),
            });
          }
          
          return cookiesList;
        },
      },
      auth: {
        debug: false,
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
}

export function createSupabaseServerClientWithResponse(
  request: Request,
  context: AppLoadContext,
  headers: Headers
) {
  const cookies = parseCookieHeader(request.headers.get("Cookie") ?? "");

  return createServerClient(
    context.cloudflare.env.SUPABASE_URL,
    context.cloudflare.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(cookies).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieString = serializeCookie(name, value, options);
            headers.append("Set-Cookie", cookieString);
            
            // PKCEのCode Verifierが設定される時のログ
            if (name.includes('auth-token-code-verifier') && value) {
              console.log('[PKCE Flow] Code Verifier being set in cookie:', {
                cookieName: name,
                codeVerifierLength: value.length,
                timestamp: new Date().toISOString(),
              });
            } else if (name.includes('auth-token-code-verifier') && !value) {
              console.log('[PKCE Flow] Code Verifier cleared from cookie:', {
                cookieName: name,
                timestamp: new Date().toISOString(),
              });
            }
          });
        },
      },
      auth: {
        debug: false,
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
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

function serializeCookie(
  name: string,
  value: string,
  options?: {
    domain?: string;
    path?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    sameSite?: boolean | "lax" | "strict" | "none";
    secure?: boolean;
  }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options?.domain) parts.push(`Domain=${options.domain}`);
  if (options?.path) parts.push(`Path=${options.path}`);
  if (options?.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options?.httpOnly) parts.push("HttpOnly");
  if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options?.sameSite) {
    const sameSiteValue =
      typeof options.sameSite === "boolean" ? "strict" : options.sameSite;
    parts.push(`SameSite=${sameSiteValue}`);
  }
  if (options?.secure) parts.push("Secure");

  return parts.join("; ");
}
