import { createAuth } from "./auth";
import type { LoaderFunctionArgs } from "react-router";

export async function getSession({ request, context }: LoaderFunctionArgs) {
  const auth = createAuth(context.cloudflare.env);
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
}