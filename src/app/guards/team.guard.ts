import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TeamService } from '../services/team.service';

export const teamGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const authService = inject(AuthService);
  const teamService = inject(TeamService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const teamId = route.paramMap.get('id');
  if (!teamId) {
    router.navigate(['/teams']);
    return false;
  }

  const userTeams = teamService.getUserTeams();
  const team = userTeams.find(t => t.id === teamId);
  
  if (!team) {
    router.navigate(['/teams']);
    return false;
  }

  return true;
};