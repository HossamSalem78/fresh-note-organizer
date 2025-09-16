import { Routes } from '@angular/router';
import { NoteListComponent } from './note-list.component';
import { NoteFormComponent } from './note-form/note-form.component';
import { NoteDetailsComponent } from './note-details/note-details.component';

export const noteRoutes: Routes = [
  {
    path: '',
    component: NoteListComponent
  },
  {
    path: 'note-form',
    component: NoteFormComponent
  },
  {
    path: 'note-form/:id',
    component: NoteFormComponent
  },
  {
    path: 'note-details/:id',
    component: NoteDetailsComponent
  }
];