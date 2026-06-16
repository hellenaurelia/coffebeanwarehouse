export type Role = "owner" | "kasir" | "gudang" | "manajer";
export type Status = "aktif" | "nonaktif";
export type Outlet = "Senopati";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  outlet: Outlet;
  status: Status;
  lastLogin: string;
  avatar: string;
}

export type UserForm = Omit<User, "id" | "avatar" | "lastLogin"> & {
  password: string;
};