import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface Ticket {
  id: number;
  asunto: string;
  solicitante: string;
  descripcion: string;
  categoria: string;
  prioridad: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_proceso' | 'resuelto';
  fechaRegistro: string;
}
export type TicketInput = Omit<Ticket, 'id' | 'fechaRegistro'>;
@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private url = '/api/tickets';
  listar() { return this.http.get<Ticket[]>(this.url); }
  obtener(id: number) { return this.http.get<Ticket>(`${this.url}/${id}`); }
  crear(ticket: TicketInput) { return this.http.post<Ticket>(this.url, ticket); }
  actualizar(id: number, ticket: TicketInput) { return this.http.put<Ticket>(`${this.url}/${id}`, ticket); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
