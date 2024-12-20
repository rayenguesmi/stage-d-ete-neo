import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-gestion-doc',
  templateUrl: './gestion-doc.component.html',
  styleUrls: ['./gestion-doc.component.css'],
})
export class GestionDocComponent implements OnInit {
  uploadedFiles: File[] = [];
  popupMessage = '';
  showPopup = false;
  roles: string[] = [];
  hasPdfRole: boolean = false;
  hasCsvRole: boolean = false;
  hasXmlRole: boolean = false;
  message: string = ''; // Message à afficher sur la page HTML

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.extractRolesFromToken(); // On extrait les rôles lors de l'initialisation
  }

  // Extraction des rôles à partir du token JWT
  extractRolesFromToken() {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Affichage du token dans la console

    if (token) {
      const payload = this.decodeJwtPayload(token);
      console.log('Payload:', payload); // Affichage du payload dans la console

      // Extraction des rôles à partir de realm_access.roles
      this.roles = payload?.realm_access?.roles || [];
      console.log('Roles extraits:', this.roles); // Affichage des rôles extraits

      // Filtrer les rôles pour garder seulement ceux qui nous intéressent
      const allowedRoles = ['ROLE_PDF', 'ROLE_CSV', 'ROLE_XML'];
      const userRoles = this.roles.filter((role) =>
        allowedRoles.includes(role)
      );

      if (userRoles.length > 0) {
        // Si des rôles valides sont trouvés, on les assigne à `this.roles`
        this.roles = userRoles;
      } else {
        // Si aucun rôle valide n'est trouvé
        this.roles = [];
      }

      // Vérification de la présence des rôles spécifiques
      this.hasPdfRole = this.roles.includes('ROLE_PDF');
      this.hasCsvRole = this.roles.includes('ROLE_CSV');
      this.hasXmlRole = this.roles.includes('ROLE_XML');

      this.setMessage(); // Mise à jour du message en fonction des rôles
    } else {
      console.log('Aucun token trouvé.'); // Message si aucun token n'est trouvé
      this.message = 'Aucun token trouvé. Veuillez vous reconnecter.'; // Message d'erreur
    }
  }

  // Méthode pour décoder le payload du JWT
  private decodeJwtPayload(token: string): any {
    const base64Url = token.split('.')[1]; // Récupérer la partie Payload (2ème partie du JWT)
    const base64 = base64Url.replace('-', '+').replace('_', '/'); // Réparer la chaîne Base64
    const jsonPayload = atob(base64); // Décoder en base64
    return JSON.parse(jsonPayload); // Parser le JSON
  }

  // Méthode pour définir un message en fonction des rôles
  private setMessage() {
    if (this.hasPdfRole && this.hasCsvRole) {
      this.message =
        'Vous pouvez télécharger à la fois des fichiers PDF et CSV.';
    } else if (this.hasPdfRole) {
      this.message = 'Vous pouvez télécharger des fichiers PDF.';
    } else if (this.hasCsvRole) {
      this.message = 'Vous pouvez télécharger des fichiers CSV.';
    } else {
      this.message =
        "Vous n'avez pas de permission pour télécharger des fichiers.";
    }
  }

  // Gestion des fichiers déposés
  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (this.isAllowedFileType(file)) {
          this.uploadedFiles.push(file);
        } else {
          this.showPopupMessage(
            `Type de fichier non autorisé : ${file.name}`,
            'warning'
          );
        }
      }
    }
  }

  // Empêcher le comportement par défaut du dragover
  preventDefault(event: DragEvent) {
    event.preventDefault();
  }

  // Déclencher l'input de fichier
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLElement;
    fileInput.click();
  }

  // Gestion de la sélection des fichiers
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (this.isAllowedFileType(file)) {
          this.uploadedFiles.push(file);
        } else {
          this.showPopupMessage(
            `Type de fichier non autorisé : ${file.name}`,
            'warning'
          );
        }
      }
    }
  }

  // Vérification du type de fichier
  isAllowedFileType(file: File): boolean {
    const allowedExtensions = ['csv', 'xml', 'pdf'];
    const allowedTypes = [
      'text/csv',
      'application/xml',
      'application/pdf',
      'text/xml',
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    return (
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension)
    );
  }

  // Méthode pour télécharger les fichiers
  uploadFiles() {
    if (this.uploadedFiles.length === 0) {
      this.showPopupMessage(
        'Veuillez sélectionner des fichiers à télécharger.',
        'info'
      );
      return;
    }

    const formData = new FormData();
    this.uploadedFiles.forEach((file) => {
      formData.append('file', file);
    });

    this.http
      .post<{ message: string }>('http://localhost:9090/api/upload', formData)
      .subscribe({
        next: (response) => {
          this.showPopupMessage(response.message, 'success');
          this.uploadedFiles = []; // Réinitialiser la liste après le téléchargement
        },
        error: (error) => {
          console.error("Erreur lors de l'upload :", error);
          this.showPopupMessage("Échec de l'upload.", 'error');
        },
      });
  }

  // Méthode pour afficher un message popup
  showPopupMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) {
    this.popupMessage = `${type.toUpperCase()}: ${message}`;
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 4000);
  }

  // Méthode pour télécharger un fichier PDF
  downloadPdf() {
    if (this.hasPdfRole) {
      this.http
        .get('your-api-endpoint/pdf', { responseType: 'blob' })
        .subscribe(
          (response: Blob) => {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(response);
            link.download = 'file.pdf';
            link.click();
          },
          (error) => {
            console.error('Erreur lors du téléchargement du PDF', error);
          }
        );
    }
  }

  // Méthode pour télécharger un fichier CSV
  downloadCsv() {
    if (this.hasCsvRole) {
      this.http
        .get('your-api-endpoint/csv', { responseType: 'blob' })
        .subscribe(
          (response: Blob) => {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(response);
            link.download = 'file.csv';
            link.click();
          },
          (error) => {
            console.error('Erreur lors du téléchargement du CSV', error);
          }
        );
    }
  }
}
