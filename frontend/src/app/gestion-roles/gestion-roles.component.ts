import { Component, OnInit, HostListener } from '@angular/core';
import { Role, RoleService } from '../services/role.service';
import { Permission, PermissionService } from '../services/permission.service';
import { User, UserService } from '../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestion-roles',
  templateUrl: './gestion-roles.component.html',
  styleUrls: ['./gestion-roles.component.css']
})
export class GestionRolesComponent implements OnInit {
  roles: Role[] = [];
  permissions: Permission[] = [];
  users: User[] = []; // Liste des utilisateurs
  filteredRoles: Role[] = [];
  
  // Formulaire de création/modification
  currentRole: Role = {
    name: '',
    displayName: '',
    description: '',
    department: '',
    project: '',
    permissions: [],
    isActive: true,
    adminAccess: false,
    userManagement: false,
    projectAccess: false,
    reportAccess: false,
    userId: '', // ID de l'utilisateur sélectionné
    userFullName: '' // Nom complet de l'utilisateur
  };
  
  isEditing = false;
  editingRoleId: string | null = null;
  showForm = false;
  
  // Recherche et filtres
  searchTerm = '';
  showSystemRoles = true;
  showCustomRoles = true;
  showActiveOnly = false;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  
  // Permissions groupées par module
  permissionsByModule: { [key: string]: Permission[] } = {};
  
