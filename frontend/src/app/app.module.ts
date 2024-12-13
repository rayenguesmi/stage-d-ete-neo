import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './KeycloakInitService';
import { AdministrationComponent } from './administration/administration.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptorService } from './auth-interceptor.service';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';
import { HomeComponent } from './home/home.component';
import { LandingComponent } from './landing/landing.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    AdministrationComponent,
    GestionCampComponent,
    GestionDocComponent,
    GestionExecComponent,
    HomeComponent,
  ],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule],
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
