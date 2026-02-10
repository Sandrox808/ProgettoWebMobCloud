import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type QueueItem = {
  username: string;
  user_id: number;
  is_on_vacation: number;
  order_num: number;
  last_skipped: number | null;
};

export type QueueResponse = {
  queue: QueueItem[];
  currentUser?: string;
  isMyTurn?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  /** Backend si aspetta Authorization: <token> (nudo) */
  private authOptions() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: token
      })
    };
  }

  login(username: string, password: string): Promise<{ token: string }> {
    return firstValueFrom(
      this.http.post<{ token: string }>(`${this.baseUrl}/login`, { username, password })
    );
  }

  register(username: string, password: string): Promise<{ userId: number }> {
    return firstValueFrom(
      this.http.post<{ userId: number }>(`${this.baseUrl}/register`, { username, password })
    );
  }

  getQueue(): Promise<QueueResponse> {
    return firstValueFrom(
      this.http.get<QueueResponse>(`${this.baseUrl}/queue`, this.authOptions())
    );
  }

  getParticipantsList(): Promise<{ names: string[]; updated_at: number | null }> {
    return firstValueFrom(
      this.http.get<{ names: string[]; updated_at: number | null }>(
        `${this.baseUrl}/partecipantslist`,
        this.authOptions()
      )
    );
  }

  saveParticipantsList(names: string[]): Promise<{ updated_at: number }> {
    return firstValueFrom(
      this.http.post<{ updated_at: number }>(
        `${this.baseUrl}/partecipantslist`,
        { names },
        this.authOptions()
      )
    );
  }

  actionDone(): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/action/done`,
        {},
        this.authOptions()
      )
    );
  }

  actionSkip(): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/action/skip`,
        {},
        this.authOptions()
      )
    );
  }

  toggleVacation(status: boolean): Promise<{ message: string; is_on_vacation: boolean }> {
    return firstValueFrom(
      this.http.post<{ message: string; is_on_vacation: boolean }>(
        `${this.baseUrl}/user/toggle-vacation`,
        { status },
        this.authOptions()
      )
    );
  }
}
