import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { WhatsappEmbudo } from './components/whatsapp-embudo/whatsapp-embudo';
import { authGuardGuard } from './guards/auth-guard-guard';
import { Register } from './components/register/register';
import { ContactsPage } from './components/contacts-page/contacts-page';
import { Home } from './components/home/home';
import { UserManagement } from './components/user-management/user-management';
import { roleGuard } from './guards/role-guard';
import { Unauthorized } from './components/unauthorized/unauthorized';
import { Visit } from './components/visit/visit';
import { loginRedirectGuard } from './guards/login-redirect-guard';
import { ContactManagement } from './components/contact-management/contact-management';

export const routes: Routes = [

    {path: '', canActivate: [loginRedirectGuard], component: Login},
    {path: 'login', component: Login},
    {path: 'registro', component: Register},
    {path: 'home', component: Home, canActivate: [authGuardGuard]},
    {path: 'whatsapp-embudo', component: ContactsPage, canActivate: [authGuardGuard, roleGuard], data: { roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_PUBLICISTA']}},
    {path: 'visit', component: Visit, canActivate: [authGuardGuard, roleGuard], data: { roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR']}},
    {path: 'contact-management', component: ContactManagement, canActivate: [authGuardGuard, roleGuard], data: { roles: ['ROLE_ADMIN', 'ROLE_PUBLICISTA']}},
    {path: 'centro-control', component: UserManagement, canActivate: [authGuardGuard, roleGuard], data: { roles: ['ROLE_ADMIN', 'ROLE_PUBLICISTA']}},
    {path: 'unauthorized', component: Unauthorized}
];
