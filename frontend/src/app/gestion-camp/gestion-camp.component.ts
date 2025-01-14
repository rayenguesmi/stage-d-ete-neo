import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gestion-camp',
  templateUrl: './gestion-camp.component.html',
  styleUrls: ['./gestion-camp.component.css'],
})
export class GestionCampComponent implements OnInit {
  isAscending: boolean = true;
  tableauData: any[] = [
    {
      id: 1,
      titre: 'Document 1',
      version: '1.0',
      nbRapports: 5,
      date: '2024-01-12',
      nbExecution: 2,
    },
    {
      id: 2,
      titre: 'Document 2',
      version: '1.1',
      nbRapports: 3,
      date: '2024-02-14',
      nbExecution: 4,
    },
    // Ajoutez plus de données ici
  ];
  filteredTableData: any[] = [];
  pagedTableData: any[] = [];
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  menuVisible: boolean = false;
  activeMenuId: number | null = null;

  ngOnInit(): void {
    this.updateTableData();
  }

  updateTableData(): void {
    this.filteredTableData = this.tableauData.filter((item) =>
      item.titre.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.totalPages = Math.ceil(
      this.filteredTableData.length / this.itemsPerPage
    );
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.pagedTableData = this.filteredTableData.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  filterTable(): void {
    this.updateTableData();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  toggleMenu(event: Event, id: number): void {
    this.menuVisible = this.activeMenuId !== id || !this.menuVisible;
    this.activeMenuId = this.menuVisible ? id : null;
  }

  sortByDate(): void {
    this.filteredTableData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.updatePagination();
  }

  confirmDuplication(item: any): void {
    const newItem = { ...item, id: this.tableauData.length + 1 };
    this.tableauData.push(newItem);
    this.updateTableData();
  }

  confirmDeletion(item: any): void {
    this.tableauData = this.tableauData.filter((data) => data.id !== item.id);
    this.updateTableData();
  }
  // Ajouter cette propriété pour stocker l'élément sélectionné
  selectedItem: any = null;

  // Ajouter cette méthode pour ouvrir le modal
  openModal(item: any): void {
    this.selectedItem = item; // Stocker les données de l'élément sélectionné
    alert(`Modifier l'élément : ${JSON.stringify(item)}`);
  }
  addTask(): void {
    console.log('Ajouter une tâche');
    // Logique pour ajouter une tâche
  }

  exportData(): void {
    console.log('Exporter les données');
    // Logique pour exporter les données
  }

  reloadPage(): void {
    console.log('Recharger la page');
    window.location.reload();
  }

  executeTask(item: any): void {
    console.log(`Lancer l'exécution pour l'élément :`, item);
    // Logique pour lancer l'exécution
  }

  archiveTask(item: any): void {
    console.log(`Archiver l'élément :`, item);
    // Logique pour archiver
  }

  sortByColumn(column: string): void {
    this.filteredTableData.sort((a: any, b: any) => {
      if (a[column] > b[column]) {
        return this.isAscending ? 1 : -1;
      }
      if (a[column] < b[column]) {
        return this.isAscending ? -1 : 1;
      }
      return 0;
    });
    this.isAscending = !this.isAscending; // Alterner l'ordre de tri
    this.updatePagination();
  }
}
