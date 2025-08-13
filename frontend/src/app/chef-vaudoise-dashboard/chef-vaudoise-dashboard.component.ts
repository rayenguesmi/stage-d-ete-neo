import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient } from '@angular/common/http';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp: number;
  attributes?: any;
}

@Component({
  selector: 'app-chef-vaudoise-dashboard',
  templateUrl: './chef-vaudoise-dashboard.component.html',
  styleUrls: ['./chef-vaudoise-dashboard.component.css']
})
export class ChefVaudoiseDashboardComponent implements OnInit {
  assignedUsersVaudoise: User[] = [];
  availableUsers: User[] = [];
  allUsers: User[] = [
    {
      id: '1',
      username: 'eya',
      firstName: 'Eya',
      lastName: 'Eya',
      email: 'eya@gmail.com',
      enabled: true,
      emailVerified: true,
      createdTimestamp: Date.now()
    },
    {
      id: '2',
      username: 'grayen274',
      firstName: 'Rayen',
      lastName: 'GUESMI',
      email: 'grayen274@gmail.com',
      enabled: true,
      emailVerified: true,
      createdTimestamp: Date.now()
    },
    {
      id: '3',
      username: 'rayen',
      firstName: 'Rayen',
      lastName: 'GUESMI',
      email: 'rayen@gmail.com',
      enabled: true,
      emailVerified: true,
      createdTimestamp: Date.now()
    },
    {
      id: '4',
      username: 'rayen.guesmi',
      firstName: 'Rayen',
      lastName: 'GUESMI',
      email: 'rayen.guesmi@esprit.tn',
      enabled: true,
      emailVerified: true,
      createdTimestamp: Date.now()
    }
  ];
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAssignments();
  }

  loadAssignments(): void {
    // Charger les assignations depuis le localStorage
    const savedAssignments = this.loadAssignmentsFromStorage();
    if (savedAssignments) {
      this.assignedUsersVaudoise = savedAssignments.vaudoise || [];
    } else {
      // Assignations par défaut
      this.assignedUsersVaudoise = [];
      this.saveAssignmentsToStorage();
    }
  }

  // Méthode pour assigner un utilisateur au projet Vaudoise
  assignUserToVaudoise(user: User): void {
    if (!this.isUserAssignedToVaudoise(user)) {
      this.assignedUsersVaudoise.push(user);
      this.saveAssignmentsToStorage();
    }
  }

  // Méthode pour désassigner un utilisateur du projet Vaudoise
  unassignUserFromVaudoise(user: User): void {
    const index = this.assignedUsersVaudoise.findIndex((u: User) => u.id === user.id);
    if (index > -1) {
      this.assignedUsersVaudoise.splice(index, 1);
      this.saveAssignmentsToStorage();
    }
  }

  // Vérifier si un utilisateur est assigné au projet Vaudoise
  isUserAssignedToVaudoise(user: User): boolean {
    return this.assignedUsersVaudoise.some((u: User) => u.id === user.id);
  }

  // Obtenir les utilisateurs disponibles (non assignés)
  getAvailableUsers(): User[] {
    return this.allUsers.filter((u: User) => !this.isUserAssignedToVaudoise(u));
  }

  getAvailableUsersCount(): number {
    return this.getAvailableUsers().length;
  }

  // Sauvegarder les assignations dans le localStorage
  private saveAssignmentsToStorage(): void {
    const assignments = {
      vaudoise: this.assignedUsersVaudoise
    };
    localStorage.setItem('chef-vaudoise-assignments', JSON.stringify(assignments));
  }

  // Charger les assignations depuis le localStorage
  private loadAssignmentsFromStorage(): any {
    const saved = localStorage.getItem('chef-vaudoise-assignments');
    return saved ? JSON.parse(saved) : null;
  }

  async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      await this.loadAssignedUsers();
      await this.loadAvailableUsers();
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.error = 'Erreur lors du chargement des données du tableau de bord';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAssignedUsers(): Promise<void> {
    try {
      const token = await this.keycloakService.getToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Charger les utilisateurs assignés au projet Vaudoise
      const response = await this.http.get<User[]>('http://localhost:8080/api/users/assigned/vaudoise', { headers }).toPromise();
      this.assignedUsersVaudoise = response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs assignés:', error);
      this.assignedUsersVaudoise = [];
    }
  }

  private async loadAvailableUsers(): Promise<void> {
    try {
      const token = await this.keycloakService.getToken();
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Charger les utilisateurs disponibles
      const response = await this.http.get<User[]>('http://localhost:8080/api/users/available', { headers }).toPromise();
      this.availableUsers = response || [];
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs disponibles:', error);
      this.availableUsers = [];
    }
  }

  getTotalAssignedUsers(): number {
    return this.assignedUsersVaudoise.length;
  }



  getCurrentUser(): string {
    try {
      const keycloakInstance = this.keycloakService.getKeycloakInstance();
      return keycloakInstance.tokenParsed?.['preferred_username'] || 'Utilisateur';
    } catch (error) {
      console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
      return 'Utilisateur';
    }
  }

  getCurrentUserEmail(): string {
    try {
      const keycloakInstance = this.keycloakService.getKeycloakInstance();
      return keycloakInstance.tokenParsed?.['email'] || '';
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'email:', error);
      return '';
    }
  }

  async refreshData(): Promise<void> {
    await this.loadDashboardData();
  }

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
