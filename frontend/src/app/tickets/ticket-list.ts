import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Ticket, TicketService } from './ticket.service';
@Component({ imports: [RouterLink, DatePipe], templateUrl: './ticket-list.html' })
export class TicketList {
  private api = inject(TicketService);
  tickets = signal<Ticket[]>([]);
  cargando = signal(true);
  error = signal('');
  eliminando = signal<number | null>(null);
  estados = { pendiente: 'Pendiente', en_proceso: 'En proceso', resuelto: 'Resuelto' };
  constructor() { this.cargar(); }
  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.api.listar().subscribe({
      next: tickets => { this.tickets.set(tickets); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar los tickets. Comprueba que la API esté disponible.'); this.cargando.set(false); },
    });
  }
  eliminar(ticket: Ticket) {
    if (!window.confirm(`¿Eliminar el ticket #${ticket.id}: ${ticket.asunto}?`)) return;
    this.eliminando.set(ticket.id);
    this.error.set('');
    this.api.eliminar(ticket.id).subscribe({
      next: () => { this.tickets.update(items => items.filter(t => t.id !== ticket.id)); this.eliminando.set(null); },
      error: () => { this.error.set('No se pudo eliminar el ticket. Intenta nuevamente.'); this.eliminando.set(null); },
    });
  }
}
