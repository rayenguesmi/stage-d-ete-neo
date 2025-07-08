import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserFilter, UserRole } from './user.model';
import { UserService } from './user.service';
import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-gestion-utilisateur',
  templateUrl: './gestion-utilisateur.component.html',
  styleUrls: ['./gestion-utilisateur.component.css']
})
export class GestionUtilisateurComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  error: string | null = null;
  
  // Contrôles de filtrage
  searchControl = new FormControl('');
  roleFilter = new FormControl('');
  statusFilter = new FormControl('');
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;
  
  // Options de filtrage
  roleOptions = [
    { value: '', label: 'Tous les rôles' },
    { value: UserRole.ADMIN_GENERAL, label: 'Administrateur Général' },
    { value: UserRole.CHEF_PROJET, label: 'Chef de Projet' },
    { value: UserRole.EYA_EXECUTANTE, label: 'Eya (Exécutante)' }
  ];
  
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'true', label: 'Actif' },
    { value: 'false', label: 'Inactif' }
  ];
  
  // Colonnes affichées
  displayedColumns: string[] = ['avatar', 'name', 'email', 'roles', 'status', 'lastLogin', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    public userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Recherche avec debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });

    // Filtres de rôle et statut
    this.roleFilter.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });

    this.statusFilter.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    const filter: UserFilter = {
      search: this.searchControl.value || undefined,
       role: this.roleFilter.value as UserRole || undefined,
      isActive: this.statusFilter.value ? this.statusFilter.value === 'true' : undefined,
      page: this.currentPage,
      size: this.pageSize
    };

    this.userService.getUsers(filter).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.total;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
        this.showError('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  openCreateUserDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  openEditUserDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { mode: 'edit', user: { ...user } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(user.id, result);
      }
    });
  }

  createUser(userData: any): void {
    this.userService.createUser(userData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccess('Utilisateur créé avec succès');
        this.loadUsers();
      },
      error: () => {
        this.showError('Erreur lors de la création de l\'utilisateur');
      }
    });
  }

  updateUser(id: string, userData: any): void {
    this.userService.updateUser(id, userData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccess('Utilisateur mis à jour avec succès');
        this.loadUsers();
      },
      error: () => {
        this.showError('Erreur lors de la mise à jour de l\'utilisateur');
      }
    });
  }

  confirmDeleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: `Êtes-vous sûr de vouloir supprimer l'utilisateur "${this.userService.getFullName(user)}" ?`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user.id);
      }
    });
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showSuccess('Utilisateur supprimé avec succès');
        this.loadUsers();
      },
      error: () => {
        this.showError('Erreur lors de la suppression de l\'utilisateur');
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        const action = user.isActive ? 'désactivé' : 'activé';
        this.showSuccess(`Utilisateur ${action} avec succès`);
        this.loadUsers();
      },
      error: () => {
        this.showError('Erreur lors du changement de statut');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.roleFilter.setValue('');
    this.statusFilter.setValue('');
  }

  exportUsers(): void {
    // Implémentation de l'export (CSV, Excel, etc.)
    this.showInfo('Fonctionnalité d\'export en cours de développement');
  }

  // Méthodes utilitaires
  getFullName(user: User): string {
    return this.userService.getFullName(user);
  }

  formatRoles(roles: string[]): string {
    return this.userService.formatRoles(roles);
  }

  getRoleBadgeClass(role: string): string {
    return this.userService.getRoleBadgeClass(role);
  }

  getRoleIcon(role: string): string {
    return this.userService.getRoleIcon(role);
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-secondary';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Jamais';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  getInitials(user: User): string {
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  // Messages
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}

