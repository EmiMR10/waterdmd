import "server-only";

import { cookies } from "next/headers";

type SessionUser = {
  id: number;
  email: string;
  name: string | null;
  role: "guest" | "host";
};

export async function requireUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("waterdmd_user");

  if (!sessionCookie?.value) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const user = JSON.parse(
      sessionCookie.value
    ) as SessionUser;

    if (!user.id || !user.email) {
      throw new Error("UNAUTHORIZED");
    }

    return user;
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}
