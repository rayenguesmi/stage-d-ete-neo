import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule],
})
export class NavbarComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  @Input() isCollapsed: boolean = false; // Reçoit l'état actuel du parent
  @Output() toggleNavbar = new EventEmitter<void>(); // Événement pour informer LayoutComponent

  // Méthode appelée pour basculer l'état du Navbar
  onToggleNavbar() {
    this.toggleNavbar.emit(); // Émet un événement pour informer le parent
  }
}
