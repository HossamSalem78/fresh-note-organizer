import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NoteInterface } from '../models/note.interface';
import { TeamService } from './team.service';
import { FolderInterface } from '../models/folder.interface';
import { AuthService } from './auth.service';

interface ApiResponse<T>{
  success: boolean;
  message: string;
  data: T;
}
@Injectable({
  providedIn: 'root'
})

export class NoteService {
  private notes = signal<NoteInterface[]>([]);
  public readonly notesList = this.notes.asReadonly();
  private authService = inject(AuthService);
  private categories = signal<any[]>([]);
  private teams = inject(TeamService);
  private folders = signal<FolderInterface[]>([]);
  private tags = signal<any[]>([]);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  constructor(){
    this.loadAllData();
  };

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    
    if (!token) {
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return headers;
  }

  // private getHeaders():HttpHeaders{
  //   const token=this.authService.getAccessToken();
  //   return new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': token ? `Bearer ${token}` : ''
  //   });
  // }

  private loadAllData(){
    if(this.authService.isLoggedIn()){
      this.loadNotes();
      this.loadFolders();
    }
    this.loadStaticData();
    this.teams.getTeams();
  }

  private loadNotes(){
    this.http.get<ApiResponse<NoteInterface[]>>(`${this.apiUrl}/notes`,
      {headers: this.getHeaders()}
    ).subscribe({
      next:(response) => {
        console.log('✅ NoteService: Notes loaded successfully:', response);
        if(response.success){

          this.notes.set(response.data);
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  private loadFolders(){
    this.http.get<ApiResponse<FolderInterface[]>>(`${this.apiUrl}/folders`,
      {headers: this.getHeaders()}
    ).subscribe({
      next:(response) => {
        if(response.success){
          this.folders.set(response.data);
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  private loadStaticData(){
    this.http.get<ApiResponse<any>>(`${this.apiUrl}/db`).subscribe({
      next:(data:any) => {
        this.categories.set(data.categories || []);
        this.tags.set(data.tags || []);
      },
      error:(error) => {
        // console.error('Error loading static data:', error);
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

  getUserNotes():NoteInterface[]{
    return this.notes();
  }

  // getUserNotes(){
  //   const userId = this.authService.getCurrentUserId();
  //   if(!userId){
  //     return [];
  //   }
  //   return this.notes().filter(note => note.userId === userId);
  // }

  getUserFolders():FolderInterface[]{
    return this.folders();
  }

  // getUserFolders(){
  //   const userId = this.authService.getCurrentUserId();
  //   if(!userId){
  //     return [];
  //   }
  //   return this.folders().filter(folder => folder.userId === userId);
  // }

  addNote(note:Omit<NoteInterface,'id' | 'userId'>){
    if(!this.authService.isLoggedIn()){
      return;
    }

    this.http.post<ApiResponse<NoteInterface>>(`${this.apiUrl}/notes`, note,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.notes.update(notes => [...notes, response.data]);
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }
  
  // addNote(note:Omit<NoteInterface,'id' | 'userId'>){
  //   const currentUserId = this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     console.error('Cannot add note: No user logged in');
  //     return;
  //   }
  //   const userNote = {...note, userId: currentUserId};
  //   this.http.post<any>(`${this.apiUrl}/notes`, userNote).subscribe({
  //     next:(response) => {
  //       this.notes.update(notes => [...notes, response.note]);
  //     },
  //     error: (error) => {
  //       console.error('Error adding note to API:', error);
  //     }
  //   });
  // }

  updateNote(noteId:string,updateNote:Partial<NoteInterface>){
    if(!this.authService.isLoggedIn()){
      return;
    }

    this.http.put<ApiResponse<NoteInterface>>(`${this.apiUrl}/notes/${noteId}`, updateNote,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.notes.update(notes => notes.map(note => note.id === noteId ? response.data : note));
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  // updateNote(noteId:string,updateNote:Partial<NoteInterface>){
  //   const currentUserId = this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     console.error('Cannot update note: No user logged in');
  //     return;
  //   }
  //   const note = this.notes().find(note => note.id === noteId);
  //   if(note && note.userId !== currentUserId){
  //     console.error('Cannot update note: User does not own this note');
  //     return;
  //   }
  //   this.http.put<any>(`${this.apiUrl}/notes/${noteId}`, updateNote).subscribe({
  //     next:(response) => {
  //       this.notes.update(notes => notes.map(note => note.id === noteId ? {...note,...response.note} : note));
  //     },
  //     error: (error) => {
  //       console.error('Error updating note via API:', error);
  //     }
  //   });
  // }

  deleteNote(noteId:string){
    if(!this.authService.isLoggedIn()){
      return;
    }

    this.http.delete<ApiResponse<NoteInterface>>(`${this.apiUrl}/notes/${noteId}`,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.notes.update(notes => notes.filter(note => note.id !== noteId));
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  // deleteNote(noteId: string){
  //   const currentUserId = this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     console.error('Cannot delete note: No user logged in');
  //     return;
  //   }
  //   const note = this.notes().find(note => note.id === noteId);
  //   if(note && note.userId !== currentUserId){
  //     console.error('Cannot delete note: User does not own this note');
  //     return;
  //   }
  //   this.http.delete<any>(`${this.apiUrl}/notes/${noteId}`).subscribe({
  //     next:(response) => {
  //       console.log('Note deleted via API:', response);
  //       this.notes.update(notes => notes.filter(note => note.id !== noteId));
  //     },
  //     error:(error) => {
  //       console.error('Error deleting note via API:', error);
  //     }
  //   });
  // }

  addFolder(folder:Omit<FolderInterface,'id' | 'userId'>){
    if(!this.authService.isLoggedIn()){
      return;
    }

    this.http.post<ApiResponse<FolderInterface>>(`${this.apiUrl}/folders`, folder,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.folders.update(folders => [...folders, response.data]);
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  // addFolder(folder:Omit<FolderInterface,'id' | 'userId'>){
  //   const currentUserId = this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     console.error('Cannot add folder: No user logged in');
  //     return;
  //   }
  //   const userFolder = {...folder, userId: currentUserId};
  //   this.http.post<any>(`${this.apiUrl}/folders`, userFolder).subscribe({
  //     next:(response) => {
  //       this.folders.update(folders => [...folders, response.folder]);
  //     },
  //     error:(error) => {
  //       console.error('Error adding folder via API:', error);
  //     }
  //   });
  // }

  private generateId(): string {
    return Date.now().toString();
  }

  refreshData(){
    this.loadAllData();
  }
}