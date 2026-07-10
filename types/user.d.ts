export type IUserFormValues = {
  name: string;
  email: string;
  password?: string;
};

export type UserBEResponse = {
  id: number;
  name: string;
  email: string;
  password?: string;
};

export type IUserPasswordFormValues = {
  actual: string;
  password: string;
  confirm: string;
};
