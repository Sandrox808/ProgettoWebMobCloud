import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  mobileMenuOpen = false;

  constructor(private router: Router) {}

  get accountName(): string {
    return localStorage.getItem('username') || 'Account';
  }

  /** Mostra la top bar solo quando esiste un token e non siamo su rotte pubbliche. */
  showTopbar(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const path = this.router.url.split('?')[0];
    return path !== '/' && path !== '/login' && path !== '/register';
  }

  /** Rimuove il token locale e riporta l'utente alla pagina di login. */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.mobileMenuOpen = false;
    void this.router.navigate(['/login']);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 900) {
      this.mobileMenuOpen = false;
    }
  }
}
