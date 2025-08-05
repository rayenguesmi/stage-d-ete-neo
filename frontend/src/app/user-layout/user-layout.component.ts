import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent implements OnInit {
  currentView = 'home'; // Vue par défaut

  // Ajoute ceci pour gérer l'état des dropdowns
  dropdowns: { [key: string]: boolean } = {
    docs: false,
    campagnes: false,
    assistant: false
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
    if (segments.length >= 3 && segments[1] === 'user') {
      const route = segments[2];
      
      // Mapper les routes vers les vues
      const viewMapping: { [key: string]: string } = {
        'home': 'home',
        'gestionnaire-de-doc': 'import',
        'g-de-campagne': 'association'
      };
      
      this.currentView = viewMapping[route] || 'home';
    }
  }

  setCurrentView(view: string): void {
    this.currentView = view;
    
    // Mapper les vues vers les routes correctes
    const routeMapping: { [key: string]: string } = {
      'home': 'home',
      'import': 'gestionnaire-de-doc',
      'annotations': 'gestionnaire-de-doc',
      'search': 'gestionnaire-de-doc',
      'association': 'g-de-campagne',
      'suivi': 'g-de-campagne',
      'chatbot': 'home',
      'search-ai': 'home'
    };

    const route = routeMapping[view] || view;
    this.router.navigate(['/user', route]);
  }

  // Méthode pour ouvrir/fermer le menu déroulant
  toggleDropdown(name: string): void {
    this.dropdowns[name] = !this.dropdowns[name];
  }
}

