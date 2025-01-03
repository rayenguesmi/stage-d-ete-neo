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
  userId: string | null = null; // ID de l'utilisateur

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Component initialized');
    this.extractRolesFromToken(); // On extrait les rôles lors de l'initialisation
    this.getUserFiles(); // Récupérer les fichiers dès le départ si l'utilisateur est authentifié
  }

  // Extraction des rôles et de l'ID de l'utilisateur à partir du token JWT
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
        this.roles = userRoles;
      } else {
        this.roles = [];
      }

      // Vérification de la présence des rôles spécifiques
      this.hasPdfRole = this.roles.includes('ROLE_PDF');
      this.hasCsvRole = this.roles.includes('ROLE_CSV');
      this.hasXmlRole = this.roles.includes('ROLE_XML');

      // Extraction de l'ID de l'utilisateur à partir du token
      this.userId = payload?.sub; // 'sub' contient l'ID de l'utilisateur
      console.log("ID de l'utilisateur extrait:", this.userId);

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
      console.log('Fichiers après dépôt:', this.uploadedFiles); // Vérification
      this.uploadFiles(); // Appel de l'upload après le dépôt
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
      console.log('Fichiers après sélection:', this.uploadedFiles); // Vérification
      this.uploadFiles(); // Appel de l'upload après la sélection
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
    console.log('Fichiers à uploader:', this.uploadedFiles); // Affiche les fichiers ajoutés
    this.uploadedFiles.forEach((file) => {
      console.log('Ajout du fichier au FormData:', file.name); // Affiche chaque fichier ajouté
      formData.append('file', file, file.name);
    });

    // Vérifier la structure du FormData avant l'envoi
    console.log('FormData avant envoi:', formData);

    // Envoi de la requête HTTP avec le type de réponse en texte brut
    this.http
      .post<string>('http://localhost:8090/api/upload', formData, {
        responseType: 'text' as 'json',
      })
      .subscribe({
        next: (response: string) => {
          console.log('Réponse du serveur:', response); // Affiche la réponse du serveur (texte brut)
          this.showPopupMessage(response, 'success'); // Affiche le message de succès

          // Réinitialiser les fichiers pour la prochaine sélection
          this.uploadedFiles = [];
        },
        error: (error) => {
          console.error("Erreur lors de l'upload:", error); // Affiche l'erreur du serveur
          this.showPopupMessage("Échec de l'upload.", 'error'); // Affiche un message d'erreur
        },
      });
  }

  // Méthode pour récupérer la liste des fichiers depuis le backend
  getUserFiles() {
    if (!this.userId) {
      this.showPopupMessage('Utilisateur non authentifié', 'error');
      return;
    }

    this.http
      .get<any[]>(`http://localhost:8090/api/files/${this.userId}`)
      .subscribe({
        next: (files) => {
          console.log('Fichiers récupérés du serveur:', files);
          this.uploadedFiles = files; // Met à jour la liste des fichiers avec ceux récupérés
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des fichiers:', error);
          this.showPopupMessage(
            'Erreur lors de la récupération des fichiers.',
            'error'
          );
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
}
