import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './AuthGuard';
import { AdministrationComponent } from './administration/administration.component';
import { GestionCampComponent } from './gestion-camp/gestion-camp.component';
import { GestionDocComponent } from './gestion-doc/gestion-doc.component';
import { GestionExecComponent } from './gestion-exec/gestion-exec.component';
import { HomeComponent } from './home/home.component';
import { LandingComponent } from './landing/landing.component';
const routes: Routes = [
  //{ path: 'home', component: AppComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: LandingComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'gestionnaire-de-doc', component: GestionDocComponent },
      { path: 'g-de-campagne', component: GestionCampComponent },
      { path: 'g-dexecution', component: GestionExecComponent },
      { path: 'administration', component: AdministrationComponent },
    ],
  },
  { path: '**', redirectTo: 'home' }, // Route par défaut si aucune autre route ne correspond
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule],
})
export class AppRoutingModule {}
