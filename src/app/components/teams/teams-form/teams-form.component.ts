import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TeamService } from '../../../services/team.service';
import { TeamsInterface } from '../../../models/teams.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teams-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teams-form.component.html',
  styleUrl: './teams-form.component.css'
})

export class TeamsFormComponent {
  private teamService = inject(TeamService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(){
    if(!this.authService.isLoggedIn()){
      this.router.navigate(['/login']);
      return;
    }
    this.route.params.subscribe(params => {
      if(params['id']){
        this.teamId = params['id'];
        this.isEditing = true;
        this.loadTeamForEditing();
      }
    })
  }

  goBack() {
    this.router.navigate(['/teams']);
  }

  newTeam:Omit<TeamsInterface,'id' | 'userId'> = {
    name: '',
    members: []
  };

  isEditing = false;
  teamId: string | null = null;

  loadTeamForEditing(){
    const userTeam = this.teamService.getUserTeams().find(team => team.id === this.teamId);
    if(!userTeam){
      this.router.navigate(['/teams']);
      return;
    }
    this.newTeam = {...userTeam, members: userTeam.members || []};
  }

  selectedMembers: string[] = [];

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
      this.teamService.addTeam(this.newTeam as Omit<TeamsInterface, 'id' | 'userId'>);
    }
    
    this.resetForm();
    this.router.navigate(['/teams']);
  }

  private resetForm() {
    this.newTeam = {
      name: '',
      members: []
    };
    this.isEditing = false;
    this.teamId = null;
  }

}
