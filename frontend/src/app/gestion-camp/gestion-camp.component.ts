import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gestion-camp',
  templateUrl: './gestion-camp.component.html',
  styleUrls: ['./gestion-camp.component.css'],
})
export class GestionCampComponent implements OnInit {
  searchQuery: string = '';
  tableData: any[] = []; // Liste principale des campagnes/documents
  pagedTableData: any[] = []; // Données paginées
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  activeMenuId: number | null = null;
  menuVisible: boolean = false;
  showEditModal: boolean = false;
  showAddModal: boolean = false;
  showPopup = false;
  popupMessage: string = '';
  confirmationVisible: boolean = false;
  confirmationMessage: string = '';
  confirmationAction: () => void = () => {};
  editData: any = {};
  isEditMode: boolean = false;
  userId: string | null = null;
  roles: string[] = [];
  hasCampaignRole = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.extractRolesFromToken();
    this.getCampaigns();
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

  getCampaigns(): void {
    if (!this.userId) {
      this.showPopupMessage('Utilisateur non authentifié.', 'error');
      return;
    }

    this.http
      .get<any[]>(`http://localhost:8090/api/campaigns?userId=${this.userId}`)
      .subscribe({
        next: (data) => {
          this.tableData = data;
          this.updatePagedTableData();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des campagnes:', error);
          this.showPopupMessage(
            'Erreur lors du chargement des campagnes.',
            'error'
          );
        },
      });
  }

