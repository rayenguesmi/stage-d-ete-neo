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

  // Utilisateurs assignés au projet Neolianse
  assignedUsersProjet1: User[] = []; // Neolianse seulement

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
    } else {
      // Assignations par défaut
      this.assignedUsersProjet1 = [this.allUsers[1]]; // Rayen assigné au Neolianse
      this.saveAssignmentsToStorage();
    }
  }

  // Méthode pour assigner un utilisateur au projet Neolianse
  assignUserToNeolianse(user: User): void {
    if (!this.isUserAssignedToNeolianse(user)) {
      this.assignedUsersProjet1.push(user);
      this.addActivity('assign', `${user.firstName} ${user.lastName} a été assigné au projet Neolianse`, 'À l\'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Méthode pour désassigner un utilisateur du projet Neolianse
  unassignUserFromNeolianse(user: User): void {
    const index = this.assignedUsersProjet1.findIndex((u: User) => u.id === user.id);
    if (index > -1) {
      this.assignedUsersProjet1.splice(index, 1);
      this.addActivity('unassign', `${user.firstName} ${user.lastName} a été retiré du projet Neolianse`, 'À l\'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Vérifier si un utilisateur est assigné au projet Neolianse
  isUserAssignedToNeolianse(user: User): boolean {
    return this.assignedUsersProjet1.some((u: User) => u.id === user.id);
  }



  // Obtenir les utilisateurs disponibles (non assignés)
  getAvailableUsers(): User[] {
    return this.allUsers.filter((u: User) => !this.isUserAssignedToNeolianse(u));
  }

  getTotalAssignedUsers(): number {
    return this.assignedUsersProjet1.length;
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
      projet1: this.assignedUsersProjet1
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
    this.addActivity("update", "Toutes les assignations ont été réinitialisées", "À l'instant");
    this.saveAssignmentsToStorage();
  }

  // Méthodes pour les statistiques du dashboard
  getProjectProgress(): number {
    // Simulation du progrès du projet Neolianse
    return Math.floor(Math.random() * 100);
  }

  getActiveTasksCount(): number {
    // Simulation du nombre de tâches actives
    return Math.floor(Math.random() * 20) + 5;
  }

  getCompletedTasksCount(): number {
    // Simulation du nombre de tâches terminées
    return Math.floor(Math.random() * 50) + 10;
  }
}

