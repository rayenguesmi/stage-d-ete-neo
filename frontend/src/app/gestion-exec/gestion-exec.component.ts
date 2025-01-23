import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gestion-exec',
  templateUrl: './gestion-exec.component.html',
  styleUrls: ['./gestion-exec.component.css'],
})
export class GestionExecComponent implements OnInit {
  executions = [
    {
      id: 1,
      campaignId: 'Campagne 123',
      updatedDate: '2025-01-23',
      status: 'Terminé',
      requestedBy: 'Utilisateur A',
      result: 'Succès',
    },
    {
      id: 2,
      campaignId: 'Campagne 124',
      updatedDate: '2025-01-22',
      status: 'En cours',
      requestedBy: 'Utilisateur B',
      result: 'En attente',
    },
    {
      id: 3,
      campaignId: 'Campagne 125',
      updatedDate: '2025-01-21',
      status: 'Annulé',
      requestedBy: 'Utilisateur C',
      result: 'Échec',
    },
    {
      id: 4,
      campaignId: 'Campagne 126',
      updatedDate: '2025-01-30',
      status: 'En cours',
      requestedBy: 'Utilisateur D',
      result: 'Succès',
    },
  ];

  users = ['User 1', 'User 2', 'User 3'];
  editExecData: any = {
    campaignId: '',
    updatedDate: '',
    requestedBy: '',
    status: 'En cours',
    result: 'En attente',
  };
  pagedTableData: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  showPopup = false;
  popupMessage: string = '';
  searchQuery: string = '';
  sortOrder: { [key: string]: 'asc' | 'desc' } = {};
  showAddExecModal: boolean = false;
  isEditModeExec: boolean = false;
  listexecutions: any[] = [];
  campaigns: any[] = [];
  userId: string | null = null;
  roles: string[] = [];
  hasCampaignRole = false;
  executionMenuVisible: boolean = false;
  activeExecutionMenuId: number | null = null;
  selectedCampaignName: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.extractRolesFromToken();
    this.loadCampaigns();
    this.updatePagedTableData();
  }

  private extractRolesFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = this.decodeJwtPayload(token);
      this.roles = payload?.realm_access?.roles || [];
      this.userId = payload?.sub;
      this.hasCampaignRole = this.roles.includes('ROLE_CAMPAIGN');
    } else {
      this.showPopupMessage(
        'Aucun token trouvé. Veuillez vous reconnecter.',
        'error'
      );
    }
  }

  private decodeJwtPayload(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  }

  openAddExec(): void {
    this.showAddExecModal = true;
    this.isEditModeExec = false;
    this.resetExecForm();
  }

  closeExecModal(): void {
    this.showAddExecModal = false;
  }
  submitExecForm(): void {
    console.log('editExecData:', this.editExecData);
    if (
      !this.selectedCampaignName ||
      !this.editExecData.updatedDate ||
      !this.editExecData.requestedBy
    ) {
      this.showPopupMessage(
        'Tous les champs obligatoires doivent être remplis.',
        'error'
      );
      return;
    }

    const newExecution = {
      campaignId: this.selectedCampaignName, // Utilisez campaignId ici
      updatedDate: this.editExecData.updatedDate,
      requestedBy: this.editExecData.requestedBy,
      status: this.editExecData.status,
      result: this.editExecData.result,
      id: this.generateNewId(), // Génération automatique de l'ID
    };

    this.executions.push(newExecution);
    this.showPopupMessage('Nouvelle exécution ajoutée avec succès.', 'success');

    this.updatePagedTableData();
    this.closeExecModal();
    this.resetExecForm();
  }

  generateNewId(): number {
    const newId =
      this.executions.length > 0
        ? Math.max(...this.executions.map((exec) => exec.id)) + 1
        : 1;

    console.log('ID généré:', newId); // Debug: afficher l'ID généré
    return newId;
  }

  resetExecForm(): void {
    this.editExecData = {
      campaignId: '',
      updatedDate: '',
      requestedBy: '',
      status: 'En cours',
      result: 'En attente',
    };
  }

  loadCampaigns(): void {
    this.getCampaigns();
  }

  getCampaigns(): void {
    if (!this.userId) {
      this.showPopupMessage('Utilisateur non authentifié.', 'error');
      return;
    }

    this.http
      .get<any[]>(`http://localhost:8090/api/campaigns?userId=${this.userId}`)
      .subscribe({
        next: (data: any[]) => {
          console.log('Campagnes récupérées:', data);
          this.campaigns = data;
          this.updatePagedTableData();
        },
        error: (error: any) => {
          console.error('Erreur lors de la récupération des campagnes:', error);
          this.showPopupMessage(
            'Erreur lors du chargement des campagnes.',
            'error'
          );
        },
      });
  }

  toggleExecutionMenu(event: MouseEvent, executionId: number): void {
    event.stopPropagation();
    this.activeExecutionMenuId =
      this.activeExecutionMenuId === executionId ? null : executionId;
    this.executionMenuVisible = this.activeExecutionMenuId !== null;
  }

  sortByColumn(column: string): void {
    this.sortOrder[column] = this.sortOrder[column] === 'asc' ? 'desc' : 'asc';
    const orderMultiplier = this.sortOrder[column] === 'asc' ? 1 : -1;

    this.executions.sort((a: Record<string, any>, b: Record<string, any>) => {
      if (a[column] > b[column]) return orderMultiplier;
      if (a[column] < b[column]) return -orderMultiplier;
      return 0;
    });

    this.updatePagedTableData();
  }

  updatePagedTableData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedTableData = this.executions.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.executions.length / this.itemsPerPage);
  }

  editExecution(execution: any): void {
    console.log("Modification de l'exécution", execution);
  }

  putOnHoldExecution(execution: any): void {
    console.log('Exécution mise en attente', execution);
    execution.status = 'En attente';
  }

  deleteExecution(execution: any): void {
    const index = this.executions.findIndex((e) => e.id === execution.id);
    if (index !== -1) {
      this.executions.splice(index, 1);
    }
  }

  reloadPage(): void {
    this.showPopupMessage('La page a été rechargée', 'info');
    window.location.reload();
  }

  showPopupMessage(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ): void {
    this.popupMessage = `${type.toUpperCase()}: ${message}`;
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 4000);
  }

  filterTable(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.executions = this.executions.filter(
        (execution) =>
          execution.campaignId.toLowerCase().includes(query) ||
          execution.updatedDate.includes(query) ||
          execution.status.toLowerCase().includes(query) ||
          execution.requestedBy.toLowerCase().includes(query) ||
          execution.result.toLowerCase().includes(query)
      );
    }
  }
  exportData(): void {}

  // Méthode appelée lorsqu'une campagne est sélectionnée
  onCampaignSelectionChange(): void {
    // Affiche un message pop-up pour indiquer la sélection de la campagne
    this.showPopupMessage(
      `Nom de la campagne sélectionnée : ${this.selectedCampaignName}`,
      'info'
    );

    // Mettre à jour la table avec le nom de la campagne sélectionnée
    this.executions.forEach((execution) => {
      execution.campaignId = this.selectedCampaignName; // Met à jour la campagne de l'exécution
    });
    this.updatePagedTableData(); // Mettre à jour la pagination après la mise à jour de la table
  }
}
