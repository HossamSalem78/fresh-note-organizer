import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { NoteService } from '../../services/note.service';
import { NoteInterface } from '../../models/note.interface';
import { FoldersComponent } from "../folders/folders.component";


@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, FoldersComponent],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.css'
})

export class NoteListComponent {
  private noteService = inject(NoteService);
  private router = inject(Router);

  searchTerm = '';
  sortBy='title';
  selectedCategory='';
  selectedFolder='';
  selectedTeam='';
  selectedTags: string[] = [];

  get notes() {
    const allNotes = this.noteService.getNotes();

    let filteredNotes = allNotes;
    if (this.selectedCategory){
      filteredNotes=allNotes.filter(note => note.categoryId === this.selectedCategory);
    }
    if (this.selectedFolder){
      filteredNotes=filteredNotes.filter(note => note.folderId === this.selectedFolder);
    }
    if (this.selectedTeam){
      filteredNotes=filteredNotes.filter(note => note.teamId === this.selectedTeam);
    }
    if (this.selectedTags.length > 0){
      filteredNotes=filteredNotes.filter(note => note.tags?.some(tag => this.selectedTags.includes(tag)));
    }
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.trim().toLowerCase();
      filteredNotes=filteredNotes.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower)
      );
    }
    return this.sortNotes(filteredNotes);
    
  }

  private sortNotes(notes: NoteInterface[]):NoteInterface[]{
    return notes.sort((a, b) => {
      switch(this.sortBy){
        case 'title':
          return a.title.localeCompare(b.title);
        case 'folder':
          const folderA = this.getFolderName(a.folderId);
          const folderB = this.getFolderName(b.folderId);
          return folderA.localeCompare(folderB);
        case 'category':
          const categoryA = this.getCategoryName(a.categoryId);
          const categoryB = this.getCategoryName(b.categoryId);
          return categoryA.localeCompare(categoryB);
        case 'team':
          const teamA = this.getTeamName(a.teamId);
          const teamB = this.getTeamName(b.teamId);
          return teamA.localeCompare(teamB);
        default:
          return 0;
      }
    })
  }

  clearFilters(){
    this.selectedCategory = '';
    // this.selectedFolder = '';
    this.selectedTeam = '';
    this.selectedTags = [];
  }

  clearSearch(){
    this.searchTerm = '';
  }

  onSortChange(event:Event){
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
  }

  onCategoryChange(event:Event){
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
  }

  onFolderSelected(folderId: string) {
    this.selectedFolder = folderId;
  }

  onTeamChange(event:Event){
    const target = event.target as HTMLSelectElement;
    this.selectedTeam = target.value;
  }

  onTagChange(tagId:string, event:Event){
    const target = event.target as HTMLInputElement;
    if(target.checked){
      this.selectedTags.push(tagId);
    }else{
      this.selectedTags = this.selectedTags.filter(id => id !== tagId);
    }
  }

  get categories() {
    return this.noteService.getCategories();
  }

  get teams() {
    return this.noteService.getTeams();
  }

  get folders() {
    return this.noteService.getFolders();
  }

  get tags() {
    return this.noteService.getTags();
  }

  editNote(note: NoteInterface){
    this.router.navigate(['/notes/note-form', note.id]);
  }

  deleteNote(noteId: string){
    if(confirm('Are you sure you want to delete this note?')){
      this.noteService.deleteNote(noteId);
    }
  }

  getTagName(tagId: string): string {
    const tag = this.noteService.getTags().find(tag => tag.id === tagId);
    return tag ? tag.name : tagId;
  }

  getCategoryName(categoryId: string | undefined): string {
    if(!categoryId) return '';
    const category = this.noteService.getCategories().find(category => category.id === categoryId);
    return category ? category.name : categoryId;
  }

  getTeamName(teamId: string | undefined): string {
    if(!teamId) return '';
    const team = this.noteService.getTeams().find(team => team.id === teamId);
    return team ? team.name : teamId;
  }

  getFolderName(folderId: string | undefined): string {
    if(!folderId) return '';
    const folder = this.noteService.getFolders().find(folder => folder.id === folderId);
    return folder ? folder.name : folderId;
  }

}
