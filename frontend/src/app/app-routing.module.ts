import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './AuthGuard';
import { AdminRoleGuard } from './admin-role.guard';
import { UserRoleGuard } from './user-role.guard';
import { Proj1RoleGuard } from './proj1-role.guard';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import { Proj1LayoutComponent } from './proj1-layout/proj1-layout.component';
import { AdministrationComponent } from './administration/administration.component';
import { AuditSuiviComponent } from './audit-suivi/audit-suivi.component';
import { AuditComponent } from './audit/audit.component';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';
import { GestionLicencesComponent } from './gestion-licences/gestion-licences.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { GestionRolesComponent } from './gestion-roles/gestion-roles.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  // Routes Admin avec layout Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminRoleGuard],
    children: [
      { 
        path: 'dashboard', 
        component: HomeComponent
      },
      { 
        path: 'gestionnaire-de-doc', 
        component: GestionDocComponent
      },
      { 
        path: 'g-de-campagne', 
        component: GestionCampComponent
      },
      { 
        path: 'g-dexecution', 
        component: GestionExecComponent
      },
      { 
        path: 'administration', 
        component: AdministrationComponent
      },
      { 
        path: 'gestion-licences', 
        component: GestionLicencesComponent
      },
      { 
        path: 'gestion-utilisateur', 
        component: GestionUtilisateurComponent
      },
      { 
        path: 'gestion-roles', 
        component: GestionRolesComponent
      },
      { 
        path: 'audit-suivi', 
        component: AuditSuiviComponent
      },
      { 
        path: 'audit', 
        component: AuditComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Routes User avec layout User (proj2)
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [UserRoleGuard],
    children: [
      { 
        path: 'home', 
        component: HomeComponent
      },
      { 
        path: 'gestionnaire-de-doc', 
        component: GestionDocComponent
      },
      { 
        path: 'g-de-campagne', 
        component: GestionCampComponent
      },
      {
        path: '',
        redirectTo: 'gestionnaire-de-doc',
        pathMatch: 'full'
      }
    ]
  },

  // Routes Proj1 avec layout Proj1
  {
    path: 'proj1',
    component: Proj1LayoutComponent,
    canActivate: [Proj1RoleGuard],
    children: [
      { 
        path: 'home', 
        component: HomeComponent
      },
      { 
        path: 'gestionnaire-de-doc', 
        component: GestionDocComponent
      },
      { 
        path: 'g-de-campagne', 
        component: GestionCampComponent
      },
      {
        path: '',
        redirectTo: 'gestionnaire-de-doc',
        pathMatch: 'full'
      }
    ]
  },

  // Route par défaut - redirection basée sur le rôle via AuthGuard
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent // Composant temporaire, la redirection se fera dans AuthGuard
  },

  // Route de fallback
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}

