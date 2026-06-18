import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const requireUserId = async (): Promise<string> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) {
    throw new Response("Authentication required.", { status: 401 });
  }

  return session.user.id;
};
