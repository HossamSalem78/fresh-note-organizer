import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from "./components/header/header.component";
import { NoteListComponent } from './components/note-list/note-list.component';
import { NoteFormComponent } from './components/note-list/note-form/note-form.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NoteListComponent, NoteFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fresh-note-organizer');
}
