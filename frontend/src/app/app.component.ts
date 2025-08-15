import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isLoggedIn = false;
  userEmail = '';
  isAdmin = false;
  showNavbar = true;
  showUserMenu = false;
  private lastUrl = '';

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Vérifier l'état de connexion
    this.isLoggedIn = this.keycloakService.isLoggedIn();
    
    if (this.isLoggedIn) {
      // Récupérer les informations utilisateur
      const userProfile = await this.keycloakService.loadUserProfile();
      this.userEmail = userProfile.email || '';
      this.isAdmin = this.keycloakService.isUserInRole('admin');
    }

    // Écouter les changements de route pour gérer l'affichage de la navbar
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Éviter les redirections en boucle
        if (this.lastUrl !== event.url) {
          this.lastUrl = event.url;
          this.updateNavbarVisibility(event.url);
        }
      }
    });
  }

  private updateNavbarVisibility(url: string) {
    // Masquer la navbar sur certaines pages si nécessaire
    // Pour l'instant, on l'affiche toujours
    this.showNavbar = true;
  }

  async login() {
    await this.keycloakService.login({
      redirectUri: window.location.origin
    });
  }

  async logout() {
    this.showUserMenu = false;
    await this.keycloakService.logout(window.location.origin);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  editProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Fermer le menu si on clique en dehors
    this.showUserMenu = false;
  }
}

