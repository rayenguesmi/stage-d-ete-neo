import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-gestion-utilisateur',
  templateUrl: './gestion-utilisateur.component.html',
  styleUrls: ['./gestion-utilisateur.component.css']
})
export class GestionUtilisateurComponent implements OnInit {

  users: User[] = [];
  errorMessage: string = '';
  openMenuId: string | null = null;
  isEditing: boolean = false;
  editingUser: User = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    isActive: true,
    roles: ['USER']
  };

  newUser: User = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    isActive: true,
    roles: ['USER']
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Fonction trackBy pour optimiser le *ngFor
  trackByUserId(index: number, user: User): any {
    return user.id;
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        console.log('Utilisateurs chargés:', this.users.length);
      },
      error: (err: any) => {
        console.error('Erreur de chargement:', err);
        this.errorMessage = "Erreur de chargement des utilisateurs";
      }
    });
  }

  addUser(): void {
    this.userService.createUser(this.newUser).subscribe({
      next: (createdUser: User) => {
        // Ajouter le nouvel utilisateur à la liste
        this.users = [...this.users, createdUser]; // Créer un nouveau tableau
        
        // Réinitialiser le formulaire
        this.newUser = {
          firstName: '',
          lastName: '',
          email: '',
          username: '',
          isActive: true,
          roles: ['USER']
        };
        
        // Effacer les erreurs
        this.errorMessage = '';
        
        console.log('Utilisateur ajouté, nouvelle taille:', this.users.length);
      },
      error: (err: any) => {
        console.error('Erreur d\'ajout:', err);
        this.errorMessage = "Erreur lors de l'ajout de l'utilisateur";
      }
    });
  }

  toggleStatus(user: User): void {
    if (!user.id) return;

    this.userService.toggleUserStatus(user.id).subscribe({
      next: (updatedUser: User) => {
        // Mettre à jour l'utilisateur dans la liste
        this.users = this.users.map(u => 
          u.id === user.id ? { ...u, isActive: updatedUser.isActive } : u
        );
        
        this.errorMessage = '';
        console.log('Statut mis à jour pour:', updatedUser);
      },
      error: (err: any) => {
        console.error('Erreur de changement de statut:', err);
        this.errorMessage = "Erreur lors du changement de statut";
      }
    });
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.editingUser = { ...user }; // Copie des données de l'utilisateur
    this.closeMenu();
  }

  updateUser(): void {
    if (!this.editingUser.id) return;

    this.userService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: (updatedUser: User) => {
        // Mettre à jour l'utilisateur dans la liste
        this.users = this.users.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        );
        
        this.cancelEdit();
        this.errorMessage = '';
        console.log('Utilisateur mis à jour:', updatedUser);
      },
      error: (err: any) => {
        console.error('Erreur de mise à jour:', err);
        this.errorMessage = "Erreur lors de la mise à jour de l'utilisateur";
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editingUser = {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      isActive: true,
      roles: ['USER']
    };
  }

  deleteUser(user: User): void {
    if (!user.id || !confirm("Confirmer la suppression ?")) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        // Supprimer l'utilisateur de la liste
        this.users = this.users.filter(u => u.id !== user.id);
        this.errorMessage = '';
        console.log('Utilisateur supprimé:', user);
      },
      error: (err: any) => {
        console.error('Erreur de suppression:', err);
        this.errorMessage = "Erreur lors de la suppression";
      }
    });
    this.closeMenu();
  }

  // Menu management methods
  toggleMenu(userId: string): void {
    this.openMenuId = this.openMenuId === userId ? null : userId;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  isMenuOpen(userId: string): boolean {
    return this.openMenuId === userId;
  }

  viewUserDetails(user: User): void {
    // TODO: Implement view details functionality
    console.log('Voir détails utilisateur:', user);
    this.closeMenu();
  }



  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-menu-container')) {
      this.closeMenu();
    }
  }
}