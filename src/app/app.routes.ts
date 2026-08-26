import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { WhatsappEmbudo } from './components/whatsapp-embudo/whatsapp-embudo';
import { authGuardGuard } from './guards/auth-guard-guard';
import { Register } from './components/register/register';
import { ContactsPage } from './components/contacts-page/contacts-page';
import { Home } from './components/home/home';
import { UserManagement } from './components/user-management/user-management';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [

    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: Login},
    {path: 'registro', component: Register},
    {path: 'home', component: Home, canActivate: [authGuardGuard]},
    {path: 'whatsapp-embudo', component: ContactsPage, canActivate: [authGuardGuard, roleGuard], data: { roles: ['ROLE_ADMIN', 'ROLE_VENDEDOR', 'ROLE_PUBLICISTA']}},
    {path: 'user-management', component: UserManagement, canActivate: [authGuardGuard, roleGuard], data: { roles: ['ROLE_ADMIN']}}
];
