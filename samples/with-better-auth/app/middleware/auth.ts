import { redirect } from "react-router";
import { getSession } from "../lib/session.server";
import type { LoaderFunctionArgs } from "react-router";

export async function requireAuth(args: LoaderFunctionArgs) {
  const session = await getSession(args);
  
  if (!session) {
    throw redirect("/login");
  }
  
  return session;
}