import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../api.service';

/** Record locale della coda usato dalla vista `namePicker`. */
type QueueItem = {
  username: string;
  user_id: number;
  is_on_vacation: number; // 0 = attivo, 1 = in vacanza
  order_num: number;
  last_skipped: number | null; // timestamp in millisecondi (backend usa Date.now())
};

@Component({
  selector: 'app-name-picker',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatChipsModule
  ],
  templateUrl: './namePicker.component.html',
  styleUrls: ['./namePicker.component.css']
})
/** Mostra e gestisce la coda settimanale dei turni, incluse azioni e stato vacanza. */
export class NamePickerComponent implements OnInit {
  queue: QueueItem[] = [];

  currentName = '';
  currentDayLabel = '';
  weekList: { name: string; dayLabel: string }[] = [];

  message = '';
  loading = false;

  currentUser = '';
  isMyTurn = false;
  isOnVacation = false;

  actionLoading = false;
  actionLabel = '';
  private actionTimeoutId: number | null = null;

  /** Elenco dei soli utenti attualmente segnati come in vacanza. */
  get vacationNames(): string[] {
    return this.queue
      .filter((u) => u.is_on_vacation === 1)
      .map((u) => u.username);
  }

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * FIX: evitare `async ngOnInit()` + await immediato dopo navigate().
   * Spostiamo loadQueue al "tick" successivo, così il primo render aggancia correttamente i binding.
   */
  ngOnInit() {
    setTimeout(() => {
      void this.loadQueue();
    });
  }

