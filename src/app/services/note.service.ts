import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { NoteInterface } from '../models/note.interface';
import { TeamService } from './team.service';
import { FolderInterface } from '../models/folder.interface';

@Injectable({
  providedIn: 'root'
})

export class NoteService {

  private notes = signal<NoteInterface[]>([]);
  private categories = signal<any[]>([]);
  private teams = inject(TeamService);
  private folders = signal<any[]>([]);
  private tags = signal<any[]>([]);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  constructor(){
    this.loadAllData();
  };

  private loadAllData() {
    this.http.get<any>(`${this.apiUrl}/db`).subscribe({
      next: (data: any) => {
        this.notes.set(data.notes || []);
        this.categories.set(data.categories || []);
        this.tags.set(data.tags || []);
        this.teams.getTeams();
        this.folders.set(data.folders || []);
      },
      error: (error) => {
        console.error('Error loading data from API:', error);
      }
    });
  }

  getNotes() {
    return this.notes();
  }

  getCategories() {
    return this.categories();
  }

  getTeams() {
    return this.teams.getTeams();
  }

  getFolders() {
    return this.folders();
  }

  getTags() {
    return this.tags();
  }
  
  addNote(note:Omit<NoteInterface,'id'>){
    this.http.post<any>(`${this.apiUrl}/notes`, note).subscribe({
      next:(response) => {
        this.notes.update(notes => [...notes, response.note]);
      },
      error: (error) => {
        console.error('Error adding note to API:', error);
      }
    })
  }

  updateNote(noteId:string,updateNote:Partial<NoteInterface>){
    this.http.put<any>(`${this.apiUrl}/notes/${noteId}`, updateNote).subscribe({
      next:(response) => {
        this.notes.update(notes => notes.map(note => note.id === noteId ? {...note,...response.note} : note));
      },
      error: (error) => {
        console.error('Error updating note via API:', error);
      }
    })
  }

  deleteNote(noteId: string){
    this.http.delete<any>(`${this.apiUrl}/notes/${noteId}`).subscribe({
      next:(response) => {
        console.log('Note deleted via API:', response);
        this.notes.update(notes => notes.filter(note => note.id !== noteId));
      },
      error:(error) => {
        console.error('Error deleting note via API:', error);
      }
    })
  }

  addFolder(folder:Omit<FolderInterface,'id'>){
    this.http.post<any>(`${this.apiUrl}/folders`, folder).subscribe({
      next:(response) => {
        this.folders.update(folders => [...folders, response.folder]);
      },
      error:(error) => {
        console.error('Error adding folder via API:', error);
      }
    })
  }

  private generateId(): string {
    return Date.now().toString();
  }
}