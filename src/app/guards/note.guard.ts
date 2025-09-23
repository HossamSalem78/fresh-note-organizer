import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NoteService } from '../services/note.service';
import { inject } from '@angular/core';

export const noteGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const authService = inject(AuthService);
  const noteService = inject(NoteService);
  const router = inject(Router);

  if(!authService.isLoggedIn){
    router.navigate(['/login']);
    return false;
  }

  const noteId=route.paramMap.get('id');
  if(!noteId){
    router.navigate(['/notes']);
    return false;
  }

  const userNotes=noteService.getUserNotes();
  const note=userNotes.find(note=>note.id===noteId);
  if(!note){
    router.navigate(['/notes']);
    return false;
  }

  return true;
};