  /**
   * Carica la coda dal backend e ricostruisce la vista "settimana".
   */
  async loadQueue() {
    // opzionale: se un'azione è in corso, evita refresh sovrapposti
    // if (this.actionLoading) return;

    this.loading = true;
    this.message = '';
    this.cdr.detectChanges(); // forza aggiornamento immediato dello stato loading

    try {
      const t0 = performance.now();
      const queueData = await this.api.getQueue();
      const t1 = performance.now();
      console.log(`[namePicker] getQueue ${Math.round(t1 - t0)}ms`);

      this.queue = queueData.queue ?? [];
      this.currentUser = queueData.currentUser ?? '';
      this.isMyTurn = queueData.isMyTurn ?? false;

      this.isOnVacation = this.queue.some(
        (u) => u.username === this.currentUser && u.is_on_vacation === 1
      );

      this.buildWeekList();
    } catch (e) {
      console.error(e);
      this.message = this.getApiErrorMessage(e, 'Errore nel caricamento della coda');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Segna "lavato": optimistic update, chiamata backend, riallineamento.
   */
  async markDone() {
    if (this.actionLoading) return;

    // backend blocca già con 403 se non è il tuo turno, ma qui miglioriamo UX
    if (!this.isMyTurn || this.isOnVacation) {
      this.message = this.isOnVacation
        ? 'Sei in vacanza, non puoi segnare il turno.'
        : 'Non è il tuo turno.';
      this.cdr.detectChanges();
      return;
    }

    try {
      this.startAction('Lavato');

      this.optimisticDone();
      this.cdr.detectChanges(); // mostra subito l'optimistic update

      const t0 = performance.now();
      await this.api.actionDone();
      const t1 = performance.now();
      console.log(`[namePicker] actionDone ${Math.round(t1 - t0)}ms`);

      await this.loadQueue();
    } catch (e) {
      console.error(e);
      this.message = this.getApiErrorMessage(e, 'Non posso segnare come lavato');
      this.cdr.detectChanges();
    } finally {
      this.endAction();
      this.cdr.detectChanges();
    }
  }

  /**
   * Salta turno: optimistic update, chiamata backend, riallineamento.
   */
  async markSkip() {
    if (this.actionLoading) return;

    try {
      this.startAction('Salta');

      this.optimisticSkip();
      this.cdr.detectChanges();

      const t0 = performance.now();
      await this.api.actionSkip();
      const t1 = performance.now();
      console.log(`[namePicker] actionSkip ${Math.round(t1 - t0)}ms`);

      await this.loadQueue();
    } catch (e) {
      console.error(e);
      this.message = this.getApiErrorMessage(e, 'Non posso saltare il turno');
      this.cdr.detectChanges();
    } finally {
      this.endAction();
      this.cdr.detectChanges();
    }
  }

  /**
   * Toggle vacanza: nessun optimistic, riallineamento da backend.
   */
  async toggleVacation() {
    if (this.actionLoading) return;

    try {
      this.startAction(this.isOnVacation ? 'Rientro' : 'Vacanza');

      await this.api.toggleVacation(!this.isOnVacation);
      await this.loadQueue();
    } catch (e) {
      console.error(e);
      this.message = this.getApiErrorMessage(e, 'Non posso aggiornare lo stato vacanza');
      this.cdr.detectChanges();
    } finally {
      this.endAction();
      this.cdr.detectChanges();
    }
  }

  /** Avvia lo stato di azione con label e timeout di sicurezza per evitare loading bloccato. */
  private startAction(label: string) {
    this.actionLoading = true;
    this.actionLabel = label;
    this.message = '';

    if (this.actionTimeoutId !== null) clearTimeout(this.actionTimeoutId);

    this.actionTimeoutId = window.setTimeout(() => {
      this.actionLoading = false;
      this.actionLabel = '';
      this.message = 'Operazione in timeout. Riprova.';
      this.actionTimeoutId = null;
      this.cdr.detectChanges();
    }, 10000);
  }

  /** Chiude lo stato di azione corrente e pulisce eventuali timeout pendenti. */
  private endAction() {
    this.actionLoading = false;
    this.actionLabel = '';

    if (this.actionTimeoutId !== null) {
      clearTimeout(this.actionTimeoutId);
      this.actionTimeoutId = null;
    }
  }

  /** Applica localmente la rotazione della coda equivalente all'azione "lavato". */
  private optimisticDone() {
    const activeQueue = this.queue.filter((u) => u.is_on_vacation === 0);
    if (activeQueue.length === 0) return;

    const [first] = activeQueue;
    const others = activeQueue.slice(1);
    const updatedActive = [...others, first];

    this.applyOptimisticQueue(updatedActive);
  }

  /** Applica localmente il salto turno rispettando il cooldown del backend. */
  private optimisticSkip() {
    const now = Date.now();
    const COOLDOWN_MS = 30 * 60 * 1000;

    const activeQueue = this.queue.filter((u) => u.is_on_vacation === 0);
    if (activeQueue.length < 2) return;

    const targetIndex = activeQueue.findIndex((u, index) => {
      if (index === 0) return false;
      const last = this.normalizeLastSkipped(u.last_skipped);
      return !last || now - last >= COOLDOWN_MS;
    });

    if (targetIndex === -1) return;

    const target = activeQueue[targetIndex];
    const remaining = activeQueue.filter((u) => u.user_id !== target.user_id);
    const updatedActive = [target, ...remaining];

    this.applyOptimisticQueue(updatedActive);
  }

  /** Normalizza il timestamp `last_skipped` ricevuto dal backend. */
  private normalizeLastSkipped(value: number | null): number | null {
    if (!value) return null;
    return value; // backend usa ms
  }

  /** Ricostruisce i dati visualizzati in UI partendo da una coda attiva già ordinata. */
  private applyOptimisticQueue(activeQueue: QueueItem[]) {
    const inactive = this.queue.filter((u) => u.is_on_vacation === 1);
    this.queue = [...activeQueue, ...inactive];

    if (activeQueue.length === 0) {
      this.currentName = '';
      this.currentDayLabel = '';
      this.weekList = [];
      return;
    }

    const today = new Date();
    this.currentName = activeQueue[0].username;
    this.currentDayLabel = this.formatDayLabel(today);

    this.weekList = activeQueue.slice(0, 7).map((item, index) => ({
      name: item.username,
      dayLabel: this.formatDayLabel(this.addDays(today, index))
    }));
  }

  /** Ricostruisce la vista della settimana a partire dalla coda completa ricevuta dal backend. */
  private buildWeekList() {
    const activeQueue = this.queue.filter((u) => u.is_on_vacation === 0);

    if (activeQueue.length === 0) {
      this.currentName = '';
      this.currentDayLabel = '';
      this.weekList = [];
      return;
    }

    const today = new Date();
    this.currentName = activeQueue[0].username;
    this.currentDayLabel = this.formatDayLabel(today);

    this.weekList = activeQueue.slice(0, 7).map((item, index) => ({
      name: item.username,
      dayLabel: this.formatDayLabel(this.addDays(today, index))
    }));
  }

  /** Restituisce una nuova data ottenuta sommando `days` giorni a `date`. */
  private addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  /** Converte una data nel formato breve usato in pagina (es. "Lunedì 14"). */
  private formatDayLabel(date: Date) {
    const day = date.toLocaleDateString('it-IT', { weekday: 'long' });
    const num = date.getDate();
    return `${this.capitalize(day)} ${num}`;
  }

  /** Capitalizza la prima lettera della stringa passata. */
  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  /** Estrae il messaggio errore API in forma sicura con fallback. */
  private getApiErrorMessage(error: unknown, fallback: string) {
    const anyErr = error as { error?: { error?: string } };
    const message = anyErr?.error?.error;
    return message || fallback;
  }
}
