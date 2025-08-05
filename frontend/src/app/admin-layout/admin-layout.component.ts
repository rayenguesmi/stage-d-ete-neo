import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  currentView = 'home'; // Vue par défaut

  // Ajoute ceci pour gérer l'état des dropdowns
  dropdowns: { [key: string]: boolean } = {
    admin: false,
    docs: false,
    campagnes: false,
    executions: false,
    dashboard: false,
    assistant: false,
    connecteurs: false
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Détecter la route actuelle au chargement
    this.updateCurrentViewFromRoute(this.router.url);
    
    // Écouter les changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateCurrentViewFromRoute((event as NavigationEnd).url);
    });
  }

  private updateCurrentViewFromRoute(url: string): void {
    const segments = url.split('/');
    if (segments.length >= 3 && segments[1] === 'admin') {
      const route = segments[2];
      
      // Mapper les routes vers les vues
      const viewMapping: { [key: string]: string } = {
        'dashboard': 'home',
        'gestion-utilisateur': 'users',
        'gestion-roles': 'roles',
        'gestion-licences': 'licenses',
        'audit-suivi': 'audit',
        'audit': 'audit',
        'gestionnaire-de-doc': 'import',
        'g-de-campagne': 'planification',
        'g-dexecution': 'historique',
        'administration': 'sirh'
      };
      
      this.currentView = viewMapping[route] || 'home';
    }
  }

  setCurrentView(view: string): void {
    this.currentView = view;
    
    // Mapper les vues vers les routes correctes
    const routeMapping: { [key: string]: string } = {
      'home': 'dashboard',
      'users': 'gestion-utilisateur',
      'roles': 'gestion-roles',
      'licenses': 'gestion-licences',
      'audit': 'audit',
      'import': 'gestionnaire-de-doc',
      'annotations': 'gestionnaire-de-doc',
      'search': 'gestionnaire-de-doc',
      'archive': 'gestionnaire-de-doc',
      'planification': 'g-de-campagne',
      'association': 'g-de-campagne',
      'suivi': 'g-de-campagne',
      'rapports': 'g-de-campagne',
      'historique': 'g-dexecution',
      'stats': 'g-dexecution',
      'kpi': 'dashboard',
      'bi': 'dashboard',
      'chatbot': 'dashboard',
      'search-ai': 'dashboard',
      'resume': 'dashboard',
      'sirh': 'administration',
      'monitoring': 'administration'
    };

    const route = routeMapping[view] || view;
    // Utiliser navigateByUrl pour éviter les conflits avec routerLink
    this.router.navigateByUrl(`/admin/${route}`);
  }

  // Méthode pour ouvrir/fermer le menu déroulant
  toggleDropdown(name: string): void {
    this.dropdowns[name] = !this.dropdowns[name];
  }
}

