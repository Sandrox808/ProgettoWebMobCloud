import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

type QueueItem = {
  username: string;
  user_id: number;
  is_on_vacation: number;
  order_num: number;
  last_skipped: number | null;
};

@Component({
  selector: 'app-name-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './namePicker.component.html',
  styleUrl: './namePicker.component.css'
})
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

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.loadQueue();
  }

  async loadQueue() {
    this.loading = true;
    this.message = '';
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
    } catch {
      this.message = 'Errore nel caricamento della coda';
    } finally {
      this.loading = false;
    }
  }

  async markDone() {
    try {
      this.startAction('Lavato');
      this.optimisticDone();
      const t0 = performance.now();
      await this.api.actionDone();
      const t1 = performance.now();
      console.log(`[namePicker] actionDone ${Math.round(t1 - t0)}ms`);
      await this.loadQueue();
    } catch {
      this.message = 'Non posso segnare come lavato';
    } finally {
      this.endAction();
    }
  }

  async markSkip() {
    try {
      this.startAction('Salta');
      this.optimisticSkip();
      const t0 = performance.now();
      await this.api.actionSkip();
      const t1 = performance.now();
      console.log(`[namePicker] actionSkip ${Math.round(t1 - t0)}ms`);
      await this.loadQueue();
    } catch {
      this.message = 'Non posso saltare il turno';
    } finally {
      this.endAction();
    }
  }

  async toggleVacation() {
    try {
      this.startAction(this.isOnVacation ? 'Rientro' : 'Vacanza');
      await this.api.toggleVacation(!this.isOnVacation);
      await this.loadQueue();
    } catch {
      this.message = 'Non posso aggiornare lo stato vacanza';
    } finally {
      this.endAction();
    }
  }

  private startAction(label: string) {
    this.actionLoading = true;
    this.actionLabel = label;
    this.message = '';
    if (this.actionTimeoutId !== null) {
      clearTimeout(this.actionTimeoutId);
    }
    this.actionTimeoutId = window.setTimeout(() => {
      this.actionLoading = false;
      this.actionLabel = '';
      this.message = 'Operazione in timeout. Riprova.';
      this.actionTimeoutId = null;
    }, 10000);
  }

  private endAction() {
    this.actionLoading = false;
    this.actionLabel = '';
    if (this.actionTimeoutId !== null) {
      clearTimeout(this.actionTimeoutId);
      this.actionTimeoutId = null;
    }
  }

  private optimisticDone() {
    const activeQueue = this.queue.filter((u) => u.is_on_vacation === 0);
    if (activeQueue.length === 0) return;

    const [first] = activeQueue;
    const others = activeQueue.slice(1);
    const updated = [...others, first];
    this.applyOptimisticQueue(updated);
  }

  private optimisticSkip() {
    const now = Date.now();
    const COOLDOWN_MS = 30 * 60 * 1000;

    const activeQueue = this.queue.filter((u) => u.is_on_vacation === 0);
    if (activeQueue.length < 2) return;

    const absentUser = activeQueue[0];
    const targetIndex = activeQueue.findIndex((u, index) => {
      if (index === 0) return false;
      return !u.last_skipped || now - u.last_skipped >= COOLDOWN_MS;
    });

    if (targetIndex === -1) return;

    const target = activeQueue[targetIndex];
    const remaining = activeQueue.filter((u) => u.user_id !== target.user_id);
    const updated = [target, ...remaining];

    this.applyOptimisticQueue(updated);
  }

  private applyOptimisticQueue(activeQueue: QueueItem[]) {
    if (activeQueue.length === 0) return;
    this.currentName = activeQueue[0].username;
    const today = new Date();
    this.currentDayLabel = this.formatDayLabel(today);
    this.weekList = activeQueue.slice(0, 7).map((item, index) => ({
      name: item.username,
      dayLabel: this.formatDayLabel(this.addDays(today, index))
    }));
  }

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

  private addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private formatDayLabel(date: Date) {
    const day = date.toLocaleDateString('it-IT', { weekday: 'long' });
    const num = date.getDate();
    return `${this.capitalize(day)} ${num}`;
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
