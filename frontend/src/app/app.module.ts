import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { GestionRolesComponent } from './gestion-roles/gestion-roles.component';
import { GestionLicencesComponent } from './gestion-licences/gestion-licences.component';
import { HomeComponent } from './home/home.component';
import { AdministrationComponent } from './administration/administration.component';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';
import { LandingComponent } from './landing/landing.component';
import { AuditSuiviComponent } from './audit-suivi/audit-suivi.component';
import { AuditComponent } from './audit/audit.component';
import { AuthGuard } from './AuthGuard';
import { initializeKeycloak } from './KeycloakInitService';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { Proj1LayoutComponent } from './proj1-layout/proj1-layout.component';
import { ChefProjLayoutComponent } from './chef-proj-layout/chef-proj-layout.component';
import { ChefProjDashboardComponent } from './chef-proj-dashboard/chef-proj-dashboard.component';
import { AssignUsersComponent } from './assign-users/assign-users.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    GestionUtilisateurComponent,
    GestionRolesComponent,
    GestionLicencesComponent,
    HomeComponent,
    AdministrationComponent,
    GestionCampComponent,
    GestionDocComponent,
    GestionExecComponent,
    LandingComponent,
    AuditSuiviComponent,
    AuditComponent,
    AdminLayoutComponent,
    UserLayoutComponent,
    Proj1LayoutComponent,
    ChefProjLayoutComponent,
    ChefProjDashboardComponent,
    AssignUsersComponent,
    UserDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    KeycloakAngularModule
  ],
  providers: [
    AuthGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}