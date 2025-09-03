import { Component,inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { NoteService } from '../../../services/note.service';
import { NoteInterface } from '../../../models/note.interface';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.css'
})

export class NoteFormComponent {
  private noteService = inject(NoteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  goBack() {
    this.router.navigate(['/notes']);
  }

  newNote:Omit<NoteInterface,'id'> = {
    title: '',
    content: '',
    tags: [],
    categoryId: '',
    teamId: '',
    folderId: '',
    userId: 'user1'
  };

  isEditing = false;
  noteId: string | null = null;

  ngOnInit(){
    this.route.params.subscribe(params => {
      if(params['id']){
        this.noteId = params['id'];
        this.isEditing = true;
        this.loadNoteForEditing(params['id']);
      }
    })
  }

  loadNoteForEditing(noteId: string){
    const note = this.noteService.getNotes().find(note => note.id === noteId);
    if(note){
      this.newNote = {...note, tags: note.tags || []};
    }
  }

  selectedTags: string[] = [];

  get categories() {
    return this.noteService.getCategories();
  }

  get teams() {
    return this.noteService.getTeams();
  }

  get folders() {
    return this.noteService.getFolders();
  }

  get availableTags() {
    return this.noteService.getTags();
  }
  
  

  onTagToggle(tagId:string, event:any){
    if(!this.newNote.tags){
      this.newNote.tags = [];
    }

    if(event.target.checked){
      this.newNote.tags.push(tagId);
    }else{
      this.newNote.tags = this.newNote.tags.filter(id => id !== tagId);

    }
  }

  onSubmit() {
    if (this.isEditing && this.noteId) {
      this.noteService.updateNote(this.noteId, this.newNote);
    } else {
      this.noteService.addNote(this.newNote as Omit<NoteInterface, 'id'>);
    }
    
    this.resetForm();
    this.router.navigate(['/notes']);
  }

  private resetForm() {
    this.newNote = {
      title: '',
      content: '',
      tags: [],
      categoryId: '',
      teamId: '',
      folderId: '',
      userId: 'user1'
    };
    this.isEditing = false;
    this.noteId = null;
  }
}
