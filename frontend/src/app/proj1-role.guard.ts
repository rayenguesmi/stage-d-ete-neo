import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Proj1RoleGuard implements CanActivate {
  
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Vérifier si l'utilisateur est authentifié
    if (!this.keycloakService.isLoggedIn()) {
      this.keycloakService.login({
        redirectUri: window.location.origin + state.url,
      });
      return false;
    }

    // Vérifier si l'utilisateur a le rôle proj1
    const hasProj1Role = this.keycloakService.isUserInRole('proj1');
    const hasAdminRole = this.keycloakService.isUserInRole('admin');
    
    // Si l'utilisateur a le rôle admin, le laisser accéder aux routes admin
    if (hasAdminRole) {
      return true;
    }
    
    if (!hasProj1Role) {
      // Rediriger vers l'interface admin si pas proj1
      return this.router.createUrlTree(['/admin/dashboard']);
    }

    return true;
  }
}

