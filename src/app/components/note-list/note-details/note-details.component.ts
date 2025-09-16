import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NoteService } from '../../../services/note.service';
import { NoteInterface } from '../../../models/note.interface';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './note-details.component.html',
  styleUrl: './note-details.component.css'
})

export class NoteDetailsComponent implements OnInit {
  private noteService = inject(NoteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  note: NoteInterface | null = null;
  noteId: string | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.noteId = params['id'];
      if (this.noteId) {
        this.loadNote(this.noteId);
      }
    });
  }

  private loadNote(noteId: string) {
    const note = this.noteService.getNotes().find(n => n.id === noteId);
    if (note) {
      this.note = note;
    } else {
      // Note not found, redirect to notes list
      this.router.navigate(['/notes']);
    }
  }

  // editNote() {
  //   if (this.noteId) {
  //     this.router.navigate(['/notes/note-form', this.noteId]);
  //   }
  // }

  deleteNote() {
    if (this.noteId && confirm('Are you sure you want to delete this note?')) {
      this.noteService.deleteNote(this.noteId);
      this.router.navigate(['/notes']);
    }
  }

  goBack() {
    this.router.navigate(['/notes']);
  }

  getTagName(tagId: string): string {
    const tag = this.noteService.getTags().find(tag => tag.id === tagId);
    return tag ? tag.name : tagId;
  }

  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return 'No category';
    const category = this.noteService.getCategories().find(category => category.id === categoryId);
    return category ? category.name : categoryId;
  }

  getTeamName(teamId: string | undefined): string {
    if (!teamId) return 'No team';
    const team = this.noteService.getTeams().find(team => team.id === teamId);
    return team ? team.name : teamId;
  }

  getFolderName(folderId: string | undefined): string {
    if (!folderId) return 'No folder';
    const folder = this.noteService.getFolders().find(folder => folder.id === folderId);
    return folder ? folder.name : folderId;
  }
}