import { Routes } from '@angular/router';
import { TeamsComponent } from './teams.component';
import { TeamsFormComponent } from './teams-form/teams-form.component';

export const noteRoutes: Routes = [
  {
    path: '',
    component: TeamsComponent
  },
  {
    path: 'team-form',
    component: TeamsFormComponent
  },
  {
    path: 'team-form/:id',
    component: TeamsFormComponent
  }
];