import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthInterceptorService } from './auth-interceptor.service';

import { KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './KeycloakInitService';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AdministrationComponent } from './administration/administration.component';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';
import { HomeComponent } from './home/home.component';
import { LandingComponent } from './landing/landing.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { GestionLicencesComponent } from './gestion-licences/gestion-licences.component';
import { AuditSuiviComponent } from './audit-suivi/audit-suivi.component';
import { UploadDocumentComponent } from './gestion-doc/upload-document/upload-document.component';
import { UserFormDialogComponent } from './gestion-utilisateur/user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from './gestion-utilisateur/confirm-dialog/confirm-dialog.component';

import { FilterPipe } from './shared/filter.pipe';

// ✅ Angular Material modules
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    AdministrationComponent,
    GestionCampComponent,
    GestionDocComponent,
    GestionExecComponent,
    HomeComponent,
    GestionUtilisateurComponent,
    GestionLicencesComponent,
    AuditSuiviComponent,
    UploadDocumentComponent,
    UserFormDialogComponent,
    ConfirmDialogComponent,
    FilterPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    // ✅ Angular Material modules
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    MatPaginatorModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDividerModule,
    MatButtonModule,
  ],
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
