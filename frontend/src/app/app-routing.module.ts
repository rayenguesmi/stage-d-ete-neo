import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './AuthGuard';
import { AdministrationComponent } from './administration/administration.component';
import { AuditSuiviComponent } from './audit-suivi/audit-suivi.component';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';
import { GestionLicencesComponent } from './gestion-licences/gestion-licences.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { HomeComponent } from './home/home.component';
import { LandingComponent } from './landing/landing.component';

// Import du nouveau composant
import { UploadDocumentComponent } from './gestion-doc/upload-document/upload-document.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'gestionnaire-de-doc', component: GestionDocComponent },
      { path: 'upload-document', component: UploadDocumentComponent },  // <-- Nouvelle route
      { path: 'g-de-campagne', component: GestionCampComponent },
      { path: 'g-dexecution', component: GestionExecComponent },
      { path: 'administration', component: AdministrationComponent },
      { path: 'gestion-licences', component: GestionLicencesComponent },
      { path: 'gestion-utilisateur', component: GestionUtilisateurComponent },
      { path: 'audit-suivi', component: AuditSuiviComponent },
    ],
  },
  { path: '**', redirectTo: 'home' }, // Route par défaut
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
