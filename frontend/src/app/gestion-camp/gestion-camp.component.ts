import { Component } from '@angular/core';

@Component({
  selector: 'app-gestion-camp',
  templateUrl: './gestion-camp.component.html',
  styleUrls: ['./gestion-camp.component.css'],
})
export class GestionCampComponent {
  searchQuery: string = '';
  tableData: any[] = []; // Liste principale des documents
  pagedTableData: any[] = []; // Données affichées dans le tableau (pagination)
  activeMenuId: number | null = null;
  menuVisible: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 5; // Nombre d'éléments par page
  totalPages: number = 1;
  isEditMode: boolean = false;
  showEditModal: boolean = false;
  showAddModal: boolean = false;
  editData: any = {}; // Exemple : données d'édition
  showPopup = false; // Pour gérer l'affichage du popup

  popupMessage: string = ''; // Message à afficher dans le popup

  constructor() {
    // Initialisation des données (exemple)
    this.tableData = [
      {
        id: 1,
        titre: 'Document A',
        version: '1.0',
        nbRapports: 10,
        date: '2025-01-01',
        nbExecution: 5,
      },
      {
        id: 2,
        titre: 'Document B',
        version: '2.0',
        nbRapports: 20,
        date: '2025-02-01',
        nbExecution: 3,
      },
    ];
    this.updatePagedTableData();
  }

  updatePagedTableData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedTableData = this.tableData.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.tableData.length / this.itemsPerPage);
  }

  generateNewId(): number {
    return this.tableData.length > 0
      ? Math.max(...this.tableData.map((item) => item.id)) + 1
      : 1;
  }

  showPopupMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.popupMessage = `${type.toUpperCase()}: ${message}`;
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 4000);
  }

  exportData(): void {
    console.log('Exportation des données...');
    this.showPopupMessage(
      'Les données ont été exportées avec succès',
      'success'
    );
  }

  reloadPage(): void {
    console.log('Rechargement de la page...');
    this.showPopupMessage('La page a été rechargée', 'info');
    window.location.reload();
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
      const index = this.tableData.findIndex(
        (item) => item.id === this.editData.id
      );
      if (index !== -1) {
        this.tableData[index] = { ...this.editData };
      }
      this.showPopupMessage('Document mis à jour avec succès', 'success');
    } else {
      const newItem = {
        ...this.editData,
        id: this.generateNewId(),
      };
      this.tableData.push(newItem);
      this.showPopupMessage('Nouvelle campagne ajoutée avec succès', 'success');
    }

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

  // Ajout des méthodes manquantes
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
    const duplicatedItem = { ...item, id: this.generateNewId() };
    this.tableData.push(duplicatedItem);
    this.updatePagedTableData();
    this.showPopupMessage('Document dupliqué avec succès', 'success');
  }

  confirmActivation(item: any): void {
    item.disabled = false;
    this.showPopupMessage('Document réactivé', 'success');
  }

  confirmDeactivation(item: any): void {
    item.disabled = true;
    this.showPopupMessage('Document désactivé', 'info');
  }

  confirmDeletion(item: any): void {
    this.tableData = this.tableData.filter((doc) => doc.id !== item.id);
    this.updatePagedTableData();
    this.showPopupMessage('Document supprimé', 'error');
  }

  executeTask(item: any): void {
    this.showPopupMessage(`Tâche exécutée pour ${item.titre}`, 'info');
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
