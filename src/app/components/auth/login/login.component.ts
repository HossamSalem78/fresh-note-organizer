import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NoteService } from '../../../services/note.service';
import { TeamService } from '../../../services/team.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  email: string = '';
  password: string = '';
  loginMessage: string = '';
  messageType:'success' | 'error' | 'info'='info';
  fieldErrors:{email:boolean,password:boolean}={email:false,password:false};
  router=inject(Router);
  authService=inject(AuthService);
  noteService=inject(NoteService);
  teamService=inject(TeamService);

  onLogin() {
    this.clearMessages();
    this.clearFieldErrors();
    
    if (!this.email || !this.password) {
      this.setFieldErrors();
      this.showMessage('Please enter both email and password!','error');
      return;
    }

    if(!this.isValidEmail(this.email)){
      this.fieldErrors.email=true;
      this.isValidEmail(this.email);
      this.showMessage('Please enter a valid email!','error');
      return;
    }
    
    this.authService.login(this.email, this.password, (success) => {
      if (success) {
        this.showMessage('Login successful!','success');
        this.refreshUserData();
        this.email = '';
        this.password = '';
        setTimeout(() => {
          this.router.navigate(['/notes']);
        },100);
      } else {
        this.showMessage('Login failed!','error');
        this.fieldErrors.password=true;
        this.fieldErrors.email=true;
      }
    });
  }

  private refreshUserData(){
    this.noteService.refreshData();
    this.teamService.refreshData();
  }

  private clearMessages(){
    this.loginMessage='';
    this.messageType='info';
  }

  private clearFieldErrors(){
    this.fieldErrors={email:false,password:false};
  }

  private setFieldErrors(){
    this.fieldErrors={email:!this.email,password:!this.password};
  }

  private showMessage(message:string,type:'success' | 'error' | 'info'){
    this.loginMessage=message;
    this.messageType=type;
  }

  private isValidEmail(email:string):boolean{
    const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onFieldFocus(field:'email' | 'password'){
    this.fieldErrors[field]=false;
    if(this.messageType === 'error'){
      this.clearMessages();
    }
  }

  onEmailInput(){
    if(this.email && !this.isValidEmail(this.email)){
      this.fieldErrors.email=true;
    }else{
      this.fieldErrors.email=false;
    }
  }
}