import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-chef-vaudoise-layout',
  templateUrl: './chef-vaudoise-layout.component.html',
  styleUrls: ['./chef-vaudoise-layout.component.css']
})
export class ChefVaudoiseLayoutComponent implements OnInit {
  currentView: string = 'home';
  dropdowns: { [key: string]: boolean } = {
    projets: false,
    assignation: false,
    equipes: false,
    suivi: false,
    planification: false
  };

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    // Initialisation du composant
  }

  setCurrentView(view: string): void {
    this.currentView = view;
  }

  toggleDropdown(dropdown: string): void {
    this.dropdowns[dropdown] = !this.dropdowns[dropdown];
  }

  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  getUserName(): string {
    try {
      const keycloakInstance = this.keycloakService.getKeycloakInstance();
      return keycloakInstance.tokenParsed?.['preferred_username'] || 'Utilisateur';
    } catch (error) {
      console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
      return 'Utilisateur';
    }
  }

  getUserEmail(): string {
    try {
      const keycloakInstance = this.keycloakService.getKeycloakInstance();
      return keycloakInstance.tokenParsed?.['email'] || '';
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'email:', error);
      return '';
    }
  }
}
