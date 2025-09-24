import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { TeamsInterface } from '../models/teams.interface';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

interface ApiResponse<T>{
  success: boolean;
  message: string;
  data: T;
}
@Injectable({
  providedIn: 'root'
})

export class TeamService {
  private teams = signal<TeamsInterface[]>([]);

  public readonly teamsList=this.teams.asReadonly();
  private authService = inject(AuthService);

  private members = signal<any[]>([]);
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
  //   })
  // }

  private loadAllData(){
    if(this.authService.isLoggedIn()){
      this.loadTeams();
    }
    this.loadMembers();
  }

  // private loadAllData() {
  //   this.http.get<any>(`${this.apiUrl}/db`).subscribe({
  //     next: (data: any) => {
  //       this.teams.set(data.teams || []);
  //       this.members.set(data.members || []);
  //     },
  //     error: (error) => {
  //       console.error('Error loading data from API:', error);
  //     }
  //   });
  // }

  private loadTeams(){
    this.http.get<ApiResponse<TeamsInterface[]>>(`${this.apiUrl}/teams`,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.teams.set(response.data);
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  private loadMembers(): void {
    this.http.get<any>(`${this.apiUrl}/db`).subscribe({
      next: (data: any) => {
        this.members.set(data.members || []);
      },
      error: (error) => {
        // console.error('Error loading members:', error);
      }
    });
  }

  getTeams():TeamsInterface[]{
    return this.teams();
  }

  getMembers() {
    return this.members();
  }

  getUserTeams():TeamsInterface[]{
    return this.teams();
  }

  // getUserTeams(){
  //   const currentUserId=this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     return [];
  //   }
  //   return this.teams().filter(team => team.userId === currentUserId);
  // }

  addTeam(team:Omit<TeamsInterface,'id' | 'userId'>){
    if(!this.authService.isLoggedIn()){
      console.error('Cannot add team: No user logged in');
      return;
    }
    console.log('🔄 TeamService: Adding team:', team);
    
    this.http.post<ApiResponse<TeamsInterface>>(`${this.apiUrl}/teams`, team,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        console.log('✅ TeamService: Team added successfully:', response);
        if(response.success){
          this.teams.update(teams => [...teams, response.data]);
          console.log('🔍 Teams after adding:', this.teams());
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
    
  }

  // addTeam(team:Omit<TeamsInterface,'id'>){
  //   const currentUserId=this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     return;
  //   }
  //   const userTeam={...team,userId:currentUserId}
  //   this.http.post<any>(`${this.apiUrl}/teams`, userTeam).subscribe({
  //     next:(response) => {
  //       this.teams.update(teams => [...teams, response.team]);
  //     },
  //     error: (error) => {
  //       console.error('Error adding team to API:', error);
  //     }
  //   })
  // }

  updateTeam(teamId:string,updateTeam:Partial<TeamsInterface>){
    if(!this.authService.isLoggedIn()){
      return;
    }

    this.http.put<ApiResponse<TeamsInterface>>(`${this.apiUrl}/teams/${teamId}`, updateTeam,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.teams.update(teams => teams.map(team => team.id === teamId ? response.data : team));
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
    
  }

  // updateTeam(teamId:string,updateTeam:Partial<TeamsInterface>){
  //   const currentUserId=this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     return;
  //   }
  //   const team=this.teams().find(team => team.id === teamId);
  //   if(team && team.userId !== currentUserId){
  //     return;
  //   }
  //   this.http.put<any>(`${this.apiUrl}/teams/${teamId}`, updateTeam).subscribe({
  //     next:(response) => {
  //       this.teams.update(teams => teams.map(team => team.id === teamId ? {...team,...response.team} : team));
  //     },
  //     error: (error) => {
  //       console.error('Error updating team via API:', error);
  //     }
  //   })
  // }

  deleteTeam(teamId:string){
    if(!this.authService.isLoggedIn()){
      return;
    }

    this.http.delete<ApiResponse<TeamsInterface>>(`${this.apiUrl}/teams/${teamId}`,{headers:this.getHeaders()}).subscribe({
      next:(response) => {
        if(response.success){
          this.teams.update(teams => teams.filter(team => team.id !== teamId));
        }
      },
      error:(error) => {
        if(error.status === 401){
          this.authService.logout();
        }
      }
    });
  }

  // deleteTeam(teamId: string){
  //   const currentUserId=this.authService.getCurrentUserId();
  //   if(!currentUserId){
  //     return;
  //   }
  //   const team=this.teams().find(team => team.id === teamId);
  //   if(team && team.userId !== currentUserId){
  //     return;
  //   }
  //   this.http.delete<any>(`${this.apiUrl}/teams/${teamId}`).subscribe({
  //     next:(response) => {
  //       console.log('Team deleted via API:', response);
  //       this.teams.update(teams => teams.filter(team => team.id !== teamId));
  //     },
  //     error:(error) => {
  //       console.error('Error deleting team via API:', error);
  //     }
  //   })
  // }

  refreshData(){
    this.loadAllData();
  }
}
