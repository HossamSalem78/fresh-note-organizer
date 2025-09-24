import {inject, Injectable, signal} from '@angular/core';
import { UserInterface } from '../models/user.interface';
import { HttpClient } from '@angular/common/http';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
    };
    tokens: TokenPair;
  }
}
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
    const savedTokens=localStorage.getItem('authTokens');

    if(savedUser && savedTokens){
      try{
        const user=JSON.parse(savedUser);
        const tokens=JSON.parse(savedTokens);

        if(this.isTokenValid(tokens.accessToken)){
          this.currentUser.set(user);
        }else{
          this.refreshTokens(tokens.refreshToken);
        }

      }catch(error){
        this.clearAuthData();
      }
    }
  }

  private saveTokens(tokens: TokenPair):void{
    localStorage.setItem('authTokens',JSON.stringify(tokens));
  }

  private clearTokens():void{
    localStorage.removeItem('authTokens');
  }

  private clearAuthData():void{
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.clearTokens();
  }

  private isTokenValid(token: string):boolean{
    try{
      const payload=JSON.parse(atob(token.split('.')[1]));
      const currentTime=Math.floor(Date.now()/1000);
      return payload.exp > currentTime;
    }catch(error){
      return false;
    }
  }

  private refreshTokens(refreshToken: string):void{
    this.clearAuthData();
  }

  // private generateId(): string {
  //   return Date.now().toString();
  // }

  isLoggedIn(){
    return this.currentUser() !== null;
  }

  login(email: string, password: string, callback?: (success: boolean) => void){
    this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).subscribe({
      next:(response) => {
        if(response.success){
          const {user, tokens}=response.data;
          const userObj:UserInterface={
            id:user.id,
            name:user.username,
            email:user.email,
            password:''
          };
          this.currentUser.set(userObj);
          localStorage.setItem('currentUser',JSON.stringify(userObj));
          this.saveTokens(tokens);

          if(callback) callback(true);
        }else{
          if(callback) callback(false);
        }
      },
      error:(error) => {
        if(callback) callback(false);
      }
    })
  }

  // login(email: string, password: string, callback?: (success: boolean) => void){
  //   this.http.get<any>(`${this.apiUrl}/db`).subscribe({
  //     next:(response) => {
  //       const users=response.users || [];
  //       const user=users.find((user:UserInterface) => user.email === email && user.password === password);
        
  //       if(user){
  //         const userObj:UserInterface={
  //           id:user.id,
  //           name:user.username,
  //           email:user.email,
  //           password:user.password
  //         }
  //         this.currentUser.set(userObj);
  //         localStorage.setItem('currentUser',JSON.stringify(userObj));
  //         if(callback) callback(true);
  //       }else{
  //         if(callback) callback(false);
  //       }
  //     },
  //     error:(error) => {
  //       console.error('Error logging in:', error);
  //       if(callback) callback(false);
  //     }
  //   });
  // }

  logout():void{
    this.clearAuthData();
  }

  register(email: string, password: string, name: string, callback?: (success: boolean) => void){
    if(!email || !password || !name){
      if(callback) callback(false);
      return;
    }

    this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      username:name,
      email,
      password
    }).subscribe({
      next:(response) => {
        if(response.success){
          const {user, tokens}=response.data;
          const userObj:UserInterface={
            id:user.id,
            name:user.username,
            email:user.email,
            password:''
          };
          this.currentUser.set(userObj);
          localStorage.setItem('currentUser',JSON.stringify(userObj));
          this.saveTokens(tokens);

          if(callback) callback(true);
        }else{
          if(callback) callback(false);
        }
      },
      error:(error) => {
        if(callback) callback(false);
      }
    })
  }

  // register(email: string, password: string, name: string, callback?: (success: boolean) => void){
  //   if(!email || !password || !name){
  //     if(callback) callback(false);
  //     return;
  //   }

  //   this.http.get<any>(`${this.apiUrl}/db`).subscribe({
  //     next:(response) => {
  //       const users=response.users || [];
  //       const existingUser=users.find((user:UserInterface) => user.email === email);

  //       if(existingUser){
  //         if(callback) callback(false);
  //         return;
  //       }

  //       const newUser = {
  //         id:this.generateId(),
  //         username:name,
  //         email:email,
  //         password:password
  //       };

  //       const updatedUsers=[...users, newUser];
  //       const updatedDb={...response, users:updatedUsers};

  //       this.http.put<any>(`${this.apiUrl}/db`,updatedDb).subscribe({
  //         next:(response) => {
  //           const user:UserInterface={
  //             id:newUser.id,
  //             name:newUser.username,
  //             email:newUser.email,
  //             password:newUser.password
  //           };
  //           this.currentUser.set(user);
  //           localStorage.setItem('currentUser',JSON.stringify(user));
  //           if(callback) callback(true);
  //         },
  //         error:(error) => {
  //           console.error('Error registering user:', error);
  //           if(callback) callback(false);
  //         }
  //       });
  //     },
  //     error:(error) => {
  //       console.error('Error getting users:', error);
  //       if(callback) callback(false);
  //     }
  //   });
  // }

  getAccessToken():string | null{
    const savedTokens=localStorage.getItem('authTokens');
    if(savedTokens){
      try{
        const tokens=JSON.parse(savedTokens);
        return tokens.accessToken;
      }catch(error){
        return null;
      }
    }
    return null;
  }

  getAuthHeaders():{[key:string]:string}{
    const token=this.getAccessToken();
    return token ? {Authorization: `Bearer ${token}`} : {};
  }

  getCurrentUserId(){
    return this.currentUser()?.id || null;
  }
}