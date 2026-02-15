import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  // FIX: Angular usa "styleUrls" (array), non "styleUrl"
  styleUrls: ['./login.component.css']
})
/** Gestisce l'autenticazione utente e il salvataggio del token locale. */
export class LoginComponent {
  username = '';
  password = '';

  // Se c'è già un token salvato, lo teniamo in memoria
  token: string | null = localStorage.getItem('token');

  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /** Invia le credenziali al backend, salva il token e reindirizza alla pagina operativa. */
  async doLogin() {
    if (this.loading) return;

    this.error = '';
    this.loading = true;
    this.cdr.detectChanges();

    try {
      const { token } = await this.api.login(this.username, this.password);

      // Salva token
      this.token = token;
      localStorage.setItem('token', token);

      // FIX: naviga nel "tick" successivo per evitare edge-case di render post-login
      setTimeout(() => {
        void this.router.navigate(['/namePicker']);
      });
    } catch (e) {
      console.error(e);
      this.error = 'Credenziali non valide';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
