import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GestionUtilisateurComponent } from './gestion-utilisateur/gestion-utilisateur.component';
import { GestionRolesComponent } from './gestion-roles/gestion-roles.component';
import { GestionLicencesComponent } from './gestion-licences/gestion-licences.component';

@NgModule({
  declarations: [
    AppComponent,
    GestionUtilisateurComponent,
    GestionRolesComponent,
    GestionLicencesComponent
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

