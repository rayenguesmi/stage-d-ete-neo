import { Component, OnInit } from '@angular/core';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-assign-vaudoise',
  templateUrl: './assign-vaudoise.component.html',
  styleUrls: ['./assign-vaudoise.component.css']
})
export class AssignVaudoiseComponent implements OnInit {
  searchTerm = '';
  notification: Notification | null = null;

  // Liste de tous les utilisateurs (même que dans le dashboard)
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

  // Utilisateurs filtrés pour l'affichage
  filteredAvailableUsers: User[] = [];
  
  // Utilisateurs assignés au projet Vaudoise
  assignedUsers: User[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Charger les utilisateurs depuis la liste réelle
    this.filteredAvailableUsers = [...this.allUsers];
    this.filterUsers();
    
    // Simuler des assignations existantes (optionnel)
    this.assignedUsers = []; // Aucun utilisateur assigné initialement
    
    this.showNotification('success', 'Utilisateurs chargés avec succès');
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredAvailableUsers = this.getAvailableUsers();
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAvailableUsers = this.getAvailableUsers().filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }
  }

  getAvailableUsers(): User[] {
    return this.allUsers.filter(user => 
      !this.assignedUsers.some(assigned => assigned.id === user.id)
    );
  }

  assignUser(user: User): void {
    // Vérifier si l'utilisateur n'est pas déjà assigné
    if (this.assignedUsers.some(assigned => assigned.id === user.id)) {
      this.showNotification('error', 'Cet utilisateur est déjà assigné au projet Vaudoise');
      return;
    }

    // Assigner l'utilisateur au projet Vaudoise
    this.assignedUsers.push(user);

    // Mettre à jour la liste des utilisateurs disponibles
    this.filterUsers();

    this.showNotification('success', `${user.firstName} ${user.lastName} a été assigné au projet Vaudoise`);
  }

  unassignUser(user: User): void {
    // Retirer l'utilisateur du projet
    const index = this.assignedUsers.findIndex(assigned => assigned.id === user.id);
    if (index > -1) {
      this.assignedUsers.splice(index, 1);
      
      // Mettre à jour la liste des utilisateurs disponibles
      this.filterUsers();
      
      this.showNotification('success', `${user.firstName} ${user.lastName} a été retiré du projet Vaudoise`);
    }
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  onSearchChange(): void {
    this.filterUsers();
  }
}
