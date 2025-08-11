import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class ChefVaudoiseRoleGuard implements CanActivate {

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      
      if (!isLoggedIn) {
        this.router.navigate(['/landing']);
        return false;
      }

      // Vérifier si l'utilisateur a le rôle "chef vaudoise"
      const hasChefVaudoiseRole = this.keycloakService.isUserInRole('chef vaudoise');
      
      if (!hasChefVaudoiseRole) {
        // Rediriger vers une page d'accès refusé ou la page d'accueil
        this.router.navigate(['/access-denied']);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle chef vaudoise:', error);
      this.router.navigate(['/landing']);
      return false;
    }
  }
}
