export type RoleName = 'ROLE_ADMIN' | 'ROLE_PUBLICISTA' | 'ROLE_VENDEDOR' | 'ROLE_USER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
  active: boolean;
}