  // Menu management
  openMenuId: string | null = null;

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private userService: UserService // Injection du service utilisateur
  ) { }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
    this.loadUsers(); // Charger les utilisateurs
  }

  /**
   * Charge tous les rôles
   */
  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.applyFilters();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des rôles');
        console.error('Erreur:', error);
      }
    });
  }

  /**
   * Charge toutes les permissions
   */
  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.groupPermissionsByModule();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des permissions');
        console.error('Erreur:', error);
      }
    });
  }

  /**
   * Charge tous les utilisateurs
   */
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.filter(user => user.isActive); // Ne récupérer que les utilisateurs actifs
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des utilisateurs');
        console.error('Erreur:', error);
      }
    });
  }

  /**
   * Gère la sélection d'un utilisateur
   */
  onUserSelection(userId: string): void {
    if (!userId) {
      this.currentRole.userId = '';
      this.currentRole.userFullName = '';
      this.currentRole.displayName = '';
      return;
    }

    const selectedUser = this.users.find(user => user.id === userId);
    if (selectedUser) {
      this.currentRole.userId = userId;
      this.currentRole.userFullName = `${selectedUser.firstName} ${selectedUser.lastName}`;
      this.currentRole.displayName = this.currentRole.userFullName;
    } else {
      this.currentRole.userId = '';
      this.currentRole.userFullName = '';
      this.currentRole.displayName = '';
    }
  }

  /**
   * Vérifie si un utilisateur a déjà un rôle assigné
   */
  isUserAlreadyAssigned(userId: string | undefined): boolean {
    if (!userId) return false;
    
    if (this.isEditing && this.currentRole.userId === userId) {
      return false; // L'utilisateur actuel peut garder son rôle
    }
    return this.roles.some(role => role.userId === userId && role.isActive);
  }

  /**
   * Retourne les utilisateurs disponibles (sans rôle actif assigné)
   */
  getAvailableUsers(): User[] {
    return this.users.filter(user => !this.isUserAlreadyAssigned(user.id!));
  }

  /**
   * Groupe les permissions par module
   */
  groupPermissionsByModule(): void {
    this.permissionsByModule = {};
    this.permissions.forEach(permission => {
      if (!this.permissionsByModule[permission.module]) {
        this.permissionsByModule[permission.module] = [];
      }
      this.permissionsByModule[permission.module].push(permission);
    });
  }

  /**
   * Applique les filtres de recherche et d'affichage
   */
  applyFilters(): void {
    this.filteredRoles = this.roles.filter(role => {
      // Filtre par terme de recherche
      const matchesSearch = !this.searchTerm || 
        role.displayName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        role.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (role.userFullName && role.userFullName.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Filtre par type de rôle
      const matchesType = (this.showSystemRoles && role.isSystemRole) || 
                         (this.showCustomRoles && !role.isSystemRole);

      // Filtre par statut actif
      const matchesStatus = !this.showActiveOnly || role.isActive;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  /**
   * Recherche les rôles
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * Change les filtres d'affichage
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Affiche le formulaire de création
   */
  showCreateForm(): void {
    this.resetForm();
    this.showForm = true;
    console.log('Formulaire de création affiché');
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    this.currentRole = {
      name: '',
      displayName: '',
      description: '',
      department: '',
      project: '',
      permissions: [],
      isActive: true,
      adminAccess: false,
      userManagement: false,
      projectAccess: false,
      reportAccess: false,
      userId: '',
      userFullName: ''
    };
    this.isEditing = false;
    this.editingRoleId = null;
    this.showForm = false;
    
    console.log('Formulaire réinitialisé:', this.currentRole);
  }

  /**
   * Affiche le formulaire de modification avec données complètes depuis la base
   */
  editRole(role: Role): void {
    if (role.isSystemRole) {
      Swal.fire({
        title: 'Action non autorisée',
        text: 'Impossible de modifier un rôle système.',
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Compris',
        customClass: {
          popup: 'swal2-modern-popup',
          confirmButton: 'btn btn-warning'
        },
        buttonsStyling: false
      });
      return;
    }

    if (!role.id) {
      this.showError('Impossible de modifier ce rôle : ID manquant');
      return;
    }

    // Récupérer les données complètes du rôle depuis la base de données
    this.roleService.getRoleById(role.id).subscribe({
      next: (fullRole: Role) => {
        // Pré-remplir le formulaire avec TOUTES les valeurs existantes
        // Utiliser Object.assign pour une copie complète et forcer la détection des changements
        this.currentRole = Object.assign({}, {
          // Copier toutes les propriétés du rôle existant avec valeurs par défaut
          id: fullRole.id,
          name: fullRole.name || '',
          displayName: fullRole.displayName || '',
          description: fullRole.description || '',
          department: fullRole.department || '',
          project: fullRole.project || '',
          permissions: fullRole.permissions ? [...fullRole.permissions] : [],
          isActive: fullRole.isActive !== undefined ? fullRole.isActive : true,
          isSystemRole: fullRole.isSystemRole || false,
          createdAt: fullRole.createdAt,
          updatedAt: fullRole.updatedAt,
          createdBy: fullRole.createdBy,
          adminAccess: fullRole.adminAccess !== undefined ? fullRole.adminAccess : false,
          userManagement: fullRole.userManagement !== undefined ? fullRole.userManagement : false,
          projectAccess: fullRole.projectAccess !== undefined ? fullRole.projectAccess : false,
          reportAccess: fullRole.reportAccess !== undefined ? fullRole.reportAccess : false,
          userId: fullRole.userId || '',
          userFullName: fullRole.userFullName || ''
        });
        
        console.log('Données du rôle chargées pour édition:', this.currentRole);
        console.log('Détails des champs:', {
          name: this.currentRole.name,
          description: this.currentRole.description,
          department: this.currentRole.department,
          project: this.currentRole.project,
          adminAccess: this.currentRole.adminAccess,
          userManagement: this.currentRole.userManagement,
          projectAccess: this.currentRole.projectAccess,
          reportAccess: this.currentRole.reportAccess,
          isActive: this.currentRole.isActive,
          userId: this.currentRole.userId,
          permissions: this.currentRole.permissions
        });
        
        // S'assurer que le formulaire est correctement initialisé
        this.isEditing = true;
        this.editingRoleId = role.id || null;
        
        // Forcer la détection des changements pour le binding
        setTimeout(() => {
          this.showForm = true;
          // Forcer la mise à jour du tree view des permissions
          this.refreshPermissionsView();
          console.log('Formulaire affiché avec les données:', {
            name: this.currentRole.name,
            description: this.currentRole.description,
            department: this.currentRole.department,
            project: this.currentRole.project,
            userId: this.currentRole.userId,
            permissions: this.currentRole.permissions,
            adminAccess: this.currentRole.adminAccess,
            userManagement: this.currentRole.userManagement,
            projectAccess: this.currentRole.projectAccess,
            reportAccess: this.currentRole.reportAccess
          });
        }, 100);
        
        // Afficher un message de confirmation
        this.showSuccess('Formulaire pré-rempli avec les valeurs actuelles du rôle');
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du rôle:', error);
        this.showError('Erreur lors de la récupération des données du rôle');
        
        // En cas d'erreur, utiliser les données disponibles localement avec conservation complète
        this.currentRole = Object.assign({}, {
          id: role.id,
          name: role.name || '',
          displayName: role.displayName || '',
          description: role.description || '',
          department: role.department || '',
          project: role.project || '',
          permissions: role.permissions ? [...role.permissions] : [],
          isActive: role.isActive !== undefined ? role.isActive : true,
          isSystemRole: role.isSystemRole || false,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
          createdBy: role.createdBy,
          adminAccess: role.adminAccess !== undefined ? role.adminAccess : false,
          userManagement: role.userManagement !== undefined ? role.userManagement : false,
          projectAccess: role.projectAccess !== undefined ? role.projectAccess : false,
          reportAccess: role.reportAccess !== undefined ? role.reportAccess : false,
          userId: role.userId || '',
          userFullName: role.userFullName || ''
        });
        
        console.log('Données du rôle (fallback local) chargées pour édition:', this.currentRole);
        this.isEditing = true;
        this.editingRoleId = role.id || null;
        
        // Forcer la détection des changements pour le binding
        setTimeout(() => {
          this.showForm = true;
          // Forcer la mise à jour du tree view des permissions
          this.refreshPermissionsView();
          console.log('Formulaire affiché (fallback) avec les données:', {
            name: this.currentRole.name,
            description: this.currentRole.description,
            department: this.currentRole.department,
            project: this.currentRole.project,
            userId: this.currentRole.userId,
            permissions: this.currentRole.permissions,
            adminAccess: this.currentRole.adminAccess,
            userManagement: this.currentRole.userManagement,
            projectAccess: this.currentRole.projectAccess,
            reportAccess: this.currentRole.reportAccess
          });
        }, 100);
      }
    });
  }

  /**
   * Annule la création/modification
   */
  cancelEdit(): void {
    console.log('Annulation de l\'édition');
    this.resetForm();
    this.showSuccess('Modification annulée');
  }

  /**
   * Sauvegarde le rôle (création ou modification)
   */
  saveRole(): void {
    if (!this.validateRole()) {
      return;
    }

    if (this.isEditing && this.editingRoleId) {
      this.updateRole();
    } else {
      this.createRole();
    }
  }

  /**
   * Valide les données du rôle
   */
  validateRole(): boolean {
    if (!this.currentRole.name.trim()) {
      Swal.fire({
        title: 'Champ requis',
        text: 'Le rôle attribué est obligatoire.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }

    if (!this.currentRole.userId) {
      Swal.fire({
        title: 'Champ requis',
        text: 'Veuillez sélectionner un employé.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }

    if (!this.currentRole.description.trim()) {
      Swal.fire({
        title: 'Champ requis',
        text: 'La description est obligatoire.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }

    if (!this.currentRole.department || this.currentRole.department.trim() === '') {
      Swal.fire({
        title: 'Champ requis',
        text: 'Le département / équipe est obligatoire.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }

    return true;
  }

  /**
   * Crée un nouveau rôle
   */
  createRole(): void {
    this.roleService.createRole(this.currentRole).subscribe({
      next: (role) => {
        Swal.fire({
          title: 'Rôle créé !',
          text: `Le rôle "${this.currentRole.name}" a été assigné à ${this.currentRole.userFullName} avec succès.`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false
        });
        this.loadRoles();
        this.loadUsers(); // Recharger les utilisateurs pour mettre à jour la liste
        this.resetForm();
      },
      error: (error) => {
        Swal.fire({
          title: 'Erreur de création',
          text: 'Erreur lors de la création du rôle : ' + (error.error || error.message),
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
        console.error('Erreur:', error);
      }
    });
  }

  /**
   * Met à jour un rôle existant
   */
  updateRole(): void {
    if (!this.editingRoleId) return;

    this.roleService.updateRole(this.editingRoleId, this.currentRole).subscribe({
      next: (role) => {
        Swal.fire({
          title: 'Rôle modifié !',
          text: `Le rôle "${this.currentRole.name}" pour ${this.currentRole.userFullName} a été modifié avec succès.`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false
        });
        this.loadRoles();
        this.loadUsers(); // Recharger les utilisateurs
        this.resetForm();
      },
      error: (error) => {
        Swal.fire({
          title: 'Erreur de modification',
          text: 'Erreur lors de la modification du rôle : ' + (error.error || error.message),
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
        console.error('Erreur:', error);
      }
    });
  }

  /**
   * Active ou désactive un rôle
   */
  toggleRoleStatus(role: Role): void {
    if (role.isSystemRole) {
      Swal.fire({
        title: 'Action non autorisée',
        text: 'Impossible de modifier le statut d\'un rôle système.',
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Compris',
        customClass: {
          popup: 'swal2-modern-popup',
          confirmButton: 'btn btn-warning'
        },
        buttonsStyling: false
      });
      return;
    }

    if (!role.id) return;

    const action = role.isActive ? 'désactiver' : 'activer';
    const actionPast = role.isActive ? 'désactivé' : 'activé';

    Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} le rôle`,
      text: `Voulez-vous vraiment ${action} le rôle "${role.name}" pour ${role.userFullName} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: role.isActive ? '#dc3545' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Oui, ${action}`,
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'swal2-modern-popup',
        confirmButton: 'btn',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.toggleRoleStatus(role.id!).subscribe({
          next: (updatedRole) => {
            Swal.fire({
              title: `Rôle ${actionPast} !`,
              text: `Le rôle "${role.name}" pour ${role.userFullName} a été ${actionPast} avec succès.`,
              icon: 'success',
              confirmButtonColor: '#28a745',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false
            });
            this.loadRoles();
            this.loadUsers(); // Recharger pour mettre à jour les utilisateurs disponibles
          },
          error: (error) => {
            Swal.fire({
              title: 'Erreur',
              text: 'Erreur lors du changement de statut : ' + (error.error || error.message),
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
            console.error('Erreur:', error);
          }
        });
      }
    });
  }

  /**
   * Supprime un rôle
   */
  deleteRole(role: Role): void {
    if (role.isSystemRole) {
      Swal.fire({
        title: 'Action non autorisée',
        text: 'Impossible de supprimer un rôle système.',
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Compris',
        customClass: {
          popup: 'swal2-modern-popup',
          confirmButton: 'btn btn-warning'
        },
        buttonsStyling: false
      });
      return;
    }

    if (!role.id) return;

    Swal.fire({
      title: 'Confirmer la suppression',
      html: `
        <div class="text-center">
          <div class="mb-3">
            <i class="fas fa-user-shield text-danger" style="font-size: 3rem;"></i>
          </div>
          <p class="mb-2">Êtes-vous sûr de vouloir supprimer ce rôle ?</p>
          <div class="alert alert-info mt-3">
            <strong>Employé :</strong> ${role.userFullName}<br>
            <strong>Rôle :</strong> ${role.name}<br>
            <strong>Description :</strong> ${role.description}<br>
            <strong>Permissions :</strong> ${role.permissions.length} permission(s)
          </div>
          <p class="text-danger small mt-2">
            <i class="fas fa-exclamation-triangle"></i> Cette action est irréversible et libérera l'utilisateur de ce rôle
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="fas fa-trash"></i> Supprimer',
      cancelButtonText: '<i class="fas fa-times"></i> Annuler',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'swal2-modern-popup',
        title: 'swal2-modern-title',
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.roleService.deleteRole(role.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Suppression réussie !',
              text: `Le rôle "${role.name}" pour ${role.userFullName} a été supprimé avec succès.`,
              icon: 'success',
              confirmButtonColor: '#28a745',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'swal2-modern-popup',
                confirmButton: 'btn btn-success'
              },
              buttonsStyling: false,
              timer: 3000,
              timerProgressBar: true
            });
            this.loadRoles();
            this.loadUsers(); // Recharger pour libérer l'utilisateur
          },
          error: (error) => {
            Swal.fire({
              title: 'Erreur de suppression',
              text: 'Erreur lors de la suppression : ' + (error.error || error.message),
              icon: 'error',
              confirmButtonColor: '#dc3545',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'swal2-modern-popup',
                confirmButton: 'btn btn-danger'
              },
              buttonsStyling: false
            });
            console.error('Erreur:', error);
          }
        });
      }
    });
  }

  /**
   * Gère la sélection/désélection des permissions
   */
  onPermissionChange(permissionName: string, isChecked: boolean): void {
    if (isChecked) {
      if (!this.currentRole.permissions.includes(permissionName)) {
        this.currentRole.permissions.push(permissionName);
      }
    } else {
      const index = this.currentRole.permissions.indexOf(permissionName);
      if (index > -1) {
        this.currentRole.permissions.splice(index, 1);
      }
    }
  }

  /**
   * Vérifie si une permission est sélectionnée
   */
  isPermissionSelected(permissionName: string): boolean {
    return this.currentRole.permissions.includes(permissionName);
  }

  /**
   * Force la mise à jour du tree view des permissions
   */
  refreshPermissionsView(): void {
    // Forcer la détection des changements pour le tree view
    // Cette méthode s'assure que les permissions sont correctement affichées
    console.log('Rafraîchissement du tree view des permissions:', this.currentRole.permissions);
    
    // Forcer Angular à redétecter les changements dans les checkboxes
    setTimeout(() => {
      // Trigger change detection for permission checkboxes
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        const event = new Event('change');
        checkbox.dispatchEvent(event);
      });
    }, 50);
  }

  /**
   * Sélectionne/désélectionne toutes les permissions d'un module
   */
  toggleModulePermissions(module: string, isChecked: boolean): void {
    const modulePermissions = this.permissionsByModule[module] || [];
    
    modulePermissions.forEach(permission => {
      this.onPermissionChange(permission.name, isChecked);
    });
  }

  /**
   * Vérifie si toutes les permissions d'un module sont sélectionnées
   */
  isModuleFullySelected(module: string): boolean {
    const modulePermissions = this.permissionsByModule[module] || [];
    return modulePermissions.length > 0 && 
           modulePermissions.every(permission => this.isPermissionSelected(permission.name));
  }

  /**
   * Vérifie si certaines permissions d'un module sont sélectionnées
   */
  isModulePartiallySelected(module: string): boolean {
    const modulePermissions = this.permissionsByModule[module] || [];
    const selectedCount = modulePermissions.filter(permission => 
      this.isPermissionSelected(permission.name)
    ).length;
    
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  }

  /**
   * Affiche un message de succès
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }

  /**
   * Affiche un message d'erreur
   */
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 5000);
  }

  /**
   * Efface les messages
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Retourne les clés des modules pour l'itération
   */
  getModuleKeys(): string[] {
    return Object.keys(this.permissionsByModule);
  }

  /**
   * Retourne l'email de l'utilisateur par son ID
   */
  getUserEmail(userId: string | undefined): string {
    if (!userId) return '';
    const user = this.users.find(u => u.id === userId);
    return user ? user.email || '' : '';
  }

  // Menu management methods
  toggleMenu(roleId: string): void {
    this.openMenuId = this.openMenuId === roleId ? null : roleId;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  isMenuOpen(roleId: string): boolean {
    return this.openMenuId === roleId;
  }

  viewRoleDetails(role: Role): void {
    // TODO: Implement view details functionality
    console.log('Voir détails rôle:', role);
    this.closeMenu();
  }

  editRoleFromMenu(role: Role): void {
    this.editRole(role);
    this.closeMenu();
  }

  deleteRoleFromMenu(role: Role): void {
    this.deleteRole(role);
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