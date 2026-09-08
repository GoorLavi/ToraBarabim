export interface AdminFormPageProps {
  className?: string;
}

export interface AdminUserFormState {
  name: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export type AdminUserFormField = 'name' | 'email' | 'username' | 'password' | 'confirmPassword';
export type AdminUserFormErrors = Partial<Record<AdminUserFormField, string>>;
