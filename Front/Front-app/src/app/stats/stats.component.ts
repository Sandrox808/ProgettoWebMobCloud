import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService, StatsResponse } from '../api.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
/** Visualizza le statistiche mensili aggregate e personali. */
export class StatsComponent implements OnInit {
  stats: StatsResponse | null = null;
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  loading = false;
  message = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  /** Carica le statistiche iniziali. */
  ngOnInit() {
    setTimeout(() => {
      void this.loadStats();
    });
  }

  /** Richiede al backend le statistiche del mese/anno correnti nel componente. */
  async loadStats() {
    this.loading = true;
    this.message = '';
    this.cdr.detectChanges();

    try {
      this.stats = await this.api.getStats(this.month, this.year);
    } catch (error: any) {
      console.error(error);
      const status = error?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        void this.router.navigate(['/login']);
        return;
      }

      this.message = this.getApiErrorMessage(error, 'Errore nel caricamento delle stats');
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

    await this.loadStats();
  }

  /** Sposta il filtro al mese successivo e ricarica i dati. */
  async nextMonth() {
    if (this.month === 12) {
      this.month = 1;
      this.year += 1;
    } else {
      this.month += 1;
    }

    await this.loadStats();
  }

  /** Estrae il messaggio errore API in forma sicura con fallback. */
  private getApiErrorMessage(error: unknown, fallback: string) {
    const anyErr = error as { error?: { error?: string } };
    return anyErr?.error?.error || fallback;
  }
}
