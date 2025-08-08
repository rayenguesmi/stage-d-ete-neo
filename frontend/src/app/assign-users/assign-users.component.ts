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
  selector: 'app-assign-users',
  templateUrl: './assign-users.component.html',
  styleUrls: ['./assign-users.component.css']
})
export class AssignUsersComponent implements OnInit {
  selectedProject: string = '';
  searchTerm: string = '';
  notification: Notification | null = null;

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

  // Utilisateurs filtrés pour l'affichage
  filteredAvailableUsers: User[] = [];

  // Utilisateurs assignés aux projets
  assignedUsersProjet1: User[] = [];
  assignedUsersProjet2: User[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    // Simuler le chargement des utilisateurs depuis une API
    this.filteredAvailableUsers = [...this.allUsers];
    this.filterUsers();
    
    // Simuler des assignations existantes
    this.assignedUsersProjet1 = [this.allUsers[1]]; // Rayen assigné au projet 1
    this.assignedUsersProjet2 = []; // Aucun utilisateur assigné au projet 2 initialement
    
    this.showNotification('success', 'Utilisateurs chargés avec succès');
  }

  selectProject(project: string): void {
    this.selectedProject = project;
    this.filterUsers();
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
    if (!this.selectedProject) {
      return [...this.allUsers];
    }

    const assignedUsers = this.getAssignedUsers();
    return this.allUsers.filter(user => 
      !assignedUsers.some(assigned => assigned.id === user.id)
    );
  }

  getAssignedUsers(): User[] {
    if (this.selectedProject === 'projet1') {
      return this.assignedUsersProjet1;
    } else if (this.selectedProject === 'projet2') {
      return this.assignedUsersProjet2;
    }
    return [];
  }

  assignUser(user: User): void {
    if (!this.selectedProject) {
      this.showNotification('error', 'Veuillez sélectionner un projet');
      return;
    }

    const assignedUsers = this.getAssignedUsers();
    
    // Vérifier si l'utilisateur n'est pas déjà assigné
    if (assignedUsers.some(assigned => assigned.id === user.id)) {
      this.showNotification('error', 'Cet utilisateur est déjà assigné à ce projet');
      return;
    }

    // Assigner l'utilisateur au projet sélectionné
    if (this.selectedProject === 'projet1') {
      this.assignedUsersProjet1.push(user);
    } else if (this.selectedProject === 'projet2') {
      this.assignedUsersProjet2.push(user);
    }

    // Mettre à jour la liste des utilisateurs disponibles
    this.filterUsers();

    const projectName = this.selectedProject === 'projet1' ? 'Neolians' : 'Vaudoise';
    this.showNotification('success', `${user.firstName} ${user.lastName} a été assigné au ${projectName}`);
  }

  unassignUser(user: User): void {
    if (!this.selectedProject) {
      return;
    }

    // Retirer l'utilisateur du projet sélectionné
    if (this.selectedProject === 'projet1') {
      this.assignedUsersProjet1 = this.assignedUsersProjet1.filter(u => u.id !== user.id);
    } else if (this.selectedProject === 'projet2') {
      this.assignedUsersProjet2 = this.assignedUsersProjet2.filter(u => u.id !== user.id);
    }

    // Mettre à jour la liste des utilisateurs disponibles
    this.filterUsers();

    const projectName = this.selectedProject === 'projet1' ? 'Neolians' : 'Vaudoise';
    this.showNotification('success', `${user.firstName} ${user.lastName} a été retiré du ${projectName}`);
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    
    // Masquer la notification après 3 secondes
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
}

