import { Component, OnInit } from '@angular/core';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Activity {
  type: 'assign' | 'unassign' | 'update';
  icon: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-chef-proj-dashboard',
  templateUrl: './chef-proj-dashboard.component.html',
  styleUrls: ['./chef-proj-dashboard.component.css']
})
export class ChefProjDashboardComponent implements OnInit {

  // Liste de tous les utilisateurs (simulée)
  allUsers: User[] = [
    {
      id: '1',
      firstName: 'Eya',
      lastName: 'Eya',
      email: 'eya@gmail.com',
      role: 'Utilisateur'
    },
    {
      id: '2',
      firstName: 'Rayen',
      lastName: 'GUESMI',
      email: 'grayen274@gmail.com',
      role: 'Chef de Projet'
    },
    {
      id: '3',
      firstName: 'Rayen',
      lastName: 'GUESMI',
      email: 'rayen@gmail.com',
      role: 'Chef de Projet'
    },
    {
      id: '4',
      firstName: 'Rayen',
      lastName: 'GUESMI',
      email: 'rayen.guesmi@esprit.tn',
      role: 'Chef de Projet'
    }
  ];

  // Utilisateurs assignés aux projets
  assignedUsersProjet1: User[] = [];
  assignedUsersProjet2: User[] = [];

  // Activités récentes
  recentActivities: Activity[] = [
    {
      type: 'assign',
      icon: 'fa-user-plus',
      text: 'Rayen GUESMI a été assigné au Neolians',
      time: 'Il y a 2 heures'
    },
    {
      type: 'update',
      icon: 'fa-edit',
      text: 'Mise à jour du statut du Neolians - 75% complété',
      time: 'Il y a 4 heures'
    },
    {
      type: 'assign',
      icon: 'fa-user-plus',
      text: 'Nouvelle assignation en attente pour le Vaudoise',
      time: 'Il y a 1 jour'
    },
    {
      type: 'update',
      icon: 'fa-chart-line',
      text: 'Rapport mensuel généré pour les deux projets',
      time: 'Il y a 2 jours'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadAssignments();
  }

  loadAssignments(): void {
    // Simuler des assignations existantes
    this.assignedUsersProjet1 = [this.allUsers[1]]; // Rayen assigné au projet 1
    this.assignedUsersProjet2 = []; // Aucun utilisateur assigné au projet 2 initialement
  }

  getTotalAssignedUsers(): number {
    return this.assignedUsersProjet1.length + this.assignedUsersProjet2.length;
  }

  getAvailableUsersCount(): number {
    const assignedUserIds = [
      ...this.assignedUsersProjet1.map(u => u.id),
      ...this.assignedUsersProjet2.map(u => u.id)
    ];
    
    return this.allUsers.filter(user => 
      !assignedUserIds.includes(user.id)
    ).length;
  }
}

