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
  selector: 'app-chef-proj-dashboard-neoliance',
  templateUrl: './chef-proj-dashboard-neoliance.component.html',
  styleUrls: ['./chef-proj-dashboard.component.css']
})
export class ChefProjDashboardNeolianceComponent implements OnInit {

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

  // Utilisateurs assignés au projet Neoliance uniquement
  assignedUsersNeoliance: User[] = [];

  // Activités récentes
  recentActivities: Activity[] = [
    {
      type: 'assign',
      icon: 'fa-user-plus',
      text: 'Rayen GUESMI a été assigné au Neoliance',
      time: 'Il y a 2 heures'
    },
    {
      type: 'update',
      icon: 'fa-edit',
      text: 'Mise à jour du statut du Neoliance - 75% complété',
      time: 'Il y a 4 heures'
    },
    {
      type: 'update',
      icon: 'fa-chart-line',
      text: 'Rapport mensuel généré pour le projet Neoliance',
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
      this.assignedUsersNeoliance = savedAssignments.neoliance || [];
    } else {
      // Assignations par défaut
      this.assignedUsersNeoliance = [this.allUsers[1]]; // Rayen assigné au projet Neoliance
      this.saveAssignmentsToStorage();
    }
  }

  // Méthode pour assigner un utilisateur au projet Neoliance
  assignUserToNeoliance(user: User): void {
    if (!this.isUserAssignedToNeoliance(user)) {
      this.assignedUsersNeoliance.push(user);
      this.addActivity('assign', `${user.firstName} ${user.lastName} a été assigné au projet Neoliance`, 'À l\'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Méthode pour désassigner un utilisateur du projet Neoliance
  unassignUserFromNeoliance(user: User): void {
    const index = this.assignedUsersNeoliance.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.assignedUsersNeoliance.splice(index, 1);
      this.addActivity('unassign', `${user.firstName} ${user.lastName} a été retiré du projet Neoliance`, 'À l\'instant');
      this.saveAssignmentsToStorage();
    }
  }

  // Vérifier si un utilisateur est assigné au projet Neoliance
  isUserAssignedToNeoliance(user: User): boolean {
    return this.assignedUsersNeoliance.some(u => u.id === user.id);
  }

  // Obtenir les utilisateurs disponibles (non assignés)
  getAvailableUsers(): User[] {
    const assignedUserIds = this.assignedUsersNeoliance.map(u => u.id);
    
    return this.allUsers.filter(user => 
      !assignedUserIds.includes(user.id)
    );
  }

  getTotalAssignedUsers(): number {
    return this.assignedUsersNeoliance.length;
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
      neoliance: this.assignedUsersNeoliance
    };
    localStorage.setItem('chef-proj-neoliance-assignments', JSON.stringify(assignments));
  }

  // Charger les assignations depuis le localStorage
  private loadAssignmentsFromStorage(): any {
    const saved = localStorage.getItem('chef-proj-neoliance-assignments');
    return saved ? JSON.parse(saved) : null;
  }

  // Méthode pour réinitialiser toutes les assignations (utile pour les tests)
  resetAllAssignments(): void {
    this.assignedUsersNeoliance = [];
    this.addActivity("update", "Toutes les assignations ont été réinitialisées", "À l\"instant");
    this.saveAssignmentsToStorage();
  }
}

