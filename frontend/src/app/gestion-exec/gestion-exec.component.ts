import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gestion-exec',
  templateUrl: './gestion-exec.component.html',
  styleUrls: ['./gestion-exec.component.css'],
})
export class GestionExecComponent implements OnInit {
  executions: any[] = [];

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
  userName: string = '';
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
  isEditMode: boolean = false; // Par défaut, on est en mode création
  tableData: any[] = []; // Liste principale des campagnes
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.extractRolesFromToken();
    this.loadCampaigns();
    this.getExecutions();
    this.updatePagedTableData();
  }
  loadCampaigns(): void {
    this.getCampaigns();
  }

  private extractRolesFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = this.decodeJwtPayload(token);
      this.roles = payload?.realm_access?.roles || [];
      this.userId = payload?.sub;
      this.userName =
        payload?.name || payload?.preferred_username || 'Utilisateur inconnu'; // Extraction du nom de l'utilisateur
      console.log("Nom de l'utilisateur :", this.userName);
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
  // Méthode pour soumettre le formulaire
  submitExecForm(): void {
    console.log('editExecData:', this.editExecData);
    console.log("Nom de l'utilisateur connecté:", this.userName);

    if (
      !this.selectedCampaignName ||
      !this.editExecData.updatedDate ||
      !this.userName // Vérifier que userName n'est pas vide
    ) {
      this.showPopupMessage(
        'Tous les champs obligatoires doivent être remplis.',
        'error'
      );
      return;
    }

    const newExecution = {
      campaignId: this.selectedCampaignName,
      updatedDate: this.editExecData.updatedDate,
      requestedBy: this.userName, // Utiliser directement le nom de l'utilisateur connecté
      status: this.editExecData.status,
      result: this.editExecData.result,
      id: this.generateNewId(),
    };

    this.http
      .post('http://localhost:8090/api/executions', newExecution)
      .subscribe({
        next: () => {
          this.showPopupMessage(
            'Nouvelle exécution ajoutée avec succès.',
            'success'
          );
          this.getExecutions(); // Rafraîchir la liste des exécutions
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout de l'exécution:", error);
          this.showPopupMessage(
            "Erreur lors de l'ajout de l'exécution.",
            'error'
          );
        },
      });
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
      requestedBy: this.userName, // Remplir avec le nom de l'utilisateur
      status: 'En cours',
      result: 'En attente',
    };
  }

  getExecutions(): void {
    this.http
      .get<any[]>(`http://localhost:8090/api/executions?userId=${this.userId}`)
      .subscribe({
        next: (data: any[]) => {
          console.log('Données des exécutions récupérées:', data);

          // Mapper les données de l'API pour correspondre aux colonnes du tableau
          this.executions = data.map((execution) => {
            console.log('Statut:', execution.statut); // Vérifier la valeur
            return {
              id: execution.id,
              campaignId: execution.nomDeCampagne,
              updatedDate: execution.dateMiseAJour,
              status: execution.statut, // Utiliser 'statut'
              requestedBy: execution.demandePar,
              result: execution.resultat, // Utiliser 'resultat'
            };
          });

          // Mettre à jour la table paginée avec les données mappées
          this.updatePagedTableData();
          console.log('table', this.pagedTableData);
        },
        error: (error) => {
          console.error(
            'Erreur lors de la récupération des exécutions:',
            error
          );

          this.showPopupMessage(
            'Erreur lors de la récupération des exécutions.',
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
  exportData(): void {
    this.http
      .get('http://localhost:8090/api/executions/export', {
        responseType: 'blob',
      })
      .subscribe({
        next: (response) => {
          const link = document.createElement('a');
          const url = window.URL.createObjectURL(response);
          link.href = url;
          link.setAttribute('download', 'executions.csv'); // Change file name to 'executions.csv'
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.showPopupMessage(
            'Les exécutions ont été exportées avec succès.',
            'success'
          );
        },
        error: (error) => {
          console.error("Erreur lors de l'exportation:", error);
          this.showPopupMessage("Erreur lors de l'exportation.", 'error');
        },
      });
  }
}
