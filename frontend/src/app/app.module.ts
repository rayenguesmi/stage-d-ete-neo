import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { GestionRolesComponent } from './gestion-roles/gestion-roles.component';
import { GestionLicencesComponent } from './gestion-licences/gestion-licences.component';
import { HomeComponent } from './home/home.component';
import { AdministrationComponent } from './administration/administration.component';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';

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
    GestionExecComponent
  ],
  imports: [
    BrowserModule, 
    HttpClientModule, 
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}