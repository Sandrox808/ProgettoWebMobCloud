import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  // FIX: Angular usa "styleUrls" (array), non "styleUrl"
  styleUrls: ['./login.component.css']
})
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
