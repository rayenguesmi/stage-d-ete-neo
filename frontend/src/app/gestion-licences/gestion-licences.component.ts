import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { License, LicenseStatus, LicenseType, LICENSE_STATUS_LABELS, LICENSE_TYPE_LABELS } from '../models/license.model';
import { LicenseService } from '../services/license.service';

@Component({
  selector: 'app-gestion-licences',
  templateUrl: './gestion-licences.component.html',
  styleUrls: ['./gestion-licences.component.css']
})
export class GestionLicencesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['licenseKey', 'clientName', 'licenseType', 'status', 'currentUsers', 'maxUsers', 'endDate', 'actions'];
  dataSource = new MatTableDataSource<License>();
  
  licenses: License[] = [];
  filteredLicenses: License[] = [];
  
  // Filtres
  statusFilter: string = '';
  typeFilter: string = '';
  searchTerm: string = '';
  
  // Statistiques
  stats = {
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0
  };

  // Énumérations pour les templates
  LicenseStatus = LicenseStatus;
  LicenseType = LicenseType;
  LICENSE_STATUS_LABELS = LICENSE_STATUS_LABELS;
  LICENSE_TYPE_LABELS = LICENSE_TYPE_LABELS;

  constructor(
    private licenseService: LicenseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadLicenses();
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Exposer Object.keys pour le template
  get ObjectKeys() {
    return Object.keys;
  }

  loadLicenses(): void {
    this.licenseService.getAllLicenses().subscribe({
      next: (licenses) => {
        this.licenses = licenses;
        this.filteredLicenses = licenses;
        this.dataSource.data = licenses;
        this.updateStats();
      },
      error: (error) => {
        this.showError('Erreur lors du chargement des licences');
        console.error('Error loading licenses:', error);
      }
    });
  }

  loadStats(): void {
    this.licenseService.getLicenseStats().subscribe({
      next: (stats) => {
        this.stats = {
          total: stats.activeCount + stats.expiredCount + stats.suspendedCount,
          active: stats.activeCount,
          expired: stats.expiredCount,
          expiringSoon: 0 // À calculer côté client
        };
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  updateStats(): void {
    this.stats.total = this.licenses.length;
    this.stats.active = this.licenses.filter(l => l.status === LicenseStatus.ACTIVE).length;
    this.stats.expired = this.licenses.filter(l => l.status === LicenseStatus.EXPIRED).length;
    this.stats.expiringSoon = this.licenses.filter(l => this.isExpiringSoon(l)).length;
  }

  applyFilters(): void {
    let filtered = this.licenses;

    // Filtre par statut
    if (this.statusFilter) {
      filtered = filtered.filter(license => license.status === this.statusFilter);
    }

    // Filtre par type
    if (this.typeFilter) {
      filtered = filtered.filter(license => license.licenseType === this.typeFilter);
    }

    // Recherche textuelle
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(license => 
        license.licenseKey.toLowerCase().includes(term) ||
        license.clientName.toLowerCase().includes(term)
      );
    }

    this.filteredLicenses = filtered;
    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.typeFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  createLicense(): void {
    // TODO: Ouvrir dialog de création
    console.log('Create license');
  }

  editLicense(license: License): void {
    // TODO: Ouvrir dialog d'édition
    console.log('Edit license:', license);
  }

  deleteLicense(license: License): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la licence ${license.licenseKey} ?`)) {
      this.licenseService.deleteLicense(license.id!).subscribe({
        next: () => {
          this.showSuccess('Licence supprimée avec succès');
          this.loadLicenses();
        },
        error: (error) => {
          this.showError('Erreur lors de la suppression de la licence');
          console.error('Error deleting license:', error);
        }
      });
    }
  }

  renewLicense(license: License): void {
    // TODO: Ouvrir dialog de renouvellement
    console.log('Renew license:', license);
  }

  changeLicenseStatus(license: License, newStatus: LicenseStatus): void {
    this.licenseService.changeLicenseStatus(license.id!, newStatus).subscribe({
      next: (updatedLicense) => {
        const index = this.licenses.findIndex(l => l.id === license.id);
        if (index !== -1) {
          this.licenses[index] = updatedLicense;
          this.applyFilters();
          this.updateStats();
        }
        this.showSuccess('Statut de la licence mis à jour');
      },
      error: (error) => {
        this.showError('Erreur lors du changement de statut');
        console.error('Error changing license status:', error);
      }
    });
  }

  checkAlerts(): void {
    this.licenseService.checkLicensesAndSendAlerts().subscribe({
      next: () => {
        this.showSuccess('Vérification des alertes effectuée');
      },
      error: (error) => {
        this.showError('Erreur lors de la vérification des alertes');
        console.error('Error checking alerts:', error);
      }
    });
  }

  // Méthodes utilitaires
  isExpired(license: License): boolean {
    return new Date(license.endDate) < new Date();
  }

  isExpiringSoon(license: License): boolean {
    const expiryDate = new Date(license.endDate);
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + 30);
    return expiryDate <= alertDate && expiryDate > new Date();
  }

  getDaysUntilExpiry(license: License): number {
    const expiryDate = new Date(license.endDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getUserUsagePercentage(license: License): number {
    return (license.currentUsers / license.maxUsers) * 100;
  }

  getStatusColor(status: LicenseStatus): string {
    switch (status) {
      case LicenseStatus.ACTIVE: return 'primary';
      case LicenseStatus.EXPIRED: return 'warn';
      case LicenseStatus.SUSPENDED: return 'accent';
      case LicenseStatus.REVOKED: return 'warn';
      default: return 'basic';
    }
  }

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
}
