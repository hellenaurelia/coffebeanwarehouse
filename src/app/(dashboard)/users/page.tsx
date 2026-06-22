import { getUsers } from "./_data/repository";
import UsersClient from "./_components/users-client";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient initialUsers={users} />;
}
