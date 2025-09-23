import { Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },{
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'notes',
        loadChildren: () => import('./components/note-list/note.routes').then(m => m.noteRoutes),
        canActivate: [AuthGuard]

    },
    {
        path: 'teams',
        loadChildren: () => import('./components/teams/teams.routes').then(m => m.noteRoutes),
        canActivate: [AuthGuard]
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/login'
    }
];
