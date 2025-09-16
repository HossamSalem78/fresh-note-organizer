import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { TeamsInterface } from '../models/teams.interface';


@Injectable({
  providedIn: 'root'
})

export class TeamService {

  private teams = signal<any[]>([]);
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

  addTeam(team:Omit<TeamsInterface,'id'>){
    this.http.post<any>(`${this.apiUrl}/teams`, team).subscribe({
      next:(response) => {
        this.teams.update(teams => [...teams, response.team]);
      },
      error: (error) => {
        console.error('Error adding team to API:', error);
      }
    })
  }

  updateTeam(teamId:string,updateTeam:Partial<TeamsInterface>){
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
