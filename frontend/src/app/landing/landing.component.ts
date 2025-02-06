import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { ContextService } from '../services/context.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  isCollapsed = false; // Gère l'état du hamburger
  currentRoute: string = ''; // Suivi de la route active
  data1: string = 'Example Data'; // Données à afficher
  data2: string = new Date().toLocaleString(); // Heure actuelle
  error: string = ''; // Message d'erreur
  isNavbarVisible: boolean = true;

  subMenus: { [key: string]: boolean } = {
    administration: false, // Sous-menu pour Administration
  };

  constructor(
    private keycloakService: KeycloakService,
    private contextService: ContextService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  logout() {
    this.keycloakService.logout();
    window.location.reload();
  }

  // Méthode pour basculer l'état du Navbar
  toggleNavbar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // Méthode pour afficher le bouton hamburger
  shouldShowHamburger(): boolean {
    const routesWithNavbar = [
      '/home',
      '/g-de-campagne',
      '/g-dexecution',
      '/gestionnaire-de-doc',
      '/administration',
    ];
    return routesWithNavbar.includes(this.router.url);
  }

  // Vérifie si la Navbar doit être affichée
  shouldShowNavbar(): boolean {
    const navbarRoutes = [
      '/home',
      '/g-de-campagne',
      '/g-dexecution',
      '/gestionnaire-de-doc',
      '/administration',
      '/gestion-licences',
      '/gestion-utilisateur',
      '/audit-suivi',
    ];
    return navbarRoutes.includes(this.router.url) && !this.isCollapsed;
  }

  // Basculer l'affichage du sous-menu (Administration)
  toggleSubMenu(menu: string) {
    this.subMenus[menu] = !this.subMenus[menu];
  }
}
