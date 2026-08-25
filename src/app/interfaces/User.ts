export type RoleName = 'ROLE_ADMIN' | 'ROLE_PUBLICISTA' | 'ROLE_VENDEDOR' | 'ROLE_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: RoleName[];
  enabled: boolean;
}