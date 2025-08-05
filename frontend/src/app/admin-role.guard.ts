import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminRoleGuard implements CanActivate {
  
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

    // Vérifier si l'utilisateur a le rôle admin
    const hasAdminRole = this.keycloakService.isUserInRole('admin');
    
    if (!hasAdminRole) {
      // Rediriger vers l'interface utilisateur si pas admin
      return this.router.createUrlTree(['/user/gestionnaire-de-doc']);
    }

    return true;
  }
}

