import "server-only";

import { auth } from "@/auth";
import { getOrCreateUser } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  const account = session?.user;
  const email = account?.email;
  if (!account || !email) throw new Error("UNAUTHORIZED");
  const id = await getOrCreateUser(email, account.name, account.image);
  return { id, email, name: account.name ?? "Viajero" };
}
