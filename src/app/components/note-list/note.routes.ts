import { Routes } from '@angular/router';
import { NoteListComponent } from './note-list.component';
import { NoteFormComponent } from './note-form/note-form.component';

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
  }
];