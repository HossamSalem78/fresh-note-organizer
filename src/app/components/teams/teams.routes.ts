import { Routes } from '@angular/router';

import { TeamsComponent } from './teams.component';
import { TeamsFormComponent } from './teams-form/teams-form.component';
import { AuthGuard } from '../../guards/auth.guard';
import { teamGuard } from '../../guards/team.guard';

export const noteRoutes: Routes = [
  {
    path: '',
    component: TeamsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'team-form',
    component: TeamsFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'team-form/:id',
    component: TeamsFormComponent,
    canActivate: [teamGuard]
  }
];