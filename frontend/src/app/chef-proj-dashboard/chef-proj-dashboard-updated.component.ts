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
  assignedUsersProjet1: User[] = []; // Neolians
  assignedUsersProjet2: User[] = []; // Vaudoise

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
    // Charger les assignations depuis le localStorage ou un service
    const savedAssignments = this.loadAssignmentsFromStorage();
    if (savedAssignments) {
      this.assignedUsersProjet1 = savedAssignments.projet1 || [];
      this.assignedUsersProjet2 = savedAssignments.projet2 || [];
    } else {
      // Assignations par défaut
      this.assignedUsersProjet1 = [this.allUsers[1]]; // Rayen assigné au projet 1
      this.assignedUsersProjet2 = []; // Aucun utilisateur assigné au projet 2 initialement
      this.saveAssignmentsToStorage();
    }
  }

  // Nouvelle méthode pour assigner un utilisateur au projet Neolians
  assignUserToNeolians(user: User): void {
    if (!this.isUserAssignedToNeolians(user)) {
      this.assignedUsersProjet1.push(user);
      this.addActivity('assign', `${user.firstName} ${user.lastName} a été assigné au projet Neolians`, 'À l'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Nouvelle méthode pour assigner un utilisateur au projet Vaudoise
  assignUserToVaudoise(user: User): void {
    if (!this.isUserAssignedToVaudoise(user)) {
      this.assignedUsersProjet2.push(user);
      this.addActivity('assign', `${user.firstName} ${user.lastName} a été assigné au projet Vaudoise`, 'À l'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Nouvelle méthode pour désassigner un utilisateur du projet Neolians
  unassignUserFromNeolians(user: User): void {
    const index = this.assignedUsersProjet1.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.assignedUsersProjet1.splice(index, 1);
      this.addActivity('unassign', `${user.firstName} ${user.lastName} a été retiré du projet Neolians`, 'À l'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Nouvelle méthode pour désassigner un utilisateur du projet Vaudoise
  unassignUserFromVaudoise(user: User): void {
    const index = this.assignedUsersProjet2.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.assignedUsersProjet2.splice(index, 1);
      this.addActivity('unassign', `${user.firstName} ${user.lastName} a été retiré du projet Vaudoise`, 'À l'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Vérifier si un utilisateur est assigné au projet Neolians
  isUserAssignedToNeolians(user: User): boolean {
    return this.assignedUsersProjet1.some(u => u.id === user.id);
  }

  // Vérifier si un utilisateur est assigné au projet Vaudoise
  isUserAssignedToVaudoise(user: User): boolean {
    return this.assignedUsersProjet2.some(u => u.id === user.id);
  }

  // Obtenir les utilisateurs disponibles (non assignés)
  getAvailableUsers(): User[] {
    const assignedUserIds = [
      ...this.assignedUsersProjet1.map(u => u.id),
      ...this.assignedUsersProjet2.map(u => u.id)
    ];
    
    return this.allUsers.filter(user => 
      !assignedUserIds.includes(user.id)
    );
  }

  getTotalAssignedUsers(): number {
    return this.assignedUsersProjet1.length + this.assignedUsersProjet2.length;
  }

  getAvailableUsersCount(): number {
    return this.getAvailableUsers().length;
  }

  // Ajouter une nouvelle activité
  private addActivity(type: 'assign' | 'unassign' | 'update', text: string, time: string): void {
    const iconMap = {
      'assign': 'fa-user-plus',
      'unassign': 'fa-user-minus',
      'update': 'fa-edit'
    };

    const newActivity: Activity = {
      type: type,
      icon: iconMap[type],
      text: text,
      time: time
    };

    // Ajouter en début de liste
    this.recentActivities.unshift(newActivity);
    
    // Garder seulement les 10 dernières activités
    if (this.recentActivities.length > 10) {
      this.recentActivities = this.recentActivities.slice(0, 10);
    }
  }

  // Sauvegarder les assignations dans le localStorage
  private saveAssignmentsToStorage(): void {
    const assignments = {
      projet1: this.assignedUsersProjet1,
      projet2: this.assignedUsersProjet2
    };
    localStorage.setItem('chef-proj-assignments', JSON.stringify(assignments));
  }

  // Charger les assignations depuis le localStorage
  private loadAssignmentsFromStorage(): any {
    const saved = localStorage.getItem('chef-proj-assignments');
    return saved ? JSON.parse(saved) : null;
  }

  // Méthode pour réinitialiser toutes les assignations (utile pour les tests)
  resetAllAssignments(): void {
    this.assignedUsersProjet1 = [];
    this.assignedUsersProjet2 = [];
    this.addActivity('update', 'Toutes les assignations ont été réinitialisées', 'À l'instant');
    this.saveAssignmentsToStorage();
  }
}

