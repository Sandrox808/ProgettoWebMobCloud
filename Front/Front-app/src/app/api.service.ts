import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  async login(username: string, password: string): Promise<{ token: string }> {
    return await firstValueFrom(
      this.http.post<{ token: string }>(`${this.baseUrl}/login`, { username, password })
    );
  }

  async register(username: string, password: string): Promise<{ userId: number }> {
    return await firstValueFrom(
      this.http.post<{ userId: number }>(`${this.baseUrl}/register`, { username, password })
    );
  }

  async getQueue(): Promise<{ queue: any[]; currentUser?: string; isMyTurn?: boolean }> {
    const token = localStorage.getItem('token') ?? '';
    return await firstValueFrom(
      this.http.get<{ queue: any[]; currentUser?: string; isMyTurn?: boolean }>(
        `${this.baseUrl}/queue`,
        {
        headers: { Authorization: token }
        }
      )
    );
  }

  async getParticipantsList(): Promise<{ names: string[]; updated_at: number | null }> {
    const token = localStorage.getItem('token') ?? '';
    return await firstValueFrom(
      this.http.get<{ names: string[]; updated_at: number | null }>(
        `${this.baseUrl}/partecipantslist`,
        {
          headers: { Authorization: token }
        }
      )
    );
  }

  async saveParticipantsList(names: string[]): Promise<{ updated_at: number }> {
    const token = localStorage.getItem('token') ?? '';
    return await firstValueFrom(
      this.http.post<{ updated_at: number }>(
        `${this.baseUrl}/partecipantslist`,
        { names },
        {
          headers: { Authorization: token }
        }
      )
    );
  }

  async actionDone(): Promise<{ message: string }> {
    const token = localStorage.getItem('token') ?? '';
    return await firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/action/done`,
        {},
        {
          headers: { Authorization: token }
        }
      )
    );
  }

  async actionSkip(): Promise<{ message: string }> {
    const token = localStorage.getItem('token') ?? '';
    return await firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/action/skip`,
        {},
        {
          headers: { Authorization: token }
        }
      )
    );
  }

  async toggleVacation(status: boolean): Promise<{ message: string; is_on_vacation: boolean }> {
    const token = localStorage.getItem('token') ?? '';
    return await firstValueFrom(
      this.http.post<{ message: string; is_on_vacation: boolean }>(
        `${this.baseUrl}/user/toggle-vacation`,
        { status },
        {
          headers: { Authorization: token }
        }
      )
    );
  }

}
