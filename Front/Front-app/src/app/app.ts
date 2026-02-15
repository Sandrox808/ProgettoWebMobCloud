import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router: Router) {}

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
    void this.router.navigate(['/login']);
  }
}
