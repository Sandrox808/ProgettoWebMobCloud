import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  success = '';
  error = '';

  constructor(private api: ApiService) {}

  async doRegister() {
    this.error = '';
    this.success = '';

    if (!this.username || !this.password) {
      this.error = 'Inserisci username e password';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Le password non coincidono';
      return;
    }

    try {
      await this.api.register(this.username, this.password);
      this.success = 'Registrazione completata. Ora puoi fare login.';
      this.password = '';
      this.confirmPassword = '';
    } catch (err: any) {
      this.error = err?.error?.error ?? 'Registrazione fallita';
    }
  }
}
