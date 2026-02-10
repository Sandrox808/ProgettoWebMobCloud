import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  token: string | null = localStorage.getItem('token');
  error = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  async doLogin() {
    this.error = '';
    try {
      const { token } = await this.api.login(this.username, this.password);
      this.token = token;
      localStorage.setItem('token', token);
      console.log('Login OK, token salvato');
      await this.router.navigate(['/namePicker']);
    } catch {
      this.error = 'Credenziali non valide';
    }
  }
}
