import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TeamsInterface } from '../models/teams.interface';
import { AuthService } from './auth.service';

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

  private loadAllData() {
    this.http.get<any>(`${this.apiUrl}/db`).subscribe({
      next: (data: any) => {
        this.teams.set(data.teams || []);
        this.members.set(data.members || []);
      },
      error: (error) => {
        console.error('Error loading data from API:', error);
      }
    });
  }

  getTeams() {
    return this.teams();
  }

  getMembers() {
    return this.members();
  }

  getUserTeams(){
    const currentUserId=this.authService.getCurrentUserId();
    if(!currentUserId){
      return [];
    }
    return this.teams().filter(team => team.userId === currentUserId);
  }

  addTeam(team:Omit<TeamsInterface,'id'>){
    const currentUserId=this.authService.getCurrentUserId();
    if(!currentUserId){
      return;
    }
    const userTeam={...team,userId:currentUserId}
    this.http.post<any>(`${this.apiUrl}/teams`, userTeam).subscribe({
      next:(response) => {
        this.teams.update(teams => [...teams, response.team]);
      },
      error: (error) => {
        console.error('Error adding team to API:', error);
      }
    })
  }

  updateTeam(teamId:string,updateTeam:Partial<TeamsInterface>){
    const currentUserId=this.authService.getCurrentUserId();
    if(!currentUserId){
      return;
    }
    const team=this.teams().find(team => team.id === teamId);
    if(team && team.userId !== currentUserId){
      return;
    }
    this.http.put<any>(`${this.apiUrl}/teams/${teamId}`, updateTeam).subscribe({
      next:(response) => {
        this.teams.update(teams => teams.map(team => team.id === teamId ? {...team,...response.team} : team));
      },
      error: (error) => {
        console.error('Error updating team via API:', error);
      }
    })
  }

  deleteTeam(teamId: string){
    const currentUserId=this.authService.getCurrentUserId();
    if(!currentUserId){
      return;
    }
    const team=this.teams().find(team => team.id === teamId);
    if(team && team.userId !== currentUserId){
      return;
    }
    this.http.delete<any>(`${this.apiUrl}/teams/${teamId}`).subscribe({
      next:(response) => {
        console.log('Team deleted via API:', response);
        this.teams.update(teams => teams.filter(team => team.id !== teamId));
      },
      error:(error) => {
        console.error('Error deleting team via API:', error);
      }
    })
  }
}
