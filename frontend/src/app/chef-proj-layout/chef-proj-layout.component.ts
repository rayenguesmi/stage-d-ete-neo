import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-chef-proj-layout',
  templateUrl: './chef-proj-layout.component.html',
  styleUrls: ['./chef-proj-layout.component.css']
})
export class ChefProjLayoutComponent implements OnInit {
  currentView = 'home'; // Vue par défaut

  // Ajoute ceci pour gérer l'état des dropdowns
  dropdowns: { [key: string]: boolean } = {
    projets: false,
    assignation: false,
    equipes: false,
    suivi: false,
    planification: false
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
    if (segments.length >= 3 && segments[1] === 'chef-proj') {
      const route = segments[2];
      
      // Mapper les routes vers les vues
      const viewMapping: { [key: string]: string } = {
        'dashboard': 'home',
        'projet1': 'projet1',
        'projet2': 'projet2',
        'assign-projet1': 'assign-projet1',
        'assign-projet2': 'assign-projet2',
        'view-assignments': 'view-assignments',
        'equipe-projet1': 'equipe-projet1',
        'equipe-projet2': 'equipe-projet2',
        'progress-projet1': 'progress-projet1',
        'progress-projet2': 'progress-projet2',
        'reports': 'reports',
        'calendar': 'calendar',
        'milestones': 'milestones',
        'deadlines': 'deadlines'
      };
      
      this.currentView = viewMapping[route] || 'home';
    }
  }

  setCurrentView(view: string): void {
    this.currentView = view;
    
    // Mapper les vues vers les routes correctes
    const routeMapping: { [key: string]: string } = {
      'home': 'dashboard',
      'projet1': 'projet1',
      'projet2': 'projet2',
      'assign-projet1': 'assign-projet1',
      'assign-projet2': 'assign-projet2',
      'view-assignments': 'view-assignments',
      'equipe-projet1': 'equipe-projet1',
      'equipe-projet2': 'equipe-projet2',
      'progress-projet1': 'progress-projet1',
      'progress-projet2': 'progress-projet2',
      'reports': 'reports',
      'calendar': 'calendar',
      'milestones': 'milestones',
      'deadlines': 'deadlines'
    };

    const route = routeMapping[view] || view;
    // Utiliser navigateByUrl pour éviter les conflits avec routerLink
    this.router.navigateByUrl(`/chef-proj/${route}`);
  }

  // Méthode pour ouvrir/fermer le menu déroulant
  toggleDropdown(name: string): void {
    this.dropdowns[name] = !this.dropdowns[name];
  }
}

