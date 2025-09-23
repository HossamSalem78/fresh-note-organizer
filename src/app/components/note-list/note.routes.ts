import { Routes } from '@angular/router';

import { NoteListComponent } from './note-list.component';
import { NoteFormComponent } from './note-form/note-form.component';
import { NoteDetailsComponent } from './note-details/note-details.component';
import { AuthGuard } from '../../guards/auth.guard';
import { noteGuard } from '../../guards/note.guard';

export const noteRoutes: Routes = [
  {
    path: '',
    component: NoteListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'note-form',
    component: NoteFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'note-form/:id',
    component: NoteFormComponent,
    canActivate: [noteGuard]
  },
  {
    path: 'note-details/:id',
    component: NoteDetailsComponent,
    canActivate: [noteGuard]
  }
];