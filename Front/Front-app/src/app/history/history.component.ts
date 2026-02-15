import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ApiService, HistoryEntry } from '../api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
/** Visualizza la cronologia delle azioni per il mese selezionato. */
export class HistoryComponent implements OnInit {
  displayedColumns: string[] = ['date', 'username', 'action', 'note'];
  history: HistoryEntry[] = [];
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  loading = false;
  message = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  /** Carica la cronologia iniziale. */
  ngOnInit() {
    setTimeout(() => {
      void this.loadHistory();
    });
  }

  /** Richiede al backend la cronologia del mese/anno correnti nel componente. */
  async loadHistory() {
    this.loading = true;
    this.message = '';
    this.cdr.detectChanges();

    try {
      const data = await this.api.getHistory(this.month, this.year);
      this.history = data.history ?? [];
    } catch (error: any) {
      console.error(error);
      const status = error?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        void this.router.navigate(['/login']);
        return;
      }

      this.message = this.getApiErrorMessage(error, 'Errore nel caricamento della history');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /** Sposta il filtro al mese precedente e ricarica i dati. */
  async previousMonth() {
    if (this.month === 1) {
      this.month = 12;
      this.year -= 1;
    } else {
      this.month -= 1;
    }

    await this.loadHistory();
  }

  /** Sposta il filtro al mese successivo e ricarica i dati. */
  async nextMonth() {
    if (this.month === 12) {
      this.month = 1;
      this.year += 1;
    } else {
      this.month += 1;
    }

    await this.loadHistory();
  }

  /** Restituisce la descrizione testuale dell'azione per la vista tabellare. */
  formatAction(actionType: HistoryEntry['action_type']): string {
    if (actionType === 'DONE') return 'Lavato';
    if (actionType === 'SKIP') return 'Salto';
    return 'Stato';
  }

  /** Converte timestamp unix in stringa localizzata per la UI. */
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString('it-IT');
  }

  /** Estrae il messaggio errore API in forma sicura con fallback. */
  private getApiErrorMessage(error: unknown, fallback: string) {
    const anyErr = error as { error?: { error?: string } };
    return anyErr?.error?.error || fallback;
  }
}
