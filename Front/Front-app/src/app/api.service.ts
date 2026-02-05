import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async login(username: string, password: string) {
    return await firstValueFrom(
      this.http.post(`${this.baseUrl}/login`, { username, password })
    );
  }

  async getQueue(token: string) {
    return await firstValueFrom(
      this.http.get(`${this.baseUrl}/queue`, {
        headers: { authorization: token }
      })
    );
  }
}
