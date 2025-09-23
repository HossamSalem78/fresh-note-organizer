import {inject, Injectable, signal} from '@angular/core';
import { UserInterface } from '../models/user.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<UserInterface | null>(null);
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api';

  public readonly user = this.currentUser.asReadonly();

  constructor(){
    this.loadUserFromStorage();
  }

  private loadUserFromStorage():void{
    const savedUser=localStorage.getItem('currentUser');
    if(savedUser){
      try{
        const user=JSON.parse(savedUser);
        this.currentUser.set(user);
      }catch(error){
        localStorage.removeItem('currentUser');
      }
    }
  }

  private generateId(): string {
    return Date.now().toString();
  }

  isLoggedIn(){
    return this.currentUser() !== null;
  }

  login(email: string, password: string, callback?: (success: boolean) => void){
    this.http.get<any>(`${this.apiUrl}/db`).subscribe({
      next:(response) => {
        const users=response.users || [];
        const user=users.find((user:UserInterface) => user.email === email && user.password === password);
        
        if(user){
          const userObj:UserInterface={
            id:user.id,
            name:user.username,
            email:user.email,
            password:user.password
          }
          this.currentUser.set(userObj);
          localStorage.setItem('currentUser',JSON.stringify(userObj));
          if(callback) callback(true);
        }else{
          if(callback) callback(false);
        }
      },
      error:(error) => {
        console.error('Error logging in:', error);
        if(callback) callback(false);
      }
    });
  }

  logout():void{
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  register(email: string, password: string, name: string, callback?: (success: boolean) => void){
    if(!email || !password || !name){
      if(callback) callback(false);
      return;
    }

    this.http.get<any>(`${this.apiUrl}/db`).subscribe({
      next:(response) => {
        const users=response.users || [];
        const existingUser=users.find((user:UserInterface) => user.email === email);

        if(existingUser){
          if(callback) callback(false);
          return;
        }

        const newUser = {
          id:this.generateId(),
          username:name,
          email:email,
          password:password
        };

        const updatedUsers=[...users, newUser];
        const updatedDb={...response, users:updatedUsers};

        this.http.put<any>(`${this.apiUrl}/db`,updatedDb).subscribe({
          next:(response) => {
            const user:UserInterface={
              id:newUser.id,
              name:newUser.username,
              email:newUser.email,
              password:newUser.password
            };
            this.currentUser.set(user);
            localStorage.setItem('currentUser',JSON.stringify(user));
            if(callback) callback(true);
          },
          error:(error) => {
            console.error('Error registering user:', error);
            if(callback) callback(false);
          }
        });
      },
      error:(error) => {
        console.error('Error getting users:', error);
        if(callback) callback(false);
      }
    });
  }

  getCurrentUserId(){
    return this.currentUser()?.id || null;
  }
}