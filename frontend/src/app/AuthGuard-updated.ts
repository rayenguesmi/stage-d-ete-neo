import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override router: Router,
    protected keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin,
      });
      return false;
    }

    // Si l'utilisateur est authentifié et sur la route racine, rediriger selon le rôle
    if (state.url === '/' || state.url === '') {
      const isAdmin = this.keycloak.isUserInRole('admin');
      const isChefProj = this.keycloak.isUserInRole('chef proj');
      const isUser = this.keycloak.isUserInRole('proj 2');
      const isProj1 = this.keycloak.isUserInRole('proj1');
      
      if (isAdmin) {
        return this.router.createUrlTree(['/admin/dashboard']);
      } else if (isChefProj) {
        return this.router.createUrlTree(['/chef-proj/dashboard']);
      } else if (isUser) {
        return this.router.createUrlTree(['/user/gestionnaire-de-doc']);
      } else if (isProj1) {
        return this.router.createUrlTree(['/proj1/gestionnaire-de-doc']);
      } else {
        // Si l'utilisateur n'a aucun rôle, rediriger vers une page par défaut
        return this.router.createUrlTree(['/user/gestionnaire-de-doc']);
      }
    }

    // Stocker le token
    this.keycloak.getToken().then((token) => {
      localStorage.setItem('token', token);
    });

    return this.authenticated;
  }
}

