import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-equipe-vaudoise',
  templateUrl: './equipe-vaudoise.component.html',
  styleUrls: ['./equipe-vaudoise.component.css']
})
export class EquipeVaudoiseComponent implements OnInit {
  users: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadVaudoiseTeamMembers();
  }

  loadVaudoiseTeamMembers(): void {
    this.loading = true;
    // Simulate API call to get Vaudoise team members
    // In a real application, this would call your backend API
    setTimeout(() => {
      this.users = [
        {
          id: 1,
          username: 'user.vaudoise1',
          email: 'user1@vaudoise.ch',
          firstName: 'Jean',
          lastName: 'Dupont',
          role: 'Développeur',
          project: 'Vaudoise',
          status: 'Actif'
        },
        {
          id: 2,
          username: 'user.vaudoise2',
          email: 'user2@vaudoise.ch',
          firstName: 'Marie',
          lastName: 'Martin',
          role: 'Analyste',
          project: 'Vaudoise',
          status: 'Actif'
        }
      ];
      this.loading = false;
    }, 1000);
  }

  filteredUsers(): any[] {
    if (!this.searchTerm) {
      return this.users;
    }
    return this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  editUser(user: any): void {
    console.log('Edit user:', user);
    // Implement edit functionality
  }

  deleteUser(user: any): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      console.log('Delete user:', user);
      // Implement delete functionality
    }
  }

  addUser(): void {
    console.log('Add new user to Vaudoise team');
    // Implement add user functionality
  }

  getActiveUsersCount(): number {
    return this.users.filter(u => u.status === 'Actif').length;
  }

  getInactiveUsersCount(): number {
    return this.users.filter(u => u.status === 'Inactif').length;
  }
}
