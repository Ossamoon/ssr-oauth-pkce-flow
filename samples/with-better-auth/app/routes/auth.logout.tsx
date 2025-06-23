import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { createAuth } from "../lib/auth";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = createAuth(context.cloudflare.env);
  const response = await auth.api.signOut({
    headers: request.headers,
    asResponse: true, // This ensures we get a Response object with headers
  });
  
  return redirect("/", {
    headers: response.headers,
  });
}