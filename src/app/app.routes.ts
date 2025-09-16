import { Routes } from '@angular/router';
import { TeamsComponent } from './components/teams/teams.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/notes',
        pathMatch: 'full'
    },
    {
        path: 'notes',
        loadChildren: () => import('./components/note-list/note.routes').then(m => m.noteRoutes)

    },
    {
        path: 'teams',
        loadChildren: () => import('./components/teams/teams.routes').then(m => m.noteRoutes)
    },
];
