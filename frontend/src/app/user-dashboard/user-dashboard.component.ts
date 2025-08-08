import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {

  currentDate: Date = new Date();
  private subscription: Subscription = new Subscription();

  // Statistiques principales
  totalDocuments = 0;
  totalCampaigns = 0;
  totalExecutions = 0;

  // Statistiques détaillées
  pendingDocuments = 0;
  activeCampaigns = 0;
  runningExecutions = 0;

  // Activités récentes
  recentActivities: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserStats();
    this.loadRecentActivities();
    
    // Mettre à jour les données en temps réel
    setInterval(() => {
      this.updateRealTimeData();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadUserStats(): void {
    // Simuler le chargement des statistiques utilisateur
    // Dans un vrai projet, ces données viendraient d'un service
    this.totalDocuments = Math.floor(Math.random() * 50) + 10;
    this.totalCampaigns = Math.floor(Math.random() * 20) + 5;
    this.totalExecutions = Math.floor(Math.random() * 100) + 20;
    
    this.pendingDocuments = Math.floor(Math.random() * 10) + 1;
    this.activeCampaigns = Math.floor(Math.random() * 8) + 2;
    this.runningExecutions = Math.floor(Math.random() * 5) + 1;
  }

  private loadRecentActivities(): void {
    // Simuler des activités récentes
    const actions = [
      'Importation document',
      'Validation document',
      'Création campagne',
      'Lancement exécution',
      'Modification document',
      'Arrêt exécution',
      'Recherche document',
      'Annotation document'
    ];

    const resources = [
      'Contrat_Client_2025.pdf',
      'Rapport_Mensuel.docx',
      'Campagne_Marketing_Q1',
      'Execution_Batch_001',
      'Facture_Janvier.pdf',
      'Campagne_RH_Recrutement',
      'Document_Procedure.pdf',
      'Execution_Nightly_Backup'
    ];

    const types = ['Document', 'Campagne', 'Exécution'];
    const statuses = ['success', 'pending', 'failed'];

    this.recentActivities = Array.from({ length: 8 }, (_, i) => ({
      action: actions[Math.floor(Math.random() * actions.length)],
      resource: resources[Math.floor(Math.random() * resources.length)],
      type: types[Math.floor(Math.random() * types.length)],
      time: this.getRandomTime(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }));
  }

  private getRandomTime(): string {
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 480); // 8 heures
    const time = new Date(now.getTime() - randomMinutes * 60000);
    return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private updateRealTimeData(): void {
    this.currentDate = new Date();
    
    // Simuler des changements dans les statistiques
    if (Math.random() > 0.7) {
      this.runningExecutions = Math.max(0, this.runningExecutions + (Math.random() > 0.5 ? 1 : -1));
    }
    
    if (Math.random() > 0.8) {
      this.pendingDocuments = Math.max(0, this.pendingDocuments + (Math.random() > 0.5 ? 1 : -1));
    }
  }

  // Navigation vers les différentes sections
  navigateToDocuments(action: string): void {
    switch (action) {
      case 'upload':
        this.router.navigate(['/user/gestionnaire-de-doc'], { queryParams: { action: 'upload' } });
        break;
      case 'search':
        this.router.navigate(['/user/gestionnaire-de-doc'], { queryParams: { action: 'search' } });
        break;
      case 'validate':
        this.router.navigate(['/user/gestionnaire-de-doc'], { queryParams: { action: 'validate' } });
        break;
      default:
        this.router.navigate(['/user/gestionnaire-de-doc']);
    }
    this.addActivity('Navigation vers Gestion Documents', 'Gestion Documents', 'Document');
  }

  navigateToCampaigns(action: string): void {
    switch (action) {
      case 'create':
        this.router.navigate(['/user/g-de-campagne'], { queryParams: { action: 'create' } });
        break;
      case 'manage':
        this.router.navigate(['/user/g-de-campagne'], { queryParams: { action: 'manage' } });
        break;
      case 'track':
        this.router.navigate(['/user/g-de-campagne'], { queryParams: { action: 'track' } });
        break;
      default:
        this.router.navigate(['/user/g-de-campagne']);
    }
    this.addActivity('Navigation vers Gestion Campagnes', 'Gestion Campagnes', 'Campagne');
  }

  navigateToExecutions(action: string): void {
    switch (action) {
      case 'start':
        this.router.navigate(['/user/g-execution'], { queryParams: { action: 'start' } });
        break;
      case 'monitor':
        this.router.navigate(['/user/g-execution'], { queryParams: { action: 'monitor' } });
        break;
      case 'history':
        this.router.navigate(['/user/g-execution'], { queryParams: { action: 'history' } });
        break;
      default:
        this.router.navigate(['/user/g-execution']);
    }
    this.addActivity('Navigation vers Gestion Exécutions', 'Gestion Exécutions', 'Exécution');
  }

  private addActivity(action: string, resource: string, type: string): void {
    const newActivity = {
      action: action,
      resource: resource,
      type: type,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'success'
    };

    this.recentActivities.unshift(newActivity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
  }

  // Méthodes utilitaires pour l'affichage
  getStatusClass(status: string): string {
    switch (status) {
      case 'success': return 'status-success';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-info';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'success': return 'Succès';
      case 'pending': return 'En attente';
      case 'failed': return 'Échec';
      default: return 'Info';
    }
  }

  getDocumentProgress(): number {
    if (this.totalDocuments === 0) return 0;
    return Math.min(100, (this.pendingDocuments / this.totalDocuments) * 100);
  }

  getCampaignProgress(): number {
    if (this.totalCampaigns === 0) return 0;
    return Math.min(100, (this.activeCampaigns / this.totalCampaigns) * 100);
  }

  getExecutionProgress(): number {
    if (this.totalExecutions === 0) return 0;
    return Math.min(100, (this.runningExecutions / this.totalExecutions) * 100);
  }
}

