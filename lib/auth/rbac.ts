import { getSession } from "./session";

export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized" };
  }

  if (!allowedRoles.includes(session.role)) {
    return { authorized: false, error: "Forbidden" };
  }

  return { authorized: true, user: session };
}
