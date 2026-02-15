import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
/** Gestisce la registrazione di un nuovo account con validazione base lato client. */
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  success = '';
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  /** Valida i campi, invia la registrazione e aggiorna i messaggi di feedback UI. */
  async doRegister() {
    if (this.loading) return;

    this.error = '';
    this.success = '';

    if (!this.username || !this.password) {
      this.error = 'Inserisci username e password';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Le password non coincidono';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      await this.api.register(this.username, this.password);

      this.success = 'Registrazione completata. Ora puoi fare login.';
      this.password = '';
      this.confirmPassword = '';
    } catch (err: any) {
      this.error = err?.error?.error ?? 'Registrazione fallita';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
