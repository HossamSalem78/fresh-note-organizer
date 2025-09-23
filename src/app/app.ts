import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { HeaderComponent } from "./components/header/header.component";
import { NoteService } from './services/note.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App{
  noteService=inject(NoteService);
  router=inject(Router);

  
}
