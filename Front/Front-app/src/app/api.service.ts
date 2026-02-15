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

export type HistoryEntry = {
  id: number;
  username: string;
  action_type: 'DONE' | 'SKIP' | 'STATUS';
  note: string | null;
  created_at: number;
  date_iso: string;
};

export type HistoryResponse = {
  month: number;
  year: number;
  history: HistoryEntry[];
};

export type StatsResponse = {
  period: { month: number; year: number };
  champ: { username: string; count: number };
  athlete: { username: string; count: number };
  me: { dones: number; percentage: string };
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  /** Costruisce gli header di autenticazione usando il token salvato in localStorage. */
  private authOptions() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: token
      })
    };
  }

  /** Esegue il login e restituisce il token JWT emesso dal backend. */
  login(username: string, password: string): Promise<{ token: string }> {
    return firstValueFrom(
      this.http.post<{ token: string }>(`${this.baseUrl}/login`, { username, password })
    );
  }

  /** Registra un nuovo utente e restituisce l'identificativo creato. */
  register(username: string, password: string): Promise<{ userId: number }> {
    return firstValueFrom(
      this.http.post<{ userId: number }>(`${this.baseUrl}/register`, { username, password })
    );
  }

  /** Recupera lo stato corrente della coda e le informazioni legate all'utente autenticato. */
  getQueue(): Promise<QueueResponse> {
    return firstValueFrom(
      this.http.get<QueueResponse>(`${this.baseUrl}/queue`, this.authOptions())
    );
  }

  /** Legge la lista partecipanti salvata lato server con relativo timestamp di aggiornamento. */
  getParticipantsList(): Promise<{ names: string[]; updated_at: number | null }> {
    return firstValueFrom(
      this.http.get<{ names: string[]; updated_at: number | null }>(
        `${this.baseUrl}/partecipantslist`,
        this.authOptions()
      )
    );
  }

  /** Salva la lista partecipanti sul server e restituisce il nuovo timestamp di aggiornamento. */
  saveParticipantsList(names: string[]): Promise<{ updated_at: number }> {
    return firstValueFrom(
      this.http.post<{ updated_at: number }>(
        `${this.baseUrl}/partecipantslist`,
        { names },
        this.authOptions()
      )
    );
  }

  /** Notifica al backend che l'utente ha completato la propria azione in coda. */
  actionDone(): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/action/done`,
        {},
        this.authOptions()
      )
    );
  }

  /** Chiede al backend di saltare il turno corrente dell'utente autenticato. */
  actionSkip(): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(
        `${this.baseUrl}/action/skip`,
        {},
        this.authOptions()
      )
    );
  }

  /** Imposta lo stato ferie dell'utente e restituisce il nuovo valore persistito. */
  toggleVacation(status: boolean): Promise<{ message: string; is_on_vacation: boolean }> {
    return firstValueFrom(
      this.http.post<{ message: string; is_on_vacation: boolean }>(
        `${this.baseUrl}/user/toggle-vacation`,
        { status },
        this.authOptions()
      )
    );
  }

  /** Recupera la cronologia azioni del mese/anno richiesto (default: periodo corrente). */
  getHistory(month?: number, year?: number): Promise<HistoryResponse> {
    const params: Record<string, string> = {};
    if (month !== undefined) params['month'] = String(month);
    if (year !== undefined) params['year'] = String(year);

    return firstValueFrom(
      this.http.get<HistoryResponse>(`${this.baseUrl}/history`, {
        ...this.authOptions(),
        params
      })
    );
  }

  /** Recupera le statistiche mensili (champ, athlete e miei dati) per il periodo richiesto. */
  getStats(month?: number, year?: number): Promise<StatsResponse> {
    const params: Record<string, string> = {};
    if (month !== undefined) params['month'] = String(month);
    if (year !== undefined) params['year'] = String(year);

    return firstValueFrom(
      this.http.get<StatsResponse>(`${this.baseUrl}/stats`, {
        ...this.authOptions(),
        params
      })
    );
  }
}
