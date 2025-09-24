import { Component,inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { NoteService } from '../../../services/note.service';
import { NoteInterface } from '../../../models/note.interface';
import { AuthService } from '../../../services/auth.service';
import { TeamService } from '../../../services/team.service';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.css'
})

export class NoteFormComponent {
  private noteService = inject(NoteService);
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
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
    userId: ''
  };

  isEditing = false;
  noteId: string | null = null;

  ngOnInit(){
    if(!this.authService.isLoggedIn()){
      this.router.navigate(['/login']);
      return;
    }

    this.newNote.userId = this.authService.getCurrentUserId() || '';
    this.route.params.subscribe(params => {
      if(params['id']){
        this.noteId = params['id'];
        this.isEditing = true;
        this.loadNoteForEditing();
      }
    });
    this.refreshData();
  }

  private refreshData(): void {
    this.noteService.refreshData();
    this.teamService.refreshData();
  }

  // ngOnInit(){
  //   this.route.params.subscribe(params => {
  //     if(params['id']){
  //       this.noteId = params['id'];
  //       this.isEditing = true;
  //       this.loadNoteForEditing();
  //     }
  //   })
  // }

  loadNoteForEditing(){
    const userNote = this.noteService.getUserNotes().find(note => note.id === this.noteId);
    if(!userNote){
      this.router.navigate(['/notes']);
      return;
    }
    this.newNote = {...userNote, tags: userNote.tags || []};
  }

  selectedTags: string[] = [];

  get categories() {
    return this.noteService.getCategories();
  }

  get teams() {
    // return this.teamService.getUserTeams();
    const teams=this.teamService.getUserTeams();
    return teams;
  }

  get folders() {
    return this.noteService.getUserFolders();
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
