import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { TeamsInterface } from '../../models/teams.interface';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.css'
})
export class TeamsComponent {
  private teamService = inject(TeamService);
  private router = inject(Router);
  
  get teams() {
    return this.teamService.getTeams();
  }

  // editTeam(team: TeamsInterface){
  //   this.router.navigate(['/teams/team-form', team.id]);
  // }

  deleteTeam(teamId: string){
    if(confirm('Are you sure you want to delete this team?')){
      this.teamService.deleteTeam(teamId);
    }
  }

  getMemberName(memberId: string): string {
    const tag = this.teamService.getMembers().find(member => member.id === memberId);
    return tag ? tag.name : memberId;
  }

}
