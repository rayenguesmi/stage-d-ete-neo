import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-equipe-neolianse',
  templateUrl: './equipe-neolianse.component.html',
  styleUrls: ['./equipe-neolianse.component.css']
})
export class EquipeNeolianseComponent implements OnInit {
  users: any[] = [];
  loading = false;
  searchTerm = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadNeolianseTeamMembers();
  }

  loadNeolianseTeamMembers(): void {
    this.loading = true;
    // Simulate API call to get Neolianse team members
    setTimeout(() => {
      this.users = [
        {
          id: 1,
          username: 'user.neolianse1',
          email: 'user1@neolianse.ch',
          firstName: 'Paul',
          lastName: 'Durand',
          role: 'Développeur Senior',
          project: 'Neolianse',
          status: 'Actif'
        },
        {
          id: 2,
          username: 'user.neolianse2',
          email: 'user2@neolianse.ch',
          firstName: 'Claire',
          lastName: 'Moreau',
          role: 'Chef de Projet',
          project: 'Neolianse',
          status: 'Actif'
        },
        {
          id: 3,
          username: 'user.neolianse3',
          email: 'user3@neolianse.ch',
          firstName: 'Thomas',
          lastName: 'Lefebvre',
          role: 'Analyste Business',
          project: 'Neolianse',
          status: 'Inactif'
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
    console.log('Add new user to Neolianse team');
    // Implement add user functionality
  }

  getActiveUsersCount(): number {
    return this.users.filter(u => u.status === 'Actif').length;
  }

  getInactiveUsersCount(): number {
    return this.users.filter(u => u.status === 'Inactif').length;
  }
}
