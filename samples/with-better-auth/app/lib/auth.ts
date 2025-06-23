import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

// PKCEフローのサーバーサイドログ
function logPKCE(step: string, data: any) {
  console.log(`\n🔐 [PKCE Flow - ${step}]`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`📊 Data:`, JSON.stringify(data, null, 2));
  console.log("─".repeat(50));
}

// デバッグ用：セッションの状態をログ出力
export function logSessionState(session: any, context: string) {
  console.log(`\n🔍 [Session Debug - ${context}]`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`👤 User: ${session?.user?.email || "No session"}`);
  console.log(`🆔 Session ID: ${session?.id || "No session"}`);
  console.log(
    `🕐 Expires: ${
      session?.expiresAt
        ? new Date(session.expiresAt).toISOString()
        : "No session"
    }`
  );
  console.log("─".repeat(50));
}

export function createAuth(env: Env) {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    baseURL: env.BETTER_AUTH_URL || "http://localhost:5173",
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
        redirectURI: `${
          env.BETTER_AUTH_URL || "http://localhost:5173"
        }/api/auth/callback/google`,
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    advanced: {
      database: {
        generateId: () => {
          // IDが生成される際に、それがトークン交換のためかどうかを推測
          const id = crypto.randomUUID();
          return id;
        },
      },
      hooks: {
        after: [
          {
            matcher: (context: any) => {
              // セッション作成成功時のログ
              return context.path?.includes("/callback/google") && context.response?.status === 302;
            },
            handler: async (context: any) => {
              logPKCE("✅ Token Exchange Successful", {
                path: context.path,
                status: context.response?.status,
                description: "Authorization code was successfully exchanged for tokens using PKCE",
                result: "New session created, user authenticated"
              });
              return;
            }
          }
        ],
        before: [
          {
            matcher: (context: any) => {
              // トークン交換直前のログ
              return context.path?.includes("/callback/google") && context.query?.code;
            },
            handler: async (context: any) => {
              logPKCE("🔄 Starting Token Exchange", {
                hasAuthorizationCode: !!context.query?.code,
                hasState: !!context.query?.state,
                description: "About to exchange authorization code for tokens using stored PKCE verifier",
                tokenEndpoint: "https://oauth2.googleapis.com/token"
              });
              return;
            }
          }
        ]
      }
    },
    databaseHooks: {
      verification: {
        create: {
          before: async (verification) => {
            // PKCE: code verifierが生成・保存される時にログ出力
            if (verification.identifier && verification.value) {
              try {
                const parsedValue = JSON.parse(verification.value);
                if (parsedValue.codeVerifier) {
                  logPKCE("🔑 PKCE Code Verifier Generated", {
                    stateId: verification.identifier,
                    codeVerifier: parsedValue.codeVerifier,
                    codeVerifierLength: parsedValue.codeVerifier.length,
                    description:
                      "Code verifier generated and stored for PKCE flow",
                    expiresAt: new Date(parsedValue.expiresAt).toISOString(),
                  });

                  // Code challengeを計算（Better Authと同じロジック）
                  const encoder = new TextEncoder();
                  const encodedData = encoder.encode(parsedValue.codeVerifier);
                  const hashBuffer = await crypto.subtle.digest(
                    "SHA-256",
                    encodedData
                  );
                  const hashArray = new Uint8Array(hashBuffer);
                  const base64 = btoa(String.fromCharCode(...hashArray));
                  const codeChallenge = base64
                    .replace(/=/g, "")
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_");

                  logPKCE("🔐 PKCE Code Challenge Calculated", {
                    codeChallenge: codeChallenge,
                    codeChallengeMethod: "S256",
                    description:
                      "Code challenge will be sent to authorization server",
                  });
                }
              } catch (e) {
                // Not JSON or no codeVerifier, skip
              }
            }
            // Return void to allow the operation to proceed
            return;
          },
        },
        read: {
          after: async (verification: any) => {
            // PKCE: Code verifierが取得される時（コールバック処理時）にログ出力
            if (verification && verification.value) {
              try {
                const parsedValue = JSON.parse(verification.value);
                if (parsedValue.codeVerifier) {
                  logPKCE("🔓 PKCE Code Verifier Retrieved", {
                    stateId: verification.identifier,
                    codeVerifier: parsedValue.codeVerifier,
                    purpose:
                      "Will be used to exchange authorization code for tokens",
                    description:
                      "Validating authorization code with stored verifier",
                  });
                }
              } catch (e) {
                // Not JSON or no codeVerifier, skip
              }
            }
            // Return void to allow the operation to proceed
            return;
          },
        },
      },
    },
  });
}

// PKCEフローのログを外部から呼び出せるようにエクスポート
export { logPKCE };
