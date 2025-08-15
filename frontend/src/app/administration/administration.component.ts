import { Component, OnInit } from '@angular/core';

export interface RecentActivity {
  id: string;
  date: Date;
  userName: string;
  action: string;
  type: 'user' | 'role' | 'project' | 'system';
  project?: string;
  details: string;
}

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css']
})
export class AdministrationComponent implements OnInit {

  recentActivities: RecentActivity[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadRecentActivities();
  }

  loadRecentActivities(): void {
    // Simulation de données d'activité récente
    this.recentActivities = [
      {
        id: '1',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
        userName: 'Jean Dupont',
        action: 'Utilisateur créé',
        type: 'user',
        project: 'Projet Neo TM',
        details: 'Nouvel utilisateur ajouté avec le rôle Testeur'
      },
      {
        id: '2',
        date: new Date(Date.now() - 4 * 60 * 60 * 1000), // Il y a 4 heures
        userName: 'Marie Martin',
        action: 'Rôle modifié',
        type: 'role',
        project: 'Projet Vaudoise',
        details: 'Permissions mises à jour pour le rôle Administrateur'
      },
      {
        id: '3',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6 heures
        userName: 'Pierre Durand',
        action: 'Connexion',
        type: 'system',
        project: 'Projet Neoliance',
        details: 'Connexion réussie au système'
      },
      {
        id: '4',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000), // Il y a 8 heures
        userName: 'Sophie Bernard',
        action: 'Rapport généré',
        type: 'project',
        project: 'Projet Neo TM',
        details: 'Rapport mensuel d\'activité généré'
      },
      {
        id: '5',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // Il y a 12 heures
        userName: 'Admin System',
        action: 'Sauvegarde',
        type: 'system',
        details: 'Sauvegarde automatique effectuée'
      }
    ];
  }

  getActivityClass(type: string): string {
    switch (type) {
      case 'user': return 'activity-user';
      case 'role': return 'activity-role';
      case 'project': return 'activity-project';
      case 'system': return 'activity-system';
      default: return 'activity-default';
    }
  }

}
