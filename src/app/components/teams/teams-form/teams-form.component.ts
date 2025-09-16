import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TeamService } from '../../../services/team.service';
import { TeamsInterface } from '../../../models/teams.interface';

@Component({
  selector: 'app-teams-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teams-form.component.html',
  styleUrl: './teams-form.component.css'
})

export class TeamsFormComponent {
  private teamService = inject(TeamService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  goBack() {
    this.router.navigate(['/teams']);
  }

  newTeam:Omit<TeamsInterface,'id'> = {
    name: '',
    members: [],
    userId: 'user1'
  };

  isEditing = false;
  teamId: string | null = null;

  ngOnInit(){
    this.route.params.subscribe(params => {
      if(params['id']){
        this.teamId = params['id'];
        this.isEditing = true;
        this.loadTeamForEditing(params['id']);
      }
    })
  }

  loadTeamForEditing(teamId: string){
    const team = this.teamService.getTeams().find(team => team.id === teamId);
    if(team){
      this.newTeam = {...team, members: team.members || []};
    }
  }

  selectedMembers: string[] = [];

  // get teams() {
  //   return this.teamService.getTeams();
  // }

  get availableMembers() {
    return this.teamService.getMembers();
  }

  onMemberToggle(memberId:string, event:any){
    if(!this.newTeam.members){
      this.newTeam.members = [];
    }

    if(event.target.checked){
      this.newTeam.members.push(memberId);
    }else{
      this.newTeam.members = this.newTeam.members.filter(id => id !== memberId);

    }
  }

  onSubmit() {
    if (this.isEditing && this.teamId) {
      this.teamService.updateTeam(this.teamId, this.newTeam);
    } else {
      this.teamService.addTeam(this.newTeam as Omit<TeamsInterface, 'id'>);
    }
    
    this.resetForm();
    this.router.navigate(['/teams']);
  }

  private resetForm() {
    this.newTeam = {
      name: '',
      members: [],
      userId: 'user1'
    };
    this.isEditing = false;
    this.teamId = null;
  }

}
