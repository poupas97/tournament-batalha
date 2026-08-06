import { UserRole } from "@/generated/prisma";

export type IUserFormValues = {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

export type UserBEResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

export type IUserPasswordFormValues = {
  actual: string;
  password: string;
  confirm: string;
};
