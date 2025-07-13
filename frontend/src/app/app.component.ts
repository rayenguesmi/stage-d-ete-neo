import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  currentView = 'users'; // Vue par défaut

  setCurrentView(view: string): void {
    this.currentView = view;
  }
}