  updatePagedTableData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedTableData = this.tableData.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.tableData.length / this.itemsPerPage);
  }

  generateNewId(): number {
    return this.tableData.length > 0
      ? Math.max(...this.tableData.map((item) => item.id || 0)) + 1
      : 1;
  }

  showPopupMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.popupMessage = `${type.toUpperCase()}: ${message}`;
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 4000);
  }

  exportData(): void {
    this.http
      .get(`http://localhost:8090/api/campaigns/export`, {
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'text/csv;charset=utf-8;',
          });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.setAttribute('download', 'campaigns.csv');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          this.showPopupMessage(
            'Les campagnes ont été exportées avec succès.',
            'success'
          );
        },
        error: (error) => {
          console.error("Erreur lors de l'exportation:", error);
          this.showPopupMessage("Erreur lors de l'exportation.", 'error');
        },
      });
  }

  duplicateCampaign(campaignId: string): void {
    this.http
      .post<any>(
        `http://localhost:8090/api/campaigns/${campaignId}/duplicate`,
        {}
      )
      .subscribe({
        next: () => {
          this.showPopupMessage('Campagne dupliquée avec succès.', 'success');
          this.getCampaigns();
        },
        error: (error) => {
          console.error('Erreur lors de la duplication:', error);
          this.showPopupMessage('Échec de la duplication.', 'error');
        },
      });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.isEditMode = false;
    this.editData = {};
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
  }

  submitEditForm(): void {
    if (this.isEditMode) {
      // Si on est en mode édition, envoyer les modifications au backend
      const updatedItem = { ...this.editData }; // Récupérer les données modifiées

      this.http
        .put(
          `http://localhost:8090/api/campaigns/${updatedItem.id2}`,
          updatedItem
        )
        .subscribe({
          next: () => {
            // Afficher un message de succès
            this.showPopupMessage('Campagne modifiée avec succès.', 'success');
            // Rafraîchir les campagnes après la modification
            this.getCampaigns();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.showPopupMessage('Erreur lors de la modification.', 'error');
          },
        });
    } else {
      // Sinon, c'est une nouvelle campagne, on l'ajoute
      if (
        !this.editData.titre ||
        !this.editData.version ||
        !this.editData.date ||
        !this.editData.nbExecution
      ) {
        this.showPopupMessage(
          'Tous les champs obligatoires doivent être remplis!',
          'error'
        );
        return;
      }

      const generatedId = this.generateNewId(); // Générer un ID entier simple
      const newItem = {
        ...this.editData,
        id: generatedId, // ID entier
        id2: generatedId, // Même ID utilisé pour id2
      };
      this.http.post('http://localhost:8090/api/campaigns', newItem).subscribe({
        next: () => {
          this.showPopupMessage(
            'Nouvelle campagne ajoutée avec succès',
            'success'
          );
          this.getCampaigns(); // Rafraîchir les données
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout de la campagne:", error);
          this.showPopupMessage(
            "Erreur lors de l'ajout de la campagne",
            'error'
          );
        },
      });
    }

    // Mettre à jour la table paginée après l'ajout ou la modification
    this.updatePagedTableData();
    this.closeModal();
  }

  openModal(item: any): void {
    this.showEditModal = true;
    this.isEditMode = true;
    this.editData = { ...item };
  }

  filterTable(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      this.pagedTableData = this.tableData.filter(
        (item) =>
          item.titre.toLowerCase().includes(query) ||
          item.version.toLowerCase().includes(query) ||
          item.nbRapports.toString().includes(query) ||
          item.date.includes(query) ||
          item.nbExecution.toString().includes(query)
      );
    } else {
      this.updatePagedTableData();
    }
  }

  sortByColumn(column: string): void {
    this.tableData.sort((a, b) => (a[column] > b[column] ? 1 : -1));
    this.updatePagedTableData();
  }

  toggleMenu(event: Event, id: number): void {
    event.stopPropagation();
    this.menuVisible = !this.menuVisible || this.activeMenuId !== id;
    this.activeMenuId = this.menuVisible ? id : null;
  }
  confirmDuplication(item: any): void {
    this.confirmAction('Voulez-vous vraiment dupliquer cet élément ?', () => {
      // Générer un nouvel ID unique pour la duplication
      const duplicatedItem = {
        ...item,
        id: this.generateNewId(), // Utiliser un ID unique
        id2: this.generateNewId(), // Assurez-vous de l'ID id2 aussi
      };

      // Ajouter l'élément dupliqué à la liste
      this.tableData.push(duplicatedItem);

      // Mettre à jour les données paginées pour refléter la nouvelle ligne
      this.updatePagedTableData();

      // Afficher un message de succès
      this.showPopupMessage('Document dupliqué avec succès', 'success');

      // Fermer la popup de confirmation
      this.closeConfirmation();
    });
  }

  // Méthode générique de confirmation qui montre le message et exécute l'action
  confirmAction(message: string, action: () => void): void {
    this.confirmationMessage = message;
    this.confirmationAction = action;
    this.confirmationVisible = true; // Afficher la popup de confirmation
  }

  confirmActivation(item: any): void {
    this.confirmAction('Voulez-vous vraiment activer cet élément ?', () => {
      item.disabled = false;
      this.showPopupMessage('Document réactivé', 'success');
    });
  }

  confirmDeactivation(item: any): void {
    this.confirmAction('Voulez-vous vraiment désactiver cet élément ?', () => {
      item.disabled = true;
      this.showPopupMessage('Document désactivé', 'info');
    });
  }

  confirmDeletion(item: any): void {
    this.confirmAction('Voulez-vous vraiment supprimer cet élément ?', () => {
      const index = this.tableData.indexOf(item);
      if (index !== -1) {
        this.tableData.splice(index, 1);
      }
      this.updatePagedTableData();
      this.showPopupMessage('Document supprimé', 'error');
    });
  }

  executeTask(item: any): void {
    this.confirmAction('Voulez-vous vraiment exécuter cette tâche ?', () => {
      this.showPopupMessage(`Tâche exécutée pour ${item.titre}`, 'info');
    });
  }

  closeConfirmation(): void {
    this.confirmationVisible = false;
    this.confirmationMessage = '';
    this.confirmationAction = () => {};
  }

  proceedWithConfirmation(): void {
    if (this.confirmationAction) {
      this.confirmationAction(); // Exécuter l'action (par exemple, duplication, suppression)
    }
    this.closeConfirmation(); // Fermer la popup après avoir confirmé l'action
  }

  reloadPage(): void {
    this.showPopupMessage('La page a été rechargée', 'info');
    window.location.reload();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedTableData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedTableData();
    }
  }
}
