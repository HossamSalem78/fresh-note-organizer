import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { NoteService } from '../../../services/note.service';
import { TeamService } from '../../../services/team.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  name:string='';
  email:string='';
  password:string='';
  registerMessage:string='';
  messageType:'success' | 'error' | 'info'='info';
  fieldErrors:{name:boolean,email:boolean,password:boolean}={name:false,email:false,password:false};
  authService=inject(AuthService);
  router=inject(Router);
  noteService=inject(NoteService);
  teamService=inject(TeamService);

  onRegister() {
    this.clearMessages();
    this.clearFieldErrors();

    if(!this.name || !this.email || !this.password){
      this.setFieldErrors();
      this.showMessage('Please enter all fields!','error');
      return;
    }

    if(!this.isValidEmail(this.email)){
      this.isValidEmail(this.email);
      this.showMessage('Please enter a valid email!','error');
      return;
    }

    this.authService.register(this.email, this.password, this.name, (success) => {
      if(success){
        this.showMessage('Registration successful!','success');
        this.email = '';
        this.password = '';
        this.name = '';
        this.router.navigate(['/notes']);
      }else{
        this.showMessage('Registration failed!','error');
        this.fieldErrors.name=true;
        this.fieldErrors.email=true;
        this.fieldErrors.password=true;
      }
    });

  }

  private clearMessages(){
    this.registerMessage='';
    this.messageType='info';
  }
  
  private clearFieldErrors(){
    this.fieldErrors={name:false,email:false,password:false};
  }

  private setFieldErrors(){
    this.fieldErrors={name:!this.name,email:!this.email,password:!this.password};
  }
  
  private showMessage(message:string,type:'success' | 'error' | 'info'){
    this.registerMessage=message;
    this.messageType=type;
  }
  
  private isValidEmail(email:string):boolean{
    const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  onFieldFocus(field:'name' | 'email' | 'password'){
    this.fieldErrors[field]=false;
    if(this.messageType === 'error'){
      this.clearMessages();
    }
  }
}
