import { Component, inject } from '@angular/core';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent {
  private noteService = inject(NoteService);

  get teams() {
    return this.noteService.getTeams();
  }

}
